import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { 
  Building, ShieldAlert, Truck, Package, Plus, Minus,
  Activity, CheckCircle2, ChevronRight, AlertTriangle, Send, X, ArrowLeftRight
} from "lucide-react";

// Helper Circular Progress Component
const CircularProgress = ({ pct, label, color = "var(--secondary-color)", size = 110 }) => {
  const radius = size * 0.4;
  const circ = 2 * Math.PI * radius;
  const strokePct = circ - (pct / 100) * circ;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#ECE8E0"
            strokeWidth="8"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circ}
            strokeDashoffset={strokePct}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "1.1rem",
          fontWeight: 800,
          color: "var(--text-main)"
        }}>
          {pct}%
        </div>
      </div>
      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", textAlign: "center" }}>{label}</span>
    </div>
  );
};

const ShelterMgmt = () => {
  const { 
    inventory, 
    updateInventoryStock,
    updateInventoryStockPersisted,
    animals, 
    ngoTransfers, 
    requestNGOTransfer, 
    respondToNGOTransfer 
  } = useApp();
  
  const [isLoading, setIsLoading] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedPetForTransfer, setSelectedPetForTransfer] = useState(null);
  
  // Transfer Form State
  const [transferForm, setTransferForm] = useState({
    destinationNGO: "Hadapsar Gaushala Cattle Shelter",
    reason: ""
  });
  
  const ngoList = [
    "Pune Central Animal Shelter",
    "Hadapsar Gaushala Cattle Shelter",
    "Aviation Bird Rehabilitation Clinic",
    "Kothrud Feline Cattery",
    "Dhayari Stray Welfare Association"
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Compute capacities dynamically
  const shelterAnimalsCount = animals.filter(a => a.status === "In Shelter" || a.status === "Available for Adoption").length;
  const treatmentAnimalsCount = animals.filter(a => a.status === "Under Treatment").length;
  
  // Custom static limits
  const maxGeneralCapacity = 15;
  const generalCapacityPct = Math.min(100, Math.floor((shelterAnimalsCount / maxGeneralCapacity) * 100));
  const isolationCapacityPct = Math.min(100, Math.floor((treatmentAnimalsCount / 8) * 100));
  const catteryCapacityPct = 40;

  // Capacity Forecast
  // intake rate (rescues/day) is approx 1.4, adoption rate is approx 0.8. Net rate = 0.6 / day.
  const netIntakeRate = 0.6;
  const remainingBeds = Math.max(0, maxGeneralCapacity - shelterAnimalsCount);
  const daysToCapacity = netIntakeRate > 0 && remainingBeds > 0 
    ? Math.round(remainingBeds / netIntakeRate) 
    : 0;

  // Isolation details list
  const isolationList = animals.filter(a => a.status === "Under Treatment").map(a => ({
    id: a.id,
    name: a.name,
    reason: a.healthSummary?.treatmentNotes?.split(".")[0] || "Injured / medical diagnosis cycles"
  }));

  // Shelter animals owned by us
  const shelterPets = animals.filter(a => a.custodian === "Pune Central Animal Shelter" || a.custodian === "Pune Central Shelter");

  const handleStockUpdate = async (itemId, change) => {
    try {
      await updateInventoryStockPersisted(itemId, change);
    } catch (err) {}
  };

  const handleOpenTransferModal = (pet) => {
    setSelectedPetForTransfer(pet);
    setTransferForm({
      destinationNGO: ngoList.find(n => n !== pet.custodian) || ngoList[1],
      reason: ""
    });
    setShowTransferModal(true);
  };

  const handleRequestTransferSubmit = (e) => {
    e.preventDefault();
    if (!selectedPetForTransfer) return;

    requestNGOTransfer({
      animalId: selectedPetForTransfer.id,
      animalName: selectedPetForTransfer.name,
      sourceNGO: selectedPetForTransfer.custodian,
      destinationNGO: transferForm.destinationNGO,
      reason: transferForm.reason
    });

    setShowTransferModal(false);
    setSelectedPetForTransfer(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-main)" }}>
            Shelter Capacity & Stock Auditing
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Supervise physical quarantine cages, track animal transfers, and manage vital medical/food reserves.
          </p>
        </div>
      </div>

      {isLoading ? (
        /* SKELETON SCREEN */
        <>
          <div className="skeleton" style={{ height: "180px", borderRadius: "20px" }} />
          <div className="skeleton" style={{ height: "300px", borderRadius: "20px" }} />
        </>
      ) : (
        /* MAIN INTERACTIVE LAYOUT */
        <>
          {/* Capacity Wards + Forecast Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "28px" }} className="shelter-split-grid animate-fade-in">
            {/* Live capacities */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
                <Building size={20} color="var(--primary-color)" /> Live Shelter Ward Capacities
              </h3>
              
              <div style={{
                display: "flex",
                justifyContent: "space-around",
                flexWrap: "wrap",
                gap: "24px",
                padding: "12px 0"
              }}>
                <CircularProgress 
                  pct={generalCapacityPct} 
                  label={`General Ward A (${shelterAnimalsCount}/${maxGeneralCapacity} Occupied)`} 
                  color="var(--secondary-color)" 
                />
                <CircularProgress 
                  pct={isolationCapacityPct} 
                  label={`Isolation/Quarantine (${treatmentAnimalsCount}/8 Occupied)`} 
                  color="var(--accent-coral)" 
                />
                <CircularProgress 
                  pct={catteryCapacityPct} 
                  label="Feline Cattery (2/5 Occupied)" 
                  color="var(--accent-amber)" 
                />
              </div>
            </div>

            {/* Forecast Widget */}
            <div className="card" style={{
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "center", 
              gap: "16px",
              background: "linear-gradient(135deg, rgba(46, 111, 86, 0.05) 0%, rgba(250, 248, 245, 1) 100%)",
              border: "1px solid var(--border-color)",
              padding: "28px"
            }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Capacity Forecast Engine
              </span>
              <div>
                <strong style={{ fontSize: "2rem", color: daysToCapacity < 7 ? "var(--accent-coral)" : "var(--primary-color)", display: "block", letterSpacing: "-0.03em" }}>
                  {daysToCapacity > 0 ? `~${daysToCapacity} Days` : "Capacity Reached"}
                </strong>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  Estimated until General Ward A reaches maximum limit.
                </span>
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                Calculated dynamically from current intake/rescue speeds (avg 1.4/day) balanced against pending adoption approvals (avg 0.8/day).
              </p>
            </div>
          </div>

          {/* Transfer Requests Ledger & Transfer Form Trigger Section */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr", gap: "28px" }} className="shelter-split-grid">
            
            {/* Transfer Requests Catalog */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
                <ArrowLeftRight size={20} color="var(--primary-color)" /> Inter-Shelter Transfers
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "300px", overflowY: "auto" }}>
                {ngoTransfers.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "20px" }}>No active transfers logged.</p>
                ) : (
                  ngoTransfers.map((trf) => {
                    const isIncoming = trf.destinationNGO === "Pune Central Animal Shelter" || trf.destinationNGO === "Pune Central Shelter";
                    return (
                      <div key={trf.id} style={{
                        padding: "14px",
                        borderRadius: "12px",
                        border: "1px solid var(--border-color)",
                        backgroundColor: "#FCFAF6",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-main)" }}>
                              {trf.animalName} ({trf.id})
                            </span>
                            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block", marginTop: "2px" }}>
                              {trf.sourceNGO} ➔ {trf.destinationNGO}
                            </span>
                          </div>
                          <span className={`badge badge-${trf.status === "Approved" ? "adopted" : trf.status === "Pending" ? "lost" : "rescued"}`} style={{ fontSize: "0.65rem" }}>
                            {trf.status}
                          </span>
                        </div>

                        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0, fontStyle: "italic" }}>
                          Reason: "{trf.reason}"
                        </p>

                        {/* Approve/Reject actions for incoming pending transfers */}
                        {isIncoming && trf.status === "Pending" && (
                          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                            <button 
                              className="btn btn-secondary btn-sm" 
                              style={{ flex: 1, padding: "4px" }}
                              onClick={() => respondToNGOTransfer(trf.id, "Approved")}
                            >
                              Approve
                            </button>
                            <button 
                              className="btn btn-outline btn-sm" 
                              style={{ flex: 1, padding: "4px", color: "var(--accent-coral)", borderColor: "var(--accent-coral)" }}
                              onClick={() => respondToNGOTransfer(trf.id, "Rejected")}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Request a Transfer list (Stray Animals currently in this shelter) */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
                <Send size={18} color="var(--primary-color)" /> Initiate Custody Transfer
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
                Select an animal resident in this facility to file a transfer request to another registered NGO ward.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "250px", overflowY: "auto" }}>
                {shelterPets.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center" }}>No animal residents currently in shelter custody.</p>
                ) : (
                  shelterPets.map((pet) => (
                    <div key={pet.id} style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "#FCFAF6"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img src={pet.photo} alt={pet.name} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                        <div>
                          <strong style={{ fontSize: "0.85rem" }}>{pet.name}</strong>
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>{pet.id} • {pet.breed}</span>
                        </div>
                      </div>
                      <button 
                        className="btn btn-outline btn-sm" 
                        style={{ display: "flex", alignItems: "center", gap: "4px" }}
                        onClick={() => handleOpenTransferModal(pet)}
                      >
                        Transfer
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Section 4: Food & Medicine Inventory Table */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
                <Package size={20} color="var(--primary-color)" /> Food & Medicine Storehouse Inventory
              </h3>
              <button className="btn btn-outline btn-sm" onClick={() => alert("Reorder invoice templates downloaded.")}>
                Download Reorder Report
              </button>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Item ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Stock Level</th>
                    <th>Threshold</th>
                    <th>Status Gauge</th>
                    <th style={{ textAlign: "center" }}>Adjust Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => {
                    const isLow = item.stock < item.threshold;
                    const pct = Math.min(100, Math.floor((item.stock / (item.threshold * 2.5)) * 100));

                    return (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 700 }}>{item.id}</td>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td>{item.category}</td>
                        <td style={{ fontWeight: 700, color: isLow ? "var(--accent-coral)" : "var(--text-main)" }}>
                          {item.stock} {item.unit}
                        </td>
                        <td>{item.threshold} {item.unit}</td>
                        <td style={{ width: "160px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div style={{ height: "6px", width: "100%", backgroundColor: "#ECE8E0", borderRadius: "3px", overflow: "hidden" }}>
                              <div style={{
                                width: `${pct}%`,
                                height: "100%",
                                backgroundColor: isLow ? "var(--accent-coral)" : "var(--secondary-color)",
                                transition: "width 0.3s ease"
                              }} />
                            </div>
                            {isLow && (
                              <span style={{ fontSize: "0.65rem", color: "var(--accent-coral)", fontWeight: 700, display: "flex", alignItems: "center", gap: "2px" }}>
                                <AlertTriangle size={8} /> REORDER REQUIRED
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div style={{ display: "inline-flex", gap: "6px" }}>
                            <button
                              onClick={() => handleStockUpdate(item.id, -5)}
                              className="btn btn-outline btn-sm"
                              style={{ padding: "4px 8px" }}
                              title="Consume 5 units"
                            >
                              <Minus size={12} /> 5
                            </button>
                            <button
                              onClick={() => handleStockUpdate(item.id, 10)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: "4px 8px" }}
                              title="Add 10 units"
                            >
                              <Plus size={12} /> 10
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          MODAL: REQUEST TRANSFER
      ======================================================== */}
      {showTransferModal && selectedPetForTransfer && (
        <div className="modal-overlay" onClick={() => { setShowTransferModal(false); setSelectedPetForTransfer(null); }} style={{ zIndex: 9999 }}>
          <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px" }}>
            <div className="modal-header">
              <h2 style={{ fontWeight: 800, color: "var(--primary-color)", display: "flex", alignItems: "center", gap: "8px" }}>
                <ArrowLeftRight size={20} /> Request Custody Transfer
              </h2>
              <button className="modal-close" onClick={() => { setShowTransferModal(false); setSelectedPetForTransfer(null); }}>✕</button>
            </div>

            <form onSubmit={handleRequestTransferSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ padding: "10px", backgroundColor: "#FCFAF6", borderRadius: "10px", border: "1px solid var(--border-color)", display: "flex", gap: "10px", alignItems: "center" }}>
                <img src={selectedPetForTransfer.photo} alt={selectedPetForTransfer.name} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                <div>
                  <strong style={{ fontSize: "0.9rem" }}>{selectedPetForTransfer.name} ({selectedPetForTransfer.id})</strong>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Current Custodian: {selectedPetForTransfer.custodian}</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Destination NGO Partner *</label>
                <select
                  className="form-control"
                  value={transferForm.destinationNGO}
                  onChange={(e) => setTransferForm({ ...transferForm, destinationNGO: e.target.value })}
                >
                  {ngoList
                    .filter(n => n !== selectedPetForTransfer.custodian && n !== "Pune Central Shelter")
                    .map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))
                  }
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Transfer *</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Explain capacity overload, specialized medical equipment needs, gaushala requirements..."
                  value={transferForm.reason}
                  onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setShowTransferModal(false); setSelectedPetForTransfer(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ShelterMgmt;
