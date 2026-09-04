import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import FormPage from "./pages/FormPage";
import ViewUserPage from"./pages/ViewUserPage";
import EditUserPage from"./pages/EditUserPage";
import DisplayPage from "./pages/DisplayPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import RequireAuth from "./components/RequireAuth";
import MySubmissionPage from "./pages/MySubmissionPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route  
          path="/"
          element={<DisplayPage />}
        />

        <Route
          path="/form"
          element={<FormPage />}
        />

        <Route
          path="/users/:id"
          element={<ViewUserPage/>}
    
        />

        <Route
          path="/users/:id/edit"
          element={<EditUserPage/>}
        />
        <Route
          path="/login"
          element={<LoginPage/>}
        />
        <Route
          path="/register"
          element={<RegisterPage/>}
        />
        {/* List: Staff + Admin only */}
        <Route
          path="/"
          element={
            <RequireAuth roles={["Staff", "Admin"]}>
              <DisplayPage />
            </RequireAuth>
          }
        />

        {/* Form: any logged-in role */}
        <Route
          path="/form"
          element={
            <RequireAuth>
              <FormPage />
            </RequireAuth>
          }
        />

        {/* View / Edit: Staff + Admin */}
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
            <RequireAuth roles={["User", "Staff", "Admin"]}>
              <MySubmissionPage />
            </RequireAuth>
          }
/>
      </Routes>
    </BrowserRouter>
  );
};

export default App;