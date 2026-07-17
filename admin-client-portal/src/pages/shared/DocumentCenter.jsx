import { useEffect, useState, useMemo, useRef } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import ClientLayout from "../../layouts/ClientLayout";
import {
  getDocuments,
  uploadDocument,
  togglePinDocument,
  uploadNewVersion,
  deleteDocument
} from "../../services/documentService";
import { getProjects } from "../../services/projectService";
import { getTasks } from "../../services/taskService";
import { getEngineers } from "../../services/userService";
import { motion, AnimatePresence } from "framer-motion";

export default function DocumentCenter({ role = "admin" }) {
  const Layout = role === "admin" ? AdminLayout : ClientLayout;

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [pinnedFilter, setPinnedFilter] = useState("all");

  // Selection for metadata options
  const [projectsList, setProjectsList] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  const [engineersList, setEngineersList] = useState([]);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activePreviewDoc, setActivePreviewDoc] = useState(null);

  // Upload Form
  const [uploadName, setUploadName] = useState("");
  const [uploadType, setUploadType] = useState("pdf");
  const [uploadProject, setUploadProject] = useState("");
  const [uploadEngineer, setUploadEngineer] = useState("");
  const [uploadTask, setUploadTask] = useState("");
  const [uploadTags, setUploadTags] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Version Upload State
  const [updatingVersionId, setUpdatingVersionId] = useState(null);
  const versionInputRef = useRef(null);

  const loadDocumentsList = async () => {
    try {
      const res = await getDocuments();
      setDocuments(res.data);
    } catch (err) {
      console.error("Load documents error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterMetaData = async () => {
    try {
      const [pRes, tRes] = await Promise.all([getProjects(), getTasks()]);
      setProjectsList(pRes.data);
      setTasksList(tRes.data);

      if (role === "admin") {
        const engs = await getEngineers();
        setEngineersList(engs);
      }
    } catch (err) {
      console.error("Load metadata error:", err);
    }
  };

  useEffect(() => {
    loadDocumentsList();
    loadFilterMetaData();
  }, []);

  // Filtered List
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchesType = typeFilter === "all" || doc.type === typeFilter;
      const matchesProject = projectFilter === "all" || (doc.project && doc.project._id === projectFilter);
      const matchesPinned = pinnedFilter === "all" || (pinnedFilter === "pinned" ? doc.pinned : !doc.pinned);

      return matchesSearch && matchesType && matchesProject && matchesPinned;
    });
  }, [documents, search, typeFilter, projectFilter, pinnedFilter]);

  // Handle Upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", uploadName.trim() || selectedFile.name);
      formData.append("type", uploadType);
      if (uploadProject) formData.append("project", uploadProject);
      if (uploadEngineer) formData.append("engineer", uploadEngineer);
      if (uploadTask) formData.append("task", uploadTask);
      
      const tagsArray = uploadTags.split(",").map(t => t.trim()).filter(Boolean);
      formData.append("tags", JSON.stringify(tagsArray));

      await uploadDocument(formData);
      alert("Document uploaded successfully");
      
      // Reset form
      setUploadName("");
      setUploadType("pdf");
      setUploadProject("");
      setUploadEngineer("");
      setUploadTask("");
      setUploadTags("");
      setSelectedFile(null);
      setShowUploadModal(false);

      await loadDocumentsList();
    } catch (err) {
      console.error(err);
      alert("Document upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Toggle Pin
  const handleTogglePin = async (docId) => {
    try {
      await togglePinDocument(docId);
      await loadDocumentsList();
    } catch (err) {
      console.error(err);
    }
  };

  // Upload New Version triggers
  const handleVersionClick = (docId) => {
    setUpdatingVersionId(docId);
    versionInputRef.current?.click();
  };

  const handleVersionChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      await uploadNewVersion(updatingVersionId, formData);
      alert("New document version uploaded!");
      setUpdatingVersionId(null);
      await loadDocumentsList();
    } catch (err) {
      console.error(err);
      alert("Failed to upload version update");
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const handleDeleteDoc = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await deleteDocument(docId);
      await loadDocumentsList();
    } catch (err) {
      console.error(err);
    }
  };

  // Type Icons Helper
  const getTypeIcon = (type) => {
    switch (type) {
      case "blueprint": return "📐";
      case "contract": return "📜";
      case "invoice": return "💵";
      case "image": return "📷";
      case "cad": return "⚙️";
      case "pdf": return "📕";
      default: return "📄";
    }
  };

  // Pinned rows select
  const pinnedDocs = useMemo(() => documents.filter(d => d.pinned), [documents]);

  return (
    <Layout>
      {/* Overview Analytics Center Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Document Center</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Access secure blueprints, invoices, contracts, CAD files, and multi-version audit parameters.
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition active:scale-95 shadow-md"
        >
          ➕ Upload Document
        </button>
      </div>

      {/* Analytics stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Total Files", val: documents.length, icon: "📁", color: "text-indigo-400" },
          { label: "Blueprints", val: documents.filter(d => d.type === "blueprint").length, icon: "📐", color: "text-amber-500" },
          { label: "Contracts", val: documents.filter(d => d.type === "contract").length, icon: "📜", color: "text-emerald-450" },
          { label: "CAD Designs", val: documents.filter(d => d.type === "cad").length, icon: "⚙️", color: "text-blue-400" },
          { label: "PDF Reports", val: documents.filter(d => d.type === "pdf").length, icon: "📕", color: "text-red-405" },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">{stat.label}</span>
              <span className="text-lg font-black text-white mt-1 block">{stat.val}</span>
            </div>
            <span className={`text-xl ${stat.color}`}>{stat.icon}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Filter Sidebar (col-span-3) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-4 space-y-4">
            <h4 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">
              Search & Filters
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Keywords / Tags</label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filename or tag keyword..."
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">File Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full bg-slate-955 border border-slate-850 rounded-lg p-2 text-slate-350"
                >
                  <option value="all">All formats</option>
                  <option value="blueprint">Blueprints (📐)</option>
                  <option value="contract">Contracts (📜)</option>
                  <option value="invoice">Invoices (💵)</option>
                  <option value="image">Images (📷)</option>
                  <option value="cad">CAD files (⚙️)</option>
                  <option value="pdf">PDF reports (📕)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Project</label>
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="w-full bg-slate-955 border border-slate-850 rounded-lg p-2 text-slate-350"
                >
                  <option value="all">All Projects</option>
                  {projectsList.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Pin Status</label>
                <select
                  value={pinnedFilter}
                  onChange={(e) => setPinnedFilter(e.target.value)}
                  className="w-full bg-slate-955 border border-slate-850 rounded-lg p-2 text-slate-350"
                >
                  <option value="all">All documents</option>
                  <option value="pinned">Pinned only</option>
                  <option value="unpinned">Unpinned</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Panel (col-span-9) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Pinned Documents Section */}
          {pinnedDocs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                📌 Pinned Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {pinnedDocs.map((doc) => {
                  const url = doc.url.startsWith("http") ? doc.url : `http://localhost:5001/${doc.url}`;
                  return (
                    <div
                      key={doc._id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between h-36 hover:border-indigo-500/50 transition"
                    >
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start">
                          <span className="text-xl">{getTypeIcon(doc.type)}</span>
                          <button
                            onClick={() => handleTogglePin(doc._id)}
                            className="text-amber-500 text-sm"
                            title="Unpin document"
                          >
                            ★
                          </button>
                        </div>
                        <h4 className="text-xs font-bold text-white truncate" title={doc.name}>
                          {doc.name}
                        </h4>
                        <p className="text-[9px] uppercase font-bold text-indigo-400">
                          {doc.project?.name || "Global Document"}
                        </p>
                      </div>

                      <div className="flex justify-between items-center text-[10px] pt-2 border-t border-slate-800/80">
                        <span className="text-slate-500 font-mono">v{doc.versions.length}</span>
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-400 font-bold hover:underline"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent/Filtered Files Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Document Catalog
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pr-2">File Name</th>
                    <th className="pb-3 px-2">Type</th>
                    <th className="pb-3 px-2">Associated context</th>
                    <th className="pb-3 px-2">Version</th>
                    <th className="pb-3 pl-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map((doc) => {
                    const url = doc.url.startsWith("http") ? doc.url : `http://localhost:5001/${doc.url}`;
                    return (
                      <tr key={doc._id} className="border-b border-slate-800/50 hover:bg-slate-950/20">
                        <td className="py-3.5 pr-2 font-semibold text-white truncate max-w-[180px]" title={doc.name}>
                          <span className="mr-1.5">{getTypeIcon(doc.type)}</span> {doc.name}
                          <div className="flex gap-1.5 flex-wrap mt-1">
                            {doc.tags.map((t, idx) => (
                              <span key={idx} className="bg-slate-950 px-1.5 py-0.5 rounded text-[8px] font-mono text-slate-450 border border-slate-800">
                                #{t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-slate-400 capitalize">{doc.type}</td>
                        <td className="py-3.5 px-2">
                          <p className="text-[10px] text-slate-300 font-bold">
                            {doc.project?.name || "Global"}
                          </p>
                          {doc.task && (
                            <span className="text-[8px] bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-slate-500 block mt-0.5 max-w-[120px] truncate" title={doc.task.title}>
                              Task: {doc.task.title}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-2">
                          <span className="bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-mono font-bold">
                            v{doc.versions.length}
                          </span>
                        </td>
                        <td className="py-3.5 pl-2 text-right space-x-1.5">
                          <button
                            onClick={() => handleTogglePin(doc._id)}
                            className={`text-[13px] ${doc.pinned ? "text-amber-500" : "text-slate-600 hover:text-slate-400"}`}
                            title={doc.pinned ? "Unpin file" : "Pin file"}
                          >
                            ★
                          </button>
                          <button
                            onClick={() => {
                              setActivePreviewDoc(doc);
                              setShowPreviewModal(true);
                            }}
                            className="bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-bold px-2 py-1 rounded"
                          >
                            Preview
                          </button>
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-slate-800 border border-slate-700/60 text-slate-305 font-bold px-2 py-1 rounded"
                          >
                            Download
                          </a>
                          <button
                            onClick={() => handleVersionClick(doc._id)}
                            className="bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-1 rounded"
                            title="Upload new file version"
                          >
                            New version
                          </button>
                          {role === "admin" && (
                            <button
                              onClick={() => handleDeleteDoc(doc._id)}
                              className="bg-red-650/10 border border-red-550/20 text-red-405 px-2 py-1 rounded"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredDocs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center italic text-slate-500">
                        No documents matched active filter presets.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <input
              type="file"
              ref={versionInputRef}
              onChange={handleVersionChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4"
          >
            <h3 className="text-lg font-bold text-white">Upload New Document</h3>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs text-slate-400">
              <div>
                <label className="block font-semibold mb-1">Select File *</label>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files?.length > 0) {
                      setSelectedFile(e.target.files[0]);
                      if (!uploadName) setUploadName(e.target.files[0].name);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Document Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Floor blueprint phase 1"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="w-full bg-slate-955 border border-slate-850 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Document Type</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="w-full bg-slate-955 border border-slate-850 rounded-lg p-2.5 text-slate-205"
                  >
                    <option value="blueprint">Blueprint (📐)</option>
                    <option value="contract">Contract (📜)</option>
                    <option value="invoice">Invoice (💵)</option>
                    <option value="image">Image (📷)</option>
                    <option value="cad">CAD design (⚙️)</option>
                    <option value="pdf">PDF report (📕)</option>
                    <option value="other">Other file (📄)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Project Link</label>
                  <select
                    value={uploadProject}
                    onChange={(e) => setUploadProject(e.target.value)}
                    className="w-full bg-slate-955 border border-slate-850 rounded-lg p-2.5 text-slate-205"
                  >
                    <option value="">Unlinked (Global)</option>
                    {projectsList.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Assign Task Link</label>
                  <select
                    value={uploadTask}
                    onChange={(e) => setUploadTask(e.target.value)}
                    className="w-full bg-slate-955 border border-slate-850 rounded-lg p-2.5 text-slate-205"
                  >
                    <option value="">Unlinked</option>
                    {tasksList.map(t => (
                      <option key={t._id} value={t._id}>{t.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Assign Engineer</label>
                  <select
                    value={uploadEngineer}
                    onChange={(e) => setUploadEngineer(e.target.value)}
                    className="w-full bg-slate-955 border border-slate-850 rounded-lg p-2.5 text-slate-205"
                    disabled={role !== "admin"}
                  >
                    <option value="">Unassigned</option>
                    {engineersList.map(eng => (
                      <option key={eng._id} value={eng._id}>{eng.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. blueprint, phase-1, structural"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  className="w-full bg-slate-955 border border-slate-850 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-350 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  {uploading ? "Uploading..." : "Save Document"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && activePreviewDoc && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 w-full max-w-4xl h-[80vh] rounded-3xl p-6 flex flex-col space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{getTypeIcon(activePreviewDoc.type)}</span> {activePreviewDoc.name}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Uploaded by: {activePreviewDoc.uploadedBy?.name || "System"} · Date: {new Date(activePreviewDoc.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
              <button
                onClick={() => {
                  setActivePreviewDoc(null);
                  setShowPreviewModal(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-750 flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Preview Area / Iframe or Image */}
            <div className="flex-1 bg-slate-950/60 rounded-2xl border border-slate-850 overflow-hidden flex items-center justify-center p-4 relative">
              {activePreviewDoc.type === "image" ? (
                <img
                  src={activePreviewDoc.url.startsWith("http") ? activePreviewDoc.url : `http://localhost:5001/${activePreviewDoc.url}`}
                  alt={activePreviewDoc.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : activePreviewDoc.url.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={activePreviewDoc.url.startsWith("http") ? activePreviewDoc.url : `http://localhost:5001/${activePreviewDoc.url}`}
                  title={activePreviewDoc.name}
                  className="w-full h-full border-none rounded-xl"
                />
              ) : (
                <div className="text-center space-y-3">
                  <span className="text-6xl block">{getTypeIcon(activePreviewDoc.type)}</span>
                  <p className="text-xs text-slate-350">
                    Online preview is unavailable for type <strong className="capitalize">{activePreviewDoc.type}</strong> (.dwg, .docx, .zip).
                  </p>
                  <a
                    href={activePreviewDoc.url.startsWith("http") ? activePreviewDoc.url : `http://localhost:5001/${activePreviewDoc.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition"
                  >
                    Download File to View
                  </a>
                </div>
              )}
            </div>

            {/* Document details, version timeline, log */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              <div className="space-y-1.5">
                <p className="font-bold text-white uppercase text-[9px] tracking-wider mb-2">Version History</p>
                <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                  {activePreviewDoc.versions.map((v, idx) => (
                    <div key={idx} className="flex justify-between border-b border-slate-850 pb-1">
                      <span>Version {v.versionNumber}</span>
                      <span className="font-mono text-slate-500">
                        {new Date(v.uploadedAt).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="font-bold text-white uppercase text-[9px] tracking-wider mb-2">Activity Timeline</p>
                <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                  {activePreviewDoc.activityLog.map((log, idx) => (
                    <div key={idx} className="flex justify-between border-b border-slate-850 pb-1">
                      <span>{log.action}</span>
                      <span className="font-mono text-slate-500">
                        {new Date(log.createdAt).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
