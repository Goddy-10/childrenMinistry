// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * ProtectedRoute usage:
 * <ProtectedRoute allowedRoles={['admin','teacher']}>
 *   <ChildrenMinistry />
 * </ProtectedRoute>
 *
 * If user not logged in => redirect to /login (or homepage).
 * If logged in but role not allowed => redirect to "/" (or an `/unauthorized` page).
 */

export default function ProtectedRoute({ children, allowedRoles = null }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Option: return a spinner / skeleton; here we return null to avoid flashing
    return null;
  }

  if (!user) {
    // not authenticated — redirect to login, preserve where they tried to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // logged in but not authorized for this route
    return <Navigate to="/" replace />;
  }

  return children;
}
