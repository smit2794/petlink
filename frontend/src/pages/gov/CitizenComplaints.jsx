import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { MessageSquare, Upload, ClipboardList, CheckCircle2, AlertTriangle, X } from "lucide-react";

const CitizenComplaints = () => {
  const { complaints, addCitizenComplaint } = useApp();

  // Form states
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formData, setFormData] = useState({
    complainantName: "",
    contactInfo: "",
    animalType: "Dog",
    description: "",
    location: "Kothrud",
    photoPreview: ""
  });
  const [errors, setErrors] = useState({});
  const [filterStatus, setFilterStatus] = useState("All");

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertToBase64(file);
      setFormData({
        ...formData,
        photoPreview: base64
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const tempErrors = {};

    if (!isAnonymous && !formData.complainantName.trim()) {
      tempErrors.complainantName = "Name is required unless filed anonymously";
    }
    if (!isAnonymous && !formData.contactInfo.trim()) {
      tempErrors.contactInfo = "Contact number is required unless filed anonymously";
    }
    if (!formData.description.trim()) {
      tempErrors.description = "Situation description is required";
    }
    if (!formData.photoPreview) {
      tempErrors.photo = "A photo upload is required for stray validation checks";
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    // Call context to add complaint
    addCitizenComplaint({
      complainantName: isAnonymous ? "Anonymous Citizen" : formData.complainantName,
      contactInfo: isAnonymous ? "N/A" : formData.contactInfo,
      animalType: formData.animalType,
      description: formData.description,
      location: formData.location
    });

    // Reset Form
    setFormData({
      complainantName: "",
      contactInfo: "",
      animalType: "Dog",
      description: "",
      location: "Kothrud",
      photoPreview: ""
    });
    setIsAnonymous(false);
    setErrors({});
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    return filterStatus === "All" || c.status === filterStatus;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

      {/* Header Info */}
      <div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
          Citizen Complaint Intake Portal
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
          File animal cruelty cases or stray injury alerts. Reports automatically dispatch to nearest municipal NGO rescue units.
        </p>
      </div>

      {/* Grid: Form on Left, Ledger Table on Bottom/Right */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1.7fr", gap: "28px" }} className="animal-profile-grid">

        {/* Left Card: Cruelty / Stray Form */}
        <div className="card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--primary-color)", display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageSquare size={18} /> Cruelty & Injury Report Form
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* Anonymous Toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", backgroundColor: "#FCFAF6", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
              <input
                type="checkbox"
                id="anonymousCheck"
                checked={isAnonymous}
                onChange={(e) => {
                  setIsAnonymous(e.target.checked);
                  setErrors({});
                }}
              />
              <label htmlFor="anonymousCheck" style={{ fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>
                File anonymously (Hides name & contact information)
              </label>
            </div>

            {/* Reporter details (Conditional) */}
            {!isAnonymous && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="animate-slide-up">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Reporter name"
                    value={formData.complainantName}
                    onChange={(e) => setFormData({ ...formData, complainantName: e.target.value })}
                    style={{ borderColor: errors.complainantName ? "var(--accent-coral)" : "" }}
                  />
                  {errors.complainantName && <span className="form-error">{errors.complainantName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contact number"
                    value={formData.contactInfo}
                    onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                    style={{ borderColor: errors.contactInfo ? "var(--accent-coral)" : "" }}
                  />
                  {errors.contactInfo && <span className="form-error">{errors.contactInfo}</span>}
                </div>
              </div>
            )}

            {/* Animal Type & Location */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Stray Animal Class *</label>
                <select
                  className="form-control"
                  value={formData.animalType}
                  onChange={(e) => setFormData({ ...formData, animalType: e.target.value })}
                >
                  <option>Dog</option>
                  <option>Cat</option>
                  <option>Cow</option>
                  <option>Bird</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Reporting Ward Node *</label>
                <select
                  className="form-control"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                >
                  <option value="Kothrud">Kothrud Ward (Zone 3)</option>
                  <option value="Hadapsar">Hadapsar Ward (Zone 5)</option>
                  <option value="Swargate">Swargate Ward (Zone 1)</option>
                  <option value="Deccan">Deccan Gymkhana Ward (Zone 2)</option>
                  <option value="Aundh">Aundh Ward (Zone 4)</option>
                </select>
              </div>
            </div>

            {/* Description Textarea */}
            <div className="form-group">
              <label className="form-label">Description of Situation *</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Details of injury, starvation, trapping, or active animal cruelty incidents..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ borderColor: errors.description ? "var(--accent-coral)" : "" }}
              />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>

            {/* Image Preview Upload Slot */}
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">Evidence Photo Upload *</label>
              {formData.photoPreview ? (
                <div style={{ position: "relative", width: "90px", height: "90px" }}>
                  <img src={formData.photoPreview} alt="Outbreak" style={{ width: "90px", height: "90px", borderRadius: "10px", objectFit: "cover", border: "1px solid var(--border-color)" }} />
                  <button type="button" onClick={() => setFormData({ ...formData, photoPreview: "" })} style={{ position: "absolute", top: 0, right: 0, backgroundColor: "var(--accent-coral)", color: "white", border: 0, borderRadius: "50%", cursor: "pointer", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyCenter: "center", justifyContent: "center" }}>✕</button>
                </div>
              ) : (
                <label style={{ width: "90px", height: "90px", border: errors.photo ? "2px dashed var(--accent-coral)" : "2px dashed var(--border-color)", backgroundColor: "#FCFAF6", borderRadius: "10px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.72rem" }}>
                  <Upload size={16} />
                  <span>Upload</span>
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
                </label>
              )}
              {errors.photo && <span className="form-error" style={{ fontSize: "0.72rem" }}>{errors.photo}</span>}
            </div>

            <button type="submit" className="btn btn-primary" style={{ backgroundColor: "#5C6B73", borderColor: "#5C6B73", marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              File Incident Report
            </button>
          </form>
        </div>

        {/* Right Column: Ledger List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Ledger filters */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}>
              <ClipboardList size={18} color="var(--accent-gov)" /> Complaints Ledger
            </h3>

            <div style={{ display: "flex", gap: "6px" }}>
              {["All", "Assigned", "Resolved"].map((tab) => {
                const isSelected = filterStatus === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setFilterStatus(tab)}
                    style={{
                      border: 0,
                      backgroundColor: isSelected ? "#EFF3F6" : "transparent",
                      color: isSelected ? "#5C6B73" : "var(--text-muted)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: "20px",
                      cursor: "pointer",
                      border: isSelected ? "1px solid #C5D1DB" : "1px solid transparent"
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table Ledger list */}
          <div className="table-container" style={{ border: "1px solid var(--border-color)", borderRadius: "20px" }}>
            <table className="table" style={{ fontSize: "0.85rem" }}>
              <thead>
                <tr>
                  <th>Report Details</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Assigned Partner</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 800 }}>{c.description}</span>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>By: {c.complainantName} • {c.date}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{c.location}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${c.status === "Resolved" ? "adopted" : "shelter"}`} style={{ fontSize: "0.65rem" }}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700 }}>
                        {c.assignedNGO}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CitizenComplaints;
