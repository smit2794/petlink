import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { Info } from "lucide-react";

const AnalyticsOverview = () => {
  const { animals } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [showYoY, setShowYoY] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Compute metrics from shared animals store
  const totalAnimals = animals.length;
  const vaccinatedCount = animals.filter(p => p.healthSummary?.vaccinationStatus === "Fully Vaccinated").length;
  const sterilizedCount = animals.filter(p => p.healthSummary?.sterilizationStatus === "Sterilized").length;
  
  const vaxPercentage = totalAnimals > 0 ? Math.round((vaccinatedCount / totalAnimals) * 100) : 0;
  const sterilPercentage = totalAnimals > 0 ? Math.round((sterilizedCount / totalAnimals) * 100) : 0;

  // Status Distribution aggregate counts
  const statusCounts = animals.reduce((acc, pet) => {
    acc[pet.status] = (acc[pet.status] || 0) + 1;
    return acc;
  }, {});

  const statusDistribution = [
    { label: "Adopted / In Homes", count: statusCounts["Adopted"] || 0, color: "#F5C647" },
    { label: "Available for Adoption", count: statusCounts["Available for Adoption"] || 0, color: "#2E6F56" },
    { label: "Under Treatment", count: statusCounts["Under Treatment"] || 0, color: "#E05D5D" },
    { label: "In Shelter", count: statusCounts["In Shelter"] || 0, color: "#5C6B73" },
    { label: "Rescued (Pending Care)", count: statusCounts["Rescued"] || 0, color: "#D9534F" },
    { label: "Missing / Lost Alert", count: statusCounts["Lost"] || 0, color: "#C0392B" }
  ];

  const maxStatusCount = Math.max(...statusDistribution.map(d => d.count), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Header Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
            Municipal Welfare Analytics Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
            Real-time aggregate compliance monitoring, regional vaccination checkmarks, and shelter census trackers.
          </p>
        </div>
      </div>

      {isLoading ? (
        // Skeleton loader page
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px" }}>
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="skeleton" style={{ height: "100px", borderRadius: "16px" }} />
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div className="skeleton" style={{ height: "300px", borderRadius: "20px" }} />
            <div className="skeleton" style={{ height: "300px", borderRadius: "20px" }} />
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }} className="animate-fade-in">
          
          {/* KPI Dashboard Row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "20px"
          }}>
            {/* KPI 1 */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "18px 20px", borderLeft: "4px solid #5C6B73" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Registered Census</span>
              <strong style={{ fontSize: "1.8rem", color: "var(--text-main)" }}>{totalAnimals}</strong>
              <span style={{ fontSize: "0.7rem", color: "#27AE60", fontWeight: 700 }}>+12% vs last month</span>
            </div>
            
            {/* KPI 2 */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "18px 20px", borderLeft: "4px solid #27AE60" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Vaccine Coverage</span>
              <strong style={{ fontSize: "1.8rem", color: "var(--text-main)" }}>{vaxPercentage}%</strong>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600 }}>{vaccinatedCount} animals protected</span>
            </div>

            {/* KPI 3 */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "18px 20px", borderLeft: "4px solid #2980B9" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Sterilization rate</span>
              <strong style={{ fontSize: "1.8rem", color: "var(--text-main)" }}>{sterilPercentage}%</strong>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600 }}>{sterilizedCount} spayed/neutered</span>
            </div>

            {/* KPI 4 */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "18px 20px", borderLeft: "4px solid #E67E22" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Onboarded NGOs</span>
              <strong style={{ fontSize: "1.8rem", color: "var(--text-main)" }}>12</strong>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600 }}>Active ward coverage</span>
            </div>

            {/* KPI 5: Resolution Speed Meter */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "18px 20px", borderLeft: "4px solid #9B59B6" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Dispatch Speed</span>
              <strong style={{ fontSize: "1.8rem", color: "var(--text-main)" }}>2.4 Hrs</strong>
              <span style={{ fontSize: "0.7rem", color: "#27AE60", fontWeight: 700 }}>Avg Rescue Resolution</span>
            </div>

            {/* KPI 6 */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "18px 20px", borderLeft: "4px solid #E67E22" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Municipal Funding</span>
              <strong style={{ fontSize: "1.8rem", color: "var(--text-main)" }}>₹18.5 L</strong>
              <span style={{ fontSize: "0.7rem", color: "#27AE60", fontWeight: 700 }}>98% disbursed this fiscal</span>
            </div>
          </div>

          {/* Aggregate Chart Summary Row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "28px"
          }} className="animal-profile-grid">
                       {/* Left Box: Monthly Rescue/Intake Trend */}
            <div className="card" style={{ padding: "24px 32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Welfare Operations Trend (Monthly)</h3>
                
                {/* YoY comparison toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input
                    type="checkbox"
                    id="yoy-toggle"
                    checked={showYoY}
                    onChange={(e) => setShowYoY(e.target.checked)}
                    style={{ cursor: "pointer" }}
                  />
                  <label htmlFor="yoy-toggle" style={{ fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", color: "var(--text-muted)" }}>
                    Compare YoY (2025)
                  </label>
                </div>
              </div>
              
              {/* CSS Graph */}
              <div style={{
                height: "220px",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                padding: "10px 0 20px 20px",
                borderLeft: "2px solid var(--border-color)",
                borderBottom: "2px solid var(--border-color)",
                position: "relative"
              }}>
                {/* Horizontal guide grids */}
                <div style={{ position: "absolute", left: 0, right: 0, top: "25%", borderBottom: "1px dashed rgba(0,0,0,0.04)" }} />
                <div style={{ position: "absolute", left: 0, right: 0, top: "50%", borderBottom: "1px dashed rgba(0,0,0,0.04)" }} />
                <div style={{ position: "absolute", left: 0, right: 0, top: "75%", borderBottom: "1px dashed rgba(0,0,0,0.04)" }} />
 
                {/* Bars */}
                {[
                  { month: "Feb", rescues: 35, rescuesPrev: 28, adoptions: 20 },
                  { month: "Mar", rescues: 48, rescuesPrev: 36, adoptions: 28 },
                  { month: "Apr", rescues: 42, rescuesPrev: 39, adoptions: 34 },
                  { month: "May", rescues: 64, rescuesPrev: 50, adoptions: 40 },
                  { month: "Jun", rescues: 75, rescuesPrev: 58, adoptions: 48 },
                  { month: "Jul", rescues: totalAnimals * 6, rescuesPrev: 45, adoptions: animals.filter(p => p.status === "Adopted").length * 8 }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    width: showYoY ? "14%" : "12%",
                    zIndex: 2
                  }}>
                    {/* Double or Triple bars */}
                    <div style={{ display: "flex", gap: "4px", width: "100%", height: "130px", alignItems: "flex-end", justifyContent: "center" }}>
                      <div style={{
                        height: `${Math.min(100, (item.rescues / 80) * 100)}%`,
                        backgroundColor: "#5C6B73",
                        width: "8px",
                        borderRadius: "3px 3px 0 0",
                        position: "relative"
                      }} className="chart-bar-hover">
                        <span className="tooltip-chart">Rescues: {item.rescues}</span>
                      </div>

                      {showYoY && (
                        <div style={{
                          height: `${Math.min(100, (item.rescuesPrev / 80) * 100)}%`,
                          backgroundColor: "#BDC3C7",
                          width: "8px",
                          borderRadius: "3px 3px 0 0",
                          position: "relative"
                        }} className="chart-bar-hover">
                          <span className="tooltip-chart">Rescues 2025: {item.rescuesPrev}</span>
                        </div>
                      )}

                      <div style={{
                        height: `${Math.min(100, (item.adoptions / 80) * 100)}%`,
                        backgroundColor: "#F5C647",
                        width: "8px",
                        borderRadius: "3px 3px 0 0",
                        position: "relative"
                      }} className="chart-bar-hover">
                        <span className="tooltip-chart">Adoptions: {item.adoptions}</span>
                      </div>
                    </div>
 
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)" }}>{item.month}</span>
                  </div>
                ))}
              </div>
 
              {/* Legends */}
              <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap", marginTop: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#5C6B73" }} />
                  <span>Stray Rescues (2026)</span>
                </div>
                {showYoY && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#BDC3C7" }} />
                    <span>Stray Rescues (2025 YoY)</span>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#F5C647" }} />
                  <span>Approved Adoptions (2026)</span>
                </div>
              </div>
            </div>

            {/* Right Box: Status Distribution Donut */}
            <div className="card" style={{ padding: "24px 32px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "20px" }}>Welfare Status Distribution</h3>
              
              {/* Distribution bars */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {statusDistribution.map((item, idx) => {
                  const barWidth = Math.max(5, Math.round((item.count / maxStatusCount) * 100));
                  return (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700 }}>
                        <span style={{ color: "var(--text-muted)" }}>{item.label}</span>
                        <span>{item.count} ({Math.round((item.count / (totalAnimals || 1)) * 100)}%)</span>
                      </div>
                      
                      {/* Bar indicator */}
                      <div style={{ width: "100%", height: "8px", backgroundColor: "#F0EFEA", borderRadius: "10px", overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: `${barWidth}%`,
                          backgroundColor: item.color,
                          borderRadius: "10px"
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Interactive Compliance info bar */}
          <div className="card" style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 20px",
            backgroundColor: "rgba(92, 107, 115, 0.08)",
            color: "#5C6B73",
            borderRadius: "14px",
            border: "1px solid rgba(92, 107, 115, 0.15)",
            fontSize: "0.85rem",
            fontWeight: 600
          }}>
            <Info size={16} />
            <span>Power BI Analytics Console: The registry is read-only. All calculations represent audit aggregates. Individual records cannot be modified here.</span>
          </div>

        </div>
      )}

      {/* Styled chart tooltips */}
      <style>{`
        .chart-bar-hover:hover .tooltip-chart {
          display: block !important;
        }
        .tooltip-chart {
          display: none;
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          background-color: var(--primary-color);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 800;
          white-space: nowrap;
          box-shadow: var(--shadow-sm);
        }
      `}</style>

    </div>
  );
};

export default AnalyticsOverview;
