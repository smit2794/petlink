import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { 
  PlusCircle, Search, Table, Map, Navigation, 
  User, Calendar, Phone, Activity, X, MapPin,
  CheckCircle, Clock, AlertTriangle, PawPrint
} from "lucide-react";

// Helper: badge icon per rescue status
const getRescueStatusBadge = (status) => {
  const icons = {
    "New":         { cls: "badge-lost",     icon: <AlertTriangle size={11} /> },
    "Assigned":    { cls: "badge-rescued",   icon: <Clock size={11} /> },
    "In Progress": { cls: "badge-treatment", icon: <Navigation size={11} /> },
    "Rescued":     { cls: "badge-adopted",   icon: <CheckCircle size={11} /> },
  };
  const b = icons[status] || { cls: "badge-shelter", icon: null };
  return <span className={`badge ${b.cls}`}>{b.icon} {status}</span>;
};

// Helper: cartoon avatar for species
const getAnimalAvatar = (animalType, isHero = false) => {
  const type = (animalType || "").toLowerCase();
  let emoji = "🐶";
  let bg = "#FFF3E6";
  let border = "#FED7AA";

  if (type === "cat") {
    emoji = "🐱";
    bg = "#F5F3FF";
    border = "#DDD6FE";
  } else if (type === "cow") {
    emoji = "🐮";
    bg = "#FEF9C3";
    border = "#FDE047";
  } else if (type === "bird") {
    emoji = "🦜";
    bg = "#E0F2FE";
    border = "#BAE6FD";
  }

  return (
    <div style={{
      width: isHero ? "52px" : "36px",
      height: isHero ? "52px" : "36px",
      borderRadius: "50%",
      background: bg,
      border: `1.5px solid ${border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: isHero ? "1.75rem" : "1.2rem",
      flexShrink: 0
    }}>
      {emoji}
    </div>
  );
};

// Helper: condition pill
const renderConditionBadge = (condition) => {
  if (!condition) return <span style={{ color: "#8C7B75" }}>—</span>;
  const condLower = condition.toLowerCase();
  if (condLower.includes("injured paw") || condLower === "injured paw") {
    return (
      <span style={{
        background: "#FEE2E2",
        color: "#DC2626",
        borderRadius: "9999px",
        padding: "4px 14px",
        fontSize: "0.8rem",
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        whiteSpace: "nowrap"
      }}>
        <span>🐾</span> Injured Paw
      </span>
    );
  }
  return (
    <span style={{
      color: "#5C4D46",
      fontSize: "0.86rem",
      fontWeight: 600,
      fontStyle: condLower === "xxx" ? "italic" : "normal"
    }}>
      {condition}
    </span>
  );
};

// Helper: action circle in table
const getActionCircle = (index) => {
  const styles = [
    { bg: "#FEF3C7", icon: "•", color: "#D97706" },
    { bg: "#E6F9F0", icon: "🚑", color: "#059669" },
    { bg: "#FEE2E2", icon: "🚑", color: "#DC2626" },
    { bg: "#FCE7F3", icon: "🚑", color: "#DB2777" },
  ];
  const s = styles[index % styles.length];
  return (
    <div style={{
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      backgroundColor: s.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: s.icon === "•" ? "1.3rem" : "0.95rem",
      color: s.color,
      marginLeft: "auto"
    }}>
      {s.icon}
    </div>
  );
};

const RescueMgmt = () => {
  const { rescues, volunteers, addRescue, updateRescueStatusPersisted } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table"); // "table" | "map"
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRescue, setSelectedRescue] = useState(null);
  const [showNewRescueModal, setShowNewRescueModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Form state
  const [formValues, setFormValues] = useState({
    animalType: "Dog", condition: "", location: "", reportedBy: "", phone: "", assignedVolunteer: "None"
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (rescues.length > 0) {
        setSelectedRescue(rescues[0]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Filter and Search logic
  const filteredRescues = rescues
    .filter((r) => {
      const matchesFilter = statusFilter === "All" || r.status === statusFilter;
      const matchesSearch = 
        r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reportedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formValues.condition) errors.condition = "Condition details are required";
    if (!formValues.location) errors.location = "Rescue location is required";
    if (!formValues.reportedBy) errors.reportedBy = "Reporter name is required";
    if (!formValues.phone) errors.phone = "Reporter contact is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    addRescue(formValues);
    setShowNewRescueModal(false);
    setFormValues({
      animalType: "Dog", condition: "", location: "", reportedBy: "", phone: "", assignedVolunteer: "None"
    });
    setFormErrors({});
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      
      {/* 1. Header Area matching reference image */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "20px"
      }}>
        {/* Left: Avatar with Siren + Title + Hero Squad Badge + Subtitle */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Circular avatar with 🚨 badge */}
          <div style={{ position: "relative", width: "52px", height: "52px", flexShrink: 0 }}>
            <div style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FF8C38, #FF5500)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.75rem",
              boxShadow: "0 4px 14px rgba(255, 110, 20, 0.3)"
            }}>
              🐶
            </div>
            <div style={{
              position: "absolute",
              bottom: "-2px",
              right: "-2px",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "#FFFFFF",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem"
            }}>
              🚨
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <h1 style={{ fontSize: "1.85rem", fontWeight: 900, color: "#1D1311", lineHeight: 1.15, margin: 0 }}>
                Rescue Dispatch Management
              </h1>
              <div style={{
                background: "#FFF9EB",
                border: "1.5px solid #FDE68A",
                borderRadius: "9999px",
                padding: "4px 14px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#B45309",
                fontSize: "0.74rem",
                fontWeight: 800,
                letterSpacing: "0.04em",
                boxShadow: "0 2px 6px rgba(180, 83, 9, 0.05)"
              }}>
                🐾 HERO SQUAD
              </div>
            </div>
            <p style={{ color: "#8C7B75", fontSize: "0.92rem", fontWeight: 500, margin: 0 }}>
              Monitor reported street cases, dispatch ambulance units, and track rescue pipelines.
            </p>
          </div>
        </div>

        {/* Right: Table/Map View Toggle + '+ New Report' Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* Capsule Switcher */}
          <div className="ngo-rescue-view-capsule">
            <button
              onClick={() => setViewMode("table")}
              className={`ngo-rescue-view-btn ${viewMode === "table" ? "is-active" : ""}`}
            >
              <Table size={15} color={viewMode === "table" ? "#FF6E14" : "#8C7B75"} /> Table View
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`ngo-rescue-view-btn ${viewMode === "map" ? "is-active" : ""}`}
            >
              <Map size={15} color={viewMode === "map" ? "#FF6E14" : "#8C7B75"} /> Map View
            </button>
          </div>

          {/* New Report Button */}
          <button className="ngo-rescue-btn-new" onClick={() => setShowNewRescueModal(true)}>
            <PlusCircle size={18} /> + New Report
          </button>
        </div>
      </div>

      {/* 2. Floating Filter & Search Bar */}
      <div className="ngo-rescue-search-toolbar">
        <div className="ngo-rescue-search-box">
          <Search size={16} color="#8C7B75" />
          <input
            type="text"
            placeholder="Search by ID, reporter, location, or injury..."
            className="ngo-rescue-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          {["All", "New", "Assigned", "In Progress", "Rescued"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`ngo-rescue-status-pill ${statusFilter === filter ? "is-active" : ""}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Split Layout: Left Table/Map & Right Active Inspection Panel */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.65fr 1fr",
        gap: "24px",
        alignItems: "start"
      }} className="ngo-rescue-split-grid">

        {/* LEFT COLUMN: Table or Map */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {isLoading ? (
            <div className="skeleton" style={{ height: "420px", borderRadius: "26px" }} />
          ) : viewMode === "table" ? (
            <div className="ngo-rescue-table-card">
              <table className="ngo-rescue-table">
                <thead>
                  <tr>
                    <th style={{ cursor: "pointer", paddingLeft: "24px" }} onClick={() => handleSort("id")}>ID</th>
                    <th>ANIMAL TYPE</th>
                    <th>CONDITION / NOTES</th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("location")}>LOCATION</th>
                    <th>REPORTED BY</th>
                    <th style={{ width: "60px", textAlign: "right", paddingRight: "24px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRescues.length === 0 ? (
                    <tr>
                      <td colSpan="6">
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "50px 20px" }}>
                          <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#FFF3E6", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF6E14" }}>
                            <PawPrint size={24} />
                          </div>
                          <p style={{ fontSize: "1rem", fontWeight: 800, color: "#1D1311", margin: 0 }}>No rescue cases found</p>
                          <p style={{ fontSize: "0.85rem", color: "#8C7B75", margin: 0 }}>Try adjusting your filters or search terms.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRescues.map((rescue, idx) => {
                      const isSelected = selectedRescue && selectedRescue.id === rescue.id;
                      return (
                        <tr 
                          key={rescue.id} 
                          onClick={() => setSelectedRescue(rescue)}
                          className={`ngo-rescue-table-row ${isSelected ? "is-selected" : ""}`}
                        >
                          {/* Column 1: ID */}
                          <td style={{ fontWeight: 800, color: "#1D1311", paddingLeft: "24px", letterSpacing: "0.01em", whiteSpace: "nowrap" }}>
                            {rescue.id}
                          </td>

                          {/* Column 2: Animal Type with Cartoon Avatar */}
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              {getAnimalAvatar(rescue.animalType)}
                              <span style={{ fontWeight: 700, color: "#1D1311" }}>{rescue.animalType}</span>
                            </div>
                          </td>

                          {/* Column 3: Condition / Notes */}
                          <td>
                            {renderConditionBadge(rescue.condition)}
                          </td>

                          {/* Column 4: Location */}
                          <td style={{ color: "#4A3E39", fontWeight: 600 }}>
                            {rescue.location}
                          </td>

                          {/* Column 5: Reported By */}
                          <td style={{ color: "#1D1311", fontWeight: 700 }}>
                            {rescue.reportedBy}
                          </td>

                          {/* Column 6: Action ambulance circle */}
                          <td style={{ textAlign: "right", paddingRight: "24px" }}>
                            {getActionCircle(idx)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Map View - SVG Representation */
            <div className="ngo-rescue-table-card" style={{ padding: 0, overflow: "hidden", position: "relative", height: "460px", display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1, backgroundColor: "#EAE5D9", position: "relative" }}>
                <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
                  <defs>
                    <pattern id="rescue-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#rescue-grid)" />
                  <path d="M 0,200 C 150,180 300,240 500,200 C 650,170 800,220 1000,190" fill="none" stroke="#B9D4E2" strokeWidth="24" strokeLinecap="round" opacity="0.6" />
                  <path d="M 0,200 C 150,180 300,240 500,200 C 650,170 800,220 1000,190" fill="none" stroke="#A7C7D9" strokeWidth="12" strokeLinecap="round" opacity="0.8" />
                  <path d="M 100,0 L 400,400" fill="none" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="8" />
                  <path d="M 0,100 L 800,320" fill="none" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="8" />
                  <text x="15%" y="60%" fill="rgba(30,74,56,0.3)" fontWeight="700" fontSize="14">KOTHRUD</text>
                  <text x="45%" y="30%" fill="rgba(30,74,56,0.3)" fontWeight="700" fontSize="14">DECCAN</text>
                  <text x="65%" y="75%" fill="rgba(30,74,56,0.3)" fontWeight="700" fontSize="14">SWARGATE</text>
                  <text x="75%" y="45%" fill="rgba(30,74,56,0.3)" fontWeight="700" fontSize="14">HADAPSAR</text>
                  <text x="65%" y="20%" fill="rgba(30,74,56,0.3)" fontWeight="700" fontSize="14">KALYANI NAGAR</text>
                </svg>

                {filteredRescues.map((rescue) => {
                  const isSelected = selectedRescue && selectedRescue.id === rescue.id;
                  const markerColor = 
                    rescue.status === "Rescued" ? "#2E7D32" :
                    rescue.status === "In Progress" ? "#FF6E14" :
                    rescue.status === "Assigned" ? "#E28704" : "#DC2626";

                  return (
                    <div
                      key={rescue.id}
                      onClick={() => setSelectedRescue(rescue)}
                      style={{
                        position: "absolute",
                        left: `${rescue.x || 35}%`,
                        top: `${rescue.y || 45}%`,
                        transform: "translate(-50%, -50%)",
                        cursor: "pointer",
                        zIndex: isSelected ? 10 : 5,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                      }}
                    >
                      {rescue.status !== "Rescued" && (
                        <div style={{
                          position: "absolute",
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          border: `2px solid ${markerColor}`,
                          animation: "pulse 1.8s infinite ease-out",
                          opacity: 0.6
                        }} />
                      )}
                      
                      <div style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        backgroundColor: markerColor,
                        border: "3px solid white",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                      }} />
                      
                      <div style={{
                        backgroundColor: "#1D1311",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        marginTop: "4px",
                        opacity: isSelected ? 1 : 0,
                        transition: "opacity 0.2s ease",
                        pointerEvents: "none",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
                      }}>
                        {rescue.id}: {rescue.animalType}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: "12px 20px", borderTop: "1px solid #E5DFD4", fontSize: "0.8rem", color: "#8C7B75", display: "flex", justifyContent: "space-between" }}>
                <span>📍 Interlocking mesh nodes based on reports</span>
                <span>Click pins to view timeline</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Active Inspection Details Panel */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {isLoading ? (
            <div className="skeleton" style={{ height: "420px", borderRadius: "26px" }} />
          ) : selectedRescue ? (
            <div className="ngo-inspection-card animate-fade-in">
              {/* Hero Banner Box */}
              <div className="ngo-inspection-hero">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", fontWeight: 900, color: "#A8652A", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    <span>🩺</span> ACTIVE INSPECTION
                  </div>
                  <div style={{
                    background: "#FEF3C7",
                    color: "#B45309",
                    border: "1px solid #FDE68A",
                    borderRadius: "9999px",
                    padding: "3px 12px",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em"
                  }}>
                    {selectedRescue.status}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  {/* Cartoon Avatar with Floating Red Heart */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      background: "#FFFFFF",
                      boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
                      border: "1.5px solid #FED7AA",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.75rem"
                    }}>
                      {selectedRescue.animalType.toLowerCase() === "cow" ? "🐮" : selectedRescue.animalType.toLowerCase() === "cat" ? "🐱" : "🐶"}
                    </div>
                    <div style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-4px",
                      fontSize: "0.95rem",
                      filter: "drop-shadow(0 2px 4px rgba(220,38,38,0.3))"
                    }}>
                      ❤️
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: 0, flex: 1 }}>
                    <h3 style={{
                      fontSize: "1.08rem",
                      fontWeight: 900,
                      color: "#1D1311",
                      margin: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      Case {selectedRescue.id}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#8C7B75", display: "flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={13} color="#E05D5D" /> {selectedRescue.location}
                      </span>
                      <span style={{
                        background: "#FFFFFF",
                        border: "1px solid #FED7AA",
                        borderRadius: "9999px",
                        padding: "2px 8px",
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        color: "#C2410C"
                      }}>
                        Zone A
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Case Stats Rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "0.88rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#8C7B75", fontWeight: 600 }}>Reported Species:</span>
                  <span style={{
                    background: "#FAF7F2",
                    border: "1px solid #EFEAE2",
                    borderRadius: "9999px",
                    padding: "3px 12px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "#1D1311",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <span>{selectedRescue.animalType.toLowerCase() === "cow" ? "🐮" : selectedRescue.animalType.toLowerCase() === "cat" ? "🐱" : "🐶"}</span>
                    {selectedRescue.animalType}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#8C7B75", fontWeight: 600 }}>Condition / Note:</span>
                  <span style={{
                    background: "#FEE2E2",
                    color: "#DC2626",
                    borderRadius: "9999px",
                    padding: "3px 12px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    maxWidth: "180px",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {selectedRescue.condition}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#8C7B75", fontWeight: 600 }}>Reported By:</span>
                  <span style={{ fontWeight: 800, color: "#1D1311", fontSize: "0.86rem" }}>
                    {selectedRescue.reportedBy} {selectedRescue.phone ? `(${selectedRescue.phone})` : ""}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#8C7B75", fontWeight: 600 }}>Assigned Unit:</span>
                  <span style={{
                    background: "#E6F9F0",
                    color: "#059669",
                    borderRadius: "9999px",
                    padding: "3px 14px",
                    fontSize: "0.82rem",
                    fontWeight: 800
                  }}>
                    {selectedRescue.assignedVolunteer === "None" ? "Rahul Mehta" : selectedRescue.assignedVolunteer}
                  </span>
                </div>
              </div>

              {/* Quick Actions Container */}
              <div style={{
                border: "1.5px dashed #FDBA74",
                borderRadius: "20px",
                background: "#FFFDFB",
                padding: "16px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.74rem", fontWeight: 900, letterSpacing: "0.06em", color: "#4A3E39" }}>
                    <span>🐾</span> QUICK ACTIONS
                  </div>
                  <div style={{
                    background: "#FFFFFF",
                    border: "1px solid #FED7AA",
                    borderRadius: "9999px",
                    padding: "2px 10px",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    color: "#B45309",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}>
                    <span>❤️</span> Rescue Hero
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {/* Mark Dispatch Commenced */}
                  <button
                    disabled={isUpdatingStatus || selectedRescue.status === "Rescued"}
                    onClick={async () => {
                      if (isUpdatingStatus) return;
                      setIsUpdatingStatus(true);
                      const name = selectedRescue.assignedVolunteer === "None" 
                        ? (volunteers[0] ? volunteers[0].name : "Rahul Mehta") 
                        : selectedRescue.assignedVolunteer;
                      try {
                        await updateRescueStatusPersisted(selectedRescue.id, "In Progress", { assignedVolunteer: name });
                        setSelectedRescue(prev => ({ ...prev, status: "In Progress", assignedVolunteer: name }));
                      } catch (err) {}
                      setIsUpdatingStatus(false);
                    }}
                    className="ngo-quick-action-btn-primary"
                    style={{
                      opacity: selectedRescue.status === "Rescued" ? 0.6 : 1,
                      cursor: selectedRescue.status === "Rescued" ? "not-allowed" : "pointer"
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>🚑✨</span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 800, lineHeight: 1.25 }}>
                      Mark Dispatch Commenced
                    </span>
                  </button>

                  {/* Confirm Animal Secured */}
                  <button
                    disabled={isUpdatingStatus || selectedRescue.status === "Rescued"}
                    onClick={async () => {
                      if (isUpdatingStatus) return;
                      setIsUpdatingStatus(true);
                      try {
                        await updateRescueStatusPersisted(selectedRescue.id, "Rescued");
                        setSelectedRescue(prev => ({ ...prev, status: "Rescued" }));
                      } catch (err) {}
                      setIsUpdatingStatus(false);
                    }}
                    className="ngo-quick-action-btn-secondary"
                    style={{
                      opacity: selectedRescue.status === "Rescued" ? 0.6 : 1,
                      cursor: selectedRescue.status === "Rescued" ? "not-allowed" : "pointer"
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>🐾💖</span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 800, lineHeight: 1.25 }}>
                      Confirm Animal Secured
                    </span>
                  </button>
                </div>
              </div>

              {/* Operation Activity Log */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.76rem", fontWeight: 900, letterSpacing: "0.06em", color: "#4A3E39" }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#FF6E14" }} />
                  <span>OPERATION ACTIVITY LOG</span>
                  <span>📋</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
                  {(selectedRescue.timeline && selectedRescue.timeline.length > 0) ? (
                    selectedRescue.timeline.map((item, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "12px" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <div style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            background: "#059669",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.68rem",
                            fontWeight: 900,
                            flexShrink: 0
                          }}>
                            ✓
                          </div>
                          {idx < selectedRescue.timeline.length - 1 && (
                            <div style={{ width: "2px", background: "#EAE3D8", flex: 1, minHeight: "26px", marginTop: "4px" }} />
                          )}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1, paddingBottom: idx < selectedRescue.timeline.length - 1 ? "8px" : "0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "0.86rem", fontWeight: 800, color: "#1D1311" }}>
                              {item.title.toLowerCase().includes("status") || item.title.toLowerCase().includes("assign")
                                ? `Unit ${selectedRescue.assignedVolunteer === "None" ? "Rahul Mehta" : selectedRescue.assignedVolunteer} Assigned`
                                : item.title}
                            </span>
                            {idx === 0 && (
                              <span style={{
                                background: "#E6F9F0",
                                color: "#059669",
                                borderRadius: "9999px",
                                padding: "2px 8px",
                                fontSize: "0.7rem",
                                fontWeight: 800
                              }}>
                                En Route
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: "0.76rem", color: "#8C7B75", fontWeight: 600 }}>
                            {item.time || "12:35 PM"} • {item.desc && !item.desc.toLowerCase().includes("coordinator") ? item.desc : "Direct Dispatcher Assignment"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ display: "flex", gap: "12px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          background: "#059669",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.68rem",
                          fontWeight: 900,
                          flexShrink: 0
                        }}>
                          ✓
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.86rem", fontWeight: 800, color: "#1D1311" }}>
                            Unit {selectedRescue.assignedVolunteer === "None" ? "Rahul Mehta" : selectedRescue.assignedVolunteer} Assigned
                          </span>
                          <span style={{
                            background: "#E6F9F0",
                            color: "#059669",
                            borderRadius: "9999px",
                            padding: "2px 8px",
                            fontSize: "0.7rem",
                            fontWeight: 800
                          }}>
                            En Route
                          </span>
                        </div>
                        <span style={{ fontSize: "0.76rem", color: "#8C7B75", fontWeight: 600 }}>
                          12:35 PM • Direct Dispatcher Assignment
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="ngo-inspection-card" style={{ padding: "50px 30px", alignItems: "center", textAlign: "center", gap: "12px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#FFF3E6", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF6E14" }}>
                <PawPrint size={24} />
              </div>
              <p style={{ fontSize: "1rem", fontWeight: 800, color: "#1D1311", margin: 0 }}>No case selected</p>
              <p style={{ fontSize: "0.85rem", color: "#8C7B75", margin: 0 }}>Click a row or a map pin to view case details.</p>
            </div>
          )}
        </div>

      </div>

      {/* ========================================================
          MODAL: LOG NEW RESCUE
      ======================================================== */}
      {showNewRescueModal && (
        <div className="ngo-modal-overlay" onClick={() => setShowNewRescueModal(false)}>
          <div className="ngo-modal-card animate-scale-up" style={{ maxWidth: "580px" }} onClick={(e) => e.stopPropagation()}>
            <div className="ngo-modal-header">
              <div className="ngo-modal-header-left">
                <div className="ngo-modal-icon-badge">
                  🚑
                </div>
                <div>
                  <h2 className="ngo-modal-title">Log Emergency Rescue</h2>
                  <p className="ngo-modal-subtitle">Record field dispatch coordinates and volunteer assignment.</p>
                </div>
              </div>
              <button className="ngo-modal-close-btn" onClick={() => setShowNewRescueModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="ngo-modal-body">
              <form id="new-rescue-form" onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label className="ngo-modal-label">Animal Species</label>
                    <select
                      className="ngo-modal-input"
                      value={formValues.animalType}
                      onChange={(e) => setFormValues({ ...formValues, animalType: e.target.value })}
                    >
                      <option>Dog</option>
                      <option>Cat</option>
                      <option>Cow</option>
                      <option>Bird</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="ngo-modal-label">Assigned Volunteer Dispatch</label>
                    <select
                      className="ngo-modal-input"
                      value={formValues.assignedVolunteer}
                      onChange={(e) => setFormValues({ ...formValues, assignedVolunteer: e.target.value })}
                    >
                      <option>None</option>
                      {volunteers.map(v => (
                        <option key={v.id} value={v.name}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="ngo-modal-label">Injury / Condition Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Spinal injury from vehicle collision"
                    className="ngo-modal-input"
                    style={{ borderColor: formErrors.condition ? "var(--accent-coral)" : "" }}
                    value={formValues.condition}
                    onChange={(e) => setFormValues({ ...formValues, condition: e.target.value })}
                  />
                  {formErrors.condition && <span className="form-error">{formErrors.condition}</span>}
                </div>

                <div>
                  <label className="ngo-modal-label">Rescue Location (Area, City)</label>
                  <input
                    type="text"
                    placeholder="e.g. Shivajinagar, Pune"
                    className="ngo-modal-input"
                    style={{ borderColor: formErrors.location ? "var(--accent-coral)" : "" }}
                    value={formValues.location}
                    onChange={(e) => setFormValues({ ...formValues, location: e.target.value })}
                  />
                  {formErrors.location && <span className="form-error">{formErrors.location}</span>}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "14px" }}>
                  <div>
                    <label className="ngo-modal-label">Reported By</label>
                    <input
                      type="text"
                      placeholder="e.g. Vikram Shinde"
                      className="ngo-modal-input"
                      style={{ borderColor: formErrors.reportedBy ? "var(--accent-coral)" : "" }}
                      value={formValues.reportedBy}
                      onChange={(e) => setFormValues({ ...formValues, reportedBy: e.target.value })}
                    />
                    {formErrors.reportedBy && <span className="form-error">{formErrors.reportedBy}</span>}
                  </div>
                  <div>
                    <label className="ngo-modal-label">Reporter Contact Phone</label>
                    <input
                      type="text"
                      placeholder="+91 XXXXX XXXXX"
                      className="ngo-modal-input"
                      style={{ borderColor: formErrors.phone ? "var(--accent-coral)" : "" }}
                      value={formValues.phone}
                      onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
                    />
                    {formErrors.phone && <span className="form-error">{formErrors.phone}</span>}
                  </div>
                </div>
              </form>
            </div>
            <div className="ngo-modal-footer">
              <button type="button" className="ngo-modal-btn-cancel" onClick={() => setShowNewRescueModal(false)}>
                Cancel
              </button>
              <button form="new-rescue-form" type="submit" className="ngo-modal-btn-primary">
                Create Dispatch Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RescueMgmt;
