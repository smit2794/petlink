import React, { useState } from "react";
import { AlertCircle, Phone, MapPin, Compass, ShieldAlert } from "lucide-react";

const EmergencyNearby = () => {
  const [activePin, setActivePin] = useState(null);

  const locations = [
    { id: 1, type: "clinic", name: "Care Animal Veterinary Hospital", lat: 38, lng: 45, phone: "+91 20 6712 9000", addr: "Hadapsar, Near Bypass Circle, Pune" },
    { id: 2, type: "ngo", name: "Pune Central Animal Shelter", lat: 50, lng: 55, phone: "+91 20 8923 1120", addr: "Kothrud Industrial Area, Pune" },
    { id: 3, type: "clinic", name: "Aundh Feline Diagnostic Center", lat: 25, lng: 30, phone: "+91 20 5412 8871", addr: "DP Road, Aundh, Pune" },
    { id: 4, type: "ngo", name: "People for Animals Gaushala", lat: 70, lng: 65, phone: "+91 20 3390 1209", addr: "Hadapsar Rural gaushala plot, Pune" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Header Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
            Emergency Clinics & Shelters
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
            Identify nearest clinical help or NGO rescue hubs. View contact lines and coordinates mapping.
          </p>
        </div>
      </div>

      {/* Primary Emergency Alert Badge */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "16px 24px",
        backgroundColor: "var(--accent-coral-light)",
        color: "var(--accent-coral)",
        borderRadius: "14px",
        border: "1px solid rgba(217, 83, 79, 0.15)",
        fontSize: "0.9rem",
        fontWeight: 700
      }}>
        <ShieldAlert size={20} />
        <span>URGENT ANIMAL AMBULANCE TOLL-FREE HOTLINE: 1962 (National Stray Rescue Helpline)</span>
      </div>

      {/* Split Grid Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "28px" }} className="animal-profile-grid">
        
        {/* Left Side: Clinic Contact Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}>
            <Compass size={18} color="var(--accent-amber)" /> Nearby Care Facilities
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {locations.map((loc) => {
              const isNGO = loc.type === "ngo";
              return (
                <div
                  key={loc.id}
                  className="card animate-slide-up"
                  onClick={() => setActivePin(loc.id)}
                  style={{
                    cursor: "pointer",
                    padding: "16px 20px",
                    borderLeft: isNGO ? "5px solid var(--primary-color)" : "5px solid var(--accent-coral)",
                    backgroundColor: activePin === loc.id ? "#FCFAF6" : "white",
                    borderColor: activePin === loc.id ? "var(--accent-amber)" : "",
                    transition: "all var(--transition-fast)"
                  }}
                >
                  <div style={{ display: "flex", justifyBetween: "space-between", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                    <span style={{ fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 800, color: isNGO ? "var(--primary-color)" : "var(--accent-coral)" }}>
                      {isNGO ? "🏢 NGO Shelter" : "🩺 Vet Clinic"}
                    </span>
                  </div>
                  
                  <strong style={{ fontSize: "0.95rem", display: "block" }}>{loc.name}</strong>
                  
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "8px" }}>
                    <MapPin size={12} />
                    <span>{loc.addr}</span>
                  </div>

                  <div style={{ display: "flex", justifyBetween: "space-between", justifyContent: "space-between", alignItems: "center", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--border-color)" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{loc.phone}</span>
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ padding: "4px 10px", display: "flex", alignItems: "center", gap: "4px", borderColor: "var(--accent-amber)", color: "var(--accent-amber)" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Dialing mock phone line: ${loc.phone}`);
                      }}
                    >
                      <Phone size={10} /> Call Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Map Canvas Component */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Coverage Map</h3>
          
          <div className="card" style={{
            height: "450px",
            backgroundColor: "#FAF8F2",
            border: "1px solid var(--border-color)",
            borderRadius: "20px",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {/* Draw styled SVG grid representing map outline */}
            <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
              {/* Decorative Roads */}
              <path d="M 20 80 Q 200 120 400 60 T 600 240" fill="none" stroke="#E6DDD4" strokeWidth="24" strokeLinecap="round" />
              <path d="M 120 20 L 150 400" fill="none" stroke="#E6DDD4" strokeWidth="18" strokeLinecap="round" />
              <path d="M 450 10 L 400 420" fill="none" stroke="#E6DDD4" strokeWidth="18" strokeLinecap="round" />
              
              {/* Rivers / Lakes */}
              <rect x="0" y="360" width="100%" height="90" fill="#E2EDF7" opacity="0.8" />
              
              {/* Grid indicators */}
              <circle cx="280" cy="220" r="140" fill="none" stroke="rgba(224, 144, 37, 0.05)" strokeDasharray="5,5" strokeWidth="2" />
            </svg>

            {/* Pins */}
            {locations.map((loc) => {
              const isNGO = loc.type === "ngo";
              const isActive = activePin === loc.id;
              
              return (
                <div
                  key={loc.id}
                  onClick={() => setActivePin(loc.id)}
                  style={{
                    position: "absolute",
                    left: `${loc.lat}%`,
                    top: `${loc.lng}%`,
                    transform: "translate(-50%, -50%)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    zIndex: isActive ? 10 : 2
                  }}
                >
                  {/* Pin Bubble */}
                  <div style={{
                    width: isActive ? "32px" : "24px",
                    height: isActive ? "32px" : "24px",
                    borderRadius: "50%",
                    backgroundColor: isNGO ? "var(--primary-color)" : "var(--accent-coral)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isActive ? "0 4px 10px rgba(0,0,0,0.25)" : "0 2px 6px rgba(0,0,0,0.15)",
                    border: "2px solid white",
                    transition: "all var(--transition-fast)"
                  }}>
                    <MapPin size={isActive ? 16 : 12} />
                  </div>
                  
                  {/* Pin label (conditional) */}
                  {isActive && (
                    <div className="animate-scale-up" style={{
                      backgroundColor: "var(--primary-color)",
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      marginTop: "6px",
                      whiteSpace: "nowrap",
                      boxShadow: "var(--shadow-md)"
                    }}>
                      {loc.name}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Map Legends */}
            <div style={{
              position: "absolute",
              bottom: "16px",
              left: "16px",
              backgroundColor: "white",
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid var(--border-color)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              boxShadow: "var(--shadow-sm)"
            }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Map Legend</span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "var(--primary-color)" }} />
                <span>NGO Rescue Nodes</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "var(--accent-coral)" }} />
                <span>Vet Clinic Nodes</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default EmergencyNearby;
