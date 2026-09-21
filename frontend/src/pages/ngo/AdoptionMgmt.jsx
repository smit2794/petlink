import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { 
  Users, CheckCircle2, AlertCircle, Calendar, ClipboardCheck, 
  Clock, ArrowRight, X, Phone, UserCheck, MessageSquare,
  ClipboardList, ShieldCheck, PawPrint
} from "lucide-react";

// Column icons map
const colIcons = {
  "Applications Received":  <ClipboardList size={14} />,
  "Applicant Verification": <ShieldCheck size={14} />,
  "Approved":               <CheckCircle2 size={14} />,
  "Follow-up Scheduled":    <Calendar size={14} />,
};

const AdoptionMgmt = () => {
  const { adoptions, updateAdoptionStatus, updateAdoptionStatusPersisted, scheduleFollowUp, scheduleFollowUpPersisted } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  
  // Follow-up form state
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpInterval, setFollowUpInterval] = useState("30");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const columns = [
    { label: "Applications Received", key: "Applications Received", color: "#4A5859" }, // Slate
    { label: "Applicant Verification", key: "Applicant Verification", color: "#E09025" }, // Amber
    { label: "Approved", key: "Approved", color: "#27AE60" }, // Green
    { label: "Follow-up Scheduled", key: "Follow-up Scheduled", color: "#2980B9" } // Blue
  ];

  const getAppsByColumn = (colKey) => {
    return adoptions.filter(app => app.status === colKey);
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

  const currentApp = adoptions.find(a => a.id === (selectedApp && selectedApp.id)) || selectedApp;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
          Adoption Pipeline Control
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Track applicant checklists, manage virtual home verifications, and schedule follow-ups.
        </p>
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="skeleton" style={{ height: "400px", borderRadius: "var(--radius-lg)" }} />
          ))}
        </div>
      ) : (
        /* MAIN ADOPTIONS KANBAN BOARD */
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "24px",
          alignItems: "start"
        }} className="adoption-kanban-container">
          
          {columns.map((col) => {
            const apps = getAppsByColumn(col.key);
            return (
              <div 
                key={col.key} 
                style={{
                  backgroundColor: "#F5EFE6", // warm neutral background for columns
                  borderRadius: "20px",
                  padding: "20px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  border: "1px solid var(--border-color)",
                  minHeight: "500px",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
                }}
              >
                {/* Column header */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: `3px solid ${col.color}`,
                  paddingBottom: "10px",
                  marginBottom: "4px"
                }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 800, color: col.color, display: "flex", alignItems: "center", gap: "6px" }}>
                    {colIcons[col.key]} {col.label}
                  </span>
                  <span style={{
                    backgroundColor: col.color + "20",
                    color: col.color,
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    padding: "2px 10px",
                    borderRadius: "20px"
                  }}>
                    {apps.length}
                  </span>
                </div>

                {/* Column items */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", flexGrow: 1 }}>
                  {apps.length === 0 ? (
                    <div style={{
                      textAlign: "center",
                      padding: "36px 16px",
                      color: "var(--text-muted)",
                      fontSize: "0.85rem",
                      border: "2px dashed #E5DDD4",
                      borderRadius: "14px",
                      margin: "auto 0",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "10px",
                      backgroundColor: "rgba(255,255,255,0.3)"
                    }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: col.color + "15", display: "flex", alignItems: "center", justifyContent: "center", color: col.color }}>
                        <PawPrint size={18} />
                      </div>
                      <span style={{ fontWeight: 600 }}>No cases in this stage</span>
                    </div>
                  ) : (
                    apps.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => handleOpenDetail(app)}
                        className="card animate-slide-up"
                        style={{
                          padding: "16px",
                          borderRadius: "16px",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          borderLeft: `5px solid ${col.color}`, // Left accent stripe matching column
                          boxShadow: "0 4px 6px rgba(110, 95, 80, 0.03)"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-4px)";
                          e.currentTarget.style.boxShadow = "var(--shadow-md)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "none";
                          e.currentTarget.style.boxShadow = "0 4px 6px rgba(110, 95, 80, 0.03)";
                        }}
                      >
                        {/* Compact avatar/photo row */}
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <img
                            src={app.animalPhoto}
                            alt={app.animalName}
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "1px solid var(--border-color)"
                            }}
                          />
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-main)" }}>
                              {app.animalName}
                            </span>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600 }}>
                              ID: {app.animalId}
                            </span>
                          </div>
                        </div>

                        <hr style={{ border: 0, borderBottom: "1px solid var(--border-color)", margin: "2px 0" }} />

                        {/* Applicant details & rounded pill tags */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-main)" }}>
                            {app.applicantName}
                          </span>
                          
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            <span className="badge badge-shelter" style={{ fontSize: "0.65rem", padding: "2px 8px" }}>
                              App: {app.date}
                            </span>
                            {app.followUpDate && (
                              <span className="badge badge-adoption" style={{ fontSize: "0.65rem", padding: "2px 8px" }}>
                                Follow Up: {app.followUpDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}

        </div>
      )}

      {/* ========================================================
          MODAL: APPLICATION REVIEW DETAILS
      ======================================================== */}
      {currentApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal-content animate-scale-up" style={{ maxWidth: "580px", padding: 0 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontWeight: 800, color: "var(--primary-color)", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.3rem" }}>📑</span> Adoption Application Case
              </h2>
              <button className="modal-close" onClick={() => setSelectedApp(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Pet Card inside application */}
              <div style={{
                display: "flex",
                gap: "16px",
                alignItems: "center",
                backgroundColor: "var(--secondary-light)",
                padding: "16px",
                borderRadius: "14px",
                border: "1px solid var(--border-color)"
              }}>
                <img
                  src={currentApp.animalPhoto}
                  alt={currentApp.animalName}
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "10px",
                    objectFit: "cover",
                    border: "1px solid var(--border-color)"
                  }}
                />
                <div>
                  <span className="badge badge-shelter" style={{ fontSize: "0.65rem", marginBottom: "4px" }}>
                    PET FOR ADOPTION
                  </span>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>{currentApp.animalName} ({currentApp.animalId})</h3>
                </div>
              </div>

              {/* Applicant Profile */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>
                  Applicant Information
                </h4>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                  fontSize: "0.9rem"
                }}>
                  <div>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", display: "block" }}>Full Name</span>
                    <strong>{currentApp.applicantName}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", display: "block" }}>Phone Contact</span>
                    <strong style={{ display: "flex", alignItems: "center", gap: "4px" }}><Phone size={12} /> {currentApp.applicantContact}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", display: "block" }}>Date Applied</span>
                    <strong>{currentApp.date}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", display: "block" }}>Verification Status</span>
                    <strong style={{ color: "var(--secondary-color)" }}>{currentApp.status}</strong>
                  </div>
                </div>
              </div>

              {/* Background Verification notes */}
              <div style={{
                backgroundColor: "#F7F5F0",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid var(--border-color)"
              }}>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <ClipboardCheck size={16} color="var(--secondary-color)" /> Background Verification Log
                </h4>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {currentApp.notes}
                </p>
              </div>

              {/* If follow-up date details exist */}
              {currentApp.followUpDate && (
                <div style={{
                  backgroundColor: "#EBF5FB",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #AED6F1",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.85rem",
                  color: "#2980B9"
                }}>
                  <Calendar size={16} />
                  <div>
                    <strong>Scheduled Follow-Up: </strong>
                    <span>In {currentApp.followUpInterval} days (scheduled for {currentApp.followUpDate}).</span>
                  </div>
                </div>
              )}

              {/* Follow-up Scheduler Panel inside Modal */}
              {showFollowUpForm && (
                <form onSubmit={handleScheduleSubmit} className="animate-slide-up" style={{
                  backgroundColor: "var(--bg-color)",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px"
                }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 800 }}>Schedule Post-Adoption Audit</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Audit Date</label>
                      <input
                        type="date"
                        required
                        className="form-control"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Interval Trigger</label>
                      <select
                        className="form-control"
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
                    <button type="button" className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setShowFollowUpForm(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                      Commit Schedule
                    </button>
                  </div>
                </form>
              )}

            </div>
            </div>{/* end modal-body */}
            <div className="modal-footer" style={{ flexWrap: "wrap" }}>
              {currentApp.status === "Applications Received" && (
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleMoveToVerification}>
                  Move to Verification
                </button>
              )}
              {currentApp.status === "Applicant Verification" && (
                <>
                  <button className="btn btn-danger" style={{ flex: 0.5 }} onClick={handleReject}>
                    Reject
                  </button>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleApprove}>
                    Approve & Grant Custody
                  </button>
                </>
              )}
              {currentApp.status === "Approved" && !showFollowUpForm && (
                <button className="btn btn-primary" style={{ flex: 1, backgroundColor: "#2980B9", borderColor: "#2980B9" }} onClick={() => setShowFollowUpForm(true)}>
                  Schedule Follow-up
                </button>
              )}
              <button className="btn btn-outline" style={{ flex: 0.5 }} onClick={() => setSelectedApp(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban responsiveness styles */}
      <style>{`
        @media (max-width: 1024px) {
          .adoption-kanban-container {
            gridTemplateColumns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .adoption-kanban-container {
            gridTemplateColumns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdoptionMgmt;
