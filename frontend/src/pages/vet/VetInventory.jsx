import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Syringe, Plus, X, Package } from "lucide-react";

const VetInventory = () => {
  const { vetInventory, addOrUpdateVetInventoryItem } = useApp();
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // If null, we are adding general/new item
  
  // Form States
  const [isCustomItem, setIsCustomItem] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    customName: "",
    stock: 10,
    unit: "Vials",
    threshold: 10,
    expiryDate: ""
  });
  const [errors, setErrors] = useState({});

  // Opens modal for restocking a specific row item
  const handleOpenRestockModal = (item) => {
    setSelectedItem(item);
    setIsCustomItem(false);
    setFormData({
      name: item.name,
      customName: "",
      stock: 10,
      unit: item.unit,
      threshold: item.threshold,
      expiryDate: item.expiryDate
    });
    setErrors({});
    setShowAddModal(true);
  };

  // Opens modal for adding general or custom stock from the top button
  const handleOpenAddGeneralModal = () => {
    setSelectedItem(null);
    setIsCustomItem(false);
    setFormData({
      name: vetInventory[0] ? vetInventory[0].name : "",
      customName: "",
      stock: 10,
      unit: "Vials",
      threshold: 10,
      expiryDate: ""
    });
    setErrors({});
    setShowAddModal(true);
  };

  const handleDropdownChange = (e) => {
    const val = e.target.value;
    if (val === "__custom__") {
      setIsCustomItem(true);
      setFormData({ ...formData, name: "__custom__" });
    } else {
      setIsCustomItem(false);
      const existing = vetInventory.find(item => item.name === val);
      setFormData({
        ...formData,
        name: val,
        unit: existing ? existing.unit : "Vials",
        threshold: existing ? existing.threshold : 10,
        expiryDate: existing ? existing.expiryDate : ""
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const tempErrors = {};

    const finalName = isCustomItem ? formData.customName.trim() : formData.name;
    
    if (!finalName) {
      tempErrors.name = "Medicine name is required";
    }
    if (formData.stock <= 0) {
      tempErrors.stock = "Quantity must be greater than 0";
    }
    if (!formData.unit) {
      tempErrors.unit = "Unit is required";
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    // Call context to add/update stock
    addOrUpdateVetInventoryItem({
      id: selectedItem ? selectedItem.id : undefined,
      name: finalName,
      stock: Number(formData.stock),
      unit: formData.unit,
      threshold: Number(formData.threshold),
      expiryDate: formData.expiryDate
    });

    // Close modal
    setShowAddModal(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Header Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
            Clinic Medicine Inventory
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Manage private clinical pharmacy stocks, vaccines, and surgical dressings.
          </p>
        </div>
        
        {/* General + Add Stock Button */}
        <button 
          className="btn btn-primary animate-scale-up" 
          style={{ 
            backgroundColor: "var(--accent-coral)", 
            borderColor: "var(--accent-coral)", 
            display: "flex", 
            alignItems: "center", 
            gap: "6px" 
          }}
          onClick={handleOpenAddGeneralModal}
        >
          <Plus size={16} /> Add Stock
        </button>
      </div>

      {/* Stocks Info Callout */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "16px 20px",
        backgroundColor: "var(--accent-coral-light)",
        color: "var(--accent-coral)",
        borderRadius: "14px",
        border: "1px solid rgba(217, 83, 79, 0.15)",
        fontSize: "0.9rem",
        fontWeight: 700
      }}>
        <Package size={18} />
        <span>Notice: This inventory logs the clinic's private dispensary. It is fully isolated from the NGO shelter stock.</span>
      </div>

      {/* Table Container */}
      <div className="table-container animate-fade-in">
        <table className="table">
          <thead>
            <tr>
              <th>Dispensary Item</th>
              <th>Current Stock</th>
              <th>Reorder Limit</th>
              <th>Expiration Date</th>
              <th>Status Alerts</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {vetInventory.map((item) => {
              const isLow = item.stock < item.threshold;
              
              // Near expiry calculation (simplified mock warning)
              const expiryYear = item.expiryDate ? Number(item.expiryDate.split("-")[0]) : 2030;
              const isNearExpiry = expiryYear <= 2026;

              return (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(217, 83, 79, 0.08)",
                        color: "var(--accent-coral)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <Syringe size={16} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 800, color: "var(--text-main)", fontSize: "0.92rem" }}>{item.name}</span>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "monospace" }}>{item.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong style={{ fontSize: "0.95rem" }}>{item.stock} {item.unit}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>{item.threshold} {item.unit}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: isNearExpiry ? "var(--accent-coral)" : "var(--text-main)" }}>
                      {item.expiryDate || "N/A"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {isLow && (
                        <span className="badge badge-treatment" style={{ backgroundColor: "rgba(217,83,79,0.12)", color: "var(--accent-coral)", fontSize: "0.68rem" }}>
                          ⚠️ Low stock
                        </span>
                      )}
                      {isNearExpiry && (
                        <span className="badge badge-rescued" style={{ backgroundColor: "#FFE0E0", color: "#C0392B", fontSize: "0.68rem" }}>
                          📅 Near Expiry
                        </span>
                      )}
                      {!isLow && !isNearExpiry && (
                        <span className="badge badge-adopted" style={{ fontSize: "0.68rem" }}>
                          ✓ Optimal
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <button 
                      className="btn btn-outline btn-sm" 
                      style={{ borderColor: "var(--accent-coral)", color: "var(--accent-coral)", display: "flex", alignItems: "center", gap: "4px" }}
                      onClick={() => handleOpenRestockModal(item)}
                    >
                      <Plus size={12} /> Restock
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ========================================================
          MODAL: GENERAL ADD / RESTOCK SUPPLY FORM
      ======================================================== */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)} style={{ zIndex: 9999 }}>
          <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <h2 style={{ fontWeight: 800, color: "var(--primary-color)" }}>
                {selectedItem ? "📦 Restock Supplies Item" : "➕ Register Dispensary Stock"}
              </h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Item selection (dropdown if new general addition, locked text if restocking) */}
              <div className="form-group">
                <label className="form-label">Medicine Item *</label>
                {selectedItem ? (
                  <input
                    type="text"
                    className="form-control"
                    value={selectedItem.name}
                    disabled
                    style={{ backgroundColor: "#F2EFE9", cursor: "not-allowed" }}
                  />
                ) : (
                  <select
                    className="form-control"
                    value={formData.name}
                    onChange={handleDropdownChange}
                    style={{ borderColor: errors.name ? "var(--accent-coral)" : "" }}
                  >
                    {vetInventory.map(item => (
                      <option key={item.id} value={item.name}>{item.name}</option>
                    ))}
                    <option value="__custom__">-- Register Custom/New Item --</option>
                  </select>
                )}
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              {/* Custom Item name input field (conditional) */}
              {!selectedItem && isCustomItem && (
                <div className="form-group animate-slide-up">
                  <label className="form-label">Custom Medicine Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Parvovirus Immune Globulin"
                    className="form-control"
                    value={formData.customName}
                    onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
                    style={{ borderColor: errors.name ? "var(--accent-coral)" : "" }}
                  />
                </div>
              )}

              {/* Quantity and Unit Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Quantity to Add *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    style={{ borderColor: errors.stock ? "var(--accent-coral)" : "" }}
                  />
                  {errors.stock && <span className="form-error">{errors.stock}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Unit *</label>
                  {selectedItem ? (
                    <input
                      type="text"
                      className="form-control"
                      value={selectedItem.unit}
                      disabled
                      style={{ backgroundColor: "#F2EFE9", cursor: "not-allowed" }}
                    />
                  ) : (
                    <select
                      className="form-control"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    >
                      <option>Vials</option>
                      <option>Tablets</option>
                      <option>ml</option>
                      <option>Bottles</option>
                      <option>Packs</option>
                      <option>Boxes</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Threshold and Expiry Date (Conditional / Optional if custom/general addition) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Reorder Limit</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={formData.threshold}
                    onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                    disabled={selectedItem !== null}
                    style={{ backgroundColor: selectedItem ? "#F2EFE9" : "", cursor: selectedItem ? "not-allowed" : "" }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    disabled={selectedItem !== null}
                    style={{ backgroundColor: selectedItem ? "#F2EFE9" : "", cursor: selectedItem ? "not-allowed" : "" }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, backgroundColor: "var(--accent-coral)", borderColor: "var(--accent-coral)" }}>
                  Save Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default VetInventory;
