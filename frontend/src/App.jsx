
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminLayout from "./layouts/AdminLayout";
import OwnerLayout from "./layouts/OwnerLayout";
import SeekerLayout from "./layouts/SeekerLayout";

import AdminOverview from "./pages/admin/AdminOverview";
import ResourceManagement from "./pages/admin/ResourceManagement";
import UserManagement from "./pages/admin/UserManagement";
import Analytics from "./pages/admin/Analytics";
import AuditLogs from "./pages/admin/AuditLogs";

import OwnerOverview from "./pages/owner/OwnerOverview";
import OwnerResources from "./pages/owner/OwnerResources";
import OwnerBookings from "./pages/owner/OwnerBookings";
import OwnerConditionReports from "./pages/owner/OwnerConditionReports";
import OwnerIncidents from "./pages/owner/OwnerIncidents";
import OwnerNotifications from "./pages/owner/OwnerNotifications";

import SeekerOverview from "./pages/seeker/SeekerOverview";
import SeekerResources from "./pages/seeker/SeekerResources";
import SeekerRecommendations from "./pages/seeker/SeekerRecommendations";
import SeekerBookings from "./pages/seeker/SeekerBookings";
import SeekerWaitingList from "./pages/seeker/SeekerWaitingList";
import SeekerNotifications from "./pages/seeker/SeekerNotifications";
// Redirect users according to their account role
function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading ShareSpace...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const routes = {
    admin: "/admin",
    owner: "/owner",
    seeker: "/seeker",
  };

  return (
    <Navigate
      to={routes[user.role] || "/login"}
      replace
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home redirect */}
        <Route
          path="/"
          element={<HomeRedirect />}
        />

        {/* Authentication routes */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<AdminOverview />}
          />

          <Route
            path="resources"
            element={<ResourceManagement />}
          />

          <Route
            path="users"
            element={<UserManagement />}
          />

          <Route
            path="analytics"
            element={<Analytics />}
          />

          <Route
            path="audit-logs"
            element={<AuditLogs />}
          />
        </Route>

        {/* Owner routes */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <OwnerLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<OwnerOverview />}
          />

          <Route
            path="resources"
            element={<OwnerResources />}
          />

          <Route
            path="bookings"
            element={<OwnerBookings />}
          />

          <Route
            path="condition-reports"
            element={<OwnerConditionReports />}
          />

          <Route
            path="incidents"
            element={<OwnerIncidents />}
          />

          <Route
            path="notifications"
            element={<OwnerNotifications />}
          />
        </Route>

        {/* Seeker routes */}
        <Route
          path="/seeker"
          element={
            <ProtectedRoute allowedRoles={["seeker"]}>
              <SeekerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SeekerOverview />} />
          <Route path="resources" element={<SeekerResources />} />
          <Route path="recommendations" element={<SeekerRecommendations />} />
          <Route path="bookings" element={<SeekerBookings />} />
          <Route path="waiting-list" element={<SeekerWaitingList />} />
          <Route path="notifications" element={<SeekerNotifications />} />
        </Route>

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
