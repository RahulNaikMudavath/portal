import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Radio,
  Calendar,
  FolderLock,
  MessageSquare,
  FileBarChart,
  User,
  Moon,
  Sun,
  RefreshCw,
  LogOut,
  ArrowRight,
  Bot
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getTasks } from "../../services/taskService";
import { syncOfflineQueue } from "../../utils/offlineSync";

export default function GlobalCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const inputRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  // Global keydown listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input and load task cache when opened
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);

      getTasks()
        .then((res) => setTasks(res.data || []))
        .catch(() => {});
    }
  }, [isOpen]);

  // Static Navigation Commands
  const baseCommands = [
    {
      id: "nav-dash",
      title: "Control Center Dashboard",
      category: "Navigation",
      icon: LayoutDashboard,
      action: () => navigate(isAdmin ? "/admin/dashboard" : "/client/dashboard"),
    },
    {
      id: "nav-tasks",
      title: isAdmin ? "All Engineering Tasks" : "My Assigned Tasks",
      category: "Navigation",
      icon: ClipboardList,
      action: () => navigate(isAdmin ? "/admin/tasks" : "/client/tasks"),
    },
    ...(isAdmin
      ? [
          {
            id: "nav-create-task",
            title: "Create New Work Order",
            category: "Actions",
            icon: PlusCircle,
            action: () => navigate("/admin/create-task"),
          },
          {
            id: "nav-ai-request",
            title: "AI Work Request Generator",
            category: "Actions",
            icon: Bot,
            action: () => navigate("/admin/create-ai-work-request"),
          },
          {
            id: "nav-radar",
            title: "Live GPS Field Radar",
            category: "Navigation",
            icon: Radio,
            action: () => navigate("/admin/dashboard"),
          },
          {
            id: "nav-inbox",
            title: "WhatsApp Multi-Agent Inbox",
            category: "Navigation",
            icon: MessageSquare,
            action: () => navigate("/admin/whatsapp-inbox"),
          },
          {
            id: "nav-reports",
            title: "Executive Reports Center",
            category: "Navigation",
            icon: FileBarChart,
            action: () => navigate("/admin/reports"),
          },
        ]
      : []),
    {
      id: "nav-calendar",
      title: "Project Calendar & Schedule",
      category: "Navigation",
      icon: Calendar,
      action: () => navigate(isAdmin ? "/admin/calendar" : "/client/calendar"),
    },
    {
      id: "nav-docs",
      title: "Encrypted Document Center",
      category: "Navigation",
      icon: FolderLock,
      action: () => navigate(isAdmin ? "/admin/documents" : "/client/documents"),
    },
    {
      id: "nav-profile",
      title: "User Profile & Security",
      category: "Navigation",
      icon: User,
      action: () => navigate(isAdmin ? "/admin/profile" : "/client/profile"),
    },
    {
      id: "act-theme",
      title: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
      category: "Preferences",
      icon: theme === "dark" ? Sun : Moon,
      action: () => toggleTheme(),
    },
    {
      id: "act-sync",
      title: "Sync Offline Actions Queue",
      category: "Actions",
      icon: RefreshCw,
      action: () => syncOfflineQueue(),
    },
    {
      id: "act-logout",
      title: "Sign Out / Lock Session",
      category: "Account",
      icon: LogOut,
      action: () => {
        localStorage.clear();
        navigate("/login");
      },
    },
  ];

  // Dynamic Task Search Items
  const taskCommands = tasks.slice(0, 10).map((t) => ({
    id: `task-${t._id}`,
    title: `Task: ${t.title}`,
    subtitle: `Client: ${t.customerName || "N/A"} • ${t.status?.toUpperCase()}`,
    category: "Tasks",
    icon: ClipboardList,
    action: () => navigate(isAdmin ? "/admin/tasks" : "/client/tasks"),
  }));

  // Filter commands by query
  const allItems = [...baseCommands, ...taskCommands];
  const filteredItems = search.trim()
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.subtitle?.toLowerCase().includes(search.toLowerCase()) ||
          item.category.toLowerCase().includes(search.toLowerCase())
      )
    : allItems;

  const handleSelect = (item) => {
    setIsOpen(false);
    item.action();
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="spotlight-title"
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-950/80 backdrop-blur-md"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
          >
            {/* Search Input Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
              <Search className="h-5 w-5 text-indigo-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command, page, or search task name..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none font-medium"
              />
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div className="overflow-y-auto p-2 space-y-1">
              {filteredItems.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = selectedIndex === idx;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-slate-300 hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          isSelected ? "bg-white/20 text-white" : "bg-slate-800 text-indigo-400"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-slate-200"}`}>
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className={`text-[10px] truncate ${isSelected ? "text-indigo-100" : "text-slate-400"}`}>
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {item.category}
                      </span>
                      <ArrowRight className={`h-3.5 w-3.5 ${isSelected ? "opacity-100 text-white" : "opacity-0"}`} />
                    </div>
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No matching commands or tasks found for "{search}"
                </div>
              )}
            </div>

            {/* Footer Navigation Tip */}
            <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-3 font-mono text-[10px]">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Close</span>
              </div>
              <span className="font-mono text-[10px] text-indigo-400 font-bold">ConstructAI Spotlight</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
