import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getRecentActivities } from "../../services/taskService";

function Activity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const res = await getRecentActivities();
        setActivities(res.data);
      } catch (error) {
        console.error("Could not load activities:", error);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();

    const interval = setInterval(loadActivities, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AdminLayout>
      <div className="mb-7">
        <h2 className="text-3xl font-bold text-white">Activity Timeline</h2>
        <p className="mt-2 text-slate-400">
          Track every important action across your workspace.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
          Loading activity...
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
          No activity has been recorded yet.
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="space-y-6">
            {activities.map((activity, index) => (
              <div key={activity._id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-lg">
                    {getActivityIcon(activity.action)}
                  </div>

                  {index !== activities.length - 1 && (
                    <div className="mt-2 min-h-10 flex-1 w-px bg-slate-700" />
                  )}
                </div>

                <div className="pb-2">
                  <p className="font-semibold text-white">
                    {activity.action}
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    {formatActivityTime(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function getActivityIcon(action = "") {
  const lowerAction = action.toLowerCase();

  if (lowerAction.includes("created")) return "➕";
  if (lowerAction.includes("started")) return "▶️";
  if (lowerAction.includes("submitted")) return "📤";
  if (lowerAction.includes("approved")) return "✅";
  if (lowerAction.includes("rejected")) return "↩️";

  return "•";
}

function formatActivityTime(dateValue) {
  if (!dateValue) return "";

  return new Date(dateValue).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default Activity;