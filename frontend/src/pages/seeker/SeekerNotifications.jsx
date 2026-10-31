
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  RefreshCw,
  CalendarCheck,
  AlertCircle,
  Info,
  X,
  Package,
  ListOrdered,
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

const getNotificationIcon = (type = "") => {
  const value = type.toLowerCase();

  if (value.includes("booking")) return CalendarCheck;
  if (value.includes("wait")) return ListOrdered;
  if (value.includes("resource")) return Package;
  if (value.includes("incident")) return AlertCircle;

  return Info;
};

export default function SeekerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [filter, setFilter] = useState("all");
  const [markingId, setMarkingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/notifications/");
      setNotifications(response.data);
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

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((item) => {
        if (filter === "unread") return !item.is_read;
        if (filter === "read") return item.is_read;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
      );
  }, [notifications, filter]);

  const handleMarkRead = async (notificationId) => {
    try {
      setMarkingId(notificationId);
      setError("");
      setSuccess("");

      await api.patch(
        `/api/notifications/${notificationId}/read`
      );

      setNotifications((current) =>
        current.map((item) =>
          item.id === notificationId
            ? { ...item, is_read: true }
            : item
        )
      );

      setSuccess("Notification marked as read.");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to update this notification."
      );
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      setError("");
      setSuccess("");

      await api.patch("/api/notifications/read-all");

      setNotifications((current) =>
        current.map((item) => ({ ...item, is_read: true }))
      );

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

  return (
    <div className="space-y-7">

      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <Bell size={18} />
            Updates and Alerts
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Stay informed about your bookings and resource requests.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || markingAll}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck size={16} />
            {markingAll ? "Updating..." : "Mark All Read"}
          </button>
        </div>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Notifications"
          value={notifications.length}
          icon={Bell}
          color="blue"
        />

        <StatCard
          title="Unread"
          value={unreadCount}
          icon={Clock}
          color="orange"
        />

        <StatCard
          title="Read"
          value={notifications.length - unreadCount}
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Notification Filters */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h2 className="font-bold text-slate-900">
            Your Activity
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`
              : "You are all caught up."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "All" },
            { value: "unread", label: "Unread" },
            { value: "read", label: "Read" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                filter === item.value
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="flex min-h-[250px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="mt-4 text-sm text-slate-500">
              Loading notifications...
            </p>
          </div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">
          <Bell size={32} className="mx-auto text-slate-300" />

          <h3 className="mt-4 font-semibold text-slate-800">
            {filter === "unread"
              ? "No unread notifications"
              : filter === "read"
                ? "No read notifications"
                : "No notifications yet"}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Platform updates will appear here when available.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const NotificationIcon = getNotificationIcon(
              notification.notification_type
            );

            return (
              <div
                key={notification.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                  notification.is_read
                    ? "border-slate-200"
                    : "border-blue-200 bg-blue-50/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                      notification.is_read
                        ? "bg-slate-100 text-slate-500"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    <NotificationIcon size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900">
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

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={13} />
                        {formatDateTime(notification.created_at)}
                      </span>

                      {notification.related_booking_id && (
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarCheck size={13} />
                          Booking #{notification.related_booking_id}
                        </span>
                      )}
                    </div>
                  </div>

                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkRead(notification.id)}
                      disabled={markingId === notification.id}
                      title="Mark as read"
                      className="shrink-0 rounded-xl border border-blue-200 p-2.5 text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
                    >
                      {markingId === notification.id ? (
                        <RefreshCw size={17} className="animate-spin" />
                      ) : (
                        <CheckCheck size={17} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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
