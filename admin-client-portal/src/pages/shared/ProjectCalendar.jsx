import { useEffect, useState, useMemo } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import ClientLayout from "../../layouts/ClientLayout";
import { 
  getCalendarEvents, createCalendarEvent, updateCalendarEvent, 
  deleteCalendarEvent, checkCalendarConflicts 
} from "../../services/calendarService";
import { getProjects } from "../../services/projectService";
import { getEngineers } from "../../services/userService";
import { 
  Calendar as CalendarIcon, Clock, MapPin, User, ChevronLeft, 
  ChevronRight, Plus, Filter, AlertTriangle, X, Check, CheckCircle2 
} from "lucide-react";

// Event type configs for colors/labels
const EVENT_TYPES = {
  "engineer-visit": { label: "Engineer Visit", dot: "bg-indigo-500", text: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
  "site-visit": { label: "Site Visit", dot: "bg-sky-500", text: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20" },
  "deadline": { label: "Deadline", dot: "bg-rose-500", text: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
  "inspection": { label: "Inspection", dot: "bg-amber-500", text: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  "meeting": { label: "Meeting", dot: "bg-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  "customer-visit": { label: "Customer Visit", dot: "bg-purple-500", text: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  "support": { label: "Support", dot: "bg-teal-500", text: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20" }
};

export default function ProjectCalendar() {
  // Read current user info from local storage
  const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "{}"), []);
  const isAdmin = user.role === "admin";

  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTypes, setSelectedTypes] = useState(Object.keys(EVENT_TYPES));
  const [selectedEngineerIds, setSelectedEngineerIds] = useState([]);

  // Navigation & View states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month"); // month, week, day, agenda

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null); // null means "Create"
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    eventType: "engineer-visit",
    projectId: "",
    start: "",
    end: "",
    assignedEngineers: [],
    location: "",
    allDay: false
  });

  // Conflict / Drag States
  const [conflictModal, setConflictModal] = useState(null); // stores { event, targetStart, targetEnd, conflicts }
  const [formConflictWarning, setFormConflictWarning] = useState("");

  const Layout = isAdmin ? AdminLayout : ClientLayout;

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsRes, projectsRes, engineersRes] = await Promise.all([
        getCalendarEvents(),
        getProjects(),
        getEngineers()
      ]);
      setEvents(eventsRes.data);
      setProjects(projectsRes.data);
      setEngineers(engineersRes);
    } catch (err) {
      console.error("Calendar data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter events based on selections
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const typeMatch = selectedTypes.includes(e.eventType);
      
      let engineerMatch = true;
      if (selectedEngineerIds.length > 0) {
        engineerMatch = (e.engineers || []).some(eng => 
          selectedEngineerIds.includes(eng._id)
        );
      }

      return typeMatch && engineerMatch;
    });
  }, [events, selectedTypes, selectedEngineerIds]);

  // Compute engineer status for "Availability Tracker" today
  const engineerAvailability = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return engineers.map(eng => {
      const todayEvents = events.filter(e => {
        const hasEng = (e.engineers || []).some(en => en._id === eng._id);
        if (!hasEng) return false;
        
        const start = new Date(e.start);
        const end = new Date(e.end);
        
        // Event overlaps with "Today"
        return start < tomorrow && end > today;
      });

      return {
        ...eng,
        busy: todayEvents.length > 0,
        currentEvents: todayEvents
      };
    });
  }, [engineers, events]);

  // Real-time conflict validation for manual forms
  useEffect(() => {
    const checkFormConflicts = async () => {
      const { start, end, assignedEngineers } = eventForm;
      if (!start || !end || assignedEngineers.length === 0) {
        setFormConflictWarning("");
        return;
      }

      try {
        const res = await checkCalendarConflicts({
          start,
          end,
          engineers: assignedEngineers,
          excludeEventId: editingEvent?._id || null
        });

        if (res.data.conflictDetected) {
          const names = res.data.conflicts
            .map(c => c.engineers.map(e => e.name).join(", "))
            .join(", ");
          setFormConflictWarning(`⚠️ Conflict: ${names} is already booked for other tasks.`);
        } else {
          setFormConflictWarning("");
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkFormConflicts();
  }, [eventForm.start, eventForm.end, eventForm.assignedEngineers, editingEvent]);

  // Open Event Modal
  const openCreateModal = (date = null) => {
    if (!isAdmin) return; // Client can't create
    
    let defaultStart = "";
    let defaultEnd = "";

    if (date) {
      // Set to current date + standard hour slot (9am to 10am)
      const s = new Date(date);
      s.setHours(9, 0, 0, 0);
      const e = new Date(date);
      e.setHours(10, 0, 0, 0);

      // Format for datetime-local
      const pad = (n) => String(n).padStart(2, '0');
      defaultStart = `${s.getFullYear()}-${pad(s.getMonth()+1)}-${pad(s.getDate())}T${pad(s.getHours())}:${pad(s.getMinutes())}`;
      defaultEnd = `${e.getFullYear()}-${pad(e.getMonth()+1)}-${pad(e.getDate())}T${pad(e.getHours())}:${pad(e.getMinutes())}`;
    }

    setEditingEvent(null);
    setEventForm({
      title: "",
      description: "",
      eventType: "engineer-visit",
      projectId: "",
      start: defaultStart,
      end: defaultEnd,
      assignedEngineers: [],
      location: "",
      allDay: false
    });
    setFormConflictWarning("");
    setIsModalOpen(true);
  };

  const openEditModal = (event) => {
    const pad = (n) => String(n).padStart(2, '0');
    const toLocalString = (dateStr) => {
      if (!dateStr) return "";
      const d = new Date(dateStr);
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || "",
      eventType: event.eventType,
      projectId: event.project?._id || "",
      start: toLocalString(event.start),
      end: toLocalString(event.end),
      assignedEngineers: (event.engineers || []).map(e => e._id),
      location: event.location || "",
      allDay: event.allDay || false
    });
    setIsModalOpen(true);
  };

  // Form actions
  const handleFormChange = (key, val) => {
    setEventForm(prev => ({ ...prev, [key]: val }));
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      const payload = {
        title: eventForm.title,
        description: eventForm.description,
        eventType: eventForm.eventType,
        project: eventForm.projectId || null,
        start: new Date(eventForm.start),
        end: new Date(eventForm.end),
        engineers: eventForm.assignedEngineers,
        location: eventForm.location,
        allDay: eventForm.allDay
      };

      if (editingEvent) {
        await updateCalendarEvent(editingEvent._id, payload);
      } else {
        await createCalendarEvent(payload);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error("Save event error:", err);
    }
  };

  const handleDeleteEvent = async () => {
    if (!editingEvent || !isAdmin) return;
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteCalendarEvent(editingEvent._id);
        setIsModalOpen(false);
        loadData();
      } catch (err) {
        console.error("Delete event error:", err);
      }
    }
  };

  // Drag and Drop rescheduling logic
  const handleDragStart = (e, eventId) => {
    if (!isAdmin) return;
    e.dataTransfer.setData("text/plain", eventId);
  };

  const handleDragOver = (e) => {
    if (!isAdmin) return;
    e.preventDefault();
  };

  const handleDropOnDay = async (e, dateStr) => {
    if (!isAdmin) return;
    e.preventDefault();
    const eventId = e.dataTransfer.getData("text/plain");
    const event = events.find(ev => ev._id === eventId);
    if (!event) return;

    const targetDate = new Date(dateStr);
    
    // Preserve start/end hour and minute, shift date
    const origStart = new Date(event.start);
    const origEnd = new Date(event.end);
    
    const durationMs = origEnd.getTime() - origStart.getTime();
    
    const newStart = new Date(targetDate);
    newStart.setHours(origStart.getHours(), origStart.getMinutes(), 0, 0);
    const newEnd = new Date(newStart.getTime() + durationMs);

    // Conflict detection check
    try {
      const res = await checkCalendarConflicts({
        start: newStart,
        end: newEnd,
        engineers: (event.engineers || []).map(en => en._id),
        excludeEventId: event._id
      });

      if (res.data.conflictDetected) {
        // Show conflict warning prompt
        setConflictModal({
          event,
          targetStart: newStart,
          targetEnd: newEnd,
          conflicts: res.data.conflicts
        });
      } else {
        // Sync straight to database
        await updateCalendarEvent(event._id, {
          start: newStart,
          end: newEnd
        });
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmReschedule = async () => {
    if (!conflictModal) return;
    try {
      await updateCalendarEvent(conflictModal.event._id, {
        start: conflictModal.targetStart,
        end: conflictModal.targetEnd
      });
      setConflictModal(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Monthly dates computation helper
  const monthDaysGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Fill previous month days to pad beginning of week (0 = Sun, 1 = Mon)
    const prevDaysToPad = firstDay.getDay(); 
    const gridDays = [];

    for (let i = prevDaysToPad; i > 0; i--) {
      const d = new Date(year, month, 1 - i);
      gridDays.push({ date: d, isCurrentMonth: false });
    }

    // Current month days
    const totalDays = lastDay.getDate();
    for (let i = 1; i <= totalDays; i++) {
      gridDays.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Pad remaining space at the end to get full grids (multiples of 7)
    const totalSlots = gridDays.length;
    const remainingSlots = 42 - totalSlots; // standard 6-week layout
    for (let i = 1; i <= remainingSlots; i++) {
      gridDays.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return gridDays;
  }, [currentDate]);

  // Navigate dates
  const navigateDate = (dir) => {
    const temp = new Date(currentDate);
    if (currentView === "month") {
      temp.setMonth(temp.getMonth() + dir);
    } else if (currentView === "week") {
      temp.setDate(temp.getDate() + dir * 7);
    } else if (currentView === "day") {
      temp.setDate(temp.getDate() + dir);
    }
    setCurrentDate(temp);
  };

  const setToday = () => {
    setCurrentDate(new Date());
  };

  const headerLabel = useMemo(() => {
    if (currentView === "month") {
      return currentDate.toLocaleString("en-IN", { month: "long", year: "numeric" });
    } else if (currentView === "week") {
      // Find range of week
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString("en-IN", { month: "short", day: "numeric" })} - ${endOfWeek.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}`;
    } else {
      return currentDate.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    }
  }, [currentDate, currentView]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-light-text dark:text-dark-text">Project Calendar</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Schedule site visits, deadlines, client meetings, inspections, and resources.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => openCreateModal(new Date())}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
              >
                <Plus className="h-4.5 w-4.5" />
                Schedule Event
              </button>
            )}
          </div>
        </div>

        {/* Workspace Split */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          
          {/* Filters Sidebar */}
          <div className="space-y-6">
            
            {/* Calendar Event Filters */}
            <div className="rounded-2xl border border-light-border bg-light-card p-5 shadow-sm dark:border-dark-border dark:bg-dark-card">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filters
              </h3>

              {/* Event types */}
              <div className="space-y-3.5">
                <p className="text-xs font-semibold text-gray-500 uppercase">Event Types</p>
                <div className="space-y-2">
                  {Object.entries(EVENT_TYPES).map(([key, config]) => {
                    const isSelected = selectedTypes.includes(key);
                    return (
                      <label key={key} className="flex items-center gap-2.5 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedTypes(prev => 
                              prev.includes(key) ? prev.filter(t => t !== key) : [...prev, key]
                            );
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        <span className={`h-2.5 w-2.5 rounded-full ${config.dot}`}></span>
                        <span className="text-light-text dark:text-dark-text opacity-90">{config.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Engineers */}
              <div className="mt-6 pt-6 border-t border-light-border dark:border-dark-border space-y-3.5">
                <p className="text-xs font-semibold text-gray-500 uppercase">Engineers Filter</p>
                {engineers.length === 0 ? (
                  <p className="text-xs text-gray-400">Loading resources...</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {engineers.map(eng => {
                      const isSelected = selectedEngineerIds.includes(eng._id);
                      return (
                        <label key={eng._id} className="flex items-center gap-2.5 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedEngineerIds(prev => 
                                prev.includes(eng._id) ? prev.filter(id => id !== eng._id) : [...prev, eng._id]
                              );
                            }}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          />
                          <span className="text-light-text dark:text-dark-text opacity-90">{eng.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Availability tracker */}
            <div className="rounded-2xl border border-light-border bg-light-card p-5 shadow-sm dark:border-dark-border dark:bg-dark-card">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Availability Today</h3>
              <div className="space-y-3.5">
                {engineers.length === 0 ? (
                  <p className="text-xs text-gray-400">Loading tracker...</p>
                ) : (
                  engineerAvailability.map(eng => (
                    <div key={eng._id} className="flex items-center justify-between text-sm">
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-light-text dark:text-dark-text truncate">{eng.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {eng.busy 
                            ? `Busy: ${eng.currentEvents.map(e => e.title).join(", ")}`
                            : "Available today"}
                        </p>
                      </div>
                      <span className={`shrink-0 h-2 w-2 rounded-full ${eng.busy ? "bg-rose-500 animate-pulse" : "bg-emerald-500"}`}></span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Calendar View Area */}
          <div className="lg:col-span-3 rounded-2xl border border-light-border bg-light-card shadow-sm dark:border-dark-border dark:bg-dark-card overflow-hidden flex flex-col">
            
            {/* View navigation headers */}
            <div className="p-4 border-b border-light-border dark:border-dark-border flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-gray-50/50 dark:bg-slate-900/20">
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateDate(-1)}
                  className="p-2 rounded-lg border border-light-border bg-light-bg text-gray-600 hover:bg-gray-50 dark:border-dark-border dark:bg-dark-bg dark:text-gray-300 dark:hover:bg-slate-800 transition"
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>
                
                <h2 className="text-lg font-bold text-light-text dark:text-dark-text min-w-[140px] text-center">
                  {headerLabel}
                </h2>

                <button
                  onClick={() => navigateDate(1)}
                  className="p-2 rounded-lg border border-light-border bg-light-bg text-gray-600 hover:bg-gray-50 dark:border-dark-border dark:bg-dark-bg dark:text-gray-300 dark:hover:bg-slate-800 transition"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>

                <button
                  onClick={setToday}
                  className="ml-2 px-3 py-2 text-xs font-semibold rounded-lg border border-light-border bg-light-bg hover:bg-gray-50 dark:border-dark-border dark:bg-dark-bg dark:hover:bg-slate-800 dark:text-gray-300 transition"
                >
                  Today
                </button>
              </div>

              {/* View toggle */}
              <div className="flex rounded-xl bg-gray-100 dark:bg-slate-800 p-1 self-start sm:self-auto">
                {["month", "week", "day", "agenda"].map(view => (
                  <button
                    key={view}
                    onClick={() => setCurrentView(view)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${
                      currentView === view 
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-gray-600 dark:text-gray-400 hover:text-light-text dark:hover:text-white"
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar Core render blocks */}
            <div className="p-4 flex-grow bg-light-bg dark:bg-dark-bg">
              
              {/* MONTH VIEW */}
              {currentView === "month" && (
                <div className="grid grid-cols-7 gap-1 text-center">
                  {/* Day header names */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="text-xs font-bold text-gray-400 py-2">
                      {day}
                    </div>
                  ))}

                  {/* Day cells grid */}
                  {monthDaysGrid.map(({ date, isCurrentMonth }, idx) => {
                    const dateStr = date.toISOString().split("T")[0];
                    const dayEvents = filteredEvents.filter(e => {
                      const eDate = new Date(e.start).toISOString().split("T")[0];
                      return eDate === dateStr;
                    });

                    const isToday = new Date().toDateString() === date.toDateString();

                    return (
                      <div
                        key={idx}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDropOnDay(e, dateStr)}
                        onClick={() => openCreateModal(date)}
                        className={`min-h-[100px] border border-light-border dark:border-dark-border rounded-xl p-1.5 flex flex-col text-left transition select-none ${
                          isCurrentMonth 
                            ? "bg-light-card dark:bg-dark-card hover:border-indigo-500/50" 
                            : "bg-gray-50/40 opacity-40 dark:bg-slate-900/10"
                        } ${isToday ? "ring-2 ring-indigo-500" : ""}`}
                      >
                        {/* Day label number */}
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-bold ${
                            isToday 
                              ? "bg-indigo-600 text-white h-5 w-5 rounded-full flex items-center justify-center" 
                              : "text-gray-500 dark:text-gray-400"
                          }`}>
                            {date.getDate()}
                          </span>
                        </div>

                        {/* List events of the day */}
                        <div className="space-y-1 overflow-y-auto max-h-[80px]">
                          {dayEvents.slice(0, 3).map(ev => {
                            const typeConfig = EVENT_TYPES[ev.eventType] || EVENT_TYPES["support"];
                            return (
                              <div
                                key={ev._id}
                                draggable={isAdmin}
                                onDragStart={(e) => handleDragStart(e, ev._id)}
                                onClick={(e) => {
                                  e.stopPropagation(); // Avoid triggering parent cell click
                                  openEditModal(ev);
                                }}
                                className={`text-[10px] px-2 py-1 rounded border truncate font-medium cursor-pointer transition ${typeConfig.bg} ${typeConfig.text} hover:scale-102`}
                              >
                                {ev.title}
                              </div>
                            );
                          })}
                          {dayEvents.length > 3 && (
                            <p className="text-[9px] text-gray-400 font-semibold pl-1">
                              + {dayEvents.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* WEEK VIEW */}
              {currentView === "week" && (
                <div className="grid grid-cols-7 gap-2">
                  {Array(7).fill(0).map((_, idx) => {
                    const startOfWeek = new Date(currentDate);
                    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + idx);
                    const dateStr = startOfWeek.toISOString().split("T")[0];
                    const dayEvents = filteredEvents.filter(e => 
                      new Date(e.start).toISOString().split("T")[0] === dateStr
                    );

                    const isToday = new Date().toDateString() === startOfWeek.toDateString();

                    return (
                      <div 
                        key={idx}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDropOnDay(e, dateStr)}
                        onClick={() => openCreateModal(startOfWeek)}
                        className={`min-h-[400px] border border-light-border dark:border-dark-border rounded-2xl p-3 flex flex-col text-left transition select-none ${
                          isToday ? "bg-indigo-500/5 ring-1.5 ring-indigo-500" : "bg-light-card dark:bg-dark-card"
                        }`}
                      >
                        {/* Day heading info */}
                        <div className="pb-3 border-b border-light-border dark:border-dark-border mb-3 text-center">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {startOfWeek.toLocaleDateString("en-IN", { weekday: "short" })}
                          </p>
                          <p className={`text-lg font-black mt-1 mx-auto h-7 w-7 rounded-full flex items-center justify-center ${
                            isToday ? "bg-indigo-600 text-white" : "text-light-text dark:text-dark-text"
                          }`}>
                            {startOfWeek.getDate()}
                          </p>
                        </div>

                        {/* Events stack */}
                        <div className="space-y-2 flex-grow overflow-y-auto">
                          {dayEvents.length === 0 ? (
                            <p className="text-[10px] text-gray-400 text-center py-4">No events</p>
                          ) : (
                            dayEvents.map(ev => {
                              const typeConfig = EVENT_TYPES[ev.eventType] || EVENT_TYPES["support"];
                              return (
                                <div
                                  key={ev._id}
                                  draggable={isAdmin}
                                  onDragStart={(e) => handleDragStart(e, ev._id)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(ev);
                                  }}
                                  className={`text-[11px] p-2 rounded-xl border flex flex-col gap-1 cursor-pointer transition ${typeConfig.bg} ${typeConfig.text} hover:scale-102`}
                                >
                                  <span className="font-bold truncate">{ev.title}</span>
                                  <span className="text-[9px] opacity-75 font-mono">
                                    {new Date(ev.start).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* DAY VIEW */}
              {currentView === "day" && (
                <div className="max-w-2xl mx-auto rounded-2xl border border-light-border dark:border-dark-border p-6 bg-light-card dark:bg-dark-card space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-light-border dark:border-dark-border">
                    <span className="text-sm font-bold text-gray-400">Events Scheduled Today</span>
                    <span className="text-xs text-indigo-500 font-semibold">{filteredEvents.filter(e => new Date(e.start).toDateString() === currentDate.toDateString()).length} Total</span>
                  </div>

                  {/* Filter day events */}
                  {(() => {
                    const dateStr = currentDate.toISOString().split("T")[0];
                    const dayEvents = filteredEvents.filter(e => 
                      new Date(e.start).toISOString().split("T")[0] === dateStr
                    );

                    if (dayEvents.length === 0) {
                      return (
                        <div className="py-12 text-center text-gray-400">
                          <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500/50 mb-3" />
                          <p>No calendar bookings scheduled for this date.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="divide-y divide-light-border dark:divide-dark-border">
                        {dayEvents.map(ev => {
                          const typeConfig = EVENT_TYPES[ev.eventType] || EVENT_TYPES["support"];
                          return (
                            <div 
                              key={ev._id}
                              onClick={() => openEditModal(ev)}
                              className="py-4 flex gap-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-slate-900/30 rounded-xl px-2 transition"
                            >
                              <div className="w-20 text-xs font-bold text-gray-400 font-mono flex items-center">
                                {new Date(ev.start).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                              </div>
                              <div className={`flex-1 rounded-xl p-3 border ${typeConfig.bg} ${typeConfig.text}`}>
                                <h4 className="font-bold text-sm text-light-text dark:text-dark-text">{ev.title}</h4>
                                <p className="text-xs opacity-80 mt-1 max-w-lg line-clamp-2">{ev.description || "No description provided."}</p>
                                
                                <div className="mt-3 flex flex-wrap gap-4 text-[10px] font-semibold opacity-75">
                                  {ev.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {ev.location}</span>}
                                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(ev.start).toLocaleTimeString()} - {new Date(ev.end).toLocaleTimeString()}</span>
                                  {ev.engineers?.length > 0 && <span className="flex items-center gap-1"><User className="h-3 w-3" /> {ev.engineers.map(eg => eg.name).join(", ")}</span>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* AGENDA VIEW */}
              {currentView === "agenda" && (
                <div className="max-w-2xl mx-auto space-y-6">
                  {(() => {
                    const sortedUpcoming = [...filteredEvents]
                      .filter(e => new Date(e.start) >= new Date(new Date().setHours(0,0,0,0)))
                      .sort((a,b) => new Date(a.start) - new Date(b.start));

                    if (sortedUpcoming.length === 0) {
                      return (
                        <div className="py-12 text-center text-gray-400 rounded-2xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
                          No upcoming events scheduled.
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Upcoming Agenda</h3>
                        <div className="space-y-3">
                          {sortedUpcoming.map(ev => {
                            const typeConfig = EVENT_TYPES[ev.eventType] || EVENT_TYPES["support"];
                            return (
                              <div
                                key={ev._id}
                                onClick={() => openEditModal(ev)}
                                className={`rounded-2xl border bg-light-card dark:bg-dark-card p-4 shadow-xs hover:shadow-md cursor-pointer transition flex justify-between items-center ${typeConfig.bg}`}
                              >
                                <div className="space-y-1 max-w-lg min-w-0 pr-4">
                                  <div className="flex items-center gap-2">
                                    <span className={`h-2 w-2 rounded-full ${typeConfig.dot}`}></span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{typeConfig.label}</span>
                                  </div>
                                  <h4 className="text-base font-bold text-light-text dark:text-dark-text truncate">{ev.title}</h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{ev.description || "No description provided."}</p>
                                </div>

                                <div className="text-right text-xs font-semibold text-gray-500 whitespace-nowrap">
                                  <p className="font-bold text-light-text dark:text-dark-text">
                                    {new Date(ev.start).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-1 font-mono">
                                    {new Date(ev.start).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border p-6 shadow-2xl space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-light-border dark:border-dark-border">
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text">
                  {editingEvent ? (isAdmin ? "Edit Event" : "Event Details") : "Schedule New Event"}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-light-text dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEvent} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    required
                    disabled={!isAdmin}
                    value={eventForm.title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                    placeholder="E.g. Inspection of site foundation"
                    className="w-full rounded-xl border border-light-border bg-light-card px-3 py-2 text-sm text-light-text outline-none focus:ring-2 focus:ring-indigo-500 dark:border-dark-border dark:bg-dark-card dark:text-dark-text"
                  />
                </div>

                {/* Event Type & Project Split */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Event Type</label>
                    <select
                      disabled={!isAdmin}
                      value={eventForm.eventType}
                      onChange={(e) => handleFormChange("eventType", e.target.value)}
                      className="w-full rounded-xl border border-light-border bg-light-card px-3 py-2 text-sm text-light-text outline-none focus:ring-2 focus:ring-indigo-500 dark:border-dark-border dark:bg-dark-card dark:text-dark-text"
                    >
                      {Object.entries(EVENT_TYPES).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Project</label>
                    <select
                      disabled={!isAdmin}
                      value={eventForm.projectId}
                      onChange={(e) => handleFormChange("projectId", e.target.value)}
                      className="w-full rounded-xl border border-light-border bg-light-card px-3 py-2 text-sm text-light-text outline-none focus:ring-2 focus:ring-indigo-500 dark:border-dark-border dark:bg-dark-card dark:text-dark-text"
                    >
                      <option value="">No Project (General)</option>
                      {projects.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Start Time</label>
                    <input
                      type="datetime-local"
                      required
                      disabled={!isAdmin}
                      value={eventForm.start}
                      onChange={(e) => handleFormChange("start", e.target.value)}
                      className="w-full rounded-xl border border-light-border bg-light-card px-3 py-2 text-sm text-light-text outline-none focus:ring-2 focus:ring-indigo-500 dark:border-dark-border dark:bg-dark-card dark:text-dark-text"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">End Time</label>
                    <input
                      type="datetime-local"
                      required
                      disabled={!isAdmin}
                      value={eventForm.end}
                      onChange={(e) => handleFormChange("end", e.target.value)}
                      className="w-full rounded-xl border border-light-border bg-light-card px-3 py-2 text-sm text-light-text outline-none focus:ring-2 focus:ring-indigo-500 dark:border-dark-border dark:bg-dark-card dark:text-dark-text"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Location</label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={eventForm.location}
                    onChange={(e) => handleFormChange("location", e.target.value)}
                    placeholder="E.g. Room A, or 123 Site St"
                    className="w-full rounded-xl border border-light-border bg-light-card px-3 py-2 text-sm text-light-text outline-none focus:ring-2 focus:ring-indigo-500 dark:border-dark-border dark:bg-dark-card dark:text-dark-text"
                  />
                </div>

                {/* Assigned Engineers checklist */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Assign Engineers</label>
                  {engineers.length === 0 ? (
                    <p className="text-xs text-gray-400">Loading resources...</p>
                  ) : (
                    <div className="max-h-24 overflow-y-auto border border-light-border dark:border-dark-border rounded-xl p-2.5 bg-light-card dark:bg-dark-card space-y-1.5">
                      {engineers.map(eng => {
                        const isAssigned = eventForm.assignedEngineers.includes(eng._id);
                        return (
                          <label key={eng._id} className="flex items-center gap-2 cursor-pointer text-xs">
                            <input
                              type="checkbox"
                              disabled={!isAdmin}
                              checked={isAssigned}
                              onChange={() => {
                                handleFormChange("assignedEngineers", 
                                  isAssigned 
                                    ? eventForm.assignedEngineers.filter(id => id !== eng._id)
                                    : [...eventForm.assignedEngineers, eng._id]
                                );
                              }}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                            />
                            <span className="text-light-text dark:text-dark-text">{eng.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description / Notes</label>
                  <textarea
                    disabled={!isAdmin}
                    value={eventForm.description}
                    onChange={(e) => handleFormChange("description", e.target.value)}
                    placeholder="Add details, instructions, or meeting agenda..."
                    className="w-full rounded-xl border border-light-border bg-light-card px-3 py-2 text-sm text-light-text outline-none focus:ring-2 focus:ring-indigo-500 dark:border-dark-border dark:bg-dark-card dark:text-dark-text h-16 resize-none"
                  />
                </div>

                {/* Real-time Conflict Alert */}
                {isAdmin && formConflictWarning && (
                  <p className="text-xs font-semibold text-amber-500 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {formConflictWarning}
                  </p>
                )}

                {/* Actions */}
                <div className="pt-3 border-t border-light-border dark:border-dark-border flex justify-between gap-3">
                  {editingEvent && isAdmin && (
                    <button
                      type="button"
                      onClick={handleDeleteEvent}
                      className="px-4 py-2 text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/25 rounded-xl transition"
                    >
                      Delete Event
                    </button>
                  )}
                  <div className="flex-1 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-gray-500 border border-light-border dark:border-dark-border rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                    >
                      Cancel
                    </button>
                    {isAdmin && (
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
                      >
                        Save
                      </button>
                    )}
                  </div>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* Conflict Rescheduling Prompt */}
        {conflictModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-amber-500">
                <AlertTriangle className="h-8 w-8 animate-bounce" />
                <h3 className="text-lg font-bold">Scheduling Conflict Detected</h3>
              </div>
              
              <div className="text-sm space-y-2 text-gray-500 dark:text-gray-400">
                <p>
                  You are rescheduling <span className="font-bold text-light-text dark:text-dark-text">"{conflictModal.event.title}"</span>.
                  However, the following engineers are already assigned to overlapping events:
                </p>
                <div className="border border-light-border dark:border-dark-border rounded-xl p-3 bg-gray-50 dark:bg-slate-900 space-y-2">
                  {conflictModal.conflicts.map((c, idx) => (
                    <div key={idx} className="text-xs">
                      <p className="font-bold text-indigo-500">{c.engineers.map(e => e.name).join(", ")}</p>
                      <p className="text-gray-400 mt-0.5">Event: <span className="font-medium text-light-text dark:text-dark-text">"{c.title}"</span></p>
                      <p className="text-gray-400">Project: <span className="font-medium text-light-text dark:text-dark-text">"{c.project?.name || "General"}"</span></p>
                      <p className="text-gray-400 font-mono mt-0.5">
                        Time: {new Date(c.start).toLocaleString("en-IN")} - {new Date(c.end).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="pt-2">Do you want to proceed with the rescheduling anyway?</p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-light-border dark:border-dark-border">
                <button
                  onClick={() => setConflictModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 border border-light-border dark:border-dark-border rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel Drop
                </button>
                <button
                  onClick={confirmReschedule}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
                >
                  Reschedule Anyway
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
