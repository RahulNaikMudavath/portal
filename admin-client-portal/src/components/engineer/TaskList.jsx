import { useState, useMemo } from "react";
import TaskCard from "./TaskCard";

export default function TaskList({ tasks = [], selectedTaskId, onSelectTask }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, pending, in-progress, completed
  const [categoryFilter, setCategoryFilter] = useState("all"); // all, office, field

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search matches title
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());

      // Status matches tab
      let matchesFilter = true;
      if (filter === "pending") {
        matchesFilter = task.status === "pending";
      } else if (filter === "in-progress") {
        matchesFilter = task.status === "in-progress";
      } else if (filter === "completed") {
        matchesFilter = task.status === "completed";
      }

      // Category matches dropdown
      let matchesCategory = true;
      if (categoryFilter === "office") {
        matchesCategory = task.taskCategory === "office";
      } else if (categoryFilter === "field") {
        matchesCategory = task.taskCategory === "field";
      }

      return matchesSearch && matchesFilter && matchesCategory;
    });
  }, [tasks, search, filter, categoryFilter]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[calc(100vh-14rem)] overflow-hidden shadow-lg">
      {/* Header Search & Filter */}
      <div className="p-4 border-b border-slate-850 space-y-3 bg-slate-900/80 backdrop-blur">
        {/* Search & Category Dropdown */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-850 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition duration-200"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950/60 border border-slate-850 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition duration-200 cursor-pointer"
          >
            <option value="all">📁 All Modes</option>
            <option value="office">📄 Office</option>
            <option value="field">👷 Field</option>
          </select>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 bg-slate-950/50 p-1 rounded-lg border border-slate-850/80">
          {["all", "pending", "in-progress", "completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider py-1.5 px-1 rounded-md transition duration-200 ${
                filter === tab
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-450 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              {tab.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Task List Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              isActive={selectedTaskId === task._id}
              onClick={() => onSelectTask(task)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <span className="text-3xl mb-2">📁</span>
            <p className="text-sm font-bold text-slate-400">No tasks found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
              Try adjusting your filters or search terms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
