"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, ShieldX } from "lucide-react";
import { VerificationResponse } from "@/lib/api";

interface VerdictOverlayProps {
  verdict: VerificationResponse | null;
  onClose: () => void;
}

export default function VerdictOverlay({ verdict, onClose }: VerdictOverlayProps) {
  useEffect(() => {
    if (verdict?.statusVerdict === "COUNTERFEIT" && typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  }, [verdict]);

  return (
    <AnimatePresence>
      {verdict && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 120 }}
          className={`absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center ${
            verdict.statusVerdict === "VERIFIED"
              ? "bg-[#4CAF50] text-white"
              : verdict.statusVerdict === "SUSPICIOUS"
              ? "bg-[#FFC107] text-gray-900"
              : "bg-[#D32F2F] text-white"
          }`}
        >
          {verdict.statusVerdict === "VERIFIED" && <CheckCircle2 className="w-28 h-28 mb-6" />}
          {verdict.statusVerdict === "SUSPICIOUS" && <AlertTriangle className="w-28 h-28 mb-6 text-gray-900" />}
          {verdict.statusVerdict === "COUNTERFEIT" && <ShieldX className="w-28 h-28 mb-6" />}
          
          <h2 className="text-3xl font-extrabold mb-4 leading-tight">
            {verdict.statusVerdict === "VERIFIED" && "Authentic Product Confirmed."}
            {verdict.statusVerdict === "SUSPICIOUS" && "Anomaly Detected. Proceed with caution."}
            {verdict.statusVerdict === "COUNTERFEIT" && "CRITICAL ALERT: Counterfeit Suspected."}
          </h2>
          
          {verdict.message && (
            <p className="text-xl font-medium mb-8 opacity-90">
              {verdict.message}
            </p>
          )}

          <div className="flex flex-col gap-2 mt-auto w-full mb-8">
            <div className="flex justify-between items-center p-5 rounded-2xl mb-6 bg-black/10 backdrop-blur-sm">
              <span className="font-bold text-lg">System Risk Score</span>
              <span className="text-3xl font-black tracking-tight">{verdict.systemRiskScore}/100</span>
            </div>
            
            <button 
              onClick={onClose}
              className={`w-full py-5 rounded-2xl font-bold text-xl transition-transform active:scale-95 shadow-xl ${
                verdict.statusVerdict === "SUSPICIOUS" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
              }`}
            >
              Scan Another Box
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
