import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend 
} from "recharts";
import { 
  FileText, Download, Loader2, CheckCircle, 
  TrendingUp, Users, Heart 
} from "lucide-react";

// Mock data for Recharts
const rescuesOverTime = [
  { month: "Jan", Rescues: 18 },
  { month: "Feb", Rescues: 24 },
  { month: "Mar", Rescues: 22 },
  { month: "Apr", Rescues: 35 },
  { month: "May", Rescues: 30 },
  { month: "Jun", Rescues: 45 },
  { month: "Jul", Rescues: 52 }
];

const adoptionRate = [
  { month: "Jan", Adoptions: 8 },
  { month: "Feb", Adoptions: 12 },
  { month: "Mar", Adoptions: 10 },
  { month: "Apr", Adoptions: 15 },
  { month: "May", Adoptions: 14 },
  { month: "Jun", Adoptions: 22 },
  { month: "Jul", Adoptions: 26 }
];

const vaccinationCoverage = [
  { name: "Fully Vaccinated", value: 65, color: "#1E4A38" },  // Forest Green
  { name: "Pending Dosage", value: 20, color: "#F5C647" },    // Amber
  { name: "Not Vaccinated", value: 15, color: "#E05D5D" }     // Coral
];

const ReportsMgmt = () => {
  const { addToast } = useApp();
  const [isLoading, setIsLoading] = useState(true);

  // States for simulated downloads
  const [govStatus, setGovStatus] = useState("idle"); // "idle" | "loading" | "ready"
  const [csrStatus, setCsrStatus] = useState("idle");
  const [internalStatus, setInternalStatus] = useState("idle");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Simulator handler
  const handleGenerate = (type, setStatus) => {
    setStatus("loading");
    addToast(`Compiling data for ${type} report...`, "info");
    setTimeout(() => {
      setStatus("ready");
      addToast(`${type} report compiled and ready for download!`, "success");
    }, 1500);
  };

  const handleDownload = (type, setStatus) => {
    addToast(`Downloading ${type}_Report.pdf...`, "success");
    setStatus("idle");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-main)" }}>
          Analytical Audits & Regulatory Reports
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Export local animal welfare summaries for government compliance, audit funding allocations, and evaluate metrics.
        </p>
      </div>

      {isLoading ? (
        /* SKELETON SCREEN */
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="skeleton" style={{ height: "140px", borderRadius: "var(--radius-lg)" }} />
            ))}
          </div>
          <div className="skeleton" style={{ height: "350px", borderRadius: "var(--radius-lg)" }} />
        </>
      ) : (
        /* MAIN REPORTS SCREEN */
        <>
          {/* Section 1: 3 Export Card Components */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px"
          }}>
            {/* Card 1: Govt Compliance */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "rgba(92, 107, 115, 0.1)", color: "var(--accent-blue-gray)", display: "flex", alignItems: "center", justify: "center", justifyContent: "center" }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800 }}>Municipal compliance Report</h3>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Rabies coverage & census</span>
                </div>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.4, flexGrow: 1 }}>
                Pre-formatted dataset compiling municipal street captures, microchip IDs, and local veterinary clinic vaccinations for submission.
              </p>
              
              {govStatus === "idle" && (
                <button className="btn btn-outline btn-sm" onClick={() => handleGenerate("Municipal", setGovStatus)}>
                  Compile Report
                </button>
              )}
              {govStatus === "loading" && (
                <button className="btn btn-outline btn-sm" disabled style={{ opacity: 0.7, gap: "6px" }}>
                  <Loader2 size={14} className="animate-spin" style={{ animation: "pulse 1s infinite" }} /> Generating...
                </button>
              )}
              {govStatus === "ready" && (
                <button className="btn btn-primary btn-sm" style={{ backgroundColor: "#27AE60", borderColor: "#27AE60" }} onClick={() => handleDownload("Municipal", setGovStatus)}>
                  <Download size={14} /> Download PDF
                </button>
              )}
            </div>

            {/* Card 2: CSR Sponsorship */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "rgba(46, 111, 86, 0.1)", color: "var(--secondary-color)", display: "flex", alignItems: "center", justify: "center", justifyContent: "center" }}>
                  <Heart size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800 }}>CSR / Funding Audit Sheet</h3>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Patron fund allocation logs</span>
                </div>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.4, flexGrow: 1 }}>
                Comprehensive financial audits detailing donation allocations matching 80G filings, medicine logs, and facility cost assessments.
              </p>
              
              {csrStatus === "idle" && (
                <button className="btn btn-outline btn-sm" onClick={() => handleGenerate("CSR_Audit", setCsrStatus)}>
                  Compile Audit Sheet
                </button>
              )}
              {csrStatus === "loading" && (
                <button className="btn btn-outline btn-sm" disabled style={{ opacity: 0.7, gap: "6px" }}>
                  <Loader2 size={14} className="animate-spin" style={{ animation: "pulse 1s infinite" }} /> Generating...
                </button>
              )}
              {csrStatus === "ready" && (
                <button className="btn btn-primary btn-sm" style={{ backgroundColor: "#27AE60", borderColor: "#27AE60" }} onClick={() => handleDownload("CSR_Audit", setCsrStatus)}>
                  <Download size={14} /> Download Excel
                </button>
              )}
            </div>

            {/* Card 3: Internal Analytics */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "rgba(224, 93, 93, 0.1)", color: "var(--accent-coral)", display: "flex", alignItems: "center", justify: "center", justifyContent: "center" }}>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800 }}>Internal Operations Log</h3>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Response times & volunteer tasks</span>
                </div>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.4, flexGrow: 1 }}>
                Internal analysis of rescue dispatch speeds, active volunteer task cycles, and cage occupancy turnover indices.
              </p>
              
              {internalStatus === "idle" && (
                <button className="btn btn-outline btn-sm" onClick={() => handleGenerate("Internal_Operations", setInternalStatus)}>
                  Compile Log
                </button>
              )}
              {internalStatus === "loading" && (
                <button className="btn btn-outline btn-sm" disabled style={{ opacity: 0.7, gap: "6px" }}>
                  <Loader2 size={14} className="animate-spin" style={{ animation: "pulse 1s infinite" }} /> Generating...
                </button>
              )}
              {internalStatus === "ready" && (
                <button className="btn btn-primary btn-sm" style={{ backgroundColor: "#27AE60", borderColor: "#27AE60" }} onClick={() => handleDownload("Internal_Operations", setInternalStatus)}>
                  <Download size={14} /> Download PDF
                </button>
              )}
            </div>
          </div>

          {/* Section 2: Charts Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px", marginTop: "12px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Statistical Analytics Visualizations</h2>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: "28px"
            }} className="charts-split-grid">
              
              {/* Left Chart: Line Chart (Rescues over time) */}
              <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 800 }}>Monthly Rescue Influx (2026)</h3>
                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer>
                    <LineChart data={rescuesOverTime} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ECE8E0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
                      <YAxis tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="Rescues" 
                        stroke="var(--secondary-color)" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: "var(--primary-color)" }} 
                        activeDot={{ r: 6 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right Chart: Donut Chart (Vaccination coverage) */}
              <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 800 }}>Immunization Coverage Index</h3>
                <div style={{ width: "100%", height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={vaccinationCoverage}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {vaccinationCoverage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        iconSize={10}
                        wrapperStyle={{ fontSize: "0.75rem", fontWeight: 600 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Bottom Wide Chart: Bar Chart (Adoption rates) */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800 }}>Successful Rehoming Adoptions</h3>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={adoptionRate} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ECE8E0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
                    <YAxis tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
                    <Tooltip />
                    <Bar dataKey="Adoptions" fill="var(--secondary-color)" radius={[4, 4, 0, 0]}>
                      {adoptionRate.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="var(--primary-color)" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </>
      )}

      {/* Extra responsiveness */}
      <style>{`
        @media (max-width: 768px) {
          .charts-split-grid {
            gridTemplateColumns: 1fr !important;
          }
        }
      `}</style>
      
    </div>
  );
};

export default ReportsMgmt;
