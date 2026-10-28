import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Syringe, Plus, X, Package, Calendar, AlertTriangle, Check } from "lucide-react";

const VetInventory = () => {
  const { vetInventory, addOrUpdateVetInventoryItem, addOrUpdateVetInventoryItemPersisted } = useApp();

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
      const existing = vetInventory.find((item) => item.name === val);
      setFormData({
        ...formData,
        name: val,
        unit: existing ? existing.unit : "Vials",
        threshold: existing ? existing.threshold : 10,
        expiryDate: existing ? existing.expiryDate : ""
      });
    }
  };

  const handleSubmit = async (e) => {
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

    // Call context to add/update stock (persisted to database)
    try {
      await addOrUpdateVetInventoryItemPersisted({
        id: selectedItem ? selectedItem.id : undefined,
        name: finalName,
        stock: Number(formData.stock),
        unit: formData.unit,
        threshold: Number(formData.threshold),
        expiryDate: formData.expiryDate
      });
    } catch (err) {
      return; // error toast already shown, keep modal open so they can retry
    }

    // Close modal
    setShowAddModal(false);
  };

  // Compute counts for summary pills
  const lowStockCount = vetInventory.filter((i) => i.stock < i.threshold).length;
  const nearExpiryCount = vetInventory.filter(
    (i) => i.expiryDate && (i.expiryDate <= "2026-11-30" || i.expiryDate.startsWith("2026"))
  ).length;
  const optimalCount = vetInventory.filter((i) => {
    const isLow = i.stock < i.threshold;
    const isNear = i.expiryDate && (i.expiryDate <= "2026-11-30" || i.expiryDate.startsWith("2026"));
    return !isLow && !isNear;
  }).length;

  return (
    <div className="vet-inv-container">
      {/* 1. Header Section */}
      <div className="vet-inv-header">
        <div className="vet-inv-title-group">
          <div className="vet-inv-title-row">
            <h1 className="vet-inv-title">Clinic Medicine Inventory</h1>
            <span className="vet-inv-badge-active">
              🐾 Active Dispensary
            </span>
          </div>
          <p className="vet-inv-subtitle">
            Manage private clinical pharmacy stocks, vaccines, and surgical dressings.
          </p>
        </div>

        {/* Add Stock Action Button */}
        <button
          className="vet-inv-btn-add"
          onClick={handleOpenAddGeneralModal}
        >
          <Plus size={17} strokeWidth={2.6} /> Add Stock
        </button>
      </div>

      {/* 2. Notice Banner */}
      <div className="vet-inv-notice">
        <div className="vet-inv-notice-icon">
          🗃️
        </div>
        <p className="vet-inv-notice-text">
          Notice: This inventory logs the clinic's private dispensary. It is fully isolated from the NGO shelter stock.
        </p>
      </div>

      {/* 3. Verified Dispensary Items Table Card */}
      <div className="vet-inv-table-card">
        {/* Table Card Header Bar */}
        <div className="vet-inv-card-header">
          <div className="vet-inv-card-title">
            <div style={{
              width: "22px",
              height: "22px",
              borderRadius: "6px",
              backgroundColor: "#EEF2FF",
              color: "#5028FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.8rem"
            }}>
              📋
            </div>
            <span>VERIFIED DISPENSARY ITEMS</span>
          </div>
          <div className="vet-inv-summary-pills">
            <span className="vet-inv-summary-pill-optimal">
              ● {optimalCount} Optimal
            </span>
            <span className="vet-inv-summary-pill-low">
              ● {lowStockCount} Low Stock
            </span>
            <span className="vet-inv-summary-pill-expiry">
              ● {nearExpiryCount} Near Expiry
            </span>
          </div>
        </div>

        {/* Dispensary Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="vet-inv-table">
            <thead>
              <tr>
                <th className="vet-inv-th" style={{ width: "28%" }}>DISPENSARY ITEM</th>
                <th className="vet-inv-th" style={{ width: "16%" }}>CURRENT STOCK</th>
                <th className="vet-inv-th" style={{ width: "16%" }}>REORDER LIMIT</th>
                <th className="vet-inv-th" style={{ width: "16%" }}>EXPIRATION DATE</th>
                <th className="vet-inv-th" style={{ width: "14%" }}>STATUS ALERTS</th>
                <th className="vet-inv-th" style={{ width: "10%", textAlign: "center" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {vetInventory.map((item) => {
                const isLow = item.stock < item.threshold;
                const isNearExpiry = item.expiryDate && (
                  item.expiryDate <= "2026-11-30" || item.expiryDate.startsWith("2026")
                );

                return (
                  <tr key={item.id} className="vet-inv-row">
                    {/* Item Avatar + Name + ID */}
                    <td className="vet-inv-td">
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div className="vet-inv-avatar">
                          <Syringe size={16} strokeWidth={2.4} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span className="vet-inv-item-name">{item.name}</span>
                          <span className="vet-inv-item-id">{item.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Current Stock */}
                    <td className="vet-inv-td">
                      <span className="vet-inv-stock-qty">{item.stock} {item.unit}</span>
                    </td>

                    {/* Reorder Limit */}
                    <td className="vet-inv-td">
                      <span className="vet-inv-reorder-limit">{item.threshold} {item.unit}</span>
                    </td>

                    {/* Expiration Date */}
                    <td className="vet-inv-td">
                      <span className={isNearExpiry ? "vet-inv-expiry-danger" : "vet-inv-expiry-normal"}>
                        {item.expiryDate || "N/A"}
                      </span>
                    </td>

                    {/* Status Alerts */}
                    <td className="vet-inv-td">
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                        {isLow && (
                          <span className="vet-inv-alert-low">
                            <AlertTriangle size={11} strokeWidth={2.5} /> LOW STOCK
                          </span>
                        )}
                        {isNearExpiry && (
                          <span className="vet-inv-alert-expiry">
                            <Calendar size={11} strokeWidth={2.5} /> NEAR EXPIRY
                          </span>
                        )}
                        {!isLow && !isNearExpiry && (
                          <span className="vet-inv-alert-optimal">
                            <Check size={11} strokeWidth={3} /> OPTIMAL
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="vet-inv-td" style={{ textAlign: "center" }}>
                      <button
                        className="vet-inv-btn-restock"
                        onClick={() => handleOpenRestockModal(item)}
                      >
                        <Plus size={13} strokeWidth={2.8} /> Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer Bar */}
        <div className="vet-inv-table-footer">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              backgroundColor: "#F59E0B",
              color: "white",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.68rem",
              fontWeight: 900
            }}>!</span>
            <span>Auto-sync active: Batch logs synchronized with central dispensary server.</span>
          </div>
          <span style={{ fontFamily: "monospace", color: "#6B7280", letterSpacing: "0.02em" }}>
            Showing {vetInventory.length} of {vetInventory.length} clinical items
          </span>
        </div>
      </div>

      {/* ========================================================
          MODAL: GENERAL ADD / RESTOCK SUPPLY FORM
      ======================================================== */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)} style={{ zIndex: 9999 }}>
          <div
            className="animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              padding: "28px",
              maxWidth: "480px",
              width: "90%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              border: "1px solid #EDE6DD"
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor: "#EEF2FF",
                  color: "#5028FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem"
                }}>
                  {selectedItem ? "📦" : "➕"}
                </div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#111827", margin: 0 }}>
                  {selectedItem ? "Restock Supplies Item" : "Register Dispensary Stock"}
                </h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#9CA3AF",
                  display: "flex",
                  padding: "4px"
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Item selection (dropdown if new general addition, locked text if restocking) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151" }}>Medicine Item *</label>
                {selectedItem ? (
                  <input
                    type="text"
                    value={selectedItem.name}
                    disabled
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #E5E7EB",
                      backgroundColor: "#F9FAFB",
                      color: "#374151",
                      cursor: "not-allowed",
                      fontSize: "0.9rem",
                      fontWeight: 600
                    }}
                  />
                ) : (
                  <select
                    value={formData.name}
                    onChange={handleDropdownChange}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: errors.name ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB",
                      backgroundColor: "#FFFFFF",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                  >
                    {vetInventory.map((item) => (
                      <option key={item.id} value={item.name}>{item.name}</option>
                    ))}
                    <option value="__custom__">-- Register Custom/New Item --</option>
                  </select>
                )}
                {errors.name && <span style={{ color: "#DC2626", fontSize: "0.75rem", fontWeight: 600 }}>{errors.name}</span>}
              </div>

              {/* Custom Item name input field (conditional) */}
              {!selectedItem && isCustomItem && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151" }}>Custom Medicine Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Parvovirus Immune Globulin"
                    value={formData.customName}
                    onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: errors.name ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB",
                      backgroundColor: "#FFFFFF",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                  />
                </div>
              )}

              {/* Quantity and Unit Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151" }}>Quantity to Add *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: errors.stock ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB",
                      backgroundColor: "#FFFFFF",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                  />
                  {errors.stock && <span style={{ color: "#DC2626", fontSize: "0.75rem", fontWeight: 600 }}>{errors.stock}</span>}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151" }}>Unit *</label>
                  {selectedItem ? (
                    <input
                      type="text"
                      value={selectedItem.unit}
                      disabled
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1.5px solid #E5E7EB",
                        backgroundColor: "#F9FAFB",
                        color: "#374151",
                        cursor: "not-allowed",
                        fontSize: "0.9rem",
                        fontWeight: 600
                      }}
                    />
                  ) : (
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1.5px solid #E5E7EB",
                        backgroundColor: "#FFFFFF",
                        fontSize: "0.9rem",
                        outline: "none"
                      }}
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

              {/* Threshold and Expiry Date */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151" }}>Reorder Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.threshold}
                    onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                    disabled={selectedItem !== null}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #E5E7EB",
                      backgroundColor: selectedItem ? "#F9FAFB" : "#FFFFFF",
                      cursor: selectedItem ? "not-allowed" : "text",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151" }}>Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    disabled={selectedItem !== null}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #E5E7EB",
                      backgroundColor: selectedItem ? "#F9FAFB" : "#FFFFFF",
                      cursor: selectedItem ? "not-allowed" : "text",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    padding: "10px 18px",
                    borderRadius: "30px",
                    border: "1.5px solid #E5E7EB",
                    backgroundColor: "#FFFFFF",
                    color: "#4B5563",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "10px 18px",
                    borderRadius: "30px",
                    border: "none",
                    backgroundColor: "#5028FF",
                    color: "#FFFFFF",
                    fontWeight: 800,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(80, 40, 255, 0.25)"
                  }}
                >
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
