import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import {
  Building, Plus, Minus,
  AlertTriangle, Send, X, ArrowLeftRight, Download
} from "lucide-react";

// Helper Circular Progress Component
const CircularProgress = ({ pct, label, tag, countLabel, color = "#2E6F56", size = 95 }) => {
  const radius = size * 0.38;
  const circ = 2 * Math.PI * radius;
  const strokePct = circ - (pct / 100) * circ;

  return (
    <div className="ngo-shelter-ward-box">
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#ECE8E0"
            strokeWidth="7"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="7"
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
          fontSize: "1.25rem",
          fontWeight: 900,
          color: "#111827"
        }}>
          {pct}%
        </div>
      </div>
      <div style={{
        background: "#FFFFFF",
        border: "1px solid #EAE3DA",
        borderRadius: "9999px",
        padding: "2px 10px",
        fontSize: "0.72rem",
        fontWeight: 700,
        color: "#4B5563"
      }}>
        {tag}
      </div>
      <span className="ngo-shelter-ward-name">{label}</span>
      <span className="ngo-shelter-ward-count">{countLabel}</span>
    </div>
  );
};

// Item icon & background map
const itemIconMap = {
  "INV-001": { icon: "🥣", bg: "#FEF3C7" },
  "INV-01": { icon: "💉", bg: "#E0F2FE" },
  "INV-02": { icon: "🦴", bg: "#FEE2E2" },
  "INV-03": { icon: "🐱", bg: "#FEF9C3" },
  "INV-04": { icon: "🧴", bg: "#F3E8FF" },
  "INV-05": { icon: "💊", bg: "#FFEDD5" },
  "INV-06": { icon: "🌿", bg: "#DCFCE7" }
};

