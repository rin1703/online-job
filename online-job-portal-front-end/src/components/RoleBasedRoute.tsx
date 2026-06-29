import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/hooks/redux";
import type { Role } from "@/redux/common/common.type";

interface RoleBasedRouteProps {
  allowedRoles: Role[];
}

/**
 * RoleBasedRoute Component
 * Protects routes based on user roles
 * Redirects to login if not authenticated
 * Redirects to unauthorized page if user doesn't have required role
 */
export const RoleBasedRoute = ({ allowedRoles }: RoleBasedRouteProps) => {
  const token = useAppSelector((state) => state.auth.token) || localStorage.getItem("token");
  const user = useAppSelector((state) => state.auth.user);

  // Not authenticated
  if (!token) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // Try to get user from localStorage if not in Redux state
  let userRole: Role | null = user?.role || null;

  if (!userRole) {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        userRole = parsedUser.role;
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
      }
    }
  }

  // User doesn't have required role
  if (!userRole || !allowedRoles.includes(userRole)) {
    // Redirect to appropriate page based on current role
    if (userRole === "recruiter") {
      return <Navigate to="/recruiter/overview" replace />;
    } else if (userRole === "admin") {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/jobs" replace />;
    }
  }

  // User has required role, render the protected route
  return <Outlet />;
};
