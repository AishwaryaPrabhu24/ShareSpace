
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  Package,
  CalendarDays,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Activity,
  Clock,
  BarChart3,
  TrendingUp,
  Filter,
  RotateCcw,
  ChartNoAxesCombined,
} from "lucide-react";

import api from "../../services/api";

function Analytics() {
  const [overview, setOverview] = useState(null);
  const [utilization, setUtilization] = useState([]);
  const [trends, setTrends] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [appliedDates, setAppliedDates] = useState({
    start_date: "",
    end_date: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch analytics data
  const fetchAnalytics = async (filters = {}) => {
    setLoading(true);
    setError("");

    try {
      const params = {};

      if (filters.start_date) {
        params.start_date = filters.start_date;
      }

      if (filters.end_date) {
        params.end_date = filters.end_date;
      }

      const [
        overviewResponse,
        utilizationResponse,
        trendsResponse,
      ] = await Promise.all([
        api.get("/api/analytics/overview"),
        api.get("/api/analytics/resource-utilization", { params }),
        api.get("/api/analytics/booking-trends", { params }),
      ]);

      setOverview(overviewResponse.data);
      setUtilization(utilizationResponse.data);
      setTrends(trendsResponse.data);
    } catch (err) {
      const detail = err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to load analytics data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(appliedDates);
  }, [appliedDates]);

  // Apply date filters
  const handleApplyFilters = () => {
    if (startDate && endDate && startDate > endDate) {
      setError("Start date cannot be later than end date.");
      return;
    }

    setAppliedDates({
      start_date: startDate,
      end_date: endDate,
    });
  };

  // Reset date filters
  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");

    setAppliedDates({
      start_date: "",
      end_date: "",
    });
  };

  // Format chart dates
  const formatChartDate = (value) => {
    if (!value) return "";

    const date = new Date(`${value}T00:00:00`);

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  // Overview statistics
  const statCards = [
    {
      title: "Total Resources",
      value: overview?.total_resources ?? 0,
      description: "Registered resources",
      icon: Package,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      borderColor: "bg-blue-600",
    },
    {
      title: "Available Resources",
      value: overview?.available_resources ?? 0,
      description: "Currently available",
      icon: CheckCircle,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      borderColor: "bg-emerald-500",
    },
    {
      title: "Total Bookings",
      value: overview?.total_bookings ?? 0,
      description: "All booking records",
      icon: CalendarDays,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-50",
      borderColor: "bg-indigo-600",
    },
    {
      title: "Approved Bookings",
      value: overview?.approved_bookings ?? 0,
      description: "Successfully approved",
      icon: Activity,
      iconColor: "text-violet-600",
      iconBg: "bg-violet-50",
      borderColor: "bg-violet-600",
    },
  ];

  const statusCards = [
    {
      label: "Pending",
      value: overview?.pending_bookings ?? 0,
      color: "text-amber-600",
      dot: "bg-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "Approved",
      value: overview?.approved_bookings ?? 0,
      color: "text-emerald-600",
      dot: "bg-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      label: "Rejected",
      value: overview?.rejected_bookings ?? 0,
      color: "text-red-600",
      dot: "bg-red-500",
      bg: "bg-red-50",
    },
    {
      label: "Cancelled",
      value: overview?.cancelled_bookings ?? 0,
      color: "text-slate-600",
      dot: "bg-slate-500",
      bg: "bg-slate-100",
    },
  ];

  return (
    <div className="space-y-7">

      {/* Gradient Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1949a9] via-blue-600 to-indigo-600 p-7 text-white shadow-xl shadow-blue-200/60 sm:p-9">
        <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border-[30px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-28 right-1/4 h-64 w-64 rounded-full bg-white/5" />

        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-blue-50 backdrop-blur">
              <ChartNoAxesCombined size={15} />
              Administration Workspace
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Resource Analytics
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-blue-100 sm:text-base">
              Monitor institutional resource usage, analyze booking
              trends, and understand resource utilization across
              your organization.
            </p>

            <button
              onClick={() => fetchAnalytics(appliedDates)}
              disabled={loading}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh Analytics
            </button>
          </div>

          <div className="hidden h-32 w-32 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/10 shadow-inner backdrop-blur-md lg:flex">
            <BarChart3 size={65} strokeWidth={1.5} />
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Overview Statistics */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            Analytics Overview
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            A summary of your institution's resource and booking activity.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100/60"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      {stat.title}
                    </p>

                    <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                      {loading && !overview ? "—" : stat.value}
                    </h3>

                    <p className="mt-2 text-xs text-slate-400">
                      {stat.description}
                    </p>
                  </div>

                  <div className={`rounded-2xl p-3 ${stat.iconBg} ${stat.iconColor}`}>
                    <Icon size={23} />
                  </div>
                </div>

                <div className={`absolute bottom-0 left-0 h-1 w-full ${stat.borderColor}`} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Booking Status */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            Booking Status
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Current distribution of booking requests.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statusCards.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.bg}`}>
                <span className={`h-3 w-3 rounded-full ${item.dot}`} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  {item.label} Bookings
                </p>
                <p className={`mt-1 text-2xl font-bold ${item.color}`}>
                  {loading && !overview ? "—" : item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Date Filters */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Filter size={20} />
          </div>

          <div>
            <h2 className="font-bold text-slate-800">
              Analytics Date Range
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Select a date range to filter booking trends and resource utilization.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Start Date
            </label>

            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              End Date
            </label>

            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleApplyFilters}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-60"
            >
              <Filter size={16} />
              Apply
            </button>

            <button
              onClick={handleResetFilters}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RotateCcw size={15} />
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* Booking Trends */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
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
              Daily booking activity and booking status distribution.
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            Daily Overview
          </span>
        </div>

        <div className="h-80 w-full">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Loading booking trends...
            </div>
          ) : trends.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              No booking trend data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trends}
                margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="booking_date"
                  tickFormatter={formatChartDate}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  labelFormatter={formatChartDate}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 8px 25px rgba(15, 23, 42, 0.08)",
                  }}
                />

                <Legend />

                <Bar
                  dataKey="total_bookings"
                  name="Total"
                  fill="#64748b"
                  radius={[5, 5, 0, 0]}
                />

                <Bar
                  dataKey="approved_bookings"
                  name="Approved"
                  fill="#2563eb"
                  radius={[5, 5, 0, 0]}
                />

                <Bar
                  dataKey="rejected_bookings"
                  name="Rejected"
                  fill="#ef4444"
                  radius={[5, 5, 0, 0]}
                />

                <Bar
                  dataKey="cancelled_bookings"
                  name="Cancelled"
                  fill="#f59e0b"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Resource Utilization Chart */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <Activity size={19} />
            </div>

            <h2 className="text-lg font-bold text-slate-800">
              Resource Utilization
            </h2>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Percentage of available resource capacity used through approved bookings.
          </p>
        </div>

        <div className="h-80 w-full">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Loading resource utilization...
            </div>
          ) : utilization.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              No resource utilization data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={utilization}
                layout="vertical"
                margin={{ top: 5, right: 25, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  type="number"
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  type="category"
                  dataKey="resource_name"
                  width={150}
                  tick={{ fontSize: 11, fill: "#475569" }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toFixed(2)}%`,
                    "Utilization",
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 8px 25px rgba(15, 23, 42, 0.08)",
                  }}
                />

                <Bar
                  dataKey="utilization_percentage"
                  name="Utilization"
                  fill="#4f46e5"
                  radius={[0, 6, 6, 0]}
                  barSize={25}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Resource Utilization Details */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Resource Utilization Details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Detailed booking and usage statistics for each resource.
            </p>
          </div>

          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Package size={21} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Resource",
                  "Category",
                  "Bookings",
                  "Approved",
                  "Usage Hours",
                  "Utilization",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    Loading resource details...
                  </td>
                </tr>
              ) : utilization.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No resource records found.
                  </td>
                </tr>
              ) : (
                utilization.map((resource) => (
                  <tr
                    key={resource.resource_id}
                    className="transition hover:bg-blue-50/40"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">
                        {resource.resource_name}
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        Quantity: {resource.quantity}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {resource.category}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                      {resource.total_bookings}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-emerald-600">
                      {resource.approved_bookings}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Clock size={15} className="text-blue-500" />
                        {Number(resource.total_usage_hours).toFixed(2)} hrs
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                            style={{
                              width: `${Math.min(
                                Math.max(
                                  Number(resource.utilization_percentage),
                                  0
                                ),
                                100
                              )}%`,
                            }}
                          />
                        </div>

                        <span className="text-sm font-bold text-slate-700">
                          {Number(resource.utilization_percentage).toFixed(2)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Note */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-5 py-4">
        <p className="text-xs leading-relaxed text-blue-800">
          <strong>Note:</strong> Overview cards show overall statistics.
          Date filters apply to booking trends and resource utilization.
          Utilization is calculated from approved booking hours.
        </p>
      </div>

    </div>
  );
}

export default Analytics;
