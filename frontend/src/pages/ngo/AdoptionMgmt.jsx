import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { 
  Users, CheckCircle2, AlertCircle, Calendar, ClipboardCheck, 
  Clock, ArrowRight, X, Phone, UserCheck, MessageSquare,
  ClipboardList, ShieldCheck, PawPrint, RefreshCw, Plus, Star
} from "lucide-react";

const AdoptionMgmt = () => {
  const { adoptions, updateAdoptionStatus, updateAdoptionStatusPersisted, scheduleFollowUp, scheduleFollowUpPersisted } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [syncing, setSyncing] = useState(false);
  
  // Follow-up form state
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpInterval, setFollowUpInterval] = useState("30");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const columns = [
    { 
      label: "Applications Received", 
      key: "Applications Received", 
      color: "#64748B", 
      icon: <ClipboardList size={14} />,
      iconBoxBg: "#F1F5F9",
      countBg: "#F1F5F9"
    },
    { 
      label: "Applicant Verification", 
      key: "Applicant Verification", 
      color: "#D97706", 
      icon: <ShieldCheck size={14} />,
      iconBoxBg: "#FEF3C7",
      countBg: "#FEF3C7"
    },
    { 
      label: "Approved", 
      key: "Approved", 
      color: "#059669", 
      icon: <CheckCircle2 size={14} />,
      iconBoxBg: "#D1FAE5",
      countBg: "#D1FAE5"
    },
    { 
      label: "Follow-up Scheduled", 
      key: "Follow-up Scheduled", 
      color: "#2563EB", 
      icon: <Calendar size={14} />,
      iconBoxBg: "#DBEAFE",
      countBg: "#DBEAFE"
    }
  ];

  const getAppsByColumn = (colKey) => {
    return (adoptions || []).filter(app => app.status === colKey);
  };

  const handleOpenDetail = (app) => {
    setSelectedApp(app);
    setShowFollowUpForm(false);
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    try {
      await updateAdoptionStatusPersisted(selectedApp.id, "Approved");
      setSelectedApp(prev => ({ ...prev, status: "Approved" }));
    } catch (err) {}
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    try {
      await updateAdoptionStatusPersisted(selectedApp.id, "Rejected");
      setSelectedApp(null);
    } catch (err) {}
  };

  const handleMoveToVerification = async () => {
    if (!selectedApp) return;
    try {
      await updateAdoptionStatusPersisted(selectedApp.id, "Applicant Verification");
      setSelectedApp(prev => ({ ...prev, status: "Applicant Verification" }));
    } catch (err) {}
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!followUpDate) return;
    try {
      await scheduleFollowUpPersisted(selectedApp.id, followUpDate, followUpInterval);
    } catch (err) {
      return;
    }
    setSelectedApp(prev => ({
      ...prev,
      status: "Follow-up Scheduled",
      followUpDate, 
      followUpInterval 
    }));
    setShowFollowUpForm(false);
  };

  const handleSyncRecords = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
    }, 600);
  };

  const currentApp = (adoptions || []).find(a => a.id === (selectedApp && selectedApp.id)) || selectedApp;

  // Mascot metadata generator to precisely match reference design
  const getMascotMeta = (app) => {
    const name = (app.animalName || "").toLowerCase();
    if (name.includes("rocky")) {
      return {
        avatarEmoji: "🐶",
        avatarBg: "#FEF3C7",
        avatarBorder: "#FDE68A",
        badgeIcon: app.status === "Follow-up Scheduled" ? "📅" : "⭐",
        badgeBg: app.status === "Follow-up Scheduled" ? "#2563EB" : "#FEF3C7",
        badgeColor: app.status === "Follow-up Scheduled" ? "#FFFFFF" : "#B45309",
        tag: app.status === "Applications Received" ? "New" : null,
        floatEmoji: "📝🐾"
      };
    }
    if (name.includes("mani")) {
      return {
        avatarEmoji: "🐱",
        avatarBg: "#D1FAE5",
        avatarBorder: "#A7F3D0",
        badgeIcon: "🔍",
        badgeBg: "#F59E0B",
        badgeColor: "#FFFFFF",
        tag: null,
        floatEmoji: "🔍🏡"
      };
    }
    if (name.includes("sheru")) {
      return {
        avatarEmoji: "🐶",
        avatarBg: "#FFEDD5",
        avatarBorder: "#FED7AA",
        badgeIcon: "✔",
        badgeBg: "#10B981",
        badgeColor: "#FFFFFF",
        tag: "STAR",
        floatEmoji: "🐕🎉"
      };
    }
    if (name.includes("billo")) {
      return {
        avatarEmoji: "🐱",
        avatarBg: "#FFF3E8",
        avatarBorder: "#FFD9B3",
        badgeIcon: "📞",
        badgeBg: "#2563EB",
        badgeColor: "#FFFFFF",
        tag: null,
        floatEmoji: "📞🐱"
      };
    }
    // Default (e.g. test bunny)
    return {
      avatarEmoji: "🐰",
      avatarBg: "#FCE7F3",
      avatarBorder: "#FBCFE8",
      badgeIcon: "✔",
      badgeBg: "#10B981",
      badgeColor: "#FFFFFF",
      tag: null,
      floatEmoji: "🎉✨"
    };
  };

  const totalActiveApps = (adoptions || []).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* ========================================================
          PAGE HEADER WITH MASCOT EDITION & ACTIVE STATUS
      ======================================================== */}
      <div className="ngo-adopt-header-wrap">
        <div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#1F2937", letterSpacing: "-0.02em", margin: 0, display: "flex", alignItems: "center" }}>
            Adoption Pipeline Control
            <span style={{ fontSize: "1.2rem", marginLeft: "6px" }}>🐾</span>
            <span className="ngo-adopt-mascot-badge">🧡 Mascot Edition</span>
          </h1>
          <p style={{ color: "#6B7280", fontSize: "0.95rem", margin: "6px 0 0 0", fontWeight: 500 }}>
            Track applicant checklists, manage virtual home verifications, and schedule follow-ups.
          </p>
        </div>

        <div className="ngo-adopt-active-badge">
          <span className="ngo-adopt-active-dot" />
          <span>{totalActiveApps} Active Applications in Process</span>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="skeleton skeleton-card" style={{ height: "480px", borderRadius: "24px" }} />
          ))}
        </div>
      ) : (
        <>
          {/* ========================================================
              MAIN 4-STAGE PIPELINE KANBAN BOARD
          ======================================================== */}
          <div className="ngo-adopt-kanban">
            
            {columns.map((col) => {
              const apps = getAppsByColumn(col.key);
              return (
                <div key={col.key} className="ngo-adopt-column">
                  
                  {/* Column Header */}
                  <div className="ngo-adopt-col-head" style={{ borderBottomColor: col.color }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: col.color, display: "flex", alignItems: "center" }}>
                        {col.icon}
                      </span>
                      <span style={{ fontSize: "0.86rem", fontWeight: 800, color: col.color }}>
                        {col.label}
                      </span>
                    </div>

                    <span className="ngo-adopt-count-pill" style={{ backgroundColor: col.countBg, color: col.color }}>
                      {apps.length}
                    </span>
                  </div>

                  {/* Column Cards List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", flexGrow: 1 }}>
                    {apps.length === 0 ? (
                      <div style={{
                        textAlign: "center",
                        padding: "40px 16px",
                        color: "#9CA3AF",
                        fontSize: "0.85rem",
                        border: "2px dashed #E5DDD4",
                        borderRadius: "18px",
                        margin: "auto 0",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "10px",
                        backgroundColor: "rgba(255,255,255,0.4)"
                      }}>
                        <div style={{ width: "42px", height: "42px", borderRadius: "50%", backgroundColor: col.iconBoxBg, display: "flex", alignItems: "center", justifyContent: "center", color: col.color }}>
                          <PawPrint size={18} />
                        </div>
                        <span style={{ fontWeight: 600 }}>No applications in this stage</span>
                      </div>
                    ) : (
                      apps.map((app) => {
                        const mascot = getMascotMeta(app);
                        return (
                          <div
                            key={app.id}
                            onClick={() => handleOpenDetail(app)}
                            className="ngo-adopt-card animate-slide-up"
                          >
                            {/* Card Top Row: Mascot Avatar + Name + Tags + ID */}
                            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                              <div className="ngo-adopt-avatar-container">
                                <div
                                  className="ngo-adopt-avatar"
                                  style={{ backgroundColor: mascot.avatarBg, borderColor: mascot.avatarBorder }}
                                >
                                  {mascot.avatarEmoji}
                                </div>
                                <div
                                  className="ngo-adopt-avatar-badge"
                                  style={{ backgroundColor: mascot.badgeBg, color: mascot.badgeColor }}
                                >
                                  {mascot.badgeIcon}
                                </div>
                              </div>

                              <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#1F2937" }}>
                                    {app.animalName}
                                  </span>
                                  {mascot.tag === "New" && (
                                    <span className="ngo-adopt-tag-new">New</span>
                                  )}
                                  {mascot.tag === "STAR" && (
                                    <span className="ngo-adopt-tag-star">★ STAR</span>
                                  )}
                                </div>
                                <span style={{ fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 600, marginTop: "2px" }}>
                                  ID: {app.animalId && app.animalId.length > 13 ? app.animalId.slice(0, 11) + "..." : (app.animalId || "PET-100")}
                                </span>
                              </div>
                            </div>

                            {/* Middle Row: Applicant Name */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#9CA3AF", letterSpacing: "0.5px" }}>
                                APPLICANT
                              </span>
                              <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#1F2937" }}>
                                {app.applicantName}
                              </span>
                            </div>

                            {/* Bottom Row: Date Pills & Floating Emoji */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "2px" }}>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                <span className="ngo-adopt-date-pill">
                                  <Clock size={11} /> APP: {app.date}
                                </span>
                              </div>

                              {app.followUpDate && (
                                <div>
                                  <span className="ngo-adopt-follow-pill">
                                    <Calendar size={11} /> FOLLOW UP: {app.followUpDate}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Floating decorative emoji in corner */}
                            <div className="ngo-adopt-emoji-float">
                              {mascot.floatEmoji}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              );
            })}

          </div>

          {/* ========================================================
              BOTTOM PROTOCOL ACTION STRIP
          ======================================================== */}
          <div className="ngo-adopt-bottom-bar">
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                backgroundColor: "#FAF5EE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.3rem",
                flexShrink: 0
              }}>
                🐾
              </div>
              <div>
                <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#1F2937" }}>
                  Virtual Home Check Protocol v3.2 Active
                </div>
                <div style={{ fontSize: "0.8rem", color: "#6B7280", marginTop: "2px" }}>
                  All automated reminders and SMS notices are synchronized with volunteer schedules.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button
                className="btn"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: "9999px",
                  padding: "8px 18px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#374151",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onClick={handleSyncRecords}
              >
                <RefreshCw size={13} className={syncing ? "animate-spin" : ""} /> Sync Records
              </button>
              
              <button
                className="btn"
                style={{
                  backgroundColor: "#FF6E14",
                  border: "none",
                  borderRadius: "9999px",
                  padding: "8px 20px",
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 12px rgba(255, 110, 20, 0.25)",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onClick={() => {
                  if (columns[0] && getAppsByColumn(columns[0].key)[0]) {
                    handleOpenDetail(getAppsByColumn(columns[0].key)[0]);
                  }
                }}
              >
                <Plus size={14} /> New Applicant
              </button>
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          UNIFIED GLASSMORPHISM MODAL: ADOPTION APPLICATION DOSSIER
      ======================================================== */}
      {currentApp && (
        <div className="ngo-modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="ngo-modal-card animate-scale-up" style={{ maxWidth: "580px" }} onClick={(e) => e.stopPropagation()}>
            <div className="ngo-modal-header">
              <div className="ngo-modal-header-left">
                <div className="ngo-modal-icon-badge">
                  📑
                </div>
                <div>
                  <h2 className="ngo-modal-title">Adoption Application Case</h2>
                  <p className="ngo-modal-subtitle">Review applicant eligibility, background checks, and custody approval.</p>
                </div>
              </div>
              <button className="ngo-modal-close-btn" onClick={() => setSelectedApp(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="ngo-modal-body">
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Pet Summary Card */}
                <div style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "center",
                  background: "linear-gradient(135deg, #FFF9F3 0%, #FFF3E8 100%)",
                  padding: "16px 20px",
                  borderRadius: "18px",
                  border: "1.5px solid #FED7AA"
                }}>
                  <div style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    backgroundColor: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    border: "1px solid #FED7AA",
                    flexShrink: 0
                  }}>
                    {getMascotMeta(currentApp).avatarEmoji}
                  </div>
                  <div>
                    <span style={{
                      backgroundColor: "#FFEDD5",
                      color: "#C2410C",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      borderRadius: "6px",
                      padding: "2px 8px",
                      display: "inline-block",
                      marginBottom: "4px"
                    }}>
                      PET FOR ADOPTION
                    </span>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#1F2937", margin: 0 }}>
                      {currentApp.animalName} ({currentApp.animalId})
                    </h3>
                  </div>
                </div>

                {/* Applicant Profile Grid */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <h4 style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "#9CA3AF", letterSpacing: "0.5px", margin: 0 }}>
                    Applicant Information
                  </h4>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "14px",
                    background: "#FAF8F5",
                    border: "1px solid #EFEAE2",
                    borderRadius: "16px",
                    padding: "16px"
                  }}>
                    <div>
                      <span style={{ color: "#9CA3AF", fontSize: "0.75rem", fontWeight: 700, display: "block" }}>Full Name</span>
                      <strong style={{ color: "#1F2937", fontSize: "0.92rem" }}>{currentApp.applicantName}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#9CA3AF", fontSize: "0.75rem", fontWeight: 700, display: "block" }}>Phone Contact</span>
                      <strong style={{ color: "#1F2937", fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Phone size={12} color="#EA580C" /> {currentApp.applicantContact}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: "#9CA3AF", fontSize: "0.75rem", fontWeight: 700, display: "block" }}>Date Applied</span>
                      <strong style={{ color: "#1F2937", fontSize: "0.92rem" }}>{currentApp.date}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#9CA3AF", fontSize: "0.75rem", fontWeight: 700, display: "block" }}>Stage Status</span>
                      <strong style={{ color: "#EA580C", fontSize: "0.92rem" }}>{currentApp.status}</strong>
                    </div>
                  </div>
                </div>

                {/* Background Verification notes */}
                <div style={{
                  backgroundColor: "#FFFDF9",
                  padding: "16px",
                  borderRadius: "16px",
                  border: "1px solid #FDE68A"
                }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#92400E", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px", margin: "0 0 6px 0" }}>
                    <ClipboardCheck size={16} color="#EA580C" /> Background Verification Log
                  </h4>
                  <p style={{ fontSize: "0.85rem", color: "#B45309", lineHeight: 1.5, margin: 0 }}>
                    {currentApp.notes || "Applicant has completed preliminary telephone screening. Virtual home tour scheduled."}
                  </p>
                </div>

                {/* If follow-up date details exist */}
                {currentApp.followUpDate && (
                  <div style={{
                    backgroundColor: "#ECFDF5",
                    padding: "14px 18px",
                    borderRadius: "16px",
                    border: "1px solid #A7F3D0",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "0.85rem",
                    color: "#059669"
                  }}>
                    <Calendar size={18} />
                    <div>
                      <strong>Scheduled Follow-Up: </strong>
                      <span>In {currentApp.followUpInterval} days (scheduled for {currentApp.followUpDate}).</span>
                    </div>
                  </div>
                )}

                {/* Follow-up Scheduler Form */}
                {showFollowUpForm && (
                  <form onSubmit={handleScheduleSubmit} className="animate-slide-up" style={{
                    backgroundColor: "#FAF8F5",
                    padding: "16px",
                    borderRadius: "16px",
                    border: "1.5px solid #EFEAE2",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px"
                  }}>
                    <h4 style={{ fontSize: "0.88rem", fontWeight: 800, color: "#1F2937", margin: 0 }}>Schedule Post-Adoption Audit</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
                      <div>
                        <label className="ngo-modal-label">Audit Date</label>
                        <input
                          type="date"
                          required
                          className="ngo-modal-input"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="ngo-modal-label">Interval Trigger</label>
                        <select
                          className="ngo-modal-input"
                          value={followUpInterval}
                          onChange={(e) => setFollowUpInterval(e.target.value)}
                        >
                          <option value="7">7 Days Checkup</option>
                          <option value="30">30 Days Checkup</option>
                          <option value="90">90 Days Checkup</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                      <button type="button" className="ngo-modal-btn-cancel" style={{ flex: 1 }} onClick={() => setShowFollowUpForm(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="ngo-modal-btn-primary" style={{ flex: 1 }}>
                        Commit Schedule
                      </button>
                    </div>
                  </form>
                )}

              </div>
            </div>

            <div className="ngo-modal-footer">
              {currentApp.status === "Applications Received" && (
                <button className="ngo-modal-btn-primary" style={{ flex: 1 }} onClick={handleMoveToVerification}>
                  Move to Verification
                </button>
              )}
              {currentApp.status === "Applicant Verification" && (
                <>
                  <button className="ngo-modal-btn-cancel" style={{ flex: 0.5, color: "#DC2626", borderColor: "#FECACA" }} onClick={handleReject}>
                    Reject
                  </button>
                  <button className="ngo-modal-btn-primary" style={{ flex: 1 }} onClick={handleApprove}>
                    Approve & Grant Custody
                  </button>
                </>
              )}
              {currentApp.status === "Approved" && !showFollowUpForm && (
                <button className="ngo-modal-btn-primary" style={{ flex: 1 }} onClick={() => setShowFollowUpForm(true)}>
                  Schedule Follow-up
                </button>
              )}
              <button className="ngo-modal-btn-cancel" style={{ flex: 0.4 }} onClick={() => setSelectedApp(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdoptionMgmt;
