"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ShieldCheck, WifiOff, RefreshCw } from "lucide-react";
import { getOfflineScans, ScanPayload } from "@/lib/db";
import { syncOfflineScans, VerificationResponse } from "@/lib/api";

export default function Dashboard() {
  const [offlineScans, setOfflineScans] = useState<ScanPayload[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<VerificationResponse[]>([]);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    fetchOfflineScans();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const fetchOfflineScans = async () => {
    try {
      const scans = await getOfflineScans();
      setOfflineScans(scans);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSync = async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    try {
      const results = await syncOfflineScans();
      setSyncResults((prev) => [...results, ...prev]);
      await fetchOfflineScans();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 p-6">
      <header className="py-6 mb-8 border-b border-gray-200">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="text-primary w-8 h-8" />
          MediShield AI
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">Enterprise Counterfeit Detection</p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center mb-8">
        <Link href="/scan" className="w-full">
          <button className="w-full bg-primary hover:bg-red-700 text-white shadow-xl shadow-red-200 rounded-2xl py-12 px-6 flex flex-col items-center justify-center transition-transform active:scale-95">
            <Activity className="w-16 h-16 mb-4" />
            <span className="text-2xl font-bold">Scan Medicine</span>
            <span className="text-sm text-red-100 mt-2">Initialize AI Verification</span>
          </button>
        </Link>
      </main>

      <div className="mt-auto bg-gray-50 rounded-2xl p-4 shadow-sm border border-gray-100 min-h-[160px]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Recent Scans</h2>
          {!isOnline && (
            <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
              <WifiOff className="w-3 h-3" /> Offline Mode
            </span>
          )}
        </div>
        
        {offlineScans.length > 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-amber-800">
                {offlineScans.length} Scan{offlineScans.length !== 1 ? 's' : ''} Pending Sync
              </span>
              <button 
                onClick={handleSync}
                disabled={!isOnline || isSyncing}
                className="bg-amber-600 disabled:bg-amber-300 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync Now
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-20 text-center text-gray-400 text-sm font-medium border-2 border-dashed border-gray-200 rounded-xl">
            No pending offline scans.
          </div>
        )}
      </div>

      {syncResults.length > 0 && (
        <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Synced Results Log</h2>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {syncResults.map((res, i) => (
              <div key={i} className={`p-3 rounded-xl border ${
                res.statusVerdict === 'VERIFIED' ? 'bg-green-50 border-green-200' :
                res.statusVerdict === 'SUSPICIOUS' ? 'bg-amber-50 border-amber-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex justify-between items-center">
                  <span className={`font-bold text-sm ${
                    res.statusVerdict === 'VERIFIED' ? 'text-green-700' :
                    res.statusVerdict === 'SUSPICIOUS' ? 'text-amber-700' :
                    'text-red-700'
                  }`}>{res.statusVerdict}</span>
                  <span className="text-xs text-gray-500 font-mono">Risk: {res.systemRiskScore}/100</span>
                </div>
                {res.message && <p className="text-xs text-gray-600 mt-1">{res.message}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
