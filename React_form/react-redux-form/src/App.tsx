import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import RequireAuth from "./components/RequireAuth";
import FormPage from "./pages/FormPage";
import DisplayPage from "./pages/DisplayPage";
import ViewUserPage from "./pages/ViewUserPage";
import EditUserPage from "./pages/EditUserPage";
import MySubmissionPage from "./pages/MySubmissionPage";
import NotificationsPage from "./pages/NotificationsPage";
import { NotificationToastProvider } from "./context/NotificationToastContext";
import { SignalRProvider } from "./context/SignalRContext";
import { ROLES } from "./constants/roles";

const App = () => {
  return (
    <BrowserRouter>
      <NotificationToastProvider>
        <SignalRProvider>
          <Routes>
            {/* Home page is the Login page */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Role Protected Dashboards */}
            <Route
              path="/admin"
              element={
                <RequireAuth roles={[ROLES.ADMIN]}>
                  <AdminDashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/staff"
              element={
                <RequireAuth roles={[ROLES.STAFF]}>
                  <StaffDashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/teacher"
              element={
                <RequireAuth roles={[ROLES.STAFF]}>
                  <StaffDashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/student"
              element={
                <RequireAuth roles={[ROLES.STUDENT]}>
                  <StudentDashboard />
                </RequireAuth>
              }
            />

            {/* Notification Center */}
            <Route
              path="/notifications"
              element={
                <RequireAuth>
                  <NotificationsPage />
                </RequireAuth>
              }
            />

            {/* Form and Management Pages */}
            <Route
              path="/form"
              element={
                <RequireAuth>
                  <FormPage />
                </RequireAuth>
              }
            />
            <Route
              path="/students"
              element={
                <RequireAuth roles={[ROLES.STAFF, ROLES.ADMIN]}>
                  <DisplayPage />
                </RequireAuth>
              }
            />
            <Route
              path="/users/:id"
              element={
                <RequireAuth roles={[ROLES.STAFF, ROLES.ADMIN]}>
                  <ViewUserPage />
                </RequireAuth>
              }
            />
            <Route
              path="/users/:id/edit"
              element={
                <RequireAuth roles={[ROLES.STAFF, ROLES.ADMIN]}>
                  <EditUserPage />
                </RequireAuth>
              }
            />
            <Route
              path="/my-submission"
              element={
                <RequireAuth>
                  <MySubmissionPage />
                </RequireAuth>
              }
            />

            {/* Catch-all redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SignalRProvider>
      </NotificationToastProvider>
    </BrowserRouter>
  );
};

export default App;