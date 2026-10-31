
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  CalendarCheck,
  ClipboardCheck,
  AlertTriangle,
  Bell,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  UserCircle,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navigationItems = [
  {
    name: "Overview",
    path: "/owner",
    icon: LayoutDashboard,
    description: "Dashboard summary",
    end: true,
  },
  {
    name: "My Resources",
    path: "/owner/resources",
    icon: Package,
    description: "Manage your resources",
  },
  {
    name: "Bookings",
    path: "/owner/bookings",
    icon: CalendarCheck,
    description: "Manage booking requests",
  },
  {
    name: "Condition Reports",
    path: "/owner/condition-reports",
    icon: ClipboardCheck,
    description: "Equipment condition",
  },
  {
    name: "Incidents",
    path: "/owner/incidents",
    icon: AlertTriangle,
    description: "Reported issues",
  },
  {
    name: "Notifications",
    path: "/owner/notifications",
    icon: Bell,
    description: "Recent updates",
  },
];

function OwnerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "O";

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#f4f7fc]">

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#101b35] text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg shadow-blue-950/30">
              <ShieldCheck size={25} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                ShareSpace
              </h1>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-blue-300">
                OWNER WORKSPACE
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-5 pb-3 pt-8">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Workspace Menu
          </p>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 pb-6">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-950/30"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition ${
                        isActive
                          ? "bg-white/15 text-white"
                          : "bg-white/5 text-slate-400 group-hover:text-blue-300"
                      }`}
                    >
                      <Icon size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {item.name}
                      </p>
                      <p
                        className={`mt-0.5 text-[10px] ${
                          isActive ? "text-blue-100" : "text-slate-500"
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>

                    {isActive && (
                      <ChevronRight size={17} className="text-blue-100" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Owner Profile */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-sm font-bold text-white">
              {getInitials(user?.full_name)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {user?.full_name || "Resource Owner"}
              </p>
              <p className="truncate text-xs text-slate-400">
                {user?.email || "Owner Account"}
              </p>
            </div>

            <UserCircle size={18} className="shrink-0 text-blue-300" />
          </div>

          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="min-h-screen lg:pl-72">

        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/95 px-5 shadow-sm backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={21} />
            </button>

            <div>
              <p className="text-xs font-medium text-slate-400">
                ShareSpace / Owner
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-800">
                Owner Workspace
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {user?.full_name || "Resource Owner"}
              </p>
              <p className="text-xs text-slate-400">
                Resource Owner
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-100 text-sm font-bold text-blue-700">
              {getInitials(user?.full_name)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default OwnerLayout;
