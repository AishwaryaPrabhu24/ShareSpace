
import { useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  Search,
  RefreshCw,
  CalendarDays,
  Package,
  User,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";
import api from "../../services/api";

const conditionStyles = {
  excellent: "bg-emerald-50 text-emerald-700 border-emerald-200",
  good: "bg-green-50 text-green-700 border-green-200",
  fair: "bg-amber-50 text-amber-700 border-amber-200",
  damaged: "bg-orange-50 text-orange-700 border-orange-200",
  non_functional: "bg-red-50 text-red-700 border-red-200",
};

const formatLabel = (value = "") =>
  value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function OwnerConditionReports() {
  const [reports, setReports] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [reportResponse, bookingResponse, resourceResponse] =
        await Promise.all([
          api.get("/api/condition-reports/owner"),
          api.get("/api/bookings/my"),
          api.get("/api/resources/my"),
        ]);

      setReports(reportResponse.data);
      setBookings(bookingResponse.data);
      setResources(resourceResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load condition reports. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resourceMap = useMemo(
    () => new Map(resources.map((resource) => [resource.id, resource])),
    [resources]
  );

  const bookingMap = useMemo(
    () => new Map(bookings.map((booking) => [booking.id, booking])),
    [bookings]
  );

  const getResource = (report) => {
    const booking = bookingMap.get(report.booking_id);
    return booking ? resourceMap.get(booking.resource_id) : null;
  };

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const resource = getResource(report);
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        String(report.id).includes(query) ||
        String(report.booking_id).includes(query) ||
        String(report.reported_by).includes(query) ||
        resource?.name?.toLowerCase().includes(query) ||
        resource?.category?.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "all" || report.report_type === typeFilter;

      const matchesCondition =
        conditionFilter === "all" ||
        report.condition_status === conditionFilter;

      return matchesSearch && matchesType && matchesCondition;
    });
  }, [reports, search, typeFilter, conditionFilter, bookingMap, resourceMap]);

  const checkInCount = reports.filter(
    (report) => report.report_type === "check_in"
  ).length;

  const checkOutCount = reports.filter(
    (report) => report.report_type === "check_out"
  ).length;

  const issueCount = reports.filter((report) =>
    ["damaged", "non_functional"].includes(report.condition_status)
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading condition reports...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <ClipboardCheck size={17} />
            Owner Workspace
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Condition Reports
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review equipment condition records submitted during check-in and
            check-out.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Reports"
          value={reports.length}
          icon={ClipboardCheck}
          color="blue"
        />
        <SummaryCard
          title="Check-in Reports"
          value={checkInCount}
          icon={Clock}
          color="indigo"
        />
        <SummaryCard
          title="Check-out Reports"
          value={checkOutCount}
          icon={CheckCircle2}
          color="emerald"
        />
        <SummaryCard
          title="Damage Reports"
          value={issueCount}
          icon={AlertCircle}
          color="orange"
        />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search reports, bookings or resources..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="relative">
            <Filter
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="all">All Report Types</option>
              <option value="check_in">Check-in</option>
              <option value="check_out">Check-out</option>
            </select>
          </div>

          <select
            value={conditionFilter}
            onChange={(event) => setConditionFilter(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Conditions</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="damaged">Damaged</option>
            <option value="non_functional">Non-functional</option>
          </select>
        </div>
      </div>

      {/* Reports */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Condition Report History
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {filteredReports.length} report(s) found
            </p>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ClipboardCheck size={26} />
            </div>
            <h3 className="mt-4 font-semibold text-slate-800">
              No condition reports found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Reports submitted for your resources will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReports.map((report) => {
              const resource = getResource(report);
              const booking = bookingMap.get(report.booking_id);

              return (
                <div
                  key={report.id}
                  className="p-5 transition hover:bg-slate-50/70"
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            report.report_type === "check_in"
                              ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {formatLabel(report.report_type)}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            conditionStyles[report.condition_status] ||
                            "border-slate-200 bg-slate-50 text-slate-700"
                          }`}
                        >
                          {formatLabel(report.condition_status)}
                        </span>
                      </div>

                      <h3 className="mt-3 text-base font-semibold text-slate-900">
                        {resource?.name || `Resource for Booking #${report.booking_id}`}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <FileText size={15} />
                          Report #{report.id}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <Package size={15} />
                          Booking #{report.booking_id}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <User size={15} />
                          Seeker ID: {report.reported_by}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={15} />
                          {formatDate(report.created_at)} at{" "}
                          {formatTime(report.created_at)}
                        </span>
                      </div>

                      {resource && (
                        <p className="mt-2 text-xs text-slate-400">
                          {resource.category} · {resource.location}
                        </p>
                      )}

                      {booking?.purpose && (
                        <p className="mt-2 text-sm text-slate-600">
                          <span className="font-medium text-slate-700">
                            Booking purpose:
                          </span>{" "}
                          {booking.purpose}
                        </p>
                      )}

                      {report.remarks && (
                        <div className="mt-4 rounded-xl bg-slate-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Remarks
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                            {report.remarks}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={`rounded-xl p-2.5 ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}
