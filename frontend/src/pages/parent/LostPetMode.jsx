import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import {
  AlertTriangle,
  MapPin,
  X,
  Check,
  Eye,
  Radio,
  Users,
  ShieldCheck,
  Zap,
  Lock,
  QrCode,
  Clock,
  Compass,
  FileText
} from "lucide-react";

const LostPetMode = () => {
  const { animals, updateAnimalPersisted, addToast, foundReports } = useApp();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const petIdParam = searchParams.get("petId");

  // Get only pets strictly owned by this parent
  const parentPets = (animals || []).filter(
    (p) =>
      (p.ownerId === user?.id || p.ownerId?.toString() === user?.id) &&
      (p.status === "Adopted" || p.status === "Lost")
  );

  const [selectedPetId, setSelectedPetId] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Form fields for lost report
  const [lostLocation, setLostLocation] = useState("Satellite, Ahmedabad");
  const [additionalNotes, setAdditionalNotes] = useState(
    "Wearing a collar with PawSetu digital QR ID tag. Friendly domestic pet."
  );

  // Pre-select pet from query param or default to first pet
  useEffect(() => {
    if (petIdParam) {
      setSelectedPetId(petIdParam);
    } else if (parentPets.length > 0 && !selectedPetId) {
      setSelectedPetId(parentPets[0].id);
    }
  }, [petIdParam, parentPets]);

  const activePet = parentPets.find((p) => p.id === selectedPetId) || parentPets[0];

  const handleReportLost = () => {
    if (!activePet) return;
    setShowConfirmModal(true);
  };

  const handleConfirmLost = async (e) => {
    e.preventDefault();
    if (!activePet) return;

    const timelineMsg = `Reported Lost at ${lostLocation}. Notes: ${additionalNotes}`;
    const updatedTimeline = [
      {
        date: new Date().toISOString().split("T")[0],
        title: "⚠️ Reported Lost",
        description: timelineMsg
      },
      ...(activePet.timeline || [])
    ];

    try {
      await updateAnimalPersisted(activePet.id, {
        status: "Lost",
        timeline: updatedTimeline,
        lastUpdated: "Just now"
      });
      addToast("Nearest NGOs notified. Tag scan matching primed.", "warning");
      setShowConfirmModal(false);
    } catch (err) {
      // toast shown in context
    }
  };

  const handleMarkFound = async () => {
    if (!activePet) return;

    const updatedTimeline = [
      {
        date: new Date().toISOString().split("T")[0],
        title: "💚 Marked as Found",
        description: "Pet safely recovered outside tag scan matches."
      },
      ...(activePet.timeline || [])
    ];

    try {
      await updateAnimalPersisted(activePet.id, {
        status: "Adopted",
        timeline: updatedTimeline,
        lastUpdated: "Just now"
      });
      addToast(`${activePet.name} marked as found! Safe return logged.`, "success");
    } catch (err) {
      // toast shown in context
    }
  };

  return (
    <div className="parent-content-wrap">
      {/* ========================================================
          1. PAGE HEADER
          ======================================================== */}
      <div className="parent-lostalerts-header">
        <div>
          <div className="parent-lostalerts-badge">
            <span className="parent-lostalerts-badge-dot" />
            EMERGENCY BROADCAST MESH
          </div>
          <h1 className="parent-lostalerts-title">
            Lost Pet Alert Center 🐾
          </h1>
          <p className="parent-lostalerts-sub">
            Activate emergency municipal tags, dispatch missing reports to nearby shelter nodes, and prime scan matches.
          </p>
        </div>

        <div className="parent-lostalerts-mesh-badge">
          <div className="parent-lostalerts-mesh-icon">
            <Radio size={18} strokeWidth={2.5} />
          </div>
          <div className="parent-lostalerts-mesh-info">
            <span className="parent-lostalerts-mesh-label">SHELTER NODE MESH</span>
            <span className="parent-lostalerts-mesh-sub">
              24 Active Radii <span className="parent-lostalerts-mesh-dot" />
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. TOP 3 STAT KPI CARDS
          ======================================================== */}
      <div className="parent-lostalerts-stats-grid">
        {/* Card 1: Tag Status */}
        <div className="parent-loststat-card lavender">
          <div className="parent-loststat-top">
            <span className="parent-loststat-label">TAG STATUS</span>
            <div className="parent-loststat-icon-circle">
              <QrCode size={16} strokeWidth={2.2} />
            </div>
          </div>
          <div className="parent-loststat-val">Instant</div>
          <span className="parent-loststat-pill">
            <Zap size={13} fill="#6D28D9" color="#6D28D9" /> QR Collar Ready
          </span>
        </div>

        {/* Card 2: Community Patrol */}
        <div className="parent-loststat-card peach">
          <div className="parent-loststat-top">
            <span className="parent-loststat-label">COMMUNITY PATROL</span>
            <div className="parent-loststat-icon-circle">
              <Users size={16} strokeWidth={2.2} />
            </div>
          </div>
          <div className="parent-loststat-val">1,480</div>
          <span className="parent-loststat-pill">
            <MapPin size={13} color="#C2410C" /> Ahmedabad Hub
          </span>
        </div>

        {/* Card 3: Recovery Ratio */}
        <div className="parent-loststat-card mint">
          <div className="parent-loststat-top">
            <span className="parent-loststat-label">RECOVERY RATIO</span>
            <div className="parent-loststat-icon-circle">
              <ShieldCheck size={16} strokeWidth={2.2} />
            </div>
          </div>
          <div className="parent-loststat-val">94.2%</div>
          <span className="parent-loststat-pill">
            <Clock size={13} color="#15803D" /> Within first 12 hrs
          </span>
        </div>
      </div>

      {/* ========================================================
          3. MAIN 2-COLUMN SPLIT SECTION
          ======================================================== */}
      {parentPets.length === 0 ? (
        <div
          className="parent-lostalerts-select-card"
          style={{ textAlign: "center", padding: "48px 24px" }}
        >
          <AlertTriangle size={36} color="#EA580C" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1F2937", margin: "0 0 6px" }}>
            No registered pets found
          </h3>
          <p style={{ color: "#6B7280", fontSize: "0.88rem", margin: "0 0 16px" }}>
            You do not have any registered pets in parent custody yet.
          </p>
          <button
            type="button"
            className="parent-btn-book-visit"
            style={{ margin: "0 auto" }}
            onClick={() => navigate("/parent/register")}
          >
            Register Family Pet
          </button>
        </div>
      ) : (
        <div className="parent-lostalerts-main-grid">
          {/* Left Column */}
          <div className="parent-lostalerts-left-col">
            {/* Dropdown Card */}
            <div className="parent-lostalerts-select-card">
              <div className="parent-lostalerts-select-head">
                <span className="parent-lostalerts-select-title">
                  <span className="parent-lostalerts-select-title-dot" />
                  Select Pet to Audit / Report
                </span>
                <span className="parent-lostalerts-select-badge">REGISTERED</span>
              </div>

              <select
                className="parent-lostalerts-dropdown"
                value={activePet?.id || ""}
                onChange={(e) => setSelectedPetId(e.target.value)}
              >
                {parentPets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name.toLowerCase()} ({p.id}) — [{p.status}]
                  </option>
                ))}
              </select>

              <p className="parent-lostalerts-select-sub">
                Choose a registered household member to verify municipal tags or configure emergency broadcast triggers.
              </p>
            </div>

            {/* Active Pet Preview Card */}
            {activePet && (
              <div className="parent-lostalerts-pet-card">
                <div className="parent-lostalerts-pet-header">
                  <div className="parent-lostalerts-pet-thumb-box">
                    {activePet.photo ? (
                      <img
                        src={activePet.photo}
                        alt={activePet.name}
                        className="parent-lostalerts-pet-thumb"
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
                          color: "#EA580C",
                          backgroundColor: "#FFEDD5"
                        }}
                      >
                        {activePet.name?.[0] || "?"}
                      </div>
                    )}
                    <span className="parent-lostalerts-pet-check">✓</span>
                  </div>

                  <div className="parent-lostalerts-pet-meta">
                    <div className="parent-lostalerts-pet-topline">
                      <span className="parent-lostalerts-pet-name">
                        {activePet.name}
                      </span>
                      <span
                        className={`parent-lostalerts-pet-status ${
                          activePet.status === "Lost" ? "lost" : "adopted"
                        }`}
                      >
                        {activePet.status}
                      </span>
                      <button
                        type="button"
                        className="parent-lostalerts-btn-viewfile"
                        onClick={() => navigate(`/parent/pet/${activePet.id}`)}
                      >
                        <Eye size={12} /> View File
                      </button>
                    </div>
                    <span className="parent-lostalerts-pet-id">
                      ID: {activePet.id?.slice(0, 8)}...
                    </span>
                  </div>
                </div>

                {/* 3 Metrics Specs Box */}
                <div className="parent-lostalerts-specs-grid">
                  <div className="parent-lostalerts-spec-col">
                    <span className="parent-lostalerts-spec-label">SPECIES</span>
                    <span className="parent-lostalerts-spec-val">
                      {activePet.species} ({activePet.breed || "Tabby"})
                    </span>
                  </div>
                  <div className="parent-lostalerts-spec-col">
                    <span className="parent-lostalerts-spec-label">MICROCHIP</span>
                    <span className="parent-lostalerts-spec-val">Synced</span>
                  </div>
                  <div className="parent-lostalerts-spec-col">
                    <span className="parent-lostalerts-spec-label">COLLAR TAG</span>
                    <span className="parent-lostalerts-spec-val active-green">Active</span>
                  </div>
                </div>
              </div>
            )}

            {/* Protocol Notice */}
            <div className="parent-lostalerts-protocol-card">
              <div className="parent-lostalerts-protocol-icon">
                <Compass size={17} />
              </div>
              <div>
                <h4 className="parent-lostalerts-protocol-title">24/7 Municipal Protocol</h4>
                <p className="parent-lostalerts-protocol-sub">
                  Shelters across Ahmedabad scan PawSetu tags in real-time.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Missing Action Panel */}
          {activePet && (
            <div className="parent-lostalerts-action-card">
              <div className="parent-lostalerts-pin-bubble">
                <MapPin size={36} strokeWidth={2.2} />
                <span className="parent-lostalerts-pin-badge">!</span>
              </div>

              <h2 className="parent-lostalerts-action-title">
                Is {activePet.name.toLowerCase()} Missing?
              </h2>
              <p className="parent-lostalerts-action-desc">
                If your pet has slipped away, immediately trigger Lost Mode. This will broadcast a missing card to local shelter dispatch boards and flag their collar QR code.
              </p>

              {/* 3 Step Pill Boxes */}
              <div className="parent-lostalerts-steps-grid">
                <div className="parent-lostalerts-step-box">
                  <span className="parent-lostalerts-step-num">1</span>
                  <span className="parent-lostalerts-step-title">Collar Lockdown</span>
                  <span className="parent-lostalerts-step-sub">Scans trigger GPS notify</span>
                </div>
                <div className="parent-lostalerts-step-box">
                  <span className="parent-lostalerts-step-num">2</span>
                  <span className="parent-lostalerts-step-title">Shelter Dispatch</span>
                  <span className="parent-lostalerts-step-sub">Missing board syndication</span>
                </div>
                <div className="parent-lostalerts-step-box">
                  <span className="parent-lostalerts-step-num">3</span>
                  <span className="parent-lostalerts-step-title">Parent Hotline</span>
                  <span className="parent-lostalerts-step-sub">Instant finder chat line</span>
                </div>
              </div>

              {activePet.status === "Lost" ? (
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div
                    style={{
                      backgroundColor: "#FEE2E2",
                      border: "1px solid #FECACA",
                      borderRadius: "14px",
                      padding: "14px 18px",
                      color: "#DC2626",
                      fontWeight: 700,
                      fontSize: "0.88rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                  >
                    <AlertTriangle size={18} /> Active Lost Alert Broadcasting Live!
                  </div>
                  <button
                    type="button"
                    className="parent-btn-book-visit"
                    style={{
                      backgroundColor: "#16A34A",
                      boxShadow: "0 4px 14px rgba(22, 163, 74, 0.3)",
                      justifyContent: "center"
                    }}
                    onClick={handleMarkFound}
                  >
                    <Check size={16} strokeWidth={3} /> Mark {activePet.name} as Found / Recovered
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="parent-lostalerts-btn-report"
                  onClick={handleReportLost}
                >
                  <Radio size={18} /> Report {activePet.name.toLowerCase()} as Lost
                </button>
              )}

              <div className="parent-lostalerts-auth-notice">
                <Lock size={12} /> Requires parent authentication confirmation
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          4. BOTTOM SAFE ZONES FULL-WIDTH CARD
          ======================================================== */}
      <div className="parent-lostalerts-safezones-card">
        <div className="parent-lostalerts-safezones-header">
          <div>
            <h3 className="parent-lostalerts-safezones-title">
              Active Neighborhood Safe Zones
            </h3>
            <p className="parent-lostalerts-safezones-sub">
              Emergency beacons will automatically ping certified rescue partners within your territory.
            </p>
          </div>
          <span className="parent-lostalerts-zone-pill">
            <span className="parent-lostalerts-zone-dot" /> Ahmedabad Zone 4
          </span>
        </div>

        <div className="parent-lostalerts-map-canvas">
          {/* Stylized background grid waves */}
          <svg
            width="100%"
            height="100%"
            style={{ position: "absolute", top: 0, left: 0, opacity: 0.15 }}
          >
            <path
              d="M0 100 Q 300 20 600 120 T 1200 60"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4"
            />
            <path
              d="M0 140 Q 400 60 800 160 T 1400 90"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="6"
            />
          </svg>

          <div className="parent-lostalerts-map-pin-pill">
            <Compass size={16} color="#FF6A00" />
            <span>Registered Residence: Satellite, Ahmedabad</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          5. CONFIRMATION MODAL: LOST DETAILS FORM
          ======================================================== */}
      {showConfirmModal && activePet && (
        <div
          className="modal-overlay"
          onClick={() => setShowConfirmModal(false)}
          style={{ zIndex: 9999 }}
        >
          <div
            className="modal-content animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "500px", borderRadius: "24px" }}
          >
            <div className="modal-header">
              <h2
                style={{
                  fontWeight: 800,
                  color: "#DC2626",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "1.2rem"
                }}
              >
                <AlertTriangle size={20} /> Confirm Lost Report
              </h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowConfirmModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmLost} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <p style={{ fontSize: "0.88rem", color: "#374151", lineHeight: 1.5, margin: 0 }}>
                You are about to flag <strong>{activePet.name} ({activePet.id})</strong> as missing in the municipal database. Please supply details to aid local volunteer staff:
              </p>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>Last Seen Location *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={lostLocation}
                  onChange={(e) => setLostLocation(e.target.value)}
                  style={{ borderRadius: "12px", padding: "10px 14px" }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>Additional Identifying Notes</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  style={{ borderRadius: "12px", padding: "10px 14px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1, borderRadius: "9999px" }}
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="parent-lostalerts-btn-report"
                  style={{ flex: 1, padding: "12px 20px" }}
                >
                  Confirm Report Lost
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostPetMode;
