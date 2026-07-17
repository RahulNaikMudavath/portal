import { useEffect, useState, useMemo } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getTasks } from "../../services/taskService";
import { getProjects } from "../../services/projectService";
import { getEngineers } from "../../services/userService";
import { 
  FileText, Download, Printer, Filter, Calendar, 
  User, Briefcase, Award, TrendingUp, DollarSign, CheckCircle2, Star 
} from "lucide-react";

// Format seconds into readable duration
const formatDuration = (totalSeconds) => {
  if (!totalSeconds || totalSeconds <= 0) return "N/A";
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

// Formats date nicely
const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

export default function ReportsCenter() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [reportType, setReportType] = useState("engineer"); // engineer, customer, project, budget, completion, approval
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedEngineerId, setSelectedEngineerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksRes, projectsRes, engineersRes] = await Promise.all([
        getTasks(),
        getProjects(),
        getEngineers()
      ]);
      setTasks(tasksRes.data || []);
      setProjects(projectsRes.data || []);
      setEngineers(engineersRes || []);
    } catch (err) {
      console.error("Reports Center fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter logic applied to tasks and projects depending on report type
  const reportData = useMemo(() => {
    // Basic filter function for tasks
    const filterTask = (t) => {
      // Date Range Filter
      if (startDate) {
        const start = new Date(startDate);
        const taskDate = new Date(t.createdAt);
        if (taskDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        const taskDate = new Date(t.createdAt);
        if (taskDate > end) return false;
      }

      // Engineer Filter
      if (selectedEngineerId) {
        if (!t.assignedTo || t.assignedTo._id !== selectedEngineerId) return false;
      }

      // Customer Filter
      if (customerSearch) {
        const search = customerSearch.toLowerCase();
        const custName = (t.customerName || "").toLowerCase();
        if (!custName.includes(search)) return false;
      }

      // Priority Filter
      if (selectedPriority) {
        if (t.priority !== selectedPriority) return false;
      }

      // Project Filter
      if (selectedProjectId) {
        // Find if this task is linked to selected project in the projects array
        const p = projects.find(proj => proj._id === selectedProjectId);
        if (!p || !(p.tasks || []).some(tid => tid === t._id || tid._id === t._id)) {
          return false;
        }
      }

      return true;
    };

    const filteredTasks = tasks.filter(filterTask);

    // 1. ENGINEER REPORT
    if (reportType === "engineer") {
      return engineers.map(eng => {
        const engTasks = filteredTasks.filter(t => t.assignedTo && t.assignedTo._id === eng._id);
        const assigned = engTasks.length;
        const completed = engTasks.filter(t => t.status === "completed").length;
        
        const completedWithTime = engTasks.filter(t => t.status === "completed" && typeof t.totalTimeSpent === "number" && t.totalTimeSpent > 0);
        const avgCompletionTime = completedWithTime.length > 0
          ? Math.round(completedWithTime.reduce((sum, t) => sum + t.totalTimeSpent, 0) / completedWithTime.length)
          : 0;

        const totalReviews = engTasks.filter(t => t.reviewStatus === "approved" || t.reviewStatus === "rejected").length;
        const approved = engTasks.filter(t => t.reviewStatus === "approved").length;
        const approvalRate = totalReviews > 0 ? Math.round((approved / totalReviews) * 100) : 100;

        const rated = engTasks.filter(t => typeof t.customerSignRating === "number" && t.customerSignRating > 0);
        const avgRating = rated.length > 0 
          ? Number((rated.reduce((sum, t) => sum + t.customerSignRating, 0) / rated.length).toFixed(1))
          : 0;

        return {
          id: eng._id,
          name: eng.name,
          rollNumber: eng.rollNumber || "N/A",
          assigned,
          completed,
          avgCompletionTime,
          approvalRate,
          avgRating
        };
      }).filter(eng => selectedEngineerId ? eng.id === selectedEngineerId : true);
    }

    // 2. CUSTOMER REPORT
    if (reportType === "customer") {
      // Group tasks by customerName
      const groups = {};
      filteredTasks.forEach(t => {
        const cName = t.customerName || "General / Unassigned Customer";
        if (!groups[cName]) {
          groups[cName] = {
            customerName: cName,
            tasksCount: 0,
            completedCount: 0,
            avgRatingSum: 0,
            avgRatingCount: 0,
            taskList: []
          };
        }
        groups[cName].tasksCount += 1;
        if (t.status === "completed") groups[cName].completedCount += 1;
        if (typeof t.customerSignRating === "number" && t.customerSignRating > 0) {
          groups[cName].avgRatingSum += t.customerSignRating;
          groups[cName].avgRatingCount += 1;
        }
        groups[cName].taskList.push(t);
      });

      return Object.values(groups).map(g => ({
        customerName: g.customerName,
        tasksCount: g.tasksCount,
        completedCount: g.completedCount,
        avgRating: g.avgRatingCount > 0 ? Number((g.avgRatingSum / g.avgRatingCount).toFixed(1)) : 0,
        pendingCount: g.tasksCount - g.completedCount
      })).filter(g => customerSearch ? g.customerName.toLowerCase().includes(customerSearch.toLowerCase()) : true);
    }

    // 3. PROJECT REPORT
    if (reportType === "project") {
      return projects.map(p => {
        const pTasks = p.tasks || [];
        const tIds = pTasks.map(t => typeof t === "string" ? t : t._id);
        const matchTasks = filteredTasks.filter(t => tIds.includes(t._id));
        
        const completed = matchTasks.filter(t => t.status === "completed").length;
        const total = matchTasks.length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          id: p._id,
          name: p.name,
          customerName: p.customerName || "N/A",
          budget: p.budget || 0,
          status: p.status || "planning",
          engineersCount: (p.engineers || []).length,
          tasksCount: total,
          completionRate
        };
      }).filter(p => selectedProjectId ? p.id === selectedProjectId : true);
    }

    // 4. BUDGET REPORT
    if (reportType === "budget") {
      return projects.map(p => {
        const pTasks = p.tasks || [];
        const tIds = pTasks.map(t => typeof t === "string" ? t : t._id);
        const matchTasks = filteredTasks.filter(t => tIds.includes(t._id));
        const completed = matchTasks.filter(t => t.status === "completed").length;
        const total = matchTasks.length;
        const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          id: p._id,
          name: p.name,
          customerName: p.customerName || "N/A",
          budget: p.budget || 0,
          progress: progressPercent,
          status: p.status || "planning",
          completedTasks: completed,
          totalTasks: total
        };
      }).filter(p => selectedProjectId ? p.id === selectedProjectId : true);
    }

    // 5. COMPLETION REPORT
    if (reportType === "completion") {
      return filteredTasks.filter(t => t.status === "completed").map(t => {
        const hasDeadline = !!t.deadline;
        const isDelayed = hasDeadline && t.submittedAt && new Date(t.submittedAt) > new Date(t.deadline);
        
        return {
          id: t._id,
          title: t.title,
          engineerName: t.assignedTo?.name || "Unassigned",
          startedAt: t.startedAt ? formatDate(t.startedAt) : "N/A",
          submittedAt: t.submittedAt ? formatDate(t.submittedAt) : "N/A",
          totalTime: t.totalTimeSpent ? formatDuration(t.totalTimeSpent) : "N/A",
          deadline: t.deadline ? formatDate(t.deadline) : "N/A",
          delayed: isDelayed ? "Yes" : "No"
        };
      });
    }

    // 6. APPROVAL REPORT
    if (reportType === "approval") {
      return filteredTasks.filter(t => t.reviewStatus === "approved" || t.reviewStatus === "rejected").map(t => {
        // Find review date from activity log
        const log = (t.activityLog || []).find(l => l.action === "Task Approved" || l.action === "Task Rejected");
        const reviewDate = log ? formatDate(log.createdAt) : formatDate(t.updatedAt);
        const reviewNote = log ? log.remarks : "N/A";

        return {
          id: t._id,
          title: t.title,
          engineerName: t.assignedTo?.name || "Unassigned",
          submittedAt: t.submittedAt ? formatDate(t.submittedAt) : "N/A",
          reviewStatus: t.reviewStatus || "pending",
          reviewerNote: reviewNote || "N/A",
          reviewedAt: reviewDate
        };
      });
    }

    return [];
  }, [tasks, projects, engineers, reportType, startDate, endDate, selectedEngineerId, customerSearch, selectedPriority, selectedProjectId]);

  // Headers for current report table columns
  const tableHeaders = useMemo(() => {
    const headers = {
      engineer: ["Engineer Name", "Employee ID", "Tasks Assigned", "Tasks Completed", "Avg Completion Time", "Approval Rate", "Customer Rating"],
      customer: ["Customer Name", "Total Bookings", "Completed", "Pending", "Avg Rating Score"],
      project: ["Project Title", "Client Name", "Total Budget", "Status", "Engineers Staffed", "Tasks Link", "Progress"],
      budget: ["Project Name", "Client", "Total Budget", "Task Completion Progress", "Status"],
      completion: ["Task Title", "Assigned Engineer", "Started Date", "Submitted Date", "Time Spent", "Deadline", "Delayed?"],
      approval: ["Task Title", "Engineer", "Submitted Date", "Status", "Reviewer Notes", "Reviewed Date"]
    };
    return headers[reportType] || [];
  }, [reportType]);

  // Map report rows for CSV/Excel generation
  const mappedDataRows = useMemo(() => {
    return reportData.map((row) => {
      if (reportType === "engineer") {
        return [row.name, row.rollNumber, row.assigned, row.completed, formatDuration(row.avgCompletionTime), `${row.approvalRate}%`, row.avgRating];
      }
      if (reportType === "customer") {
        return [row.customerName, row.tasksCount, row.completedCount, row.pendingCount, row.avgRating];
      }
      if (reportType === "project") {
        return [row.name, row.customerName, `₹${row.budget.toLocaleString("en-IN")}`, row.status.toUpperCase(), row.engineersCount, row.tasksCount, `${row.completionRate}%`];
      }
      if (reportType === "budget") {
        return [row.name, row.customerName, `₹${row.budget.toLocaleString("en-IN")}`, `${row.progress}% (${row.completedTasks}/${row.totalTasks})`, row.status.toUpperCase()];
      }
      if (reportType === "completion") {
        return [row.title, row.engineerName, row.startedAt, row.submittedAt, row.totalTime, row.deadline, row.delayed];
      }
      if (reportType === "approval") {
        return [row.title, row.engineerName, row.submittedAt, row.reviewStatus.toUpperCase(), row.reviewerNote, row.reviewedAt];
      }
      return [];
    });
  }, [reportData, reportType]);

  // 📝 Generate CSV Export
  const handleExportCSV = () => {
    let csvContent = "";
    
    // Header Row
    csvContent += tableHeaders.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\r\n";
    
    // Data Rows
    mappedDataRows.forEach(row => {
      csvContent += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",") + "\r\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${reportType}_report_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 📊 Generate Excel XML (Styled Excel Workbook Export)
  const handleExportExcel = () => {
    let excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${reportType.toUpperCase()} REPORT</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #6366F1; color: #FFFFFF; font-weight: bold; border: 1px solid #E2E8F0; padding: 6px; }
          td { border: 1px solid #E2E8F0; padding: 6px; font-family: sans-serif; font-size: 10pt; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${tableHeaders.map(h => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${mappedDataRows.map(row => `
              <tr>
                ${row.map(cell => `<td>${cell}</td>`).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelTemplate], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${reportType}_report_${Date.now()}.xls`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🖨️ PDF Printing (Native iframe scoped print layout)
  const handleExportPDF = () => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
      <head>
        <title>Enterprise Performance Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #1F2937; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #E5E7EB; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 800; color: #4F46E5; }
          .title { font-size: 20px; font-weight: 700; text-transform: uppercase; margin-top: 5px; }
          .meta { font-size: 11px; text-align: right; color: #6B7280; line-height: 1.5; }
          .filters { background: #F9FAFB; border: 1px solid #E5E7EB; padding: 12px; border-radius: 8px; margin-bottom: 25px; font-size: 12px; }
          .filters span { font-weight: bold; margin-right: 15px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #F3F4F6; color: #374151; font-weight: bold; text-align: left; padding: 10px; border-bottom: 2px solid #D1D5DB; font-size: 12px; }
          td { padding: 10px; border-bottom: 1px solid #E5E7EB; font-size: 11px; color: #4B5563; }
          .signatures { display: flex; justify-content: space-between; margin-top: 60px; font-size: 12px; }
          .sig-line { border-top: 1px solid #9CA3AF; width: 180px; text-align: center; padding-top: 5px; margin-top: 40px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">🚀 WORK MANAGEMENT PORTAL</div>
            <div class="title">${reportType} Performance Report</div>
          </div>
          <div class="meta">
            Date Generated: ${new Date().toLocaleString("en-IN")}<br/>
            Scope: Admin Authorized Center
          </div>
        </div>

        <div class="filters">
          <span>Run Date Scope: ${startDate || "All"} to ${endDate || "All"}</span>
          <span>Records: ${reportData.length}</span>
        </div>

        <table>
          <thead>
            <tr>
              ${tableHeaders.map(h => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${mappedDataRows.map(row => `
              <tr>
                ${row.map(cell => `<td>${cell}</td>`).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-line">Prepared By</div>
          <div class="sig-line">Approved By (Operations)</div>
        </div>
      </body>
      </html>
    `);
    doc.close();

    // Trigger iframe printing once loaded
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 500);
  };

  // Report statistics cards depending on report type
  const reportSummary = useMemo(() => {
    const count = reportData.length;
    
    if (reportType === "engineer") {
      const totalAssigned = reportData.reduce((sum, r) => sum + r.assigned, 0);
      const totalCompleted = reportData.reduce((sum, r) => sum + r.completed, 0);
      const avgRating = reportData.filter(r => r.avgRating > 0).length > 0
        ? Number((reportData.reduce((sum, r) => sum + r.avgRating, 0) / reportData.filter(r => r.avgRating > 0).length).toFixed(1))
        : 0;

      return [
        { label: "Engineers Filtered", value: count, icon: <User className="h-5 w-5" /> },
        { label: "Cumulative Workload", value: `${totalCompleted}/${totalAssigned}`, icon: <Briefcase className="h-5 w-5" /> },
        { label: "Avg Star Rating", value: `${avgRating || "0.0"} / 5.0`, icon: <Star className="h-5 w-5 fill-amber-400 text-amber-400" /> }
      ];
    }

    if (reportType === "customer") {
      const totalBookings = reportData.reduce((sum, r) => sum + r.tasksCount, 0);
      const totalCompleted = reportData.reduce((sum, r) => sum + r.completedCount, 0);
      const avgRating = reportData.filter(r => r.avgRating > 0).length > 0
        ? Number((reportData.reduce((sum, r) => sum + r.avgRating, 0) / reportData.filter(r => r.avgRating > 0).length).toFixed(1))
        : 0;

      return [
        { label: "Customers Filtered", value: count, icon: <User className="h-5 w-5" /> },
        { label: "Total Bookings", value: totalBookings, icon: <Briefcase className="h-5 w-5" /> },
        { label: "Success Rate", value: `${totalBookings > 0 ? Math.round((totalCompleted / totalBookings) * 100) : 0}%`, icon: <CheckCircle2 className="h-5 w-5" /> }
      ];
    }

    if (reportType === "project" || reportType === "budget") {
      const totalProjects = count;
      const budgetSum = reportData.reduce((sum, r) => sum + r.budget, 0);
      const completedProjects = reportData.filter(p => p.status === "completed" || p.completionRate === 100).length;

      return [
        { label: "Projects Active", value: totalProjects, icon: <Briefcase className="h-5 w-5" /> },
        { label: "Cumulative Budget", value: `₹${budgetSum.toLocaleString("en-IN")}`, icon: <DollarSign className="h-5 w-5" /> },
        { label: "Completed Rate", value: `${totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}%`, icon: <CheckCircle2 className="h-5 w-5" /> }
      ];
    }

    if (reportType === "completion") {
      const delayedCount = reportData.filter(r => r.delayed === "Yes").length;
      return [
        { label: "Total Completions", value: count, icon: <CheckCircle2 className="h-5 w-5" /> },
        { label: "Delayed Outflows", value: delayedCount, icon: <AlertTriangle className="h-5 w-5 text-rose-500" /> },
        { label: "On-Time Ratio", value: `${count > 0 ? Math.round(((count - delayedCount) / count) * 100) : 100}%`, icon: <TrendingUp className="h-5 w-5" /> }
      ];
    }

    if (reportType === "approval") {
      const approvedCount = reportData.filter(r => r.reviewStatus === "approved").length;
      const rejectedCount = reportData.filter(r => r.reviewStatus === "rejected").length;

      return [
        { label: "Reviews Evaluated", value: count, icon: <Award className="h-5 w-5" /> },
        { label: "Approved Submissions", value: approvedCount, icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" /> },
        { label: "Approval Ratio", value: `${count > 0 ? Math.round((approvedCount / count) * 100) : 0}%`, icon: <TrendingUp className="h-5 w-5" /> }
      ];
    }

    return [];
  }, [reportData, reportType]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-light-text dark:text-dark-text">Reports Center</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Compile field inspections, deadlines, budgets, and engineer metrics.
            </p>
          </div>
        </div>

        {/* Workspace Split Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          
          {/* Filters Panel */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-light-border bg-light-card p-5 shadow-sm dark:border-dark-border dark:bg-dark-card space-y-5">
              
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Filter className="h-4.5 w-4.5" /> Filter Controls
              </h3>

              {/* Report Model Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => {
                    setReportType(e.target.value);
                  }}
                  className="w-full rounded-xl border border-light-border bg-light-bg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-dark-border dark:bg-dark-bg text-light-text dark:text-dark-text font-medium"
                >
                  <option value="engineer">Engineer Performance</option>
                  <option value="customer">Customer Service Reports</option>
                  <option value="project">Project Progress Summary</option>
                  <option value="budget">Financial Budget Audits</option>
                  <option value="completion">Task Completion Logs</option>
                  <option value="approval">Review Approval Statuses</option>
                </select>
              </div>

              {/* Date Filters */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Date Range</p>
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-400 font-semibold mb-0.5">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-xl border border-light-border bg-light-bg px-3 py-2 text-xs text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-indigo-500 dark:border-dark-border dark:bg-dark-bg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 font-semibold mb-0.5">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-xl border border-light-border bg-light-bg px-3 py-2 text-xs text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-indigo-500 dark:border-dark-border dark:bg-dark-bg"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="space-y-4 pt-4 border-t border-light-border dark:border-dark-border">
                <p className="text-xs font-semibold text-gray-500 uppercase">Advanced Filters</p>
                
                {/* Engineer multi-select equivalent */}
                <div>
                  <label className="block text-[10px] text-gray-400 font-semibold mb-1">Assigned Engineer</label>
                  <select
                    value={selectedEngineerId}
                    onChange={(e) => setSelectedEngineerId(e.target.value)}
                    className="w-full rounded-xl border border-light-border bg-light-bg px-3 py-2 text-xs text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-indigo-500 dark:border-dark-border dark:bg-dark-bg"
                  >
                    <option value="">All Engineers</option>
                    {engineers.map(e => (
                      <option key={e._id} value={e._id}>{e.name}</option>
                    ))}
                  </select>
                </div>

                {/* Customer Search input */}
                <div>
                  <label className="block text-[10px] text-gray-400 font-semibold mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search customer name..."
                    className="w-full rounded-xl border border-light-border bg-light-bg px-3 py-2 text-xs text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-indigo-500 dark:border-dark-border dark:bg-dark-bg"
                  />
                </div>

                {/* Project selector */}
                <div>
                  <label className="block text-[10px] text-gray-400 font-semibold mb-1">Linked Project</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full rounded-xl border border-light-border bg-light-bg px-3 py-2 text-xs text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-indigo-500 dark:border-dark-border dark:bg-dark-bg"
                  >
                    <option value="">All Projects</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Priority Selector */}
                <div>
                  <label className="block text-[10px] text-gray-400 font-semibold mb-1">Task Priority</label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full rounded-xl border border-light-border bg-light-bg px-3 py-2 text-xs text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-indigo-500 dark:border-dark-border dark:bg-dark-bg"
                  >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Reset button */}
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setSelectedEngineerId("");
                  setCustomerSearch("");
                  setSelectedPriority("");
                  setSelectedProjectId("");
                }}
                className="w-full py-2.5 rounded-xl border border-light-border bg-light-bg hover:bg-gray-100 dark:border-dark-border dark:bg-dark-bg dark:hover:bg-slate-800 text-xs font-semibold text-gray-500 dark:text-gray-300 transition"
              >
                Reset Filters
              </button>

            </div>
          </div>

          {/* Report Viewer / Results Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* KPI widgets summarizing the filtered data */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {reportSummary.map((card, idx) => (
                <div 
                  key={idx} 
                  className="rounded-2xl border border-light-border bg-light-card p-5 shadow-xs dark:border-dark-border dark:bg-dark-card flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{card.label}</p>
                    <p className="text-2xl font-black mt-1.5 text-light-text dark:text-dark-text">{card.value}</p>
                  </div>
                  <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-500">
                    {card.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* Document Viewer container */}
            <div className="rounded-2xl border border-light-border bg-light-card shadow-sm dark:border-dark-border dark:bg-dark-card overflow-hidden">
              
              {/* Toolbar */}
              <div className="p-4 border-b border-light-border dark:border-dark-border flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-gray-50/50 dark:bg-slate-900/10">
                <div className="flex items-center gap-2 text-sm font-bold text-light-text dark:text-dark-text">
                  <FileText className="h-4.5 w-4.5 text-indigo-500" />
                  <span>Report Document Preview</span>
                </div>

                {/* Exports options */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-light-border bg-light-bg hover:bg-gray-150 dark:border-dark-border dark:bg-dark-bg text-light-text dark:text-dark-text transition"
                  >
                    <Download className="h-3.5 w-3.5" /> CSV
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-light-border bg-light-bg hover:bg-gray-150 dark:border-dark-border dark:bg-dark-bg text-light-text dark:text-dark-text transition"
                  >
                    <Download className="h-3.5 w-3.5" /> Excel
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
                  >
                    <Printer className="h-3.5 w-3.5" /> Print / PDF
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="p-6 bg-light-bg dark:bg-dark-bg overflow-x-auto min-h-[300px]">
                {loading ? (
                  <div className="flex h-48 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                  </div>
                ) : reportData.length === 0 ? (
                  <div className="py-16 text-center text-gray-500">
                    No matching records found. Try adjusting filter scopes.
                  </div>
                ) : (
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="border-b border-light-border dark:border-dark-border text-xs font-semibold uppercase text-gray-400 tracking-wider">
                      <tr>
                        {tableHeaders.map((header, idx) => (
                          <th key={idx} className="pb-3 pr-4 font-semibold">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-light-border dark:divide-dark-border">
                      {mappedDataRows.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-gray-50/50 dark:hover:bg-slate-900/20">
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className="py-3.5 pr-4 text-light-text dark:text-dark-text font-medium">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
