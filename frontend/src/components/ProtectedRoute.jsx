import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PawPrint } from "lucide-react";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        background: "var(--bg-color)"
      }}>
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "var(--secondary-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--primary-color)",
          animation: "pulse 1.5s infinite"
        }}>
          <PawPrint size={28} />
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: "0.95rem", fontWeight: 600 }}>
          Verifying session...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the user's appropriate portal based on their actual role
    if (user.role === "ngo") return <Navigate to="/ngo/overview" replace />;
    if (user.role === "vet") return <Navigate to="/vet/queue" replace />;
    if (user.role === "parent") return <Navigate to="/parent/pets" replace />;
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
