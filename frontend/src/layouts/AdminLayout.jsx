
import { useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  LayoutDashboard,
  Package,
  Users,
  ChartNoAxesCombined,
  ClipboardList,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const navigationItems = [
  {
    name: "Overview",
    path: "/admin",
    icon: LayoutDashboard,
    description: "Dashboard overview",
  },
  {
    name: "Resources",
    path: "/admin/resources",
    icon: Package,
    description: "Manage resources",
  },
  {
    name: "Users",
    path: "/admin/users",
    icon: Users,
    description: "Manage users",
  },
  {
    name: "Analytics",
    path: "/admin/analytics",
    icon: ChartNoAxesCombined,
    description: "Usage insights",
  },
  {
    name: "Audit Logs",
    path: "/admin/audit-logs",
    icon: ClipboardList,
    description: "Activity history",
  },
];

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentPage =
    navigationItems.find((item) =>
      item.path === "/admin"
        ? location.pathname === "/admin"
        : location.pathname.startsWith(item.path)
    )?.name || "Admin Dashboard";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const SidebarContent = ({ mobile = false }) => (
    <>
      {/* Brand */}
      <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-lg shadow-blue-950/30">
            <ShieldCheck size={25} />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              ShareSpace
            </h1>

            <p className="text-[11px] font-medium tracking-wider text-blue-300">
              ADMINISTRATION PORTAL
            </p>
          </div>
        </div>

        {mobile && (
          <button
            onClick={closeMobileMenu}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <X size={21} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-6">
        <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Workspace
        </p>

        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-950/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={19}
                    className={
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-blue-300"
                    }
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {item.name}
                    </p>

                    <p
                      className={`mt-0.5 text-[10px] ${
                        isActive
                          ? "text-blue-100"
                          : "text-slate-500"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>

                  {isActive && (
                    <ChevronRight
                      size={17}
                      className="text-blue-100"
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Admin Profile */}
      <div className="shrink-0 border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-300/30 bg-gradient-to-br from-blue-400 to-indigo-500 text-sm font-bold text-white">
            {user?.full_name?.charAt(0)?.toUpperCase() || "A"}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {user?.full_name || "Administrator"}
            </p>

            <div className="mt-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />

              <p className="text-[11px] text-slate-400">
                Administrator
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f5f7fc]">

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col bg-[#101b35] shadow-xl lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeMobileMenu}
            aria-label="Close navigation overlay"
          />

          <aside className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col bg-[#101b35] shadow-2xl">
            <SidebarContent mobile />
          </aside>
        </div>
      )}

      {/* Main Area */}
      <div className="min-h-screen lg:pl-72">

        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 shadow-sm backdrop-blur-md sm:px-7 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="hidden text-xs font-medium text-slate-400 sm:block">
                  Workspace
                </p>

                <ChevronRight
                  size={13}
                  className="hidden text-slate-300 sm:block"
                />

                <p className="truncate text-sm font-semibold text-blue-600">
                  {currentPage}
                </p>
              </div>

              <h2 className="mt-0.5 truncate text-lg font-bold text-slate-800">
                Welcome back, {user?.full_name?.split(" ")[0] || "Admin"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {user?.full_name}
              </p>

              <p className="text-[11px] font-medium text-slate-400">
                System Administrator
              </p>
            </div>

            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-md shadow-blue-200">
                {user?.full_name?.charAt(0)?.toUpperCase() || "A"}
              </div>

              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-76px)] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 bg-white px-5 py-4 text-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} ShareSpace. Institutional Resource Sharing Platform.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default AdminLayout;
