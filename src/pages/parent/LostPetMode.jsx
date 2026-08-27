import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { AlertTriangle, MapPin, X, Check, Award, Eye } from "lucide-react";

const LostPetMode = () => {
  const { animals, updateAnimal, addToast } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const petIdParam = searchParams.get("petId");

  // Get all pets in parent custody
  const parentPets = animals.filter(p => p.status === "Adopted" || p.status === "Lost");

  const [selectedPetId, setSelectedPetId] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Form fields
  const [lostLocation, setLostLocation] = useState("Kothrud Depot Area, Pune");
  const [additionalNotes, setAdditionalNotes] = useState("Wearing a red collar with the digital QR ID tag. Friendly but might be scared.");

  // Pre-select pet from query param or default to first pet
  useEffect(() => {
    if (petIdParam) {
      setSelectedPetId(petIdParam);
    } else if (parentPets.length > 0) {
      setSelectedPetId(parentPets[0].id);
    }
  }, [petIdParam, animals]);

  const activePet = parentPets.find(p => p.id === selectedPetId);

  const handleReportLost = () => {
    if (!activePet) return;
    setShowConfirmModal(true);
  };

  const handleConfirmLost = (e) => {
    e.preventDefault();
    if (!activePet) return;

    const timelineMsg = `Reported Lost at ${lostLocation}. Notes: ${additionalNotes}`;
    const updatedTimeline = [
      { date: new Date().toISOString().split("T")[0], title: "⚠️ Reported Lost", description: timelineMsg },
      ...activePet.timeline
    ];

    updateAnimal(activePet.id, {
      status: "Lost",
      timeline: updatedTimeline,
      lastUpdated: "Just now"
    });

    addToast("Nearest NGOs notified. Tag scan matching primed.", "warning");
    setShowConfirmModal(false);
  };

  const handleMarkFound = () => {
    if (!activePet) return;

    const updatedTimeline = [
      { date: new Date().toISOString().split("T")[0], title: "💚 Marked as Found", description: "Pet safely recovered outside tag scan matches." },
      ...activePet.timeline
    ];

    updateAnimal(activePet.id, {
      status: "Adopted",
      timeline: updatedTimeline,
      lastUpdated: "Just now"
    });

    addToast(`${activePet.name} marked as found! Safe return logged.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "680px", margin: "0 auto" }}>
      
      {/* Header Info */}
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
          Lost Pet Alert Center
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginTop: "4px" }}>
          Activate emergency municipal tags, dispatch missing reports to nearby shelter nodes, and prime scan matches.
        </p>
      </div>

      {parentPets.length === 0 ? (
        <div className="card" style={{ padding: "40px", textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)" }}>You do not have any registered pets in parent custody yet.</p>
          <button className="btn btn-outline" style={{ marginTop: "16px" }} onClick={() => navigate("/parent/register")}>
            Register a Family Pet
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Select Pet Dropdown */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "20px 24px" }}>
            <label className="form-label" style={{ fontWeight: 800 }}>Select Pet to Audit / Report</label>
            <select
              className="form-control"
              value={selectedPetId}
              onChange={(e) => setSelectedPetId(e.target.value)}
              style={{ borderRadius: "30px", padding: "8px 16px" }}
            >
              {parentPets.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id}) — [{p.status}]</option>
              ))}
            </select>
          </div>

          {activePet && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Pet Info Card */}
              <div className="card" style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <img 
                  src={activePet.photo} 
                  alt={activePet.name} 
                  style={{ width: "60px", height: "60px", borderRadius: "10px", objectFit: "cover", border: "1px solid var(--border-color)" }} 
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <strong style={{ fontSize: "1.1rem" }}>{activePet.name}</strong>
                    <span className={`badge badge-${activePet.status === "Lost" ? "rescued" : "adopted"}`} style={{ fontSize: "0.68rem" }}>
                      {activePet.status}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>ID: {activePet.id} • {activePet.breed}</span>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => navigate(`/parent/pet/${activePet.id}`)}>
                  <Eye size={12} /> View File
                </button>
              </div>

              {/* Status Alert Control */}
              {activePet.status === "Lost" ? (
                /* Lost Pet Mode - Active State Tracker */
                <div className="card animate-scale-up" style={{
                  border: "2px solid var(--accent-coral)",
                  backgroundColor: "var(--accent-coral-light)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                  padding: "24px 32px"
                }}>
                  <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <AlertTriangle size={32} color="var(--accent-coral)" style={{ flexShrink: 0 }} />
                    <div>
                      <h3 style={{ color: "var(--accent-coral)", fontWeight: 800, fontSize: "1.15rem" }}>
                        Missing Alert Status Active!
                      </h3>
                      <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "4px", lineHeight: 1.5 }}>
                        <strong>{activePet.name}</strong> is flagged in the municipal rescue system as lost. 
                        Local NGO hubs have been notified of their last-known coordinates, and the collar QR tag has been primed.
                      </p>
                    </div>
                  </div>

                  <hr style={{ border: 0, borderBottom: "1px solid rgba(217, 83, 79, 0.15)", margin: "4px 0" }} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
                      Logged Last Coordinates Check-in: Kothrud
                    </span>
                    
                    <button 
                      className="btn btn-primary" 
                      style={{ backgroundColor: "var(--secondary-color)", borderColor: "var(--secondary-color)", display: "flex", alignItems: "center", gap: "6px" }}
                      onClick={handleMarkFound}
                    >
                      <Check size={14} /> Mark as Found / Recovered
                    </button>
                  </div>
                </div>
              ) : (
                /* Safe State - Allow Flagging */
                <div className="card" style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "18px",
                  padding: "36px 24px",
                  textAlign: "center"
                }}>
                  <div style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(224, 144, 37, 0.08)",
                    color: "var(--accent-amber)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <MapPin size={28} />
                  </div>

                  <div>
                    <h3 style={{ fontWeight: 800 }}>Is {activePet.name} Missing?</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "420px", margin: "6px auto 0", lineHeight: 1.5 }}>
                      If your pet has slipped away, immediately trigger Lost Mode. 
                      This will broadcast a missing card to local shelter dispatch boards and flag their collar QR code.
                    </p>
                  </div>

                  {/* Urgent button (Alert Red) */}
                  <button 
                    className="btn btn-danger animate-pulse" 
                    style={{ backgroundColor: "var(--accent-coral)", borderColor: "var(--accent-coral)", padding: "10px 24px" }}
                    onClick={handleReportLost}
                  >
                    Report {activePet.name} as Lost
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* ========================================================
          CONFIRMATION MODAL: LOST DETAILS FORM
      ======================================================== */}
      {showConfirmModal && activePet && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)} style={{ zIndex: 9999 }}>
          <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2 style={{ fontWeight: 800, color: "var(--accent-coral)", display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={20} /> Confirm Lost Report
              </h2>
              <button className="modal-close" onClick={() => setShowConfirmModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmLost} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: "0.88rem", color: "var(--text-main)", lineHeight: 1.5 }}>
                You are about to flag <strong>{activePet.name} ({activePet.id})</strong> as missing in the municipal database. 
                Please supply details to aid local volunteer staff:
              </div>

              <div className="form-group">
                <label className="form-label">Last Seen Location *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={lostLocation}
                  onChange={(e) => setLostLocation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Identifying Notes / Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowConfirmModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger" style={{ flex: 1, backgroundColor: "var(--accent-coral)", borderColor: "var(--accent-coral)" }}>
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
