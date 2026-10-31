
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
  ShieldAlert,
  Send,
  ClipboardCheck,
  LogIn,
  LogOut,
  FileText,
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

const conditionOptions = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "damaged", label: "Damaged" },
  { value: "non_functional", label: "Non-functional" },
];

const conditionLabel = (value) =>
  conditionOptions.find((item) => item.value === value)?.label ||
  value?.replaceAll("_", " ") ||
  "Not recorded";

export default function SeekerBookings() {
  const [bookings, setBookings] = useState([]);
  const [conditionReports, setConditionReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelBooking, setCancelBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Condition report state
  const [conditionBooking, setConditionBooking] = useState(null);
  const [conditionType, setConditionType] = useState("check_in");
  const [conditionForm, setConditionForm] = useState({
    condition_status: "good",
    remarks: "",
  });
  const [submittingCondition, setSubmittingCondition] = useState(false);
  const [conditionError, setConditionError] = useState("");
  const [viewConditionBooking, setViewConditionBooking] = useState(null);

  // Incident reporting state
  const [incidentBooking, setIncidentBooking] = useState(null);
  const [incidentForm, setIncidentForm] = useState({
    title: "",
    description: "",
    severity: "medium",
  });
  const [submittingIncident, setSubmittingIncident] = useState(false);
  const [incidentError, setIncidentError] = useState("");

  // Fetch bookings and condition reports
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const [bookingResponse, reportResponse] = await Promise.all([
        api.get("/api/bookings/my"),
        api.get("/api/condition-reports/my"),
      ]);

      setBookings(bookingResponse.data);
      setConditionReports(reportResponse.data);
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

  const getBookingReports = (bookingId) =>
    conditionReports.filter(
      (report) => report.booking_id === bookingId
    );

  const getCheckInReport = (bookingId) =>
    getBookingReports(bookingId).find(
      (report) => report.report_type === "check_in"
    );

  const getCheckOutReport = (bookingId) =>
    getBookingReports(bookingId).find(
      (report) => report.report_type === "check_out"
    );

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

      setSuccess(
        `Booking #${cancelBooking.id} was cancelled successfully.`
      );

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

  // Open condition report form
  const openConditionForm = (booking, type) => {
    setConditionBooking(booking);
    setConditionType(type);
    setConditionForm({
      condition_status: "good",
      remarks: "",
    });
    setConditionError("");
    setError("");
    setSuccess("");
  };

  // Close condition report form
  const closeConditionForm = () => {
    if (submittingCondition) return;

    setConditionBooking(null);
    setConditionForm({
      condition_status: "good",
      remarks: "",
    });
    setConditionError("");
  };

  // Submit check-in or check-out report
  const handleConditionSubmit = async (e) => {
    e.preventDefault();

    if (!conditionBooking) return;

    if (conditionForm.remarks.length > 1000) {
      setConditionError("Remarks cannot exceed 1000 characters.");
      return;
    }

    const endpoint =
      conditionType === "check_in"
        ? `/api/condition-reports/${conditionBooking.id}/check-in`
        : `/api/condition-reports/${conditionBooking.id}/check-out`;

    try {
      setSubmittingCondition(true);
      setConditionError("");
      setError("");
      setSuccess("");

      await api.post(endpoint, {
        condition_status: conditionForm.condition_status,
        remarks: conditionForm.remarks.trim() || null,
      });

      const completedType =
        conditionType === "check_in" ? "Check-in" : "Check-out";

      const completedBookingId = conditionBooking.id;

      setConditionBooking(null);
      setConditionForm({
        condition_status: "good",
        remarks: "",
      });

      setSuccess(
        `${completedType} condition report submitted successfully for Booking #${completedBookingId}.`
      );

      await fetchBookings();
    } catch (err) {
      setConditionError(
        err.response?.data?.detail ||
          "Unable to submit the condition report. Please try again."
      );
    } finally {
      setSubmittingCondition(false);
    }
  };

  // Open incident form
  const openIncidentForm = (booking) => {
    setIncidentBooking(booking);
    setIncidentForm({
      title: "",
      description: "",
      severity: "medium",
    });
    setIncidentError("");
    setError("");
    setSuccess("");
  };

  // Close incident form
  const closeIncidentForm = () => {
    if (submittingIncident) return;

    setIncidentBooking(null);
    setIncidentForm({
      title: "",
      description: "",
      severity: "medium",
    });
    setIncidentError("");
  };

  // Submit incident to backend
  const handleIncidentSubmit = async (e) => {
    e.preventDefault();

    if (!incidentBooking) return;

    const title = incidentForm.title.trim();
    const description = incidentForm.description.trim();

    if (title.length < 3 || title.length > 150) {
      setIncidentError(
        "Incident title must contain between 3 and 150 characters."
      );
      return;
    }

    if (description.length < 10 || description.length > 2000) {
      setIncidentError(
        "Description must contain between 10 and 2000 characters."
      );
      return;
    }

    try {
      setSubmittingIncident(true);
      setIncidentError("");
      setError("");
      setSuccess("");

      await api.post("/api/incidents/", {
        booking_id: incidentBooking.id,
        title,
        description,
        severity: incidentForm.severity,
      });

      setIncidentBooking(null);
      setIncidentForm({
        title: "",
        description: "",
        severity: "medium",
      });

      setSuccess(
        `Incident reported successfully for Booking #${incidentBooking.id}.`
      );
    } catch (err) {
      setIncidentError(
        err.response?.data?.detail ||
          "Unable to report the incident. Please try again."
      );
    } finally {
      setSubmittingIncident(false);
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
            Track your booking requests, manage reservations and submit
            resource condition reports.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
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

            const checkInReport = getCheckInReport(booking.id);
            const checkOutReport = getCheckOutReport(booking.id);

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

                    {booking.status === "approved" && (
                      <button
                        onClick={() => openIncidentForm(booking)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700 hover:bg-orange-100"
                      >
                        <ShieldAlert size={16} />
                        Report Incident
                      </button>
                    )}

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

                {/* Condition Report Workflow */}
                {booking.status === "approved" && (
                  <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <ClipboardCheck size={17} className="text-blue-600" />
                          Resource Condition
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          Record the resource condition during check-in and
                          check-out.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {!checkInReport && (
                          <button
                            onClick={() =>
                              openConditionForm(booking, "check_in")
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                          >
                            <LogIn size={16} />
                            Check In
                          </button>
                        )}

                        {checkInReport && !checkOutReport && (
                          <button
                            onClick={() =>
                              openConditionForm(booking, "check_out")
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                          >
                            <LogOut size={16} />
                            Check Out
                          </button>
                        )}

                        {checkInReport && checkOutReport && (
                          <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                            <CheckCircle2 size={16} />
                            Completed
                          </span>
                        )}

                        {(checkInReport || checkOutReport) && (
                          <button
                            onClick={() => setViewConditionBooking(booking)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                          >
                            <FileText size={16} />
                            View Reports
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <ConditionStatus
                        title="Check-in"
                        report={checkInReport}
                      />

                      <ConditionStatus
                        title="Check-out"
                        report={checkOutReport}
                      />
                    </div>
                  </div>
                )}

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

      {/* Condition Report Form Modal */}
      {conditionBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={closeConditionForm}
        >
          <div
            className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <div className="flex items-center gap-2 text-blue-600">
                  <ClipboardCheck size={20} />
                  <span className="text-sm font-semibold">
                    Condition Reporting
                  </span>
                </div>

                <h2 className="mt-2 text-lg font-bold text-slate-900">
                  {conditionType === "check_in"
                    ? "Resource Check-in"
                    : "Resource Check-out"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Booking #{conditionBooking.id} · Resource ID:{" "}
                  {conditionBooking.resource_id}
                </p>
              </div>

              <button
                onClick={closeConditionForm}
                disabled={submittingCondition}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleConditionSubmit}
              className="space-y-5 p-5"
            >
              {conditionError && (
                <Feedback
                  type="error"
                  message={conditionError}
                  onClose={() => setConditionError("")}
                />
              )}

              <div className="rounded-xl bg-blue-50 p-3">
                <p className="text-xs font-semibold text-blue-700">
                  {conditionType === "check_in"
                    ? "Initial Condition"
                    : "Final Condition"}
                </p>

                <p className="mt-1 text-sm text-blue-900">
                  {conditionType === "check_in"
                    ? "Inspect the resource and record its condition before use."
                    : "Inspect the resource again and record its condition after use."}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Resource Condition *
                </label>

                <select
                  required
                  value={conditionForm.condition_status}
                  onChange={(e) =>
                    setConditionForm((prev) => ({
                      ...prev,
                      condition_status: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                >
                  {conditionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Remarks (Optional)
                </label>

                <textarea
                  rows={4}
                  maxLength={1000}
                  value={conditionForm.remarks}
                  onChange={(e) =>
                    setConditionForm((prev) => ({
                      ...prev,
                      remarks: e.target.value,
                    }))
                  }
                  placeholder="Mention any visible damage, missing parts or other observations..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {conditionForm.remarks.length}/1000 characters
                </p>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                <p className="flex items-center gap-2 text-xs font-semibold text-amber-800">
                  <AlertCircle size={15} />
                  Important
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-700">
                  Please record the actual condition accurately. Your report
                  will be visible to the resource owner.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={closeConditionForm}
                  disabled={submittingCondition}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingCondition}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submittingCondition ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Submit {conditionType === "check_in" ? "Check-in" : "Check-out"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Condition Reports Modal */}
      {viewConditionBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => setViewConditionBooking(null)}
        >
          <div
            className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Condition Reports
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Booking #{viewConditionBooking.id}
                </p>
              </div>

              <button
                onClick={() => setViewConditionBooking(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {getBookingReports(viewConditionBooking.id)
                .sort(
                  (a, b) =>
                    new Date(a.created_at) - new Date(b.created_at)
                )
                .map((report) => (
                  <div
                    key={report.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold capitalize text-slate-800">
                        {report.report_type.replace("_", "-")}
                      </span>

                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                        {conditionLabel(report.condition_status)}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-slate-400">
                      Submitted: {formatDateTime(report.created_at)}
                    </p>

                    <p className="mt-3 text-xs font-semibold text-slate-500">
                      Remarks
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                      {report.remarks || "No remarks provided."}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Report Incident Modal */}
      {incidentBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={closeIncidentForm}
        >
          <div
            className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <div className="flex items-center gap-2 text-orange-600">
                  <ShieldAlert size={20} />
                  <span className="text-sm font-semibold">
                    Incident Reporting
                  </span>
                </div>

                <h2 className="mt-2 text-lg font-bold text-slate-900">
                  Report an Incident
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Booking #{incidentBooking.id}
                </p>
              </div>

              <button
                onClick={closeIncidentForm}
                disabled={submittingIncident}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleIncidentSubmit}
              className="space-y-5 p-5"
            >
              {incidentError && (
                <Feedback
                  type="error"
                  message={incidentError}
                  onClose={() => setIncidentError("")}
                />
              )}

              <div className="rounded-xl bg-blue-50 p-3">
                <p className="text-xs font-semibold text-blue-700">
                  Booking Reference
                </p>

                <p className="mt-1 text-sm font-medium text-blue-900">
                  Booking #{incidentBooking.id} · Resource ID:{" "}
                  {incidentBooking.resource_id}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Incident Title *
                </label>

                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={150}
                  value={incidentForm.title}
                  onChange={(e) =>
                    setIncidentForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Example: Equipment damaged during usage"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />

                <p className="mt-1 text-xs text-slate-400">
                  3–150 characters
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description *
                </label>

                <textarea
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={4}
                  value={incidentForm.description}
                  onChange={(e) =>
                    setIncidentForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe what happened, when it happened, and any relevant details..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {incidentForm.description.length}/2000 characters
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Severity *
                </label>

                <select
                  value={incidentForm.severity}
                  onChange={(e) =>
                    setIncidentForm((prev) => ({
                      ...prev,
                      severity: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="rounded-xl border border-orange-100 bg-orange-50 p-3">
                <p className="flex items-center gap-2 text-xs font-semibold text-orange-800">
                  <AlertCircle size={15} />
                  Important
                </p>

                <p className="mt-1 text-xs leading-5 text-orange-700">
                  Your incident report will be associated with this booking
                  and made available to the relevant resource owner.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={closeIncidentForm}
                  disabled={submittingIncident}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingIncident}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submittingIncident ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Submit Incident
                    </>
                  )}
                </button>
              </div>
            </form>
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

function ConditionStatus({ title, report }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs font-medium text-slate-500">{title}</p>

      {report ? (
        <>
          <p className="mt-1 text-sm font-semibold capitalize text-emerald-700">
            {conditionLabel(report.condition_status)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {formatDateTime(report.created_at)}
          </p>
        </>
      ) : (
        <p className="mt-1 text-sm font-medium text-slate-400">
          Not completed
        </p>
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
      {isError ? (
        <AlertCircle size={18} />
      ) : (
        <CheckCircle2 size={18} />
      )}

      <p className="flex-1">{message}</p>

      <button onClick={onClose} aria-label="Dismiss message">
        <X size={17} />
      </button>
    </div>
  );
}
