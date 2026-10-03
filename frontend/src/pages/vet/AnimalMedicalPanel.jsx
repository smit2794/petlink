import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { 
  ArrowLeft, ShieldAlert, Award, FileText, Activity, Calendar, 
  Syringe, Sparkles, Upload, Download, Eye, FileSpreadsheet, PlusCircle, Trash2, CheckCircle, X
} from "lucide-react";

// Mini QR Code SVG Component
const MiniQR = ({ value }) => (
  <svg width="60" height="60" viewBox="0 0 100 100" style={{ backgroundColor: "#F7F5F0", padding: "4px", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
    <rect x="5" y="5" width="25" height="25" fill="var(--accent-coral)" stroke="white" strokeWidth="2" />
    <rect x="10" y="10" width="15" height="15" fill="white" />
    <rect x="13" y="13" width="9" height="9" fill="var(--accent-coral)" />
    <rect x="70" y="5" width="25" height="25" fill="var(--accent-coral)" stroke="white" strokeWidth="2" />
    <rect x="75" y="10" width="15" height="15" fill="white" />
    <rect x="78" y="78" width="9" height="9" fill="var(--accent-coral)" />
    <rect x="5" y="70" width="25" height="25" fill="var(--accent-coral)" stroke="white" strokeWidth="2" />
    <rect x="10" y="75" width="15" height="15" fill="white" />
    <rect x="13" y="78" width="9" height="9" fill="var(--accent-coral)" />
    <rect x="40" y="10" width="10" height="15" fill="var(--accent-coral)" />
    <rect x="40" y="30" width="15" height="5" fill="var(--accent-coral)" />
    <rect x="15" y="40" width="20" height="10" fill="var(--accent-coral)" />
    <rect x="45" y="45" width="15" height="15" fill="var(--accent-coral)" />
    <rect x="70" y="40" width="20" height="10" fill="var(--accent-coral)" />
    <rect x="40" y="70" width="15" height="20" fill="var(--accent-coral)" />
  </svg>
);

const AnimalMedicalPanel = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { animals, updateAnimal, updateAnimalPersisted, scheduleVetAppointment, scheduleVetAppointmentPersisted, addToast } = useApp();
  const { user } = useAuth();
  
  const pet = animals.find(p => p.id === petId);

  // Tab State
  const [activeTab, setActiveTab] = useState("diagnosis");

  // Form States
  const [diagnosisForm, setDiagnosisForm] = useState({ condition: "", notes: "", severity: "Moderate" });
  
  const [prescriptionItem, setPrescriptionItem] = useState({ medicineName: "", dosage: "", frequency: "Once Daily", duration: "5 Days" });
  const [prescriptionList, setPrescriptionList] = useState([]);
  const [showPrescriptionPreview, setShowPrescriptionPreview] = useState(false);
  const [savedPrescription, setSavedPrescription] = useState(null);

  const [vaccineForm, setVaccineForm] = useState({ vaccineType: "Anti-Rabies (Rabigen)", batchNo: "B-2026-X8", administratorName: user?.name || "Dr. Attending" });
  
  const [treatmentForm, setTreatmentForm] = useState({ procedure: "", surgeonName: user?.name || "Dr. Attending", notes: "", outcome: "Successful/Stable" });
  
  const [uploadedReports, setUploadedReports] = useState([
    { name: "Complete Blood Count (CBC) Report.pdf", date: "2026-07-10", flagged: false, followUpDate: "" }
  ]);
  const [flaggedDateMap, setFlaggedDateMap] = useState({});

  const [followupForm, setFollowupForm] = useState({ date: "", reason: "" });
  const [isSubmittingFollowup, setIsSubmittingFollowup] = useState(false);

  const [showCertificate, setShowCertificate] = useState(null); // 'vaccination' or 'sterilization'
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [isSavingVetAction, setIsSavingVetAction] = useState(false);
  const [dischargeSummary, setDischargeSummary] = useState("");
  const [sterilForm, setSterilForm] = useState({
    date: new Date().toISOString().split("T")[0],
    postOpNotes: "",
    recoveryStatus: "Excellent"
  });

  const [dropdownStatus, setDropdownStatus] = useState(pet ? pet.status : "");

  useEffect(() => {
    if (pet) {
      setDropdownStatus(pet.status);
    }
  }, [pet?.status]);

  if (!pet) {
    return (
      <div className="card" style={{ padding: "40px", textAlign: "center" }}>
        <h2 style={{ color: "var(--accent-coral)" }}>Patient File Not Found</h2>
        <p style={{ color: "var(--text-muted)", margin: "8px 0 20px" }}>The requested Animal ID does not exist in the shared database registry.</p>
        <button className="btn btn-primary" onClick={() => navigate("/vet/queue")}>Return to Queue</button>
      </div>
    );
  }

  // Permitted Vet Status Transitions
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (!newStatus) return;

    if (newStatus === "In Shelter" && pet.status === "Under Treatment") {
      setDischargeSummary("");
      setShowDischargeModal(true);
      return;
    }

    const updatedTimeline = [
      { date: new Date().toISOString().split("T")[0], title: `Clinic Transition: ${newStatus}`, description: "Status adjusted inside the Veterinary Medical Panel." },
      ...pet.timeline
    ];

    try {
      await updateAnimalPersisted(pet.id, {
        status: newStatus,
        timeline: updatedTimeline,
        lastUpdated: "Just now"
      });
    } catch (err) {}
  };

  const handleSterilSubmit = async (e) => {
    e.preventDefault();
    if (isSavingVetAction) return;
    setIsSavingVetAction(true);
    const updatedTimeline = [
      { 
        date: sterilForm.date, 
        title: "Sterilization (Spay/Neuter)", 
        description: `Procedure completed. Recovery: ${sterilForm.recoveryStatus}. Notes: ${sterilForm.postOpNotes}` 
      },
      ...pet.timeline
    ];

    try {
      await updateAnimalPersisted(pet.id, {
        timeline: updatedTimeline,
        healthSummary: {
          ...pet.healthSummary,
          sterilizationStatus: "Sterilized"
        }
      });
      addToast("Sterilization recorded — Government coverage stats updated!", "success");
      setShowCertificate("sterilization");
    } catch (err) {}
    setIsSavingVetAction(false);
  };

  // Helper: Append timeline event helper (persisted) — accepts optional extra fields to merge in the same save
  const appendTimelineEvent = async (title, desc, extraFields = {}) => {
    const updatedTimeline = [
      { date: new Date().toISOString().split("T")[0], title, description: desc },
      ...pet.timeline
    ];
    return await updateAnimalPersisted(pet.id, {
      timeline: updatedTimeline,
      lastUpdated: "Just now",
      ...extraFields
    });
  };

  // 1. Submit Diagnosis
  const handleDiagnosisSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosisForm.condition || isSavingVetAction) return;
    setIsSavingVetAction(true);

    try {
      await appendTimelineEvent(
        `Diagnosis Logged: ${diagnosisForm.condition}`,
        `Severity: ${diagnosisForm.severity}. Clinical Notes: ${diagnosisForm.notes}`,
        {
          healthSummary: {
            ...pet.healthSummary,
            treatmentNotes: `Diagnosis: ${diagnosisForm.condition}. Notes: ${diagnosisForm.notes}`
          }
        }
      );
      addToast(`Diagnosis logged for ${pet.name}`, "success");
      setDiagnosisForm({ condition: "", notes: "", severity: "Moderate" });
    } catch (err) {}
    setIsSavingVetAction(false);
  };

  // 2. Prescription Handlers
  const addPrescriptionLine = () => {
    if (!prescriptionItem.medicineName || !prescriptionItem.dosage) return;
    setPrescriptionList([...prescriptionList, prescriptionItem]);
    setPrescriptionItem({ medicineName: "", dosage: "", frequency: "Once Daily", duration: "5 Days" });
  };

  const removePrescriptionLine = (index) => {
    setPrescriptionList(prescriptionList.filter((_, idx) => idx !== index));
  };

  const savePrescription = async (e) => {
    e.preventDefault();
    if (prescriptionList.length === 0 || isSavingVetAction) return;
    setIsSavingVetAction(true);

    const summaryStr = prescriptionList.map(item => `${item.medicineName} (${item.dosage}, ${item.frequency})`).join(", ");

    try {
      await appendTimelineEvent("Prescription Authored", `Items: ${summaryStr}`);
      setSavedPrescription([...prescriptionList]);
      setShowPrescriptionPreview(true);
      setPrescriptionList([]);
      addToast(`Prescription saved for ${pet.name}`, "success");
    } catch (err) {}
    setIsSavingVetAction(false);
  };

  // 3. Submit Vaccination
  const handleVaccinationSubmit = async (e) => {
    e.preventDefault();
    if (isSavingVetAction) return;
    setIsSavingVetAction(true);

    const boosterDate = new Date();
    boosterDate.setFullYear(boosterDate.getFullYear() + 1);
    const boosterDateStr = boosterDate.toISOString().split("T")[0];

    try {
      await appendTimelineEvent(
        "Immunization Administered",
        `Vaccine: ${vaccineForm.vaccineType}. Batch No: ${vaccineForm.batchNo}. Next Due: ${boosterDateStr}`,
        {
          healthSummary: {
            ...pet.healthSummary,
            vaccinationStatus: "Fully Vaccinated",
            treatmentNotes: `Administered ${vaccineForm.vaccineType}. Booster scheduled for ${boosterDateStr}.`
          }
        }
      );
      addToast("Vaccination recorded — Parent notified, booster reminder scheduled, Government coverage stats updated", "success");
    } catch (err) {}
    setIsSavingVetAction(false);
  };

  // 4. Submit Surgery/Treatment
  const handleTreatmentSubmit = async (e) => {
    e.preventDefault();
    if (!treatmentForm.procedure || isSavingVetAction) return;
    setIsSavingVetAction(true);

    try {
      await appendTimelineEvent(`Surgery/Treatment Logged`, `Procedure: ${treatmentForm.procedure}. Outcome: ${treatmentForm.outcome}. Surgeon: ${treatmentForm.surgeonName}. Notes: ${treatmentForm.notes}`);
      addToast(`Treatment procedure saved for ${pet.name}`, "success");
      setTreatmentForm({ procedure: "", surgeonName: user?.name || "Dr. Attending", notes: "", outcome: "Successful/Stable" });
    } catch (err) {}
    setIsSavingVetAction(false);
  };

  // 5. Lab Reports Upload Simulation
  const handleLabUploadMock = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newFile = {
        name: file.name,
        date: new Date().toISOString().split("T")[0],
        flagged: false,
        followUpDate: ""
      };
      setUploadedReports([...uploadedReports, newFile]);
      appendTimelineEvent("Diagnostic Lab Uploaded", `File: ${file.name}`);
      addToast("Lab report uploaded successfully (mock file registry)", "success");
    }
  };

  const handleFlagReport = (idx, isFlagged) => {
    const updated = uploadedReports.map((item, i) => {
      if (i === idx) {
        return { 
          ...item, 
          flagged: isFlagged,
          followUpDate: isFlagged ? new Date().toISOString().split("T")[0] : ""
        };
      }
      return item;
    });
    setUploadedReports(updated);
    if (isFlagged) {
      addToast("Lab report flagged for follow-up observation", "warning");
    }
  };

  const handleUpdateReportDate = (idx, dateVal) => {
    const updated = uploadedReports.map((item, i) => {
      if (i === idx) {
        return { ...item, followUpDate: dateVal };
      }
      return item;
    });
    setUploadedReports(updated);
  };

  // 6. Schedule Follow-up
  const handleFollowupSubmit = async (e) => {
    e.preventDefault();
    if (!followupForm.date || !followupForm.reason || isSubmittingFollowup) return;

    setIsSubmittingFollowup(true);
    try {
      if (scheduleVetAppointmentPersisted) {
        await scheduleVetAppointmentPersisted(pet.id, pet.name, pet.photo, followupForm.reason, followupForm.date);
      } else {
        scheduleVetAppointment(pet.id, pet.name, pet.photo, followupForm.reason, followupForm.date);
      }
      await appendTimelineEvent("Clinic Follow-up Scheduled", `Date: ${followupForm.date}. Reason: ${followupForm.reason}`);
      setFollowupForm({ date: "", reason: "" });
    } catch (err) {
      console.error("Failed to schedule appointment:", err);
    } finally {
      setIsSubmittingFollowup(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Top Navigation Row */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", justifyContent: "space-between" }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate("/vet/queue")}>
          <ArrowLeft size={16} /> Back to Queue
        </button>
        <span className="badge" style={{ backgroundColor: "var(--accent-coral-light)", color: "var(--accent-coral)", border: "1px solid var(--accent-coral)" }}>
          EHR Reference File
        </span>
      </div>

      {/* READ-ONLY BIOLOGICAL PROFILE HEADER */}
      <div className="card" style={{
        display: "grid",
        gridTemplateColumns: "1fr 2.5fr",
        gap: "32px",
        padding: "24px 32px",
        backgroundColor: "#FFFFFF",
        border: "1px solid var(--border-color)",
        position: "relative"
      }} className="animal-profile-grid">
        
        {/* Photo Left Block */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
          <img 
            src={pet.photo} 
            alt={pet.name} 
            style={{
              width: "100%",
              height: "170px",
              objectFit: "cover",
              borderRadius: "16px",
              border: "1px solid var(--border-color)"
            }}
          />
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary-color)" }}>{pet.name}</h2>
            <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", fontWeight: 700 }}>ID: {pet.id}</span>
          </div>
        </div>

        {/* Biological/Identity Details Right Block (Strictly Read-Only) */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "20px" }}>
          
          {/* Read-Only Status Info */}
          <div>
            <h3 style={{ fontSize: "0.82rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "12px", letterSpacing: "0.05em" }}>
              Biological Summary (Read-Only)
            </h3>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "16px"
            }}>
              <div>
                <span style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)" }}>Species</span>
                <strong style={{ fontSize: "0.95rem" }}>{pet.species}</strong>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)" }}>Breed</span>
                <strong style={{ fontSize: "0.95rem" }}>{pet.breed}</strong>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)" }}>Gender</span>
                <strong style={{ fontSize: "0.95rem" }}>{pet.gender}</strong>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)" }}>Est. Age</span>
                <strong style={{ fontSize: "0.95rem" }}>{pet.age}</strong>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)" }}>Weight</span>
                <strong style={{ fontSize: "0.95rem" }}>{pet.weight}</strong>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)" }}>Custodian Node</span>
                <strong style={{ fontSize: "0.95rem" }}>{pet.custodian}</strong>
              </div>
            </div>
          </div>

          <hr style={{ border: 0, borderBottom: "1px solid var(--border-color)", margin: 0 }} />

          {/* Custody State Machine (Interactive Dropdown Control) */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
            <div>
              <span style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>Current Workflow Status</span>
              <span className={`badge badge-${pet.status === "Rescued" ? "rescued" : pet.status === "Under Treatment" ? "treatment" : "shelter"}`} style={{ fontSize: "0.75rem", marginTop: "4px" }}>
                {pet.status === "Rescued" ? "Awaiting Diagnosis" : pet.status === "Under Treatment" ? "In Treatment" : pet.status}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>Permitted State Transition</label>
              <select
                className="form-control"
                style={{ padding: "6px 12px", fontSize: "0.85rem", width: "220px", borderRadius: "30px", border: "1px solid var(--accent-coral)" }}
                value={dropdownStatus}
                onChange={(e) => {
                  const val = e.target.value;
                  setDropdownStatus(val);
                  handleStatusChange(e);
                }}
              >
                <option value="Rescued">Awaiting Diagnosis (Rescued)</option>
                <option value="Under Treatment">Hospitalize (Under Treatment)</option>
                <option value="In Shelter">Release (In Shelter)</option>
                <option value="Deceased">Log Fatality (Deceased)</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* CORE WORKFLOW TABS */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "28px" }} className="animal-profile-grid">
        
        {/* Left Side: Medical Entry Forms */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Tab Selection */}
          <div style={{
            display: "flex",
            borderBottom: "2px solid var(--border-color)",
            gap: "4px",
            overflowX: "auto",
            paddingBottom: "2px"
          }}>
            {[
              { id: "diagnosis", label: "Diagnosis", icon: ShieldAlert },
              { id: "prescription", label: "Prescribe", icon: FileText },
              { id: "vaccination", label: "Booster", icon: Syringe },
              { id: "sterilization", label: "Sterilization", icon: Award },
              { id: "treatment", label: "Surgery/Procedure", icon: Activity },
              { id: "labs", label: "Lab Reports", icon: FileSpreadsheet },
              { id: "certificates", label: "Certificates", icon: Award },
              { id: "followup", label: "Follow-up", icon: Calendar }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isTabActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 14px",
                    border: 0,
                    borderBottom: isTabActive ? "3px solid var(--accent-coral)" : "3px solid transparent",
                    backgroundColor: "transparent",
                    color: isTabActive ? "var(--text-main)" : "var(--text-muted)",
                    fontWeight: isTabActive ? 800 : 500,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all var(--transition-fast)"
                  }}
                >
                  <TabIcon size={14} color={isTabActive ? "var(--accent-coral)" : "var(--text-muted)"} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="card" style={{ minHeight: "360px" }}>
            
            {/* 1. DIAGNOSIS TAB */}
            {activeTab === "diagnosis" && (
              <form onSubmit={handleDiagnosisSubmit} className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Record Pathology Diagnosis</h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Identified Condition *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Parvovirus Positive, Left Femur Fracture..." 
                      className="form-control"
                      value={diagnosisForm.condition}
                      onChange={(e) => setDiagnosisForm({ ...diagnosisForm, condition: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Clinical Severity</label>
                    <select 
                      className="form-control"
                      value={diagnosisForm.severity}
                      onChange={(e) => setDiagnosisForm({ ...diagnosisForm, severity: e.target.value })}
                    >
                      <option>Mild</option>
                      <option>Moderate</option>
                      <option>Severe/Critical</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Vet Observations & Symptoms Notes</label>
                  <textarea 
                    placeholder="Enter secondary symptoms, pulse rate, temperature check data..." 
                    className="form-control" 
                    rows="3"
                    value={diagnosisForm.notes}
                    onChange={(e) => setDiagnosisForm({ ...diagnosisForm, notes: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start", backgroundColor: "var(--accent-coral)", borderColor: "var(--accent-coral)" }}>
                  Submit Diagnosis
                </button>
              </form>
            )}

            {/* 2. PRESCRIPTION TAB */}
            {activeTab === "prescription" && (
              <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Prescription Builder</h3>
                
                {/* Form to add single line item */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
                  gap: "12px",
                  alignItems: "flex-end",
                  backgroundColor: "#FCFAF6",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-color)"
                }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Medicine *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Meloxicam Syrup" 
                      className="form-control"
                      value={prescriptionItem.medicineName}
                      onChange={(e) => setPrescriptionItem({ ...prescriptionItem, medicineName: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Dosage *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 1.5 ml" 
                      className="form-control"
                      value={prescriptionItem.dosage}
                      onChange={(e) => setPrescriptionItem({ ...prescriptionItem, dosage: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Frequency</label>
                    <select 
                      className="form-control"
                      value={prescriptionItem.frequency}
                      onChange={(e) => setPrescriptionItem({ ...prescriptionItem, frequency: e.target.value })}
                    >
                      <option>Once Daily</option>
                      <option>Twice Daily</option>
                      <option>Thrice Daily</option>
                      <option>Every 8 Hours</option>
                    </select>
                  </div>
                  <button type="button" className="btn btn-secondary" onClick={addPrescriptionLine}>
                    <PlusCircle size={16} /> Add
                  </button>
                </div>

                {/* Added lines list */}
                {prescriptionList.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)" }}>Prescribed Treatments:</span>
                    {prescriptionList.map((item, idx) => (
                      <div key={idx} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 16px",
                        backgroundColor: "var(--secondary-light)",
                        borderRadius: "8px",
                        border: "1px solid var(--border-color)"
                      }}>
                        <div style={{ fontSize: "0.85rem" }}>
                          <strong>{item.medicineName}</strong> — {item.dosage} ({item.frequency})
                        </div>
                        <button type="button" className="btn btn-outline" style={{ padding: "4px", color: "var(--accent-coral)" }} onClick={() => removePrescriptionLine(idx)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button type="button" className="btn btn-primary" style={{ backgroundColor: "var(--accent-coral)", borderColor: "var(--accent-coral)", marginTop: "12px", alignSelf: "flex-start" }} onClick={savePrescription}>
                      Save & Print Prescription Sheet
                    </button>
                  </div>
                )}

                {/* Printable prescription card snippet */}
                {savedPrescription && showPrescriptionPreview && (
                  <div className="animate-scale-up" style={{
                    marginTop: "20px",
                    border: "2px solid var(--accent-coral)",
                    borderRadius: "14px",
                    padding: "20px",
                    backgroundColor: "#FCFAF6",
                    position: "relative"
                  }}>
                    <button 
                      onClick={() => setShowPrescriptionPreview(false)}
                      style={{ position: "absolute", top: "16px", right: "16px", border: 0, background: "none", cursor: "pointer", color: "var(--text-muted)" }}
                    >
                      <X size={16} />
                    </button>
                    <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--accent-coral)" }}>💊 RX PRESCRIPTION SHEET</span>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginTop: "4px" }}>PetLink Animal Care Clinic</h4>
                    </div>
                    <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span><strong>Patient:</strong> {pet.name} ({pet.id})</span>
                      <span><strong>Date Authorized:</strong> {new Date().toISOString().split("T")[0]}</span>
                      <hr style={{ border: 0, borderBottom: "1px solid var(--border-color)", margin: "4px 0" }} />
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {savedPrescription.map((line, idx) => (
                          <div key={idx}>• {line.medicineName} — {line.dosage} ({line.frequency})</div>
                        ))}
                      </div>
                      <div style={{ textAlign: "right", marginTop: "12px", fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                        Authorized Signature: {user?.name || "Attending Veterinarian"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. VACCINATION TAB */}
            {activeTab === "vaccination" && (
              <form onSubmit={handleVaccinationSubmit} className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Record Immunization Dose</h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Select Vaccine Booster</label>
                    <select 
                      className="form-control"
                      value={vaccineForm.vaccineType}
                      onChange={(e) => setVaccineForm({ ...vaccineForm, vaccineType: e.target.value })}
                    >
                      <option>Anti-Rabies (Rabigen)</option>
                      <option>Feline Triple (Feligen)</option>
                      <option>DHPP Booster (Dogs)</option>
                      <option>Parvovirus Monovalent</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Batch Code No.</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={vaccineForm.batchNo}
                      onChange={(e) => setVaccineForm({ ...vaccineForm, batchNo: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Administering Veterinarian</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={vaccineForm.administratorName}
                    onChange={(e) => setVaccineForm({ ...vaccineForm, administratorName: e.target.value })}
                    required
                  />
                </div>

                <div style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  backgroundColor: "var(--secondary-light)",
                  border: "1px solid var(--border-color)",
                  fontSize: "0.82rem",
                  color: "var(--text-muted)"
                }}>
                  ℹ️ Next due booster date will be automatically set to **1 Year from today** per municipal protocols.
                </div>

                <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start", backgroundColor: "var(--accent-coral)", borderColor: "var(--accent-coral)" }}>
                  Administer & Notify Parent
                </button>
              </form>
            )}

            {/* Sterilization Form */}
            {activeTab === "sterilization" && (
              <form onSubmit={handleSterilSubmit} className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Record Sterilization (Spay/Neuter) Surgery</h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Procedure Date *</label>
                    <input 
                      type="date" 
                      className="form-control"
                      value={sterilForm.date}
                      onChange={(e) => setSterilForm({ ...sterilForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Post-Op Recovery Rating</label>
                    <select 
                      className="form-control"
                      value={sterilForm.recoveryStatus}
                      onChange={(e) => setSterilForm({ ...sterilForm, recoveryStatus: e.target.value })}
                    >
                      <option>Excellent</option>
                      <option>Stable / Observing</option>
                      <option>Minor Inflammation</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Post-Op & Recovery Remarks *</label>
                  <textarea 
                    placeholder="Enter surgical remarks, suture lines count, and post-op care warnings..." 
                    className="form-control"
                    rows="3"
                    value={sterilForm.postOpNotes}
                    onChange={(e) => setSterilForm({ ...sterilForm, postOpNotes: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start", backgroundColor: "var(--accent-coral)", borderColor: "var(--accent-coral)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle size={14} /> Record & Generate Sterilization Cert
                </button>
              </form>
            )}

            {/* 4. TREATMENT / SURGERY TAB */}
            {activeTab === "treatment" && (
              <form onSubmit={handleTreatmentSubmit} className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Record Surgery or Treatment Procedure</h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Procedure / Operation Conducted *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Femur Orthopedic Spaying, Suture Cleaning..." 
                      className="form-control"
                      value={treatmentForm.procedure}
                      onChange={(e) => setTreatmentForm({ ...treatmentForm, procedure: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Intake Prognosis / Outcome</label>
                    <select 
                      className="form-control"
                      value={treatmentForm.outcome}
                      onChange={(e) => setTreatmentForm({ ...treatmentForm, outcome: e.target.value })}
                    >
                      <option>Successful/Stable</option>
                      <option>Awaiting Observation</option>
                      <option>Guarded Prognosis</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Surgical & Dressing Notes</label>
                  <textarea 
                    placeholder="Enter operation remarks, incision dressing details, post-op painkillers required..." 
                    className="form-control"
                    rows="3"
                    value={treatmentForm.notes}
                    onChange={(e) => setTreatmentForm({ ...treatmentForm, notes: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start", backgroundColor: "var(--accent-coral)", borderColor: "var(--accent-coral)" }}>
                  Log Procedure
                </button>
              </form>
            )}

            {/* 5. LAB REPORTS TAB */}
            {activeTab === "labs" && (
              <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Diagnostic Lab Reports</h3>
                
                {/* Mock File Uploader */}
                <div style={{
                  border: "2px dashed var(--border-color)",
                  padding: "20px",
                  borderRadius: "12px",
                  textAlign: "center",
                  backgroundColor: "#FCFAF6"
                }}>
                  <Upload size={24} style={{ color: "var(--accent-coral)", marginBottom: "8px" }} />
                  <span style={{ fontSize: "0.8rem", display: "block", color: "var(--text-muted)", marginBottom: "8px" }}>
                    Select CBC blood counts, urine profile PDFs to upload
                  </span>
                  <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
                    Browse Files
                    <input type="file" onChange={handleLabUploadMock} style={{ display: "none" }} />
                  </label>
                </div>

                {/* Uploaded Files Table */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                  {uploadedReports.map((report, idx) => (
                    <div key={idx} style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      padding: "12px 16px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "12px",
                      backgroundColor: report.flagged ? "var(--accent-coral-light)" : "white"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <FileText size={16} color="var(--accent-coral)" />
                          <span style={{ fontSize: "0.88rem", fontWeight: 800 }}>{report.name}</span>
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{report.date}</span>
                      </div>

                      {/* Flag for follow-up controls */}
                      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #ECE8E0", paddingTop: "8px", marginTop: "4px" }}>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", cursor: "pointer", fontWeight: 700, color: report.flagged ? "var(--accent-coral)" : "var(--text-muted)" }}>
                          <input 
                            type="checkbox" 
                            checked={report.flagged} 
                            onChange={(e) => handleFlagReport(idx, e.target.checked)} 
                          />
                          ⚠️ Flag for Follow-up Audit
                        </label>

                        {report.flagged && (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Due Date:</span>
                            <input 
                              type="date" 
                              className="form-control" 
                              style={{ padding: "2px 8px", fontSize: "0.75rem", width: "130px" }}
                              value={report.followUpDate}
                              onChange={(e) => handleUpdateReportDate(idx, e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. CERTIFICATES TAB */}
            {activeTab === "certificates" && (
              <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Official Clinic Certificates</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Generate and print authenticated vaccination or sterilization compliance certificates.
                </p>

                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "10px" }}>
                  <button className="btn btn-outline" style={{ flex: 1, borderColor: "var(--accent-coral)", color: "var(--accent-coral)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }} onClick={() => setShowCertificate("vaccination")}>
                    <Award size={16} /> Vaccination Cert
                  </button>
                  <button className="btn btn-outline" style={{ flex: 1, borderColor: "var(--accent-coral)", color: "var(--accent-coral)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }} onClick={() => setShowCertificate("sterilization")}>
                    <FileText size={16} /> Sterilization Cert
                  </button>
                </div>
              </div>
            )}

            {/* 7. FOLLOW-UP TAB */}
            {activeTab === "followup" && (
              <form onSubmit={handleFollowupSubmit} className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Schedule Post-Op follow-up</h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Audit / Review Date *</label>
                    <input 
                      type="date" 
                      className="form-control"
                      value={followupForm.date}
                      onChange={(e) => setFollowupForm({ ...followupForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Review Node</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value="Pune Central Clinic"
                      disabled
                      style={{ backgroundColor: "#ECE8E0", cursor: "not-allowed" }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason for Appointment *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Suture removal, checkup on swelling..." 
                    className="form-control"
                    value={followupForm.reason}
                    onChange={(e) => setFollowupForm({ ...followupForm, reason: e.target.value })}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isSubmittingFollowup}
                  style={{ alignSelf: "flex-start", backgroundColor: "var(--accent-coral)", borderColor: "var(--accent-coral)", opacity: isSubmittingFollowup ? 0.7 : 1 }}
                >
                  {isSubmittingFollowup ? "Scheduling..." : "Schedule follow-up"}
                </button>
              </form>
            )}

          </div>
        </div>

        {/* Right Side: Shared Activity Timeline View */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={18} color="var(--accent-coral)" /> Patient Clinical History
          </h3>
          
          <div className="card" style={{
            maxHeight: "530px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            padding: "20px 24px"
          }}>
            {/* Render timeline list items (reusing same style as NGO) */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              borderLeft: "2px dashed var(--border-color)",
              paddingLeft: "20px",
              marginLeft: "8px"
            }}>
              {pet.timeline.map((event, idx) => (
                <div key={idx} style={{ position: "relative" }}>
                  {/* Dot */}
                  <div style={{
                    position: "absolute",
                    left: "-25px",
                    top: "6px",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "var(--accent-coral)"
                  }} />
                  
                  {/* Text */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)" }}>
                      {event.date}
                    </span>
                    <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-main)" }}>
                      {event.title}
                    </span>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                      {event.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================
          MODAL: BEAUTIFUL PRINTABLE CERTIFICATE PREVIEW
      ======================================================== */}
      {showCertificate && (
        <div className="modal-overlay" onClick={() => setShowCertificate(null)} style={{ zIndex: 9999 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "580px", padding: 0, overflow: "hidden", border: "1px solid var(--border-color)" }}>
            
            {/* Header control */}
            <div style={{
              padding: "16px 24px",
              backgroundColor: "#FCFAF6",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--primary-color)" }}>
                📜 Document Certificate Sandbox Preview
              </span>
              <button 
                onClick={() => setShowCertificate(null)}
                style={{ background: "none", border: 0, cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Printable Area */}
            <div style={{
              padding: "40px",
              backgroundColor: "#FFFDF9", // parchment tone
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px"
            }}>
              {/* Border ring decoration */}
              <div style={{
                border: "4px double var(--border-color)",
                padding: "32px",
                width: "100%",
                borderRadius: "8px",
                position: "relative"
              }}>
                {/* Stamp watermark */}
                <div style={{
                  position: "absolute",
                  bottom: "20px",
                  right: "30px",
                  opacity: 0.15,
                  transform: "rotate(-12deg)"
                }}>
                  <Award size={90} color="var(--accent-coral)" />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <Award size={36} color="var(--accent-amber)" style={{ margin: "0 auto 8px" }} />
                  <span style={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                    Government of Maharashtra Welfare Registry
                  </span>
                  <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--primary-color)", fontFamily: "serif" }}>
                    {showCertificate === "vaccination" ? "CERTIFICATE OF VACCINATION" : "CERTIFICATE OF STERILIZATION"}
                  </h2>
                </div>

                <hr style={{ border: 0, borderBottom: "1px solid var(--border-color)", margin: "16px 0" }} />

                <div style={{ fontSize: "0.85rem", color: "var(--text-main)", lineHeight: 1.8, textAlign: "left" }}>
                  This documents and certifies that the animal details recorded herein:
                  <div style={{
                    margin: "12px 0",
                    padding: "10px 16px",
                    backgroundColor: "#FBF9F4",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)"
                  }}>
                    • <strong>Animal Name:</strong> {pet.name || "Desi Stray"} <br />
                    • <strong>Registration Tag ID:</strong> {pet.id} <br />
                    • <strong>Biological Type:</strong> {pet.species} ({pet.breed}) <br />
                    • <strong>Custodian Unit:</strong> {pet.custodian}
                  </div>
                  was clinically audited on <strong>{new Date().toISOString().split("T")[0]}</strong> at <strong>PetLink Animal Care Clinic</strong> by licensed practitioners and stands fully compliant with immunization frameworks.
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "32px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <MiniQR value={pet.id} />
                    <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", marginTop: "4px" }}>Verifiable QR Collar Tag</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "serif", fontSize: "0.9rem", fontStyle: "italic", borderBottom: "1px solid var(--text-muted)", paddingBottom: "2px" }}>
                      {user?.name || "Attending Veterinarian"}
                    </div>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 700 }}>Authorized Signatory</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Control */}
            <div style={{
              padding: "16px 24px",
              backgroundColor: "#FCFAF6",
              borderTop: "1px solid var(--border-color)",
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end"
            }}>
              <button className="btn btn-outline btn-sm" onClick={() => setShowCertificate(null)}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" style={{ backgroundColor: "var(--accent-coral)", borderColor: "var(--accent-coral)", display: "flex", alignItems: "center", gap: "6px" }} onClick={() => alert("Simulated certificate download completed.")}>
                <Download size={14} /> Download PDF
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Discharge Summary Modal */}
      {showDischargeModal && (
        <div className="modal-overlay" onClick={() => { setDropdownStatus(pet.status); setShowDischargeModal(false); }} style={{ zIndex: 9999 }}>
          <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px" }}>
            <div className="modal-header">
              <h2 style={{ fontWeight: 800, color: "var(--primary-color)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Activity size={20} /> Animal Discharge Summary
              </h2>
              <button className="modal-close" onClick={() => { setDropdownStatus(pet.status); setShowDischargeModal(false); }}>✕</button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (isSavingVetAction) return;
              setIsSavingVetAction(true);
              const updatedTimeline = [
                { 
                  date: new Date().toISOString().split("T")[0], 
                  title: "Clinic Discharge", 
                  description: `Discharged from clinic back to shelter custody. Notes: ${dischargeSummary}` 
                },
                ...pet.timeline
              ];
              try {
                await updateAnimalPersisted(pet.id, {
                  status: "In Shelter",
                  timeline: updatedTimeline,
                  lastUpdated: "Just now"
                });
                addToast("Patient discharged from clinical quarantine back to shelter", "success");
                setShowDischargeModal(false);
              } catch (err) {}
              setIsSavingVetAction(false);
            }} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                Log recovery notes and guidelines before releasing the animal from treatment back to the main shelter ward.
              </p>

              <div className="form-group">
                <label className="form-label">Discharge Summary & Care Guidelines *</label>
                <textarea 
                  className="form-control" 
                  rows="4" 
                  placeholder="e.g. Wound healed. Daily dressing complete. Restrict strenuous movements for 5 days..."
                  value={dischargeSummary}
                  onChange={(e) => setDischargeSummary(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setDropdownStatus(pet.status); setShowDischargeModal(false); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, backgroundColor: "var(--accent-coral)", borderColor: "var(--accent-coral)" }}>
                  Confirm Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AnimalMedicalPanel;
