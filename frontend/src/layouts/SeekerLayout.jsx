
import { useState } from "react";
import {
  LayoutDashboard,
  Search,
  CalendarCheck,
  ListOrdered,
  Bell,
  LogOut,
  Menu,
  X,
  UserCircle,
  Package,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navigation = [
  {
    name: "Overview",
    path: "/seeker",
    icon: LayoutDashboard,
    description: "Your dashboard",
  },
  {
    name: "Browse Resources",
    path: "/seeker/resources",
    icon: Search,
    description: "Find equipment and spaces",
  },
  {
    name: "AI Recommendations",
    path: "/seeker/recommendations",
    icon: Sparkles,
    description: "Discover matching resources",
  },
  {
    name: "My Bookings",
    path: "/seeker/bookings",
    icon: CalendarCheck,
    description: "Manage your bookings",
  },
  {
    name: "Waiting List",
    path: "/seeker/waiting-list",
    icon: ListOrdered,
    description: "Track waiting requests",
  },
  {
    name: "Notifications",
    path: "/seeker/notifications",
    icon: Bell,
    description: "Stay updated",
  },
];

const getInitials = (name = "") => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

export default function SeekerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#f5f7fc]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#101b35] text-white transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-900/30">
            <Package size={23} />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight">
              ShareSpace
            </h1>
            <p className="text-xs text-slate-400">
              Resource Sharing Platform
            </p>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-4 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Seeker Workspace
          </p>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/seeker"}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          isActive
                            ? "bg-white/15"
                            : "bg-white/5 group-hover:bg-white/10"
                        }`}
                      >
                        <Icon size={19} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">
                          {item.name}
                        </p>
                        <p
                          className={`mt-0.5 text-[11px] ${
                            isActive
                              ? "text-blue-100"
                              : "text-slate-500"
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>

                      {isActive && <ChevronRight size={17} />}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold">
              {getInitials(user?.full_name)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {user?.full_name || "Seeker"}
              </p>
              <p className="text-xs capitalize text-slate-400">
                {user?.role || "Seeker"}
              </p>
            </div>

            <UserCircle size={19} className="text-slate-500" />
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={19} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Seeker Dashboard
              </p>
              <p className="hidden text-xs text-slate-400 sm:block">
                Discover and book institutional resources
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {user?.full_name || "Seeker"}
              </p>
              <p className="text-xs text-slate-400">
                Resource Seeker
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {getInitials(user?.full_name)}
            </div>
          </div>
        </header>

        <main className="p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
