import { Navigate, useLocation } from "react-router-dom";
import { homePathForRole } from "../lib/permissions";
import type { Role } from "../lib/permissions";
import { useAuthSession } from "../lib/useAuthSession";
import { Loader2 } from "lucide-react";

type Props = {
  children: React.ReactNode;
  roles?: Array<Exclude<Role, null>>;
};

const RequireAuth = ({ children, roles }: Props) => {
  const location = useLocation();
  const { loggedIn, role, isChecking } = useAuthSession();

  if (isChecking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-600">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium">Verifying authorization...</p>
      </div>
    );
  }

  if (!loggedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (roles && role) {
    const hasRole = roles.includes(role);
    if (!hasRole) {
      return <Navigate to={homePathForRole(role)} replace />;
    }
  }

  return <>{children}</>;
};

export default RequireAuth;