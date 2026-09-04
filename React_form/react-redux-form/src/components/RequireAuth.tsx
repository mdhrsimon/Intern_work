import { Navigate, useLocation } from "react-router-dom";
import { getRole, isLoggedIn } from "../lib/permissions";

type Props = {
  children: React.ReactNode;
  roles?: Array<"User" | "Staff" | "Admin">;
};

const RequireAuth = ({ children, roles }: Props) => {
  const location = useLocation();

  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = getRole();

  if (roles && role && !roles.includes(role)) {
    if (role === "User") return <Navigate to="/form" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;