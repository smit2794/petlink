import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { ClipboardList, AlertCircle, Clock, ArrowRight, ShieldAlert, Heart, Calendar, Search, Filter } from "lucide-react";

// CountUp Component for Metric Animation
const CountUp = ({ target }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    if (target === 0) return;
    const duration = 400;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count}</>;
};

const VetQueue = () => {
  const { animals, vetAppointments, reassignVetCase } = useApp();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewScope, setViewScope] = useState("my"); // "my" or "all"
  const [selectedPetForReassign, setSelectedPetForReassign] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter animals that are in vet scope: status === "Rescued" (Awaiting Diagnosis) or "Under Treatment" (In Treatment) or "In Shelter" (Awaiting Discharge)
  const vetScopeAnimals = animals.filter(pet => {
    const isVetScope = pet.status === "Rescued" || pet.status === "Under Treatment" || pet.status === "In Shelter";
    if (!isVetScope) return false;
    
    if (viewScope === "my") {
      // Strict single real ownership model — match assignedVetId === user.id ONLY
      return pet.assignedVetId === user?.id;
    }
    return true;
  });

  // Group metrics
  const casesTodayCount = animals.filter(p => p.status === "Under Treatment").length;
  const pendingFollowupsCount = vetAppointments.filter(apt => apt.status === "Upcoming").length;
  const pendingLabsCount = 2; // Simulated
  const awaitingDischargeCount = animals.filter(p => p.status === "In Shelter" && p.timeline.some(e => e.title.includes("Treatment"))).length || 3;

  // Filtered Queue
  const filteredQueue = vetScopeAnimals.filter(pet => {
    const matchesSearch = 
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === "All" ||
      (statusFilter === "Awaiting Diagnosis" && pet.status === "Rescued") ||
      (statusFilter === "In Treatment" && pet.status === "Under Treatment") ||
      (statusFilter === "Awaiting Discharge" && pet.status === "In Shelter");

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
            Incoming Clinical Queue
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Review new admissions, active hospitalizations, and ready discharge releases.
          </p>
        </div>
      </div>

      {isLoading ? (
        <>
          {/* Skeleton Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="skeleton skeleton-card" style={{ height: "130px" }} />
            ))}
          </div>
          {/* Skeleton Queue Table */}
          <div className="skeleton" style={{ height: "350px", borderRadius: "20px" }} />
        </>
      ) : (
        <>
          {/* VET PORTAL CORAL METRIC TILES (4 metric cards) */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "24px"
          }}>
            {/* Card 1: Cases Today */}
            <div className="card animate-slide-up" style={{
              backgroundColor: "var(--accent-coral-light)",
              borderLeft: "5px solid var(--accent-coral)",
              animationDelay: "50ms"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(217, 83, 79, 0.12)",
                  color: "var(--accent-coral)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <ShieldAlert size={18} />
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--accent-coral)", letterSpacing: "0.05em" }}>HOSPITALIZED</span>
              </div>
              <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.1 }}>
                <CountUp target={casesTodayCount} />
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, marginTop: "4px" }}>Cases In Care</p>
              <span style={{ fontSize: "0.72rem", color: "var(--accent-coral)", fontWeight: 700, display: "block", marginTop: "8px" }}>
                ➔ Active clinical observation
              </span>
            </div>

            {/* Card 2: Pending Follow-ups */}
            <div className="card animate-slide-up" style={{
              backgroundColor: "#FFF8EE",
              borderLeft: "5px solid var(--accent-amber)",
              animationDelay: "100ms"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(224, 144, 37, 0.12)",
                  color: "var(--accent-amber)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Calendar size={18} />
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--accent-amber)", letterSpacing: "0.05em" }}>AUDITS</span>
              </div>
              <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.1 }}>
                <CountUp target={pendingFollowupsCount} />
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, marginTop: "4px" }}>Pending Follow-ups</p>
              <span style={{ fontSize: "0.72rem", color: "var(--accent-amber)", fontWeight: 700, display: "block", marginTop: "8px" }}>
                ➔ Post-op assessments
              </span>
            </div>

            {/* Card 3: Pending Lab Uploads */}
            <div className="card animate-slide-up" style={{
              backgroundColor: "#F4F8FA",
              borderLeft: "5px solid #2980B9",
              animationDelay: "150ms"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(41, 128, 185, 0.12)",
                  color: "#2980B9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <ClipboardList size={18} />
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#2980B9", letterSpacing: "0.05em" }}>LAB TESTS</span>
              </div>
              <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.1 }}>
                <CountUp target={pendingLabsCount} />
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, marginTop: "4px" }}>Pending Lab Uploads</p>
              <span style={{ fontSize: "0.72rem", color: "#2980B9", fontWeight: 700, display: "block", marginTop: "8px" }}>
                ➔ Awaiting blood counts
              </span>
            </div>

            {/* Card 4: Awaiting Discharge */}
            <div className="card animate-slide-up" style={{
              backgroundColor: "var(--secondary-light)",
              borderLeft: "5px solid var(--secondary-color)",
              animationDelay: "200ms"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(38, 96, 72, 0.12)",
                  color: "var(--secondary-color)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Heart size={18} />
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--secondary-color)", letterSpacing: "0.05em" }}>DISCHARGE</span>
              </div>
              <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.1 }}>
                <CountUp target={awaitingDischargeCount} />
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, marginTop: "4px" }}>Awaiting Discharge</p>
              <span style={{ fontSize: "0.72rem", color: "var(--secondary-color)", fontWeight: 700, display: "block", marginTop: "8px" }}>
                ➔ Return to NGO Shelter
              </span>
            </div>
          </div>

          {/* Filtering card */}
          <div className="card" style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center", padding: "20px 32px", marginTop: "12px" }}>
            
            {/* View Scope Toggle */}
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                className={`btn btn-sm ${viewScope === "my" ? "btn-primary" : "btn-outline"}`}
                style={{
                  backgroundColor: viewScope === "my" ? "var(--accent-coral)" : "transparent",
                  borderColor: "var(--accent-coral)",
                  color: viewScope === "my" ? "white" : "var(--accent-coral)",
                  borderRadius: "20px"
                }}
                onClick={() => setViewScope("my")}
              >
                My Cases
              </button>
              <button
                className={`btn btn-sm ${viewScope === "all" ? "btn-primary" : "btn-outline"}`}
                style={{
                  backgroundColor: viewScope === "all" ? "var(--accent-coral)" : "transparent",
                  borderColor: "var(--accent-coral)",
                  color: viewScope === "all" ? "white" : "var(--accent-coral)",
                  borderRadius: "20px"
                }}
                onClick={() => setViewScope("all")}
              >
                All Cases
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", position: "relative", flex: 1, minWidth: "260px" }}>
              <Search size={16} style={{ position: "absolute", left: "14px", color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search patient files by tag ID, name, or breed..."
                className="form-control"
                style={{ width: "100%", paddingLeft: "40px", borderRadius: "30px" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Filter size={14} color="var(--text-muted)" />
              <select
                className="form-control"
                style={{ padding: "8px 16px", fontSize: "0.85rem", borderRadius: "30px" }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Queue States</option>
                <option value="Awaiting Diagnosis">Awaiting Diagnosis</option>
                <option value="In Treatment">In Treatment</option>
                <option value="Awaiting Discharge">Awaiting Discharge</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="table-container">
            {filteredQueue.length === 0 ? (
              <div className="empty-state" style={{ padding: "60px 24px" }}>
                <div className="empty-state-icon" style={{ backgroundColor: "var(--accent-coral-light)", color: "var(--accent-coral)" }}>
                  <ClipboardList size={32} />
                </div>
                <h3 className="empty-state-title">No Active Patient files</h3>
                <p className="empty-state-desc" style={{ maxWidth: "400px", margin: "8px auto 20px" }}>
                  There are currently no animal profiles in the clinic queue matching this category filter.
                </p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Patient Details</th>
                    <th>Reported Origin</th>
                    <th>Assigned Vet</th>
                    <th>Diagnosis Notes</th>
                    <th>Admission Date</th>
                    <th>Workflow Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQueue.map((pet) => {
                    const statusClass = 
                      pet.status === "Rescued" ? "rescued" :
                      pet.status === "Under Treatment" ? "treatment" : "shelter";
                    
                    const displayStatus = 
                      pet.status === "Rescued" ? "Awaiting Diagnosis" :
                      pet.status === "Under Treatment" ? "In Treatment" : "Awaiting Discharge";
                    const sender = pet.custodian || "Pune Municipal NGO";
                    const assignedVetName = pet.assignedVetId === user?.id 
                      ? `${user?.name} (You)`
                      : pet.assignedVetId 
                      ? "Assigned Clinician"
                      : "Unassigned";
 
                    return (
                      <tr 
                        key={pet.id} 
                        onClick={() => navigate(`/vet/medical/${pet.id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <img 
                              src={pet.photo} 
                              alt={pet.name} 
                              style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border-color)" }} 
                            />
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontWeight: 800, color: "var(--text-main)", fontSize: "0.95rem" }}>
                                {pet.name}
                              </span>
                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace", fontWeight: 600 }}>
                                {pet.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: 700, fontSize: "0.88rem" }}>{sender}</span>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{pet.species} • {pet.breed}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)" }}>
                            {assignedVetName}
                          </span>
                        </td>
                        <td style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>
                            {pet.healthSummary?.treatmentNotes || "Initial diagnostic checkup required."}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>
                            {pet.timeline[0]?.date || "2026-07-10"}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${statusClass}`} style={{ fontSize: "0.72rem" }}>
                            {displayStatus}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "8px" }} onClick={(e) => e.stopPropagation()}>
                            <button 
                              className="btn btn-outline btn-sm" 
                              style={{ borderColor: "var(--accent-coral)", color: "var(--accent-coral)" }}
                              onClick={() => setSelectedPetForReassign(pet)}
                            >
                              Reassign
                            </button>
                            <button 
                              className="btn btn-primary btn-sm" 
                              style={{ backgroundColor: "var(--accent-coral)", borderColor: "var(--accent-coral)" }}
                              onClick={() => navigate(`/vet/medical/${pet.id}`)}
                            >
                              Open EHR
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Reassign Case Modal */}
      {selectedPetForReassign && (
        <div className="modal-overlay" onClick={() => setSelectedPetForReassign(null)} style={{ zIndex: 9999 }}>
          <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "400px" }}>
            <div className="modal-header">
              <h2 style={{ fontWeight: 800, color: "var(--primary-color)" }}>Reassign Veterinarian Case</h2>
              <button className="modal-close" onClick={() => setSelectedPetForReassign(null)}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                Transfer patient custody of <strong>{selectedPetForReassign.name} ({selectedPetForReassign.id})</strong> to another CVO associate.
              </p>

              <div className="form-group">
                <label className="form-label">Select Practitioner</label>
                <select
                  className="form-control"
                  defaultValue={selectedPetForReassign.assignedVetId || user?.id}
                  onChange={(e) => {
                    reassignVetCase(selectedPetForReassign.id, e.target.value);
                    setSelectedPetForReassign(null);
                  }}
                >
                  <option value={user?.id}>{user?.name} (Myself)</option>
                  <option value="">Unassigned / Pool</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                <button className="btn btn-outline" style={{ width: "100%" }} onClick={() => setSelectedPetForReassign(null)}>
                  Cancel Reassignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VetQueue;
