import React from "react";

export default function Input({
  label = "",
  type = "text",
  placeholder = "",
  value,
  onChange,
  className = "",
  error = "",
  required = false,
  ...props
}) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-text-secondary">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-4 py-2.5 rounded-xl border border-border bg-sec-bg text-text-primary placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/45 transition duration-150 text-[15px] ${
          error ? "border-danger focus:ring-danger/45" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-danger font-medium">{error}</p>}
    </div>
  );
}
