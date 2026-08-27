import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { Calendar, MapPin, Users, Plus, Target, CheckCircle, Clock } from "lucide-react";

const DrivePlanner = () => {
  const { drives, volunteers, addDrive, logDriveAnimalCompletion } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    location: "",
    targetCount: "",
    selectedVolunteers: []
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const handleVolunteerToggle = (volId) => {
    setFormData((prev) => {
      const alreadySelected = prev.selectedVolunteers.includes(volId);
      if (alreadySelected) {
        return {
          ...prev,
          selectedVolunteers: prev.selectedVolunteers.filter((id) => id !== volId)
        };
      } else {
        return {
          ...prev,
          selectedVolunteers: [...prev.selectedVolunteers, volId]
        };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Drive name is required";
    if (!formData.date) tempErrors.date = "Event date is required";
    if (!formData.location.trim()) tempErrors.location = "Drive location is required";
    if (!formData.targetCount || isNaN(formData.targetCount) || parseInt(formData.targetCount) <= 0) {
      tempErrors.targetCount = "Must specify a positive target animal count";
    }
    if (formData.selectedVolunteers.length === 0) {
      tempErrors.volunteers = "Must assign at least one volunteer";
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    addDrive({
      name: formData.name,
      date: formData.date,
      location: formData.location,
      targetCount: parseInt(formData.targetCount),
      volunteers: formData.selectedVolunteers
    });

    setFormData({
      name: "",
      date: "",
      location: "",
      targetCount: "",
      selectedVolunteers: []
    });
    setErrors({});
    setShowModal(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Header section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
            Vaccination & Sterilization Drives
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
            Organize high-density stray immunization drives and animal welfare field surgeries across municipal wards.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Plus size={18} /> Schedule Drive
        </button>
      </div>

      {isLoading ? (
        // Skeleton Loaders
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="skeleton" style={{ height: "220px", borderRadius: "20px" }} />
          ))}
        </div>
      ) : (
        /* Drives Grid */
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="animal-profile-grid">
          {drives.map((drv) => {
            const progress = Math.min(Math.round((drv.completedCount / drv.targetCount) * 100), 100);
            return (
              <div
                key={drv.id}
                className="card animate-slide-up"
                style={{
                  padding: "24px 28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  borderLeft: `5px solid ${drv.status === "Completed" ? "#27AE60" : drv.status === "In Progress" ? "var(--accent-amber)" : "var(--primary-color)"}`
                }}
              >
                {/* Drive Title and status */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                      {drv.name}
                    </h3>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                      <Calendar size={12} /> Date: {drv.date}
                    </span>
                  </div>
                  <span className={`badge badge-${drv.status === "Completed" ? "adopted" : drv.status === "In Progress" ? "lost" : "shelter"}`} style={{ fontSize: "0.68rem" }}>
                    {drv.status}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <MapPin size={14} color="var(--primary-color)" />
                    <span>Location: <strong>{drv.location}</strong></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Users size={14} color="var(--primary-color)" />
                    <span>
                      Volunteers: <strong>
                        {volunteers
                          .filter((v) => drv.volunteers.includes(v.id))
                          .map((v) => v.name)
                          .join(", ") || "None assigned"}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginTop: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, marginBottom: "6px" }}>
                    <span>Progress: {drv.completedCount} / {drv.targetCount} animals</span>
                    <span>{progress}%</span>
                  </div>
                  <div style={{ height: "8px", backgroundColor: "#FCFAF6", borderRadius: "4px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                    <div style={{ width: `${progress}%`, height: "100%", backgroundColor: drv.status === "Completed" ? "#27AE60" : "var(--primary-color)", transition: "width 0.4s ease" }} />
                  </div>
                </div>

                {/* Log completed action */}
                {drv.status !== "Completed" && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => logDriveAnimalCompletion(drv.id)}
                    style={{
                      marginTop: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      borderColor: "var(--primary-color)",
                      color: "var(--primary-color)"
                    }}
                  >
                    <Target size={14} /> Log Logged Animal Target
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          MODAL: SCHEDULE DRIVE FORM
      ======================================================== */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} style={{ zIndex: 9999 }}>
          <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2 style={{ fontWeight: 800, color: "var(--primary-color)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={20} /> Schedule Welfare Drive
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Drive / Event Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Aundh Stray Vaccination Drive"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ borderColor: errors.name ? "var(--accent-coral)" : "" }}
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Scheduled Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{ borderColor: errors.date ? "var(--accent-coral)" : "" }}
                  />
                  {errors.date && <span className="form-error">{errors.date}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Target Count *</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 50"
                    value={formData.targetCount}
                    onChange={(e) => setFormData({ ...formData, targetCount: e.target.value })}
                    style={{ borderColor: errors.targetCount ? "var(--accent-coral)" : "" }}
                  />
                  {errors.targetCount && <span className="form-error">{errors.targetCount}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Welfare Site / Location *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Deccan Gymkhana Ward"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={{ borderColor: errors.location ? "var(--accent-coral)" : "" }}
                />
                {errors.location && <span className="form-error">{errors.location}</span>}
              </div>

              {/* Volunteers Multi-select Checklist */}
              <div className="form-group">
                <label className="form-label">Assign Volunteers *</label>
                <div style={{
                  maxHeight: "130px",
                  overflowY: "auto",
                  border: errors.volunteers ? "1px solid var(--accent-coral)" : "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "10px",
                  backgroundColor: "#FCFAF6",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}>
                  {volunteers.map((vol) => (
                    <label key={vol.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={formData.selectedVolunteers.includes(vol.id)}
                        onChange={() => handleVolunteerToggle(vol.id)}
                      />
                      <span>{vol.name} ({vol.status})</span>
                    </label>
                  ))}
                </div>
                {errors.volunteers && <span className="form-error">{errors.volunteers}</span>}
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DrivePlanner;
