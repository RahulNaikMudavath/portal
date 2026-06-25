import { useEffect, useState } from "react";
import { getAdminAnalytics } from "../../services/analyticsService";

const formatTime = (seconds = 0) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
};

function StatCard({ label, value, icon, tone = "blue" }) {
  const toneStyles = {
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    yellow: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    green: "border-green-500/30 bg-green-500/10 text-green-300",
    red: "border-red-500/30 bg-red-500/10 text-red-300",
    purple: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  };

  return (
    <div
      className={`rounded-2xl border p-5 ${toneStyles[tone]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        </div>

        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

function AnalyticsOverview() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const response = await getAdminAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error("Fetch analytics error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    const interval = setInterval(fetchAnalytics, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-slate-400">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
        <p className="text-red-300">Unable to load analytics.</p>
      </div>
    );
  }

  const { overview, clientWorkload } = analytics;

  return (
    <div className="space-y-6">
      {/* Main task metrics */}
      <section>
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Workspace Analytics
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Live workload and task performance overview.
            </p>
          </div>

          <span className="text-xs text-slate-500">
            Updates every 30 seconds
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Tasks"
            value={overview.totalTasks}
            icon="📋"
            tone="blue"
          />

          <StatCard
            label="Pending"
            value={overview.pendingTasks}
            icon="⏳"
            tone="yellow"
          />

          <StatCard
            label="In Progress"
            value={overview.inProgressTasks}
            icon="⚡"
            tone="purple"
          />

          <StatCard
            label="Completed"
            value={overview.completedTasks}
            icon="✅"
            tone="green"
          />

          <StatCard
            label="Approved"
            value={overview.approvedTasks}
            icon="🎯"
            tone="green"
          />

          <StatCard
            label="Rejected"
            value={overview.rejectedTasks}
            icon="↩️"
            tone="red"
          />

          <StatCard
            label="Overdue"
            value={overview.overdueTasks}
            icon="⚠️"
            tone="red"
          />

          <StatCard
            label="Avg. Completion Time"
            value={formatTime(overview.averageCompletionTime)}
            icon="⏱"
            tone="blue"
          />
        </div>
      </section>

      {/* Client workload */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">
              Client Workload
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Task distribution across assigned clients.
            </p>
          </div>

          <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
            {clientWorkload.length} clients
          </span>
        </div>

        {clientWorkload.length === 0 ? (
          <p className="text-sm text-slate-400">
            No client task assignments yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Pending</th>
                  <th className="pb-3 font-medium">In Progress</th>
                  <th className="pb-3 font-medium">Completed</th>
                  <th className="pb-3 font-medium">Overdue</th>
                </tr>
              </thead>

              <tbody>
                {clientWorkload.map((client) => (
                  <tr
                    key={client.clientId}
                    className="border-b border-slate-800/70 last:border-0"
                  >
                    <td className="py-4">
                      <p className="font-semibold text-white">
                        {client.clientName || "Unnamed client"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {client.email}
                      </p>
                    </td>

                    <td className="py-4 text-slate-200">{client.total}</td>
                    <td className="py-4 text-yellow-300">{client.pending}</td>
                    <td className="py-4 text-blue-300">
                      {client.inProgress}
                    </td>
                    <td className="py-4 text-green-300">
                      {client.completed}
                    </td>
                    <td className="py-4 text-red-300">{client.overdue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AnalyticsOverview;