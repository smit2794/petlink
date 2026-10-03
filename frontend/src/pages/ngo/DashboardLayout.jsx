import React, { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import {
  Menu, X, Home, Navigation, Dog,
  Users, CheckSquare, HeartHandshake, FileBarChart, Bell,
  Search, ArrowLeft, CheckCircle, Info, AlertTriangle, AlertCircle, Calendar,
  PawPrint, LogOut, Settings
} from "lucide-react";

const ShelterIcon = Home;

const DashboardLayout = () => {
  const { toasts, removeToast } = useApp();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();

  // Grouped Navigation Categories
  const groupedLinks = [
    {
      category: "Home",
      links: [
        { path: "/ngo/overview", label: "Overview Hub", icon: Home }
      ]
    },
    {
      category: "Operations",
      links: [
        { path: "/ngo/rescues", label: "Rescue Dispatch", icon: Navigation },
        { path: "/ngo/shelter", label: "Shelter & Inventory", icon: ShelterIcon },
        { path: "/ngo/drives", label: "Drive Planner", icon: Calendar }
      ]
    },
    {
      category: "Registries",
      links: [
        { path: "/ngo/animals", label: "Animal Profiles", icon: Dog },
        { path: "/ngo/volunteers", label: "Volunteer Staff", icon: Users },
        { path: "/ngo/adoptions", label: "Adoption Pipeline", icon: CheckSquare },
        { path: "/ngo/found-reports", label: "Found Pet Reports", icon: AlertTriangle }
      ]
    },
    {
      category: "Financials & Settings",
      links: [
        { path: "/ngo/donations", label: "Donations Ledger", icon: HeartHandshake },
        { path: "/ngo/reports", label: "Reports & Audits", icon: FileBarChart },
        { path: "/ngo/settings", label: "Settings", icon: Settings }
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
    <div className="ngo-layout">
      {/* 1. Left Sidebar - Desktop */}
      <aside style={{
        width: "260px",
        backgroundColor: "#1D1311",
        color: "var(--text-white)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
        zIndex: 100,
        boxShadow: "4px 0 24px rgba(0,0,0,0.2)",
        borderRight: "1px solid rgba(255,255,255,0.05)"
      }} className="sidebar-desktop">
        {/* Sidebar Logo */}
        <div style={{
          padding: "24px 22px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)"
        }}>
          <div style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #FF7A1A, #FF5500)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(255, 107, 0, 0.35)",
            flexShrink: 0
          }}>
            <PawPrint size={20} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
            <span style={{ fontSize: "1.05rem", fontWeight: 900, letterSpacing: "0.02em", color: "#FFFFFF" }}>
              PET CARE
            </span>
            <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#FF7A1A", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              NGO PORTAL
            </span>
          </div>
        </div>

        {/* Sidebar Navigation grouped by Categories */}
        <nav style={{ flex: 1, padding: "18px 12px", display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto" }}>
          {groupedLinks.map((cat, catIdx) => (
            <div key={catIdx}>
              {/* Category Separator */}
              {catIdx > 0 && (
                <div style={{
                  height: "1px",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  margin: "10px 8px 12px"
                }} />
              )}
              {/* Category Uppercase Label */}
              <span style={{
                fontSize: "0.68rem",
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#8C7B75",
                paddingLeft: "16px",
                display: "block",
                marginBottom: "6px"
              }}>
                {cat.category}
              </span>

              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {cat.links.map((link) => {
                  const LinkIcon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 16px",
                        borderRadius: "9999px",
                        fontSize: "0.88rem",
                        fontWeight: isActive ? 700 : 500,
                        transition: "all var(--transition-fast)",
                        backgroundColor: isActive ? "#FF6E14" : "transparent",
                        color: isActive ? "#FFFFFF" : "#A89992",
                        textDecoration: "none"
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                          e.currentTarget.style.color = "#FFFFFF";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#A89992";
                        }
                      }}
                    >
                      <LinkIcon size={16} style={{ flexShrink: 0 }} />
                      {link.label}
                      {isActive && (
                        <div style={{
                          marginLeft: "auto",
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: "#FFFFFF"
                        }} />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer — Portal Settings & Exit Link */}
        <div style={{ padding: "14px 12px 18px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link
            to="/ngo/settings"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 12px",
              borderRadius: "14px",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              textDecoration: "none",
              transition: "background var(--transition-fast)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)"}
          >
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#F59E0B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1D1311",
              flexShrink: 0
            }}>
              <Settings size={16} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#FFFFFF" }}>
                Portal Settings
              </span>
              <span style={{ fontSize: "0.7rem", color: "#8C7B75" }}>
                v2.4 Production
              </span>
            </div>
          </Link>

          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "10px",
              fontSize: "0.82rem",
              fontWeight: 500,
              color: "#8C7B75",
              transition: "all var(--transition-fast)",
              textDecoration: "none"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#8C7B75";
            }}
          >
            <ArrowLeft size={14} /> Exit to Selector
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
          backgroundColor: "rgba(0, 0, 0, 0.55)",
          zIndex: 200,
          display: "flex"
        }}>
          <div className="animate-slide-in-right" style={{
            width: "280px",
            backgroundColor: "var(--primary-color)",
            height: "100%",
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <PawPrint size={20} color="white" />
                <span style={{ color: "white", fontSize: "1.1rem", fontWeight: 800 }}>PetLink</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: 0,
                  color: "white",
                  cursor: "pointer",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background var(--transition-fast)"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              >
                <X size={18} />
              </button>
            </div>

            {/* Mobile links */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {groupedLinks.map((cat, catIdx) => (
                <div key={catIdx}>
                  {catIdx > 0 && (
                    <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.07)", margin: "10px 4px 12px" }} />
                  )}
                  <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.14em", paddingLeft: "12px", display: "block", marginBottom: "6px" }}>
                    {cat.category}
                  </span>
                  {cat.links.map((link) => {
                    const LinkIcon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          color: "white",
                          fontWeight: isActive ? 700 : 500,
                          fontSize: "0.88rem",
                          backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                          borderLeft: isActive ? "3px solid rgba(255,255,255,0.7)" : "3px solid transparent",
                          textDecoration: "none"
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

            <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "16px" }}>
              <Link to="/" style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "10px",
                color: "rgba(255,255,255,0.6)",
                fontSize: "0.88rem",
                fontWeight: 500,
                textDecoration: "none"
              }}>
                <ArrowLeft size={16} /> Exit to Selector
              </Link>
            </div>
          </div>
          <div style={{ flex: 1 }} onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* 2. Main content container */}
      <div className="ngo-content">
        {/* NGO Top Bar */}
        <header style={{
          height: "72px",
          backgroundColor: "#FAF7F2",
          borderBottom: "1px solid #EAE3D8",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          position: "sticky",
          top: 0,
          zIndex: 90
        }}>
          {/* Hamburger button on Tablet/Mobile */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            style={{
              background: "none",
              border: 0,
              color: "#1D1311",
              cursor: "pointer",
              display: "none",
              padding: "6px",
              borderRadius: "8px"
            }}
            className="hamburger-btn"
          >
            <Menu size={24} />
          </button>

          {/* Search box */}
          <div style={{ display: "flex", alignItems: "center", position: "relative", maxWidth: "340px", width: "100%" }} className="search-desktop">
            <Search size={15} style={{ position: "absolute", left: "14px", color: "#8C7B75" }} />
            <input
              type="text"
              placeholder="Search NGO database..."
              style={{
                width: "100%",
                padding: "9px 16px 9px 38px",
                borderRadius: "9999px",
                border: "1px solid #E5DFD4",
                fontSize: "0.86rem",
                outline: "none",
                backgroundColor: "#EFEAE1",
                color: "#1D1311",
                transition: "all var(--transition-fast)",
                fontFamily: "inherit"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#FF7A1A";
                e.target.style.backgroundColor = "#FFFFFF";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E5DFD4";
                e.target.style.backgroundColor = "#EFEAE1";
              }}
            />
          </div>

          {/* Top Bar Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            {/* Notification Bell */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  backgroundColor: "#1D1311",
                  border: "1px solid #1D1311",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all var(--transition-fast)"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2C201C"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#1D1311"}
              >
                <Bell size={17} />
                {toasts.length > 0 && (
                  <span style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-2px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    backgroundColor: "#FF6E14",
                    color: "white",
                    fontSize: "0.58rem",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #FAF7F2"
                  }}>
                    {toasts.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {showNotifications && (
                <div className="card animate-scale-up" style={{
                  position: "absolute",
                  top: "48px",
                  right: 0,
                  width: "320px",
                  padding: "0",
                  borderRadius: "16px",
                  zIndex: 200,
                  maxHeight: "380px",
                  overflowY: "auto",
                  border: "1px solid var(--border-color)",
                  boxShadow: "var(--shadow-lg)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 20px 14px", alignItems: "center", borderBottom: "1px solid var(--border-color)" }}>
                    <h4 style={{ fontWeight: 800, fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Bell size={14} /> System Activity
                    </h4>
                    {toasts.length > 0 && (
                      <span style={{ fontSize: "0.75rem", color: "var(--accent-coral)", cursor: "pointer", fontWeight: 700 }} onClick={() => toasts.forEach(t => removeToast(t.id))}>
                        Clear All
                      </span>
                    )}
                  </div>
                  <div style={{ padding: "12px" }}>
                    {toasts.length === 0 ? (
                      <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--secondary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--secondary-color)" }}>
                          <PawPrint size={18} />
                        </div>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>All clear — no recent activity</p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {toasts.map((toast) => (
                          <div key={toast.id} style={{
                            display: "flex",
                            gap: "10px",
                            padding: "10px 12px",
                            borderRadius: "10px",
                            backgroundColor: "var(--bg-color)",
                            fontSize: "0.82rem",
                            border: "1px solid var(--border-color)"
                          }}>
                            <div style={{ marginTop: "2px", flexShrink: 0 }}>{getToastIcon(toast.type)}</div>
                            <div style={{ flex: 1, color: "var(--text-main)", fontWeight: 500, lineHeight: 1.4 }}>{toast.message}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Real NGO Profile Capsule */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "#FCE8D5",
              border: "1px solid #F6D6B8",
              borderRadius: "9999px",
              padding: "4px 16px 4px 6px"
            }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "#FF6E14",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "0.88rem",
                flexShrink: 0
              }}>
                {user?.name ? user.name[0].toUpperCase() : "A"}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }} className="profile-text">
                <span style={{ fontSize: "0.62rem", fontWeight: 800, color: "#8C7B75", letterSpacing: "0.06em", textTransform: "uppercase", lineHeight: 1.1 }}>
                  WELCOME BACK
                </span>
                <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#1D1311", lineHeight: 1.2 }}>
                  {user?.name || "animallove"} <span style={{ color: "#8C7B75", fontWeight: 600 }}>/ {user?.ngoProfile?.region || user?.city || "chorbajar"}</span>
                </span>
              </div>
            </div>

            {/* Logout Action */}
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              title="Sign out of NGO portal"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "transparent",
                border: "1.5px solid #DFD7CC",
                padding: "7px 16px",
                borderRadius: "9999px",
                color: "#2C2420",
                cursor: "pointer",
                fontSize: "0.82rem",
                fontWeight: 700,
                transition: "all var(--transition-fast)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent-coral)";
                e.currentTarget.style.color = "var(--accent-coral)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#DFD7CC";
                e.currentTarget.style.color = "#2C2420";
              }}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* NGO Page Content */}
        <main className="ngo-page-body animate-fade-in">
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
        gap: "10px",
        maxWidth: "360px",
        width: "100%"
      }}>
        {toasts.slice(-4).map((toast) => (
          <div
            key={toast.id}
            className="animate-slide-in-right"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border-color)",
              borderLeft: `4px solid ${
                toast.type === "success" ? "#27AE60" :
                toast.type === "warning" ? "var(--accent-amber)" :
                toast.type === "error" ? "var(--accent-coral)" : "#2980B9"
              }`,
              borderRadius: "14px",
              padding: "14px 18px",
              boxShadow: "var(--shadow-md)",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              position: "relative"
            }}
          >
            <div style={{ marginTop: "2px", flexShrink: 0 }}>
              {getToastIcon(toast.type)}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 600, paddingRight: "20px", lineHeight: 1.4 }}>
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
                display: "flex",
                borderRadius: "50%",
                transition: "background var(--transition-fast)"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--border-color)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "none"}
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
          .hamburger-btn { display: flex !important; }
          .profile-text { display: none !important; }
        }
        @media (max-width: 640px) {
          .search-desktop { display: none !important; }
          .ngo-page-body { padding: 16px !important; }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
