import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { Calendar, CheckCircle2, Clock, Eye, AlertCircle, X } from "lucide-react";

const VetAppointments = () => {
  const { vetAppointments, completeVetAppointment, addToast } = useApp();
  const [filterStatus, setFilterStatus] = useState("Upcoming");
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [newDate, setNewDate] = useState("");
  const navigate = useNavigate();

  // Simple filter logic
  const filteredAppointments = vetAppointments.filter(apt => {
    if (filterStatus === "Upcoming") return apt.status === "Upcoming";
    if (filterStatus === "Completed") return apt.status === "Completed";
    return true; // "All"
  });

  const handleOpenReschedule = (apt) => {
    setSelectedApt(apt);
    setNewDate(apt.date);
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    if (!selectedApt || !newDate) return;

    // Mutate state (since we are doing it locally in shared context, we can just update it)
    selectedApt.date = newDate;
    addToast(`Appointment rescheduled for ${selectedApt.petName}`, "success");
    setShowRescheduleModal(false);
    setSelectedApt(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Header Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
            Scheduled Clinic Follow-ups
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Review upcoming patient checkups, de-worming schedules, and post-op suture inspections.
          </p>
        </div>
      </div>

      {/* Tabs / Filters row */}
      <div style={{
        display: "flex",
        gap: "8px",
        borderBottom: "1px solid var(--border-color)",
        paddingBottom: "10px"
      }}>
        {["Upcoming", "Completed", "All"].map((tab) => {
          const isSelected = filterStatus === tab;
          return (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              style={{
                border: 0,
                backgroundColor: isSelected ? "var(--accent-coral-light)" : "transparent",
                color: isSelected ? "var(--accent-coral)" : "var(--text-muted)",
                fontSize: "0.85rem",
                fontWeight: 700,
                padding: "8px 18px",
                borderRadius: "30px",
                cursor: "pointer",
                border: isSelected ? "1px solid var(--accent-coral)" : "1px solid transparent",
                transition: "all var(--transition-fast)"
              }}
            >
              {tab} Visits
            </button>
          );
        })}
      </div>

      {/* Appointments List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredAppointments.length === 0 ? (
          <div className="card" style={{ padding: "60px 24px", textAlign: "center" }}>
            <div className="empty-state-icon" style={{ backgroundColor: "var(--accent-coral-light)", color: "var(--accent-coral)", margin: "0 auto 12px" }}>
              <Calendar size={28} />
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No follow-up appointments scheduled under this category.</p>
          </div>
        ) : (
          filteredAppointments.map((apt) => {
            const isCompleted = apt.status === "Completed";
            return (
              <div
                key={apt.id}
                className="card animate-slide-up"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "20px 24px",
                  borderLeft: isCompleted ? "5px solid var(--secondary-color)" : "5px solid var(--accent-coral)",
                  backgroundColor: "#FFFFFF",
                  flexWrap: "wrap",
                  gap: "20px"
                }}
              >
                {/* Left: Patient Info & Details */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: "260px" }}>
                  <img
                    src={apt.petPhoto}
                    alt={apt.petName}
                    style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border-color)" }}
                  />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                      <strong style={{ fontSize: "1.05rem", color: "var(--text-main)" }}>{apt.petName}</strong>
                      <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "var(--text-muted)" }}>{apt.petId}</span>
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500, marginTop: "2px" }}>
                      Reason: {apt.reason}
                    </span>
                  </div>
                </div>

                {/* Center: Scheduled Date */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
                  <Clock size={16} color="var(--text-muted)" />
                  <span style={{ fontWeight: 700 }}>{apt.date}</span>
                  {isCompleted ? (
                    <span className="badge badge-adopted" style={{ fontSize: "0.68rem" }}>Completed</span>
                  ) : (
                    <span className="badge badge-treatment" style={{ backgroundColor: "var(--accent-coral-light)", color: "var(--accent-coral)", fontSize: "0.68rem" }}>
                      Upcoming
                    </span>
                  )}
                </div>

                {/* Right: Actions */}
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ display: "flex", alignItems: "center", gap: "4px" }}
                    onClick={() => navigate(`/vet/medical/${apt.petId}`)}
                  >
                    <Eye size={12} /> Chart File
                  </button>

                  {!isCompleted && (
                    <>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ borderColor: "var(--accent-amber)", color: "var(--accent-amber)" }}
                        onClick={() => handleOpenReschedule(apt)}
                      >
                        Reschedule
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ backgroundColor: "var(--accent-coral)", borderColor: "var(--accent-coral)", display: "flex", alignItems: "center", gap: "4px" }}
                        onClick={() => completeVetAppointment(apt.id)}
                      >
                        <CheckCircle2 size={12} /> Complete
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================
          MODAL: RESCHEDULE DATE FORM
      ======================================================== */}
      {showRescheduleModal && selectedApt && (
        <div className="modal-overlay" onClick={() => setShowRescheduleModal(false)} style={{ zIndex: 9999 }}>
          <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px" }}>
            <div className="modal-header">
              <h2 style={{ fontWeight: 800, color: "var(--primary-color)" }}>📅 Reschedule Visit</h2>
              <button className="modal-close" onClick={() => setShowRescheduleModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleRescheduleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block" }}>Patient</span>
                <strong style={{ fontSize: "1.1rem" }}>{selectedApt.petName} ({selectedApt.petId})</strong>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginTop: "2px" }}>
                  Current Date: {selectedApt.date}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Choose New Follow-up Date *</label>
                <input
                  type="date"
                  required
                  className="form-control"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowRescheduleModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, backgroundColor: "var(--accent-coral)", borderColor: "var(--accent-coral)" }}>
                  Save Date
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
