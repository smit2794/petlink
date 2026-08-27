import React, { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import {
  Menu, X, Home, Search, ArrowLeft, CheckCircle, Info, 
  AlertTriangle, AlertCircle, Bell, ClipboardList, Scan, 
  Calendar, Syringe, ShieldAlert, FileText, Clock, BarChart3
} from "lucide-react";

const VetLayout = () => {
  const { toasts, removeToast, activeVetId, setActiveVetId } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();

  const groupedLinks = [
    {
      category: "Operations",
      links: [
        { path: "/vet/queue", label: "Incoming Queue", icon: ClipboardList },
        { path: "/vet/lookup", label: "Patient Lookup", icon: Scan },
        { path: "/vet/archive", label: "Certificate Archive", icon: FileText }
      ]
    },
    {
      category: "Schedules & Analytics",
      links: [
        { path: "/vet/appointments", label: "Appointments", icon: Calendar },
        { path: "/vet/boosters", label: "Upcoming Boosters", icon: Clock },
        { path: "/vet/inventory", label: "Medicine Stock", icon: Syringe },
        { path: "/vet/analytics", label: "Clinical Analytics", icon: BarChart3 }
      ]
    }
  ];

  // Map icon types for toast notification
  const getToastIcon = (type) => {
    switch (type) {
      case "success": return <CheckCircle size={18} color="#2E7D32" />;
      case "warning": return <AlertTriangle size={18} color="#E28704" />;
      case "error": return <AlertCircle size={18} color="#E05D5D" />;
      default: return <Info size={18} color="#1976D2" />;
    }
  };

  return (
    <div className="ngo-layout" style={{ display: "flex", minHeight: "100vh" }}>
      {/* 1. Left Sidebar - Desktop (Coral Medical Accented) */}
      <aside style={{
        width: "260px",
        backgroundColor: "var(--primary-color)", // deep forest green remains, but navigation accent changes to coral
        color: "var(--text-white)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
        zIndex: 100,
        boxShadow: "4px 0 20px rgba(0,0,0,0.05)",
        borderRight: "1px solid rgba(255,255,255,0.04)"
      }} className="sidebar-desktop">
        {/* Sidebar Logo */}
        <div style={{
          padding: "28px 24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)"
        }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "white",
            color: "var(--accent-coral)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
            </svg>
          </div>
          <span style={{ fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
            PetLink <span style={{ fontWeight: 300, opacity: 0.8, color: "var(--accent-coral)" }}>VET</span>
          </span>
        </div>

        {/* Sidebar Navigation */}
        <nav style={{ flex: 1, padding: "24px 16px", display: "flex", flexDirection: "column", gap: "20px", overflowY: "auto" }}>
          {groupedLinks.map((cat, catIdx) => (
            <div key={catIdx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{
                fontSize: "0.68rem",
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255, 255, 255, 0.4)",
                paddingLeft: "16px",
                marginBottom: "6px"
              }}>
                {cat.category}
              </span>
              
              {cat.links.map((link) => {
                const LinkIcon = link.icon;
                // Match prefix routes as active for nested views
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 18px",
                      borderRadius: "30px",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      transition: "all var(--transition-fast)",
                      backgroundColor: isActive ? "var(--accent-coral)" : "transparent",
                      color: isActive ? "white" : "rgba(255, 255, 255, 0.7)",
                      opacity: isActive ? 1 : 0.85
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <LinkIcon size={16} />
                    {link.label}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer Link */}
        <div style={{ padding: "20px 16px", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 18px",
              borderRadius: "30px",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "white",
              opacity: 0.8,
              transition: "all var(--transition-fast)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <ArrowLeft size={16} /> Exit to Selector
          </Link>
        </div>
      </aside>

      {/* Mobile Drawer Navigation (Conditional) */}
      {mobileMenuOpen && (
        <div className="animate-fade-in" style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 200,
          display: "flex"
        }}>
          <div className="animate-slide-in-right" style={{
            width: "280px",
            backgroundColor: "var(--primary-color)",
            height: "100%",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "white", fontSize: "1.3rem", fontWeight: 800 }}>PetLink VET</span>
              <button onClick={() => setMobileMenuOpen(false)} style={{ background: "none", border: 0, color: "white" }}>
                <X size={24} />
              </button>
            </div>
            
            <nav style={{ display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
              {groupedLinks.map((cat, catIdx) => (
                <div key={catIdx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", paddingLeft: "12px" }}>
                    {cat.category}
                  </span>
                  {cat.links.map((link) => {
                    const LinkIcon = link.icon;
                    const isActive = location.pathname.startsWith(link.path);
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 16px",
                          borderRadius: "30px",
                          color: "white",
                          backgroundColor: isActive ? "var(--accent-coral)" : "transparent"
                        }}
                      >
                        <LinkIcon size={16} />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
            
            <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "16px" }}>
              <Link to="/" className="btn btn-outline" style={{ width: "100%", color: "white", borderColor: "white" }}>
                <ArrowLeft size={16} /> Exit to Selector
              </Link>
            </div>
          </div>
          <div style={{ flex: 1 }} onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* 2. Main content container */}
      <div className="ngo-content" style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Vet Top Bar */}
        <header style={{
          height: "76px",
          backgroundColor: "var(--card-bg)",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 48px",
          position: "sticky",
          top: 0,
          zIndex: 90
        }}>
          {/* Hamburger button on Mobile */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            style={{
              background: "none",
              border: 0,
              color: "var(--text-main)",
              cursor: "pointer",
              display: "none"
            }}
            className="hamburger-btn"
          >
            <Menu size={24} />
          </button>

          {/* Portal Indicators & Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary-color)", display: "flex", alignItems: "center", gap: "8px" }} className="profile-text">
              🏥 Animal Care Clinic
            </span>
            <span className="badge" style={{ backgroundColor: "var(--accent-coral-light)", color: "var(--accent-coral)", fontSize: "0.75rem", border: "1px solid var(--accent-coral)", fontWeight: 700 }}>
              Vet Portal
            </span>
          </div>

          {/* Top Bar Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {/* Notification Bell */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: "none",
                  border: 0,
                  color: "var(--text-main)",
                  cursor: "pointer",
                  position: "relative",
                  padding: "6px",
                  display: "flex"
                }}
              >
                <Bell size={20} />
                {toasts.length > 0 && (
                  <span style={{
                    position: "absolute",
                    top: "0px",
                    right: "0px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    backgroundColor: "var(--accent-coral)",
                    color: "white",
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    {toasts.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {showNotifications && (
                <div className="card animate-scale-up" style={{
                  position: "absolute",
                  top: "40px",
                  right: 0,
                  width: "320px",
                  padding: "20px",
                  borderRadius: "var(--radius-md)",
                  zIndex: 200,
                  maxHeight: "350px",
                  overflowY: "auto",
                  border: "1px solid var(--border-color)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "center" }}>
                    <h4 style={{ fontWeight: 800, fontSize: "0.95rem" }}>System Activity Log</h4>
                    {toasts.length > 0 && (
                      <span style={{ fontSize: "0.75rem", color: "var(--accent-coral)", cursor: "pointer", fontWeight: 700 }} onClick={() => toasts.forEach(t => removeToast(t.id))}>
                        Clear All
                      </span>
                    )}
                  </div>
                  {toasts.length === 0 ? (
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", padding: "16px 0", textAlign: "center" }}>
                      No recent notification logs.
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {toasts.map((toast) => (
                        <div key={toast.id} style={{
                          display: "flex",
                          gap: "8px",
                          padding: "10px",
                          borderRadius: "var(--radius-sm)",
                          backgroundColor: "#FAF9F5",
                          fontSize: "0.8rem",
                          border: "1px solid var(--border-color)"
                        }}>
                          <div style={{ marginTop: "2px" }}>{getToastIcon(toast.type)}</div>
                          <div style={{ flex: 1, color: "var(--text-main)", fontWeight: 500 }}>{toast.message}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Vet Switcher Dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }} className="profile-text">Clinician:</span>
              <select
                value={activeVetId}
                onChange={(e) => setActiveVetId(e.target.value)}
                className="form-control"
                style={{ padding: "6px 12px", fontSize: "0.8rem", width: "160px", borderRadius: "30px", border: "1px solid var(--accent-coral)" }}
              >
                <option value="VET-1">Dr. Dev Karve</option>
                <option value="VET-2">Dr. Ananya Rao</option>
              </select>
            </div>

            {/* Profile Avatar */}
            {(() => {
              const currentVet = activeVetId === "VET-2" 
                ? { name: "Dr. Ananya Rao", role: "Surgeon Associate", initial: "AR" }
                : { name: "Dr. Dev Karve", role: "Chief Vet Officer", initial: "DK" };
              return (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "var(--accent-coral)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.95rem"
                  }}>
                    {currentVet.initial}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }} className="profile-text">
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)", lineHeight: 1.2 }}>
                      {currentVet.name}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                      {currentVet.role}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </header>

        {/* Vet Page Content */}
        <main style={{ padding: "40px 48px", flexGrow: 1 }} className="ngo-page-body animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* 3. Global Floating Toast Notification System */}
      <div style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        maxWidth: "350px",
        width: "100%"
      }}>
        {toasts.slice(-4).map((toast) => (
          <div
            key={toast.id}
            className="animate-slide-in-right"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border-color)",
              borderLeft: `5px solid ${
                toast.type === "success" ? "#27AE60" :
                toast.type === "warning" ? "var(--accent-amber)" :
                toast.type === "error" ? "var(--accent-coral)" : "#2980B9"
              }`,
              borderRadius: "12px",
              padding: "16px 20px",
              boxShadow: "var(--shadow-md)",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              position: "relative"
            }}
          >
            <div style={{ marginTop: "2px" }}>
              {getToastIcon(toast.type)}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 600, paddingRight: "16px" }}>
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "none",
                border: 0,
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "2px",
                display: "flex"
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Extra styles for media queries inside this layout */}
      <style>{`
        @media (max-width: 1024px) {
          .sidebar-desktop { display: none !important; }
          .hamburger-btn { display: block !important; }
          .profile-text { display: none !important; }
        }
        @media (max-width: 640px) {
          .ngo-page-body { padding: 16px !important; }
        }
      `}</style>
    </div>
  );
};

export default VetLayout;
