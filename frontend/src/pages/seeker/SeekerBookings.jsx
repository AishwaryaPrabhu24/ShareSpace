
import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
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
  Eye,
  MessageSquare,
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
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  cancelled: "bg-slate-100 text-slate-600",
};

const statusIcons = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
  cancelled: Ban,
};

export default function SeekerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelBooking, setCancelBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/bookings/my");
      setBookings(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load your bookings. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    approved: bookings.filter((b) => b.status === "approved").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  }), [bookings]);

  const filteredBookings = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return bookings
      .filter((booking) => {
        const matchesSearch =
          !search ||
          String(booking.id).includes(search) ||
          String(booking.resource_id).includes(search) ||
          booking.purpose?.toLowerCase().includes(search) ||
          booking.status?.toLowerCase().includes(search);

        const matchesStatus =
          statusFilter === "all" ||
          booking.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort(
        (a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
      );
  }, [bookings, searchTerm, statusFilter]);

  const handleCancel = async () => {
    if (!cancelBooking) return;

    try {
      setCancelling(true);
      setError("");
      setSuccess("");

      await api.patch(
        `/api/bookings/${cancelBooking.id}/cancel`
      );

      setSuccess(`Booking #${cancelBooking.id} was cancelled successfully.`);
      setCancelBooking(null);
      setSelectedBooking(null);

      await fetchBookings();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to cancel this booking."
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
            <CalendarCheck size={18} />
            Booking Management
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Bookings
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track your booking requests and manage your reservations.
          </p>
        </div>

        <button
          onClick={fetchBookings}
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
          title="Total Bookings"
          value={stats.total}
          icon={CalendarCheck}
          color="blue"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Rejected / Cancelled"
          value={stats.rejected + stats.cancelled}
          icon={XCircle}
          color="red"
        />
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
              placeholder="Search booking ID, resource ID or purpose..."
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
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
            {filteredBookings.length}
          </span>{" "}
          of {bookings.length} bookings
        </p>
      </div>

      {/* Booking List */}
      {loading ? (
        <div className="flex min-h-[250px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="mt-4 text-sm text-slate-500">
              Loading your bookings...
            </p>
          </div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">
          <CalendarCheck size={30} className="mx-auto text-slate-300" />
          <h3 className="mt-4 font-semibold text-slate-800">
            No bookings found
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Your bookings will appear here when you make a resource request.
          </p>
          <button
            onClick={() => window.location.assign("/seeker/resources")}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Browse Resources
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const StatusIcon =
              statusIcons[booking.status] || Clock;

            return (
              <div
                key={booking.id}
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
                          Booking #{booking.id}
                        </h3>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            statusStyles[booking.status] ||
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <StatusIcon size={13} />
                          {booking.status}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        Resource ID: {booking.resource_id}
                      </p>

                      <p className="mt-2 text-sm text-slate-700">
                        {booking.purpose}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Eye size={16} />
                      Details
                    </button>

                    {(booking.status === "pending" ||
                      booking.status === "approved") && (
                      <button
                        onClick={() => setCancelBooking(booking)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        <XCircle size={16} />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                  <InfoItem
                    icon={CalendarDays}
                    label="Start"
                    value={formatDateTime(booking.start_time)}
                  />
                  <InfoItem
                    icon={Clock}
                    label="End"
                    value={formatDateTime(booking.end_time)}
                  />
                </div>

                {booking.decision_remarks && (
                  <div className="mt-4 rounded-xl bg-blue-50 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                      <MessageSquare size={14} />
                      Decision Remarks
                    </p>
                    <p className="mt-1 text-sm text-blue-800">
                      {booking.decision_remarks}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <h2 className="text-lg font-bold text-slate-900">
                Booking Details #{selectedBooking.id}
              </h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <Detail label="Resource ID" value={selectedBooking.resource_id} />
              <Detail label="Purpose" value={selectedBooking.purpose} />
              <Detail label="Start Time" value={formatDateTime(selectedBooking.start_time)} />
              <Detail label="End Time" value={formatDateTime(selectedBooking.end_time)} />
              <Detail label="Status" value={selectedBooking.status} />
              <Detail label="Requested On" value={formatDateTime(selectedBooking.created_at)} />
              <Detail
                label="Decision Remarks"
                value={selectedBooking.decision_remarks || "No remarks provided"}
              />
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertCircle size={25} />
            </div>

            <h2 className="mt-4 text-center text-lg font-bold text-slate-900">
              Cancel Booking?
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-slate-500">
              Are you sure you want to cancel booking #{cancelBooking.id}?
              This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setCancelBooking(null)}
                disabled={cancelling}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Keep Booking
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
          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
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

function Detail({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 pb-3 last:border-0">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="break-words text-sm font-semibold capitalize text-slate-800">
        {value}
      </p>
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
