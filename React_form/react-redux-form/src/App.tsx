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
                <RequireAuth roles={["Admin"]}>
                  <AdminDashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/staff"
              element={
                <RequireAuth roles={["Staff"]}>
                  <StaffDashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/teacher"
              element={
                <RequireAuth roles={["Staff"]}>
                  <StaffDashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/student"
              element={
                <RequireAuth roles={["Student"]}>
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
                <RequireAuth roles={["Staff", "Admin"]}>
                  <DisplayPage />
                </RequireAuth>
              }
            />
            <Route
              path="/users/:id"
              element={
                <RequireAuth roles={["Staff", "Admin"]}>
                  <ViewUserPage />
                </RequireAuth>
              }
            />
            <Route
              path="/users/:id/edit"
              element={
                <RequireAuth roles={["Staff", "Admin"]}>
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