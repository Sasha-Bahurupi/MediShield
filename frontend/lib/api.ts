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

export const syncOfflineScans = async (): Promise<VerificationResponse[]> => {
  if (!navigator.onLine) {
    throw new Error("Cannot sync while offline.");
  }

  const scans = await getOfflineScans();
  let syncedResults: VerificationResponse[] = [];

  for (const scan of scans) {
    try {
      // Flag it as synced offline
      const payloadToSync = { ...scan, isSyncedOffline: true };
      delete payloadToSync.id; // Remove the local IndexedDB id
      
      const res = await submitScan(payloadToSync);
      syncedResults.push(res);
      
      // Delete from local DB if successful
      if (scan.id !== undefined) {
        await deleteScan(scan.id);
      }
    } catch (error) {
      console.error("Failed to sync scan:", scan, error);
    }
  }

  return syncedResults;
};
