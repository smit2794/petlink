import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { QrCode, LayoutGrid, Users, ChevronRight, Shield } from "lucide-react";
import "../../styles/admin.css";

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid },
    { to: "/admin/generate", label: "Generate Tokens", icon: QrCode },
    { to: "/admin/registry", label: "Token Registry", icon: Users },
  ];

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="admin-logo">
          <Shield size={22} />
          {sidebarOpen && <span>PetLink Admin</span>}
        </div>

        <nav className="admin-nav">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`admin-nav-item ${location.pathname.startsWith(to) ? "active" : ""}`}
            >
              <Icon size={18} />
              {sidebarOpen && <span>{label}</span>}
              {sidebarOpen && <ChevronRight size={14} className="admin-nav-arrow" />}
            </Link>
          ))}
        </nav>

        <button
          className="admin-sidebar-toggle"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? "◀" : "▶"}
        </button>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
