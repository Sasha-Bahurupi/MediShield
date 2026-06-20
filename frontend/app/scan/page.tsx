"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { submitScan, VerificationResponse } from "@/lib/api";
import { saveScanOffline, ScanPayload } from "@/lib/db";
import VerdictOverlay from "@/components/VerdictOverlay";

export default function ScannerPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verdict, setVerdict] = useState<VerificationResponse | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setToastMessage("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const getGeolocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ latitude: 0, longitude: 0 }); // Fallback
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => resolve({ latitude: 0, longitude: 0 }) // Fallback on error to not block
      );
    });
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsProcessing(true);
    
    // Draw video frame to canvas
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsProcessing(false);
      return;
    }
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Extract base64 image (remove data URL prefix)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    const base64Image = dataUrl.split(",")[1];
    
    // Get location
    const coords = await getGeolocation();
    
    const payload: ScanPayload = {
      skuId: "",
      pharmacistId: "PHARM-101",
      latitude: coords.latitude,
      longitude: coords.longitude,
      scanTimestamp: new Date().toISOString(),
      clientDeviceId: "DEVICE-A1B2",
      isSyncedOffline: false,
      imageBase64: base64Image
    };

    if (navigator.onLine) {
      try {
        const response = await submitScan(payload);
        setVerdict(response);
      } catch (err) {
        console.error("API error, falling back to offline", err);
        await saveOffline(payload);
      }
    } else {
      await saveOffline(payload);
    }
    
    setIsProcessing(false);
  };

  const saveOffline = async (payload: ScanPayload) => {
    try {
      await saveScanOffline(payload);
      setToastMessage("Offline Mode: Scan queued securely.");
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      console.error("Failed to save offline", err);
      setToastMessage("Error: Could not save scan.");
    }
  };

  const closeVerdict = () => {
    setVerdict(null);
    router.push("/");
  };

  return (
    <div className="flex flex-col h-full w-full bg-black relative">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-10 p-6 flex items-center bg-gradient-to-b from-black/80 to-transparent">
        <button 
          onClick={() => router.push("/")}
          className="text-white p-2 rounded-full bg-white/20 backdrop-blur-md active:bg-white/40"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-white ml-4 font-bold text-lg tracking-wide">Scan Medicine</span>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Hidden Canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Framing Guide */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 border-4 border-white/50 rounded-2xl relative overflow-hidden shadow-[0_0_0_4000px_rgba(0,0,0,0.6)]">
            {/* Animated Laser */}
            <motion.div
              animate={{ y: ["0%", "100%", "0%"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-red-500 shadow-[0_0_10px_2px_rgba(239,68,68,0.8)] z-20"
            />
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-black pb-12 pt-6 flex flex-col items-center justify-center relative z-10">
        <button
          onClick={handleCapture}
          disabled={isProcessing}
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-gray-400 active:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {isProcessing ? (
            <Loader2 className="w-8 h-8 text-black animate-spin" />
          ) : (
            <Camera className="w-8 h-8 text-black" />
          )}
        </button>
        <p className="text-white/70 mt-4 text-sm font-medium">Align packaging within frame</p>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute bottom-36 left-0 w-full flex justify-center z-40 px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium shadow-2xl text-center"
          >
            {toastMessage}
          </motion.div>
        </div>
      )}

      {/* Verdict Overlay */}
      <VerdictOverlay verdict={verdict} onClose={closeVerdict} />
    </div>
  );
}
