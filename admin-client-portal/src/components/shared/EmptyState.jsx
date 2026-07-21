import React from "react";
import Button from "./Button";

export default function EmptyState({
  title = "No items found",
  description = "Get started by creating a new entry.",
  icon: Icon = null,
  actionLabel = "",
  onAction = null,
  className = "",
  ...props
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-border bg-card shadow-xs max-w-lg mx-auto ${className}`}
      {...props}
    >
      {Icon && (
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/5 text-primary mb-5">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-lg font-bold text-text-primary mb-1.5">{title}</h3>
      <p className="text-sm text-text-muted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
