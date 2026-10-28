import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { 
  Users, MapPin, Award, CheckCircle, ChevronLeft, 
  ChevronRight, Calendar, UserCheck, Plus, X, Trophy
} from "lucide-react";

const VolunteerMgmt = () => {
  const {
    volunteers,
    addVolunteerTask,
    addVolunteerTaskPersisted,
    addVolunteerPersisted,
    updateVolunteerTaskStatus,
    updateVolunteerTaskStatusPersisted
  } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVol, setSelectedVol] = useState(null);
  
  // Leaderboard states
  const [leaderboardSortBy, setLeaderboardSortBy] = useState("rescues"); // "rescues" or "hours"
  
  // Task Modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");
  const [errors, setErrors] = useState({});

  // Register Volunteer Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isSubmittingVolunteer, setIsSubmittingVolunteer] = useState(false);
  const [volFormData, setVolFormData] = useState({
    name: "",
    contact: "",
    role: "General Volunteer"
  });
  const [volFormErrors, setVolFormErrors] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (volunteers && volunteers.length > 0) {
        setSelectedVol(volunteers[0]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectVolunteer = (vol) => {
    setSelectedVol(vol);
  };

  const currentVol = (volunteers && volunteers.find(v => v.id === (selectedVol && selectedVol.id))) || selectedVol || (volunteers && volunteers[0]);

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!newTaskTitle) {
      setErrors({ title: "Task description is required" });
      return;
    }

    try {
      await addVolunteerTaskPersisted(currentVol.id, newTaskTitle, newTaskPriority);
    } catch (err) {
      return;
    }
    setShowTaskModal(false);
    setNewTaskTitle("");
    setNewTaskPriority("Medium");
    setErrors({});
  };

  const handleOpenRegisterModal = () => {
    setVolFormData({
      name: "",
      contact: "",
      role: "General Volunteer"
    });
    setVolFormErrors({});
    setShowRegisterModal(true);
  };

  const handleRegisterVolunteerSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingVolunteer) return;

    const errs = {};
    if (!volFormData.name || !volFormData.name.trim()) {
      errs.name = "Full name is required";
    }
    if (!volFormData.contact || !volFormData.contact.trim()) {
      errs.contact = "Contact information is required";
    }

    if (Object.keys(errs).length > 0) {
      setVolFormErrors(errs);
      return;
    }

    setIsSubmittingVolunteer(true);
    try {
      const createdVol = await addVolunteerPersisted({
        name: volFormData.name.trim(),
        contact: volFormData.contact.trim(),
        role: volFormData.role
      });
      setShowRegisterModal(false);
      setVolFormData({
        name: "",
        contact: "",
        role: "General Volunteer"
      });
      setVolFormErrors({});
      if (createdVol) {
        setSelectedVol(createdVol);
      }
    } catch (err) {
      // Error toast already displayed by context
    } finally {
      setIsSubmittingVolunteer(false);
    }
  };

  const moveTask = async (taskId, direction) => {
    if (!currentVol || !currentVol.tasks) return;
    const task = currentVol.tasks.find(t => t.id === taskId);
    if (!task) return;

    let newStatus = "";
    if (task.status === "To Do") {
      if (direction === "forward") newStatus = "In Progress";
    } else if (task.status === "In Progress") {
      if (direction === "forward") newStatus = "Done";
      if (direction === "backward") newStatus = "To Do";
    } else if (task.status === "Done") {
      if (direction === "backward") newStatus = "In Progress";
    }

    if (newStatus) {
      try {
        await updateVolunteerTaskStatusPersisted(currentVol.id, taskId, newStatus);
      } catch (err) {}
    }
  };

  const getTasksByStatus = (status) => {
    return currentVol && currentVol.tasks ? currentVol.tasks.filter(t => t.status === status) : [];
  };

  // Mock Leaderboard Metrics for existing volunteers
  const getLeaderboardData = () => {
    const leaderboardMapping = {
      "VOL-301": { rescues: 18, hours: 145 },
      "VOL-302": { rescues: 12, hours: 95 },
      "VOL-303": { rescues: 15, hours: 110 },
      "VOL-304": { rescues: 6, hours: 48 },
      "VOL-305": { rescues: 9, hours: 75 }
    };

    return (volunteers || []).map((vol) => {
      const stats = leaderboardMapping[vol.id] || { rescues: vol.tasks ? vol.tasks.filter(t => t.status === "Done").length : 0, hours: (vol.tasks ? vol.tasks.length : 1) * 5 };
      return {
        ...vol,
        rescues: stats.rescues,
        hours: stats.hours
      };
    });
  };

  const sortedLeaderboard = getLeaderboardData().sort((a, b) => {
    if (leaderboardSortBy === "rescues") {
      return b.rescues - a.rescues;
    } else {
      return b.hours - a.hours;
    }
  });

  const getRankBadge = (index) => {
    if (index === 0) return <span className="ngo-vol-rank-gold">🏆 Gold</span>;
    if (index === 1) return <span className="ngo-vol-rank-silver">🥈 Silver</span>;
    if (index === 2) return <span className="ngo-vol-rank-bronze">🥉 Bronze</span>;
    return <span style={{ color: "#9CA3AF", paddingLeft: "6px", fontWeight: 700 }}>#{index + 1}</span>;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* ========================================================
          PAGE HEADER WITH SQUAD COMMAND & FIELD STATUS
      ======================================================== */}
      <div className="ngo-vol-header-wrap">
        <div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#1F2937", letterSpacing: "-0.02em", margin: 0, display: "flex", alignItems: "center" }}>
            Volunteer Field Operations
            <span className="ngo-vol-squad-badge">🐾 Squad Command</span>
          </h1>
          <p style={{ color: "#6B7280", fontSize: "0.95rem", margin: "6px 0 0 0", fontWeight: 500 }}>
            Coordinate active handlers, assign street surveillance tasks, and audit volunteer timelines.
          </p>
        </div>

        <div className="ngo-vol-status-card">
          <div className="ngo-vol-squad-icon">🐕</div>
          <div>
            <div className="ngo-vol-squad-label">FIELD STATUS ✨</div>
            <div className="ngo-vol-squad-val">1 Squad Deployed</div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "310px 1fr", gap: "24px" }}>
          <div className="skeleton skeleton-card" style={{ height: "420px", borderRadius: "24px" }} />
          <div className="skeleton skeleton-card" style={{ height: "420px", borderRadius: "24px" }} />
        </div>
      ) : (
        <>
          {/* ========================================================
              VOLUNTEER INTERACTION BLOCK (2 COLUMNS)
          ======================================================== */}
          <div className="ngo-vol-grid">
            
            {/* LEFT COLUMN: FIELD PERSONNEL DIRECTORY */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="ngo-vol-list-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1F2937" }}>Field Personnel</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#9CA3AF", marginLeft: "6px" }}>
                    {(volunteers || []).length} Online
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{
                    backgroundColor: "#2E6F56",
                    borderColor: "#2E6F56",
                    color: "#FFFFFF",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    borderRadius: "10px",
                    padding: "6px 12px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(46, 111, 86, 0.2)"
                  }}
                  onClick={handleOpenRegisterModal}
                >
                  <Plus size={14} strokeWidth={2.5} /> Register Volunteer
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(volunteers || []).map((vol) => {
                  const isSelected = currentVol && currentVol.id === vol.id;
                  const activeTasksCount = vol.tasks ? vol.tasks.filter(t => t.status !== "Done").length : 0;
                  return (
                    <div
                      key={vol.id}
                      className={`ngo-vol-item ${isSelected ? "active" : ""}`}
                      onClick={() => handleSelectVolunteer(vol)}
                    >
                      {isSelected && <div className="ngo-vol-item-active-bar" />}
                      
                      <div className="ngo-vol-avatar-wrap">
                        <div className="ngo-vol-avatar">
                          👨‍⚕️
                        </div>
                        <div className="ngo-vol-online-badge">✔</div>
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#1F2937", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {vol.name}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#6B7280", display: "flex", alignItems: "center", gap: "4px", marginTop: "3px" }}>
                          <MapPin size={11} color="#EA580C" />
                          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {vol.lastCheckIn ? (vol.lastCheckIn.split(" (")[0].length > 17 ? vol.lastCheckIn.split(" (")[0].slice(0, 17) + "..." : vol.lastCheckIn.split(" (")[0]) : "Field Location"}
                          </span>
                        </div>
                      </div>

                      <span className="ngo-vol-badge-active">
                        {activeTasksCount} ACTIVE
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Need more handlers? Helper card */}
              <div className="ngo-vol-help-card">
                <span style={{ fontSize: "1.3rem" }}>🐾</span>
                <div>
                  <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#92400E", marginBottom: "4px" }}>
                    Need more handlers?
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#B45309", lineHeight: 1.45 }}>
                    Volunteers automatically sync their status once they log in through the PawSetu Mobile Paws companion app.
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ACTIVE SELECTED VOLUNTEER & KANBAN */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {currentVol ? (
                <div className="ngo-vol-detail-card">
                  
                  {/* Header Profile Info Bar */}
                  <div className="ngo-vol-detail-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "18px",
                        backgroundColor: "#134E4A",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.8rem",
                        flexShrink: 0
                      }}>
                        👨‍⚕️
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#1F2937", margin: 0 }}>
                            {currentVol.name}
                          </h2>
                          <span className="ngo-vol-status-pill">On Duty</span>
                        </div>
                        <p style={{ fontSize: "0.82rem", color: "#6B7280", margin: "4px 0 0 0", fontWeight: 500 }}>
                          ID: {currentVol.id} • Contact: {currentVol.contact}
                        </p>
                      </div>
                    </div>

                    {/* Attendance & Rating Metric Group */}
                    <div className="ngo-vol-metrics-group">
                      <div className="ngo-vol-metric-box">
                        <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#9CA3AF", letterSpacing: "0.5px" }}>ATTENDANCE</span>
                        <strong style={{ fontSize: "0.92rem", color: "#059669", fontWeight: 800, display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                          <CheckCircle size={13} /> {currentVol.attendance || "Present"}
                        </strong>
                      </div>
                      <div style={{ width: "1px", backgroundColor: "#EFEAE2" }} />
                      <div className="ngo-vol-metric-box">
                        <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#9CA3AF", letterSpacing: "0.5px" }}>RATING</span>
                        <strong style={{ fontSize: "0.92rem", color: "#EA580C", fontWeight: 800, display: "flex", alignItems: "center", gap: "3px", marginTop: "2px" }}>
                          ★ {currentVol.performanceScore || "5.0"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Kanban Title + Assign New Task Button */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1F2937", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                      Assigned Operations Kanban Board 📌
                    </h3>
                    <button
                      className="btn"
                      style={{
                        backgroundColor: "#FFF7ED",
                        border: "1px solid #FFEDD5",
                        color: "#C2410C",
                        borderRadius: "9999px",
                        padding: "8px 18px",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer"
                      }}
                      onClick={() => { setErrors({}); setShowTaskModal(true); }}
                    >
                      <Plus size={15} /> Assign New Task
                    </button>
                  </div>

                  {/* KANBAN BOARD 3 COLUMNS */}
                  <div className="ngo-vol-kanban-wrap">
                    <div className="ngo-vol-kanban-grid">
                      
                      {/* Column 1: To Do */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div className="ngo-vol-kanban-col-head" style={{ borderColor: "#CBD5E1" }}>
                          <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#64748B", display: "flex", alignItems: "center", gap: "6px" }}>
                            📋 To Do
                          </span>
                          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748B" }}>
                            {getTasksByStatus("To Do").length}
                          </span>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", minHeight: "180px" }}>
                          {getTasksByStatus("To Do").length === 0 ? (
                            <div className="ngo-vol-kanban-empty">
                              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#FAF5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
                                🐶💤
                              </div>
                              <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#374151" }}>All clear here</div>
                              <div style={{ fontSize: "0.78rem", color: "#9CA3AF" }}>No tasks queued</div>
                            </div>
                          ) : (
                            getTasksByStatus("To Do").map((task) => (
                              <div
                                key={task.id}
                                className="ngo-vol-task-card"
                                style={{
                                  borderLeft: `4px solid ${task.priority === "High" ? "#EF4444" : task.priority === "Low" ? "#F59E0B" : "#94A3B8"}`
                                }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{
                                    fontSize: "0.65rem",
                                    fontWeight: 800,
                                    borderRadius: "9999px",
                                    padding: "2px 8px",
                                    textTransform: "uppercase",
                                    background: task.priority === "High" ? "#FEE2E2" : "#FEF3C7",
                                    color: task.priority === "High" ? "#DC2626" : "#D97706"
                                  }}>
                                    {task.priority || "Normal"} Priority
                                  </span>
                                  <span style={{ fontSize: "0.9rem" }}>
                                    {task.priority === "High" ? "🚨" : "🐱"}
                                  </span>
                                </div>
                                <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1F2937", margin: "2px 0 0 0", lineHeight: 1.35 }}>
                                  {task.title}
                                </p>
                                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                                  <button className="ngo-vol-task-arrow-btn" onClick={() => moveTask(task.id, "forward")} title="Move to In Progress">
                                    <ChevronRight size={13} />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Column 2: In Progress */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div className="ngo-vol-kanban-col-head" style={{ borderColor: "#F59E0B" }}>
                          <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#D97706", display: "flex", alignItems: "center", gap: "6px" }}>
                            ⚡ In Progress
                          </span>
                          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#D97706" }}>
                            {getTasksByStatus("In Progress").length}
                          </span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", minHeight: "180px" }}>
                          {getTasksByStatus("In Progress").length === 0 ? (
                            <div className="ngo-vol-kanban-empty">
                              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#FAF5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
                                ⚡
                              </div>
                              <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#374151" }}>No active missions</div>
                              <div style={{ fontSize: "0.78rem", color: "#9CA3AF" }}>Tasks underway appear here</div>
                            </div>
                          ) : (
                            getTasksByStatus("In Progress").map((task, idx) => (
                              <div
                                key={task.id}
                                className="ngo-vol-task-card"
                                style={{
                                  borderLeft: `4px solid ${task.priority === "High" ? "#EF4444" : "#F59E0B"}`
                                }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{
                                    fontSize: "0.65rem",
                                    fontWeight: 800,
                                    borderRadius: "9999px",
                                    padding: "2px 8px",
                                    textTransform: "uppercase",
                                    background: task.priority === "High" ? "#FEE2E2" : "#FEF3C7",
                                    color: task.priority === "High" ? "#DC2626" : "#D97706"
                                  }}>
                                    {task.priority || "Medium"} Priority
                                  </span>
                                  <span style={{ fontSize: "0.9rem" }}>
                                    {task.priority === "High" ? "🚨" : "🐱"}
                                  </span>
                                </div>
                                <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1F2937", margin: "2px 0 0 0", lineHeight: 1.35 }}>
                                  {task.title}
                                </p>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                                  <button className="ngo-vol-task-arrow-btn" onClick={() => moveTask(task.id, "backward")} title="Move back to To Do">
                                    <ChevronLeft size={13} />
                                  </button>
                                  <button className="ngo-vol-task-arrow-btn" onClick={() => moveTask(task.id, "forward")} title="Move to Done">
                                    <ChevronRight size={13} />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Column 3: Done */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div className="ngo-vol-kanban-col-head" style={{ borderColor: "#10B981" }}>
                          <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#059669", display: "flex", alignItems: "center", gap: "6px" }}>
                            ✓ Done
                          </span>
                          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#059669" }}>
                            {getTasksByStatus("Done").length}
                          </span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", minHeight: "180px" }}>
                          {getTasksByStatus("Done").length === 0 ? (
                            <div className="ngo-vol-kanban-empty">
                              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#FAF5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
                                🏁
                              </div>
                              <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#374151" }}>No completed tasks</div>
                              <div style={{ fontSize: "0.78rem", color: "#9CA3AF" }}>Closed items will log here</div>
                            </div>
                          ) : (
                            getTasksByStatus("Done").map((task, idx) => (
                              <div
                                key={task.id}
                                className="ngo-vol-task-card"
                                style={{ borderLeft: "4px solid #10B981" }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{
                                    fontSize: "0.65rem",
                                    fontWeight: 800,
                                    borderRadius: "9999px",
                                    padding: "2px 8px",
                                    textTransform: "uppercase",
                                    background: "#D1FAE5",
                                    color: "#059669"
                                  }}>
                                    Completed
                                  </span>
                                  <span style={{ fontSize: "0.9rem" }}>
                                    {idx % 2 === 0 ? "💊" : "🩹🐕"}
                                  </span>
                                </div>
                                <p style={{
                                  fontSize: "0.85rem",
                                  fontWeight: 700,
                                  color: "#1F2937",
                                  margin: "2px 0 0 0",
                                  lineHeight: 1.35,
                                  textDecoration: "line-through"
                                }}>
                                  {task.title}
                                </p>
                                <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "4px" }}>
                                  <button className="ngo-vol-task-arrow-btn" onClick={() => moveTask(task.id, "backward")} title="Move back to In Progress">
                                    <ChevronLeft size={13} />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Personnel GPS Check-in Timeline */}
                  <div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#6B7280", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "8px" }}>
                      PERSONNEL GPS CHECK-IN TIMELINE
                    </div>
                    <div className="ngo-vol-gps-bar">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "#374151" }}>
                        <MapPin size={15} color="#EA580C" />
                        <strong>Last check in: </strong>
                        <span style={{ color: "#4B5563" }}>{currentVol.lastCheckIn || "Field Location Unknown (--)"}</span>
                      </div>
                      <button className="ngo-vol-telemetry-btn">
                        Live Radar Telemetry
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="card paw-bg" style={{ padding: "48px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "var(--secondary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--secondary-color)" }}>
                    <Users size={24} />
                  </div>
                  <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)" }}>No volunteer selected</p>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Choose a field handler from the directory to view their task board.</p>
                </div>
              )}
            </div>

          </div>

          {/* ========================================================
              VOLUNTEER PERFORMANCE LEADERBOARD
          ======================================================== */}
          <div className="ngo-vol-leaderboard-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#1F2937", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🏆</span> Volunteer Performance Leaderboard
              </h3>
              
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "0.82rem", color: "#6B7280", fontWeight: 700 }}>Sort By:</span>
                <select 
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E5E7EB",
                    borderRadius: "9999px",
                    padding: "6px 14px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "#1F2937",
                    outline: "none",
                    cursor: "pointer"
                  }}
                  value={leaderboardSortBy}
                  onChange={(e) => setLeaderboardSortBy(e.target.value)}
                >
                  <option value="rescues">Rescues Assisted</option>
                  <option value="hours">Hours Logged</option>
                </select>
              </div>
            </div>

            <div className="table-container" style={{ margin: 0 }}>
              <table className="custom-table" style={{ fontSize: "0.85rem", width: "100%", borderCollapse: "separate", borderSpacing: "0 6px" }}>
                <thead>
                  <tr style={{ background: "transparent" }}>
                    <th style={{ width: "90px", fontSize: "0.72rem", color: "#6B7280", fontWeight: 800, letterSpacing: "0.5px" }}>RANK</th>
                    <th style={{ fontSize: "0.72rem", color: "#6B7280", fontWeight: 800, letterSpacing: "0.5px" }}>VOLUNTEER NAME</th>
                    <th style={{ fontSize: "0.72rem", color: "#6B7280", fontWeight: 800, letterSpacing: "0.5px" }}>ACTIVE REGION</th>
                    <th style={{ fontSize: "0.72rem", color: "#6B7280", fontWeight: 800, letterSpacing: "0.5px" }}>RESCUES ASSISTED</th>
                    <th style={{ fontSize: "0.72rem", color: "#6B7280", fontWeight: 800, letterSpacing: "0.5px" }}>HOURS LOGGED</th>
                    <th style={{ fontSize: "0.72rem", color: "#6B7280", fontWeight: 800, letterSpacing: "0.5px" }}>RATING SCORE</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLeaderboard.map((vol, idx) => (
                    <tr key={vol.id} style={{ background: "#FFFFFF", borderRadius: "14px", transition: "all 0.15s ease" }}>
                      <td style={{ verticalAlign: "middle" }}>{getRankBadge(idx)}</td>
                      <td style={{ verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            backgroundColor: "#134E4A",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1rem",
                            flexShrink: 0
                          }}>
                            👨‍⚕️
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: "#1F2937", fontSize: "0.88rem" }}>{vol.name}</div>
                            <div style={{ fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 600 }}>{vol.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ verticalAlign: "middle", color: "#4B5563" }}>{vol.lastCheckIn ? vol.lastCheckIn.split(" (")[0] : "Field Location Unknown"}</td>
                      <td style={{ verticalAlign: "middle", fontWeight: 800, color: "#1F2937" }}>{vol.rescues} rescues</td>
                      <td style={{ verticalAlign: "middle", fontWeight: 700, color: "#4B5563" }}>{vol.hours} hrs</td>
                      <td style={{ verticalAlign: "middle", fontWeight: 800, color: "#EA580C" }}>
                        ★ {vol.performanceScore || "5.0"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Live Telemetry Info */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "14px", borderTop: "1px solid #F3F4F6", fontSize: "0.78rem", color: "#9CA3AF" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                🐾 Audited automatically by PawSetu Field Telemetry and GPS Logs
              </span>
              <span>Updated live</span>
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          UNIFIED MODAL: ASSIGN TASK TO VOLUNTEER
      ======================================================== */}
      {showTaskModal && (
        <div className="ngo-modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="ngo-modal-card animate-scale-up" style={{ maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
            <div className="ngo-modal-header">
              <div className="ngo-modal-header-left">
                <div className="ngo-modal-icon-badge">
                  📋
                </div>
                <div>
                  <h2 className="ngo-modal-title">Assign Task to {currentVol ? currentVol.name : "Volunteer"}</h2>
                  <p className="ngo-modal-subtitle">Dispatch custom mission or field tasks to handler timeline.</p>
                </div>
              </div>
              <button className="ngo-modal-close-btn" onClick={() => setShowTaskModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="ngo-modal-body">
              <form id="vol-task-form" onSubmit={handleTaskSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label className="ngo-modal-label">
                    Task Description * {errors.title && <span className="form-error">{errors.title}</span>}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Conduct a foster evaluation audit"
                    className="ngo-modal-input"
                    style={{ borderColor: errors.title ? "var(--accent-coral)" : "" }}
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="ngo-modal-label">Priority *</label>
                  <select
                    className="ngo-modal-input"
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="ngo-modal-footer">
              <button type="button" className="ngo-modal-btn-cancel" onClick={() => setShowTaskModal(false)}>
                Cancel
              </button>
              <button form="vol-task-form" type="submit" className="ngo-modal-btn-primary">
                Create & Assign Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          UNIFIED MODAL: REGISTER NEW VOLUNTEER
      ======================================================== */}
      {showRegisterModal && (
        <div className="ngo-modal-overlay" onClick={() => !isSubmittingVolunteer && setShowRegisterModal(false)}>
          <div className="ngo-modal-card animate-scale-up" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <div className="ngo-modal-header">
              <div className="ngo-modal-header-left">
                <div className="ngo-modal-icon-badge" style={{ backgroundColor: "#E0F2FE", color: "#0369A1" }}>
                  🤝
                </div>
                <div>
                  <h2 className="ngo-modal-title">Register New Volunteer</h2>
                  <p className="ngo-modal-subtitle">Enlist a field handler or clinical support volunteer to the squad.</p>
                </div>
              </div>
              <button
                className="ngo-modal-close-btn"
                disabled={isSubmittingVolunteer}
                onClick={() => setShowRegisterModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="ngo-modal-body">
              <form id="vol-register-form" onSubmit={handleRegisterVolunteerSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Full Name */}
                <div>
                  <label className="ngo-modal-label">
                    Full Name * {volFormErrors.name && <span className="form-error" style={{ color: "#DC2626", marginLeft: "6px" }}>{volFormErrors.name}</span>}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rohan Mehta"
                    className="ngo-modal-input"
                    style={{ borderColor: volFormErrors.name ? "var(--accent-coral)" : "" }}
                    value={volFormData.name}
                    onChange={(e) => setVolFormData({ ...volFormData, name: e.target.value })}
                    disabled={isSubmittingVolunteer}
                  />
                </div>

                {/* Contact Phone / Email */}
                <div>
                  <label className="ngo-modal-label">
                    Contact Phone / Email * {volFormErrors.contact && <span className="form-error" style={{ color: "#DC2626", marginLeft: "6px" }}>{volFormErrors.contact}</span>}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210 or rohan@pawsetu.org"
                    className="ngo-modal-input"
                    style={{ borderColor: volFormErrors.contact ? "var(--accent-coral)" : "" }}
                    value={volFormData.contact}
                    onChange={(e) => setVolFormData({ ...volFormData, contact: e.target.value })}
                    disabled={isSubmittingVolunteer}
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="ngo-modal-label">Assigned Role</label>
                  <select
                    className="ngo-modal-input"
                    value={volFormData.role}
                    onChange={(e) => setVolFormData({ ...volFormData, role: e.target.value })}
                    disabled={isSubmittingVolunteer}
                  >
                    <option value="Animal Handler">Animal Handler</option>
                    <option value="Rescue Driver">Rescue Driver</option>
                    <option value="Vet Assistant">Vet Assistant</option>
                    <option value="Foster Coordinator">Foster Coordinator</option>
                    <option value="Shelter Caretaker">Shelter Caretaker</option>
                    <option value="General Volunteer">General Volunteer</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="ngo-modal-footer">
              <button
                type="button"
                className="ngo-modal-btn-cancel"
                disabled={isSubmittingVolunteer}
                onClick={() => setShowRegisterModal(false)}
              >
                Cancel
              </button>
              <button
                form="vol-register-form"
                type="submit"
                className="ngo-modal-btn-primary"
                disabled={isSubmittingVolunteer}
                style={{
                  backgroundColor: "#2E6F56",
                  borderColor: "#2E6F56",
                  cursor: isSubmittingVolunteer ? "not-allowed" : "pointer",
                  opacity: isSubmittingVolunteer ? 0.7 : 1
                }}
              >
                {isSubmittingVolunteer ? "Registering..." : "Register Volunteer"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VolunteerMgmt;
