import React from "react";
import Spinner from "./Spinner";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  icon: Icon = null,
  ...props
}) {
  const baseStyle = "inline-flex items-center justify-center font-semibold rounded-xl transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/45 focus:ring-offset-2 dark:focus:ring-offset-background";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs h-9",
    md: "px-5 py-2.5 h-11",
    lg: "px-6 py-3 text-base h-12",
  };

  const variantStyles = {
    primary: "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-sm border border-indigo-500/10",
    secondary: "border border-border bg-transparent text-text-primary hover:bg-card-hover",
    success: "bg-success text-white hover:bg-success/90 shadow-sm",
    danger: "bg-danger text-white hover:bg-danger/90 shadow-sm",
    ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-card-hover",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" className="mr-2" />}
      {!loading && Icon && <Icon className="w-4 h-4 mr-2" />}
      <span>{children}</span>
    </button>
  );
}
