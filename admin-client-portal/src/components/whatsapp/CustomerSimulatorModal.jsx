import { useState } from "react";
import { Bot, MessageSquare, Camera, Mic, MapPin, DollarSign, X, Sparkles, Send } from "lucide-react";
import { simulateIncomingMessage, getCustomerDisplayName } from "../../services/whatsappService";

export default function CustomerSimulatorModal({ chat, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [customText, setCustomText] = useState("");
  const [selectedScenario, setSelectedScenario] = useState("inquiry");

  if (!isOpen) return null;

  const activePhone = chat?.phoneNumber || "919876543210";
  const activeName = chat ? getCustomerDisplayName(chat) : "Er. Senthil Kumar (Client)";

  const scenarios = [
    {
      id: "inquiry",
      icon: <MessageSquare className="h-4 w-4 text-indigo-400" />,
      title: "New Project Inquiry",
      type: "text",
      text: "Hi MAARAN Engineers! We are starting a G+2 commercial project in Chennai. Can you conduct the structural analysis and soil assessment?",
    },
    {
      id: "photo",
      icon: <Camera className="h-4 w-4 text-emerald-400" />,
      title: "Site Inspection Photo",
      type: "image",
      text: "Sending the latest site excavation and beam alignment photo for your verification.",
      mediaUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80",
      fileName: "site-foundation-check.jpg",
    },
    {
      id: "voicenote",
      icon: <Mic className="h-4 w-4 text-amber-400" />,
      title: "Customer Voice Note",
      type: "audio",
      text: "[Voice Note: 24s regarding slab reinforcement and concrete mix ratio]",
      mediaUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      fileName: "client-voice-note.mp3",
    },
    {
      id: "quote_req",
      icon: <DollarSign className="h-4 w-4 text-emerald-400" />,
      title: "Quote & Estimate Request",
      type: "text",
      text: "Could you share the formal BOQ quote and payment schedule for the column structural work?",
    },
    {
      id: "gps_loc",
      icon: <MapPin className="h-4 w-4 text-rose-400" />,
      title: "Live GPS Site Location",
      type: "text",
      text: "Site Location: 13.0827° N, 80.2707° E (Near Metro Pillar 142, Chennai). Please dispatch the engineer here.",
    },
  ];

  const handleSimulate = async (scenario) => {
    try {
      setLoading(true);
      await simulateIncomingMessage({
        from: activePhone,
        customerName: activeName,
        text: customText || scenario.text,
        messageType: scenario.type,
        mediaUrl: scenario.mediaUrl || "",
        fileName: scenario.fileName || "",
      });

      onClose();
    } catch (err) {
      console.error("Simulation error:", err);
      alert(err.response?.data?.error || "Failed to simulate incoming message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🤖 WhatsApp Customer Simulator</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Simulate incoming client messages, site photos & voice notes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Target Profile Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-750 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Simulating As Client</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{activeName}</span>
          </div>
          <span className="font-mono text-[11px] text-indigo-500 dark:text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-md">
            +{activePhone}
          </span>
        </div>

        {/* Preset Scenarios */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Choose a Simulation Scenario:
          </span>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {scenarios.map((sc) => (
              <div
                key={sc.id}
                onClick={() => handleSimulate(sc)}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-indigo-50/70 dark:hover:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition cursor-pointer group flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition">
                  {sc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {sc.title}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                      {sc.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {sc.text}
                  </p>
                </div>
                <button
                  disabled={loading}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shrink-0 transition"
                >
                  Send
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
