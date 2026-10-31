
import { useEffect, useState } from "react";
import {
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarDays,
  Bell,
  ArrowUpRight,
  RefreshCw,
  MapPin,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";

const formatDate = (value) => {
  if (!value) return "Date unavailable";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "Time unavailable";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusStyles = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-rose-50 text-rose-700",
  cancelled: "bg-slate-100 text-slate-600",
};

function StatCard({ title, value, description, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-800">
            {value}
          </h3>

          <p className="mt-2 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function OwnerOverview() {
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const results = await Promise.allSettled([
        api.get("/api/resources/my"),
        api.get("/api/bookings/my"),
        api.get("/api/notifications/"),
      ]);

      const [resourceResult, bookingResult, notificationResult] =
        results;

      if (resourceResult.status === "fulfilled") {
        setResources(resourceResult.value.data);
      } else {
        throw new Error("Unable to load your resources.");
      }

      if (bookingResult.status === "fulfilled") {
        setBookings(bookingResult.value.data);
      } else {
        throw new Error("Unable to load your booking requests.");
      }

      if (notificationResult.status === "fulfilled") {
        setNotifications(
          Array.isArray(notificationResult.value.data)
            ? notificationResult.value.data
            : []
        );
      } else {
        setNotifications([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to load dashboard information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalResources = resources.length;

  const availableResources = resources.filter(
    (resource) => resource.is_available
  ).length;

  const unavailableResources =
    totalResources - availableResources;

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const recentBookings = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.created_at || b.start_time) -
        new Date(a.created_at || a.start_time)
    )
    .slice(0, 5);

  const recentNotifications = [...notifications]
    .sort(
      (a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    )
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <LoaderCircle
            size={38}
            className="mx-auto animate-spin text-blue-600"
          />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-white p-8 text-center shadow-sm">
        <AlertCircle
          size={38}
          className="mx-auto text-rose-500"
        />

        <h3 className="mt-4 text-lg font-semibold text-slate-800">
          Unable to load dashboard
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          {error}
        </p>

        <button
          onClick={fetchDashboardData}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-7">

      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-600">
            OWNER WORKSPACE
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Dashboard Overview
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor your resources, booking requests and recent activity.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Resources"
          value={totalResources}
          description="Resources registered by you"
          icon={Package}
          color="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Available Resources"
          value={availableResources}
          description="Currently marked available"
          icon={CheckCircle2}
          color="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Unavailable Resources"
          value={unavailableResources}
          description="Currently marked unavailable"
          icon={XCircle}
          color="bg-rose-50 text-rose-600"
        />

        <StatCard
          title="Pending Requests"
          value={pendingBookings}
          description="Awaiting your decision"
          icon={Clock}
          color="bg-amber-50 text-amber-600"
        />

      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* RECENT BOOKINGS */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm xl:col-span-2">

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
            <div>
              <h2 className="font-bold text-slate-800">
                Recent Booking Activity
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Latest requests for your resources
              </p>
            </div>

            <CalendarDays
              size={21}
              className="text-blue-600"
            />
          </div>

          {recentBookings.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <CalendarDays
                size={34}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-medium text-slate-600">
                No booking activity yet
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Booking requests for your resources will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentBookings.map((booking) => {
                const resource = resources.find(
                  (item) => item.id === booking.resource_id
                );

                return (
                  <div
                    key={booking.id}
                    className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-800">
                        {resource?.name ||
                          `Resource #${booking.resource_id}`}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Booking #{booking.id}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <CalendarDays size={13} />
                        {formatDate(booking.start_time)}

                        <span>•</span>

                        {formatDateTime(booking.created_at)}
                      </div>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                        statusStyles[booking.status] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* NOTIFICATIONS */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
            <div>
              <h2 className="font-bold text-slate-800">
                Notifications
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Your latest updates
              </p>
            </div>

            <Bell size={21} className="text-blue-600" />
          </div>

          {recentNotifications.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Bell
                size={34}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-medium text-slate-600">
                No notifications yet
              </p>

              <p className="mt-1 text-xs text-slate-400">
                New updates will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex gap-3 px-5 py-4 transition hover:bg-slate-50"
                >
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Bell size={17} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-800">
                        {notification.title}
                      </h3>

                      {!notification.is_read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                      )}
                    </div>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {notification.message}
                    </p>

                    <p className="mt-2 text-[11px] text-slate-400">
                      {formatDateTime(notification.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* MY RESOURCES */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
          <div>
            <h2 className="font-bold text-slate-800">
              My Resources
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Overview of your listed institutional resources
            </p>
          </div>

          <Package size={21} className="text-blue-600" />
        </div>

        {resources.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Package
              size={34}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm font-medium text-slate-600">
              No resources listed yet
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Your resources will appear here once added.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {resources.slice(0, 6).map((resource) => (
              <div
                key={resource.id}
                className="rounded-xl border border-slate-100 p-4 transition hover:border-blue-200 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Package size={20} />
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      resource.is_available
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {resource.is_available
                      ? "Available"
                      : "Unavailable"}
                  </span>
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-800">
                  {resource.name}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {resource.category}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} />
                    {resource.location}
                  </span>

                  <span className="font-semibold text-slate-700">
                    Qty: {resource.quantity}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    Added {formatDate(resource.created_at)}
                  </span>

                  <ArrowUpRight size={14} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default OwnerOverview;
