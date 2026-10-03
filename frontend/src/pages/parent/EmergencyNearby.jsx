import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import {
  Compass,
  Map,
  MapPin,
  Phone,
  PhoneCall,
  CheckCircle,
  PlusSquare,
  Truck,
  PawPrint,
  Shield,
  Activity,
  HeartHandshake,
  Crosshair,
  Plus,
  Minus,
  Navigation,
  Building2,
  Stethoscope,
  Flag,
  LifeBuoy
} from "lucide-react";

const EmergencyNearby = () => {
  const { addToast } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activePin, setActivePin] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);

  const facilities = [
    {
      id: 1,
      type: "clinic",
      name: "Care Animal Veterinary Hospital",
      distance: "2.4 km away",
      phone: "+91 20 6712 9000",
      addr: "Hadapsar, Near Bypass Circle, Pune",
      pinX: 32,
      pinY: 53,
      pinType: "red",
      icon: Stethoscope
    },
    {
      id: 2,
      type: "shelter",
      name: "Pune Central Animal Shelter",
      distance: "4.1 km away",
      phone: "+91 20 8923 1120",
      addr: "Kothrud Industrial Area, Pune",
      pinX: 60,
      pinY: 61,
      pinType: "green",
      icon: Building2
    },
    {
      id: 3,
      type: "clinic",
      name: "Aundh Feline Diagnostic Center",
      distance: "5.8 km away",
      phone: "+91 20 5412 8871",
      addr: "DP Road, Aundh, Pune",
      pinX: 45,
      pinY: 58,
      pinType: "red",
      icon: Stethoscope
    }
  ];

  // Additional 4th node visible on map
  const mapNodes = [
    ...facilities,
    {
      id: 4,
      type: "shelter",
      name: "Community Rescue Node",
      pinX: 78,
      pinY: 64,
      pinType: "green",
      icon: PawPrint
    }
  ];

  const handleCall = (phone, name) => {
    if (addToast) {
      addToast(`Initiating direct dispatch call to ${name}: ${phone}`, "info");
    }
    window.location.href = `tel:${phone.replace(/\s+/g, "")}`;
  };

  const handleBroadcast = () => {
    if (addToast) {
      addToast("📍 Emergency live GPS beacon broadcasted to 24 local response units!", "warning");
    }
  };

  return (
    <div className="parent-content-wrap parent-emergency-container">
      {/* ========================================================
          1. HEADER AREA
          ======================================================== */}
      <div className="parent-emergency-header">
        <div className="parent-emergency-title-group">
          <div className="parent-emergency-asterisk-icon">
            <span style={{ fontSize: "1.4rem", fontWeight: 900, lineHeight: 1 }}>✱</span>
          </div>
          <div>
            <h1 className="parent-emergency-title">
              Emergency Clinics & Shelters
            </h1>
            <p className="parent-emergency-sub">
              Identify nearest clinical help or NGO rescue hubs. View contact lines and coordinates mapping.
            </p>
          </div>
        </div>

        <div className="parent-emergency-header-badges">
          <span className="parent-emergency-badge-rapid">
            <span className="parent-emergency-rapid-dot" /> 24/7 Rapid Response Network
          </span>
          <span className="parent-emergency-badge-verified">
            <CheckCircle size={14} color="#92400E" /> Verified Facilities: 18
          </span>
        </div>
      </div>

      {/* ========================================================
          2. TOLL-FREE HOTLINE BANNER
          ======================================================== */}
      <div className="parent-emergency-hotline-banner">
        <div className="parent-emergency-hotline-left">
          <div className="parent-emergency-hotline-icon">
            <PhoneCall size={22} color="#BE123C" />
          </div>
          <div className="parent-emergency-hotline-text">
            <h4>URGENT ANIMAL AMBULANCE TOLL-FREE HOTLINE: 1962 (National Stray Rescue Helpline)</h4>
            <p>Available 24 hours daily across municipal zones for stray, injured, and critical animals.</p>
          </div>
        </div>

        <a
          href="tel:1962"
          className="parent-emergency-hotline-btn"
          onClick={() => addToast && addToast("Dialing National Animal Ambulance Hotline 1962...", "warning")}
        >
          <PhoneCall size={16} /> Dial 1962
        </a>
      </div>

      {/* ========================================================
          3. TOP 3 STAT KPI CARDS
          ======================================================== */}
      <div className="parent-emergency-stats-grid">
        {/* Card 1: ICU Beds Free */}
        <div className="parent-emergency-stat-card lavender">
          <div className="parent-emergency-stat-top">
            <span className="parent-emergency-stat-title">
              <PlusSquare size={14} strokeWidth={2.5} /> ICU BEDS FREE
            </span>
            <span className="parent-emergency-stat-pill">Live</span>
          </div>
          <div className="parent-emergency-stat-val">14</div>
          <div className="parent-emergency-stat-bottom">
            <span className="parent-emergency-stat-sub">↑ 4 nodes with oxygen</span>
            <div className="parent-emergency-stat-icon-circle">
              <Shield size={18} strokeWidth={2.2} />
            </div>
          </div>
        </div>

        {/* Card 2: Mobile Ambulances */}
        <div className="parent-emergency-stat-card peach">
          <div className="parent-emergency-stat-top">
            <span className="parent-emergency-stat-title">
              <Truck size={14} strokeWidth={2.5} /> MOBILE AMBULANCES
            </span>
            <span className="parent-emergency-stat-pill">8 Active</span>
          </div>
          <div className="parent-emergency-stat-val">12m</div>
          <div className="parent-emergency-stat-bottom">
            <span className="parent-emergency-stat-sub">
              Avg arrival in {user?.city ? `${user.city} Zone` : "Pune Zone"}
            </span>
            <div className="parent-emergency-stat-icon-circle">
              <Activity size={18} strokeWidth={2.2} />
            </div>
          </div>
        </div>

        {/* Card 3: Rescue Foster Cap */}
        <div className="parent-emergency-stat-card mint">
          <div className="parent-emergency-stat-top">
            <span className="parent-emergency-stat-title">
              <PawPrint size={14} strokeWidth={2.5} /> RESCUE FOSTER CAP
            </span>
            <span className="parent-emergency-stat-pill">78% Full</span>
          </div>
          <div className="parent-emergency-stat-val">62</div>
          <div className="parent-emergency-stat-bottom">
            <span className="parent-emergency-stat-sub">24 Kennels open now</span>
            <div className="parent-emergency-stat-icon-circle">
              <HeartHandshake size={18} strokeWidth={2.2} />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. SPLIT GRID HEADER ROW
          ======================================================== */}
      <div className="parent-emergency-split-head">
        <div className="parent-emergency-col-title">
          <Compass size={18} color="#FF6A00" />
          <span>Nearby Care Facilities</span>
          <span className="parent-emergency-col-sub">Showing 3 verified</span>
        </div>

        <div className="parent-emergency-col-title" style={{ justifyContent: "flex-end" }}>
          <Map size={18} color="#FF6A00" />
          <span>Coverage Map</span>
          <span className="parent-emergency-metro-pill">
            <Crosshair size={14} color="#EA580C" /> Pune Metro & Suburbs
          </span>
        </div>
      </div>

      {/* ========================================================
          5. MAIN 2-COLUMN GRID (FACILITIES & INTERACTIVE MAP)
          ======================================================== */}
      <div className="parent-emergency-main-grid">
        {/* Left Column: Facilities List */}
        <div className="parent-emergency-facilities-list">
          {facilities.map((fac) => {
            const isClinic = fac.type === "clinic";
            const isActive = activePin === fac.id;
            return (
              <div
                key={fac.id}
                className={`parent-emergency-facility-card ${isActive ? "active" : ""}`}
                onClick={() => setActivePin(fac.id)}
              >
                <div className="parent-emergency-facility-top">
                  <span className={`parent-emergency-facility-type ${isClinic ? "clinic" : "shelter"}`}>
                    {isClinic ? "🩺 VET CLINIC" : "🏢 NGO SHELTER"}
                  </span>
                  <span className="parent-emergency-facility-distance">
                    <span className="parent-emergency-facility-distance-dot" /> {fac.distance}
                  </span>
                </div>

                <h3 className="parent-emergency-facility-name">{fac.name}</h3>

                <div className="parent-emergency-facility-addr">
                  <MapPin size={14} color="#EA580C" style={{ flexShrink: 0 }} />
                  <span>{fac.addr}</span>
                </div>

                <div className="parent-emergency-facility-bottom">
                  <span className="parent-emergency-facility-phone">
                    <Phone size={14} color="#9CA3AF" />
                    <span>{fac.phone}</span>
                  </span>

                  <button
                    type="button"
                    className="parent-emergency-call-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCall(fac.phone, fac.name);
                    }}
                  >
                    Call Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Stylized Interactive Coverage Map */}
        <div className="parent-emergency-map-wrap">
          {/* Top Left Floating GPS Pill */}
          <div className="parent-emergency-map-top-pill">
            <span>Live GPS Grid | 18.5204° N, 73.8567° E</span>
          </div>

          {/* Top Right Zoom Controls */}
          <div className="parent-emergency-map-controls">
            <button
              type="button"
              className="parent-emergency-map-btn"
              onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.45))}
              title="Zoom in"
            >
              <Plus size={16} />
            </button>
            <button
              type="button"
              className="parent-emergency-map-btn"
              onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.85))}
              title="Zoom out"
            >
              <Minus size={16} />
            </button>
            <button
              type="button"
              className="parent-emergency-map-btn"
              onClick={() => setZoomLevel(1)}
              title="Reset location center"
            >
              <Navigation size={14} />
            </button>
          </div>

          {/* Map Vector Graphic (Road Network & Radials) */}
          <svg
            className="parent-emergency-map-svg"
            viewBox="0 0 600 500"
            preserveAspectRatio="none"
            style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.25s ease" }}
          >
            {/* Soft Radius Coverage Rings */}
            <circle cx="300" cy="270" r="130" fill="none" stroke="#E5E0D8" strokeWidth="1" strokeDasharray="6 6" />
            <circle cx="300" cy="270" r="230" fill="none" stroke="#E5E0D8" strokeWidth="1" strokeDasharray="8 8" />

            {/* Stylized Intersecting Highways / Roadways */}
            <path
              d="M-50,260 Q 250,250 650,270"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="24"
              strokeLinecap="round"
            />
            <path
              d="M-50,260 Q 250,250 650,270"
              fill="none"
              stroke="#E8E2D7"
              strokeWidth="18"
              strokeLinecap="round"
            />

            <path
              d="M380,-30 L 450,550"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="24"
              strokeLinecap="round"
            />
            <path
              d="M380,-30 L 450,550"
              fill="none"
              stroke="#E8E2D7"
              strokeWidth="18"
              strokeLinecap="round"
            />

            <path
              d="M60,-30 Q 300,280 620,380"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <path
              d="M60,-30 Q 300,280 620,380"
              fill="none"
              stroke="#E8E2D7"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* Diagonal Secondary Avenue */}
            <path
              d="M100,520 Q 340,300 580,200"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              d="M100,520 Q 340,300 580,200"
              fill="none"
              stroke="#ECE6DB"
              strokeWidth="10"
              strokeLinecap="round"
            />
          </svg>

          {/* Interactive Map Nodes (Pins) */}
          {mapNodes.map((node) => {
            const PinIcon = node.icon;
            const isActive = activePin === node.id;
            return (
              <div
                key={node.id}
                className={`parent-emergency-pin ${node.pinType} ${isActive ? "active" : ""}`}
                style={{ top: `${node.pinY}%`, left: `${node.pinX}%` }}
                onClick={() => {
                  setActivePin(node.id);
                  if (node.phone) {
                    addToast && addToast(`Selected ${node.name} on coverage map`, "info");
                  }
                }}
                title={node.name}
              >
                <PinIcon size={18} strokeWidth={2.4} />
              </div>
            );
          })}

          {/* Map Legend Box */}
          <div className="parent-emergency-legend">
            <span className="parent-emergency-legend-title">MAP LEGEND</span>
            <div className="parent-emergency-legend-row">
              <span className="parent-emergency-legend-dot green" />
              <span>NGO Rescue Nodes</span>
            </div>
            <div className="parent-emergency-legend-row">
              <span className="parent-emergency-legend-dot red" />
              <span>Vet Clinic Nodes</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          6. BOTTOM REPORT BANNER
          ======================================================== */}
      <div className="parent-emergency-bottom-banner">
        <div className="parent-emergency-bottom-left">
          <div className="parent-emergency-bottom-icon">
            <LifeBuoy size={26} strokeWidth={2.2} />
          </div>
          <div className="parent-emergency-bottom-text">
            <h4>Reporting a Lost or Injured Animal?</h4>
            <p>
              Stay calm. Secure the perimeter, note landmarks, and share live location directly with the rescue fleet.
            </p>
          </div>
        </div>

        <div className="parent-emergency-bottom-actions">
          <button
            type="button"
            className="parent-emergency-btn-broadcast"
            onClick={handleBroadcast}
          >
            <Crosshair size={16} /> Broadcast Pin
          </button>

          <button
            type="button"
            className="parent-emergency-btn-stray"
            onClick={() => navigate("/parent/lost-alerts")}
          >
            <Flag size={16} /> Submit Stray Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyNearby;
