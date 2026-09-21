import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { 
  Users, MapPin, Award, CheckCircle, ChevronLeft, 
  ChevronRight, Calendar, UserCheck, Plus, X, Trophy
} from "lucide-react";

const VolunteerMgmt = () => {
  const { volunteers, addVolunteerTask, addVolunteerTaskPersisted, updateVolunteerTaskStatus, updateVolunteerTaskStatusPersisted } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVol, setSelectedVol] = useState(null);
  
  // Leaderboard states
  const [leaderboardSortBy, setLeaderboardSortBy] = useState("rescues"); // "rescues" or "hours"
  
  // Modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (volunteers.length > 0) {
        setSelectedVol(volunteers[0]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectVolunteer = (vol) => {
    setSelectedVol(vol);
  };

  const currentVol = volunteers.find(v => v.id === (selectedVol && selectedVol.id)) || selectedVol;

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

  const moveTask = async (taskId, direction) => {
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
    return currentVol ? currentVol.tasks.filter(t => t.status === status) : [];
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

    return volunteers.map((vol) => {
      const stats = leaderboardMapping[vol.id] || { rescues: vol.tasks.filter(t => t.status === "Done").length, hours: vol.tasks.length * 5 };
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
    if (index === 0) return <span style={{ color: "#D4AF37", display: "flex", alignItems: "center", gap: "4px", fontWeight: 800 }}><Trophy size={14} /> Gold</span>;
    if (index === 1) return <span style={{ color: "#C0C0C0", display: "flex", alignItems: "center", gap: "4px", fontWeight: 800 }}><Trophy size={14} /> Silver</span>;
    if (index === 2) return <span style={{ color: "#CD7F32", display: "flex", alignItems: "center", gap: "4px", fontWeight: 800 }}><Trophy size={14} /> Bronze</span>;
    return <span style={{ color: "var(--text-muted)", paddingLeft: "4px" }}>#{index + 1}</span>;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
          Volunteer Field Operations
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Coordinate active handlers, assign street surveillance tasks, and audit volunteer timelines.
        </p>
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "28px" }}>
          <div className="skeleton" style={{ height: "380px", borderRadius: "var(--radius-lg)" }} />
          <div className="skeleton" style={{ height: "380px", borderRadius: "var(--radius-lg)" }} />
        </div>
      ) : (
        <>
          {/* VOLUNTEER INTERACTION BLOCK */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 2.2fr",
            gap: "28px"
          }} className="volunteer-split-grid">
            
            {/* LEFT: Volunteer directory cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Field Personnel</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {volunteers.map((vol) => {
                  const isSelected = currentVol && currentVol.id === vol.id;
                  return (
                    <div
                      key={vol.id}
                      className="card animate-slide-up"
                      onClick={() => handleSelectVolunteer(vol)}
                      style={{
                        padding: "16px 20px",
                        cursor: "pointer",
                        borderLeft: isSelected ? "5px solid var(--secondary-color)" : "5px solid transparent",
                        backgroundColor: isSelected ? "var(--secondary-light)" : "var(--card-bg)",
                        transition: "all var(--transition-fast)",
                        boxShadow: isSelected ? "var(--shadow-md)" : ""
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          backgroundColor: "var(--primary-color)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          flexShrink: 0
                        }}>
                          {vol.avatar}
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, minWidth: 0 }}>
                          <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {vol.name}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                            <MapPin size={10} /> {vol.lastCheckIn.split(" (")[0]}
                          </span>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <span className="badge badge-shelter" style={{ fontSize: "0.65rem", padding: "2px 8px" }}>
                            {vol.assignedTaskCount} Active
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: Active Selected Volunteer Details & Kanban Board */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {currentVol ? (
                <div className="card animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  
                  {/* Header Profile Info */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                      <div style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "50%",
                        backgroundColor: "var(--secondary-color)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.2rem",
                        fontWeight: 700
                      }}>
                        {currentVol.avatar}
                      </div>
                      <div>
                        <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>{currentVol.name}</h2>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>
                          ID: {currentVol.id} • Contact: {currentVol.contact}
                        </p>
                      </div>
                    </div>
                    
                    {/* Performance stats mini row */}
                    <div style={{ display: "flex", gap: "16px", backgroundColor: "var(--secondary-light)", padding: "10px 18px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)" }}>ATTENDANCE</span>
                        <strong style={{ fontSize: "0.95rem", color: "var(--primary-color)" }}>{currentVol.attendance}</strong>
                      </div>
                      <div style={{ width: "1px", backgroundColor: "var(--border-color)" }} />
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)" }}>RATING</span>
                        <strong style={{ fontSize: "0.95rem", color: "var(--accent-amber)", display: "flex", alignItems: "center", gap: "2px" }}>
                          ★ {currentVol.performanceScore}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <hr style={{ border: 0, borderBottom: "1px solid var(--border-color)", margin: 0 }} />

                  {/* Subheader Title + Assign Task btn */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Assigned Operations Kanban Board</h3>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowTaskModal(true)}>
                      <Plus size={14} /> Assign New Task
                    </button>
                  </div>

                  {/* KANBAN BOARD */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "16px",
                    backgroundColor: "#F5EFE6",
                    padding: "16px",
                    borderRadius: "16px"
                  }} className="kanban-grid">
                    
                    {/* Column 1: To Do */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #90A4AE", paddingBottom: "6px" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#546E7A", display: "flex", alignItems: "center", gap: "6px" }}>
                          📋 To Do
                        </span>
                        <span className="badge" style={{ backgroundColor: "#ECEFF1", color: "#546E7A", fontSize: "0.65rem", padding: "1px 6px" }}>
                          {getTasksByStatus("To Do").length}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minHeight: "150px" }}>
                        {getTasksByStatus("To Do").length === 0 ? (
                          <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "0.82rem", border: "2px dashed var(--border-color)", borderRadius: "10px" }}>All clear here</div>
                        ) : getTasksByStatus("To Do").map((task) => (
                          <div key={task.id} className="card" style={{ padding: "12px", border: "1px solid var(--border-color)", borderRadius: "12px", borderLeft: `4px solid ${task.priority === "High" ? "var(--accent-coral)" : task.priority === "Medium" ? "var(--accent-amber)" : "#90A4AE"}` }}>
                            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: task.priority === "High" ? "var(--accent-coral)" : "var(--text-muted)", textTransform: "uppercase" }}>
                              {task.priority} Priority
                            </span>
                            <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-main)", marginTop: "4px" }}>
                              {task.title}
                            </p>
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                              <button className="btn btn-outline" style={{ padding: "2px", borderRadius: "50%" }} onClick={() => moveTask(task.id, "forward")}>
                                <ChevronRight size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 2: In Progress */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid var(--accent-amber)", paddingBottom: "6px" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--accent-amber)", display: "flex", alignItems: "center", gap: "6px" }}>
                          ⚡ In Progress
                        </span>
                        <span className="badge" style={{ backgroundColor: "var(--accent-amber-light)", color: "var(--accent-amber)", fontSize: "0.65rem", padding: "1px 6px" }}>
                          {getTasksByStatus("In Progress").length}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minHeight: "150px" }}>
                        {getTasksByStatus("In Progress").length === 0 ? (
                          <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "0.82rem", border: "2px dashed var(--border-color)", borderRadius: "10px" }}>Nothing active yet</div>
                        ) : getTasksByStatus("In Progress").map((task) => (
                          <div key={task.id} className="card" style={{ padding: "12px", border: "1px solid var(--border-color)", borderRadius: "12px", borderLeft: "4px solid var(--accent-amber)" }}>
                            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: task.priority === "High" ? "var(--accent-coral)" : "var(--text-muted)", textTransform: "uppercase" }}>
                              {task.priority} Priority
                            </span>
                            <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-main)", marginTop: "4px" }}>
                              {task.title}
                            </p>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                              <button className="btn btn-outline" style={{ padding: "2px", borderRadius: "50%" }} onClick={() => moveTask(task.id, "backward")}>
                                <ChevronLeft size={14} />
                              </button>
                              <button className="btn btn-outline" style={{ padding: "2px", borderRadius: "50%" }} onClick={() => moveTask(task.id, "forward")}>
                                <ChevronRight size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 3: Done */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #2E7D32", paddingBottom: "6px" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#2E7D32", display: "flex", alignItems: "center", gap: "6px" }}>
                          ✓ Done
                        </span>
                        <span className="badge" style={{ backgroundColor: "#E8F5E9", color: "#2E7D32", fontSize: "0.65rem", padding: "1px 6px" }}>
                          {getTasksByStatus("Done").length}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minHeight: "150px" }}>
                        {getTasksByStatus("Done").length === 0 ? (
                          <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "0.82rem", border: "2px dashed var(--border-color)", borderRadius: "10px" }}>No completed tasks yet</div>
                        ) : getTasksByStatus("Done").map((task) => (
                          <div key={task.id} className="card" style={{ padding: "12px", border: "1px solid var(--border-color)", borderRadius: "12px", borderLeft: "4px solid #27AE60" }}>
                            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#27AE60", textTransform: "uppercase" }}>
                              Completed
                            </span>
                            <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textDecoration: "line-through", marginTop: "4px" }}>
                              {task.title}
                            </p>
                            <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "10px" }}>
                              <button className="btn btn-outline" style={{ padding: "2px", borderRadius: "50%" }} onClick={() => moveTask(task.id, "backward")}>
                                <ChevronLeft size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  <hr style={{ border: 0, borderBottom: "1px solid var(--border-color)", margin: 0 }} />

                  {/* Location Activity Check-ins */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>
                      Personnel GPS Check-in Timeline
                    </h4>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.85rem", padding: "12px 16px", backgroundColor: "var(--secondary-light)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                      <MapPin size={16} color="var(--accent-coral)" />
                      <div>
                        <strong>Last check in: </strong> 
                        <span>{currentVol.lastCheckIn}</span>
                      </div>
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

          {/* Volunteer Leaderboard / Recognition */}
          <div className="card animate-slide-up" style={{ marginTop: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
                <Trophy size={20} color="var(--accent-amber)" /> Volunteer Performance Leaderboard
              </h3>
              
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>Sort By:</span>
                <select 
                  className="form-control" 
                  style={{ width: "160px", padding: "6px 12px", fontSize: "0.8rem" }}
                  value={leaderboardSortBy}
                  onChange={(e) => setLeaderboardSortBy(e.target.value)}
                >
                  <option value="rescues">Rescues Assisted</option>
                  <option value="hours">Hours Logged</option>
                </select>
              </div>
            </div>

            <div className="table-container">
              <table className="custom-table" style={{ fontSize: "0.85rem" }}>
                <thead>
                  <tr>
                    <th style={{ width: "80px" }}>Rank</th>
                    <th>Volunteer Name</th>
                    <th>Active Region</th>
                    <th>Rescues Assisted</th>
                    <th>Hours Logged</th>
                    <th>Rating Score</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLeaderboard.map((vol, idx) => (
                    <tr key={vol.id}>
                      <td>{getRankBadge(idx)}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "var(--primary-color)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
                            {vol.avatar}
                          </div>
                          <span style={{ fontWeight: 700 }}>{vol.name}</span>
                        </div>
                      </td>
                      <td>{vol.lastCheckIn.split(" (")[0]}</td>
                      <td style={{ fontWeight: 800, color: "var(--primary-color)" }}>{vol.rescues} rescues</td>
                      <td style={{ fontWeight: 700 }}>{vol.hours} hrs</td>
                      <td style={{ fontWeight: 700, color: "var(--accent-amber)" }}>★ {vol.performanceScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          MODAL: NEW TASK ASSIGNMENT
      ======================================================== */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal-content animate-scale-up" style={{ padding: 0 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontWeight: 800, color: "var(--primary-color)", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.3rem" }}>📋</span> Assign Task to {currentVol.name}
              </h2>
              <button className="modal-close" onClick={() => setShowTaskModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
            <form id="vol-task-form" onSubmit={handleTaskSubmit}>
              <div className="form-group">
                <label className="form-label">Task Description</label>
                <input
                  type="text"
                  placeholder="e.g. Conduct a foster evaluation audit"
                  className="form-control"
                  style={{ borderColor: errors.title ? "var(--accent-coral)" : "" }}
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                {errors.title && <span className="form-error">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-control"
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </form>
            </div>{/* end modal-body */}
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowTaskModal(false)}>
                Cancel
              </button>
              <button form="vol-task-form" type="submit" className="btn btn-primary">
                Create & Assign Task
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .volunteer-split-grid {
            gridTemplateColumns: 1fr !important;
          }
          .kanban-grid {
            gridTemplateColumns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
};

export default VolunteerMgmt;
