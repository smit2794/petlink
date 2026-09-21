import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { MapPin, Phone, Clock, AlertTriangle, CheckCircle2, ShieldAlert, XCircle, ArrowLeft, PawPrint } from "lucide-react";

// Report status badge with icon
const getReportStatusBadge = (status) => {
  if (status === "Pending") return <span className="badge badge-rescued" style={{ fontSize: "0.68rem" }}><Clock size={11} /> Pending</span>;
  if (status === "Confirmed") return <span className="badge badge-adopted" style={{ fontSize: "0.68rem" }}><CheckCircle2 size={11} /> Confirmed</span>;
  return <span className="badge badge-shelter" style={{ fontSize: "0.68rem" }}><XCircle size={11} /> Dismissed</span>;
};

const NGOFoundReports = () => {
  const { foundReports, animals, confirmFoundMatch, dismissFoundReport } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("pending");
  const [selectedPetFilter, setSelectedPetFilter] = useState("All");

  const queryPetId = searchParams.get("petId");

  // Sync state filter if query param changes
  useEffect(() => {
    if (queryPetId) {
      setSelectedPetFilter(queryPetId);
    } else {
      setSelectedPetFilter("All");
    }
  }, [queryPetId]);

  const ngoPets = (animals || []).filter((p) => {
    const cust = p.custodian || "";
    return !cust.toLowerCase().includes("family") && !cust.toLowerCase().includes("home");
  });
  const ngoPetIds = ngoPets.map((p) => p.id);

  // Filter reports targeting NGO animals
  const relevantReports = (foundReports || []).filter((r) => ngoPetIds.includes(r.animalId));

  // Extract unique pets represented in reports for the dropdown selector
  const petsWithReports = ngoPets.filter((p) =>
    relevantReports.some((r) => r.animalId === p.id)
  );

  // Filter reports based on tabs and dropdown filters
  const filteredByTab = relevantReports.filter((r) => {
    if (activeTab === "pending") return r.status === "Pending";
    if (activeTab === "confirmed") return r.status === "Confirmed";
    return r.status === "Dismissed";
  });

  const finalReports = filteredByTab.filter((r) => {
    return selectedPetFilter === "All" || r.animalId === selectedPetFilter;
  });

  const handleClearPetFilter = () => {
    setSearchParams({});
    setSelectedPetFilter("All");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Header Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
            Stray Found Reports Ledger
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginTop: "4px" }}>
            Review check-in locations of stray animals marked lost to verify and confirm their safe recovery to shelter custody.
          </p>
        </div>

        {queryPetId && (
          <button 
            className="btn btn-outline btn-sm animate-fade-in" 
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
            onClick={handleClearPetFilter}
          >
            <ArrowLeft size={14} /> Clear Filter (Showing {queryPetId})
          </button>
        )}
      </div>

      {/* Filter Controls Row */}
      <div className="card" style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        
        {/* Status Tabs Switcher */}
        <div style={{ display: "flex", gap: "6px" }}>
          {["pending", "confirmed", "dismissed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 18px",
                borderRadius: "30px",
                border: 0,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.82rem",
                textTransform: "capitalize",
                backgroundColor: activeTab === tab ? "var(--secondary-light)" : "transparent",
                color: activeTab === tab ? "var(--primary-color)" : "var(--text-muted)",
                borderBottom: activeTab === tab ? "2px solid var(--secondary-color)" : "2px solid transparent",
                borderRadius: activeTab === tab ? "10px 10px 0 0" : "30px",
                transition: "all var(--transition-fast)"
              }}
            >
              {tab === "pending" ? `Pending (${relevantReports.filter(r => r.status === "Pending").length})` : 
               tab === "confirmed" ? `Confirmed (${relevantReports.filter(r => r.status === "Confirmed").length})` : 
               `Dismissed (${relevantReports.filter(r => r.status === "Dismissed").length})`}
            </button>
          ))}
        </div>

        {/* Animal Select Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)" }}>Filter by Animal:</label>
          <select
            className="form-control"
            style={{ borderRadius: "20px", padding: "6px 14px", fontSize: "0.82rem", minWidth: "160px" }}
            value={selectedPetFilter}
            onChange={(e) => {
              setSelectedPetFilter(e.target.value);
              if (e.target.value === "All") {
                setSearchParams({});
              } else {
                setSearchParams({ petId: e.target.value });
              }
            }}
          >
            <option value="All">All Animals</option>
            {petsWithReports.map((pet) => (
              <option key={pet.id} value={pet.id}>{pet.name} ({pet.id})</option>
            ))}
          </select>
        </div>

      </div>

      {/* Main Ledger Display */}
      {finalReports.length === 0 ? (
        <div className="empty-state paw-bg">
          <div className="empty-state-icon"><PawPrint size={28} /></div>
          <p className="empty-state-title">No reports in this stage</p>
          <p className="empty-state-desc">No found reports match the current tab and filter selection.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {finalReports.map((report) => {
            const pet = ngoPets.find((p) => p.id === report.animalId);
            return (
              <div
                key={report.id}
                className="card animate-scale-up"
                style={{
                  padding: "24px",
                  borderRadius: "20px",
                  display: "grid",
                  gridTemplateColumns: "100px 1fr",
                  gap: "24px",
                  borderLeft: `5px solid ${
                    report.status === "Pending" ? "var(--accent-amber)" :
                    report.status === "Confirmed" ? "#27AE60" : "var(--text-muted)"
                  }`
                }}
              >
                {/* Animal Photo */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
                  <img
                    src={pet?.photo}
                    alt={pet?.name}
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "14px",
                      objectFit: "cover",
                      border: "1px solid var(--border-color)"
                    }}
                  />
                  <button 
                    className="btn btn-outline btn-sm"
                    style={{ padding: "4px 8px", fontSize: "0.68rem", width: "100%", whiteSpace: "nowrap" }}
                    onClick={() => navigate(`/ngo/animals`)}
                  >
                    View File
                  </button>
                </div>

                {/* Report Content */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  
                  {/* Header info */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                    <div>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "var(--text-main)" }}>
                        {pet?.name || "Unnamed Stray"} <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 500 }}>({report.animalId})</span>
                      </h3>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                        <Clock size={12} /> Reported check-in: {report.reportedAt}
                      </span>
                    </div>

                    {getReportStatusBadge(report.status)}
                  </div>

                  {/* Finder Details Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="animal-profile-grid">
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                        <MapPin size={16} color="var(--primary-color)" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <span style={{ fontSize: "0.82rem", lineHeight: 1.4 }}>
                          <strong>Location Coordinates:</strong><br />
                          {report.finderLocation}
                        </span>
                      </div>

                      {report.finderContact && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Phone size={14} color="var(--primary-color)" />
                          <span style={{ fontSize: "0.82rem" }}>
                            <strong>Finder Phone:</strong> {report.finderContact}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Finder status photo preview */}
                    {report.finderPhoto ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>Finder Condition Upload:</span>
                        <img
                          src={report.finderPhoto}
                          alt="Stray condition upload"
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
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>No condition photo provided</span>
                      </div>
                    )}
                  </div>

                  {/* Match Confirm Actions */}
                  {report.status === "Pending" && (
                    <div style={{ display: "flex", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-color)", paddingTop: "14px" }}>
                      <button
                        className="btn btn-primary"
                        style={{
                          backgroundColor: "var(--primary-color)",
                          borderColor: "var(--primary-color)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.8rem",
                          padding: "8px 16px"
                        }}
                        onClick={() => confirmFoundMatch(report.id)}
                      >
                        <CheckCircle2 size={14} /> Confirm Recovery Reunion
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
                        <XCircle size={14} /> Dismiss Alert
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

export default NGOFoundReports;