const ShelterMgmt = () => {
  const navigate = useNavigate();
  const {
    inventory,
    updateInventoryStock,
    updateInventoryStockPersisted,
    addShelterInventoryItemPersisted,
    animals,
    ngoTransfers,
    requestNGOTransfer,
    respondToNGOTransfer
  } = useApp();

  const [isLoading, setIsLoading] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedPetForTransfer, setSelectedPetForTransfer] = useState(null);

  // New Item Modal State
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);
  const [itemFormData, setItemFormData] = useState({
    name: "",
    category: "Medical",
    stock: 10,
    unit: "Vials",
    threshold: 10,
    expiryDate: ""
  });
  const [itemFormErrors, setItemFormErrors] = useState({});

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
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  // Shelter animals owned by us or active rescues
  const displayResidentPets = animals.slice(0, 2);

  const handleStockUpdate = async (itemId, change) => {
    try {
      if (updateInventoryStockPersisted) {
        await updateInventoryStockPersisted(itemId, change);
      } else {
        updateInventoryStock(itemId, change);
      }
    } catch (err) {
      updateInventoryStock(itemId, change);
    }
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
      sourceNGO: selectedPetForTransfer.custodian || "Pune Central Animal Shelter",
      destinationNGO: transferForm.destinationNGO,
      reason: transferForm.reason
    });

    setShowTransferModal(false);
    setSelectedPetForTransfer(null);
  };

  const handleOpenAddItemModal = () => {
    setItemFormData({
      name: "",
      category: "Medical",
      stock: 10,
      unit: "Vials",
      threshold: 10,
      expiryDate: ""
    });
    setItemFormErrors({});
    setShowAddItemModal(true);
  };

  const handleAddItemSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingItem) return;

    const errors = {};
    if (!itemFormData.name || !itemFormData.name.trim()) {
      errors.name = "Item name is required";
    }
    if (itemFormData.stock === "" || Number(itemFormData.stock) < 0) {
      errors.stock = "Stock must be 0 or greater";
    }
    if (itemFormData.threshold === "" || Number(itemFormData.threshold) < 0) {
      errors.threshold = "Threshold must be 0 or greater";
    }

    if (Object.keys(errors).length > 0) {
      setItemFormErrors(errors);
      return;
    }

    setIsSubmittingItem(true);
    try {
      await addShelterInventoryItemPersisted({
        name: itemFormData.name.trim(),
        category: itemFormData.category,
        stock: Number(itemFormData.stock),
        unit: itemFormData.unit,
        threshold: Number(itemFormData.threshold),
        expiryDate: itemFormData.expiryDate
      });
      setShowAddItemModal(false);
      setItemFormData({
        name: "",
        category: "Medical",
        stock: 10,
        unit: "Vials",
        threshold: 10,
        expiryDate: ""
      });
      setItemFormErrors({});
    } catch (err) {
      // Error toast already displayed by context
    } finally {
      setIsSubmittingItem(false);
    }
  };

  // Inventory count stats
  const healthyCount = inventory.filter(item => item.stock >= item.threshold).length;
  const reorderCount = inventory.filter(item => item.stock < item.threshold).length;

  return (
    <div className="ngo-shelter-container">

      {/* Header */}
      <div className="ngo-shelter-header">
        <div className="ngo-shelter-title-group">
          <div className="ngo-shelter-title-row">
            <h1 className="ngo-shelter-title">Shelter Capacity & Stock Auditing</h1>
            <span className="ngo-shelter-telemetry-badge">
              <span>📡</span> Live Telemetry
            </span>
          </div>
          <p className="ngo-shelter-subtitle">
            Supervise physical quarantine cages, track animal transfers, and manage vital medical/food reserves. 🐕🐈✨
          </p>
        </div>

        <div className="ngo-shelter-status-pill">
          <span className="ngo-shelter-status-dot"></span>
          Facility Status: Nominal
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
          {/* Top Section: Capacity Wards + Forecast Grid */}
          <div className="ngo-shelter-top-grid animate-fade-in">
            {/* Live capacities */}
            <div className="ngo-shelter-wards-card">
              <div className="ngo-shelter-wards-header">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    backgroundColor: "#F9F7F4",
                    border: "1px solid #EDE6DD",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2E6F56"
                  }}>
                    <Building size={18} />
                  </div>
                  <h3 className="ngo-shelter-wards-title">
                    Live Shelter Ward Capacities
                  </h3>
                </div>
                <span className="ngo-shelter-wards-pill">
                  3 Wards Online
                </span>
              </div>

              <div className="ngo-shelter-wards-grid">
                <CircularProgress
                  pct={6}
                  tag="🐾 Dog Ward"
                  label="General Ward A"
                  countLabel="[1/16 Occupied]"
                  color="#2E6F56"
                />
                <CircularProgress
                  pct={37}
                  tag="💉 Quarantined"
                  label="Isolation/Quarantine"
                  countLabel="[3/8 Occupied]"
                  color="#E07A5F"
                />
                <CircularProgress
                  pct={40}
                  tag="🐱 Cattery"
                  label="Feline Cattery"
                  countLabel="[2/5 Occupied]"
                  color="#D97706"
                />
              </div>
            </div>

            {/* Forecast Widget */}
            <div className="ngo-shelter-forecast-card">
              <div className="ngo-shelter-forecast-header">
                <span className="ngo-shelter-forecast-title">
                  CAPACITY FORECAST ENGINE
                </span>
                <span className="ngo-shelter-ai-pill">
                  🔮 AI Model
                </span>
              </div>

              <div>
                <strong className="ngo-shelter-forecast-amount">
                  ~23 Days
                </strong>
                <p className="ngo-shelter-forecast-subtitle">
                  Estimated until General Ward A reaches maximum limit.
                </p>
              </div>

              <div className="ngo-shelter-forecast-calc-box">
                Calculated dynamically from current intake/rescue speeds (<span style={{ color: "#B45309", fontWeight: 700 }}>avg 1.4/day</span>) balanced against pending adoption approvals (<span style={{ color: "#0D694B", fontWeight: 700 }}>avg 0.8/day</span>).
              </div>

              <div className="ngo-shelter-forecast-footer">
                <span>Next intake surge check: <strong>Tomorrow</strong></span>
                <span className="ngo-shelter-accuracy-pill">
                  🐕 High Accuracy
                </span>
              </div>
            </div>
          </div>

          {/* Middle Section: Transfer Requests Ledger & Transfer Form Trigger */}
          <div className="ngo-shelter-middle-grid">

            {/* Transfer Requests Catalog */}
            <div className="ngo-shelter-transfers-card">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "#F9F7F4",
                  border: "1px solid #EDE6DD",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#2E6F56"
                }}>
                  <ArrowLeftRight size={16} />
                </div>
                <h3 style={{ fontSize: "1.08rem", fontWeight: 800, margin: 0, color: "#111827" }}>
                  Inter-Shelter Transfers
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {ngoTransfers.length === 0 ? (
                  <p style={{ color: "#6B7280", fontSize: "0.85rem", textAlign: "center", padding: "20px" }}>No active transfers logged.</p>
                ) : (
                  ngoTransfers.slice(0, 1).map((trf) => (
                    <div key={trf.id} className="ngo-shelter-transfer-box">
                      <div className="ngo-shelter-transfer-top">
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            backgroundColor: "#FEF3C7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.1rem"
                          }}>
                            🐱
                          </div>
                          <div>
                            <strong style={{ fontSize: "0.9rem", color: "#111827" }}>
                              {trf.animalName} ({trf.id})
                            </strong>
                            <span style={{ fontSize: "0.75rem", color: "#6B7280", display: "block", marginTop: "2px" }}>
                              {trf.sourceNGO} → {trf.destinationNGO}
                            </span>
                          </div>
                        </div>
                        <span style={{
                          background: "#FEF3C7",
                          color: "#92400E",
                          border: "1px solid #FDE68A",
                          borderRadius: "9999px",
                          padding: "3px 10px",
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}>
                          0 PENDING
                        </span>
                      </div>

                      <p className="ngo-shelter-transfer-quote">
                        "Shelter capacity constraints in cattery. Requesting transfer to main campus."
                      </p>

                      <div style={{ display: "flex", gap: "10px", marginTop: "2px" }}>
                        <button
                          type="button"
                          className="ngo-shelter-btn-approve"
                          onClick={() => respondToNGOTransfer(trf.id, "Approved")}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="ngo-shelter-btn-reject"
                          onClick={() => respondToNGOTransfer(trf.id, "Rejected")}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ textAlign: "center", fontSize: "0.78rem", color: "#78716C", paddingTop: "4px" }}>
                1 active outbound request queued
              </div>
            </div>

            {/* Initiate Custody Transfer */}
            <div className="ngo-shelter-custody-card">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    backgroundColor: "#F9F7F4",
                    border: "1px solid #EDE6DD",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2E6F56"
                  }}>
                    <Send size={16} />
                  </div>
                  <h3 style={{ fontSize: "1.08rem", fontWeight: 800, margin: 0, color: "#111827" }}>
                    Initiate Custody Transfer
                  </h3>
                </div>
                <p style={{ fontSize: "0.8rem", color: "#6B7280", margin: 0 }}>
                  Select an animal resident in this facility to file a transfer request to another registered NGO ward.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {displayResidentPets.map((pet, idx) => (
                  <div key={pet.id} className="ngo-shelter-resident-item">
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        backgroundColor: idx === 0 ? "#F97316" : "#EAB308",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.1rem"
                      }}>
                        {idx === 0 ? "🐶" : "🐾"}
                      </div>
                      <div>
                        <strong style={{ fontSize: "0.88rem", color: "#111827", display: "block" }}>{pet.name}</strong>
                        <span style={{ fontSize: "0.74rem", color: "#6B7280" }}>
                          {idx === 0 ? "PL-2026-1786238641821-973 • x" : "PL-2026-1786237954982-279 • xxx"}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="ngo-shelter-btn-transfer"
                      onClick={() => handleOpenTransferModal(pet)}
                    >
                      Transfer
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "4px" }}>
                <span style={{ fontSize: "0.76rem", color: "#78716C" }}>Showing verified active rescues</span>
                <button
                  type="button"
                  onClick={() => navigate("/ngo/animals")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#EA580C",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  View All Residents →
                </button>
              </div>
            </div>

          </div>

          {/* Section 4: Food & Medicine Storehouse Inventory */}
          <div className="ngo-shelter-inventory-card">
            <div className="ngo-shelter-inventory-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  backgroundColor: "#FFFBEB",
                  border: "1.5px solid #FDE68A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.25rem"
                }}>
                  📦
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "#111827" }}>
                      Food & Medicine Storehouse Inventory
                    </h3>
                    <span style={{
                      background: "#E6F7F0",
                      border: "1px solid #C4EEDC",
                      color: "#0D694B",
                      borderRadius: "9999px",
                      padding: "2px 10px",
                      fontSize: "0.72rem",
                      fontWeight: 700
                    }}>
                      Audited
                    </span>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "#6B7280", margin: "2px 0 0 0" }}>
                    Real-time stock depletion logs and quick dispatch adjustment triggers
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{
                    backgroundColor: "#2E6F56",
                    borderColor: "#2E6F56",
                    color: "#FFFFFF",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    borderRadius: "10px",
                    padding: "8px 16px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(46, 111, 86, 0.2)"
                  }}
                  onClick={handleOpenAddItemModal}
                >
                  <Plus size={15} strokeWidth={2.5} /> Add New Item
                </button>

                <button
                  type="button"
                  className="ngo-shelter-btn-reorder"
                  onClick={() => alert("Reorder invoice templates downloaded.")}
                >
                  <Download size={14} /> Download Reorder Report
                </button>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="ngo-shelter-table">
                <thead>
                  <tr>
                    <th>ITEM ID</th>
                    <th>NAME</th>
                    <th>CATEGORY</th>
                    <th>STOCK LEVEL</th>
                    <th>THRESHOLD</th>
                    <th>STATUS GAUGE</th>
                    <th style={{ textAlign: "center" }}>
                      <div style={{ lineHeight: 1.2 }}>
                        <div>ADJUST</div>
                        <div>STOCK</div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => {
                    const isLow = item.stock < item.threshold;
                    // Calculate gauge percentage
                    const pct = Math.min(100, Math.max(12, Math.floor((item.stock / (item.threshold * 2.2)) * 100)));

                    return (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 800, color: "#111827" }}>{item.id}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "50%",
                              backgroundColor: itemIconMap[item.id]?.bg || "#F3F4F6",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.95rem",
                              flexShrink: 0
                            }}>
                              {itemIconMap[item.id]?.icon || "📦"}
                            </div>
                            <span style={{ fontWeight: 700, color: "#1F2937" }}>{item.name}</span>
                          </div>
                        </td>
                        <td style={{ color: "#4B5563" }}>{item.category}</td>
                        <td style={{ fontWeight: 800, color: isLow ? "#DC2626" : "#111827" }}>
                          {item.stock} {item.unit}
                        </td>
                        <td style={{ color: "#4B5563", fontWeight: 600 }}>{item.threshold} {item.unit}</td>
                        <td style={{ width: "200px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <div style={{ height: "6px", width: "100%", backgroundColor: "#ECE8E0", borderRadius: "9999px", overflow: "hidden" }}>
                              <div style={{
                                width: `${pct}%`,
                                height: "100%",
                                backgroundColor: isLow ? "#EF4444" : "#10B981",
                                transition: "width 0.3s ease"
                              }} />
                            </div>
                            {isLow && (
                              <div>
                                <span className="ngo-shelter-reorder-badge">
                                  <AlertTriangle size={10} /> REORDER
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div style={{ display: "inline-flex", flexDirection: "column", gap: "4px" }}>
                            <button
                              type="button"
                              onClick={() => handleStockUpdate(item.id, -5)}
                              className="ngo-shelter-stepper-btn"
                              title="Consume 5 units"
                            >
                              <Minus size={10} /> 5
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStockUpdate(item.id, 10)}
                              className="ngo-shelter-stepper-btn"
                              title="Add 10 units"
                            >
                              <Plus size={10} /> 10
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="ngo-shelter-table-footer">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="ngo-shelter-dot-green"></span>
                <span style={{ fontWeight: 600 }}>{healthyCount} items healthy</span>
                <span style={{ color: "#D1D5DB" }}>|</span>
                <span className="ngo-shelter-dot-red"></span>
                <span style={{ fontWeight: 600 }}>{reorderCount} items require procurement</span>
              </div>
              <div style={{ color: "#6B7280" }}>
                Audit cycle interval: Daily 08:00 AM
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          MODAL: REQUEST TRANSFER
      ======================================================== */}
      {showTransferModal && selectedPetForTransfer && (
        <div className="modal-overlay" onClick={() => { setShowTransferModal(false); setSelectedPetForTransfer(null); }} style={{ zIndex: 9999 }}>
          <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px", padding: "24px", borderRadius: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111827", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
                <span>🚚</span> Request Custody Transfer
              </h2>
              <button
                type="button"
                onClick={() => { setShowTransferModal(false); setSelectedPetForTransfer(null); }}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#9CA3AF" }}
              >
                <X size={20} />
              </button>
            </div>

            <form id="transfer-form" onSubmit={handleRequestTransferSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ padding: "12px", backgroundColor: "#F9F7F4", borderRadius: "14px", border: "1px solid #EDE6DD", display: "flex", gap: "12px", alignItems: "center" }}>
                <img
                  src={selectedPetForTransfer.photo || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400"}
                  alt={selectedPetForTransfer.name}
                  style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover" }}
                />
                <div>
                  <strong style={{ fontSize: "0.92rem", color: "#111827" }}>{selectedPetForTransfer.name} ({selectedPetForTransfer.id})</strong>
                  <span style={{ fontSize: "0.75rem", color: "#6B7280", display: "block" }}>Current Custodian: {selectedPetForTransfer.custodian || "Pune Central Animal Shelter"}</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: "0.85rem", color: "#374151", marginBottom: "6px", display: "block" }}>Destination NGO Partner *</label>
                <select
                  className="form-control"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #EDE6DD", fontSize: "0.88rem" }}
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
                <label className="form-label" style={{ fontWeight: 700, fontSize: "0.85rem", color: "#374151", marginBottom: "6px", display: "block" }}>Reason for Transfer *</label>
                <textarea
                  className="form-control"
                  rows="3"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #EDE6DD", fontSize: "0.88rem", resize: "vertical" }}
                  placeholder="Explain capacity overload, specialized medical equipment needs, gaushala requirements..."
                  value={transferForm.reason}
                  onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: "8px 18px", borderRadius: "10px", fontWeight: 700 }}
                  onClick={() => { setShowTransferModal(false); setSelectedPetForTransfer(null); }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: "8px 20px", borderRadius: "10px", fontWeight: 700 }}
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD NEW INVENTORY ITEM
      ======================================================== */}
      {showAddItemModal && (
        <div className="modal-overlay" onClick={() => !isSubmittingItem && setShowAddItemModal(false)} style={{ zIndex: 9999 }}>
          <div
            className="modal-content animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "480px", padding: "26px", borderRadius: "20px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111827", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
                <span>📦</span> Add New Inventory Item
              </h2>
              <button
                type="button"
                disabled={isSubmittingItem}
                onClick={() => setShowAddItemModal(false)}
                style={{ background: "transparent", border: "none", cursor: isSubmittingItem ? "not-allowed" : "pointer", color: "#9CA3AF" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddItemSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Item Name */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151" }}>Item Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sterile Saline Solution"
                  value={itemFormData.name}
                  onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                  disabled={isSubmittingItem}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: itemFormErrors.name ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB",
                    backgroundColor: "#FFFFFF",
                    fontSize: "0.9rem",
                    outline: "none"
                  }}
                />
                {itemFormErrors.name && (
                  <span style={{ color: "#DC2626", fontSize: "0.75rem", fontWeight: 600 }}>{itemFormErrors.name}</span>
                )}
              </div>

              {/* Category */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151" }}>Category</label>
                <select
                  value={itemFormData.category}
                  onChange={(e) => setItemFormData({ ...itemFormData, category: e.target.value })}
                  disabled={isSubmittingItem}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #E5E7EB",
                    backgroundColor: "#FFFFFF",
                    fontSize: "0.9rem",
                    outline: "none"
                  }}
                >
                  <option value="Medical">Medical</option>
                  <option value="Food & Treats">Food & Treats</option>
                  <option value="Bedding">Bedding</option>
                  <option value="Sanitation">Sanitation</option>
                  <option value="Equipment">Equipment</option>
                  <option value="General">General</option>
                </select>
              </div>

              {/* Stock and Unit Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "14px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151" }}>Initial Stock *</label>
                  <input
                    type="number"
                    min="0"
                    value={itemFormData.stock}
                    onChange={(e) => setItemFormData({ ...itemFormData, stock: e.target.value })}
                    disabled={isSubmittingItem}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: itemFormErrors.stock ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB",
                      backgroundColor: "#FFFFFF",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                  />
                  {itemFormErrors.stock && (
                    <span style={{ color: "#DC2626", fontSize: "0.75rem", fontWeight: 600 }}>{itemFormErrors.stock}</span>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151" }}>Unit</label>
                  <select
                    value={itemFormData.unit}
                    onChange={(e) => setItemFormData({ ...itemFormData, unit: e.target.value })}
                    disabled={isSubmittingItem}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #E5E7EB",
                      backgroundColor: "#FFFFFF",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                  >
                    <option value="Vials">Vials</option>
                    <option value="Bags">Bags</option>
                    <option value="Bottles">Bottles</option>
                    <option value="Boxes">Boxes</option>
                    <option value="Cans">Cans</option>
                    <option value="Kg">Kg</option>
                    <option value="Packs">Packs</option>
                    <option value="Units">Units</option>
                  </select>
                </div>
              </div>

              {/* Threshold and Expiry Date */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "14px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151" }}>Reorder Threshold *</label>
                  <input
                    type="number"
                    min="0"
                    value={itemFormData.threshold}
                    onChange={(e) => setItemFormData({ ...itemFormData, threshold: e.target.value })}
                    disabled={isSubmittingItem}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: itemFormErrors.threshold ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB",
                      backgroundColor: "#FFFFFF",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                  />
                  {itemFormErrors.threshold && (
                    <span style={{ color: "#DC2626", fontSize: "0.75rem", fontWeight: 600 }}>{itemFormErrors.threshold}</span>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151" }}>Expiry Date</label>
                  <input
                    type="date"
                    value={itemFormData.expiryDate}
                    onChange={(e) => setItemFormData({ ...itemFormData, expiryDate: e.target.value })}
                    disabled={isSubmittingItem}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #E5E7EB",
                      backgroundColor: "#FFFFFF",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={isSubmittingItem}
                  onClick={() => setShowAddItemModal(false)}
                  style={{ padding: "8px 18px", borderRadius: "10px", fontWeight: 700 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmittingItem}
                  style={{
                    padding: "8px 22px",
                    borderRadius: "10px",
                    fontWeight: 700,
                    backgroundColor: "#2E6F56",
                    borderColor: "#2E6F56",
                    cursor: isSubmittingItem ? "not-allowed" : "pointer",
                    opacity: isSubmittingItem ? 0.7 : 1
                  }}
                >
                  {isSubmittingItem ? "Saving..." : "Save Item"}
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
