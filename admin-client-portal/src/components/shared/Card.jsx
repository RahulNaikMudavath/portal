import React from "react";

export default function Card({
  children,
  title = "",
  subtitle = "",
  icon: Icon = null,
  headerAction = null,
  onClick = null,
  className = "",
  bodyClassName = "",
  hoverable = true,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-border bg-card text-text-primary p-6 shadow-xs transition-all duration-200 ${
        hoverable ? "hover:border-primary/20 hover:shadow-md hover:bg-card-hover/20" : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
      {...props}
    >
      {(title || Icon || headerAction) && (
        <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-4">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-primary" />}
            <div>
              {title && <h4 className="text-[18px] font-semibold text-text-primary">{title}</h4>}
              {subtitle && <p className="text-[12px] text-text-muted mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
