import React, { useState, useEffect } from "react";
import { Search, Filter, Shield, Eye, X, Building, Info } from "lucide-react";

const NGOMonitoring = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [complianceFilter, setComplianceFilter] = useState("All");
  
  // Selected NGO for detailed modal preview
  const [selectedNGO, setSelectedNGO] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const ngos = [
    { id: 1, name: "Pune Central Animal Shelter", region: "Kothrud", rescuesThisMonth: 42, animalsUnderCare: 85, compliance: "Compliant", shelterCapacity: "85%", avgAdoptionDays: 32, licensingDate: "2023-04-12" },
    { id: 2, name: "Hadapsar Gaushala Cattle Shelter", region: "Hadapsar", rescuesThisMonth: 18, animalsUnderCare: 120, compliance: "Compliant", shelterCapacity: "92%", avgAdoptionDays: 120, licensingDate: "2024-01-10" },
    { id: 3, name: "Aviation Bird Rehabilitation Clinic", region: "Deccan", rescuesThisMonth: 29, animalsUnderCare: 15, compliance: "Compliant", shelterCapacity: "50%", avgAdoptionDays: 14, licensingDate: "2025-06-18" },
    { id: 4, name: "Kothrud Feline Cattery", region: "Kothrud", rescuesThisMonth: 12, animalsUnderCare: 32, compliance: "Compliant", shelterCapacity: "68%", avgAdoptionDays: 24, licensingDate: "2024-09-02" },
    { id: 5, name: "Dhayari Stray Welfare Association", region: "Dhayari", rescuesThisMonth: 8, animalsUnderCare: 45, compliance: "Needs Review", shelterCapacity: "78%", avgAdoptionDays: 45, licensingDate: "2022-11-15" },
    { id: 6, name: "Swargate Rescue Team", region: "Swargate", rescuesThisMonth: 14, animalsUnderCare: 22, compliance: "Under Investigation", shelterCapacity: "40%", avgAdoptionDays: 52, licensingDate: "2023-08-30" }
  ];

  const filteredNGOs = ngos.filter(ngo => {
    const matchesSearch = ngo.name.toLowerCase().includes(searchTerm.toLowerCase()) || ngo.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = regionFilter === "All" || ngo.region === regionFilter;
    const matchesCompliance = complianceFilter === "All" || ngo.compliance === complianceFilter;
    return matchesSearch && matchesRegion && matchesCompliance;
  });

  const getComplianceColor = (status) => {
    switch (status) {
      case "Compliant": return "adopted";
      case "Needs Review": return "treatment";
      default: return "rescued";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Header Info */}
      <div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
          Registered NGO Monitoring
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
          Track active licenses, monitor shelter capacity limits, and review compliance ratings of registered animal shelters.
        </p>
      </div>

      {/* Filters Card */}
      <div className="card" style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center", padding: "20px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", position: "relative", flex: 1, minWidth: "260px" }}>
          <Search size={16} style={{ position: "absolute", left: "14px", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search NGOs by name or region..."
            className="form-control"
            style={{ width: "100%", paddingLeft: "40px", borderRadius: "30px" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Filter size={14} color="var(--text-muted)" />
            <select
              className="form-control"
              style={{ padding: "8px 16px", fontSize: "0.85rem", borderRadius: "30px" }}
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
            >
              <option value="All">All Regions</option>
              <option value="Kothrud">Kothrud</option>
              <option value="Hadapsar">Hadapsar</option>
              <option value="Deccan">Deccan</option>
              <option value="Swargate">Swargate</option>
              <option value="Dhayari">Dhayari</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Shield size={14} color="var(--text-muted)" />
            <select
              className="form-control"
              style={{ padding: "8px 16px", fontSize: "0.85rem", borderRadius: "30px" }}
              value={complianceFilter}
              onChange={(e) => setComplianceFilter(e.target.value)}
            >
              <option value="All">All Compliance</option>
              <option value="Compliant">Compliant</option>
              <option value="Needs Review">Needs Review</option>
              <option value="Under Investigation">Under Investigation</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        // Skeletons Table
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="skeleton" style={{ height: "60px", borderRadius: "12px" }} />
          ))}
        </div>
      ) : (
        /* Table Content */
        <div className="table-container animate-fade-in">
          <table className="table">
            <thead>
              <tr>
                <th>NGO Facility Details</th>
                <th>Region Node</th>
                <th>Rescues (This Month)</th>
                <th>Shelter Census</th>
                <th>Compliance Audit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNGOs.map((ngo) => (
                <tr key={ngo.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(92, 107, 115, 0.08)",
                        color: "#5C6B73",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <Building size={16} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 800, color: "var(--text-main)", fontSize: "0.92rem" }}>{ngo.name}</span>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Licensed on: {ngo.licensingDate}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>{ngo.region}</span>
                  </td>
                  <td>
                    <strong style={{ fontSize: "0.9rem" }}>{ngo.rescuesThisMonth} rescues</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 700 }}>
                      {ngo.animalsUnderCare} under care
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${getComplianceColor(ngo.compliance)}`} style={{ fontSize: "0.68rem" }}>
                      {ngo.compliance}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ display: "flex", alignItems: "center", gap: "4px", borderColor: "#5C6B73", color: "#5C6B73" }}
                      onClick={() => setSelectedNGO(ngo)}
                    >
                      <Eye size={12} /> Audit Stats
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================
          MODAL: AUDIT SUMMARY PANEL
      ======================================================== */}
      {selectedNGO && (
        <div className="modal-overlay" onClick={() => setSelectedNGO(null)} style={{ zIndex: 9999 }}>
          <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <h2 style={{ fontWeight: 800, color: "var(--primary-color)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Building size={20} /> Facility Audit Dossier
              </h2>
              <button className="modal-close" onClick={() => setSelectedNGO(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* Header Box */}
              <div>
                <strong style={{ fontSize: "1.1rem", display: "block" }}>{selectedNGO.name}</strong>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Node Region: {selectedNGO.region} • Ward Lic: {selectedNGO.id}09-G</span>
              </div>

              <hr style={{ border: 0, borderBottom: "1px solid var(--border-color)", margin: 0 }} />

              {/* Statistics Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ padding: "12px", backgroundColor: "#FCFAF6", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                  <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>Current Capacity Use</span>
                  <strong style={{ fontSize: "1.1rem", color: "var(--text-main)" }}>{selectedNGO.shelterCapacity}</strong>
                </div>
                <div style={{ padding: "12px", backgroundColor: "#FCFAF6", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                  <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>Avg Adoption Speed</span>
                  <strong style={{ fontSize: "1.1rem", color: "var(--text-main)" }}>{selectedNGO.avgAdoptionDays} Days</strong>
                </div>
                <div style={{ padding: "12px", backgroundColor: "#FCFAF6", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                  <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>Monthly Stray Intake</span>
                  <strong style={{ fontSize: "1.1rem", color: "var(--text-main)" }}>{selectedNGO.rescuesThisMonth} cases</strong>
                </div>
                <div style={{ padding: "12px", backgroundColor: "#FCFAF6", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                  <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Animals Logged</span>
                  <strong style={{ fontSize: "1.1rem", color: "var(--text-main)" }}>{selectedNGO.animalsUnderCare} heads</strong>
                </div>
              </div>

              {/* Compliance Rating Callout */}
              <div style={{
                display: "flex",
                gap: "10px",
                padding: "12px 16px",
                borderRadius: "10px",
                border: "1px solid var(--border-color)",
                backgroundColor: selectedNGO.compliance === "Compliant" ? "#EAF2EA" : "#FCEFEF",
                color: selectedNGO.compliance === "Compliant" ? "#2E7D32" : "var(--accent-coral)",
                fontSize: "0.85rem",
                fontWeight: 700
              }}>
                <Shield size={16} />
                <span>Audited Rating: {selectedNGO.compliance} (Compliance verified on last inspection)</span>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSelectedNGO(null)}>
                  Close Audit Dossier
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default NGOMonitoring;
