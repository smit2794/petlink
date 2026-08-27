import React from "react";
import { Link } from "react-router-dom";
import { Stethoscope, Heart, Shield, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

const portalInfo = {
  vet: {
    title: "Veterinary Practitioner Portal",
    subtitle: "Clinical Records & Diagnostics Hub",
    tagline: "Empowering vets with structured health histories & referral logs.",
    description: "A secure terminal for veterinary professionals to view immunization status, log clinical surgeries, write e-prescriptions, and coordinate with NGO shelter teams.",
    icon: Stethoscope,
    color: "#E05D5D", // Coral Accent
    features: [
      "Unified Electronic Health Record (EHR) linked to Animal QR tags",
      "Digital Prescription Pad with auto-notify to partner NGO pharmacies",
      "Diagnostic Lab Integration for bloodwork & imaging records",
      "Tele-consultation dashboard & scheduling for foster caretakers"
    ]
  },
  parent: {
    title: "Pet Parent Companion App",
    subtitle: "Caring for your adopted family member",
    tagline: "Connecting pet owners to the animal welfare ecosystem.",
    description: "A consumer-focused application designed for adoptive parents to access clinical histories, set vaccination reminders, log daily routines, and upload lost/found alerts.",
    icon: Heart,
    color: "#F5C647", // Amber/Gold Accent
    features: [
      "One-click transfer of health certificates from shelter to mobile wallet",
      "Smart Immunization calendar with SMS and push reminders",
      "Neighborhood Lost & Found mesh network with instant geofenced alerts",
      "Fostering journal to share photos and milestones with the shelter team"
    ]
  },
  government: {
    title: "Municipal & Government Dashboard",
    subtitle: "Public Health, Budgets & Epizootics",
    tagline: "Data-driven insights for animal health and rabies control.",
    description: "A command center for municipal corporations and state animal husbandry departments to monitor herd immunity, manage shelter subsidies, and trace zoonotic outbreaks.",
    icon: Shield,
    color: "#5C6B73", // Blue-Gray Accent
    features: [
      "Real-time rabies vaccine coverage map & herd immunity trackers",
      "Municipal funding disbursement & auditing utility for partner NGOs",
      "Cattle tagging registry (INTAG) census reports and analytical tables",
      "Zoonotic outbreak geofencing and emergency warning system"
    ]
  }
};

const PortalComingSoon = ({ portalKey }) => {
  const info = portalInfo[portalKey] || portalInfo.vet;
  const Icon = info.icon;

  return (
    <div className="page-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "20px" }}>
      <div className="card animate-scale-up" style={{
        maxWidth: "680px",
        width: "100%",
        padding: "48px",
        borderRadius: "var(--radius-xl)",
        borderTop: `8px solid ${info.color}`,
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative watermark */}
        <div style={{
          position: "absolute",
          top: "-20px",
          right: "-20px",
          opacity: 0.05,
          color: info.color
        }}>
          <Icon size={200} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: `${info.color}15`,
              color: info.color
            }}>
              <Icon size={32} />
            </div>
            <div>
              <span className="badge" style={{ backgroundColor: `${info.color}15`, color: info.color, marginBottom: "4px" }}>
                Coming Soon
              </span>
              <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-main)", lineHeight: 1.2 }}>
                {info.title}
              </h1>
              <p style={{ fontSize: "1rem", color: "var(--text-muted)", fontWeight: 500 }}>
                {info.subtitle}
              </p>
            </div>
          </div>

          <hr style={{ border: 0, borderBottom: "1px solid var(--border-color)" }} />

          {/* Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-main)" }}>
              {info.tagline}
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              {info.description}
            </p>
          </div>

          {/* Key Features */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-main)" }}>
              Planned Portal Capabilities
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {info.features.map((feature, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <CheckCircle2 size={18} style={{ color: "var(--secondary-color)", marginTop: "2px", flexShrink: 0 }} />
                  <p style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>
                    {feature}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Back button */}
          <div style={{ marginTop: "12px", display: "flex", gap: "16px" }}>
            <Link to="/" className="btn btn-outline" style={{ flex: 1 }}>
              <ArrowLeft size={16} /> Back to Portal Selector
            </Link>
            <button className="btn btn-primary" onClick={() => alert("Notification registered! We will notify you when this portal goes live.")} style={{ flex: 1, backgroundColor: info.color, borderColor: info.color }}>
              Notify Me on Launch <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalComingSoon;
