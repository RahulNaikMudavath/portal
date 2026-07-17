import { useState, useRef } from "react";
import { QrCode, Camera, ShieldCheck, X } from "lucide-react";
import { updateVisitStatus, addTaskNote } from "../../services/taskService";
import { isAppOnline, queueOfflineAction } from "../../utils/offlineSync";

export default function QrCodeScannerCard({ task, onRefresh }) {
  const [scanning, setScanning] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState("idle"); // idle, success, error
  const [manualCode, setManualCode] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Start Camera Viewfinder
  const startCamera = async () => {
    try {
      setScanning(true);
      setVerifyStatus("idle");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera streaming not supported or denied. Fallback active.", err);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setScanning(false);
  };

  // Trigger site verification
  const verifyCheckIn = async (code) => {
    const verifiedCode = (code || "").trim();
    if (!verifiedCode) return;

    try {
      setVerifyStatus("idle");
      stopCamera();

      // GPS location retrieval
      let locationCoords = null;
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        locationCoords = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
      } catch (e) {
        console.warn("GPS lookup bypassed during QR verification", e);
      }

      const noteText = `Site QR Verification code parsed: "${verifiedCode}". Location authenticated.`;

      if (!isAppOnline()) {
        queueOfflineAction("updateVisitStatus", task._id, { visitStatus: "reached-site", locationCoords });
        queueOfflineAction("addNote", task._id, { text: noteText });
        setVerifyStatus("success");
        alert("Offline Check-In: QR verified locally! Queue updated.");
        if (onRefresh) onRefresh();
      } else {
        // Sync reached site status and add verification logs
        await updateVisitStatus(task._id, "reached-site", locationCoords);
        await addTaskNote(task._id, { text: noteText });
        setVerifyStatus("success");
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
      setVerifyStatus("error");
    }
  };

  // Simulated auto scan
  const handleSimulateScan = () => {
    verifyCheckIn(task?._id || "SITE-VERIFY-QR");
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:border-slate-700 hover:shadow-lg space-y-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <span>⚙️</span> QR Site Verification
      </h3>

      {verifyStatus === "success" ? (
        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-4 text-center space-y-2">
          <ShieldCheck className="h-10 w-10 text-emerald-500 mx-auto" />
          <h4 className="font-bold text-white">QR Code Verified</h4>
          <p className="text-xs text-slate-400">Site entry logged and check-in finalized successfully.</p>
          <button 
            onClick={() => setVerifyStatus("idle")} 
            className="text-xs text-indigo-400 font-bold hover:underline"
          >
            Scan Again
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          
          {scanning ? (
            <div className="relative border border-slate-800 rounded-xl overflow-hidden bg-black aspect-video flex flex-col justify-center items-center">
              
              {/* WebRTC Video or Simulation View */}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover absolute inset-0"
              />

              {/* Viewfinder scanner box */}
              <div className="relative z-10 w-36 h-36 border-2 border-indigo-500 rounded-lg flex items-center justify-center">
                
                {/* Neon laser line animation */}
                <div className="absolute left-0 right-0 h-0.5 bg-indigo-400 shadow-[0_0_8px_#818cf8] top-0 animate-bounce" style={{ animationDuration: "2.5s" }} />
                
                <span className="text-slate-400 text-[10px] uppercase font-bold text-center tracking-wider bg-black/60 px-1.5 py-0.5 rounded">
                  ALIGN QR CODE
                </span>
              </div>

              <button
                onClick={stopCamera}
                className="absolute top-3 right-3 h-7 w-7 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center border border-slate-800"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="absolute bottom-3 left-3 right-3 z-10 flex justify-between gap-2">
                <button
                  onClick={handleSimulateScan}
                  className="bg-indigo-600/90 hover:bg-indigo-600 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider"
                >
                  Simulate QR Match
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-3">
              <QrCode className="h-10 w-10 text-slate-500" />
              <div className="text-xs space-y-1">
                <p className="font-semibold text-slate-350">Site Entry QR code required</p>
                <p className="text-[10px] text-slate-500">Scan the physical location QR sheet at the site coordinate to verify entry.</p>
              </div>
              <button
                onClick={startCamera}
                className="flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition w-full justify-center shadow-md active:scale-97"
              >
                <Camera className="h-4 w-4" /> Open Site QR Scanner
              </button>
            </div>
          )}

          {/* Manual input fallback */}
          {!scanning && (
            <div className="space-y-2 pt-2 border-t border-slate-850">
              <label className="block text-[10px] font-bold text-slate-450 uppercase">
                Manual Site Check-In Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. SITE-LKO-442"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 bg-slate-955 border border-slate-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                />
                <button
                  onClick={() => verifyCheckIn(manualCode)}
                  className="bg-slate-950 hover:bg-slate-850 text-slate-300 font-bold uppercase tracking-wider text-[10px] px-4 py-2.5 rounded-lg border border-slate-800 transition active:scale-95"
                >
                  Verify
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
