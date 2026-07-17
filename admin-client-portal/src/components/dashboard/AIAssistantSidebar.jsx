import { useState, useEffect } from "react";
import { askAi } from "../../services/aiService";
import { getProjects } from "../../services/projectService";
import { getTasks } from "../../services/taskService";
import { motion, AnimatePresence } from "framer-motion";

export default function AIAssistantSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Context Selection
  const [contextType, setContextType] = useState("project"); // project, task
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [activeContext, setActiveContext] = useState(null);

  // Output card
  const [aiResponse, setAiResponse] = useState(null);

  // Chat conversation logs
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am ConstructAI Assistant. Choose a project or task context on the panel and trigger any analysis quick-button or ask me custom questions.",
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  const loadSelectionContexts = async () => {
    try {
      const [pRes, tRes] = await Promise.all([getProjects(), getTasks()]);
      setProjects(pRes.data);
      setTasks(tRes.data);

      if (pRes.data.length > 0) {
        setSelectedId(pRes.data[0]._id);
        setActiveContext(pRes.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSelectionContexts();
  }, []);

  useEffect(() => {
    if (!selectedId) return;

    if (contextType === "project") {
      const found = projects.find((p) => p._id === selectedId);
      if (found) setActiveContext(found);
    } else {
      const found = tasks.find((t) => t._id === selectedId);
      if (found) {
        // Map task variables to match context payload expectations
        setActiveContext({
          projectName: found.title,
          customerName: found.customerName || "N/A",
          timeline: found.deadline,
          tasks: [found],
          notes: found.notes || [],
          photos: found.submissionFiles?.map((f) => ({ url: f, name: "Submission" })) || [],
          materials: found.materials || [],
          progress: found.progress || 0,
          budget: found.estimatedBudget || 0,
          visitStatus: found.visitStatus || "N/A",
          priority: found.priority || "medium",
          customerSignature: found.customerSignature,
        });
      }
    }
  }, [selectedId, contextType, projects, tasks]);

  const handleAction = async (actionType) => {
    try {
      setLoading(true);
      setAiResponse(null);
      const res = await askAi(actionType, activeContext || {});
      setAiResponse(res);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Generated ${res.title}. Detail parameters:\n\n${res.content}`,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const query = chatInput.trim();
    const userMsg = {
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");

    try {
      setLoading(true);
      const normQuery = query.toLowerCase();
      let resType = "default";

      if (normQuery.includes("summary") || normQuery.includes("about")) resType = "summary";
      else if (normQuery.includes("risk") || normQuery.includes("hazard")) resType = "risks";
      else if (normQuery.includes("budget") || normQuery.includes("cost") || normQuery.includes("money")) resType = "budget";
      else if (normQuery.includes("material") || normQuery.includes("cement") || normQuery.includes("steel")) resType = "materials";
      else if (normQuery.includes("missing") || normQuery.includes("complete")) resType = "missing";
      else if (normQuery.includes("next") || normQuery.includes("do")) resType = "next";
      else if (normQuery.includes("engineer") || normQuery.includes("ramesh")) resType = "engineers";
      else if (normQuery.includes("safety") || normQuery.includes("gear")) resType = "safety";

      const res = await askAi(resType, activeContext || {});
      setAiResponse(res);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: res.content,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button (Fixed on the right) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-indigo-650 to-indigo-755 hover:from-indigo-600 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider py-3.5 px-5 rounded-2xl shadow-xl shadow-indigo-950/40 active:scale-95 transition-all duration-200 flex items-center gap-2 border border-indigo-500/30 animate-pulse"
      >
        <span>✨</span> AI Assistant
      </button>

      {/* Sliding Collapsible Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end select-none">
            {/* Backdrop cover overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Sidebar drawer body */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md h-full bg-slate-950 border-l border-slate-850 shadow-2xl flex flex-col z-10"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-850 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <div>
                    <h3 className="text-sm font-black text-white">ConstructAI Copilot</h3>
                    <p className="text-[9px] uppercase font-bold text-indigo-400 tracking-wider">
                      Real-time Project & Safety AI
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-750 flex items-center justify-center text-slate-400 hover:text-white transition"
                >
                  ✕
                </button>
              </div>

              {/* Context Selector Section */}
              <div className="p-4 border-b border-slate-850 bg-slate-900/20 space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setContextType("project");
                      if (projects.length > 0) setSelectedId(projects[0]._id);
                    }}
                    className={`flex-1 text-[10px] py-1.5 rounded-lg border font-bold uppercase transition ${
                      contextType === "project"
                        ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-400"
                        : "bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    🏢 Project Context
                  </button>
                  <button
                    onClick={() => {
                      setContextType("task");
                      if (tasks.length > 0) setSelectedId(tasks[0]._id);
                    }}
                    className={`flex-1 text-[10px] py-1.5 rounded-lg border font-bold uppercase transition ${
                      contextType === "task"
                        ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-400"
                        : "bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    📋 Task Context
                  </button>
                </div>

                <div>
                  <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none"
                  >
                    {contextType === "project"
                      ? projects.map((p) => (
                          <option key={p._id} value={p._id}>
                            Project: {p.name}
                          </option>
                        ))
                      : tasks.map((t) => (
                          <option key={t._id} value={t._id}>
                            Task: {t.title}
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              {/* Scrollable Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {/* Chat Log history */}
                <div className="space-y-3.5">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex flex-col max-w-[85%] ${
                        msg.sender === "ai" ? "bg-slate-900 border border-slate-850 text-slate-200" : "bg-indigo-650 text-white ml-auto"
                      } rounded-2xl p-3.5 space-y-1.5 shadow-md`}
                    >
                      <div className="text-xs leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </div>
                      <span className="text-[8px] text-slate-500 font-mono text-right block">
                        {msg.time}
                      </span>
                    </div>
                  ))}
                </div>

                {loading && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 italic bg-slate-900/40 border border-slate-850 rounded-xl p-3 max-w-[120px]">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce animation-delay-200">●</span>
                    <span className="animate-bounce animation-delay-400">●</span>
                    Copilot is thinking...
                  </div>
                )}
              </div>

              {/* Quick Actions Panel */}
              <div className="p-4 border-t border-slate-850 bg-slate-900/40 grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-wider">
                <button
                  onClick={() => handleAction("summary")}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-850 py-2 rounded-xl text-slate-250 hover:text-white transition"
                >
                  📝 Summary
                </button>
                <button
                  onClick={() => handleAction("risks")}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-850 py-2 rounded-xl text-slate-250 hover:text-white transition"
                >
                  ⚠️ Risk Analysis
                </button>
                <button
                  onClick={() => handleAction("budget")}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-850 py-2 rounded-xl text-slate-250 hover:text-white transition"
                >
                  💰 Budget audit
                </button>
                <button
                  onClick={() => handleAction("materials")}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-850 py-2 rounded-xl text-slate-250 hover:text-white transition"
                >
                  🧱 Material Tips
                </button>
                <button
                  onClick={() => handleAction("missing")}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-850 py-2 rounded-xl text-slate-250 hover:text-white transition"
                >
                  🔍 Missing Info
                </button>
                <button
                  onClick={() => handleAction("next")}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-850 py-2 rounded-xl text-slate-250 hover:text-white transition"
                >
                  ⚡ Next Action
                </button>
                <button
                  onClick={() => handleAction("engineers")}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-850 py-2 rounded-xl text-slate-250 hover:text-white transition"
                >
                  👷 Engineer Alloc
                </button>
                <button
                  onClick={() => handleAction("safety")}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-850 py-2 rounded-xl text-slate-250 hover:text-white transition"
                >
                  🛡️ Safety Audit
                </button>
              </div>

              {/* Chat Input form */}
              <form
                onSubmit={handleSendChat}
                className="p-4 bg-slate-950 border-t border-slate-850 flex gap-2"
              >
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask ConstructAI anything..."
                  className="flex-1 bg-slate-900 border border-slate-805 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase px-4 rounded-xl transition"
                >
                  Send
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
