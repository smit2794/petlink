import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { 
  PlusCircle, Search, Table, Map, Navigation, 
  User, Calendar, Phone, Activity, X, MapPin
} from "lucide-react";

const RescueMgmt = () => {
  const { rescues, volunteers, addRescue, updateRescueStatus, updateRescueStatusPersisted } = useApp();
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
      // Auto select first rescue for timeline view
      if (rescues.length > 0) {
        setSelectedRescue(rescues[0]);
      }
    }, 500);
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Title Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-main)" }}>
            Rescue Dispatch Management
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Monitor reported street cases, dispatch ambulance units, and track rescue pipelines.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          {/* View Toggles */}
          <div style={{
            display: "flex",
            backgroundColor: "var(--border-color)",
            padding: "4px",
            borderRadius: "var(--radius-md)"
          }}>
            <button
              onClick={() => setViewMode("table")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                border: 0,
                borderRadius: "var(--radius-sm)",
                backgroundColor: viewMode === "table" ? "var(--card-bg)" : "transparent",
                color: viewMode === "table" ? "var(--primary-color)" : "var(--text-muted)",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              <Table size={16} /> Table View
            </button>
            <button
              onClick={() => setViewMode("map")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                border: 0,
                borderRadius: "var(--radius-sm)",
                backgroundColor: viewMode === "map" ? "var(--card-bg)" : "transparent",
                color: viewMode === "map" ? "var(--primary-color)" : "var(--text-muted)",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              <Map size={16} /> Map View
            </button>
          </div>

          <button className="btn btn-primary" onClick={() => setShowNewRescueModal(true)}>
            <PlusCircle size={18} /> + New Report
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", padding: "16px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", position: "relative", flex: 1, minWidth: "240px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search by ID, reporter, location, or injury..."
            className="form-control"
            style={{ width: "100%", paddingLeft: "36px" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["All", "New", "Assigned", "In Progress", "Rescued"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className="btn btn-sm"
              style={{
                backgroundColor: statusFilter === filter ? "var(--secondary-color)" : "var(--secondary-light)",
                color: statusFilter === filter ? "white" : "var(--primary-color)"
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Layout Splitter: Left Map/Table, Right Timeline Drawer */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2.4fr 1.3fr",
        gap: "28px"
      }} className="rescue-split-grid">

        {/* LEFT COLUMN: Map or Table */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {isLoading ? (
            <div className="skeleton" style={{ height: "400px", borderRadius: "var(--radius-lg)" }} />
          ) : viewMode === "table" ? (
            /* Table View */
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("id")}>ID</th>
                    <th>Animal Type</th>
                    <th>Condition / Notes</th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("location")}>Location</th>
                    <th>Reported By</th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("status")}>Status</th>
                    <th>Volunteer</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRescues.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                        No rescue cases found matching the filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRescues.map((rescue) => (
                      <tr 
                        key={rescue.id} 
                        onClick={() => setSelectedRescue(rescue)}
                        style={{ 
                          cursor: "pointer",
                          backgroundColor: selectedRescue && selectedRescue.id === rescue.id ? "var(--secondary-light)" : ""
                        }}
                      >
                        <td style={{ fontWeight: 700 }}>{rescue.id}</td>
                        <td style={{ fontWeight: 600 }}>{rescue.animalType}</td>
                        <td>{rescue.condition}</td>
                        <td>{rescue.location}</td>
                        <td>{rescue.reportedBy}</td>
                        <td>
                          <span className={`badge badge-${
                            rescue.status === "Rescued" ? "adopted" :
                            rescue.status === "In Progress" ? "treatment" :
                            rescue.status === "Assigned" ? "rescued" : "lost"
                          }`}>
                            {rescue.status}
                          </span>
                        </td>
                        <td>{rescue.assignedVolunteer === "None" ? "—" : rescue.assignedVolunteer}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Map View - Custom SVG Map representing Pune */
            <div className="card" style={{ padding: 0, overflow: "hidden", position: "relative", height: "420px", display: "flex", flexDirection: "column" }}>
              {/* Map background canvas */}
              <div style={{ flex: 1, backgroundColor: "#EAE5D9", position: "relative" }}>
                <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Rivers / Roads Mock */}
                  <path d="M 0,200 C 150,180 300,240 500,200 C 650,170 800,220 1000,190" fill="none" stroke="#B9D4E2" strokeWidth="24" strokeLinecap="round" opacity="0.6" />
                  <path d="M 0,200 C 150,180 300,240 500,200 C 650,170 800,220 1000,190" fill="none" stroke="#A7C7D9" strokeWidth="12" strokeLinecap="round" opacity="0.8" />
                  
                  {/* Major Highway (e.g. bypass) */}
                  <path d="M 100,0 L 400,400" fill="none" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="8" />
                  <path d="M 0,100 L 800,320" fill="none" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="8" />
                  
                  {/* Neighborhood Area Text Labels */}
                  <text x="15%" y="60%" fill="rgba(30,74,56,0.3)" fontWeight="700" fontSize="14">KOTHRUD</text>
                  <text x="45%" y="30%" fill="rgba(30,74,56,0.3)" fontWeight="700" fontSize="14">DECCAN</text>
                  <text x="65%" y="75%" fill="rgba(30,74,56,0.3)" fontWeight="700" fontSize="14">SWARGATE</text>
                  <text x="75%" y="45%" fill="rgba(30,74,56,0.3)" fontWeight="700" fontSize="14">HADAPSAR</text>
                  <text x="65%" y="20%" fill="rgba(30,74,56,0.3)" fontWeight="700" fontSize="14">KALYANI NAGAR</text>
                </svg>

                {/* Render Pinned Interactive Rescue Markers */}
                {filteredRescues.map((rescue) => {
                  const isSelected = selectedRescue && selectedRescue.id === rescue.id;
                  const markerColor = 
                    rescue.status === "Rescued" ? "#2E7D32" :
                    rescue.status === "In Progress" ? "#E05D5D" :
                    rescue.status === "Assigned" ? "#E28704" : "#E05D5D";

                  return (
                    <div
                      key={rescue.id}
                      onClick={() => setSelectedRescue(rescue)}
                      style={{
                        position: "absolute",
                        left: `${rescue.x}%`,
                        top: `${rescue.y}%`,
                        transform: "translate(-50%, -50%)",
                        cursor: "pointer",
                        zIndex: isSelected ? 10 : 5,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                      }}
                    >
                      {/* Pulse ring for active cases */}
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
                      
                      {/* Main Pin Dot */}
                      <div style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        backgroundColor: markerColor,
                        border: "3px solid white",
                        boxShadow: "var(--shadow-md)"
                      }} />
                      
                      {/* Hover Tooltip label */}
                      <div style={{
                        backgroundColor: "var(--primary-color)",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        marginTop: "4px",
                        opacity: isSelected ? 1 : 0,
                        transition: "opacity 0.2s ease",
                        pointerEvents: "none",
                        boxShadow: "var(--shadow-sm)"
                      }}>
                        {rescue.id}: {rescue.animalType}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border-color)", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", justifyBetween: "space-between", justifyContent: "space-between" }}>
                <span>📍 Interlocking mesh nodes based on reports</span>
                <span>Click pins to view timeline</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Action Timeline & Details Panel */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {isLoading ? (
            <div className="skeleton" style={{ height: "400px", borderRadius: "var(--radius-lg)" }} />
          ) : selectedRescue ? (
            <div className="card animate-fade-in" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Header Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--primary-color)" }}>
                    Case {selectedRescue.id}
                  </span>
                  <span className={`badge badge-${
                    selectedRescue.status === "Rescued" ? "adopted" :
                    selectedRescue.status === "In Progress" ? "treatment" :
                    selectedRescue.status === "Assigned" ? "rescued" : "lost"
                  }`}>
                    {selectedRescue.status}
                  </span>
                </div>
                
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <MapPin size={16} color="var(--accent-coral)" /> {selectedRescue.location}
                </h3>
              </div>

              <hr style={{ border: 0, borderBottom: "1px solid var(--border-color)" }} />

              {/* Case Stats info */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.9rem" }}>
                <div style={{ display: "flex", justifyBetween: "space-between", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Reported Species:</span>
                  <span style={{ fontWeight: 700, color: "var(--text-main)" }}>{selectedRescue.animalType}</span>
                </div>
                <div style={{ display: "flex", justifyBetween: "space-between", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Condition / Note:</span>
                  <span style={{ fontWeight: 600, color: "var(--accent-coral)", maxWidth: "160px", textAlign: "right" }}>{selectedRescue.condition}</span>
                </div>
                <div style={{ display: "flex", justifyBetween: "space-between", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Reported By:</span>
                  <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                    {selectedRescue.reportedBy} ({selectedRescue.phone})
                  </span>
                </div>
                <div style={{ display: "flex", justifyBetween: "space-between", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Assigned Unit:</span>
                  <span style={{ fontWeight: 700, color: "var(--secondary-color)" }}>
                    {selectedRescue.assignedVolunteer === "None" ? "Unassigned" : selectedRescue.assignedVolunteer}
                  </span>
                </div>
              </div>

              {/* Interactive Status Modifiers */}
              {selectedRescue.status !== "Rescued" && (
                <div style={{
                  backgroundColor: "var(--bg-color)",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Quick Actions
                  </span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {selectedRescue.status === "New" && (
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                        disabled={isUpdatingStatus}
                        onClick={async () => {
                          if (isUpdatingStatus) return;
                          setIsUpdatingStatus(true);
                          const name = volunteers[0] ? volunteers[0].name : "Rahul Mehta";
                          try {
                            await updateRescueStatusPersisted(selectedRescue.id, "Assigned", { assignedVolunteer: name });
                            setSelectedRescue(prev => ({ ...prev, status: "Assigned", assignedVolunteer: name }));
                          } catch (err) {}
                          setIsUpdatingStatus(false);
                        }}
                      >
                        Auto-Assign Unit
                      </button>
                    )}
                    {selectedRescue.status === "Assigned" && (
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1, backgroundColor: "var(--accent-coral)", borderColor: "var(--accent-coral)" }}
                        disabled={isUpdatingStatus}
                        onClick={async () => {
                          if (isUpdatingStatus) return;
                          setIsUpdatingStatus(true);
                          try {
                            await updateRescueStatusPersisted(selectedRescue.id, "In Progress");
                            setSelectedRescue(prev => ({ ...prev, status: "In Progress" }));
                          } catch (err) {}
                          setIsUpdatingStatus(false);
                        }}
                      >
                        Mark Dispatch Commenced
                      </button>
                    )}
                    {(selectedRescue.status === "Assigned" || selectedRescue.status === "In Progress") && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1 }}
                        disabled={isUpdatingStatus}
                        onClick={async () => {
                          if (isUpdatingStatus) return;
                          setIsUpdatingStatus(true);
                          try {
                            await updateRescueStatusPersisted(selectedRescue.id, "Rescued");
                            setSelectedRescue(prev => ({ ...prev, status: "Rescued" }));
                          } catch (err) {}
                          setIsUpdatingStatus(false);
                        }}
                      >
                        Confirm Animal Secured
                      </button>
                    )}
                  </div>
                </div>
              )}

              <hr style={{ border: 0, borderBottom: "1px solid var(--border-color)" }} />

              {/* Timeline Activity Log */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Activity size={14} /> Operation Activity Log
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", borderLeft: "2px dashed var(--border-color)", paddingLeft: "16px", marginLeft: "8px" }}>
                  {selectedRescue.timeline.map((item, idx) => (
                    <div key={idx} style={{ position: "relative" }}>
                      {/* Timeline dot */}
                      <div style={{
                        position: "absolute",
                        left: "-21px",
                        top: "4px",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "var(--secondary-color)"
                      }} />
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>
                          {item.time || selectedRescue.date}
                        </span>
                        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)" }}>
                          {item.title}
                        </span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          {item.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              No rescue case selected. Select from table or click pins on map.
            </div>
          )}
        </div>

      </div>

      {/* ========================================================
          MODAL: LOG NEW RESCUE
      ======================================================== */}
      {showNewRescueModal && (
        <div className="modal-overlay" onClick={() => setShowNewRescueModal(false)}>
          <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontWeight: 800, color: "var(--primary-color)" }}>🚑 Log Emergency Rescue</h2>
              <button className="modal-close" onClick={() => setShowNewRescueModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Animal Species</label>
                  <select
                    className="form-control"
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
                <div className="form-group">
                  <label className="form-label">Assigned Volunteer Dispatch</label>
                  <select
                    className="form-control"
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

              <div className="form-group">
                <label className="form-label">Injury / Condition Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Spinal injury from vehicle collision"
                  className="form-control"
                  style={{ borderColor: formErrors.condition ? "var(--accent-coral)" : "" }}
                  value={formValues.condition}
                  onChange={(e) => setFormValues({ ...formValues, condition: e.target.value })}
                />
                {formErrors.condition && <span className="form-error">{formErrors.condition}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Rescue Location (Area, City)</label>
                <input
                  type="text"
                  placeholder="e.g. Shivajinagar, Pune"
                  className="form-control"
                  style={{ borderColor: formErrors.location ? "var(--accent-coral)" : "" }}
                  value={formValues.location}
                  onChange={(e) => setFormValues({ ...formValues, location: e.target.value })}
                />
                {formErrors.location && <span className="form-error">{formErrors.location}</span>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Reported By</label>
                  <input
                    type="text"
                    placeholder="e.g. Vikram Shinde"
                    className="form-control"
                    style={{ borderColor: formErrors.reportedBy ? "var(--accent-coral)" : "" }}
                    value={formValues.reportedBy}
                    onChange={(e) => setFormValues({ ...formValues, reportedBy: e.target.value })}
                  />
                  {formErrors.reportedBy && <span className="form-error">{formErrors.reportedBy}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Reporter Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 XXXXX XXXXX"
                    className="form-control"
                    style={{ borderColor: formErrors.phone ? "var(--accent-coral)" : "" }}
                    value={formValues.phone}
                    onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
                  />
                  {formErrors.phone && <span className="form-error">{formErrors.phone}</span>}
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowNewRescueModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Create Dispatch Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RescueMgmt;
