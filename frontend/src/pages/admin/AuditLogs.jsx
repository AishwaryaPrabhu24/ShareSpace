
import { useEffect, useState } from "react";

import {
  Activity,
  Search,
  RefreshCw,
  CalendarDays,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ShieldCheck,
  Filter,
  ClipboardList,
} from "lucide-react";

import api from "../../services/api";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedLog, setExpandedLog] = useState(null);

  const [filters, setFilters] = useState({
    user_id: "",
    action: "",
    entity_type: "",
    start_date: "",
    end_date: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({});

  const fetchAuditLogs = async (activeFilters = {}) => {
    try {
      setLoading(true);
      setError("");

      const params = { skip: 0, limit: 100 };

      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params[key] = value;
        }
      });

      const response = await api.get("/api/audit-logs/", { params });

      setLogs(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      const detail = err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to load audit logs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs(appliedFilters);
  }, [appliedFilters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const applyFilters = (event) => {
    event.preventDefault();

    if (
      filters.start_date &&
      filters.end_date &&
      filters.start_date > filters.end_date
    ) {
      setError("Start date cannot be later than end date.");
      return;
    }

    if (filters.user_id && Number(filters.user_id) < 1) {
      setError("User ID must be a positive number.");
      return;
    }

    setError("");
    setExpandedLog(null);
    setAppliedFilters({ ...filters });
  };

  const resetFilters = () => {
    const emptyFilters = {
      user_id: "",
      action: "",
      entity_type: "",
      start_date: "",
      end_date: "",
    };

    setFilters(emptyFilters);
    setExpandedLog(null);
    setAppliedFilters({});
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "—";

    return new Date(dateValue).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getActionStyle = (action = "") => {
    if (action.includes("CREATED")) {
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    }

    if (action.includes("APPROVED")) {
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
    }

    if (action.includes("REJECTED") || action.includes("DELETED")) {
      return "bg-red-50 text-red-700 ring-1 ring-red-200";
    }

    if (action.includes("CANCELLED")) {
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    }

    return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  };

  const formatLabel = (key) =>
    key.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") return "—";

    if (typeof value === "boolean") return value ? "Yes" : "No";

    if (Array.isArray(value)) {
      return value.length
        ? value.map((item) =>
            typeof item === "object" && item !== null
              ? Object.entries(item)
                  .map(([key, val]) => `${formatLabel(key)}: ${formatValue(val)}`)
                  .join(", ")
              : String(item)
          ).join(" • ")
        : "None";
    }

    if (typeof value === "object") {
      return Object.entries(value)
        .map(([key, val]) => `${formatLabel(key)}: ${formatValue(val)}`)
        .join(" • ");
    }

    return String(value);
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

  return (
    <div className="space-y-7">

      {/* Page Heading */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#142b55] via-blue-800 to-indigo-700 p-6 shadow-lg shadow-blue-900/10 sm:p-8">
        <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 right-36 h-52 w-52 rounded-full bg-blue-300/10" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100">
              <ShieldCheck size={14} />
              Platform Monitoring
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Audit Logs
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-blue-100/80">
              Track and review activities performed across the ShareSpace
              institutional resource sharing platform.
            </p>
          </div>

          <button
            onClick={() => fetchAuditLogs(appliedFilters)}
            disabled={loading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh Logs
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Logs Displayed
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {loading ? "—" : logs.length}
              </h2>
              <p className="mt-2 text-xs text-slate-400">
                Matching activity records
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-4 text-blue-600 transition group-hover:bg-blue-100">
              <Activity size={25} />
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-900/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Record Limit
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                100
              </h2>
              <p className="mt-2 text-xs text-slate-400">
                Maximum records per request
              </p>
            </div>

            <div className="rounded-2xl bg-indigo-50 p-4 text-indigo-600 transition group-hover:bg-indigo-100">
              <ClipboardList size={25} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <form
        onSubmit={applyFilters}
        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
            <Filter size={19} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-800">
              Filter Activity
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Narrow down records using the available filters.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              User ID
            </label>
            <input
              type="number"
              name="user_id"
              min="1"
              value={filters.user_id}
              onChange={handleFilterChange}
              placeholder="Enter user ID"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Action
            </label>
            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className={inputClass}
            >
              <option value="">All actions</option>
              <option value="RESOURCE_CREATED">Resource Created</option>
              <option value="RESOURCE_UPDATED">Resource Updated</option>
              <option value="RESOURCE_DELETED">Resource Deleted</option>
              <option value="BOOKING_CREATED">Booking Created</option>
              <option value="BOOKING_APPROVED">Booking Approved</option>
              <option value="BOOKING_REJECTED">Booking Rejected</option>
              <option value="BOOKING_CANCELLED">Booking Cancelled</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Entity Type
            </label>
            <select
              name="entity_type"
              value={filters.entity_type}
              onChange={handleFilterChange}
              className={inputClass}
            >
              <option value="">All entities</option>
              <option value="Resource">Resource</option>
              <option value="Booking">Booking</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Start Date
            </label>
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              max={filters.end_date || undefined}
              onChange={handleFilterChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              End Date
            </label>
            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              min={filters.start_date || undefined}
              onChange={handleFilterChange}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/25"
          >
            <Search size={16} />
            Apply Filters
          </button>

          <button
            type="button"
            onClick={resetFilters}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
          >
            Reset Filters
          </button>
        </div>
      </form>

      {/* Activity History */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <FileText size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                Activity History
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Select a record to inspect its additional details.
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            {loading ? "Loading..." : `${logs.length} records`}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="animate-spin text-blue-600" size={25} />
            <span className="ml-3 text-sm text-slate-500">
              Loading audit logs...
            </span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FileText size={27} />
            </div>
            <p className="font-semibold text-slate-700">
              No audit logs found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try changing or resetting your filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50/90">
                <tr>
                  {[
                    "Activity",
                    "Performed By",
                    "Entity",
                    "Description",
                    "Date & Time",
                    "Details",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tbody key={log.id} className="contents">
                    <tr className="align-top transition hover:bg-blue-50/30">
                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold ${getActionStyle(
                            log.action || ""
                          )}`}
                        >
                          {(log.action || "UNKNOWN").replaceAll("_", " ")}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2 font-medium text-slate-700">
                          <div className="rounded-lg bg-slate-100 p-1.5 text-slate-500">
                            <User size={14} />
                          </div>
                          User #{log.user_id ?? "—"}
                        </div>
                        <p className="mt-1.5 pl-9 text-xs capitalize text-slate-400">
                          {log.user_role || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-semibold text-slate-700">
                          {log.entity_type || "—"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Record ID: {log.entity_id ?? "—"}
                        </p>
                      </td>

                      <td className="max-w-xs px-5 py-5 leading-relaxed text-slate-600">
                        {log.description || "—"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={14} className="text-blue-500" />
                          {formatDate(log.created_at)}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <button
                          onClick={() =>
                            setExpandedLog(
                              expandedLog === log.id ? null : log.id
                            )
                          }
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                            expandedLog === log.id
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                          }`}
                        >
                          {expandedLog === log.id ? (
                            <>
                              Hide <ChevronUp size={14} />
                            </>
                          ) : (
                            <>
                              View <ChevronDown size={14} />
                            </>
                          )}
                        </button>
                      </td>
                    </tr>

                    {expandedLog === log.id && (
                      <tr className="bg-blue-50/40">
                        <td colSpan={6} className="px-5 py-6 sm:px-7">
                          <div className="mb-5 flex items-center gap-3">
                            <div className="rounded-xl bg-white p-2.5 text-blue-600 shadow-sm">
                              <FileText size={18} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-800">
                                Additional Activity Details
                              </h3>
                              <p className="mt-0.5 text-xs text-slate-500">
                                Information recorded for this activity.
                              </p>
                            </div>
                          </div>

                          {Object.entries(log.details ?? {}).length > 0 ? (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              {Object.entries(log.details).map(([key, value]) => (
                                <div
                                  key={key}
                                  className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm"
                                >
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    {formatLabel(key)}
                                  </p>
                                  <p className="mt-2 break-words text-sm font-semibold text-slate-800">
                                    {formatValue(value)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                              No additional details available for this activity.
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuditLogs;
