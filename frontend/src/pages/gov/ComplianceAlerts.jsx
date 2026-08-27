import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { ShieldAlert, AlertTriangle, AlertCircle, Calendar, CheckSquare } from "lucide-react";

const ComplianceAlerts = () => {
  const { complianceAlerts } = useApp();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case "Critical": return { borderLeft: "5px solid #C0392B", bg: "#FDEDEC", color: "#C0392B" };
      case "High": return { borderLeft: "5px solid var(--accent-coral)", bg: "var(--accent-coral-light)", color: "var(--accent-coral)" };
      case "Medium": return { borderLeft: "5px solid var(--accent-amber)", bg: "#FFF8EE", color: "var(--accent-amber)" };
      default: return { borderLeft: "5px solid var(--primary-color)", bg: "var(--secondary-light)", color: "var(--primary-color)" };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Header Info */}
      <div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
          Shelter Compliance & capacity Audits
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
          Monitor live warning flags, census overload capacities, and regulatory documentation checks across active welfare groups.
        </p>
      </div>

      {isLoading ? (
        // Skeleton loader
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="skeleton" style={{ height: "100px", borderRadius: "14px" }} />
          ))}
        </div>
      ) : (
        /* Alerts List */
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }} className="animate-fade-in">
          {complianceAlerts.length === 0 ? (
            <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              <CheckSquare size={36} color="var(--primary-color)" style={{ margin: "0 auto 12px" }} />
              <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700 }}>All welfare hubs are currently fully compliant. No active alerts.</p>
            </div>
          ) : (
            complianceAlerts.map((alert) => {
              const styles = getSeverityStyle(alert.severity);
              return (
                <div
                  key={alert.id}
                  className="card animate-slide-up"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px 24px",
                    borderLeft: styles.borderLeft,
                    backgroundColor: styles.bg
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: "white",
                      color: styles.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "2px"
                    }}>
                      {alert.severity === "Critical" || alert.severity === "High" ? (
                        <AlertCircle size={20} />
                      ) : (
                        <AlertTriangle size={20} />
                      )}
                    </div>

                    <div>
                      <strong style={{ fontSize: "1.05rem", color: "var(--text-main)" }}>{alert.ngoName}</strong>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "monospace", marginLeft: "8px" }}>{alert.id}</span>
                      <span className="badge" style={{ marginLeft: "8px", fontSize: "0.62rem", padding: "2px 8px", backgroundColor: "white", color: styles.color, border: `1px solid ${styles.color}` }}>
                        {alert.type}
                      </span>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "4px 0 0", lineHeight: 1.4 }}>
                        {alert.message}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 800, color: styles.color, textTransform: "uppercase", display: "block" }}>
                      {alert.severity} Severity
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end", marginTop: "4px" }}>
                      <Calendar size={12} /> {alert.date}
                    </span>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
};

export default ComplianceAlerts;
