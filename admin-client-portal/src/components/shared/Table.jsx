import React from "react";
import Button from "./Button";
import { Search } from "lucide-react";

export default function Table({
  headers = [],
  data = [],
  renderRow,
  searchPlaceholder = "Search list...",
  searchQuery = "",
  onSearchChange = null,
  filters = null, // Custom JSX controls
  currentPage = 1,
  totalPages = 1,
  onPageChange = null,
  loading = false,
  emptyMessage = "No records found matching your filters.",
  emptyIcon = null,
  className = "",
  ...props
}) {
  return (
    <div className={`space-y-4 ${className}`} {...props}>
      {/* Top Filter and Search Bar */}
      {(onSearchChange || filters) && (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {onSearchChange && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-placeholder" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-sec-bg text-text-primary placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/45 transition duration-150 text-[15px]"
              />
            </div>
          )}
          {filters && <div className="flex items-center gap-3">{filters}</div>}
        </div>
      )}

      {/* Table Container */}
      <div className="w-full rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-border bg-card-hover/40 text-text-secondary font-bold text-xs uppercase tracking-wider font-sans sticky top-0 z-10 backdrop-blur-md">
                {headers.map((h, idx) => (
                  <th
                    key={idx}
                    className={`p-4 ${
                      h.align === "center"
                        ? "text-center"
                        : h.align === "right"
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                    {typeof h === "string" ? h : h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm text-text-primary">
              {loading ? (
                <tr>
                  <td colSpan={headers.length} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-transparent border-primary border-3" />
                      <span className="text-text-muted text-xs font-semibold">Loading data...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={headers.length} className="p-12 text-center text-text-muted italic">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr
                    key={row._id || row.id || idx}
                    className="hover:bg-card-hover/30 transition-colors duration-150"
                  >
                    {renderRow(row, idx)}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {onPageChange && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-text-muted">
            Page <span className="font-bold text-text-secondary">{currentPage}</span> of{" "}
            <span className="font-bold text-text-secondary">{totalPages}</span>
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage <= 1 || loading}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage >= totalPages || loading}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
