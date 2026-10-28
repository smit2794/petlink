import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Eye,
  AlertCircle,
  Hourglass,
  Briefcase,
  Plus,
  Search,
  Check,
  Heart,
  Phone,
  Info,
  PawPrint
} from "lucide-react";

const ParentAppointments = () => {
  const { vetAppointments } = useApp();
  const [filterStatus, setFilterStatus] = useState("Upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const upcomingCount = vetAppointments.filter((a) => a.status === "Upcoming").length;
  const pendingCount = vetAppointments.filter((a) => a.status === "Pending").length;

  const filteredAppointments = vetAppointments.filter((apt) => {
    if (filterStatus === "Pending") return apt.status === "Pending";
    if (filterStatus === "Upcoming") return apt.status === "Upcoming";
    if (filterStatus === "Completed") return apt.status === "Completed";
    return true; // "All"
  });

  const displayedAppointments = filteredAppointments.filter((apt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      apt.petName?.toLowerCase().includes(q) ||
      apt.reason?.toLowerCase().includes(q) ||
      apt.petId?.toLowerCase().includes(q)
    );
  });

  const tabs = [
    { key: "Pending", label: "Pending Appointments" },
    { key: "Upcoming", label: "Upcoming Appointments" },
    { key: "Completed", label: "Completed Appointments" },
    { key: "All", label: "All Appointments" }
  ];

  return (
    <div className="parent-content-wrap parent-vetvisits-wrap">
      {/* ========================================================
          1. PAGE HEADER
          ======================================================== */}
      <div className="parent-vetvisits-header">
        <div className="parent-vetvisits-title-row">
          <div className="parent-vetvisits-icon-box">
            <Calendar size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="parent-vetvisits-title">Scheduled Vet Visits</h1>
            <p className="parent-vetvisits-subtitle">
              Track all booking requests and confirmed visits with your PetLink veterinarians.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="parent-btn-book-visit"
          onClick={() => navigate("/parent/vets")}
        >
          <Plus size={18} strokeWidth={2.5} /> Book Vet Visit
        </button>
      </div>

      {/* ========================================================
          2. TOP 3 STAT KPI CARDS
          ======================================================== */}
      <div className="parent-vetvisits-stats-grid">
        {/* Card 1: Upcoming Visits (Lavender) */}
        <div className="parent-vetstat-card lavender">
          <div className="parent-vetstat-top">
            <div className="parent-vetstat-icon-label">
              <div className="parent-vetstat-icon-circle">
                <Calendar size={18} strokeWidth={2.2} />
              </div>
              <span className="parent-vetstat-label">Upcoming Visits</span>
            </div>
            <span className="parent-vetstat-pill">Today & Soon</span>
          </div>
          <div className="parent-vetstat-bottom">
            <div>
              <div className="parent-vetstat-num">
                {String(upcomingCount).padStart(2, "0")}
              </div>
              <div className="parent-vetstat-subtext">
                <Check size={14} color="#6D28D9" strokeWidth={3} /> Both confirmed
              </div>
            </div>
            <div className="parent-vetstat-watermark">
              <PawPrint size={56} color="#7C3AED" />
            </div>
          </div>
        </div>

        {/* Card 2: Pending Review (Peach) */}
        <div className="parent-vetstat-card peach">
          <div className="parent-vetstat-top">
            <div className="parent-vetstat-icon-label">
              <div className="parent-vetstat-icon-circle">
                <Hourglass size={18} strokeWidth={2.2} />
              </div>
              <span className="parent-vetstat-label">Pending Review</span>
            </div>
            <span className="parent-vetstat-pill">Clinic Sync</span>
          </div>
          <div className="parent-vetstat-bottom">
            <div>
              <div className="parent-vetstat-num">
                {String(pendingCount).padStart(2, "0")}
              </div>
              <div className="parent-vetstat-subtext">
                <Check size={14} color="#5028FF" strokeWidth={3} /> All requests resolved
              </div>
            </div>
            <div className="parent-vetstat-watermark">
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  backgroundColor: "#C7D2FE",
                  opacity: 0.8
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Total Past Visits (Mint) */}
        <div className="parent-vetstat-card mint">
          <div className="parent-vetstat-top">
            <div className="parent-vetstat-icon-label">
              <div className="parent-vetstat-icon-circle">
                <Briefcase size={18} strokeWidth={2.2} />
              </div>
              <span className="parent-vetstat-label">Total Past Visits</span>
            </div>
            <span className="parent-vetstat-pill">Lifetime</span>
          </div>
          <div className="parent-vetstat-bottom">
            <div>
              <div className="parent-vetstat-num">14</div>
              <div className="parent-vetstat-subtext">
                <Heart size={13} color="#16A34A" fill="#16A34A" /> Up to date records
              </div>
            </div>
            <div className="parent-vetstat-watermark">
              {/* Bunny/Pet silhouette */}
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 5a2 2 0 0 1 4 0v4a2 2 0 0 1-4 0V5Z" />
                <path d="M14 7a2 2 0 0 1 4 0v5a2 2 0 0 1-4 0V7Z" />
                <path d="M6 14a6 6 0 1 0 12 0c0-3-2-5-6-5s-6 2-6 5Z" />
                <circle cx="9" cy="15" r="1" fill="#16A34A" />
                <circle cx="15" cy="15" r="1" fill="#16A34A" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. FILTER TABS & SEARCH BAR
          ======================================================== */}
      <div className="parent-vetvisits-filters-row">
        <div className="parent-vetvisits-tabs-pills">
          {tabs.map((tab) => {
            const isActive = filterStatus === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                className={`parent-vetvisits-tab-btn ${isActive ? "active" : ""}`}
                onClick={() => setFilterStatus(tab.key)}
              >
                {tab.label}
                {isActive && <span className="parent-vetvisits-tab-dot" />}
              </button>
            );
          })}
        </div>

        <div className="parent-vetvisits-search-box">
          <Search size={16} className="parent-vetvisits-search-icon" />
          <input
            type="text"
            className="parent-vetvisits-search-input"
            placeholder="Filter by pet or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ========================================================
          4. SUBHEADER (COUNT & HINT)
          ======================================================== */}
      <div className="parent-vetvisits-subhead">
        <span className="parent-vetvisits-subhead-count">
          ACTIVE SCHEDULE ({displayedAppointments.length} ITEMS)
        </span>
        <span className="parent-vetvisits-subhead-hint">
          <Info size={14} /> Click any card to inspect clinical records
        </span>
      </div>

      {/* ========================================================
          5. APPOINTMENTS LIST
          ======================================================== */}
      {isLoading ? (
        <div className="parent-vetvisits-list">
          {[...Array(2)].map((_, idx) => (
            <div
              key={idx}
              className="skeleton"
              style={{ height: "90px", borderRadius: "20px" }}
            />
          ))}
        </div>
      ) : displayedAppointments.length === 0 ? (
        <div
          className="parent-prep-guide-card"
          style={{ justifyContent: "center", textAlign: "center", padding: "48px 24px" }}
        >
          <div>
            <Calendar size={36} color="#5028FF" style={{ marginBottom: "12px" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1F2937", margin: "0 0 6px 0" }}>
              No {filterStatus === "All" ? "" : filterStatus.toLowerCase()} appointments found
            </h3>
            <p style={{ color: "#6B7280", fontSize: "0.88rem", margin: "0 0 16px 0" }}>
              {filterStatus === "Pending"
                ? "Browse our verified directory to request a booking with registered vets."
                : "You have no appointments currently in this category."}
            </p>
            <button
              type="button"
              className="parent-btn-book-visit"
              onClick={() => navigate("/parent/vets")}
            >
              <Plus size={16} /> Book Vet Visit
            </button>
          </div>
        </div>
      ) : (
        <div className="parent-vetvisits-list">
          {displayedAppointments.map((apt, index) => {
            const reasonClass =
              index % 2 === 0 ? "coral" : "peach";

            return (
              <div
                key={apt.id || index}
                className="parent-vetvisit-card"
                onClick={() => navigate(`/parent/pet/${apt.petId}`)}
              >
                {/* Left accent bar */}
                <div className="parent-vetvisit-accent-bar" />

                {/* Left: Pet Info */}
                <div className="parent-vetvisit-left">
                  <div className="parent-vetvisit-avatar-box">
                    {apt.petPhoto ? (
                      <img
                        src={apt.petPhoto}
                        alt={apt.petName}
                        className="parent-vetvisit-avatar-img"
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          color: "#5028FF",
                          backgroundColor: "#EEF2FF"
                        }}
                      >
                        {apt.petName?.[0] || "?"}
                      </div>
                    )}
                    <span className="parent-vetvisit-avatar-badge">
                      {index % 2 === 0 ? "🐾" : "🩹"}
                    </span>
                  </div>

                  <div className="parent-vetvisit-info">
                    <div className="parent-vetvisit-name-row">
                      <span className="parent-vetvisit-name">{apt.petName}</span>
                      <span className="parent-vetvisit-tag">{apt.petId}</span>
                    </div>
                    <div className="parent-vetvisit-reason-row">
                      <span className="parent-vetvisit-reason-label">Reason:</span>
                      <span className={`parent-vetvisit-reason-badge ${reasonClass}`}>
                        ● {apt.reason}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Date, Status & View Action */}
                <div className="parent-vetvisit-right">
                  <div className="parent-vetvisit-date-pill">
                    <Clock size={14} color="#5028FF" />
                    <span>{apt.date}</span>
                  </div>

                  <div
                    className={`parent-vetvisit-status-pill ${
                      apt.status === "Upcoming"
                        ? "upcoming"
                        : apt.status === "Pending"
                        ? "pending"
                        : "completed"
                    }`}
                  >
                    <Calendar size={13} />
                    <span>{apt.status}</span>
                  </div>

                  <button
                    type="button"
                    className="parent-vetvisit-btn-file"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/parent/pet/${apt.petId}`);
                    }}
                  >
                    <Eye size={14} /> View Pet File
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          6. BOTTOM DUAL CARDS (PREPARATION GUIDE & 24/7 HELPLINE)
          ======================================================== */}
      <div className="parent-vetvisits-bottom-grid">
        {/* Left: Preparation Guide Card */}
        <div className="parent-prep-guide-card">
          <div className="parent-prep-guide-left">
            <div className="parent-prep-guide-icon-box">
              <Plus size={28} strokeWidth={3} />
            </div>
            <div>
              <span className="parent-prep-guide-badge">PREPARATION GUIDE</span>
              <h3 className="parent-prep-guide-title">
                Before bringing Miya and Mani to the clinic
              </h3>
              <p className="parent-prep-guide-text">
                Please bring their medical passport, fast Mani 2 hours prior to stitch removal if requested, and note down recent body temperature readings for Miya.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="parent-prep-guide-btn"
            onClick={() => alert("Clinic Checklist: Medical passport, vaccination record, fasting notes, and current temperature readings.")}
          >
            Clinic Checklist
          </button>
        </div>

        {/* Right: Emergency Desk Helpline Card */}
        <div className="parent-emergency-desk-card">
          <div>
            <div className="parent-emergency-desk-header">
              <span className="parent-emergency-desk-badge">24/7 PET HELPLINE</span>
              <Phone size={16} color="#DC2626" />
            </div>
            <h3 className="parent-emergency-desk-title">Emergency Desk</h3>
            <p className="parent-emergency-desk-subtitle">
              Need to reschedule or report sudden acute symptoms prior to your visit?
            </p>
          </div>

          <div className="parent-emergency-desk-phone-row">
            <span className="parent-emergency-desk-number">+1 (800) PET-CARE</span>
            <button
              type="button"
              className="parent-emergency-desk-btn-call"
              onClick={() => alert("Connecting to PetLink 24/7 Emergency Line: +1 (800) PET-CARE")}
              title="Call Helpline"
            >
              <Phone size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentAppointments;
