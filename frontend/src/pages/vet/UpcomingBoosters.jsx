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

  // Generate upcoming boosters list dynamically from real vaccination timeline entries
  const getBoostersData = () => {
    const results = [];

    animals.forEach((animal) => {
      if (!animal.timeline) return;

      // Find the most recent "Immunization Administered" entry with a parseable "Next Due" date
      const vaccinationEntries = animal.timeline.filter(
        (e) => e.title === "Immunization Administered" && e.description?.includes("Next Due:")
      );

      vaccinationEntries.forEach((entry) => {
        const vaccineMatch = entry.description.match(/Vaccine:\s*([^.]+)\./);
        const dueDateMatch = entry.description.match(/Next Due:\s*(\d{4}-\d{2}-\d{2})/);

        if (dueDateMatch) {
          results.push({
            petId: animal.id,
            petName: animal.name,
            custodian: animal.custodian,
            vaccine: vaccineMatch ? vaccineMatch[1].trim() : "Vaccination",
            lastDate: entry.date,
            dueDate: dueDateMatch[1]
          });
        }
      });
    });

    return results.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  };

  const boosters = getBoostersData();

  const getUrgencyColor = (dueDate) => {
    const diffTime = new Date(dueDate) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 10) return "#EF4444"; // Red for critical booster limits
    if (diffDays < 20) return "#F59E0B"; // Amber for warning limits
    return "#5028FF"; // PawSetu purple for planned
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

      {/* Header Info */}
      <div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>
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
                    style={{ display: "flex", alignItems: "center", gap: "4px", borderColor: "#C7D2FE", color: "#5028FF", fontWeight: 700 }}
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
