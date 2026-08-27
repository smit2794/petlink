import React, { useState } from "react";
import { ClipboardCheck, Calendar, ShieldCheck, Eye, X, Award, Info } from "lucide-react";

const InspectionReports = () => {
  const [selectedReport, setSelectedReport] = useState(null);

  const reports = [
    { id: 1, name: "Pune Central Animal Shelter", date: "2026-05-15", inspector: "Dr. Jayant Deshmukh", rating: "Grade A (Highly Compliant)", score: 95, summary: "Shelter hygiene meets global sanitation guidelines. Quarantine isolation bay is properly ventilated. Stock registers for scheduled medical drugs reconcile fully with Vet Portal entries. Recommend grant release.", notes: "Highly organized staff, medical records synced cleanly, vaccine cold-chains verify optimal temperature logging, clean cage sanitation." },
    { id: 2, name: "Hadapsar Gaushala Cattle Shelter", date: "2026-04-10", inspector: "Officer Vinod Kadam", rating: "Grade A (Compliant)", score: 88, summary: "Cattle shed has sufficient shade. Deworming schedule is compliant. Low-stock limits are maintained. Minor warning issued to level green fodder dry racks off the ground.", notes: "Clean runoff channels, animals feed logs up to date, dry shelter sheds comply with rain-protection grids." },
    { id: 3, name: "Aviation Bird Rehabilitation Clinic", date: "2026-06-02", inspector: "Dr. Jayant Deshmukh", rating: "Grade B+ (Compliant)", score: 82, summary: "Aviation netting checks verify mesh sizing is compliance-clean. Water disinfection is updated. Feeding schedules match wild bird rehabilitation charts.", notes: "High discharge rating, clean air exchange ratings, minor recommendation to upgrade bird cages to stainless steel grids." },
    { id: 4, name: "Dhayari Stray Welfare Association", date: "2026-02-18", inspector: "Officer Vinod Kadam", rating: "Grade C (Needs Action)", score: 65, summary: "Sanitation requires improvement. Dog kennels show moisture retention. Medical stock logging has sporadic gaps. Corrective action plan demanded within 30 days.", notes: "Needs partition upgrades, water bowls log scale marks, stock logging is manual, training on EHR tablet console recommended." }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Header Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
            NGO Audit & Inspection Logs
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
            Review official health inspection scores, sanitary compliance grades, and audit summaries.
          </p>
        </div>
      </div>

      {/* General Compliance Callout */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "16px 20px",
        backgroundColor: "rgba(92, 107, 115, 0.08)",
        color: "#5C6B73",
        borderRadius: "14px",
        border: "1px solid rgba(92, 107, 115, 0.15)",
        fontSize: "0.85rem",
        fontWeight: 700
      }}>
        <ClipboardCheck size={18} />
        <span>Annual Inspection Cycle: 4/6 centers certified compliance-clean. Next audits schedule: Deccan Area.</span>
      </div>

      {/* Reports Grid List */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {reports.map((rep) => {
          const isNeedsAction = rep.score < 70;
          return (
            <div
              key={rep.id}
              className="card animate-slide-up"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                borderLeft: isNeedsAction ? "5px solid var(--accent-coral)" : "5px solid var(--primary-color)",
                padding: "20px 24px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
                    <Calendar size={12} /> Inspected: {rep.date}
                  </span>
                  <strong style={{ fontSize: "1rem", display: "block", color: "var(--text-main)", marginTop: "4px" }}>
                    {rep.name}
                  </strong>
                </div>
                
                <span className={`badge badge-${isNeedsAction ? "rescued" : "adopted"}`} style={{ fontSize: "0.68rem" }}>
                  {rep.score}% score
                </span>
              </div>

              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5, flex: 1 }}>
                {rep.summary.substring(0, 120)}...
              </p>

              <hr style={{ border: 0, borderBottom: "1px solid var(--border-color)", margin: 0 }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)" }}>
                  By: {rep.inspector}
                </span>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ display: "flex", alignItems: "center", gap: "4px", borderColor: "#5C6B73", color: "#5C6B73" }}
                  onClick={() => setSelectedReport(rep)}
                >
                  <Eye size={12} /> View Report
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================
          MODAL: REPORT DETAILED VIEWER
      ======================================================== */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)} style={{ zIndex: 9999 }}>
          <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
            <div className="modal-header">
              <h2 style={{ fontWeight: 800, color: "var(--primary-color)", display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={20} /> Inspection Compliance Sheet
              </h2>
              <button className="modal-close" onClick={() => setSelectedReport(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              
              <div>
                <strong style={{ fontSize: "1.15rem", display: "block" }}>{selectedReport.name}</strong>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginTop: "2px" }}>
                  Date: {selectedReport.date} • Lead Inspector: {selectedReport.inspector}
                </span>
              </div>

              <hr style={{ border: 0, borderBottom: "1px solid var(--border-color)", margin: 0 }} />

              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 800, display: "block", textTransform: "uppercase", marginBottom: "4px" }}>
                  Executive Rating Score
                </span>
                <strong style={{ fontSize: "1.1rem", color: selectedReport.score >= 70 ? "var(--primary-color)" : "var(--accent-coral)" }}>
                  {selectedReport.rating} ({selectedReport.score}%)
                </strong>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 800, display: "block", textTransform: "uppercase", marginBottom: "4px" }}>
                  Inspector Summary
                </span>
                <p style={{ fontSize: "0.85rem", color: "var(--text-main)", lineHeight: 1.5, backgroundColor: "#FCFAF6", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  {selectedReport.summary}
                </p>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 800, display: "block", textTransform: "uppercase", marginBottom: "4px" }}>
                  Detailed Audit Notes
                </span>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {selectedReport.notes}
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSelectedReport(null)}>
                  Close Report Sheet
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default InspectionReports;
