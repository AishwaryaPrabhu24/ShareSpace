
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  ShieldCheck,
  UserRound,
  Search,
  RefreshCw,
  Mail,
  CalendarDays,
  AlertCircle,
  UserCheck,
  UserPlus,
  Filter,
  ArrowUpRight,
  UserCog,
  CheckCircle,
  X,
  ChevronDown,
} from "lucide-react";

import api from "../../services/api";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users from backend
  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/users/");
      setUsers(response.data);
    } catch (err) {
      const detail = err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to load users. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // User statistics
  const totalUsers = users.length;

  const adminCount = users.filter(
    (user) => user.role === "admin"
  ).length;

  const ownerCount = users.filter(
    (user) => user.role === "owner"
  ).length;

  const seekerCount = users.filter(
    (user) => user.role === "seeker"
  ).length;

  const activeCount = users.filter(
    (user) => user.is_active
  ).length;

  // Search and role filtering
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        user.full_name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search);

      const matchesRole =
        selectedRole === "all" ||
        user.role === selectedRole;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, selectedRole]);

  // Role badge styles
  const getRoleStyle = (role) => {
    const styles = {
      admin: "bg-indigo-50 text-indigo-700 ring-indigo-200",
      owner: "bg-blue-50 text-blue-700 ring-blue-200",
      seeker: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    };

    return styles[role] || "bg-slate-100 text-slate-700 ring-slate-200";
  };

  // Avatar styles
  const getAvatarStyle = (role) => {
    const styles = {
      admin: "bg-indigo-100 text-indigo-700",
      owner: "bg-blue-100 text-blue-700",
      seeker: "bg-emerald-100 text-emerald-700",
    };

    return styles[role] || "bg-slate-100 text-slate-700";
  };

  // Format registration date
  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Change user role
  const handleRoleChange = async (user, newRole) => {
    if (user.role === newRole) return;

    const confirmed = window.confirm(
      `Are you sure you want to change ${user.full_name}'s role from ${user.role} to ${newRole}?`
    );

    if (!confirmed) return;

    setUpdatingUserId(user.id);
    setError("");
    setSuccess("");

    try {
      await api.patch(`/api/users/${user.id}/role`, {
        role: newRole,
      });

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item.id === user.id
            ? { ...item, role: newRole }
            : item
        )
      );

      setSuccess(
        `${user.full_name}'s role has been successfully changed to ${newRole}.`
      );

      setSelectedUser(null);
    } catch (err) {
      const detail = err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to update the user role. Please try again."
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: totalUsers,
      description: "Registered platform users",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-500",
    },
    {
      title: "Administrators",
      value: adminCount,
      description: "System administrators",
      icon: ShieldCheck,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-500",
    },
    {
      title: "Resource Owners",
      value: ownerCount,
      description: "Sharing institutional resources",
      icon: UserRound,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-500",
    },
    {
      title: "Seekers",
      value: seekerCount,
      description: "Searching for resources",
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-500",
    },
  ];

  return (
    <div className="space-y-7">

      {/* Page Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1746a2] via-blue-600 to-[#3159d9] p-7 text-white shadow-lg shadow-blue-200/60 sm:p-9">
        <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border-[35px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-32 right-44 h-64 w-64 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50">
              <Users size={14} />
              Administration Workspace
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              User Management
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
              Manage and monitor administrators, resource owners,
              and seekers across your ShareSpace platform.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-inner backdrop-blur-sm">
              <Users size={42} strokeWidth={1.5} />
            </div>

            <button
              onClick={fetchUsers}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-blue-700 shadow-md transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} />
          <p className="flex-1">{error}</p>

          <button
            onClick={fetchUsers}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle size={19} />
          <p className="flex-1">{success}</p>

          <button
            onClick={() => setSuccess("")}
            className="rounded-lg p-1 hover:bg-emerald-100"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              User Overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              A summary of registered platform users.
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            {activeCount} Active Accounts
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className={`group relative overflow-hidden rounded-2xl border border-slate-200 border-b-4 ${stat.border} bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </p>

                    <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                      {loading ? "—" : stat.value}
                    </h3>

                    <p className="mt-2 text-xs text-slate-400">
                      {stat.description}
                    </p>
                  </div>

                  <div className={`rounded-2xl p-3 ${stat.bg} ${stat.color} transition group-hover:scale-110`}>
                    <Icon size={23} />
                  </div>
                </div>

                <ArrowUpRight
                  size={17}
                  className="absolute bottom-5 right-5 text-slate-300"
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* User Directory */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* Directory Header */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <UserPlus size={19} />
              </div>

              <h2 className="text-lg font-bold text-slate-900">
                Registered Users
              </h2>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Showing {filteredUsers.length} of {users.length} registered users
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name or email..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 sm:w-64"
              />
            </div>

            <div className="relative">
              <Filter
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 sm:w-40"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
                <option value="seeker">Seeker</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  User Information
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Role
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Account Status
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Registered On
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <RefreshCw
                      size={25}
                      className="mx-auto animate-spin text-blue-500"
                    />
                    <p className="mt-3 text-sm text-slate-500">
                      Loading registered users...
                    </p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Users size={27} />
                    </div>

                    <p className="mt-3 font-semibold text-slate-700">
                      No users found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search term or role filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="transition duration-200 hover:bg-blue-50/40"
                  >
                    {/* User Information */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${getAvatarStyle(user.role)}`}
                        >
                          {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800">
                            {user.full_name}
                          </p>

                          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                            <Mail size={13} />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold capitalize ring-1 ring-inset ${getRoleStyle(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Account Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                          user.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.is_active
                              ? "bg-emerald-500"
                              : "bg-red-500"
                          }`}
                        />

                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Registration Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDays
                          size={15}
                          className="text-blue-500"
                        />

                        {formatDate(user.created_at)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      {user.role === "admin" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                          <ShieldCheck size={15} />
                          Protected
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedUser(user)}
                          disabled={updatingUserId === user.id}
                          className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 disabled:opacity-50"
                        >
                          {updatingUserId === user.id ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <UserCog size={14} />
                          )}

                          Change Role
                          <ChevronDown size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {!loading && !error && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
            <p className="text-xs text-slate-500">
              User directory · {filteredUsers.length} records displayed
            </p>

            <p className="text-xs font-medium text-slate-500">
              {activeCount} active / {users.length} total accounts
            </p>
          </div>
        )}
      </section>

      {/* Change Role Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <UserCog size={23} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Change User Role
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Manage account permissions
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                disabled={updatingUserId !== null}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">
                {selectedUser.full_name}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {selectedUser.email}
              </p>

              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="text-slate-500">
                  Current role:
                </span>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${getRoleStyle(selectedUser.role)}`}
                >
                  {selectedUser.role}
                </span>
              </div>
            </div>

            <p className="mt-5 text-sm font-semibold text-slate-700">
              Select the new role
            </p>

            <div className="mt-3 grid grid-cols-1 gap-3">
              {[
                {
                  role: "owner",
                  title: "Resource Owner",
                  description: "Can list and manage institutional resources.",
                },
                {
                  role: "seeker",
                  title: "Resource Seeker",
                  description: "Can discover resources and request bookings.",
                },
              ].filter((option) => option.role !== selectedUser.role).map((option) => (
                <button
                  key={option.role}
                  onClick={() => handleRoleChange(selectedUser, option.role)}
                  disabled={updatingUserId !== null}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {option.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {option.description}
                    </p>
                  </div>

                  <ArrowUpRight size={18} className="text-blue-600" />
                </button>
              ))}
            </div>

            <p className="mt-5 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
              The user must log out and log in again to receive access
              according to the updated role.
            </p>

            {updatingUserId === selectedUser.id && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-blue-600">
                <RefreshCw size={16} className="animate-spin" />
                Updating user role...
              </div>
            )}

            <button
              onClick={() => setSelectedUser(null)}
              disabled={updatingUserId !== null}
              className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
