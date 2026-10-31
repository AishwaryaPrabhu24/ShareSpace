
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Search,
  RefreshCw,
  CalendarDays,
  FileText,
  User,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Filter,
  X,
} from "lucide-react";
import api from "../../services/api";

const severityStyles = {
  low: "bg-blue-50 text-blue-700 border-blue-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  critical: "bg-red-50 text-red-700 border-red-200",
};

const statusStyles = {
  open: "bg-red-50 text-red-700 border-red-200",
  investigating: "bg-amber-50 text-amber-700 border-amber-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-slate-100 text-slate-600 border-slate-200",
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

export default function OwnerIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [resolutionRemarks, setResolutionRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [incidentResponse, bookingResponse, resourceResponse] =
        await Promise.all([
          api.get("/api/incidents/"),
          api.get("/api/bookings/my"),
          api.get("/api/resources/my"),
        ]);

      setIncidents(incidentResponse.data);
      setBookings(bookingResponse.data);
      setResources(resourceResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load incidents. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const bookingMap = useMemo(
    () => new Map(bookings.map((booking) => [booking.id, booking])),
    [bookings]
  );

  const resourceMap = useMemo(
    () => new Map(resources.map((resource) => [resource.id, resource])),
    [resources]
  );

  const getResource = (incident) => {
    if (!incident.booking_id) return null;

    const booking = bookingMap.get(incident.booking_id);

    return booking ? resourceMap.get(booking.resource_id) : null;
  };

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const resource = getResource(incident);
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        String(incident.id).includes(query) ||
        String(incident.booking_id || "").includes(query) ||
        String(incident.reported_by).includes(query) ||
        incident.title.toLowerCase().includes(query) ||
        incident.description.toLowerCase().includes(query) ||
        resource?.name?.toLowerCase().includes(query);

      const matchesSeverity =
        severityFilter === "all" ||
        incident.severity === severityFilter;

      const matchesStatus =
        statusFilter === "all" ||
        incident.status === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [
    incidents,
    search,
    severityFilter,
    statusFilter,
    bookingMap,
    resourceMap,
  ]);

  const counts = {
    total: incidents.length,
    open: incidents.filter((item) => item.status === "open").length,
    investigating: incidents.filter(
      (item) => item.status === "investigating"
    ).length,
    resolved: incidents.filter((item) => item.status === "resolved").length,
  };

  const openUpdateModal = (incident) => {
    setSelectedIncident(incident);
    setNewStatus(incident.status);
    setResolutionRemarks(incident.resolution_remarks || "");
    setError("");
    setSuccess("");
  };

  const closeUpdateModal = () => {
    if (saving) return;

    setSelectedIncident(null);
    setNewStatus("");
    setResolutionRemarks("");
  };

  const updateIncident = async (event) => {
    event.preventDefault();

    if (!selectedIncident || !newStatus) return;

    try {
      setSaving(true);
      setError("");

      const response = await api.patch(
        `/api/incidents/${selectedIncident.id}`,
        {
          status: newStatus,
          resolution_remarks: resolutionRemarks.trim() || null,
        }
      );

      setIncidents((previous) =>
        previous.map((incident) =>
          incident.id === selectedIncident.id
            ? response.data
            : incident
        )
      );

      setSuccess(`Incident #${selectedIncident.id} updated successfully.`);
      setSelectedIncident(null);
      setNewStatus("");
      setResolutionRemarks("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to update incident. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading incidents...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <AlertTriangle size={17} />
            Owner Workspace
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Incident Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor equipment incidents and manage their resolution.
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

      {/* Messages */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Incidents"
          value={counts.total}
          icon={ShieldAlert}
          color="blue"
        />
        <SummaryCard
          title="Open"
          value={counts.open}
          icon={AlertTriangle}
          color="red"
        />
        <SummaryCard
          title="Investigating"
          value={counts.investigating}
          icon={Clock}
          color="amber"
        />
        <SummaryCard
          title="Resolved"
          value={counts.resolved}
          icon={CheckCircle2}
          color="emerald"
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
              placeholder="Search incidents..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="relative">
            <Filter
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Incident list */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Incident Records
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {filteredIncidents.length} incident(s) found
          </p>
        </div>

        {filteredIncidents.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <AlertTriangle size={26} />
            </div>
            <h3 className="mt-4 font-semibold text-slate-800">
              No incidents found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Incidents reported against your resources will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredIncidents.map((incident) => {
              const resource = getResource(incident);

              return (
                <div
                  key={incident.id}
                  className="p-5 transition hover:bg-slate-50/70"
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                          Incident #{incident.id}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            severityStyles[incident.severity] ||
                            "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          {formatLabel(incident.severity)} Severity
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            statusStyles[incident.status] ||
                            "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          {formatLabel(incident.status)}
                        </span>
                      </div>

                      <h3 className="mt-3 text-base font-semibold text-slate-900">
                        {incident.title}
                      </h3>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {incident.description}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                        {incident.booking_id && (
                          <span className="inline-flex items-center gap-1.5">
                            <FileText size={15} />
                            Booking #{incident.booking_id}
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1.5">
                          <User size={15} />
                          Reporter ID: {incident.reported_by}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={15} />
                          {formatDate(incident.created_at)} at{" "}
                          {formatTime(incident.created_at)}
                        </span>
                      </div>

                      {resource && (
                        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-400">
                          <Package size={14} />
                          {resource.name} · {resource.location}
                        </p>
                      )}

                      {incident.resolution_remarks && (
                        <div className="mt-4 rounded-xl bg-slate-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Resolution Remarks
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                            {incident.resolution_remarks}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0">
                      <button
                        onClick={() => openUpdateModal(incident)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                      >
                        <FileText size={16} />
                        Update Incident
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Update modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Update Incident
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Incident #{selectedIncident.id}
                </p>
              </div>

              <button
                onClick={closeUpdateModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={updateIncident} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Incident Status
                </label>

                <select
                  value={newStatus}
                  onChange={(event) => setNewStatus(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Resolution Remarks
                </label>

                <textarea
                  value={resolutionRemarks}
                  onChange={(event) =>
                    setResolutionRemarks(event.target.value)
                  }
                  rows={4}
                  maxLength={1000}
                  placeholder="Enter investigation details or resolution remarks..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {resolutionRemarks.length}/1000
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeUpdateModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
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
