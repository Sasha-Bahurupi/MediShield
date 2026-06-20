import { ScanPayload, getOfflineScans, deleteScan } from "./db";

export interface VerificationResponse {
  systemRiskScore: number;
  aiConfidenceScore: number;
  statusVerdict: "VERIFIED" | "SUSPICIOUS" | "COUNTERFEIT";
  message?: string;
}

export const submitScan = async (payload: ScanPayload): Promise<VerificationResponse> => {
  const response = await fetch("http://localhost:8080/api/v1/verify/qr", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
};

export const syncOfflineScans = async (): Promise<number> => {
  if (!navigator.onLine) {
    throw new Error("Cannot sync while offline.");
  }

  const scans = await getOfflineScans();
  let syncedCount = 0;

  for (const scan of scans) {
    try {
      // Flag it as synced offline
      const payloadToSync = { ...scan, isSyncedOffline: true };
      delete payloadToSync.id; // Remove the local IndexedDB id
      
      await submitScan(payloadToSync);
      
      // Delete from local DB if successful
      if (scan.id !== undefined) {
        await deleteScan(scan.id);
      }
      syncedCount++;
    } catch (error) {
      console.error("Failed to sync scan:", scan, error);
    }
  }

  return syncedCount;
};
