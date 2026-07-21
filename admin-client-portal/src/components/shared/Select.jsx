import React from "react";

export default function Select({
  label = "",
  options = [],
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
      <select
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-4 py-2.5 rounded-xl border border-border bg-sec-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/45 transition duration-150 text-[15px] cursor-pointer ${
          error ? "border-danger focus:ring-danger/45" : ""
        } ${className}`}
        {...props}
      >
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-danger font-medium">{error}</p>}
    </div>
  );
}
