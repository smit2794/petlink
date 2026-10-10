import React, { useState, useEffect } from "react";
import client from "../../api/client";
import {
  QrCode,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  Building2,
  UserRound,
  PawPrint,
  ChevronDown,
  ChevronUp
} from "lucide-react";

// ─── small helpers ────────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="admin-stat-card">
    <div className="admin-stat-icon" style={{ backgroundColor: `${color}22`, color }}>
      <Icon size={22} />
    </div>
    <div>
      <div className="admin-stat-value">{value}</div>
      <div className="admin-stat-label">{label}</div>
    </div>
  </div>
);

const BreakdownTable = ({ title, rows, emptyMsg }) => {
  const [open, setOpen] = useState(false);
  if (!rows || rows.length === 0) {
    return (
      <p style={{ fontSize: "0.8rem", color: "#9CA3AF", margin: "4px 0 0" }}>{emptyMsg}</p>
    );
  }
  return (
    <div style={{ marginTop: 8 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontSize: "0.78rem",
          fontWeight: 700,
          color: "#6B7280",
          padding: 0
        }}
      >
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        {open ? "Hide" : "Show"} per-{title.toLowerCase()} breakdown ({rows.length})
      </button>

      {open && (
        <div
          style={{
            marginTop: 8,
            borderRadius: 10,
            overflow: "hidden",
            border: "1px solid #E5E7EB",
            maxHeight: 260,
            overflowY: "auto"
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                <th style={{ textAlign: "left", padding: "8px 12px", fontWeight: 700, color: "#374151" }}>{title} Name</th>
                <th style={{ textAlign: "right", padding: "8px 12px", fontWeight: 700, color: "#374151" }}>Pets</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ borderTop: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "7px 12px", color: "#374151" }}>{r.name || <span style={{ color: "#9CA3AF", fontStyle: "italic" }}>Unknown</span>}</td>
                  <td style={{ padding: "7px 12px", textAlign: "right", fontWeight: 700, color: "#111827" }}>{r.petCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [tokenStats, setTokenStats] = useState({ total: 0, assigned: 0, claimed: 0, ngo: 0, parent: 0 });
  const [platformStats, setPlatformStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [all, claimed, ngo, parent, platform] = await Promise.all([
          client.get("/tokens"),
          client.get("/tokens?status=claimed"),
          client.get("/tokens?assignedTo=ngo"),
          client.get("/tokens?assignedTo=parent"),
          client.get("/admin/stats")
        ]);

        const total = all.data.length;
        const claimedCount = claimed.data.length;
        setTokenStats({
          total,
          assigned: total - claimedCount,
          claimed: claimedCount,
          ngo: ngo.data.length,
          parent: parent.data.length
        });
        setPlatformStats(platform.data);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const tokenCards = [
    { label: "Total Tokens",   value: tokenStats.total,    icon: QrCode,      color: "#7C3AED" },
    { label: "Unclaimed",      value: tokenStats.assigned, icon: Clock,       color: "#F59E0B" },
    { label: "Claimed",        value: tokenStats.claimed,  icon: CheckCircle, color: "#10B981" },
    { label: "NGO Tokens",     value: tokenStats.ngo,      icon: Users,       color: "#3B82F6" },
    { label: "Parent Tokens",  value: tokenStats.parent,   icon: TrendingUp,  color: "#EC4899" }
  ];

  const platformCards = platformStats
    ? [
        { label: "Total NGOs",             value: platformStats.ngoCount,        icon: Building2,  color: "#0EA5E9" },
        { label: "Pets Under NGO Care",    value: platformStats.totalNgoPets,    icon: PawPrint,   color: "#14B8A6" },
        { label: "Total Parents",          value: platformStats.parentCount,     icon: UserRound,  color: "#8B5CF6" },
        { label: "Pets Under Parent Care", value: platformStats.totalParentPets, icon: PawPrint,   color: "#F97316" }
      ]
    : [];

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Admin Dashboard</h1>
      <p className="admin-page-subtitle">Overview of all QR collar token activity and platform users.</p>

      {loading ? (
        <div className="admin-loading">Loading stats…</div>
      ) : (
        <>
          {/* ── TOKEN OVERVIEW ── */}
          <div style={{ marginBottom: 10 }}>
            <h2 style={{
              fontSize: "0.75rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#9CA3AF",
              margin: "0 0 14px"
            }}>
              Token Overview
            </h2>
            <div className="admin-stat-grid">
              {tokenCards.map((c) => <StatCard key={c.label} {...c} />)}
            </div>
          </div>

          {/* ── PLATFORM OVERVIEW ── */}
          <div style={{ marginTop: 32 }}>
            <h2 style={{
              fontSize: "0.75rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#9CA3AF",
              margin: "0 0 14px"
            }}>
              Platform Overview
            </h2>

            <div className="admin-stat-grid" style={{ marginBottom: 20 }}>
              {platformCards.map((c) => <StatCard key={c.label} {...c} />)}
            </div>

            {/* Per-entity breakdown tables */}
            {platformStats && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* NGO breakdown */}
                <div style={{ background: "var(--admin-card-bg, #FFFFFF)", border: "1px solid var(--admin-border, #E5E7EB)", borderRadius: 14, padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Building2 size={15} color="#0EA5E9" />
                    <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-main, #111827)" }}>NGO Pet Counts</span>
                  </div>
                  <BreakdownTable
                    title="NGO"
                    rows={platformStats.ngoPetBreakdown}
                    emptyMsg="No NGO accounts with registered pets yet."
                  />
                </div>

                {/* Parent breakdown */}
                <div style={{ background: "var(--admin-card-bg, #FFFFFF)", border: "1px solid var(--admin-border, #E5E7EB)", borderRadius: 14, padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <UserRound size={15} color="#8B5CF6" />
                    <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-main, #111827)" }}>Parent Pet Counts</span>
                  </div>
                  <BreakdownTable
                    title="Parent"
                    rows={platformStats.parentPetBreakdown}
                    emptyMsg="No parent accounts with registered pets yet."
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className="admin-info-box" style={{ marginTop: 32 }}>
        <h3>How the Token System Works</h3>
        <ol>
          <li>Admin generates tokens in bulk and assigns each batch to an NGO or Parent account.</li>
          <li>Tokens are physically printed on collar tags and distributed.</li>
          <li>When an NGO or Parent registers a new pet, they enter/scan their token ID — the token becomes <strong>claimed</strong> and links to the real pet record.</li>
          <li>Scanning a claimed token on the public scan page shows the pet profile. Scanning an unclaimed token shows a friendly "not yet registered" message.</li>
        </ol>
      </div>
    </div>
  );
};

export default AdminDashboard;
