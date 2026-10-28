import React, { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import {
  Menu, X, Home, Search, ArrowLeft, CheckCircle, Info, 
  AlertTriangle, AlertCircle, Bell, Heart, Calendar, 
  MapPin, PlusCircle, Dog, LogOut, Stethoscope, PawPrint,
  Flag, Sparkles, Radio, ClipboardList, Building2, User, QrCode
} from "lucide-react";
import "../../styles/parent.css";

const ParentLayout = () => {
  const { toasts, removeToast, foundReports, animals } = useApp();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [localNotifications, setLocalNotifications] = useState([
    { id: "N-1", title: "Adoption Confirmed! 🐾", desc: "Your application for Sheru is approved. Ready for home pickup!", time: "1 hour ago", unread: true },
    { id: "N-2", title: "Upcoming Rabies Booster 💉", desc: "Mani's annual rabies booster is scheduled for 2026-08-28.", time: "1 day ago", unread: true },
    { id: "N-3", title: "Medical Record Discharged 🏥", desc: "Cheeku completed treatment and is returned to shelter care.", time: "3 days ago", unread: false }
  ]);
  const location = useLocation();
  const navigate = useNavigate();

  // Dynamic scanned reports notification mapped to bell alerts (strictly scoped to parent's owned pets)
  const unreadReports = (foundReports || []).filter(r => {
    const pet = (animals || []).find(a => a.id === r.animalId);
    return pet && pet.ownerId === user?.id && r.status === "Pending";
  }).map(r => {
    const pet = animals.find(a => a.id === r.animalId);
    return {
      id: `RPT-${r.id}`,
      title: "🚨 Lost Pet Scanned!",
      desc: `${pet ? pet.name : "Your pet"}'s QR tag was scanned. Check-in location: ${r.finderLocation}`,
      time: "Just now",
      unread: true,
      path: `/parent/found-reports`
    };
  });

  const allNotifications = [...unreadReports, ...localNotifications];

  // Navigation Links for Pet Parent App matching reference image
  const groupedLinks = [
    {
      category: "My Family",
      links: [
        { path: "/parent/pets", label: "My Pets", icon: PawPrint },
        { path: "/parent/appointments", label: "Vet Visits", icon: Stethoscope },
        { path: "/parent/lost", label: "Lost Pet Alerts", icon: AlertTriangle },
        { path: "/parent/found-reports", label: "Found Pet Reports", icon: Flag }
      ]
    },
    {
      category: "Ecosystem",
      links: [
        { path: "/parent/vets", label: "Find a Vet", icon: Building2 },
        { path: "/parent/adopt", label: "Adopt a Pet", icon: Heart },
        { path: "/parent/emergency", label: "Emergency & Nearby", icon: Sparkles }
      ]
    },
    {
      category: "Registries",
      links: [
        { path: "/parent/register", label: "Register Family Pet", icon: ClipboardList },
        { path: "/parent/tokens", label: "My Collar Tokens", icon: QrCode }
      ]
    }
  ];

  // Map icon types for toast notifications
  const getToastIcon = (type) => {
    switch (type) {
      case "success": return <CheckCircle size={18} color="#2E7D32" />;
      case "warning": return <AlertTriangle size={18} color="#E28704" />;
      case "error": return <AlertCircle size={18} color="#E05D5D" />;
      default: return <Info size={18} color="#1976D2" />;
    }
  };

  return (
    <div className="parent-shell">
      {/* 1. Left Sidebar - Desktop (Dark Charcoal / Orange Accented) */}
      <aside className="parent-sidebar sidebar-desktop">
        {/* Sidebar Logo */}
        <div className="parent-sidebar-logo-area">
          <div className="parent-sidebar-logo-badge">
            <PawPrint size={20} color="white" />
          </div>
          <div>
            <div className="parent-sidebar-brand-title">
              PetLink <span className="parent-sidebar-brand-care">CARE</span>
            </div>
            <span className="parent-sidebar-brand-sub">FAMILY COMPANION</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="parent-sidebar-nav">
          {groupedLinks.map((cat, catIdx) => (
            <div key={catIdx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span className="parent-sidebar-cat-label">
                {cat.category}
              </span>
              
              {cat.links.map((link) => {
                const LinkIcon = link.icon;
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={`parent-nav-item ${isActive ? "active" : ""}`}
                  >
                    <LinkIcon size={17} />
                    {link.label}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer Link */}
        <div className="parent-sidebar-footer">
          <Link
            to="/"
            className="parent-exit-link"
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
            backgroundColor: "#170F0A",
            height: "100%",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "white", fontSize: "1.3rem", fontWeight: 800 }}>PetLink Parent</span>
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
                        className={`parent-nav-item ${isActive ? "active" : ""}`}
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

      {/* 2. Main Content Container */}
      <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", minWidth: 0, backgroundColor: "#FAF7F2" }}>
        {/* Parent Top Bar */}
        <header className="parent-topbar">
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
          <div className="parent-topbar-left">
            <span className="parent-topbar-title">
              🏡 Pet Family Dashboard
            </span>
            <span className="parent-badge-app">
              PET PARENT APP
            </span>
          </div>

          {/* Top Bar Actions */}
          <div className="parent-topbar-right">
            {/* Dynamic Parent Notification dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="parent-bell-btn"
              >
                <Bell size={20} />
                {allNotifications.filter(n => n.unread).length > 0 && (
                  <span className="parent-bell-badge">
                    {allNotifications.filter(n => n.unread).length}
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
                  borderRadius: "16px",
                  zIndex: 200,
                  maxHeight: "350px",
                  overflowY: "auto",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "center" }}>
                    <h4 style={{ fontWeight: 800, fontSize: "0.95rem", margin: 0 }}>Updates Feed</h4>
                    {allNotifications.filter(n => n.unread).length > 0 && (
                      <span 
                        style={{ fontSize: "0.75rem", color: "#5028FF", cursor: "pointer", fontWeight: 700 }} 
                        onClick={() => setLocalNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                      >
                        Mark All Read
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {allNotifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          backgroundColor: notif.unread ? "#EEF2FF" : "#F9FAFB",
                          fontSize: "0.8rem",
                          border: notif.unread ? "1px solid #C7D2FE" : "1px solid #E5E7EB",
                          transition: "background-color 0.2s ease",
                          cursor: notif.path ? "pointer" : "default"
                        }}
                        onClick={() => {
                          if (notif.path) {
                            setShowNotifications(false);
                            navigate(notif.path);
                          }
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong style={{ color: "#1F2937", fontSize: "0.82rem" }}>{notif.title}</strong>
                          <span style={{ fontSize: "0.68rem", color: "#9CA3AF" }}>{notif.time}</span>
                        </div>
                        <p style={{ color: "#6B7280", fontSize: "0.78rem", margin: 0 }}>{notif.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Real Parent Profile Matching Reference */}
            <div className="parent-user-pill">
              <div className="parent-user-avatar">
                {user?.name ? user.name.slice(0, 1).toUpperCase() : "P"}
              </div>
              <div className="parent-user-info">
                <span className="parent-user-name">
                  {user?.name || "parent"}
                </span>
                <span className="parent-user-sub">
                  {user?.city ? `${user.city} • Pet Parent` : "ahmedabad • Pet Parent"}
                </span>
              </div>
            </div>

            {/* User Icon Circle Button */}
            <button
              className="parent-user-icon-btn"
              title="Parent profile"
              onClick={() => navigate("/parent/pets")}
            >
              <User size={17} />
            </button>

            {/* Logout Action */}
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              title="Sign out of Parent portal"
              className="parent-logout-btn"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Parent Page Content */}
        <main style={{ flexGrow: 1, backgroundColor: "#FAF7F2" }} className="animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* 3. Floating Toast System */}
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

      {/* Media query styling */}
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

export default ParentLayout;
