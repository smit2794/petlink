import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { Calendar, Clock, Eye, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ParentAppointments = () => {
  const { vetAppointments } = useApp();
  const [filterStatus, setFilterStatus] = useState("Upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const filteredAppointments = vetAppointments.filter((apt) => {
    if (filterStatus === "Upcoming") return apt.status === "Upcoming";
    if (filterStatus === "Completed") return apt.status === "Completed";
    return true; // "All"
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Header Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
            Scheduled Vet Visits
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
            Review upcoming clinic checkups, booster schedules, and diagnostic reviews booked by your veterinarian.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: "8px",
        borderBottom: "1px solid var(--border-color)",
        paddingBottom: "10px"
      }}>
        {["Upcoming", "Completed", "All"].map((tab) => {
          const isSelected = filterStatus === tab;
          return (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              style={{
                border: 0,
                backgroundColor: isSelected ? "var(--accent-amber-light)" : "transparent",
                color: isSelected ? "var(--accent-amber)" : "var(--text-muted)",
                fontSize: "0.85rem",
                fontWeight: 700,
                padding: "8px 18px",
                borderRadius: "30px",
                cursor: "pointer",
                border: isSelected ? "1px solid var(--accent-amber)" : "1px solid transparent",
                transition: "all var(--transition-fast)"
              }}
            >
              {tab} Appointments
            </button>
          );
        })}
      </div>

      {isLoading ? (
        // Skeleton loader
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="skeleton" style={{ height: "80px", borderRadius: "16px" }} />
          ))}
        </div>
      ) : (
        /* Date Grouped Appointments List */
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredAppointments.length === 0 ? (
            <div className="card" style={{ padding: "60px 24px", textAlign: "center" }}>
              <div className="empty-state-icon" style={{ backgroundColor: "var(--accent-amber-light)", color: "var(--accent-amber)", margin: "0 auto 12px" }}>
                <Calendar size={28} />
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No vet appointments scheduled under this category.</p>
            </div>
          ) : (
            filteredAppointments.map((apt) => {
              const isCompleted = apt.status === "Completed";
              return (
                <div
                  key={apt.id}
                  className="card animate-slide-up"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px 24px",
                    borderLeft: isCompleted ? "5px solid var(--secondary-color)" : "5px solid var(--accent-amber)",
                    backgroundColor: "#FFFFFF",
                    flexWrap: "wrap",
                    gap: "20px"
                  }}
                >
                  {/* Left Block: Pet Details */}
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: "260px" }}>
                    <img
                      src={apt.petPhoto}
                      alt={apt.petName}
                      style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border-color)" }}
                    />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                        <strong style={{ fontSize: "1.05rem", color: "var(--text-main)" }}>{apt.petName}</strong>
                        <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "var(--text-muted)" }}>{apt.petId}</span>
                      </div>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500, marginTop: "2px" }}>
                        Reason: {apt.reason}
                      </span>
                    </div>
                  </div>

                  {/* Center Block: Date */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
                    <Clock size={16} color="var(--text-muted)" />
                    <span style={{ fontWeight: 700 }}>{apt.date}</span>
                    {isCompleted ? (
                      <span className="badge badge-adopted" style={{ fontSize: "0.68rem" }}>Completed</span>
                    ) : (
                      <span className="badge badge-treatment" style={{ backgroundColor: "var(--accent-amber-light)", color: "var(--accent-amber)", fontSize: "0.68rem" }}>
                        Upcoming
                      </span>
                    )}
                  </div>

                  {/* Right Block: Shortcut Actions */}
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ display: "flex", alignItems: "center", gap: "4px" }}
                    onClick={() => navigate(`/parent/pet/${apt.petId}`)}
                  >
                    <Eye size={12} /> View Pet File
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
};

export default ParentAppointments;
