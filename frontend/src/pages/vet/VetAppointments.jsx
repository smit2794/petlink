import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { Clock, Eye, Check, X, Calendar, Hourglass, CheckCircle2, XCircle } from "lucide-react";
import "../../styles/vet.css";

const VetAppointments = () => {
  const {
    vetAppointments,
    completeVetAppointment,
    completeVetAppointmentPersisted,
    rescheduleVetAppointmentPersisted,
    respondToVetAppointment,
    animals,
    addToast
  } = useApp();

  const [filterStatus, setFilterStatus] = useState("Upcoming");
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [rescheduling, setRescheduling] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [respondingId, setRespondingId] = useState(null);

  // For "Propose New Time" inline flow
  const [proposingId, setProposingId] = useState(null);
  const [proposedDate, setProposedDate] = useState("");

  const navigate = useNavigate();

  // Separate Pending from everything else
  const pendingAppointments = vetAppointments.filter(apt => apt.status === "Pending");
  const upcomingAppointments = vetAppointments.filter(apt => apt.status === "Upcoming");

  const filteredAppointments = vetAppointments.filter(apt => {
    if (apt.status === "Pending") return false; // always excluded from confirmed tabs
    if (filterStatus === "Upcoming") return apt.status === "Upcoming";
    if (filterStatus === "Completed") return apt.status === "Completed";
    return true; // "All" — Upcoming + Completed + Declined
  });

  const getPetPhoto = (apt) => {
    if (apt.petPhoto) return apt.petPhoto;
    const found = animals?.find(a => a.id === apt.petId || a.name?.toLowerCase() === apt.petName?.toLowerCase());
    return found?.photo || null;
  };

  const getBadgeIcon = (apt) => {
    const reason = (apt.reason || "").toLowerCase();
    if (reason.includes("fever") || reason.includes("vaccin") || reason.includes("injection") || reason.includes("surgery") || reason.includes("stitches")) {
      return reason.includes("stitches") ? "🩹" : "💉";
    }
    if (reason.includes("dosage") || reason.includes("worm") || reason.includes("pill") || reason.includes("antibiotic")) {
      return "💊";
    }
    return "🩺";
  };

  const handleOpenReschedule = (apt) => {
    setSelectedApt(apt);
    setNewDate(apt.date);
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApt || !newDate) return;
    setRescheduling(true);
    try {
      if (rescheduleVetAppointmentPersisted) {
        await rescheduleVetAppointmentPersisted(selectedApt.id, newDate);
      } else {
        selectedApt.date = newDate;
        if (addToast) {
          addToast(`Appointment rescheduled for ${selectedApt.petName}`, "success");
        }
      }
      setShowRescheduleModal(false);
      setSelectedApt(null);
    } catch (err) {
      console.error("Failed to reschedule appointment:", err);
    } finally {
      setRescheduling(false);
    }
  };

  const handleComplete = async (aptId) => {
    if (completingId) return;
    setCompletingId(aptId);
    try {
      if (completeVetAppointmentPersisted) {
        await completeVetAppointmentPersisted(aptId);
      } else {
        completeVetAppointment(aptId);
      }
    } catch (err) {
      console.error("Failed to complete appointment:", err);
      completeVetAppointment(aptId);
    } finally {
      setCompletingId(null);
    }
  };

  const handleRespond = async (aptId, action, pDate) => {
    if (respondingId) return;
    setRespondingId(aptId);
    try {
      await respondToVetAppointment(aptId, action, pDate);
      if (proposingId === aptId) {
        setProposingId(null);
        setProposedDate("");
      }
    } catch (err) {
      console.error("Failed to respond to appointment:", err);
    } finally {
      setRespondingId(null);
    }
  };

  const handleProposeConfirm = (aptId) => {
    if (!proposedDate) {
      if (addToast) addToast("Please enter a proposed date.", "warning");
      return;
    }
    handleRespond(aptId, "accept-with-new-time", proposedDate);
  };

  return (
    <div className="vet-apt-container animate-fade-in">

      {/* Header with Dr. Paws Reminder */}
      <div className="vet-apt-header">
        <div className="vet-apt-title-group">
          <h1 className="vet-apt-title">
            Appointments <span>🩺🐾</span>
          </h1>
          <p className="vet-apt-subtitle">
            Review pending parent requests and manage your scheduled clinic follow-ups.
          </p>
        </div>

        {/* Dr. Paws Reminder Card */}
        <div className="vet-apt-reminder-card">
          <div className="vet-apt-reminder-avatar">
            🐶
          </div>
          <div>
            <h4 className="vet-apt-reminder-title">Dr. Paws Reminder</h4>
            <p className="vet-apt-reminder-text">
              {upcomingAppointments.length} appointment{upcomingAppointments.length === 1 ? "" : "s"} lined up for check-up today!
            </p>
          </div>
        </div>
      </div>

      {/* Pending Booking Requests Section (Parent-initiated) */}
      {pendingAppointments.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "#FFFDF9", border: "1.5px solid #FDE68A", borderRadius: "20px", padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "8px", height: "8px", borderRadius: "50%",
              backgroundColor: "#D97706", animation: "pulse 1.5s infinite"
            }} />
            <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#92400E", margin: 0 }}>
              Pending Booking Requests ({pendingAppointments.length})
            </h2>
          </div>

          {pendingAppointments.map((apt) => (
            <div
              key={apt.id}
              style={{
                padding: "14px 18px",
                border: "1px solid #EDE6DD",
                borderRadius: "14px",
                backgroundColor: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div className="vet-apt-avatar-box" style={{ width: "44px", height: "44px" }}>
                    {getPetPhoto(apt) ? (
                      <img src={getPetPhoto(apt)} alt={apt.petName} className="vet-apt-avatar-img" />
                    ) : (
                      <span style={{ fontSize: "1.2rem" }}>🐾</span>
                    )}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontSize: "0.95rem", color: "#111827" }}>{apt.petName}</strong>
                      <span className="vet-apt-id-pill">{apt.petId}</span>
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "#6B7280" }}>Reason: {apt.reason}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}>
                  <Hourglass size={14} color="#D97706" />
                  <span style={{ fontWeight: 700, color: "#111827" }}>Requested: {apt.requestedDate || apt.date}</span>
                  <span style={{
                    fontSize: "0.68rem", fontWeight: 800,
                    backgroundColor: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A",
                    padding: "3px 10px", borderRadius: "9999px"
                  }}>
                    PENDING
                  </span>
                </div>
              </div>

              {proposingId === apt.id ? (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", paddingTop: "8px", borderTop: "1px solid #F3EEE8" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>Propose a new date:</span>
                  <input
                    type="date"
                    className="form-control"
                    style={{ width: "auto", minWidth: "150px", padding: "6px 10px", borderRadius: "8px", fontSize: "0.82rem" }}
                    value={proposedDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={e => setProposedDate(e.target.value)}
                  />
                  <button
                    className="vet-apt-btn-complete"
                    style={{ padding: "6px 14px", fontSize: "0.78rem" }}
                    disabled={respondingId === apt.id}
                    onClick={() => handleProposeConfirm(apt.id)}
                  >
                    {respondingId === apt.id ? "Saving..." : "Confirm Date"}
                  </button>
                  <button
                    className="vet-apt-btn-chart"
                    style={{ padding: "6px 14px", fontSize: "0.78rem" }}
                    onClick={() => { setProposingId(null); setProposedDate(""); }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", paddingTop: "8px", borderTop: "1px solid #F3EEE8" }}>
                  <button
                    className="vet-apt-btn-complete"
                    style={{ padding: "6px 14px", fontSize: "0.78rem" }}
                    disabled={respondingId === apt.id}
                    onClick={() => handleRespond(apt.id, "accept")}
                  >
                    <Check size={12} /> {respondingId === apt.id ? "Saving..." : "Accept"}
                  </button>
                  <button
                    className="vet-apt-btn-reschedule"
                    style={{ padding: "6px 14px", fontSize: "0.78rem" }}
                    disabled={!!respondingId}
                    onClick={() => { setProposingId(apt.id); setProposedDate(""); }}
                  >
                    <Clock size={12} /> Propose New Time
                  </button>
                  <button
                    className="vet-apt-btn-chart"
                    style={{ padding: "6px 14px", fontSize: "0.78rem", color: "#DC2626", borderColor: "#FECACA" }}
                    disabled={!!respondingId}
                    onClick={() => handleRespond(apt.id, "decline")}
                  >
                    Decline
                  </button>
                  <button
                    className="vet-apt-btn-chart"
                    style={{ marginLeft: "auto", padding: "6px 14px", fontSize: "0.78rem" }}
                    onClick={() => navigate(`/vet/medical/${apt.petId}`)}
                  >
                    <Eye size={12} /> Chart File
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="vet-apt-tabs">
        {["Upcoming", "Completed", "All"].map((tab) => {
          const isSelected = filterStatus === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterStatus(tab)}
              className={`vet-apt-tab-btn ${isSelected ? "active" : ""}`}
            >
              {tab} Visits
            </button>
          );
        })}
      </div>

      {/* Appointment Cards List */}
      <div className="vet-apt-cards-list">
        {filteredAppointments.length === 0 ? (
          <div style={{
            background: "#FFFFFF",
            border: "1.5px solid #EDE6DD",
            borderRadius: "20px",
            padding: "50px 24px",
            textAlign: "center"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "#FFF7ED",
              color: "#FF7A1A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px"
            }}>
              <Calendar size={24} />
            </div>
            <p style={{ color: "#6B7280", fontSize: "0.9rem", margin: 0 }}>
              No {filterStatus === "All" ? "" : filterStatus.toLowerCase()} appointments in this view.
            </p>
          </div>
        ) : (
          filteredAppointments.map((apt) => {
            const isCompleted = apt.status === "Completed";
            const isDeclined = apt.status === "Declined";
            const petPhoto = getPetPhoto(apt);
            const badgeIcon = getBadgeIcon(apt);

            return (
              <div
                key={apt.id}
                className="vet-apt-card"
                style={{
                  borderLeftColor: isCompleted ? "#10B981" : isDeclined ? "#D1D5DB" : "#FF7A1A",
                  opacity: isDeclined ? 0.7 : 1
                }}
              >
                {/* Left: Patient Info & Avatar */}
                <div className="vet-apt-patient-info">
                  <div className="vet-apt-avatar-box">
                    {petPhoto ? (
                      <img src={petPhoto} alt={apt.petName} className="vet-apt-avatar-img" />
                    ) : (
                      <span style={{ fontSize: "1.5rem" }}>
                        {apt.petName?.toLowerCase().includes("cat") || apt.petName === "Miya" || apt.petName === "Mani" ? "🐱" : "🐶"}
                      </span>
                    )}
                    <span className="vet-apt-avatar-badge">{badgeIcon}</span>
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <strong className="vet-apt-patient-name">{apt.petName}</strong>
                      <span className="vet-apt-id-pill">{apt.petId}</span>
                    </div>
                    <div className="vet-apt-reason">
                      <span style={{ fontWeight: 600 }}>Reason:</span> {apt.reason}
                    </div>
                  </div>
                </div>

                {/* Center-Left: Date & Time Pill */}
                <div className="vet-apt-date-pill">
                  <Clock size={16} color="#F59E0B" />
                  <span>{apt.date}</span>
                </div>

                {/* Center-Right: Status Pill */}
                <div>
                  <span className={`vet-apt-status-pill ${apt.status.toLowerCase()}`}>
                    {apt.status}
                  </span>
                </div>

                {/* Right: Actions */}
                <div className="vet-apt-actions">
                  <button
                    type="button"
                    className="vet-apt-btn-chart"
                    onClick={() => navigate(`/vet/medical/${apt.petId}`)}
                  >
                    <Eye size={14} /> Chart File
                  </button>

                  {!isCompleted && !isDeclined && (
                    <>
                      <button
                        type="button"
                        className="vet-apt-btn-reschedule"
                        onClick={() => handleOpenReschedule(apt)}
                      >
                        Reschedule
                      </button>

                      <button
                        type="button"
                        className="vet-apt-btn-complete"
                        disabled={completingId === apt.id}
                        onClick={() => handleComplete(apt.id)}
                      >
                        <Check size={14} /> {completingId === apt.id ? "Saving..." : "Complete"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Page Footer */}
      <div className="vet-apt-footer">
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span>🐾</span>
          <span>PetLink Vet Care System • Loving care for every furry friend</span>
        </div>
        <div>
          <span>Quick Medical Guidelines</span>
          <span style={{ margin: "0 8px" }}>•</span>
          <span>Support Hotline: 1800-PET-HELP</span>
        </div>
      </div>

      {/* Modal: Reschedule Date */}
      {showRescheduleModal && selectedApt && (
        <div className="modal-overlay" onClick={() => setShowRescheduleModal(false)} style={{ zIndex: 9999 }}>
          <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px", padding: "26px", borderRadius: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <span>📅</span> Reschedule Visit
              </h2>
              <button
                type="button"
                onClick={() => setShowRescheduleModal(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#9CA3AF" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ padding: "12px 14px", backgroundColor: "#F9F7F4", borderRadius: "14px", border: "1px solid #EDE6DD" }}>
                <span style={{ fontSize: "0.75rem", color: "#6B7280", display: "block" }}>Patient Record</span>
                <strong style={{ fontSize: "1.05rem", color: "#111827" }}>{selectedApt.petName} ({selectedApt.petId})</strong>
                <span style={{ fontSize: "0.78rem", color: "#6B7280", display: "block", marginTop: "2px" }}>
                  Current Scheduled Date: {selectedApt.date}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: "0.85rem", color: "#374151", marginBottom: "6px", display: "block" }}>
                  Choose New Follow-up Date *
                </label>
                <input
                  type="date"
                  required
                  className="form-control"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #EDE6DD", fontSize: "0.88rem" }}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: "8px 18px", borderRadius: "10px", fontWeight: 700 }}
                  onClick={() => setShowRescheduleModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduling}
                  className="btn btn-primary"
                  style={{
                    padding: "8px 20px",
                    borderRadius: "10px",
                    fontWeight: 700,
                    backgroundColor: "#FF7A1A",
                    borderColor: "#FF7A1A",
                    opacity: rescheduling ? 0.7 : 1,
                    cursor: rescheduling ? "not-allowed" : "pointer"
                  }}
                >
                  {rescheduling ? "Saving..." : "Save Date"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default VetAppointments;
