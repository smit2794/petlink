import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { 
  Navigation, Dog, ShieldAlert, Syringe, Scissors, Heart,
  PlusCircle, UserPlus, ClipboardList, AlertTriangle, 
  MapPin, Image, Upload, Check, Search, Calendar, ChevronRight, X
} from "lucide-react";

// CountUp Component for Metric Animation
const CountUp = ({ target }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const end = target;
    const duration = 600; // ms
    const increment = Math.ceil(end / (duration / 25)) || 1;
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, 25);

    return () => clearInterval(timer);
  }, [target]);

  return <span>{count}</span>;
};

// Mini QR Code SVG Component specifically for previews inside form
const MiniQR = ({ value }) => (
  <svg width="70" height="70" viewBox="0 0 100 100" style={{ backgroundColor: "#F7F5F0", padding: "4px", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
    <rect x="5" y="5" width="25" height="25" fill="var(--primary-color)" stroke="white" strokeWidth="2" />
    <rect x="10" y="10" width="15" height="15" fill="white" />
    <rect x="13" y="13" width="9" height="9" fill="var(--primary-color)" />
    <rect x="70" y="5" width="25" height="25" fill="var(--primary-color)" stroke="white" strokeWidth="2" />
    <rect x="75" y="10" width="15" height="15" fill="white" />
    <rect x="78" y="78" width="9" height="9" fill="var(--primary-color)" />
    <rect x="5" y="70" width="25" height="25" fill="var(--primary-color)" stroke="white" strokeWidth="2" />
    <rect x="10" y="75" width="15" height="15" fill="white" />
    <rect x="13" y="78" width="9" height="9" fill="var(--primary-color)" />
    <rect x="40" y="10" width="10" height="15" fill="var(--primary-color)" />
    <rect x="40" y="30" width="15" height="5" fill="var(--primary-color)" />
    <rect x="15" y="40" width="20" height="10" fill="var(--primary-color)" />
    <rect x="45" y="45" width="15" height="15" fill="var(--primary-color)" />
    <rect x="70" y="40" width="20" height="10" fill="var(--primary-color)" />
    <rect x="40" y="70" width="15" height="20" fill="var(--primary-color)" />
  </svg>
);

const HomeOverview = () => {
  const { 
    animals, rescues, volunteers, inventory,
    addRescue, addAnimal, addRescuePersisted, assignVolunteerToRescueCase, addAnimalPersisted
  } = useApp();

  const [isLoading, setIsLoading] = useState(true);
  const [showRescueModal, setShowRescueModal] = useState(false);
  const [showAnimalModal, setShowAnimalModal] = useState(false);
  const [isSubmittingAnimal, setIsSubmittingAnimal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [isSubmittingRescue, setIsSubmittingRescue] = useState(false);

  // 1. Rescue Form States
  const [rescueForm, setRescueForm] = useState({
    animalType: "Dog", condition: "", location: "", reportedBy: "", phone: "", assignedVolunteer: "None"
  });
  const [rescuePhoto, setRescuePhoto] = useState(null);
  const [rescuePhotoPreview, setRescuePhotoPreview] = useState("");

  // 2. Animal Form States
  const [animalForm, setAnimalForm] = useState({
    name: "", species: "Dog", breed: "", gender: "Male", age: "", weight: "", 
    status: "In Shelter", custodian: "Pune Central Shelter", vaccinationStatus: "Not Vaccinated",
    sterilizationStatus: "Pending", treatmentNotes: ""
  });
  const [animalPhoto, setAnimalPhoto] = useState(null);
  const [animalPhotoPreview, setAnimalPhotoPreview] = useState("");
  const [generatedId, setGeneratedId] = useState("");

  // 3. Assign Task Form States
  const [taskForm, setTaskForm] = useState({
    volunteerId: "", rescueId: ""
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Pre-generate Animal ID when modal changes visibility
  useEffect(() => {
    if (showAnimalModal) {
      const nextNum = animals.length + 1;
      setGeneratedId(`PL-2026-${String(40 + nextNum).padStart(4, "0")}`);
    }
  }, [showAnimalModal, animals]);

  // Sync default Assign Volunteer inputs
  useEffect(() => {
    if (showTaskModal) {
      const unassigned = rescues.filter(r => r.assignedVolunteer === "None" || !r.assignedVolunteer);
      setTaskForm({
        volunteerId: volunteers[0] ? volunteers[0].id : "",
        rescueId: unassigned[0] ? unassigned[0].id : ""
      });
    }
  }, [showTaskModal, volunteers, rescues]);

  // Compute metrics
  const activeRescues = rescues.filter(r => r.status !== "Rescued").length;
  const animalsInShelter = animals.filter(a => a.status === "In Shelter" || a.status === "Available for Adoption").length;
  const criticalCases = animals.filter(a => a.status === "Under Treatment").length;
  const pendingVaccinations = animals.filter(a => a.healthSummary?.vaccinationStatus !== "Fully Vaccinated").length;
  const pendingSterilizations = animals.filter(a => a.healthSummary?.sterilizationStatus === "Pending").length;
  const recentAdoptions = animals.filter(a => a.status === "Adopted").length;

  const recentVolunteerActions = volunteers.flatMap(vol => 
    (vol.tasks || []).filter(t => t.status === "Done").map(task => ({
      volunteerName: vol.name,
      taskTitle: task.title,
      id: task.id
    }))
  ).slice(0, 4);

  // File Preview Handlers
  const handleRescuePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRescuePhoto(file);
      setRescuePhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleAnimalPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAnimalPhoto(file);
      setAnimalPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Mock GPS Location filler
  const handleUseCurrentLocation = () => {
    const mockLatLong = `${(18.5204 + (Math.random() - 0.5) * 0.05).toFixed(4)}° N, ${(73.8567 + (Math.random() - 0.5) * 0.05).toFixed(4)}° E`;
    setRescueForm(prev => ({ ...prev, location: `Swargate, Pune (${mockLatLong})` }));
  };

  // Forms Submissions
  const handleRescueSubmit = async (e) => {
    e.preventDefault();

    if (isSubmittingRescue) return;
    setIsSubmittingRescue(true);

    const tempErrors = {};
    if (!rescuePhotoPreview) tempErrors.photo = "A photo is required for rescue capture logs";
    if (!rescueForm.location) tempErrors.location = "Rescue location coordinates are required";
    if (!rescueForm.condition) tempErrors.condition = "Please supply injury status comments";
    if (!rescueForm.reportedBy) tempErrors.reportedBy = "Reporter name is required";
    if (!rescueForm.phone) tempErrors.phone = "Phone number is required";

    if (Object.keys(tempErrors).length > 0) {
  setErrors(tempErrors);
  setIsSubmittingRescue(false);
  return;
}

    try {
      await addRescuePersisted({
        ...rescueForm,
        photo: rescuePhotoPreview
      });
    } catch (err) {
      setIsSubmittingRescue(false);
      return;
    }

    setIsSubmittingRescue(false);
    setShowRescueModal(false);

    setShowRescueModal(false);
    setRescueForm({ animalType: "Dog", condition: "", location: "", reportedBy: "", phone: "", assignedVolunteer: "None" });
    setRescuePhoto(null);
    setRescuePhotoPreview("");
    setErrors({});
  };

  const handleAnimalSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingAnimal) return; // block duplicate submits
    setIsSubmittingAnimal(true);
    const tempErrors = {};
    if (!animalPhotoPreview) tempErrors.photo = "An intake profile photo is required";
    if (!animalForm.breed) tempErrors.breed = "Breed description is required";
    if (!animalForm.age) tempErrors.age = "Estimated age is required";
    if (!animalForm.weight) tempErrors.weight = "Estimated weight is required";

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    try {
      await addAnimalPersisted({
        ...animalForm,
        id: generatedId,
        photo: animalPhotoPreview
      });
    } catch (err) {
      setIsSubmittingAnimal(false);
      return; // error toast already shown, keep modal open so they can retry
    }

    setIsSubmittingAnimal(false);
    setShowAnimalModal(false);

    setAnimalForm({
      name: "", species: "Dog", breed: "", gender: "Male", age: "", weight: "", 
      status: "In Shelter", custodian: "Pune Central Shelter", vaccinationStatus: "Not Vaccinated",
      sterilizationStatus: "Pending", treatmentNotes: ""
    });
    setAnimalPhoto(null);
    setAnimalPhotoPreview("");
    setErrors({});
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    const tempErrors = {};
    if (!taskForm.volunteerId) tempErrors.volunteerId = "Please select a volunteer";
    if (!taskForm.rescueId) tempErrors.rescueId = "Please select an unassigned case";

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    assignVolunteerToRescueCase(taskForm.volunteerId, taskForm.rescueId);
    setShowTaskModal(false);
    setErrors({});
  };

  // Get active unassigned rescues list
  const unassignedRescues = rescues.filter(r => r.assignedVolunteer === "None" || !r.assignedVolunteer);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
      
      {/* Top Header Controls */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "20px"
      }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
            Welcome Back, Pooja
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", fontWeight: 500 }}>
            Unified command hub for shelters, rescues, and volunteer logistics.
          </p>
        </div>
        
        {/* Rounded Soft Primary/Secondary Actions */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => { setErrors({}); setShowRescueModal(true); }}>
            <PlusCircle size={18} /> + New Rescue
          </button>
          <button className="btn btn-secondary" onClick={() => { setErrors({}); setShowAnimalModal(true); }}>
            <Dog size={18} /> + Intake Profile
          </button>
          <button className="btn btn-outline" onClick={() => { setErrors({}); setShowTaskModal(true); }}>
            <UserPlus size={18} /> Assign Volunteer
          </button>
        </div>
      </div>

      {isLoading ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "24px" }}>
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="skeleton skeleton-card" style={{ height: "130px" }} />
            ))}
          </div>
          <div className="skeleton" style={{ height: "300px" }} />
        </>
      ) : (
        <>
          {/* REDESIGNED METRICS PANEL */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "24px"
          }}>
            
            {/* Card 1: Active Rescues */}
            <div className="card card-accent-amber animate-slide-up" style={{
              backgroundColor: "#FFFBF2",
              animationDelay: "50ms"
            }}>
              <div style={{ display: "flex", justifyBetween: "space-between", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(224, 144, 37, 0.12)",
                  color: "var(--accent-amber)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Navigation size={18} />
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>DISPATCH</span>
              </div>
              <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.1 }}>
                <CountUp target={activeRescues} />
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, marginTop: "4px" }}>Active Rescues</p>
              <span style={{ fontSize: "0.72rem", color: "#27AE60", fontWeight: 700, display: "block", marginTop: "8px" }}>
                ➔ +3 reported today
              </span>
            </div>

            {/* Card 2: Shelter Occupancy */}
            <div className="card card-accent-teal animate-slide-up" style={{
              backgroundColor: "#F4FAF7",
              animationDelay: "100ms"
            }}>
              <div style={{ display: "flex", justifyBetween: "space-between", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(38, 96, 72, 0.12)",
                  color: "var(--secondary-color)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Dog size={18} />
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>SHELTER</span>
              </div>
              <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.1 }}>
                <CountUp target={animalsInShelter} />
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, marginTop: "4px" }}>Animals In Shelter</p>
              <span style={{ fontSize: "0.72rem", color: "var(--secondary-color)", fontWeight: 700, display: "block", marginTop: "8px" }}>
                ➔ Capacity at {Math.floor((animalsInShelter/25)*100)}%
              </span>
            </div>

            {/* Card 3: Critical Cases */}
            <div className="card card-accent-coral animate-slide-up" style={{
              backgroundColor: "#FDF5F5",
              animationDelay: "150ms"
            }}>
              <div style={{ display: "flex", justifyBetween: "space-between", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(217, 83, 79, 0.12)",
                  color: "var(--accent-coral)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <ShieldAlert size={18} />
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-coral)", letterSpacing: "0.05em" }}>CRITICAL</span>
              </div>
              <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--accent-coral)", lineHeight: 1.1 }}>
                <CountUp target={criticalCases} />
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, marginTop: "4px" }}>Critical Operations</p>
              <span style={{ fontSize: "0.72rem", color: "var(--accent-coral)", fontWeight: 700, display: "block", marginTop: "8px" }}>
                ➔ Urgent clinical care
              </span>
            </div>

            {/* Card 4: Vaccinations */}
            <div className="card card-accent-blue-gray animate-slide-up" style={{
              backgroundColor: "#F4F8FA",
              animationDelay: "200ms"
            }}>
              <div style={{ display: "flex", justifyBetween: "space-between", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(41, 128, 185, 0.12)",
                  color: "#2980B9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Syringe size={18} />
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>HEALTH</span>
              </div>
              <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.1 }}>
                <CountUp target={pendingVaccinations} />
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, marginTop: "4px" }}>Pending Vaccines</p>
              <span style={{ fontSize: "0.72rem", color: "#2980B9", fontWeight: 700, display: "block", marginTop: "8px" }}>
                ➔ +8 scheduled soon
              </span>
            </div>

            {/* Card 5: Sterilizations */}
            <div className="card animate-slide-up" style={{
              backgroundColor: "#FAF5FA",
              borderLeft: "5px solid #8E24AA",
              animationDelay: "250ms"
            }}>
              <div style={{ display: "flex", justifyBetween: "space-between", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(142, 36, 170, 0.12)",
                  color: "#8E24AA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Scissors size={18} />
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>SURGERY</span>
              </div>
              <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.1 }}>
                <CountUp target={pendingSterilizations} />
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, marginTop: "4px" }}>Pending Sterils</p>
              <span style={{ fontSize: "0.72rem", color: "#8E24AA", fontWeight: 700, display: "block", marginTop: "8px" }}>
                ➔ ABC cycle active
              </span>
            </div>

            {/* Card 6: Adoptions */}
            <div className="card animate-slide-up" style={{
              backgroundColor: "#F4FAF5",
              borderLeft: "5px solid #27AE60",
              animationDelay: "300ms"
            }}>
              <div style={{ display: "flex", justifyBetween: "space-between", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(39, 174, 96, 0.12)",
                  color: "#27AE60",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Heart size={18} fill="#27AE60" />
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>HOMES</span>
              </div>
              <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.1 }}>
                <CountUp target={recentAdoptions} />
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, marginTop: "4px" }}>Adopted Pets</p>
              <span style={{ fontSize: "0.72rem", color: "#27AE60", fontWeight: 700, display: "block", marginTop: "8px" }}>
                ➔ +5 homed this week
              </span>
            </div>
          </div>

          {/* SPLIT SUBGRID FOR STOCKS AND VOLUNTEERS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" }}>
            
            {/* Storehouse Widget */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Reserves Storehouse</h3>
                <span className="badge badge-shelter">Central Hub</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {inventory.slice(0, 4).map((item) => {
                  const pct = Math.min(100, Math.floor((item.stock / (item.threshold * 2)) * 100));
                  const isLow = item.stock < item.threshold;
                  return (
                    <div key={item.id} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem" }}>
                        <span style={{ fontWeight: 700, color: "var(--text-main)" }}>{item.name}</span>
                        <span style={{ fontWeight: 800, color: isLow ? "var(--accent-coral)" : "var(--text-muted)" }}>
                          {item.stock} {item.unit} {isLow && "⚠️ Low"}
                        </span>
                      </div>
                      <div style={{ height: "10px", width: "100%", backgroundColor: "#ECE8E0", borderRadius: "5px", overflow: "hidden" }}>
                        <div style={{
                          width: `${pct}%`,
                          height: "100%",
                          backgroundColor: isLow ? "var(--accent-coral)" : "var(--secondary-color)",
                          transition: "width 0.4s ease"
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Volunteer activity feeds */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Recent Field Activities</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", flexGrow: 1 }}>
                {recentVolunteerActions.length === 0 ? (
                  <div className="empty-state" style={{ padding: "20px", border: "none" }}>
                    <div className="empty-state-icon" style={{ width: "48px", height: "48px", marginBottom: "12px" }}>
                      <ClipboardList size={20} />
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No tasks logged as resolved yet.</p>
                  </div>
                ) : (
                  recentVolunteerActions.map((action, idx) => (
                    <div key={action.id || idx} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      borderRadius: "14px",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "var(--secondary-light)"
                    }}>
                      <div style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        backgroundColor: "var(--primary-color)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.85rem",
                        fontWeight: 700
                      }}>
                        {action.volunteerName.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, minWidth: 0 }}>
                        <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {action.volunteerName}
                        </span>
                        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                          Resolved: {action.taskTitle}
                        </span>
                      </div>
                      <span className="badge badge-adopted" style={{ fontSize: "0.6rem", padding: "2px 8px" }}>
                        Done
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </>
      )}

      {/* ========================================================
          FIXED MODAL 1: + NEW RESCUE (WITH PHOTO & GPS)
      ======================================================== */}
      {showRescueModal && (
        <div className="modal-overlay" onClick={() => setShowRescueModal(false)}>
          <div className="modal-content animate-scale-up" style={{ maxWidth: "580px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontWeight: 800, color: "var(--primary-color)" }}>🚑 Log Emergency Dispatch Case</h2>
              <button className="modal-close" onClick={() => setShowRescueModal(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleRescueSubmit}>
              {/* Photo Upload with preview */}
              <div className="form-group">
                <label className="form-label">
                  Rescue Photo Capture * {errors.photo && <span className="form-error">{errors.photo}</span>}
                </label>
                <div style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "center",
                  padding: "16px",
                  borderRadius: "12px",
                  border: errors.photo ? "2px dashed var(--accent-coral)" : "2px dashed var(--border-color)",
                  backgroundColor: "#FCFAF6"
                }}>
                  {rescuePhotoPreview ? (
                    <img 
                      src={rescuePhotoPreview} 
                      alt="Preview" 
                      style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "10px", border: "1px solid var(--border-color)" }} 
                    />
                  ) : (
                    <div style={{ width: "90px", height: "90px", borderRadius: "10px", backgroundColor: "#EDE7DE", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                      <Image size={24} />
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>JPEG/PNG coordinates proof capture</span>
                    <label className="btn btn-secondary btn-sm" style={{ alignSelf: "flex-start", cursor: "pointer" }}>
                      <Upload size={14} /> Upload photo
                      <input type="file" accept="image/*" onChange={handleRescuePhotoChange} style={{ display: "none" }} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Location field with Current Location filler */}
              <div className="form-group">
                <label className="form-label">
                  Rescue Location * {errors.location && <span className="form-error">{errors.location}</span>}
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    placeholder="Enter street coordinates or address..."
                    className="form-control"
                    style={{ flex: 1, borderColor: errors.location ? "var(--accent-coral)" : "" }}
                    value={rescueForm.location}
                    onChange={(e) => setRescueForm({ ...rescueForm, location: e.target.value })}
                  />
                  <button type="button" className="btn btn-secondary" onClick={handleUseCurrentLocation} style={{ borderRadius: "12px" }}>
                    <MapPin size={16} /> GPS
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Species *</label>
                  <select
                    className="form-control"
                    value={rescueForm.animalType}
                    onChange={(e) => setRescueForm({ ...rescueForm, animalType: e.target.value })}
                  >
                    <option>Dog</option>
                    <option>Cat</option>
                    <option>Cow</option>
                    <option>Bird</option>
                    <option>Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Assign Handler Dispatch</label>
                  <select
                    className="form-control"
                    value={rescueForm.assignedVolunteer}
                    onChange={(e) => setRescueForm({ ...rescueForm, assignedVolunteer: e.target.value })}
                  >
                    <option>None</option>
                    {volunteers.map(v => (
                      <option key={v.id} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Rescue Notes / Injury Condition * {errors.condition && <span className="form-error">{errors.condition}</span>}
                </label>
                <textarea
                  placeholder="Describe status of injury, e.g., fractured leg, dehydration..."
                  className="form-control"
                  rows="2"
                  style={{ borderColor: errors.condition ? "var(--accent-coral)" : "" }}
                  value={rescueForm.condition}
                  onChange={(e) => setRescueForm({ ...rescueForm, condition: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">
                    Reported By * {errors.reportedBy && <span className="form-error">{errors.reportedBy}</span>}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Suresh Kumar"
                    className="form-control"
                    style={{ borderColor: errors.reportedBy ? "var(--accent-coral)" : "" }}
                    value={rescueForm.reportedBy}
                    onChange={(e) => setRescueForm({ ...rescueForm, reportedBy: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Contact Phone * {errors.phone && <span className="form-error">{errors.phone}</span>}
                  </label>
                  <input
                    type="text"
                    placeholder="+91 XXXXX XXXXX"
                    className="form-control"
                    style={{ borderColor: errors.phone ? "var(--accent-coral)" : "" }}
                    value={rescueForm.phone}
                    onChange={(e) => setRescueForm({ ...rescueForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowRescueModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmittingRescue}>
                  Create Rescue Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          FIXED MODAL 2: + NEW ANIMAL PROFILE (WITH AUTO-ID & QR)
      ======================================================== */}
      {showAnimalModal && (
        <div className="modal-overlay" onClick={() => setShowAnimalModal(false)}>
          <div className="modal-content animate-scale-up" style={{ maxWidth: "600px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontWeight: 800, color: "var(--primary-color)" }}>🐾 Register Direct Intake Profile</h2>
              <button className="modal-close" onClick={() => setShowAnimalModal(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAnimalSubmit}>
              {/* Pre-generated details display */}
              <div style={{
                display: "flex",
                gap: "20px",
                alignItems: "center",
                backgroundColor: "var(--secondary-light)",
                padding: "16px",
                borderRadius: "14px",
                border: "1px solid rgba(38,96,72,0.1)",
                marginBottom: "20px"
              }}>
                <MiniQR value={generatedId} />
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--secondary-color)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Automated System Tag Assignment
                  </span>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary-color)", margin: "2px 0" }}>
                    Preview ID: {generatedId}
                  </h3>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Final tag ID is generated and confirmed after you save.
                  </p>
                </div>
              </div>

              {/* Photo file picker with preview */}
              <div className="form-group">
                <label className="form-label">
                  Intake Profile Picture * {errors.photo && <span className="form-error">{errors.photo}</span>}
                </label>
                <div style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "center",
                  padding: "16px",
                  borderRadius: "12px",
                  border: errors.photo ? "2px dashed var(--accent-coral)" : "2px dashed var(--border-color)",
                  backgroundColor: "#FCFAF6"
                }}>
                  {animalPhotoPreview ? (
                    <img 
                      src={animalPhotoPreview} 
                      alt="Intake Preview" 
                      style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "10px", border: "1px solid var(--border-color)" }} 
                    />
                  ) : (
                    <div style={{ width: "90px", height: "90px", borderRadius: "10px", backgroundColor: "#EDE7DE", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                      <Image size={24} />
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Clear capture of animal features</span>
                    <label className="btn btn-secondary btn-sm" style={{ alignSelf: "flex-start", cursor: "pointer" }}>
                      <Upload size={14} /> Upload image
                      <input type="file" accept="image/*" onChange={handleAnimalPhotoChange} style={{ display: "none" }} />
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Animal Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Moti (leave empty if unnamed)"
                    className="form-control"
                    value={animalForm.name}
                    onChange={(e) => setAnimalForm({ ...animalForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Species</label>
                  <select
                    className="form-control"
                    value={animalForm.species}
                    onChange={(e) => setAnimalForm({ ...animalForm, species: e.target.value })}
                  >
                    <option>Dog</option>
                    <option>Cat</option>
                    <option>Cow</option>
                    <option>Bird</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">
                    Breed * {errors.breed && <span className="form-error">{errors.breed}</span>}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Indie"
                    className="form-control"
                    style={{ borderColor: errors.breed ? "var(--accent-coral)" : "" }}
                    value={animalForm.breed}
                    onChange={(e) => setAnimalForm({ ...animalForm, breed: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Estimated Age * {errors.age && <span className="form-error">{errors.age}</span>}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1 year"
                    className="form-control"
                    style={{ borderColor: errors.age ? "var(--accent-coral)" : "" }}
                    value={animalForm.age}
                    onChange={(e) => setAnimalForm({ ...animalForm, age: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Weight * {errors.weight && <span className="form-error">{errors.weight}</span>}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 12 kg"
                    className="form-control"
                    style={{ borderColor: errors.weight ? "var(--accent-coral)" : "" }}
                    value={animalForm.weight}
                    onChange={(e) => setAnimalForm({ ...animalForm, weight: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-control"
                    value={animalForm.gender}
                    onChange={(e) => setAnimalForm({ ...animalForm, gender: e.target.value })}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Unknown</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Starting Status</label>
                  <input
                    type="text"
                    className="form-control"
                    value="In Shelter"
                    disabled
                    style={{ backgroundColor: "#F2EFE9", cursor: "not-allowed" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Vaccination Status</label>
                  <select
                    className="form-control"
                    value={animalForm.vaccinationStatus}
                    onChange={(e) => setAnimalForm({ ...animalForm, vaccinationStatus: e.target.value })}
                  >
                    <option>Not Vaccinated</option>
                    <option>Pending Second Dose</option>
                    <option>Fully Vaccinated</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Sterilization Status</label>
                  <select
                    className="form-control"
                    value={animalForm.sterilizationStatus}
                    onChange={(e) => setAnimalForm({ ...animalForm, sterilizationStatus: e.target.value })}
                  >
                    <option>Pending</option>
                    <option>Sterilized</option>
                    <option>Not Applicable</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Direct Intake Assessment Notes</label>
                <textarea
                  placeholder="Note down veterinary assessment comments, skin condition notes..."
                  className="form-control"
                  rows="2"
                  value={animalForm.treatmentNotes}
                  onChange={(e) => setAnimalForm({ ...animalForm, treatmentNotes: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAnimalModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmittingAnimal}>
                  {isSubmittingAnimal ? "Saving..." : "Create Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          FIXED MODAL 3: ASSIGN VOLUNTEER TASK
      ======================================================== */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal-content animate-scale-up" style={{ maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontWeight: 800, color: "var(--primary-color)" }}>📋 Assign Field Volunteer</h2>
              <button className="modal-close" onClick={() => setShowTaskModal(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleTaskSubmit}>
              {/* Select Volunteer dropdown */}
              <div className="form-group">
                <label className="form-label">
                  Select Field Volunteer * {errors.volunteerId && <span className="form-error">{errors.volunteerId}</span>}
                </label>
                <select
                  className="form-control"
                  style={{ borderColor: errors.volunteerId ? "var(--accent-coral)" : "" }}
                  value={taskForm.volunteerId}
                  onChange={(e) => setTaskForm({ ...taskForm, volunteerId: e.target.value })}
                >
                  <option value="">-- Choose Field Personnel --</option>
                  {volunteers.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.tasks.filter(t => t.status !== "Done").length} active cases)
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Unassigned Rescue Case dropdown */}
              <div className="form-group">
                <label className="form-label">
                  Select Unassigned Rescue Case * {errors.rescueId && <span className="form-error">{errors.rescueId}</span>}
                </label>
                <select
                  className="form-control"
                  style={{ borderColor: errors.rescueId ? "var(--accent-coral)" : "" }}
                  value={taskForm.rescueId}
                  onChange={(e) => setTaskForm({ ...taskForm, rescueId: e.target.value })}
                >
                  <option value="">-- Choose Unassigned Case --</option>
                  {unassignedRescues.map(r => (
                    <option key={r.id} value={r.id}>
                      [{r.id}] {r.animalType} - {r.condition} ({r.location ? r.location.split(" (")[0] : ""})
                    </option>
                  ))}
                </select>
                {unassignedRescues.length === 0 && (
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "6px", display: "block" }}>
                    ℹ️ All active rescues are currently assigned.
                  </span>
                )}
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowTaskModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={unassignedRescues.length === 0}>
                  Commit Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default HomeOverview;
