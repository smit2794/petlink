import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import {
  Settings, Building, ShieldCheck, Bell, Save, CheckCircle2,
  Lock, Radio, Phone, Mail, MapPin, Check
} from "lucide-react";

const SettingsMgmt = () => {
  const { addToast } = useApp();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    ngoName: user?.name || "Pune Central Animal Shelter",
    registrationNo: "NGO-MH-PUN-2024-88492",
    contactEmail: user?.email || "contact@punecentralshelter.org",
    hotline: "+91 20 2567 8900",
    address: "Survey No. 44, Pashan-Sus Road, Pashan",
    region: user?.city || "Pune / Zone 4 - West Suburbs",
    proximityRadius: 15,
    enableLiveDispatch: true,
    enableLowStockAlerts: true,
    enableTransferNotifications: true,
    dailyCensusSync: true
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      if (addToast) {
        addToast("Portal settings updated successfully!", "success");
      }
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 400);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1100px" }} className="animate-fade-in">
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "1.85rem", fontWeight: 900, color: "#111827", margin: 0, letterSpacing: "-0.03em" }}>
              Portal Settings & Configuration
            </h1>
            <span style={{
              background: "#FFF9EE",
              border: "1.5px solid #FDE68A",
              color: "#B45309",
              borderRadius: "9999px",
              padding: "4px 14px",
              fontSize: "0.8rem",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <span>⚙️</span> NGO Administration
            </span>
          </div>
          <p style={{ color: "#6B7280", fontSize: "0.92rem", margin: "6px 0 0 0" }}>
            Manage organization credentials, operational emergency parameters, and automated telemetry alerts.
          </p>
        </div>

        <div style={{
          background: "#E6F7F0",
          border: "1.5px solid #C4EEDC",
          color: "#0D694B",
          borderRadius: "9999px",
          padding: "6px 18px",
          fontSize: "0.82rem",
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981", display: "inline-block", boxShadow: "0 0 6px rgba(16, 185, 129, 0.6)" }} />
          System Status: Operational
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Section 1: Organization Profile */}
        <div style={{
          background: "#FFFFFF",
          border: "1.5px solid #EDE6DD",
          borderRadius: "22px",
          padding: "26px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #F5EFE9", paddingBottom: "14px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "#FFFBEB",
              border: "1px solid #FDE68A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#D97706"
            }}>
              <Building size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "#111827" }}>
                Organization Profile & Accreditation
              </h3>
              <p style={{ fontSize: "0.78rem", color: "#6B7280", margin: 0 }}>
                Municipal registration details and public contact coordinates for dispatch.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "18px" }}>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151", marginBottom: "6px", display: "block" }}>
                Official NGO Name
              </label>
              <input
                type="text"
                className="form-control"
                value={formData.ngoName}
                onChange={(e) => setFormData({ ...formData, ngoName: e.target.value })}
                required
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #EDE6DD", fontSize: "0.88rem" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151", marginBottom: "6px", display: "block" }}>
                Registration / 80G Certificate Number
              </label>
              <input
                type="text"
                className="form-control"
                value={formData.registrationNo}
                onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                required
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #EDE6DD", fontSize: "0.88rem" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151", marginBottom: "6px", display: "block" }}>
                Official Contact Email
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  className="form-control"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: "10px", border: "1.5px solid #EDE6DD", fontSize: "0.88rem" }}
                />
                <Mail size={16} color="#9CA3AF" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151", marginBottom: "6px", display: "block" }}>
                Emergency Dispatch Hotline
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.hotline}
                  onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: "10px", border: "1.5px solid #EDE6DD", fontSize: "0.88rem" }}
                />
                <Phone size={16} color="#9CA3AF" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              </div>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151", marginBottom: "6px", display: "block" }}>
                Facility Physical Address & Municipal Zone
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  className="form-control"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: "10px", border: "1.5px solid #EDE6DD", fontSize: "0.88rem" }}
                />
                <MapPin size={16} color="#9CA3AF" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Operational Dispatch & Alert Automations */}
        <div style={{
          background: "#FFFFFF",
          border: "1.5px solid #EDE6DD",
          borderRadius: "22px",
          padding: "26px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #F5EFE9", paddingBottom: "14px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "#E6F7F0",
              border: "1px solid #C4EEDC",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0D694B"
            }}>
              <Radio size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "#111827" }}>
                Operations & Telemetry Controls
              </h3>
              <p style={{ fontSize: "0.78rem", color: "#6B7280", margin: 0 }}>
                Configure proximity broadcast radiuses, low-stock thresholds, and inter-shelter communications.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            
            {/* Toggle 1 */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px",
              borderRadius: "14px",
              backgroundColor: "#F9F7F4",
              border: "1px solid #EDE6DD"
            }}>
              <div>
                <strong style={{ fontSize: "0.9rem", color: "#111827", display: "block" }}>
                  Live Proximity Dispatch Alerts
                </strong>
                <span style={{ fontSize: "0.76rem", color: "#6B7280" }}>
                  Automatically route citizen emergency rescue calls within {formData.proximityRadius}km to active on-duty volunteers.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.enableLiveDispatch}
                onChange={(e) => setFormData({ ...formData, enableLiveDispatch: e.target.checked })}
                style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#FF7A1A" }}
              />
            </div>

            {/* Toggle 2 */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px",
              borderRadius: "14px",
              backgroundColor: "#F9F7F4",
              border: "1px solid #EDE6DD"
            }}>
              <div>
                <strong style={{ fontSize: "0.9rem", color: "#111827", display: "block" }}>
                  Storehouse Low-Stock Warnings
                </strong>
                <span style={{ fontSize: "0.76rem", color: "#6B7280" }}>
                  Trigger immediate "REORDER" flags and generate supplier invoices when stock falls below threshold.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.enableLowStockAlerts}
                onChange={(e) => setFormData({ ...formData, enableLowStockAlerts: e.target.checked })}
                style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#FF7A1A" }}
              />
            </div>

            {/* Toggle 3 */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px",
              borderRadius: "14px",
              backgroundColor: "#F9F7F4",
              border: "1px solid #EDE6DD"
            }}>
              <div>
                <strong style={{ fontSize: "0.9rem", color: "#111827", display: "block" }}>
                  Inter-Shelter Transfer Network Broadcast
                </strong>
                <span style={{ fontSize: "0.76rem", color: "#6B7280" }}>
                  Allow partnered municipal NGO shelters to request animal custody transfers for ward balancing.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.enableTransferNotifications}
                onChange={(e) => setFormData({ ...formData, enableTransferNotifications: e.target.checked })}
                style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#FF7A1A" }}
              />
            </div>

            {/* Toggle 4 */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px",
              borderRadius: "14px",
              backgroundColor: "#F9F7F4",
              border: "1px solid #EDE6DD"
            }}>
              <div>
                <strong style={{ fontSize: "0.9rem", color: "#111827", display: "block" }}>
                  Daily Municipal Telemetry Sync (08:00 AM)
                </strong>
                <span style={{ fontSize: "0.76rem", color: "#6B7280" }}>
                  Automatically sync ward capacity and quarantine occupancy with Government Central Portal.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.dailyCensusSync}
                onChange={(e) => setFormData({ ...formData, dailyCensusSync: e.target.checked })}
                style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#FF7A1A" }}
              />
            </div>

          </div>
        </div>

        {/* Section 3: Admin Account & Security Session */}
        <div style={{
          background: "#FFFFFF",
          border: "1.5px solid #EDE6DD",
          borderRadius: "22px",
          padding: "26px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "18px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: "#1D1311",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              fontWeight: 800
            }}>
              {user?.name ? user.name[0].toUpperCase() : "A"}
            </div>
            <div>
              <strong style={{ fontSize: "0.95rem", color: "#111827", display: "block" }}>
                {user?.name || "animallove"} (Facility Administrator)
              </strong>
              <span style={{ fontSize: "0.78rem", color: "#6B7280" }}>
                Role: Authorized NGO Portal Manager • Production v2.4
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => alert("Password reset link has been dispatched to administrator email.")}
              style={{ padding: "8px 18px", borderRadius: "10px", fontWeight: 700, fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Lock size={14} /> Change Password
            </button>
          </div>
        </div>

        {/* Form Actions Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "14px", paddingTop: "8px" }}>
          {savedSuccess && (
            <span style={{ color: "#10B981", fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle2 size={16} /> All settings saved successfully!
            </span>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary"
            style={{
              padding: "12px 28px",
              borderRadius: "12px",
              fontWeight: 800,
              fontSize: "0.92rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#FF7A1A",
              borderColor: "#FF7A1A",
              color: "#FFFFFF",
              boxShadow: "0 4px 14px rgba(255, 122, 26, 0.3)"
            }}
          >
            <Save size={16} />
            {isSaving ? "Saving Configuration..." : "Save Settings"}
          </button>
        </div>

      </form>

    </div>
  );
};

export default SettingsMgmt;
