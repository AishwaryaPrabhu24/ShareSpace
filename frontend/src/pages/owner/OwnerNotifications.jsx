
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  RefreshCw,
  Search,
  CalendarDays,
  Inbox,
  BellRing,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

// Format date
const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Format time
const formatTime = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Convert notification type into readable text
const formatLabel = (value = "") => {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

// Get notification icon and color
const getNotificationStyle = (type = "") => {
  const normalized = type.toLowerCase();

  if (normalized.includes("booking")) {
    return {
      icon: CalendarDays,
      color: "bg-blue-50 text-blue-600",
    };
  }

  if (normalized.includes("incident")) {
    return {
      icon: AlertCircle,
      color: "bg-orange-50 text-orange-600",
    };
  }

  if (
    normalized.includes("waitlist") ||
    normalized.includes("waiting_list")
  ) {
    return {
      icon: BellRing,
      color: "bg-purple-50 text-purple-600",
    };
  }

  return {
    icon: Bell,
    color: "bg-slate-100 text-slate-600",
  };
};

export default function OwnerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState(null);

  // Fetch notifications and unread count
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const [notificationResponse, countResponse] = await Promise.all([
        api.get("/api/notifications/"),
        api.get("/api/notifications/unread-count"),
      ]);

      setNotifications(notificationResponse.data);
      setUnreadCount(countResponse.data.unread_count);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        notification.title?.toLowerCase().includes(query) ||
        notification.message?.toLowerCase().includes(query) ||
        notification.notification_type?.toLowerCase().includes(query) ||
        String(notification.related_booking_id || "").includes(query);

      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "unread" && !notification.is_read) ||
        (activeFilter === "read" && notification.is_read);

      return matchesSearch && matchesFilter;
    });
  }, [notifications, search, activeFilter]);

  const readCount = notifications.filter(
    (notification) => notification.is_read
  ).length;

  // Mark one notification as read
  const markAsRead = async (notificationId) => {
    try {
      setMarkingId(notificationId);
      setError("");
      setSuccess("");

      await api.patch(`/api/notifications/${notificationId}/read`);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));
      setSuccess("Notification marked as read.");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to update notification."
      );
    } finally {
      setMarkingId(null);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      setMarkingAll(true);
      setError("");
      setSuccess("");

      await api.patch("/api/notifications/read-all");

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );

      setUnreadCount(0);
      setSuccess("All notifications marked as read.");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to mark all notifications as read."
      );
    } finally {
      setMarkingAll(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading notifications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Page Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <Bell size={17} />
            Owner Workspace
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Stay updated on booking requests and resource activities.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchNotifications}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0 || markingAll}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck size={16} />
            {markingAll ? "Updating..." : "Mark All Read"}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <Check size={18} />
          {success}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total Notifications"
          value={notifications.length}
          icon={Inbox}
          color="blue"
        />

        <SummaryCard
          title="Unread Notifications"
          value={unreadCount}
          icon={BellRing}
          color="orange"
        />

        <SummaryCard
          title="Read Notifications"
          value={readCount}
          icon={CheckCheck}
          color="emerald"
        />
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

          <div className="relative w-full lg:max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search notifications..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All" },
              { value: "unread", label: "Unread" },
              { value: "read", label: "Read" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activeFilter === filter.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Notification History
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {filteredNotifications.length} notification(s) found
          </p>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Inbox size={26} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              No notifications found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              New notifications will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notification) => {
              const style = getNotificationStyle(
                notification.notification_type
              );

              const Icon = style.icon;

              return (
                <div
                  key={notification.id}
                  className={`flex flex-col gap-4 p-5 transition sm:flex-row sm:items-start ${
                    notification.is_read
                      ? "bg-white"
                      : "bg-blue-50/40"
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.color}`}
                  >
                    <Icon size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`text-sm ${
                          notification.is_read
                            ? "font-semibold text-slate-800"
                            : "font-bold text-slate-900"
                        }`}
                      >
                        {notification.title}
                      </h3>

                      {!notification.is_read && (
                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                          New
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {notification.message}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        {formatDate(notification.created_at)} at{" "}
                        {formatTime(notification.created_at)}
                      </span>

                      <span className="capitalize">
                        Type: {formatLabel(notification.notification_type)}
                      </span>

                      {notification.related_booking_id && (
                        <span>
                          Booking #{notification.related_booking_id}
                        </span>
                      )}
                    </div>
                  </div>

                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      disabled={markingId === notification.id}
                      className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-50"
                    >
                      <Check size={15} />

                      {markingId === notification.id
                        ? "Updating..."
                        : "Mark as Read"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Summary Card Component
function SummaryCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

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
