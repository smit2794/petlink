import React, { useState, useEffect } from "react";
import { Compass, Filter, ShieldAlert, Award, AlertCircle } from "lucide-react";

const DiseaseHeatmaps = () => {
  const [diseaseType, setDiseaseType] = useState("All");
  const [timeRange, setTimeRange] = useState("90");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const heatmapPoints = [
    { id: 1, name: "Kothrud Depot", condition: "Mange", count: 18, lat: 25, lng: 45, level: "High" },
    { id: 2, name: "Swargate Terminus", condition: "Mange", count: 32, lat: 45, lng: 70, level: "Severe" },
    { id: 3, name: "Hadapsar Bypass", condition: "Fracture", count: 12, lat: 75, lng: 55, level: "Moderate" },
    { id: 4, name: "Deccan Chowk", condition: "Wing Trauma", count: 24, lat: 30, lng: 35, level: "High" },
    { id: 5, name: "Kalyani Nagar Flat blocks", condition: "Parvovirus", count: 8, lat: 60, lng: 30, level: "Low" }
  ];

  const filteredPoints = heatmapPoints.filter((point) => {
    return diseaseType === "All" || point.condition === diseaseType;
  });

  const getHeatColor = (level) => {
    switch (level) {
      case "Severe": return "rgba(217, 83, 79, 0.8)";
      case "High": return "rgba(230, 126, 34, 0.8)";
      case "Moderate": return "rgba(241, 196, 15, 0.8)";
      default: return "rgba(46, 204, 113, 0.8)";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Header Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
            Municipal Disease Heatmaps
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
            Visualize concentration levels of zoonotic threats, canine mange outbreaks, and avian wing trauma report pins.
          </p>
        </div>
      </div>

      {/* Outbreak warning alert */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "16px 24px",
        backgroundColor: "rgba(217, 83, 79, 0.08)",
        color: "var(--accent-coral)",
        borderRadius: "14px",
        border: "1px solid rgba(217, 83, 79, 0.15)",
        fontSize: "0.9rem",
        fontWeight: 700
      }}>
        <ShieldAlert size={20} />
        <span>CONTAGION WARNING: High canine Parvovirus counts identified near Swargate (Zone 1). Primary immunization checks recommended.</span>
      </div>

      {/* Filter and selector row */}
      <div className="card" style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center", padding: "20px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Filter size={14} color="var(--text-muted)" />
          <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Condition Type:</span>
          <select
            className="form-control"
            style={{ padding: "8px 16px", fontSize: "0.85rem", borderRadius: "30px" }}
            value={diseaseType}
            onChange={(e) => setDiseaseType(e.target.value)}
          >
            <option value="All">All Conditions</option>
            <option value="Mange">Canine Mange</option>
            <option value="Fracture">Trauma Fractures</option>
            <option value="Wing Trauma">Avian Wing Cuts</option>
            <option value="Parvovirus">Parvovirus Outbreaks</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Time Range:</span>
          <select
            className="form-control"
            style={{ padding: "8px 16px", fontSize: "0.85rem", borderRadius: "30px" }}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Past Year</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        // Skeleton loader
        <div className="skeleton" style={{ height: "450px", borderRadius: "20px" }} />
      ) : (
        /* Heatmap Grid & Canvas */
        <div style={{ display: "grid", gridTemplateColumns: "1.80fr 1.20fr", gap: "28px" }} className="animal-profile-grid">
          
          {/* Map canvas */}
          <div className="card" style={{
            height: "450px",
            backgroundColor: "#FAF8F2",
            border: "1px solid var(--border-color)",
            borderRadius: "20px",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Draw styled SVG map grid */}
            <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
              <path d="M 20 80 Q 200 120 400 60 T 600 240" fill="none" stroke="#E6DDD4" strokeWidth="24" strokeLinecap="round" />
              <path d="M 120 20 L 150 400" fill="none" stroke="#E6DDD4" strokeWidth="18" strokeLinecap="round" />
              <path d="M 450 10 L 400 420" fill="none" stroke="#E6DDD4" strokeWidth="18" strokeLinecap="round" />
            </svg>

            {/* Outbreak Heat points */}
            {filteredPoints.map((point) => {
              const radiusSize = 25 + point.count * 1.5;
              const heatColor = getHeatColor(point.level);
              return (
                <div
                  key={point.id}
                  style={{
                    position: "absolute",
                    left: `${point.lat}%`,
                    top: `${point.lng}%`,
                    transform: "translate(-50%, -50%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                  }}
                >
                  {/* Heat circle */}
                  <div style={{
                    width: `${radiusSize}px`,
                    height: `${radiusSize}px`,
                    borderRadius: "50%",
                    backgroundColor: heatColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    boxShadow: "0 0 16px rgba(217, 83, 79, 0.2)",
                    border: "1px solid rgba(255,255,255,0.4)"
                  }}>
                    {point.count}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legends Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="card" style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800 }}>Heat Intensity Indicators</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.85rem" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "rgba(217, 83, 79, 0.8)", border: "1px solid white" }} />
                  <span><strong>Severe Outbreak Outlier:</strong> 30+ logs</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.85rem" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "rgba(230, 126, 34, 0.8)", border: "1px solid white" }} />
                  <span><strong>High Density Cluster:</strong> 15–29 logs</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.85rem" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "rgba(241, 196, 15, 0.8)", border: "1px solid white" }} />
                  <span><strong>Moderate Spreads:</strong> 10–14 logs</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.85rem" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "rgba(46, 204, 113, 0.8)", border: "1px solid white" }} />
                  <span><strong>Low / Sporadic Spread:</strong> &lt; 10 logs</span>
                </div>
              </div>
            </div>

            {/* Audit details box */}
            <div className="card" style={{ padding: "20px 24px", display: "flex", gap: "10px" }}>
              <AlertCircle size={18} color="var(--accent-gov)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                <strong>Zoonotics Compliance:</strong> All logs automatically update from municipal veterinarian clinic logs inside the Event Engine.
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default DiseaseHeatmaps;
