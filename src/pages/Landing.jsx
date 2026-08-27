import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Shield, Stethoscope, ShieldAlert, Users, Award, Play, Globe } from "lucide-react";

const Landing = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Staggered entry animation on load
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const portals = [
    {
      id: "ngo",
      name: "NGO Portal",
      description: "Manage rescues, shelter capacity, medical treatments, volunteers, and adoption pipelines in a single dashboard.",
      accent: "#2E6F56", // Deep Teal
      icon: (color) => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      path: "/ngo/overview",
      tagline: "Rescue, shelter, and adoption operations",
      features: "Live State • 8 Dashboards • CRUD Modals"
    },
    {
      id: "vet",
      name: "Vet Portal",
      description: "Access shared electronic medical records, log surgery summaries, issue digital prescriptions, and view diagnosis timelines.",
      accent: "#E05D5D", // Coral
      icon: (color) => <Stethoscope size={32} color={color} />,
      path: "/vet/queue",
      tagline: "Medical records and treatment logs",
      features: "Active Demo • EHR Sync • Rx Pad"
    },
    {
      id: "parent",
      name: "Pet Parent App",
      description: "Register adopted pets, schedule vaccination cycles, set reminders, post community lost/found alerts, and consult online.",
      accent: "#F5C647", // Gold
      icon: (color) => <Heart size={32} color={color} />,
      path: "/parent/pets",
      tagline: "Track your pet's health journey",
      features: "Active Demo • Immunization • Lost & Found"
    },
    {
      id: "government",
      name: "Government Portal",
      description: "Analyze municipal rabies stats, track city herd immunity rates, supervise subsidy applications, and view stray population maps.",
      accent: "#5C6B73", // Blue-gray
      icon: (color) => <Shield size={32} color={color} />,
      path: "/government/analytics",
      tagline: "Monitoring, census & analytics",
      features: "Active Demo • Zoonotics • Grant Manager"
    },
    {
      id: "public",
      name: "Public Census Ledger",
      description: "View live city-wide transparency statistics, registry collar lookup, vaccination coverages, and solved complaints.",
      accent: "#27AE60", // Green
      icon: (color) => <Globe size={32} color={color} />,
      path: "/public-stats",
      tagline: "Welfare Transparency Report",
      features: "Open Registry • KPI Counters • Distress Stats"
    }
  ];

  return (
    <div className="page-container" style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at 10% 20%, rgba(46, 111, 86, 0.03) 0%, rgba(250, 248, 245, 1) 90%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "48px 24px",
      position: "relative"
    }}>
      {/* Decorative Watermark Paw Elements */}
      <div style={{
        position: "absolute",
        top: "5%",
        left: "5%",
        opacity: 0.02,
        transform: "rotate(-15deg)",
        pointerEvents: "none"
      }}>
        <svg width="240" height="240" viewBox="0 0 24 24" fill="var(--primary-color)">
          <path d="M12 14c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-4.5-2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm9 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-9 6c1.38 0 2.5-1.12 2.5-2.5S8.88 11 7.5 11 5 12.12 5 13.5 6.12 16 7.5 16zm9 0c1.38 0 2.5-1.12 2.5-2.5S17.88 11 16.5 11 14 12.12 14 13.5s1.12 2.5 2.5 2.5zm-4.5 4c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z" />
        </svg>
      </div>

      {/* Hero Section */}
      <div className="animate-slide-up" style={{
        textAlign: "center",
        maxWidth: "900px",
        marginBottom: "60px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        {/* Wordmark logo */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "var(--primary-color)",
            color: "white"
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-4.5-2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm9 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-4.5 7c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z" />
            </svg>
          </div>
          <span style={{
            fontSize: "2.4rem",
            fontWeight: 800,
            color: "var(--primary-color)",
            letterSpacing: "-0.03em"
          }}>
            PetLink <span style={{ fontWeight: 300, color: "var(--secondary-color)" }}>OS</span>
          </span>
        </div>

        <span className="badge" style={{
          backgroundColor: "var(--secondary-light)",
          color: "var(--primary-color)",
          fontSize: "0.85rem",
          padding: "6px 16px",
          marginBottom: "20px"
        }}>
          INDIA'S ANIMAL WELFARE OPERATING SYSTEM
        </span>

        <h1 style={{
          fontSize: "3.2rem",
          fontWeight: 700,
          color: "var(--text-main)",
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          marginBottom: "20px"
        }}>
          Connecting the Ecosystem around a <br />
          <span style={{
            background: "linear-gradient(90deg, var(--primary-color), var(--secondary-color))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Shared Animal Record
          </span>
        </h1>

        <p style={{
          fontSize: "1.15rem",
          color: "var(--text-muted)",
          maxWidth: "680px",
          lineHeight: 1.6
        }}>
          PetLink OS bridges the gap between field rescues, veterinary clinics, pet foster parents, 
          and municipal systems. Click a portal below to enter the live operating environment.
        </p>
      </div>

      {/* Grid of 4 Portal Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "28px",
        width: "100%",
        maxWidth: "1200px"
      }}>
        {portals.map((portal, index) => {
          return (
            <Link
              key={portal.id}
              to={portal.path}
              className="card animate-slide-up"
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                padding: "36px 30px",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border-color)",
                background: "var(--card-bg)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                animationDelay: `${index * 100}ms`,
                position: "relative",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                e.currentTarget.style.borderColor = portal.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                e.currentTarget.style.borderColor = "var(--border-color)";
              }}
            >
              {/* Portal Icon */}
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: `${portal.accent}12`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "24px",
                color: portal.accent
              }}>
                {portal.icon(portal.accent)}
              </div>

              {/* Title & Tag */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px", flexGrow: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", justifyContent: "space-between" }}>
                  <h3 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--text-main)" }}>
                    {portal.name}
                  </h3>
                  {portal.id === "ngo" && (
                    <span className="badge badge-adopted" style={{ fontSize: "0.65rem", padding: "2px 8px" }}>
                      Active Demo
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "0.9rem", fontWeight: 600, color: portal.accent }}>
                  {portal.tagline}
                </p>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5, marginTop: "8px" }}>
                  {portal.description}
                </p>
              </div>

              {/* Footer Meta */}
              <div style={{
                marginTop: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "16px",
                borderTop: "1px solid var(--border-color)"
              }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>
                  {portal.features}
                </span>
                <span style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: `${portal.accent}12`,
                  color: portal.accent,
                  transition: "transform 0.2s"
                }} className="portal-arrow">
                  <Play size={12} fill={portal.accent} style={{ marginLeft: "2px" }} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer Info */}
      <div style={{
        marginTop: "80px",
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: "0.85rem",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", gap: "24px" }}>
          <span>🏢 <strong>2,450+</strong> NGOs Onboarded</span>
          <span>🩺 <strong>1,820+</strong> Vet Clinics Verified</span>
          <span>🐾 <strong>45,000+</strong> Animals Registered</span>
        </div>
        <p>© 2026 PetLink OS. Supporting Digital India Animal Welfare initiatives.</p>
        <Link to="/public-stats" style={{ color: "var(--primary-color)", fontWeight: 700, textDecoration: "underline", fontSize: "0.8rem", marginTop: "4px" }}>
          View Public Transparency Report
        </Link>
      </div>
    </div>
  );
};

export default Landing;
