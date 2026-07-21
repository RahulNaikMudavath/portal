import { useEffect, useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import ClientLayout from "../../layouts/ClientLayout";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  addTaskToProject,
  uploadProjectDocument,
  uploadProjectPhoto,
  deleteProject,
} from "../../services/projectService";
import { getEngineers } from "../../services/userService";
import { getTasks } from "../../services/taskService";
import { motion, AnimatePresence } from "framer-motion";
import AIAnalysisCard from "../../components/engineer/AIAnalysisCard";

export default function ProjectsWorkspace({ role = "admin" }) {
  const Layout = role === "admin" ? AdminLayout : ClientLayout;

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form / Creation modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [custName, setCustName] = useState("");
  const [loc, setLoc] = useState("");
  const [budgetVal, setBudgetVal] = useState("");
  const [selectedEngs, setSelectedEngs] = useState([]);
  const [createProjectFiles, setCreateProjectFiles] = useState([]);
  const [engineersList, setEngineersList] = useState([]);
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);

  // Link Task
  const [showLinkTaskModal, setShowLinkTaskModal] = useState(false);
  const [unlinkedTasks, setUnlinkedTasks] = useState([]);
  const [targetTaskId, setTargetTaskId] = useState("");
  const [linking, setLinking] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState("overview"); // overview, tasks, documents, timeline, gallery, engineers, budget, ai

  // Search & Filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Document/Photo uploads
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activePhotoStage, setActivePhotoStage] = useState("before");
  const docInputRef = useRef(null);
  const photoInputRef = useRef(null);

  // AI Assistant Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am your ConstructAI Assistant. How can I help you analyze this project today?",
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  const loadWorkspace = async (updateSelected = false) => {
    try {
      const res = await getProjects();
      setProjects(res.data);

      if (res.data.length > 0 && !selectedProject) {
        // Load detail of the first project
        const detail = await getProjectById(res.data[0]._id);
        setSelectedProject(detail.data);
      } else if (updateSelected && selectedProject) {
        const detail = await getProjectById(selectedProject._id);
        setSelectedProject(detail.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCreationData = async () => {
    if (role !== "admin") return;
    try {
      const engs = await getEngineers();
      setEngineersList(engs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadWorkspace();
    loadCreationData();
  }, []);

  // Filtered Projects List
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.customerName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const handleSelectProject = async (p) => {
    try {
      setLoading(true);
      const detail = await getProjectById(p._id);
      setSelectedProject(detail.data);
      setActiveTab("overview");
      // Reset Chat messages with project context
      setChatMessages([
        {
          sender: "ai",
          text: `Hello! Ask me anything about project ${detail.data.name}. I can analyze budgets, schedules, and active tasks.`,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err) {
      console.error(err);
      alert("Failed to load project details.");
    } finally {
      setLoading(false);
    }
  };

  // Create Project Submit
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    try {
      setIsSubmittingProject(true);
      const res = await createProject({
        name: projectName.trim(),
        customerName: custName.trim(),
        location: loc.trim(),
        budget: Number(budgetVal) || 0,
        engineers: selectedEngs,
      });

      if (createProjectFiles.length > 0 && res.data?._id) {
        const formData = new FormData();
        createProjectFiles.forEach((file) => formData.append("files", file));
        await uploadProjectDocument(res.data._id, formData);
      }

      alert("Project created successfully with media attachments!");
      setProjectName("");
      setCustName("");
      setLoc("");
      setBudgetVal("");
      setSelectedEngs([]);
      setCreateProjectFiles([]);
      setShowCreateModal(false);
      await loadWorkspace(true);
    } catch (err) {
      console.error(err);
      alert("Failed to create project");
    } finally {
      setIsSubmittingProject(false);
    }
  };

  // Link Task Load & Submit
  const handleOpenLinkTask = async () => {
    try {
      const allTasksRes = await getTasks();
      const linkedIds = new Set(selectedProject.tasks.map((t) => t._id));
      const unlinked = allTasksRes.data.filter((t) => !linkedIds.has(t._id));
      setUnlinkedTasks(unlinked);
      if (unlinked.length > 0) setTargetTaskId(unlinked[0]._id);
      setShowLinkTaskModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLinkTaskSubmit = async (e) => {
    e.preventDefault();
    if (!targetTaskId) return;

    try {
      setLinking(true);
      await addTaskToProject(selectedProject._id, targetTaskId);
      alert("Task linked to project successfully");
      setShowLinkTaskModal(false);
      await loadWorkspace(true);
    } catch (err) {
      console.error(err);
      alert("Failed to link task");
    } finally {
      setLinking(false);
    }
  };

  // Document Upload
  const handleDocUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);

    try {
      setUploadingDoc(true);
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      await uploadProjectDocument(selectedProject._id, formData);
      await loadWorkspace(true);
    } catch (err) {
      console.error(err);
      alert("Failed to upload document");
    } finally {
      setUploadingDoc(false);
    }
  };

  // Photo Upload
  const handlePhotoUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);

    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      await uploadProjectPhoto(selectedProject._id, formData, activePhotoStage);
      await loadWorkspace(true);
    } catch (err) {
      console.error(err);
      alert("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // AI assistant question submissions
  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const query = chatInput.trim().toLowerCase();
    const userMsg = {
      sender: "user",
      text: chatInput,
      time: new Date().toLocaleTimeString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");

    // Simulated Intelligent AI Context Responder
    setTimeout(() => {
      let reply = "";
      if (query.includes("status")) {
        reply = `Project ${selectedProject.name} is currently "${selectedProject.status.toUpperCase()}". It has ${
          selectedProject.tasks.length
        } associated tasks, with ${
          selectedProject.tasks.filter((t) => t.status === "completed").length
        } marked complete.`;
      } else if (query.includes("budget") || query.includes("cost") || query.includes("money")) {
        const spent = selectedProject.tasks.reduce(
          (acc, t) => acc + (Number(t.estimatedBudget) || 0),
          0
        );
        reply = `The budget allocated is ₹${selectedProject.budget.toLocaleString(
          "en-IN"
        )}. Linked task allocations spent equals ₹${spent.toLocaleString(
          "en-IN"
        )}, leaving a remaining surplus of ₹${(selectedProject.budget - spent).toLocaleString(
          "en-IN"
        )}.`;
      } else if (query.includes("engineer") || query.includes("staff")) {
        reply = `There are ${selectedProject.engineers.length} assigned engineers: ${selectedProject.engineers
          .map((e) => e.name)
          .join(", ")}.`;
      } else {
        reply = `I've analyzed the specifications of ${selectedProject.name}. We are operating at ${selectedProject.location}. Let me know if you would like me to compile checklist metrics or file attachments.`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: reply,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    }, 850);
  };

  return (
    <Layout>
      {/* Overview stats top */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Project Workspace</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ConstructAI ERP central console for multi-site project orchestration and budgets.
          </p>
        </div>
        {role === "admin" && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition active:scale-95 shadow-md"
          >
            ➕ Create Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center max-w-2xl mx-auto mt-12 shadow-lg">
          <span className="text-6xl block mb-6">🏗️</span>
          <h3 className="text-xl font-bold text-white">No Projects Yet</h3>
          <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
            You don't have any projects configured in your isolated company workspace. Create your first project to get started.
          </p>
          {role === "admin" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition shadow-md"
            >
              ➕ Create Your First Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side (col-span-3) - Search, filter & Projects List */}
        <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-6 max-h-[calc(100vh-100px)] overflow-y-auto pr-1">
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-4 space-y-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-955 border border-slate-850 rounded-lg p-2 text-xs text-slate-350"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>

          <div className="space-y-3 max-h-[calc(100vh-21rem)] overflow-y-auto pr-1">
            {filteredProjects.map((p) => {
              const isActive = selectedProject?._id === p._id;
              return (
                <div
                  key={p._id}
                  onClick={() => handleSelectProject(p)}
                  className={`relative cursor-pointer p-4 rounded-xl border transition ${
                    isActive
                      ? "bg-slate-800 border-indigo-500/60 shadow-lg"
                      : "bg-slate-900 border-slate-800 hover:bg-slate-850"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r bg-indigo-500" />
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] uppercase tracking-wider font-bold">
                      <span className="text-slate-500">🏢 {p.customerName || "Corp client"}</span>
                      <span className={`px-2 py-0.5 rounded ${
                        p.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : p.status === "planning"
                          ? "bg-blue-500/10 text-blue-450"
                          : "bg-yellow-500/10 text-yellow-450"
                      }`}>
                        {p.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side (col-span-9) - Detailed project workspace with tabs */}
        <div className="lg:col-span-9">
          {selectedProject ? (
            <div className="space-y-6">
              {/* Project Card Header */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                    Active Project Console
                  </span>
                  <h3 className="text-2xl font-black text-white">{selectedProject.name}</h3>
                  <p className="text-xs text-slate-400">
                    📍 {selectedProject.location} · Customer: {selectedProject.customerName}
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="text-center bg-slate-950/40 border border-slate-850 rounded-xl px-4 py-2">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Budget</span>
                    <span className="text-sm font-black text-white">
                      ₹{selectedProject.budget.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="text-center bg-slate-950/40 border border-slate-850 rounded-xl px-4 py-2">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Status</span>
                    <span className="text-xs font-bold text-indigo-400 capitalize block mt-0.5">
                      {selectedProject.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tab Navigation links */}
              <div className="flex flex-wrap gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-bold uppercase tracking-wider">
                {[
                  { key: "overview", label: "Overview", icon: "🏗️" },
                  { key: "tasks", label: "Tasks", icon: "📋" },
                  { key: "documents", label: "Documents", icon: "📎" },
                  { key: "timeline", label: "Timeline", icon: "📅" },
                  { key: "gallery", label: "Gallery", icon: "📷" },
                  { key: "engineers", label: "Engineers", icon: "👷" },
                  { key: "budget", label: "Budget", icon: "💰" },
                  { key: "ai", label: "AI Assistant", icon: "🤖" },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`flex items-center gap-1.5 py-2 px-3 rounded-lg transition ${
                      activeTab === t.key ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>{t.icon}</span> {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-6"
                  >
                    {/* Left details */}
                    <div className="sm:col-span-8 space-y-6">
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                        <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
                          Project Analytics
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">Linked Tasks</span>
                            <span className="text-xl font-black text-white mt-1 block">
                              {selectedProject.tasks.length}
                            </span>
                          </div>
                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">Completed</span>
                            <span className="text-xl font-black text-emerald-450 mt-1 block">
                              {selectedProject.tasks.filter((t) => t.status === "completed").length}
                            </span>
                          </div>
                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">Documents</span>
                            <span className="text-xl font-black text-indigo-400 mt-1 block">
                              {selectedProject.documents.length}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Scope Description AI Summary */}
                      <AIAnalysisCard task={{ aiSummary: selectedProject.aiSummary }} />
                    </div>

                    {/* Right side info */}
                    <div className="sm:col-span-4 space-y-6">
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                        <h4 className="text-xs uppercase font-extrabold text-slate-500">Key Information</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between border-b border-slate-850 pb-2">
                            <span className="text-slate-400">Customer:</span>
                            <span className="font-bold text-white">{selectedProject.customerName}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-850 pb-2">
                            <span className="text-slate-400">Site Location:</span>
                            <span className="font-bold text-white truncate max-w-[150px]" title={selectedProject.location}>
                              {selectedProject.location}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-slate-850 pb-2">
                            <span className="text-slate-400">Status:</span>
                            <span className="font-bold text-white capitalize">{selectedProject.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "tasks" && (
                  <motion.div
                    key="tasks"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
                        Linked Project Tasks
                      </h4>
                      {role === "admin" && (
                        <button
                          onClick={handleOpenLinkTask}
                          className="bg-slate-800 border border-slate-700/60 hover:bg-slate-750 text-slate-200 text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition"
                        >
                          🔗 Link Existing Task
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {selectedProject.tasks.map((task) => (
                        <div
                          key={task._id}
                          className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <p className="text-xs font-bold text-white">{task.title}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Assigned to: {task.assignedTo?.name || "Unassigned"} · Category: {task.taskCategory}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-mono font-bold text-indigo-400">
                              {task.progress || 0}% Progress
                            </span>
                            <span className="text-[10px] uppercase font-bold text-slate-450 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
                              {task.status}
                            </span>
                          </div>
                        </div>
                      ))}

                      {selectedProject.tasks.length === 0 && (
                        <p className="text-xs text-slate-500 italic text-center py-8">
                          No tasks linked to this project yet.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "documents" && (
                  <motion.div
                    key="documents"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
                        Project Specifications & Documents
                      </h4>
                      <div>
                        <button
                          onClick={() => docInputRef.current?.click()}
                          disabled={uploadingDoc}
                          className="bg-slate-800 border border-slate-700/60 hover:bg-slate-750 text-slate-205 text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition disabled:opacity-50"
                        >
                          {uploadingDoc ? "Uploading..." : "📎 Upload Spec Sheet"}
                        </button>
                        <input
                          type="file"
                          ref={docInputRef}
                          onChange={handleDocUpload}
                          multiple
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {selectedProject.documents.map((doc, idx) => {
                        const url = doc.url.startsWith("http") ? doc.url : `http://localhost:5001/${doc.url}`;
                        return (
                          <div
                            key={idx}
                            className="bg-slate-950/40 border border-slate-800 rounded-xl p-3 flex justify-between items-center"
                          >
                            <div className="truncate pr-3">
                              <p className="text-xs font-bold text-white truncate" title={doc.name}>
                                📄 {doc.name}
                              </p>
                              <span className="text-[9px] text-slate-500 font-mono block mt-1">
                                {new Date(doc.uploadedAt).toLocaleDateString("en-IN")}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold"
                              >
                                View
                              </a>
                            </div>
                          </div>
                        );
                      })}

                      {selectedProject.documents.length === 0 && (
                        <p className="text-xs text-slate-500 italic text-center py-8 col-span-2">
                          No document sheets or specs attached.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "gallery" && (
                  <motion.div
                    key="gallery"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
                        Project Media Gallery ({selectedProject.photos.length})
                      </h4>
                      <div className="flex gap-2 text-xs">
                        <select
                          value={activePhotoStage}
                          onChange={(e) => setActivePhotoStage(e.target.value)}
                          className="bg-slate-950 border border-slate-805 rounded-xl px-2.5 py-1.5 text-xs text-slate-350"
                        >
                          <option value="before">Before</option>
                          <option value="during">During</option>
                          <option value="after">After</option>
                        </select>
                        <button
                          onClick={() => photoInputRef.current?.click()}
                          disabled={uploadingPhoto}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition"
                        >
                          {uploadingPhoto ? "Uploading..." : "📷 Add Photo"}
                        </button>
                        <input
                          type="file"
                          ref={photoInputRef}
                          onChange={handlePhotoUpload}
                          multiple
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {selectedProject.photos.map((photo, index) => {
                        const url = photo.url.startsWith("http") ? photo.url : `http://localhost:5001/${photo.url}`;
                        return (
                          <div
                            key={index}
                            className="relative group cursor-pointer overflow-hidden rounded-xl border border-slate-800 bg-slate-950 aspect-video"
                          >
                            <img
                              src={url}
                              alt={photo.name}
                              className="h-full w-full object-cover transition group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition p-2.5 flex flex-col justify-end">
                              <p className="text-[10px] font-bold text-white truncate">{photo.name}</p>
                              <span className="text-[9px] uppercase font-bold text-indigo-400 mt-1">
                                Stage: {photo.stage}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {selectedProject.photos.length === 0 && (
                        <p className="text-xs text-slate-500 italic text-center py-8 col-span-4">
                          No images uploaded to the project media board yet.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "engineers" && (
                  <motion.div
                    key="engineers"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
                  >
                    <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
                      Assigned Project Engineers
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {selectedProject.engineers.map((eng) => (
                        <div
                          key={eng._id}
                          className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-2 flex justify-between items-start"
                        >
                          <div>
                            <p className="text-xs font-bold text-white">{eng.name}</p>
                            <p className="text-[10px] text-slate-500">{eng.email}</p>
                            {eng.phone && <p className="text-[10px] text-slate-500 font-mono mt-1">📞 {eng.phone}</p>}
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
                            {eng.role}
                          </span>
                        </div>
                      ))}

                      {selectedProject.engineers.length === 0 && (
                        <p className="text-xs text-slate-500 italic text-center py-8 col-span-2">
                          No engineers assigned to this project yet.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "budget" && (
                  <motion.div
                    key="budget"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6"
                  >
                    <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
                      Budget & Cost Breakdown
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-950/50 p-4 border border-slate-850 rounded-xl space-y-1">
                        <span className="text-slate-500 block uppercase font-bold text-[10px]">Total Allocated Budget</span>
                        <span className="text-2xl font-black text-white">
                          ₹{selectedProject.budget.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="bg-slate-950/50 p-4 border border-slate-850 rounded-xl space-y-1">
                        <span className="text-slate-500 block uppercase font-bold text-[10px]">Task Committed Costs</span>
                        <span className="text-2xl font-black text-indigo-400">
                          ₹{selectedProject.tasks
                            .reduce((acc, t) => acc + (Number(t.estimatedBudget) || 0), 0)
                            .toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Task Budgets</h5>
                      <div className="space-y-2.5">
                        {selectedProject.tasks.map((task) => (
                          <div
                            key={task._id}
                            className="bg-slate-950/20 border border-slate-850 p-3 rounded-lg flex justify-between items-center text-xs"
                          >
                            <span className="text-slate-300 font-medium">{task.title}</span>
                            <span className="font-bold text-white font-mono">
                              ₹{(Number(task.estimatedBudget) || 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "timeline" && (
                  <motion.div
                    key="timeline"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
                  >
                    <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
                      Project Event Feed
                    </h4>

                    <div className="relative border-l border-slate-800 ml-3 pl-4 space-y-4 text-xs">
                      {selectedProject.activityLog.map((log, idx) => (
                        <div key={idx} className="relative">
                          <span className="absolute -left-[22px] top-0 bg-slate-800 text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-slate-950">
                            {log.icon || "📌"}
                          </span>
                          <div>
                            <p className="font-bold text-white">{log.action}</p>
                            {log.remarks && <p className="text-slate-450 italic mt-0.5">{log.remarks}</p>}
                            <span className="text-[9px] text-slate-500 font-mono block mt-1">
                              {new Date(log.createdAt).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "ai" && (
                  <motion.div
                    key="ai"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col h-[400px]"
                  >
                    <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span>🤖</span> Project AI Assistant
                    </h4>

                    {/* Messages panel */}
                    <div className="flex-1 overflow-y-auto space-y-3 bg-slate-950/40 rounded-xl p-3 border border-slate-850 scrollbar-thin">
                      {chatMessages.map((msg, index) => (
                        <div
                          key={index}
                          className={`rounded-xl p-3 max-w-[80%] ${
                            msg.sender === "ai" ? "bg-slate-850 text-slate-200" : "bg-indigo-650 text-white ml-auto"
                          }`}
                        >
                          <p className="text-xs">{msg.text}</p>
                          <span className="text-[8px] text-slate-500 font-mono block text-right mt-1">
                            {msg.time}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Input box */}
                    <form onSubmit={handleSendChatMessage} className="flex gap-2">
                      <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask anything about the project status or cost allocations..."
                        className="flex-1 bg-slate-950 border border-slate-855 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase px-4 rounded-xl transition"
                      >
                        Send
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-lg">
              <span className="text-5xl block mb-4">🏗️</span>
              <h3 className="text-lg font-bold text-white">Select a Project</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
                No project selected. Select a project from the left side panel list to monitor resources.
              </p>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Creation Modal (Admin only) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4"
          >
            <h3 className="text-lg font-bold text-white">Create New Project</h3>

            <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs text-slate-400">
              <div>
                <label className="block font-semibold mb-1">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru Metro Phase 2"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Customer / Client</label>
                <input
                  type="text"
                  placeholder="e.g. BMRCL Corp"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full bg-slate-955 border border-slate-850 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Whitefield, BLR"
                    value={loc}
                    onChange={(e) => setLoc(e.target.value)}
                    className="w-full bg-slate-955 border border-slate-850 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Allocated Budget (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5000000"
                    value={budgetVal}
                    onChange={(e) => setBudgetVal(e.target.value)}
                    className="w-full bg-slate-955 border border-slate-850 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Select Engineers</label>
                <select
                  multiple
                  value={selectedEngs}
                  onChange={(e) => {
                    const options = Array.from(e.target.selectedOptions).map((o) => o.value);
                    setSelectedEngs(options);
                  }}
                  className="w-full bg-slate-955 border border-slate-850 rounded-lg p-2 h-24 text-slate-300"
                >
                  {engineersList.map((eng) => (
                    <option key={eng._id} value={eng._id}>
                      {eng.name} ({eng.email})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">Hold Ctrl/Cmd to select multiple</span>
              </div>

              <div>
                <label className="block font-semibold mb-1">Attach Spec Sheet / PDFs / CAD / Media</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.dwg,.csv,.xlsx,image/*,video/*"
                  onChange={(e) => setCreateProjectFiles(Array.from(e.target.files))}
                  className="w-full bg-slate-955 border border-slate-850 rounded-lg p-2 text-slate-300 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                />
                {createProjectFiles.length > 0 && (
                  <div className="mt-1.5 space-y-1 bg-slate-950 p-2.5 rounded-lg border border-indigo-500/30">
                    <p className="text-[10px] text-indigo-400 font-bold">
                      📎 {createProjectFiles.length} file(s) attached:
                    </p>
                    <ul className="text-[10px] text-slate-300 list-disc list-inside max-h-16 overflow-y-auto space-y-0.5 font-mono">
                      {createProjectFiles.map((f, i) => (
                        <li key={i} className="truncate">{f.name} ({(f.size / 1024).toFixed(1)} KB)</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-350 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProject}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  {isSubmittingProject ? "Creating..." : "Save Project"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Link Task Modal */}
      {showLinkTaskModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-6 space-y-4"
          >
            <h3 className="text-lg font-bold text-white">Link Task to Project</h3>

            <form onSubmit={handleLinkTaskSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-400">Select Task</label>
                <select
                  value={targetTaskId}
                  onChange={(e) => setTargetTaskId(e.target.value)}
                  className="w-full bg-slate-955 border border-slate-850 rounded-lg p-2.5 text-slate-200"
                  required
                >
                  {unlinkedTasks.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.title} (Status: {t.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-350 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={linking}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  {linking ? "Linking..." : "Link Task"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
