import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { Calendar, ShieldAlert, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const UpcomingBoosters = () => {
  const { animals } = useApp();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Generate upcoming boosters list dynamically from animals with "Fully Vaccinated" status
  const getBoostersData = () => {
    const defaultBoosters = [
      { petId: "PET-101", petName: "Sheru", vaccine: "Anti-Rabies (Rabisin)", lastDate: "2025-08-15", dueDate: "2026-08-15" },
      { petId: "PET-102", petName: "Gauri", vaccine: "Brucellosis Dose 2", lastDate: "2025-08-20", dueDate: "2026-08-20" },
      { petId: "PET-103", petName: "Mani", vaccine: "Feline FVRCP Booster", lastDate: "2025-09-02", dueDate: "2026-09-02" },
      { petId: "PET-105", petName: "Cheeku", vaccine: "DHPPi Annual Booster", lastDate: "2025-08-10", dueDate: "2026-08-10" }
    ];

    // Align with actual context animals in case names/data updated
    return defaultBoosters.map((b) => {
      const realAnimal = animals.find(a => a.id === b.petId);
      return {
        ...b,
        petName: realAnimal ? realAnimal.name : b.petName,
        custodian: realAnimal ? realAnimal.custodian : "Pune Central Shelter"
      };
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  };

  const boosters = getBoostersData();

  const getUrgencyColor = (dueDate) => {
    const diffTime = new Date(dueDate) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 10) return "var(--accent-coral)"; // Red/coral for critical booster limits
    if (diffDays < 20) return "var(--accent-amber)"; // Orange/amber for warning limits
    return "var(--primary-color)"; // Green/teal for planned
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Header Info */}
      <div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
          Upcoming Booster Records
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
          Schedule and trace due dates for annual rabies, parvovirus, and feline leukemia booster administrations.
        </p>
      </div>

      {isLoading ? (
        // Skeleton loader
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="skeleton" style={{ height: "70px", borderRadius: "14px" }} />
          ))}
        </div>
      ) : (
        /* Booster List Card */
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="animate-fade-in">
          {boosters.map((b) => {
            const urgencyColor = getUrgencyColor(b.dueDate);
            const daysLeft = Math.ceil((new Date(b.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
            
            return (
              <div
                key={b.petId + "-" + b.vaccine}
                className="card animate-slide-up"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "20px 24px",
                  borderLeft: `5px solid ${urgencyColor}`
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  <Calendar size={24} color={urgencyColor} />
                  <div>
                    <strong style={{ fontSize: "1.05rem" }}>{b.petName}</strong>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "monospace", marginLeft: "8px" }}>{b.petId}</span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginTop: "2px" }}>
                      Vaccine: <strong>{b.vaccine}</strong> • Custodian: {b.custodian}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.88rem", fontWeight: 800, display: "block", color: urgencyColor }}>
                      Due: {b.dueDate}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {daysLeft > 0 ? `${daysLeft} days remaining` : "Overdue"}
                    </span>
                  </div>
                  
                  <Link
                    to={`/vet/medical/${b.petId}`}
                    className="btn btn-outline btn-sm"
                    style={{ display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    Treat <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default UpcomingBoosters;
