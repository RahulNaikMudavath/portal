import { useState, useRef, useEffect } from "react";
import NotesCard from "./NotesCard";
import MaterialsCard from "./MaterialsCard";
import PhotoGallery from "./PhotoGallery";
import AIAnalysisCard from "./AIAnalysisCard";
import SiteCard from "./SiteCard";
import TimelineCard from "./TimelineCard";
import CustomerCard from "./CustomerCard";
import ProgressCard from "./ProgressCard";
import AttachmentsCard from "./AttachmentsCard";
import TravelCard from "./TravelCard";
import TaskActionBar from "./TaskActionBar";
import TaskHeader from "./TaskHeader";
import VoiceNotesCard from "./VoiceNotesCard";
import QrCodeScannerCard from "./QrCodeScannerCard";
import { submitCustomerSignOff } from "../../services/taskService";
import { motion, AnimatePresence } from "framer-motion";

// Enhanced Customer Sign-off Card with Canvas and Ratings
function CustomerSignatureCard({ task, onRefresh }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signerName, setSignerName] = useState(task?.customerSignName || "");
  const [phone, setPhone] = useState(task?.customerSignPhone || "");
  const [remarks, setRemarks] = useState(task?.customerSignRemarks || "");
  const [rating, setRating] = useState(task?.customerSignRating || 5);
  const [submitting, setSubmitting] = useState(false);

  const hasSigned = !!task?.customerSignature;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || hasSigned) return;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#818cf8"; // Indigo color stroke
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
  }, [hasSigned]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || hasSigned) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    
    // Mouse or Touch coords
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || hasSigned) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = async () => {
    if (!signerName.trim()) {
      alert("Please enter the customer's name.");
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setSubmitting(true);
      const signatureDataUrl = canvas.toDataURL("image/png");
      await submitCustomerSignOff(task._id, {
        name: signerName.trim(),
        phone: phone.trim(),
        remarks: remarks.trim(),
        rating,
        signature: signatureDataUrl
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to submit signature sign-off.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:border-slate-700 hover:shadow-lg space-y-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <span>✍️</span> Customer Sign-Off
      </h3>

      {hasSigned ? (
        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-5 space-y-4 text-center">
          <span className="text-3xl">🎉</span>
          <p className="text-sm font-bold text-white">Work Signed Off & Closed</p>
          <div className="text-xs text-slate-400 space-y-1">
            <p>Signed by: <strong className="text-slate-200">{task.customerSignName}</strong></p>
            {task.customerSignPhone && <p>Phone: <span className="font-mono text-slate-200">{task.customerSignPhone}</span></p>}
            {task.customerSignRemarks && <p>Remarks: <span className="italic text-slate-350">"{task.customerSignRemarks}"</span></p>}
          </div>

          {/* Rating Display */}
          <div className="flex justify-center gap-1 py-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-lg ${star <= (task.customerSignRating || 0) ? "text-yellow-450" : "text-slate-700"}`}
              >
                ★
              </span>
            ))}
          </div>

          <div className="border border-slate-850 rounded-lg p-2 bg-slate-950 flex items-center justify-center max-w-[200px] mx-auto">
            <img
              src={task.customerSignature}
              alt="Customer Signature"
              className="max-h-[60px] object-contain invert brightness-200"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">
                Customer Name
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full bg-slate-955 border border-slate-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="e.g. +91 99999 99999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-955 border border-slate-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">
              Satisfaction Rating
            </label>
            <div className="flex gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-xl transition active:scale-90 ${
                    star <= rating ? "text-yellow-450" : "text-slate-600"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">
              Remarks / Comments
            </label>
            <input
              type="text"
              placeholder="e.g. Very professional service, completed on schedule."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-slate-955 border border-slate-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">
              Signature Board
            </label>
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-955">
              <canvas
                ref={canvasRef}
                width={380}
                height={120}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-[120px] cursor-crosshair bg-slate-955"
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-xs pt-1">
            <button
              onClick={clearCanvas}
              type="button"
              className="text-slate-450 hover:text-white font-semibold transition"
            >
              Clear Canvas
            </button>
            <button
              onClick={saveSignature}
              disabled={submitting}
              className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition"
            >
              {submitting ? "Signing..." : "Complete Sign-off"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Weather Widget component showing premium localized status placeholder
function WeatherCard() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 flex items-center justify-between transition hover:border-slate-700">
      <div className="space-y-1">
        <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Site Weather Conditions</h4>
        <p className="text-sm font-bold text-white">Sunny with clear skies</p>
        <span className="text-[10px] text-slate-450 font-medium">Wind: 12 km/h · Humidity: 45%</span>
      </div>
      <div className="text-right">
        <span className="text-3xl">☀️</span>
        <p className="text-lg font-black text-indigo-400 mt-0.5">26°C</p>
      </div>
    </div>
  );
}

export default function FieldWorkspace({
  task,
  onStartTask,
  onProgressUpdate,
  onSubmitWork,
  onRefresh,
}) {
  return (
    <div className="space-y-6">
      {/* Task Header */}
      <TaskHeader task={task} />

      {/* Dynamic Action Bar */}
      <TaskActionBar
        task={task}
        onStartTask={onStartTask}
        onProgressUpdate={onProgressUpdate}
        onSubmitWork={onSubmitWork}
        onRefresh={onRefresh}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          <NotesCard task={task} onRefresh={onRefresh} />
          <VoiceNotesCard task={task} onRefresh={onRefresh} />
          <MaterialsCard task={task} onRefresh={onRefresh} />
          <PhotoGallery task={task} onRefresh={onRefresh} />
          <AttachmentsCard task={task} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-6">
          <ProgressCard
            task={task}
            onUpdate={onProgressUpdate}
          />
          <TravelCard task={task} onRefresh={onRefresh} />
          <QrCodeScannerCard task={task} onRefresh={onRefresh} />
          <WeatherCard />
          <CustomerCard task={task} />
          <SiteCard task={task} />
          <CustomerSignatureCard task={task} onRefresh={onRefresh} />
          <TimelineCard task={task} />
          <AIAnalysisCard task={task} />
        </div>
      </div>
    </div>
  );
}
