
import { useEffect, useMemo, useState } from "react";
import {
  ListOrdered,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  Search,
  RefreshCw,
  CalendarDays,
  Package,
  AlertCircle,
  X,
  MapPin,
} from "lucide-react";
import api from "../../services/api";

const formatDateTime = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusStyles = {
  waiting: "bg-amber-50 text-amber-700",
  promoted: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-slate-100 text-slate-600",
  skipped: "bg-red-50 text-red-700",
};

const statusIcons = {
  waiting: Clock,
  promoted: CheckCircle2,
  cancelled: Ban,
  skipped: XCircle,
};

export default function SeekerWaitingList() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cancelEntry, setCancelEntry] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/waiting-list/my");
      setEntries(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load your waiting-list requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const stats = useMemo(() => ({
    total: entries.length,
    waiting: entries.filter((e) => e.status === "waiting").length,
    promoted: entries.filter((e) => e.status === "promoted").length,
    completed: entries.filter(
      (e) => ["cancelled", "skipped"].includes(e.status)
    ).length,
  }), [entries]);

  const filteredEntries = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return entries
      .filter((entry) => {
        const matchesSearch =
          !search ||
          String(entry.id).includes(search) ||
          String(entry.resource_id).includes(search) ||
          entry.purpose?.toLowerCase().includes(search) ||
          entry.status?.toLowerCase().includes(search);

        const matchesStatus =
          statusFilter === "all" ||
          entry.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort(
        (a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
      );
  }, [entries, searchTerm, statusFilter]);

  const handleCancel = async () => {
    if (!cancelEntry) return;

    try {
      setCancelling(true);
      setError("");
      setSuccess("");

      await api.patch(
        `/api/waiting-list/${cancelEntry.id}/cancel`
      );

      setSuccess(
        `Waiting-list request #${cancelEntry.id} cancelled successfully.`
      );

      setCancelEntry(null);
      await fetchEntries();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to cancel this waiting-list request."
      );
    } finally {
      setCancelling(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-7">

      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <ListOrdered size={18} />
            Queue Management
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Waiting List
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track your queue position and waiting-list requests.
          </p>
        </div>

        <button
          onClick={fetchEntries}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Feedback */}
      {error && (
        <Feedback
          type="error"
          message={error}
          onClose={() => setError("")}
        />
      )}

      {success && (
        <Feedback
          type="success"
          message={success}
          onClose={() => setSuccess("")}
        />
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Requests"
          value={stats.total}
          icon={ListOrdered}
          color="blue"
        />
        <StatCard
          title="Currently Waiting"
          value={stats.waiting}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Promoted"
          value={stats.promoted}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Cancelled / Skipped"
          value={stats.completed}
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Queue Information */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <div className="rounded-xl bg-white p-2 text-blue-600">
          <AlertCircle size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-blue-900">
            How the waiting list works
          </h3>
          <p className="mt-1 text-sm leading-6 text-blue-800">
            When a booking is cancelled, the system checks eligible waiting
            requests for the same resource and time slot. If a request can
            be promoted, a booking is automatically created for that seeker.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="relative md:col-span-7">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search request ID, resource ID or purpose..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            >
              <option value="all">All Statuses</option>
              <option value="waiting">Waiting</option>
              <option value="promoted">Promoted</option>
              <option value="cancelled">Cancelled</option>
              <option value="skipped">Skipped</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              onClick={clearFilters}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-800">
            {filteredEntries.length}
          </span>{" "}
          of {entries.length} requests
        </p>
      </div>

      {/* Waiting List Entries */}
      {loading ? (
        <div className="flex min-h-[250px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="mt-4 text-sm text-slate-500">
              Loading waiting-list requests...
            </p>
          </div>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">
          <ListOrdered size={30} className="mx-auto text-slate-300" />

          <h3 className="mt-4 font-semibold text-slate-800">
            No waiting-list requests found
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Requests you join will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const StatusIcon =
              statusIcons[entry.status] || Clock;

            return (
              <div
                key={entry.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Package size={23} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900">
                          Request #{entry.id}
                        </h3>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            statusStyles[entry.status] ||
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <StatusIcon size={13} />
                          {entry.status}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        Resource ID: {entry.resource_id}
                      </p>

                      <p className="mt-2 text-sm text-slate-700">
                        {entry.purpose}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {entry.status === "waiting" && (
                      <>
                        <div className="rounded-xl bg-amber-50 px-4 py-2 text-center">
                          <p className="text-[11px] font-medium text-amber-700">
                            Queue Position
                          </p>
                          <p className="text-xl font-bold text-amber-800">
                            #{entry.position}
                          </p>
                        </div>

                        <button
                          onClick={() => setCancelEntry(entry)}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          <XCircle size={16} />
                          Cancel
                        </button>
                      </>
                    )}

                    {entry.status === "promoted" && (
                      <div className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                        Booking Created
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                  <InfoItem
                    icon={CalendarDays}
                    label="Start Time"
                    value={formatDateTime(entry.start_time)}
                  />
                  <InfoItem
                    icon={Clock}
                    label="End Time"
                    value={formatDateTime(entry.end_time)}
                  />
                  <InfoItem
                    icon={MapPin}
                    label="Queue Position"
                    value={
                      entry.status === "waiting"
                        ? `Position ${entry.position}`
                        : "Not currently waiting"
                    }
                  />
                  <InfoItem
                    icon={CalendarDays}
                    label="Requested On"
                    value={formatDateTime(entry.created_at)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertCircle size={25} />
            </div>

            <h2 className="mt-4 text-center text-lg font-bold text-slate-900">
              Cancel Waiting Request?
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-slate-500">
              Are you sure you want to cancel request #{cancelEntry.id}?
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setCancelEntry(null)}
                disabled={cancelling}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Keep Request
              </button>

              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const styles = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${styles[color]}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon size={16} className="mt-0.5 shrink-0 text-slate-400" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="mt-0.5 font-medium text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function Feedback({ type, message, onClose }) {
  const isError = type === "error";

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
        isError
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
      <p className="flex-1">{message}</p>
      <button onClick={onClose} aria-label="Dismiss message">
        <X size={17} />
      </button>
    </div>
  );
}
