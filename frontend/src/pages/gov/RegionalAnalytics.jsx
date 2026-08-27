import React, { useState, useEffect } from "react";
import { Compass, Filter, ShieldAlert, Users, Calendar, AlertTriangle } from "lucide-react";

const RegionalAnalytics = () => {
  const [selectedWard, setSelectedWard] = useState("Kothrud");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const wardStats = {
    Kothrud: { vaxCoverage: "92%", sterilCoverage: "88%", activeRescues: 14, operatingNGOs: 3, complaintVolume: 24, score: 94 },
    Hadapsar: { vaxCoverage: "78%", sterilCoverage: "72%", activeRescues: 22, operatingNGOs: 2, complaintVolume: 42, score: 76 },
    Swargate: { vaxCoverage: "65%", sterilCoverage: "58%", activeRescues: 18, operatingNGOs: 1, complaintVolume: 35, score: 62 },
    Deccan: { vaxCoverage: "95%", sterilCoverage: "92%", activeRescues: 8, operatingNGOs: 4, complaintVolume: 12, score: 96 },
    Aundh: { vaxCoverage: "88%", sterilCoverage: "82%", activeRescues: 11, operatingNGOs: 2, complaintVolume: 19, score: 85 }
  };

  const wardComparisons = [
    { name: "Kothrud", complaints: 24, rescues: 14, score: 94 },
    { name: "Hadapsar", complaints: 42, rescues: 22, score: 76 },
    { name: "Swargate", complaints: 35, rescues: 18, score: 62 },
    { name: "Deccan", complaints: 12, rescues: 8, score: 96 },
    { name: "Aundh", complaints: 19, rescues: 11, score: 85 }
  ];

  const currentStats = wardStats[selectedWard] || wardStats["Kothrud"];
  const maxComparisonVal = Math.max(...wardComparisons.map(w => w.complaints + w.rescues), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Header Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
            Ward-Level Comparative Analytics
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
            Audit localized municipal animal statistics, cross-reference vaccination progress, and allocate resource budgets.
          </p>
        </div>
      </div>

      {isLoading ? (
        // Skeleton loader
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="skeleton" style={{ height: "60px", borderRadius: "12px" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div className="skeleton" style={{ height: "240px", borderRadius: "20px" }} />
            <div className="skeleton" style={{ height: "240px", borderRadius: "20px" }} />
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }} className="animate-fade-in">
          
          {/* Ward Audit Selector */}
          <div className="card" style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center", padding: "20px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Compass size={18} color="var(--accent-gov)" />
              <span style={{ fontWeight: 800 }}>Select Audit Target Ward Node:</span>
            </div>
            
            <select
              className="form-control"
              style={{ width: "240px", borderRadius: "30px", padding: "8px 16px" }}
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
            >
              <option value="Kothrud">Kothrud Ward (Zone 3)</option>
              <option value="Hadapsar">Hadapsar Ward (Zone 5)</option>
              <option value="Swargate">Swargate Ward (Zone 1)</option>
              <option value="Deccan">Deccan Gymkhana Ward (Zone 2)</option>
              <option value="Aundh">Aundh Ward (Zone 4)</option>
            </select>
          </div>

          {/* Grid display stats & charts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }} className="animal-profile-grid">
            
            {/* Left Column: Stats Box for target Ward */}
            <div className="card" style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>{selectedWard} Ward KPI Breakdown</h3>
                <span className="badge badge-adopted" style={{ fontSize: "0.68rem" }}>Compliance score: {currentStats.score}%</span>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ padding: "12px", border: "1px solid var(--border-color)", borderRadius: "10px" }}>
                  <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>Vaccination Coverage</span>
                  <strong style={{ fontSize: "1.1rem", color: "var(--primary-color)" }}>{currentStats.vaxCoverage}</strong>
                </div>
                <div style={{ padding: "12px", border: "1px solid var(--border-color)", borderRadius: "10px" }}>
                  <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>Sterilization Coverage</span>
                  <strong style={{ fontSize: "1.1rem", color: "var(--primary-color)" }}>{currentStats.sterilCoverage}</strong>
                </div>
                <div style={{ padding: "12px", border: "1px solid var(--border-color)", borderRadius: "10px" }}>
                  <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>Active Stray Rescues</span>
                  <strong style={{ fontSize: "1.1rem", color: "var(--text-main)" }}>{currentStats.activeRescues} cases</strong>
                </div>
                <div style={{ padding: "12px", border: "1px solid var(--border-color)", borderRadius: "10px" }}>
                  <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>Citizen Complaints (MoM)</span>
                  <strong style={{ fontSize: "1.1rem", color: "var(--text-main)" }}>{currentStats.complaintVolume} logs</strong>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                <Users size={14} />
                <span>Operating NGOs in ward: <strong>{currentStats.operatingNGOs} nodes</strong></span>
              </div>
            </div>

            {/* Right Column: Comparative Chart Across Wards */}
            <div className="card" style={{ padding: "24px 32px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "20px" }}>Total Ward Cases Comparison</h3>
              
              {/* CSS Bar Chart */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {wardComparisons.map((item, idx) => {
                  const combinedVal = item.complaints + item.rescues;
                  const barWidth = Math.max(5, Math.round((combinedVal / maxComparisonVal) * 100));
                  return (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ width: "80px", fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)" }}>{item.name}</span>
                      
                      {/* Bar indicator wrapper */}
                      <div style={{ flex: 1, height: "14px", backgroundColor: "#F0EFEA", borderRadius: "10px", overflow: "hidden", position: "relative" }}>
                        <div style={{
                          height: "100%",
                          width: `${barWidth}%`,
                          background: "linear-gradient(90deg, #5C6B73, #95A3B3)",
                          borderRadius: "10px"
                        }} />
                      </div>

                      <span style={{ width: "50px", textAlign: "right", fontSize: "0.82rem", fontWeight: 700 }}>{combinedVal} cases</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default RegionalAnalytics;
