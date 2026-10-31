
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  ClipboardList,
  Package,
  AlertCircle,
  MapPin,
  Check,
  X,
  MessageSquare,
} from "lucide-react";

import api from "../../services/api";

function SummaryCard({ title, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">
            {value}
          </h3>
        </div>

        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return "Not specified";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "Not specified";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatus(status) {
  if (!status) return "Unknown";

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [processingId, setProcessingId] = useState(null);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [decisionRemarks, setDecisionRemarks] = useState("");
  const [decisionAction, setDecisionAction] = useState("");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [bookingResponse, resourceResponse] = await Promise.all([
        api.get("/api/bookings/my"),
        api.get("/api/resources/my"),
      ]);

      setBookings(bookingResponse.data);
      setResources(resourceResponse.data);
    } catch (err) {
      const detail = err.response?.data?.detail;

      setError(
        Array.isArray(detail)
          ? detail.map((item) => item.msg).join(", ")
          : detail || "Unable to load booking requests. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Map resource IDs to their names.
  const resourceMap = useMemo(() => {
    return new Map(
      resources.map((resource) => [resource.id, resource])
    );
  }, [resources]);

  const getResourceName = (resourceId) => {
    return resourceMap.get(resourceId)?.name || `Resource #${resourceId}`;
  };

  // Booking summary statistics.
  const pendingCount = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const approvedCount = bookings.filter(
    (booking) => booking.status === "approved"
  ).length;

  const rejectedCount = bookings.filter(
    (booking) => booking.status === "rejected"
  ).length;

  const cancelledCount = bookings.filter(
    (booking) => booking.status === "cancelled"
  ).length;

  // Search and status filtering.
  const filteredBookings = useMemo(() => {
    const searchText = search.toLowerCase();

    return bookings
      .filter((booking) => {
        const resourceName = getResourceName(booking.resource_id);

        const matchesSearch =
          String(booking.id).includes(searchText) ||
          String(booking.resource_id).includes(searchText) ||
          resourceName.toLowerCase().includes(searchText) ||
          (booking.purpose || "").toLowerCase().includes(searchText);

        const matchesStatus =
          statusFilter === "All" || booking.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort(
        (a, b) =>
          new Date(b.created_at || b.start_time) -
          new Date(a.created_at || a.start_time)
      );
  }, [bookings, search, statusFilter, resourceMap]);

  // Open the approval/rejection confirmation modal.
  const openDecisionModal = (booking, action) => {
    setSelectedBooking(booking);
    setDecisionAction(action);
    setDecisionRemarks("");
    setError("");
    setSuccess("");
  };

  const closeDecisionModal = () => {
    if (processingId !== null) return;

    setSelectedBooking(null);
    setDecisionAction("");
    setDecisionRemarks("");
  };

  // Approve or reject a booking.
  const handleDecision = async (event) => {
    event.preventDefault();

    if (!selectedBooking || !decisionAction) return;

    setProcessingId(selectedBooking.id);
    setError("");
    setSuccess("");

    try {
      await api.put(
        `/api/bookings/${selectedBooking.id}/decision`,
        {
          status: decisionAction,
          decision_remarks: decisionRemarks.trim() || null,
        }
      );

      setSuccess(
        `Booking #${selectedBooking.id} ${
          decisionAction === "approved" ? "approved" : "rejected"
        } successfully.`
      );

      setSelectedBooking(null);
      setDecisionAction("");
      setDecisionRemarks("");

      await fetchBookings();
    } catch (err) {
      const detail = err.response?.data?.detail;

      setError(
        Array.isArray(detail)
          ? detail.map((item) => item.msg).join(", ")
          : detail || "Unable to process this booking. Please try again."
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1746a2] via-[#2563eb] to-[#4f46e5] p-6 text-white shadow-lg shadow-blue-200 sm:p-8">
        <div className="absolute -right-12 -top-24 h-64 w-64 rounded-full border-[30px] border-white/10" />
        <div className="absolute -bottom-24 right-40 h-52 w-52 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-50">
              <CalendarDays size={14} />
              Owner Workspace
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Booking Management
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-blue-100 sm:text-base">
              Review booking requests for your resources, approve reservations,
              and manage their booking status from one place.
            </p>

            <button
              onClick={fetchBookings}
              disabled={loading || processingId !== null}
              className="mt-6 flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh Bookings
            </button>
          </div>

          <div className="hidden h-32 w-32 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/10 backdrop-blur-sm md:flex">
            <ClipboardList size={68} strokeWidth={1.3} />
          </div>
        </div>
      </section>

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle size={19} />
          <span className="font-medium">{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Booking Summary */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            Booking Overview
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Summary of booking requests associated with your resources.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Pending Requests"
            value={pendingCount}
            icon={Clock}
            color="bg-amber-50 text-amber-600"
          />

          <SummaryCard
            title="Approved"
            value={approvedCount}
            icon={CheckCircle}
            color="bg-emerald-50 text-emerald-600"
          />

          <SummaryCard
            title="Rejected"
            value={rejectedCount}
            icon={XCircle}
            color="bg-red-50 text-red-600"
          />

          <SummaryCard
            title="Cancelled"
            value={cancelledCount}
            icon={CalendarDays}
            color="bg-slate-100 text-slate-600"
          />
        </div>
      </section>

      {/* Search and Filter */}
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
            <Filter size={19} />
          </div>

          <div>
            <h2 className="font-bold text-slate-800">
              Find Booking Requests
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Search by booking ID, resource or purpose.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-3.5 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search bookings..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
          >
            <option value="All">All Booking Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {(search || statusFilter !== "All") && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Showing {filteredBookings.length} matching booking(s).
            </p>

            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* Bookings List */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <CalendarDays size={20} />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                Booking Requests
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {filteredBookings.length} booking(s) found
              </p>
            </div>
          </div>

          <span className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
            {bookings.length} total bookings
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <RefreshCw size={26} className="animate-spin text-blue-500" />
            <p className="text-sm text-slate-500">
              Loading booking requests...
            </p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
              <CalendarDays size={32} className="text-slate-300" />
            </div>

            <p className="mt-4 font-semibold text-slate-700">
              No bookings found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Booking requests for your resources will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="p-5 transition hover:bg-blue-50/20 sm:p-6"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Package size={23} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-800">
                          {getResourceName(booking.resource_id)}
                        </h3>

                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                          Booking #{booking.id}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        Resource ID: {booking.resource_id} · Seeker ID:{" "}
                        {booking.user_id}
                      </p>

                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays
                            size={16}
                            className="shrink-0 text-blue-500"
                          />
                          <span>
                            {formatDate(booking.start_time)}
                            {" – "}
                            {formatDate(booking.end_time)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock
                            size={16}
                            className="shrink-0 text-blue-500"
                          />
                          <span>
                            {formatTime(booking.start_time)}
                            {" – "}
                            {formatTime(booking.end_time)}
                          </span>
                        </div>
                      </div>

                      {booking.purpose && (
                        <div className="mt-3 flex items-start gap-2 text-sm text-slate-600">
                          <MessageSquare
                            size={15}
                            className="mt-0.5 shrink-0 text-slate-400"
                          />
                          <p className="leading-relaxed">
                            {booking.purpose}
                          </p>
                        </div>
                      )}

                      {booking.decision_remarks && (
                        <div className="mt-3 rounded-xl bg-slate-50 p-3">
                          <p className="text-xs font-semibold text-slate-500">
                            Decision Remarks
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {booking.decision_remarks}
                          </p>
                        </div>
                      )}

                      <p className="mt-3 text-xs text-slate-400">
                        Requested on: {formatDate(booking.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        booking.status === "pending"
                          ? "bg-amber-50 text-amber-700"
                          : booking.status === "approved"
                            ? "bg-emerald-50 text-emerald-700"
                            : booking.status === "rejected"
                              ? "bg-red-50 text-red-700"
                              : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          booking.status === "pending"
                            ? "bg-amber-500"
                            : booking.status === "approved"
                              ? "bg-emerald-500"
                              : booking.status === "rejected"
                                ? "bg-red-500"
                                : "bg-slate-400"
                        }`}
                      />
                      {formatStatus(booking.status)}
                    </span>

                    {booking.status === "pending" && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            openDecisionModal(booking, "approved")
                          }
                          disabled={processingId !== null}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <Check size={14} />
                          Approve
                        </button>

                        <button
                          onClick={() =>
                            openDecisionModal(booking, "rejected")
                          }
                          disabled={processingId !== null}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          <X size={14} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Approve / Reject Confirmation Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div
              className={`px-6 py-6 text-white ${
                decisionAction === "approved"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600"
                  : "bg-gradient-to-r from-red-600 to-rose-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-2 text-xs font-medium text-white/80">
                    Booking Decision
                  </p>

                  <h2 className="text-xl font-bold">
                    {decisionAction === "approved"
                      ? "Approve Booking"
                      : "Reject Booking"}
                  </h2>

                  <p className="mt-1 text-sm text-white/80">
                    Booking #{selectedBooking.id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeDecisionModal}
                  disabled={processingId !== null}
                  className="rounded-xl bg-white/10 p-2.5 transition hover:bg-white/20 disabled:opacity-50"
                  aria-label="Close"
                >
                  <X size={21} />
                </button>
              </div>
            </div>

            <form onSubmit={handleDecision} className="space-y-5 p-6">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Resource
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {getResourceName(selectedBooking.resource_id)}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Booking period: {formatDate(selectedBooking.start_time)}
                  {" – "}
                  {formatDate(selectedBooking.end_time)}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Decision Remarks
                  <span className="ml-1 font-normal text-slate-400">
                    (Optional)
                  </span>
                </label>

                <textarea
                  value={decisionRemarks}
                  onChange={(event) =>
                    setDecisionRemarks(event.target.value)
                  }
                  rows={3}
                  maxLength={500}
                  placeholder="Enter a reason or additional remarks..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {decisionRemarks.length}/500
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeDecisionModal}
                  disabled={processingId !== null}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={processingId !== null}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    decisionAction === "approved"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {processingId !== null ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : decisionAction === "approved" ? (
                    <>
                      <Check size={16} />
                      Confirm Approval
                    </>
                  ) : (
                    <>
                      <X size={16} />
                      Confirm Rejection
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerBookings;
