import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { ClipboardList, Clock, CheckCircle, XCircle, Heart } from "lucide-react";

const MyApplicationsTracker = () => {
  const { adoptions } = useApp();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const getFriendlyStatus = (status) => {
    switch (status) {
      case "Applications Received": return { label: "Pending Review", color: "var(--text-muted)", class: "shelter" };
      case "Interview Scheduled": return { label: "Interview Scheduled", color: "var(--accent-amber)", class: "lost" };
      case "Home Audit Approved": return { label: "Home Inspection Approved", color: "#3498DB", class: "adopted" };
      case "Approved": return { label: "Approved & Ready for Pickup", color: "#27AE60", class: "adopted" };
      case "Rejected": return { label: "Application Rejected", color: "var(--accent-coral)", class: "rescued" };
      default: return { label: "In Process", color: "var(--text-muted)", class: "shelter" };
    }
  };

  const getProgressPct = (status) => {
    switch (status) {
      case "Applications Received": return 25;
      case "Interview Scheduled": return 50;
      case "Home Audit Approved": return 75;
      case "Approved": return 100;
      case "Rejected": return 100;
      default: return 10;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Header Info */}
      <div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
          My Adoption Applications
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
          Monitor the live verification status of your pet adoption filings and interview appointments.
        </p>
      </div>

      {isLoading ? (
        // Skeleton loader
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="skeleton" style={{ height: "140px", borderRadius: "20px" }} />
          ))}
        </div>
      ) : (
        /* Applications List */
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }} className="animate-fade-in">
          {adoptions.length === 0 ? (
            <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              <Heart size={36} color="var(--accent-amber)" style={{ margin: "0 auto 12px" }} />
              <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700 }}>You haven't submitted any adoption applications yet.</p>
            </div>
          ) : (
            adoptions.map((app) => {
              const friendly = getFriendlyStatus(app.status);
              const progress = getProgressPct(app.status);
              const isRejected = app.status === "Rejected";

              return (
                <div
                  key={app.id}
                  className="card animate-slide-up"
                  style={{
                    padding: "24px 28px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    borderLeft: `5px solid ${isRejected ? "var(--accent-coral)" : "var(--accent-amber)"}`
                  }}
                >
                  {/* Title row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                        Application for {app.petName || "Desi Stray"}
                      </h3>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "monospace", display: "block", marginTop: "2px" }}>
                        Application ID: {app.id} • Submitted: {app.date}
                      </span>
                    </div>

                    <span className={`badge badge-${friendly.class}`} style={{ fontSize: "0.7rem", padding: "4px 10px" }}>
                      {friendly.label}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700, marginBottom: "6px" }}>
                      <span>Verification Pipeline Stage</span>
                      <span>{progress}%</span>
                    </div>
                    <div style={{ height: "6px", backgroundColor: "#FCFAF6", borderRadius: "3px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                      <div style={{ 
                        width: `${progress}%`, 
                        height: "100%", 
                        backgroundColor: isRejected ? "var(--accent-coral)" : "var(--accent-amber)", 
                        transition: "width 0.4s ease" 
                      }} />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", fontSize: "0.78rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                    <span>Adopter: <strong>{app.applicantName}</strong></span>
                    <span>•</span>
                    <span>City Node: <strong>{app.location || "Pune City"}</strong></span>
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

export default MyApplicationsTracker;
