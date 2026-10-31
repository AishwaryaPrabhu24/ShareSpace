
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  ListOrdered,
  Bell,
  Search,
  ArrowRight,
  RefreshCw,
  Package,
  CalendarDays,
  AlertCircle,
  Inbox,
} from "lucide-react";
import api from "../../services/api";

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

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

const formatLabel = (value = "") => {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const getStatusStyle = (status = "") => {
  const styles = {
    pending: "bg-amber-50 text-amber-700",
    approved: "bg-emerald-50 text-emerald-700",
    rejected: "bg-red-50 text-red-700",
    cancelled: "bg-slate-100 text-slate-600",
    waiting: "bg-blue-50 text-blue-700",
    promoted: "bg-purple-50 text-purple-700",
    skipped: "bg-orange-50 text-orange-700",
  };

  return styles[status.toLowerCase()] || "bg-slate-100 text-slate-600";
};

export default function SeekerOverview() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [waitingEntries, setWaitingEntries] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        bookingsResponse,
        waitingResponse,
        notificationsResponse,
      ] = await Promise.all([
        api.get("/api/bookings/my"),
        api.get("/api/waiting-list/my"),
        api.get("/api/notifications/"),
      ]);

      setBookings(bookingsResponse.data);
      setWaitingEntries(waitingResponse.data);
      setNotifications(notificationsResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load dashboard information. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = useMemo(() => {
    return {
      totalBookings: bookings.length,
      pendingBookings: bookings.filter(
        (booking) => booking.status === "pending"
      ).length,
      approvedBookings: bookings.filter(
        (booking) => booking.status === "approved"
      ).length,
      activeWaiting: waitingEntries.filter(
        (entry) => entry.status === "waiting"
      ).length,
      unreadNotifications: notifications.filter(
        (notification) => !notification.is_read
      ).length,
    };
  }, [bookings, waitingEntries, notifications]);

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort(
        (a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
      )
      .slice(0, 5);
  }, [bookings]);

  const recentNotifications = useMemo(() => {
    return [...notifications].slice(0, 5);
  }, [notifications]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">

      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <Package size={17} />
            Seeker Workspace
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dashboard Overview
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track your bookings and discover shared institutional resources.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh Dashboard
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button
            onClick={fetchDashboardData}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white shadow-lg shadow-blue-200/50 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <p className="text-sm font-medium text-blue-100">
            Welcome to ShareSpace
          </p>

          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            Discover. Book. Collaborate.
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
            Access shared institutional equipment and spaces whenever
            you need them. Explore available resources and manage your
            booking requests from one place.
          </p>

          <button
            onClick={() => navigate("/seeker/resources")}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50"
          >
            <Search size={17} />
            Browse Resources
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="pointer-events-none absolute -right-10 -top-20 h-72 w-72 rounded-full border-[35px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-32 right-28 h-64 w-64 rounded-full border-[30px] border-white/10" />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          subtitle="All your booking requests"
          icon={CalendarCheck}
          color="blue"
        />

        <StatCard
          title="Pending Requests"
          value={stats.pendingBookings}
          subtitle="Awaiting owner approval"
          icon={Clock}
          color="orange"
        />

        <StatCard
          title="Approved Bookings"
          value={stats.approvedBookings}
          subtitle="Confirmed bookings"
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="Waiting List"
          value={stats.activeWaiting}
          subtitle="Active waiting requests"
          icon={ListOrdered}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Quick Actions
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Quickly access your most-used features.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <QuickAction
            icon={Search}
            title="Browse Resources"
            description="Discover available equipment and spaces."
            onClick={() => navigate("/seeker/resources")}
          />

          <QuickAction
            icon={CalendarCheck}
            title="My Bookings"
            description="View and manage your booking requests."
            onClick={() => navigate("/seeker/bookings")}
          />

          <QuickAction
            icon={ListOrdered}
            title="Waiting List"
            description="Track your waiting-list positions."
            onClick={() => navigate("/seeker/waiting-list")}
          />
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-slate-900">
              Recent Bookings
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Your latest booking activity
            </p>
          </div>

          <button
            onClick={() => navigate("/seeker/bookings")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View All
            <ArrowRight size={15} />
          </button>
        </div>

        {recentBookings.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            message="You haven't made any bookings yet."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <CalendarDays size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Booking #{booking.id}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Resource ID: {booking.resource_id}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(booking.start_time)} ·{" "}
                      {booking.purpose}
                    </p>
                  </div>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Notifications */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-slate-900">
              Recent Notifications
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Your latest updates and alerts
            </p>
          </div>

          <button
            onClick={() => navigate("/seeker/notifications")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View All
            <ArrowRight size={15} />
          </button>
        </div>

        {recentNotifications.length === 0 ? (
          <EmptyState
            icon={Inbox}
            message="You don't have any notifications yet."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 px-5 py-4 ${
                  notification.is_read ? "" : "bg-blue-50/40"
                }`}
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Bell size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">
                      {notification.title}
                    </p>

                    {!notification.is_read && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                        NEW
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    {notification.message}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {formatDateTime(notification.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Statistics Card
function StatCard({ title, value, subtitle, icon: Icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${colors[color]}`}>
          <Icon size={23} />
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        {subtitle}
      </p>
    </div>
  );
}

// Quick Action Card
function QuickAction({ icon: Icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
        <Icon size={22} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <ArrowRight
        size={17}
        className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
      />
    </button>
  );
}

// Empty State
function EmptyState({ icon: Icon, message }) {
  return (
    <div className="px-5 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <Icon size={23} />
      </div>

      <p className="mt-3 text-sm text-slate-500">
        {message}
      </p>
    </div>
  );
}
