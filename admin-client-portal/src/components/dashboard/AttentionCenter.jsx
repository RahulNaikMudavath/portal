import { useMemo } from "react";

const formatDate = (date) => {
  if (!date) return "No deadline";

  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getPriorityClass = (priority) => {
  if (priority === "high") {
    return "bg-red-500/15 text-red-600 dark:text-red-300";
  }

  if (priority === "low") {
    return "bg-green-500/15 text-green-600 dark:text-green-300";
  }

  return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300";
};

function AttentionItem({ task, type, onOpenTask }) {
  const config = {
    overdue: {
      icon: "⚠️",
      label: "Overdue",
      accent: "border-red-500/30 bg-red-500/5",
      button: "bg-red-600 hover:bg-red-700",
    },
    review: {
      icon: "📥",
      label: "Needs review",
      accent: "border-yellow-500/30 bg-yellow-500/5",
      button: "bg-yellow-600 hover:bg-yellow-700",
    },
    unstarted: {
      icon: "⏳",
      label: "Not started",
      accent: "border-slate-500/30 bg-slate-500/5",
      button: "bg-slate-700 hover:bg-slate-600",
    },
    working: {
      icon: "⚡",
      label: "Working now",
      accent: "border-blue-500/30 bg-blue-500/5",
      button: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const item = config[type];

  return (
    <div
      className={`rounded-xl border p-4 ${item.accent}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg">{item.icon}</span>

            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {item.label}
            </span>

            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${getPriorityClass(
                task.priority || "medium"
              )}`}
            >
              {(task.priority || "medium").toUpperCase()}
            </span>
          </div>

          <h4 className="mt-3 truncate font-semibold text-light-text dark:text-dark-text">
            {task.title}
          </h4>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Client: {task.assignedTo?.name || "Unassigned"}
          </p>

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {type === "review"
              ? `Submitted ${formatDate(task.submittedAt)}`
              : `Deadline: ${formatDate(task.deadline)}`}
          </p>
        </div>

        <button
          onClick={() => onOpenTask(task)}
          className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-white transition ${item.button}`}
        >
          Open
        </button>
      </div>
    </div>
  );
}

function AttentionColumn({ title, icon, count, children, emptyText }) {
  return (
    <div className="rounded-2xl border border-light-border bg-light-card p-4 dark:border-dark-border dark:bg-dark-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-bold text-light-text dark:text-dark-text">
          {icon} {title}
        </h3>

        <span className="rounded-full bg-slate-500/10 px-3 py-1 text-xs font-bold text-gray-600 dark:text-gray-300">
          {count}
        </span>
      </div>

      {count === 0 ? (
        <p className="rounded-xl border border-dashed border-light-border p-4 text-center text-sm text-gray-500 dark:border-dark-border dark:text-gray-400">
          {emptyText}
        </p>
      ) : (
        <div className="max-h-[430px] space-y-3 overflow-y-auto pr-1">
          {children}
        </div>
      )}
    </div>
  );
}

function AttentionCenter({ tasks, onOpenTask }) {
  const attentionData = useMemo(() => {
    const now = Date.now();

    const overdue = tasks.filter(
      (task) =>
        task.deadline &&
        new Date(task.deadline).getTime() < now &&
        task.status !== "completed"
    );

    const review = tasks.filter(
      (task) =>
        task.status === "completed" &&
        (task.reviewStatus || "pending") === "pending"
    );

    const unstarted = tasks.filter((task) => task.status === "pending");

    const working = tasks.filter(
      (task) => task.status === "in-progress"
    );

    return {
      overdue,
      review,
      unstarted,
      working,
    };
  }, [tasks]);

  const totalAttention =
    attentionData.overdue.length +
    attentionData.review.length +
    attentionData.unstarted.length +
    attentionData.working.length;

  return (
    <section>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
              Attention Center
            </h2>

            {totalAttention > 0 && (
              <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-600 dark:text-red-300">
                {totalAttention} items to track
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            The work that needs your attention right now.
          </p>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Refreshes with dashboard data every 30 sec
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <AttentionColumn
          title="Overdue"
          icon="🔴"
          count={attentionData.overdue.length}
          emptyText="No overdue tasks. Great!"
        >
          {attentionData.overdue.map((task) => (
            <AttentionItem
              key={task._id}
              task={task}
              type="overdue"
              onOpenTask={onOpenTask}
            />
          ))}
        </AttentionColumn>

        <AttentionColumn
          title="Awaiting Review"
          icon="🟡"
          count={attentionData.review.length}
          emptyText="No submissions waiting for review."
        >
          {attentionData.review.map((task) => (
            <AttentionItem
              key={task._id}
              task={task}
              type="review"
              onOpenTask={onOpenTask}
            />
          ))}
        </AttentionColumn>

        <AttentionColumn
          title="Not Started"
          icon="⚪"
          count={attentionData.unstarted.length}
          emptyText="All assigned tasks have started."
        >
          {attentionData.unstarted.map((task) => (
            <AttentionItem
              key={task._id}
              task={task}
              type="unstarted"
              onOpenTask={onOpenTask}
            />
          ))}
        </AttentionColumn>

        <AttentionColumn
          title="Working Now"
          icon="⚡"
          count={attentionData.working.length}
          emptyText="No client is currently working."
        >
          {attentionData.working.map((task) => (
            <AttentionItem
              key={task._id}
              task={task}
              type="working"
              onOpenTask={onOpenTask}
            />
          ))}
        </AttentionColumn>
      </div>
    </section>
  );
}

export default AttentionCenter;