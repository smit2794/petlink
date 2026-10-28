import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  Syringe,
  Activity,
  TrendingUp,
  CheckCircle2,
  Stethoscope,
  PieChart
} from "lucide-react";

const VetAnalytics = () => {
  const { animals } = useApp();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  // Static reference data matching uploaded design exactly
  const diagnoses = [
    {
      id: "diag-1",
      label: "Canine Mange",
      emoji: "🐕",
      bgEmoji: "#EDE9FE",
      count: 18,
      pct: 75,
      pillBg: "#EEF2FF",
      pillBorder: "#C7D2FE",
      pillColor: "#5028FF",
      barColor: "#5028FF"
    },
    {
      id: "diag-2",
      label: "Avian Manjha Cuts",
      emoji: "🕊️",
      bgEmoji: "#F0FDF4",
      count: 12,
      pct: 50,
      pillBg: "#FEF3C7",
      pillBorder: "#FDE68A",
      pillColor: "#D97706",
      barColor: "#F59E0B"
    },
    {
      id: "diag-3",
      label: "Road Trauma Fractures",
      emoji: "🚑",
      bgEmoji: "#ECFDF5",
      count: 15,
      pct: 62,
      pillBg: "#DCFCE7",
      pillBorder: "#BBF7D0",
      pillColor: "#16A34A",
      barColor: "#10B981"
    },
    {
      id: "diag-4",
      label: "Parvovirus Alerts",
      emoji: "🦠",
      bgEmoji: "#F3E8FF",
      count: 6,
      pct: 25,
      pillBg: "#F3E8FF",
      pillBorder: "#E9D5FF",
      pillColor: "#7C3AED",
      barColor: "#8B5CF6"
    }
  ];

  return (
    <div className="vet-ana-container">
      {/* 1. Page Header */}
      <div className="vet-ana-header">
        <div className="vet-ana-title-group">
          <div className="vet-ana-title-row">
            <h1 className="vet-ana-title">
              Clinical Operations Analytics <span style={{ fontSize: "1.6rem" }}>🐾</span>
            </h1>
          </div>
          <p className="vet-ana-subtitle">
            Audit medical diagnosis distributions, vaccine logs, and clinical case resolution outcome shares.
          </p>
        </div>

        {/* Top Right Hub Badge */}
        <div className="vet-ana-badge-hub">
          <CheckCircle2 size={15} strokeWidth={2.5} className="vet-ana-badge-hub-icon" />
          <span>Clinical Hub Active</span>
        </div>
      </div>

      {isLoading ? (
        // Subtle loading state
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="skeleton" style={{ height: "140px", borderRadius: "24px" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: "24px" }}>
            <div className="skeleton" style={{ height: "380px", borderRadius: "24px" }} />
            <div className="skeleton" style={{ height: "380px", borderRadius: "24px" }} />
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-fade-in">
          
          {/* 2. Top 2 Metric / KPI Cards */}
          <div className="vet-ana-kpi-grid">
            
            {/* Card 1: Vaccinations Given This Month */}
            <div className="vet-ana-kpi-card">
              <div className="vet-ana-kpi-top">
                <div className="vet-ana-kpi-main">
                  <div className="vet-ana-kpi-icon-orange">
                    <Syringe size={24} strokeWidth={2.4} />
                  </div>
                  <div className="vet-ana-kpi-info">
                    <span className="vet-ana-kpi-label">VACCINATIONS GIVEN THIS MONTH</span>
                    <div className="vet-ana-kpi-number-col">
                      <span className="vet-ana-kpi-big-num">12</span>
                      <span className="vet-ana-kpi-big-label">Administered</span>
                    </div>
                  </div>
                </div>
                <div className="vet-ana-kpi-avatar-dog">
                  🐶
                </div>
              </div>

              <div className="vet-ana-pill-growth">
                <TrendingUp size={14} strokeWidth={2.5} />
                <span>+15% WoW growth rate</span>
              </div>
            </div>

            {/* Card 2: Active Medical Queue */}
            <div className="vet-ana-kpi-card">
              <div className="vet-ana-kpi-top">
                <div className="vet-ana-kpi-main">
                  <div className="vet-ana-kpi-icon-purple">
                    <Activity size={24} strokeWidth={2.4} />
                  </div>
                  <div className="vet-ana-kpi-info">
                    <span className="vet-ana-kpi-label">ACTIVE MEDICAL QUEUE</span>
                    <div className="vet-ana-kpi-number-row">
                      <span className="vet-ana-kpi-big-num" style={{ fontSize: "1.9rem" }}>0 Patients</span>
                    </div>
                  </div>
                </div>
                <div className="vet-ana-kpi-avatar-cat">
                  🐱
                </div>
              </div>

              <div className="vet-ana-kpi-note">
                <span className="vet-ana-dot-green" />
                <span>Awaiting clinician evaluation</span>
              </div>
            </div>

          </div>

          {/* 3. Bottom 2-Column Analytics Breakdown */}
          <div className="vet-ana-bottom-grid">
            
            {/* Left Card: Primary Clinic Diagnoses */}
            <div className="vet-ana-card">
              <div className="vet-ana-card-header">
                <div className="vet-ana-card-title-group">
                  <div className="vet-ana-icon-badge-orange">
                    <Stethoscope size={18} strokeWidth={2.3} />
                  </div>
                  <h2 className="vet-ana-card-title">Primary Clinic Diagnoses</h2>
                </div>
                <span className="vet-ana-badge-active-cases">ACTIVE CASES</span>
              </div>

              <div className="vet-ana-diagnoses-list">
                {diagnoses.map((diag) => (
                  <div key={diag.id} className="vet-ana-diag-item">
                    <div className="vet-ana-diag-row">
                      <div className="vet-ana-diag-left">
                        <div
                          className="vet-ana-diag-avatar"
                          style={{ backgroundColor: diag.bgEmoji }}
                        >
                          {diag.emoji}
                        </div>
                        <span className="vet-ana-diag-name">{diag.label}</span>
                      </div>
                      <span
                        className="vet-ana-diag-pill"
                        style={{
                          backgroundColor: diag.pillBg,
                          border: `1px solid ${diag.pillBorder}`,
                          color: diag.pillColor
                        }}
                      >
                        {diag.count} cases
                      </span>
                    </div>

                    <div className="vet-ana-progress-track">
                      <div
                        className="vet-ana-progress-fill"
                        style={{
                          width: `${diag.pct}%`,
                          backgroundColor: diag.barColor
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Card: Clinical Case Outcomes */}
            <div className="vet-ana-card">
              <div className="vet-ana-card-header">
                <div className="vet-ana-card-title-group">
                  <div className="vet-ana-icon-badge-mint">
                    <PieChart size={18} strokeWidth={2.3} />
                  </div>
                  <h2 className="vet-ana-card-title">Clinical Case Outcomes</h2>
                </div>
                <span className="vet-ana-badge-monthly-total">MONTHLY TOTAL</span>
              </div>

              <div className="vet-ana-outcomes-list">
                {/* 1. Recovered & Discharged */}
                <div className="vet-ana-outcome-item">
                  <div className="vet-ana-outcome-header">
                    <div className="vet-ana-outcome-title">
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981" }} />
                      <span>Recovered & Discharged</span>
                    </div>
                    <span className="vet-ana-outcome-pct" style={{ color: "#10B981" }}>
                      50%
                    </span>
                  </div>
                  <p className="vet-ana-outcome-desc">
                    Animals returned back to shelters or successfully placed in adoptive homes.
                  </p>
                </div>

                {/* 2. Active / Ongoing Treatment */}
                <div className="vet-ana-outcome-item">
                  <div className="vet-ana-outcome-header">
                    <div className="vet-ana-outcome-title">
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#F59E0B" }} />
                      <span>Active / Ongoing Treatment</span>
                    </div>
                    <span className="vet-ana-outcome-pct" style={{ color: "#F59E0B" }}>
                      0%
                    </span>
                  </div>
                  <p className="vet-ana-outcome-desc">
                    Patients currently logged in critical quarantine or receiving therapy.
                  </p>
                </div>

                {/* 3. Clinical Mortality / Deceased */}
                <div className="vet-ana-outcome-item">
                  <div className="vet-ana-outcome-header">
                    <div className="vet-ana-outcome-title">
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#EF4444" }} />
                      <span>Clinical Mortality / Deceased</span>
                    </div>
                    <span className="vet-ana-outcome-pct" style={{ color: "#EF4444" }}>
                      50%
                    </span>
                  </div>
                  <p className="vet-ana-outcome-desc">
                    Stray casualties who passed away due to severe trauma.
                  </p>
                </div>
              </div>

              {/* Bottom Sync Note Card */}
              <div className="vet-ana-sync-note">
                <div className="vet-ana-sync-icon">
                  🩺
                </div>
                <p className="vet-ana-sync-text">
                  All logs synchronized with the central pet welfare registry.
                </p>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default VetAnalytics;
