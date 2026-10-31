
import { useEffect, useState } from "react";

import {
  Package,
  CheckCircle,
  CalendarDays,
  Clock,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Activity,
  XCircle,
  ArrowUpRight,
  Sparkles,
  ChartNoAxesCombined,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import api from "../../services/api";

function StatCard({ title, value, icon: Icon, theme, description }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className={`absolute right-0 top-0 h-24 w-24 rounded-bl-full ${theme.glow}`} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value ?? 0}
          </h3>

          <p className="mt-2 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${theme.icon}`}>
          <Icon size={22} />
        </div>
      </div>

      <div className={`absolute bottom-0 left-0 h-1 w-full ${theme.line}`} />
    </div>
  );
}

function BookingStatusCard({ title, value, icon: Icon, color }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 transition hover:border-slate-200 hover:shadow-sm">
      <div>
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-2xl font-bold text-slate-800">
          {value ?? 0}
        </p>
      </div>

      <div className={`rounded-xl p-3 ${color}`}>
        <Icon size={20} />
      </div>
    </div>
  );
}

function AdminOverview() {
  const [overview, setOverview] = useState(null);
  const [utilization, setUtilization] = useState([]);
  const [trends, setTrends] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        overviewResponse,
        utilizationResponse,
        trendsResponse,
      ] = await Promise.all([
        api.get("/api/analytics/overview"),
        api.get("/api/analytics/resource-utilization"),
        api.get("/api/analytics/booking-trends"),
      ]);

      setOverview(overviewResponse.data);
      setUtilization(utilizationResponse.data);
      setTrends(trendsResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load dashboard information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
          <RefreshCw className="animate-spin text-blue-600" size={27} />
        </div>

        <p className="text-sm font-medium text-slate-500">
          Preparing your ShareSpace dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-red-700">
          <div className="rounded-xl bg-red-50 p-3">
            <AlertCircle size={22} />
          </div>

          <div>
            <p className="font-semibold">Dashboard loading failed</p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
          </div>
        </div>

        <button
          onClick={fetchDashboardData}
          className="mt-5 flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  const chartData = trends.map((item) => ({
    date: new Date(`${item.booking_date}T00:00:00`).toLocaleDateString(
      "en-IN",
      { day: "2-digit", month: "short" }
    ),
    Bookings: item.total_bookings,
    Approved: item.approved_bookings,
    Rejected: item.rejected_bookings,
    Cancelled: item.cancelled_bookings,
  }));

  const averageUtilization =
    utilization.length > 0
      ? (
          utilization.reduce(
            (total, item) =>
              total + Number(item.utilization_percentage || 0),
            0
          ) / utilization.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-7">

      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1746a2] via-[#2563eb] to-[#4f46e5] p-6 text-white shadow-lg shadow-blue-200 sm:p-8">
        <div className="absolute -right-12 -top-24 h-72 w-72 rounded-full border-[35px] border-white/10" />
        <div className="absolute -bottom-28 right-44 h-64 w-64 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-50">
              <Sparkles size={14} />
              ShareSpace Administration
            </div>

            <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
              Welcome to your Dashboard!
            </h1>

            <p className="mt-3 max-w-lg text-sm leading-relaxed text-blue-100 sm:text-base">
              Manage institutional resources, monitor bookings, and explore
              platform activity from one central workspace.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-medium backdrop-blur-sm">
                <Activity size={17} />
                Live platform statistics
              </div>

              <button
                onClick={fetchDashboardData}
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                <RefreshCw size={16} />
                Refresh Dashboard
              </button>
            </div>
          </div>

          <div className="hidden h-36 w-36 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/10 backdrop-blur-sm md:flex">
            <ChartNoAxesCombined size={76} strokeWidth={1.3} />
          </div>
        </div>
      </section>

      {/* Section Heading */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Platform Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Key statistics and institutional resource performance.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-emerald-700">
            Data connected
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Resources"
          value={overview?.total_resources}
          icon={Package}
          description="Registered institutional resources"
          theme={{
            glow: "bg-blue-50",
            icon: "bg-blue-50 text-blue-600",
            line: "bg-blue-500",
          }}
        />

        <StatCard
          title="Available Resources"
          value={overview?.available_resources}
          icon={CheckCircle}
          description="Resources currently available"
          theme={{
            glow: "bg-emerald-50",
            icon: "bg-emerald-50 text-emerald-600",
            line: "bg-emerald-500",
          }}
        />

        <StatCard
          title="Total Bookings"
          value={overview?.total_bookings}
          icon={CalendarDays}
          description="All recorded booking statuses"
          theme={{
            glow: "bg-violet-50",
            icon: "bg-violet-50 text-violet-600",
            line: "bg-violet-500",
          }}
        />

        <StatCard
          title="Pending Bookings"
          value={overview?.pending_bookings}
          icon={Clock}
          description="Requests awaiting a decision"
          theme={{
            glow: "bg-amber-50",
            icon: "bg-amber-50 text-amber-600",
            line: "bg-amber-500",
          }}
        />
      </div>

      {/* Booking Status */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            Booking Status
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current distribution of booking records.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <BookingStatusCard
            title="Approved"
            value={overview?.approved_bookings}
            icon={CheckCircle}
            color="bg-emerald-50 text-emerald-600"
          />

          <BookingStatusCard
            title="Pending"
            value={overview?.pending_bookings}
            icon={Clock}
            color="bg-amber-50 text-amber-600"
          />

          <BookingStatusCard
            title="Rejected"
            value={overview?.rejected_bookings}
            icon={XCircle}
            color="bg-red-50 text-red-600"
          />

          <BookingStatusCard
            title="Cancelled"
            value={overview?.cancelled_bookings}
            icon={CalendarDays}
            color="bg-orange-50 text-orange-600"
          />
        </div>
      </section>

      {/* Booking Trends */}
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <TrendingUp size={19} />
              </div>

              <h2 className="text-lg font-bold text-slate-800">
                Booking Trends
              </h2>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Daily booking activity across your institution.
            </p>
          </div>

          <span className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
            Last 30 days
          </span>
        </div>

        <div className="mb-5 flex flex-wrap gap-4 text-xs font-medium text-slate-600">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            Total Bookings
          </span>

          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Approved
          </span>

          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            Cancelled
          </span>
        </div>

        <div className="h-80 w-full">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No booking trend data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
              >
                <CartesianGrid
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  interval="preserveStartEnd"
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />

                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 8px 25px rgba(15,23,42,0.08)",
                    fontSize: "12px",
                  }}
                />

                <Bar
                  dataKey="Bookings"
                  fill="#3b82f6"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={28}
                />

                <Bar
                  dataKey="Approved"
                  fill="#10b981"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={28}
                />

                <Bar
                  dataKey="Cancelled"
                  fill="#f59e0b"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Resource Utilization */}
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
                <Package size={19} />
              </div>

              <h2 className="text-lg font-bold text-slate-800">
                Resource Utilization
              </h2>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Monitor the usage of institutional equipment and spaces.
            </p>
          </div>

          <div className="rounded-xl bg-violet-50 px-4 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-500">
              Average utilization
            </p>

            <p className="mt-1 text-xl font-bold text-violet-700">
              {averageUtilization}%
            </p>
          </div>
        </div>

        {utilization.length === 0 ? (
          <div className="py-12 text-center">
            <Package
              className="mx-auto mb-3 text-slate-300"
              size={36}
            />

            <p className="text-sm text-slate-500">
              No resource utilization data available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-4 font-semibold">Resource</th>
                  <th className="px-4 py-4 font-semibold">Category</th>
                  <th className="px-4 py-4 font-semibold">Bookings</th>
                  <th className="px-4 py-4 font-semibold">Usage Hours</th>
                  <th className="px-4 py-4 font-semibold">Utilization</th>
                </tr>
              </thead>

              <tbody>
                {utilization.map((resource) => {
                  const percentage = Math.max(
                    0,
                    Math.min(
                      Number(resource.utilization_percentage || 0),
                      100
                    )
                  );

                  const progressColor =
                    percentage >= 70
                      ? "bg-emerald-500"
                      : percentage >= 30
                        ? "bg-blue-500"
                        : "bg-amber-500";

                  return (
                    <tr
                      key={resource.resource_id}
                      className="border-b border-slate-50 transition last:border-0 hover:bg-slate-50/80"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Package size={18} />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {resource.resource_name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Quantity: {resource.quantity}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                          {resource.category}
                        </span>
                      </td>

                      <td className="px-4 py-4 font-medium text-slate-700">
                        {resource.total_bookings}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {resource.total_usage_hours} hrs
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>

                          <span className="min-w-12 font-semibold text-slate-700">
                            {resource.utilization_percentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Footer Insight */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
        <div className="rounded-xl bg-white p-2.5 text-blue-600 shadow-sm">
          <Activity size={20} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            Platform Performance
          </h3>

          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            ShareSpace provides centralized visibility into institutional
            resources, booking activity, and utilization. Use the Analytics
            section for detailed date-based reports.
          </p>
        </div>

        <ArrowUpRight
          size={18}
          className="ml-auto shrink-0 text-blue-500"
        />
      </div>
    </div>
  );
}

export default AdminOverview;
