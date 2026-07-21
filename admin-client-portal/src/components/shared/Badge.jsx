import React from "react";

export default function Badge({
  children,
  status = "info", // success, warning, danger, info, or exact statuses
  className = "",
  ...props
}) {
  const normStatus = String(status).toLowerCase().trim();

  const statusColors = {
    // Green (Success)
    success: "bg-success/10 text-success border border-success/20",
    approved: "bg-success/10 text-success border border-success/20",
    completed: "bg-success/10 text-success border border-success/20",
    available: "bg-success/10 text-success border border-success/20",

    // Orange/Yellow (Warning)
    warning: "bg-warning/10 text-warning border border-warning/20",
    pending: "bg-warning/10 text-warning border border-warning/20",
    "in progress": "bg-warning/10 text-warning border border-warning/20",
    "in-progress": "bg-warning/10 text-warning border border-warning/20",
    working: "bg-warning/10 text-warning border border-warning/20",
    travelling: "bg-warning/10 text-warning border border-warning/20",
    "reached-site": "bg-warning/10 text-warning border border-warning/20",
    inspection: "bg-warning/10 text-warning border border-warning/20",

    // Red (Danger)
    danger: "bg-danger/10 text-danger border border-danger/20",
    rejected: "bg-danger/10 text-danger border border-danger/20",
    rework: "bg-danger/10 text-danger border border-danger/20",
    cancelled: "bg-danger/10 text-danger border border-danger/20",
    busy: "bg-danger/10 text-danger border border-danger/20",
    "on-leave": "bg-danger/10 text-danger border border-danger/20",

    // Blue/Indigo (Info/Category)
    info: "bg-info/10 text-info border border-info/20",
    field: "bg-info/10 text-info border border-info/20",
    office: "bg-info/10 text-info border border-info/20",
    client: "bg-info/10 text-info border border-info/20",
    admin: "bg-primary/10 text-primary border border-primary/20",
  };

  const colorStyle = statusColors[normStatus] || "bg-primary/10 text-primary border border-primary/20";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${colorStyle} ${className}`}
      {...props}
    >
      {children || status}
    </span>
  );
}
