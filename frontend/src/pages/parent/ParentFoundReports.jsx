import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { MapPin, Phone, Calendar, CheckCircle2, AlertTriangle, ShieldCheck, XCircle, Clock } from "lucide-react";

const ParentFoundReports = () => {
  const { foundReports, animals, confirmFoundMatch, dismissFoundReport } = useApp();
  const [activeTab, setActiveTab] = useState("pending");

  // Get all parent-custodied pets
  const parentPets = (animals || []).filter((p) => {
    const cust = p.custodian || "";
    return cust.toLowerCase().includes("family") || cust.toLowerCase().includes("home");
  });
  const parentPetIds = parentPets.map((p) => p.id);

  // Filter reports targeting parent's pets
  const relevantReports = (foundReports || []).filter((r) => parentPetIds.includes(r.animalId));

  // Split into tabs
  const pendingReports = relevantReports.filter((r) => r.status === "Pending");
  const historyReports = relevantReports.filter((r) => r.status === "Confirmed" || r.status === "Dismissed");

  const currentReports = activeTab === "pending" ? pendingReports : historyReports;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "800px", margin: "0 auto" }}>
      
      {/* Header section */}
      <div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
          Found Pet Reports
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginTop: "4px" }}>
          Monitor incoming public collar scan alerts and check-in locations reported by citizens for your missing pets.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
        <button
          onClick={() => setActiveTab("pending")}
          style={{
            padding: "8px 20px",
            borderRadius: "30px",
            border: 0,
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "0.85rem",
            backgroundColor: activeTab === "pending" ? "var(--accent-amber-light)" : "transparent",
            color: activeTab === "pending" ? "var(--accent-amber)" : "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <AlertTriangle size={14} /> Pending Alerts ({pendingReports.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          style={{
            padding: "8px 20px",
            borderRadius: "30px",
            border: 0,
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "0.85rem",
            backgroundColor: activeTab === "history" ? "#EAE6DF" : "transparent",
            color: activeTab === "history" ? "var(--text-main)" : "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <Clock size={14} /> Resolved History ({historyReports.length})
        </button>
      </div>

      {/* Reports List Grid */}
      {currentReports.length === 0 ? (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <ShieldCheck size={36} color="var(--primary-color)" />
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            {activeTab === "pending" ? "No pending found reports at this time. All pets are accounted for." : "No past resolved report history logged."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {currentReports.map((report) => {
            const pet = parentPets.find((p) => p.id === report.animalId);
            return (
              <div
                key={report.id}
                className="card animate-scale-up"
                style={{
                  padding: "24px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "18px",
                  display: "grid",
                  gridTemplateColumns: "80px 1fr",
                  gap: "20px"
                }}
              >
                {/* Pet Photo Avatar */}
                <img
                  src={pet?.photo}
                  alt={pet?.name}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "12px",
                    objectFit: "cover",
                    border: "1px solid var(--border-color)"
                  }}
                />

                {/* Report Content Details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  
                  {/* Title Bar */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                    <div>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0 }}>
                        {pet?.name || "Unknown"} <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 500 }}>({report.animalId})</span>
                      </h3>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                        <Clock size={12} /> Scan Logged: {report.reportedAt}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`badge badge-${
                        report.status === "Pending" ? "rescued" :
                        report.status === "Confirmed" ? "adopted" : "shelter"
                      }`}
                      style={{ fontSize: "0.68rem" }}
                    >
                      {report.status}
                    </span>
                  </div>

                  {/* Details Data Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="animal-profile-grid">
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                        <MapPin size={16} color="var(--primary-color)" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <span style={{ fontSize: "0.82rem", lineHeight: 1.4 }}>
                          <strong>Reported Location:</strong><br />
                          {report.finderLocation}
                        </span>
                      </div>

                      {report.finderContact && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Phone size={14} color="var(--primary-color)" />
                          <span style={{ fontSize: "0.82rem" }}>
                            <strong>Contact:</strong> {report.finderContact}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Condition Photo Upload preview */}
                    {report.finderPhoto ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>Finder Upload Photo:</span>
                        <img
                          src={report.finderPhoto}
                          alt="Pet condition"
                          style={{
                            width: "100%",
                            maxHeight: "120px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1px solid var(--border-color)"
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed var(--border-color)", borderRadius: "8px", backgroundColor: "#FCFAF6", padding: "12px", height: "80px" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>No finder photo uploaded</span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons (only for pending) */}
                  {report.status === "Pending" && (
                    <div style={{ display: "flex", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-color)", paddingTop: "14px" }}>
                      <button
                        className="btn btn-primary"
                        style={{
                          backgroundColor: "var(--secondary-color)",
                          borderColor: "var(--secondary-color)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.8rem",
                          padding: "8px 16px"
                        }}
                        onClick={() => confirmFoundMatch(report.id)}
                      >
                        <CheckCircle2 size={14} /> Confirm Reunion Match
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.8rem",
                          padding: "8px 16px"
                        }}
                        onClick={() => dismissFoundReport(report.id)}
                      >
                        <XCircle size={14} /> Dismiss Report
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ParentFoundReports;
