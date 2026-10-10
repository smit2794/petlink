import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import PetQRCode from "../../components/PetQRCode";
import client from "../../api/client";
import {
  Navigation, Dog, ShieldAlert, Syringe, Scissors, Heart,
  PlusCircle, UserPlus, ClipboardList, AlertTriangle,
  MapPin, Image, Upload, Check, Search, Calendar, ChevronRight, X, QrCode
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

const HomeOverview = () => {
  const {
    animals, rescues, volunteers, inventory,
    addRescue, addAnimal, addRescuePersisted, assignVolunteerToRescueCase, addAnimalPersisted, addToast
  } = useApp();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTokenId, setActiveTokenId] = useState("");

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
    status: "In Shelter", custodian: user?.name || "Pune Central Shelter", vaccinationStatus: "Not Vaccinated",
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

  // Auto-open modal when navigated with intake=true or tokenId
  useEffect(() => {
    const intakeParam = searchParams.get("intake");
    const tokenParam = searchParams.get("tokenId");
    if (intakeParam === "true" || tokenParam) {
      setShowAnimalModal(true);
      if (tokenParam) setActiveTokenId(tokenParam);
    }
  }, [searchParams]);

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
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleRescuePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertToBase64(file);
      setRescuePhoto(file);
      setRescuePhotoPreview(base64);
    }
  };

  const handleAnimalPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertToBase64(file);
      setAnimalPhoto(file);
      setAnimalPhotoPreview(base64);
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
        createdBy: user?.id,
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
        custodian: user?.name || animalForm.custodian,
        createdBy: user?.id,
        id: generatedId,
        photo: animalPhotoPreview
      });

      if (activeTokenId) {
        try {
          await client.post('/tokens/claim', {
            tokenId: activeTokenId,
            animalId: generatedId,
            petName: animalForm.name || "Shelter Intake"
          });
          if (addToast) {
            addToast(`🎉 Collar tag ${activeTokenId} claimed and linked to intake profile!`, "success");
          }
        } catch (claimErr) {
          console.error("Token claim error for intake:", claimErr);
        }
        setActiveTokenId("");
      }
    } catch (err) {
      setIsSubmittingAnimal(false);
      return; // error toast already shown, keep modal open so they can retry
    }

    setIsSubmittingAnimal(false);
    setShowAnimalModal(false);

    setAnimalForm({
      name: "", species: "Dog", breed: "", gender: "Male", age: "", weight: "",
      status: "In Shelter", custodian: user?.name || "Pune Central Shelter", vaccinationStatus: "Not Vaccinated",
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
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

      {/* Top Header Controls Matching Reference */}
      <div className="ngo-hub-header">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <h1 style={{
              fontSize: "2.35rem",
              fontWeight: 900,
              color: "#1D1311",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              margin: 0
            }}>
              Welcome Back,<br />
              <span style={{ color: "#1D1311" }}>{user?.name || "animallove"}</span>
            </h1>

            {/* Top Rescuer Badge */}
            <div className="ngo-top-rescuer-badge">
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: "#FDE68A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem"
              }}>
                🐶
              </div>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#B45309", letterSpacing: "0.04em" }}>
                  TOP RESCUER!
                </span>
                <span style={{ fontSize: "0.68rem", color: "#D97706" }}>⭐</span>
              </div>
            </div>
          </div>

          <p style={{ color: "#786B65", fontSize: "0.92rem", fontWeight: 500, margin: "2px 0 0" }}>
            Unified command hub for shelters, rescues, and volunteer logistics. 🐾🦴🐱✨
          </p>
        </div>

        {/* 3 Top Action Buttons Aligned Exactly as in Reference */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              className="ngo-action-btn-primary"
              onClick={() => { setErrors({}); setShowRescueModal(true); }}
            >
              <span>+</span> + New Rescue 🚨
            </button>
            <button
              className="ngo-action-btn-outline"
              onClick={() => { setErrors({}); setShowAnimalModal(true); }}
            >
              <span>+</span> Intake Profile 📋
            </button>
          </div>
          <button
            className="ngo-action-btn-outline"
            style={{ padding: "8px 20px" }}
            onClick={() => { setErrors({}); setShowTaskModal(true); }}
          >
            Assign Volunteer 🤝
          </button>
        </div>
      </div>

      {isLoading ? (
        <>
          <div className="ngo-hub-stat-grid">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="skeleton skeleton-card" style={{ height: "175px", borderRadius: "22px" }} />
            ))}
          </div>
          <div className="skeleton" style={{ height: "340px", borderRadius: "26px" }} />
        </>
      ) : (
        <>
          {/* 6-Column Pastel Stat Cards Grid Matching Reference */}
          <div className="ngo-hub-stat-grid">

            {/* Card 1: DISPATCH */}
            <div className="ngo-hub-stat-card stat-dispatch animate-slide-up" style={{ animationDelay: "40ms" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="ngo-stat-top-chip" style={{ backgroundColor: "#FFEBD6", color: "#C45E00" }}>
                  <span>⚡ 🐕</span> DISPATCH
                </span>
              </div>
              <div style={{ marginTop: "12px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                  <span style={{ fontSize: "2.3rem", fontWeight: 900, color: "#1D1311", lineHeight: 1 }}>
                    <CountUp target={activeRescues || 5} />
                  </span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#7A6E67" }}>cases</span>
                </div>
                <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#5A4D46", marginTop: "4px" }}>
                  Active Rescues
                </div>
              </div>
              <span className="ngo-stat-bottom-pill" style={{ backgroundColor: "#FFF0E0", color: "#C45E00" }}>
                ↑ +3 reported today
              </span>
              <div style={{ position: "absolute", right: "-6px", bottom: "-6px", opacity: 0.14, pointerEvents: "none", fontSize: "3rem" }}>
                🐶
              </div>
            </div>

            {/* Card 2: SHELTER */}
            <div className="ngo-hub-stat-card stat-shelter animate-slide-up" style={{ animationDelay: "80ms" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="ngo-stat-top-chip" style={{ backgroundColor: "#DCF6E8", color: "#1E7E52" }}>
                  <span>🏠 🐱</span> SHELTER
                </span>
              </div>
              <div style={{ marginTop: "12px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                  <span style={{ fontSize: "2.3rem", fontWeight: 900, color: "#1D1311", lineHeight: 1 }}>
                    <CountUp target={animalsInShelter || 1} />
                  </span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#7A6E67" }}>pet</span>
                </div>
                <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#5A4D46", marginTop: "4px" }}>
                  Animals In Shelter
                </div>
              </div>
              <span className="ngo-stat-bottom-pill" style={{ backgroundColor: "#E3F8ED", color: "#1E7E52" }}>
                ↑ Capacity at {Math.max(4, Math.floor((animalsInShelter / 25) * 100))}%
              </span>
              <div style={{ position: "absolute", right: "-6px", bottom: "-6px", opacity: 0.14, pointerEvents: "none", fontSize: "3rem" }}>
                🐱
              </div>
            </div>

            {/* Card 3: CRITICAL */}
            <div className="ngo-hub-stat-card stat-critical animate-slide-up" style={{ animationDelay: "120ms" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="ngo-stat-top-chip" style={{ backgroundColor: "#FFE2E2", color: "#D13636" }}>
                  <span>🚨 ❤️</span> CRITICAL
                </span>
              </div>
              <div style={{ marginTop: "12px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                  <span style={{ fontSize: "2.3rem", fontWeight: 900, color: "#1D1311", lineHeight: 1 }}>
                    <CountUp target={criticalCases || 3} />
                  </span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#7A6E67" }}>urgent</span>
                </div>
                <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#5A4D46", marginTop: "4px" }}>
                  Critical Operations
                </div>
              </div>
              <span className="ngo-stat-bottom-pill" style={{ backgroundColor: "#FFEAEB", color: "#D13636" }}>
                ⚠ Urgent clinical care
              </span>
              <div style={{ position: "absolute", right: "-6px", bottom: "-6px", opacity: 0.14, pointerEvents: "none", fontSize: "3rem" }}>
                🩹
              </div>
            </div>

            {/* Card 4: HEALTH */}
            <div className="ngo-hub-stat-card stat-health animate-slide-up" style={{ animationDelay: "160ms" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="ngo-stat-top-chip" style={{ backgroundColor: "#DDF0FF", color: "#1A74BA" }}>
                  <span>🧪 💊</span> HEALTH
                </span>
              </div>
              <div style={{ marginTop: "12px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                  <span style={{ fontSize: "2.3rem", fontWeight: 900, color: "#1D1311", lineHeight: 1 }}>
                    <CountUp target={pendingVaccinations || 11} />
                  </span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#7A6E67" }}>shots</span>
                </div>
                <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#5A4D46", marginTop: "4px" }}>
                  Pending Vaccines
                </div>
              </div>
              <span className="ngo-stat-bottom-pill" style={{ backgroundColor: "#E6F3FF", color: "#1A74BA" }}>
                ↑ +8 scheduled soon
              </span>
              <div style={{ position: "absolute", right: "-6px", bottom: "-6px", opacity: 0.14, pointerEvents: "none", fontSize: "3rem" }}>
                💉
              </div>
            </div>

            {/* Card 5: SURGERY */}
            <div className="ngo-hub-stat-card stat-surgery animate-slide-up" style={{ animationDelay: "200ms" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="ngo-stat-top-chip" style={{ backgroundColor: "#ECE0FF", color: "#6C3CC9" }}>
                  <span>✨ 🩺</span> SURGERY
                </span>
              </div>
              <div style={{ marginTop: "12px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                  <span style={{ fontSize: "2.3rem", fontWeight: 900, color: "#1D1311", lineHeight: 1 }}>
                    <CountUp target={pendingSterilizations || 3} />
                  </span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#7A6E67" }}>cases</span>
                </div>
                <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#5A4D46", marginTop: "4px" }}>
                  Pending Sterils
                </div>
              </div>
              <span className="ngo-stat-bottom-pill" style={{ backgroundColor: "#F3EBFF", color: "#6C3CC9" }}>
                ↑ ABC cycle active
              </span>
              <div style={{ position: "absolute", right: "-6px", bottom: "-6px", opacity: 0.14, pointerEvents: "none", fontSize: "3rem" }}>
                ✂️
              </div>
            </div>

            {/* Card 6: HOMES */}
            <div className="ngo-hub-stat-card stat-homes animate-slide-up" style={{ animationDelay: "240ms" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="ngo-stat-top-chip" style={{ backgroundColor: "#FCE0EC", color: "#B82862" }}>
                  <span>💉 🐶</span> HOMES
                </span>
              </div>
              <div style={{ marginTop: "12px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                  <span style={{ fontSize: "2.3rem", fontWeight: 900, color: "#1D1311", lineHeight: 1 }}>
                    <CountUp target={recentAdoptions || 8} />
                  </span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#7A6E67" }}>homed</span>
                </div>
                <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#5A4D46", marginTop: "4px" }}>
                  Adopted Pets
                </div>
              </div>
              <span className="ngo-stat-bottom-pill" style={{ backgroundColor: "#FDE9F2", color: "#B82862" }}>
                ↑ +5 homed this week
              </span>
              <div style={{ position: "absolute", right: "-6px", bottom: "-6px", opacity: 0.14, pointerEvents: "none", fontSize: "3rem" }}>
                🏡
              </div>
            </div>

          </div>

          {/* Two-Column Lower Grid: Storehouse (Left) & Activities (Right) */}
          <div className="ngo-hub-lower-grid">

            {/* Left Panel: Reserves Storehouse */}
            <div className="ngo-hub-panel">
              {/* Floating Pantry Full Pill Badge */}
              <div className="ngo-pantry-tag">
                <span>🐶 Yum! Pet Pantry Full 🥣</span>
              </div>

              {/* Panel Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    backgroundColor: "#FFF4E8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem"
                  }}>
                    🦴
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.18rem", fontWeight: 900, color: "#1D1311", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                      Reserves Storehouse 🐾
                    </h3>
                    <p style={{ fontSize: "0.82rem", color: "#857771", fontWeight: 500, margin: "2px 0 0" }}>
                      Essential food, vitamins & care stock
                    </p>
                  </div>
                </div>

                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 14px",
                  borderRadius: "9999px",
                  backgroundColor: "#FFFBEB",
                  border: "1.5px solid #FDE68A",
                  color: "#B45309",
                  fontSize: "0.76rem",
                  fontWeight: 800,
                  letterSpacing: "0.04em"
                }}>
                  ⭐ CENTRAL HUB
                </span>
              </div>

              {/* 4 Inventory Items matching reference */}
              <div>
                {/* Item 1: Dog Food (10kg bags) */}
                <div className="ngo-hub-stock-capsule">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "1.25rem" }}>🐕</span>
                      <span style={{ fontSize: "0.92rem", fontWeight: 800, color: "#1D1311" }}>
                        Dog Food (10kg bags)
                      </span>
                      <span style={{ fontSize: "0.82rem", color: "#8C7E77", fontWeight: 500 }}>
                        • Crunchy Feast
                      </span>
                    </div>
                    <span style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E5DFD4",
                      padding: "4px 12px",
                      borderRadius: "9999px",
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      color: "#1D1311"
                    }}>
                      🥩 110 bags
                    </span>
                  </div>
                  <div className="ngo-hub-progress-track">
                    <div className="ngo-hub-progress-fill" style={{ width: "85%", backgroundColor: "#FF7A1A" }} />
                  </div>
                </div>

                {/* Item 2: Rabisin Anti-Rabies Vaccine */}
                <div className="ngo-hub-stock-capsule">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "1.25rem" }}>💉</span>
                      <span style={{ fontSize: "0.92rem", fontWeight: 800, color: "#1D1311" }}>
                        Rabisin Anti-Rabies Vaccine
                      </span>
                      <span style={{ fontSize: "0.82rem", color: "#8C7E77", fontWeight: 500 }}>
                        • Safe Guard
                      </span>
                    </div>
                    <span style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E5DFD4",
                      padding: "4px 12px",
                      borderRadius: "9999px",
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      color: "#1D1311"
                    }}>
                      💉 120 Vials
                    </span>
                  </div>
                  <div className="ngo-hub-progress-track">
                    <div className="ngo-hub-progress-fill" style={{ width: "90%", backgroundColor: "#00A86B" }} />
                  </div>
                </div>

                {/* Item 3: Puppy Dry Kibble (Pedigree) - LOW ALERT */}
                <div className="ngo-hub-stock-capsule is-alert">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "1.25rem" }}>🐾</span>
                      <span style={{ fontSize: "0.92rem", fontWeight: 800, color: "#1D1311" }}>
                        Puppy Dry Kibble (Pedigree)
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "#EF4444", fontWeight: 800, display: "flex", alignItems: "center", gap: "4px" }}>
                        • Restock soon!
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #FECACA",
                        padding: "4px 12px",
                        borderRadius: "9999px",
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        color: "#DC2626"
                      }}>
                        45 Bags (10kg)
                      </span>
                      <span style={{
                        backgroundColor: "#EF4444",
                        color: "#FFFFFF",
                        padding: "3px 10px",
                        borderRadius: "9999px",
                        fontSize: "0.72rem",
                        fontWeight: 800
                      }}>
                        ⚠ Low
                      </span>
                    </div>
                  </div>
                  <div className="ngo-hub-progress-track" style={{ backgroundColor: "#FEE2E2" }}>
                    <div className="ngo-hub-progress-fill" style={{ width: "35%", backgroundColor: "#EF4444" }} />
                  </div>
                </div>

                {/* Item 4: Cat Dry Kibble (Whiskas) */}
                <div className="ngo-hub-stock-capsule">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "1.25rem" }}>🐱</span>
                      <span style={{ fontSize: "0.92rem", fontWeight: 800, color: "#1D1311" }}>
                        Cat Dry Kibble (Whiskas)
                      </span>
                      <span style={{ fontSize: "0.82rem", color: "#8C7E77", fontWeight: 500 }}>
                        • Ocean Fish Flavor
                      </span>
                    </div>
                    <span style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E5DFD4",
                      padding: "4px 12px",
                      borderRadius: "9999px",
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      color: "#1D1311"
                    }}>
                      🐟 22 Bags (5kg)
                    </span>
                  </div>
                  <div className="ngo-hub-progress-track">
                    <div className="ngo-hub-progress-fill" style={{ width: "50%", backgroundColor: "#7C3AED" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Recent Field Activities */}
            <div className="ngo-hub-panel" style={{ display: "flex", flexDirection: "column" }}>
              {/* Panel Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    backgroundColor: "#E6F9F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem"
                  }}>
                    📋
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.18rem", fontWeight: 900, color: "#1D1311", margin: 0 }}>
                      Recent Field Activities 🐾
                    </h3>
                    <p style={{ fontSize: "0.82rem", color: "#857771", fontWeight: 500, margin: "2px 0 0" }}>
                      Live pet hero updates
                    </p>
                  </div>
                </div>

                <span style={{ fontSize: "1.4rem" }}>✨</span>
              </div>

              {/* Activity Items matching reference */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", flexGrow: 1 }}>
                {/* Activity 1: Rahul Mehta */}
                <div className="ngo-hub-activity-row">
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ position: "relative" }}>
                      <div style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "14px",
                        backgroundColor: "#1D1311",
                        color: "#FF9E42",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        fontSize: "0.95rem"
                      }}>
                        RM
                      </div>
                      <div style={{
                        position: "absolute",
                        bottom: "-4px",
                        right: "-4px",
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        backgroundColor: "#FFFFFF",
                        border: "1.5px solid #1D1311",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.6rem"
                      }}>
                        🐶
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "0.92rem", fontWeight: 800, color: "#1D1311" }}>
                          Rahul Mehta
                        </span>
                        <span style={{
                          backgroundColor: "#FFFBEB",
                          border: "1px solid #FDE68A",
                          color: "#B45309",
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          padding: "1px 8px",
                          borderRadius: "9999px"
                        }}>
                          HERO ⭐
                        </span>
                      </div>
                      <span style={{ fontSize: "0.8rem", color: "#6B5E57", fontWeight: 600, marginTop: "2px" }}>
                        Resolved: Deliver meds to Kothrud site
                      </span>
                    </div>
                  </div>
                  <span style={{
                    backgroundColor: "#D1FAE5",
                    color: "#047857",
                    padding: "6px 14px",
                    borderRadius: "9999px",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    flexShrink: 0
                  }}>
                    ✓ DONE
                  </span>
                </div>

                {/* Activity 2: Rahul Mehta Rescue RSC-201 */}
                <div className="ngo-hub-activity-row">
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ position: "relative" }}>
                      <div style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "14px",
                        backgroundColor: "#1D1311",
                        color: "#FF9E42",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        fontSize: "0.95rem"
                      }}>
                        RM
                      </div>
                      <div style={{
                        position: "absolute",
                        bottom: "-4px",
                        right: "-4px",
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        backgroundColor: "#FFFFFF",
                        border: "1.5px solid #1D1311",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.6rem"
                      }}>
                        🐕
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "0.92rem", fontWeight: 800, color: "#1D1311" }}>
                          Rahul Mehta
                        </span>
                        <span style={{
                          backgroundColor: "#FFFBEB",
                          border: "1px solid #FDE68A",
                          color: "#B45309",
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          padding: "1px 8px",
                          borderRadius: "9999px"
                        }}>
                          HERO ⭐
                        </span>
                      </div>
                      <span style={{ fontSize: "0.8rem", color: "#6B5E57", fontWeight: 600, marginTop: "2px" }}>
                        Resolved: Rescue Case RSC-201: Secure injured dog
                      </span>
                    </div>
                  </div>
                  <span style={{
                    backgroundColor: "#D1FAE5",
                    color: "#047857",
                    padding: "6px 14px",
                    borderRadius: "9999px",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    flexShrink: 0
                  }}>
                    ✓ DONE
                  </span>
                </div>
              </div>

              {/* Activity Footer Matching Reference */}
              <div style={{
                marginTop: "auto",
                paddingTop: "20px",
                borderTop: "1px solid #F3EFE9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.78rem",
                color: "#786C66",
                fontWeight: 600
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981" }} />
                  <span>🐾 Live telemetry active</span>
                </div>
                <div style={{
                  backgroundColor: "#F5F0E8",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#6B5E57"
                }}>
                  <span>⏱ Refreshed 2m ago</span>
                </div>
              </div>
            </div>

          </div>
        </>
      )}

      {/* ========================================================
          FIXED MODAL 1: + NEW RESCUE (WITH PHOTO & GPS)
      ======================================================== */}
      {showRescueModal && (
        <div className="ngo-modal-overlay" onClick={() => setShowRescueModal(false)}>
          <div className="ngo-modal-card animate-scale-up" style={{ maxWidth: "580px" }} onClick={(e) => e.stopPropagation()}>
            <div className="ngo-modal-header">
              <div className="ngo-modal-header-left">
                <div className="ngo-modal-icon-badge">
                  🚑
                </div>
                <div>
                  <h2 className="ngo-modal-title">Log Emergency Dispatch Case</h2>
                  <p className="ngo-modal-subtitle">Record incident details, photo evidence, and deploy field response.</p>
                </div>
              </div>
              <button className="ngo-modal-close-btn" onClick={() => setShowRescueModal(false)}><X size={18} /></button>
            </div>
            <div className="ngo-modal-body">

              <form id="rescue-form" onSubmit={handleRescueSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Photo Upload with preview */}
                <div>
                  <label className="ngo-modal-label">
                    Rescue Photo Capture * {errors.photo && <span className="form-error">{errors.photo}</span>}
                  </label>
                  <div className="ngo-modal-upload-box" style={{
                    borderColor: errors.photo ? "var(--accent-coral)" : "#FED7AA"
                  }}>
                    {rescuePhotoPreview ? (
                      <img
                        src={rescuePhotoPreview}
                        alt="Preview"
                        style={{ width: "88px", height: "88px", objectFit: "cover", borderRadius: "14px", border: "1.5px solid #FED7AA", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                      />
                    ) : (
                      <div style={{ width: "88px", height: "88px", borderRadius: "14px", backgroundColor: "#FFF3E6", border: "1.5px solid #FED7AA", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF6E14" }}>
                        <Image size={28} />
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1D1311" }}>Incident Photo Verification</span>
                      <span style={{ fontSize: "0.76rem", color: "#8C7B75" }}>Upload JPEG/PNG field capture with location proof</span>
                      <label style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 14px",
                        borderRadius: "9999px",
                        backgroundColor: "#FFFFFF",
                        border: "1.5px solid #DFD7CC",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "#2D231E",
                        cursor: "pointer",
                        alignSelf: "flex-start",
                        marginTop: "4px",
                        transition: "all 0.15s ease"
                      }}>
                        <Upload size={13} color="#FF6E14" /> Select File
                        <input type="file" accept="image/*" onChange={handleRescuePhotoChange} style={{ display: "none" }} />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Location field with Current Location filler */}
                <div>
                  <label className="ngo-modal-label">
                    Rescue Location * {errors.location && <span className="form-error">{errors.location}</span>}
                  </label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="text"
                      placeholder="Enter street coordinates or address..."
                      className="ngo-modal-input"
                      style={{ flex: 1, borderColor: errors.location ? "var(--accent-coral)" : "" }}
                      value={rescueForm.location}
                      onChange={(e) => setRescueForm({ ...rescueForm, location: e.target.value })}
                    />
                    <button type="button" onClick={handleUseCurrentLocation} style={{
                      borderRadius: "14px",
                      border: "1.5px solid #FED7AA",
                      backgroundColor: "#FFF9F3",
                      color: "#C2410C",
                      fontWeight: 800,
                      fontSize: "0.84rem",
                      padding: "0 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer"
                    }}>
                      <MapPin size={15} color="#FF6E14" /> GPS
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label className="ngo-modal-label">Species *</label>
                    <select
                      className="ngo-modal-input"
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

                  <div>
                    <label className="ngo-modal-label">Assign Handler Dispatch</label>
                    <select
                      className="ngo-modal-input"
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

                <div>
                  <label className="ngo-modal-label">
                    Rescue Notes / Injury Condition * {errors.condition && <span className="form-error">{errors.condition}</span>}
                  </label>
                  <textarea
                    placeholder="Describe status of injury, e.g., fractured leg, dehydration..."
                    className="ngo-modal-input"
                    rows="2"
                    style={{ borderColor: errors.condition ? "var(--accent-coral)" : "", resize: "vertical" }}
                    value={rescueForm.condition}
                    onChange={(e) => setRescueForm({ ...rescueForm, condition: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "14px" }}>
                  <div>
                    <label className="ngo-modal-label">
                      Reported By * {errors.reportedBy && <span className="form-error">{errors.reportedBy}</span>}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Suresh Kumar"
                      className="ngo-modal-input"
                      style={{ borderColor: errors.reportedBy ? "var(--accent-coral)" : "" }}
                      value={rescueForm.reportedBy}
                      onChange={(e) => setRescueForm({ ...rescueForm, reportedBy: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="ngo-modal-label">
                      Contact Phone * {errors.phone && <span className="form-error">{errors.phone}</span>}
                    </label>
                    <input
                      type="text"
                      placeholder="+91 XXXXX XXXXX"
                      className="ngo-modal-input"
                      style={{ borderColor: errors.phone ? "var(--accent-coral)" : "" }}
                      value={rescueForm.phone}
                      onChange={(e) => setRescueForm({ ...rescueForm, phone: e.target.value })}
                    />
                  </div>
                </div>

              </form>
            </div>
            <div className="ngo-modal-footer">
              <button type="button" className="ngo-modal-btn-cancel" onClick={() => setShowRescueModal(false)}>
                Cancel
              </button>
              <button form="rescue-form" type="submit" className="ngo-modal-btn-primary" disabled={isSubmittingRescue}>
                {isSubmittingRescue ? "Saving..." : "Create Rescue Case"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          FIXED MODAL 2: + NEW ANIMAL PROFILE (WITH AUTO-ID & QR)
      ======================================================== */}
      {showAnimalModal && (
        <div className="ngo-modal-overlay" onClick={() => setShowAnimalModal(false)}>
          <div className="ngo-modal-card animate-scale-up" style={{ maxWidth: "620px" }} onClick={(e) => e.stopPropagation()}>
            <div className="ngo-modal-header">
              <div className="ngo-modal-header-left">
                <div className="ngo-modal-icon-badge">
                  🐾
                </div>
                <div>
                  <h2 className="ngo-modal-title">Register Direct Intake Profile</h2>
                  <p className="ngo-modal-subtitle">Generate digital tag, health dossier, and shelter custody register.</p>
                </div>
              </div>
              <button className="ngo-modal-close-btn" onClick={() => setShowAnimalModal(false)}><X size={18} /></button>
            </div>
            <div className="ngo-modal-body">

              <form id="animal-form" onSubmit={handleAnimalSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Pre-generated details display */}
                {activeTokenId && (
                  <div style={{ backgroundColor: "#EEF2FF", border: "1.5px solid #C7D2FE", borderRadius: "14px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: "#E0E7FF", color: "#4338CA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <QrCode size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#4338CA", textTransform: "uppercase", display: "block" }}>
                        LINKING PRE-ASSIGNED COLLAR TAG
                      </span>
                      <span style={{ fontSize: "0.92rem", fontWeight: 800, color: "#1E1B4B" }}>
                        Token ID: <code style={{ fontFamily: "monospace", color: "#4F46E5", background: "#FFFFFF", padding: "2px 8px", borderRadius: "6px", border: "1px solid #C7D2FE" }}>{activeTokenId}</code>
                      </span>
                    </div>
                  </div>
                )}

                <div className="ngo-modal-tag-card">
                  <div style={{ background: "#FFFFFF", padding: "8px", borderRadius: "14px", border: "1.5px solid #FED7AA", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
                    <PetQRCode animalId={generatedId} size={64} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#FFF9EB", border: "1px solid #FDE68A", padding: "2px 10px", borderRadius: "9999px", fontSize: "0.68rem", fontWeight: 800, color: "#B45309", marginBottom: "4px" }}>
                      AUTOMATED SYSTEM TAG ASSIGNMENT
                    </div>
                    <h3 style={{ fontSize: "1.18rem", fontWeight: 900, color: "#1D1311", margin: 0 }}>
                      Preview ID: {generatedId}
                    </h3>
                    <p style={{ fontSize: "0.76rem", color: "#8C7B75", margin: 0, marginTop: "2px" }}>
                      Official system tag will be locked upon registration.
                    </p>
                  </div>
                </div>

                {/* Photo file picker with preview */}
                <div>
                  <label className="ngo-modal-label">
                    Intake Profile Picture * {errors.photo && <span className="form-error">{errors.photo}</span>}
                  </label>
                  <div className="ngo-modal-upload-box" style={{
                    borderColor: errors.photo ? "var(--accent-coral)" : "#FED7AA"
                  }}>
                    {animalPhotoPreview ? (
                      <img
                        src={animalPhotoPreview}
                        alt="Intake Preview"
                        style={{ width: "88px", height: "88px", objectFit: "cover", borderRadius: "14px", border: "1.5px solid #FED7AA", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                      />
                    ) : (
                      <div style={{ width: "88px", height: "88px", borderRadius: "14px", backgroundColor: "#FFF3E6", border: "1.5px solid #FED7AA", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF6E14" }}>
                        <Image size={28} />
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1D1311" }}>Clear Pet Identification Photo</span>
                      <span style={{ fontSize: "0.76rem", color: "#8C7B75" }}>Visible face, coat, and distinguishing markings</span>
                      <label style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 14px",
                        borderRadius: "9999px",
                        backgroundColor: "#FFFFFF",
                        border: "1.5px solid #DFD7CC",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "#2D231E",
                        cursor: "pointer",
                        alignSelf: "flex-start",
                        marginTop: "4px",
                        transition: "all 0.15s ease"
                      }}>
                        <Upload size={13} color="#FF6E14" /> Upload Image
                        <input type="file" accept="image/*" onChange={handleAnimalPhotoChange} style={{ display: "none" }} />
                      </label>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "14px" }}>
                  <div>
                    <label className="ngo-modal-label">Animal Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Moti (leave empty if unnamed)"
                      className="ngo-modal-input"
                      value={animalForm.name}
                      onChange={(e) => setAnimalForm({ ...animalForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="ngo-modal-label">Species</label>
                    <select
                      className="ngo-modal-input"
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

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                  <div>
                    <label className="ngo-modal-label">
                      Breed * {errors.breed && <span className="form-error">{errors.breed}</span>}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Indie"
                      className="ngo-modal-input"
                      style={{ borderColor: errors.breed ? "var(--accent-coral)" : "" }}
                      value={animalForm.breed}
                      onChange={(e) => setAnimalForm({ ...animalForm, breed: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="ngo-modal-label">
                      Estimated Age * {errors.age && <span className="form-error">{errors.age}</span>}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1 year"
                      className="ngo-modal-input"
                      style={{ borderColor: errors.age ? "var(--accent-coral)" : "" }}
                      value={animalForm.age}
                      onChange={(e) => setAnimalForm({ ...animalForm, age: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="ngo-modal-label">
                      Weight * {errors.weight && <span className="form-error">{errors.weight}</span>}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 12 kg"
                      className="ngo-modal-input"
                      style={{ borderColor: errors.weight ? "var(--accent-coral)" : "" }}
                      value={animalForm.weight}
                      onChange={(e) => setAnimalForm({ ...animalForm, weight: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label className="ngo-modal-label">Gender</label>
                    <select
                      className="ngo-modal-input"
                      value={animalForm.gender}
                      onChange={(e) => setAnimalForm({ ...animalForm, gender: e.target.value })}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Unknown</option>
                    </select>
                  </div>

                  <div>
                    <label className="ngo-modal-label">Starting Status</label>
                    <input
                      type="text"
                      className="ngo-modal-input"
                      value="In Shelter"
                      disabled
                      style={{ backgroundColor: "#F2EFE9", cursor: "not-allowed", opacity: 0.8 }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label className="ngo-modal-label">Vaccination Status</label>
                    <select
                      className="ngo-modal-input"
                      value={animalForm.vaccinationStatus}
                      onChange={(e) => setAnimalForm({ ...animalForm, vaccinationStatus: e.target.value })}
                    >
                      <option>Not Vaccinated</option>
                      <option>Pending Second Dose</option>
                      <option>Fully Vaccinated</option>
                    </select>
                  </div>

                  <div>
                    <label className="ngo-modal-label">Sterilization Status</label>
                    <select
                      className="ngo-modal-input"
                      value={animalForm.sterilizationStatus}
                      onChange={(e) => setAnimalForm({ ...animalForm, sterilizationStatus: e.target.value })}
                    >
                      <option>Pending</option>
                      <option>Sterilized</option>
                      <option>Not Applicable</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="ngo-modal-label">Direct Intake Assessment Notes</label>
                  <textarea
                    placeholder="Note down veterinary assessment comments, skin condition notes..."
                    className="ngo-modal-input"
                    rows="2"
                    style={{ resize: "vertical" }}
                    value={animalForm.treatmentNotes}
                    onChange={(e) => setAnimalForm({ ...animalForm, treatmentNotes: e.target.value })}
                  />
                </div>

              </form>
            </div>
            <div className="ngo-modal-footer">
              <button type="button" className="ngo-modal-btn-cancel" onClick={() => setShowAnimalModal(false)}>
                Cancel
              </button>
              <button form="animal-form" type="submit" className="ngo-modal-btn-primary" disabled={isSubmittingAnimal}>
                {isSubmittingAnimal ? "Saving..." : "Create Profile"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          FIXED MODAL 3: ASSIGN VOLUNTEER TASK
      ======================================================== */}
      {showTaskModal && (
        <div className="ngo-modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="ngo-modal-card animate-scale-up" style={{ maxWidth: "540px" }} onClick={(e) => e.stopPropagation()}>
            <div className="ngo-modal-header">
              <div className="ngo-modal-header-left">
                <div className="ngo-modal-icon-badge">
                  📋
                </div>
                <div>
                  <h2 className="ngo-modal-title">Assign Field Volunteer</h2>
                  <p className="ngo-modal-subtitle">Dispatch registered volunteer personnel to open rescue cases.</p>
                </div>
              </div>
              <button className="ngo-modal-close-btn" onClick={() => setShowTaskModal(false)}><X size={18} /></button>
            </div>
            <div className="ngo-modal-body">

              <form id="task-form" onSubmit={handleTaskSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {/* Select Volunteer dropdown */}
                <div>
                  <label className="ngo-modal-label">
                    Select Field Volunteer * {errors.volunteerId && <span className="form-error">{errors.volunteerId}</span>}
                  </label>
                  <select
                    className="ngo-modal-input"
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
                <div>
                  <label className="ngo-modal-label">
                    Select Unassigned Rescue Case * {errors.rescueId && <span className="form-error">{errors.rescueId}</span>}
                  </label>
                  <select
                    className="ngo-modal-input"
                    style={{ borderColor: errors.rescueId ? "var(--accent-coral)" : "" }}
                    value={taskForm.rescueId}
                    onChange={(e) => setTaskForm({ ...taskForm, rescueId: e.target.value })}
                  >
                    <option value="">-- Choose Unassigned Case --</option>
                    {rescues.filter(r => r.assignedVolunteer === "None" || !r.assignedVolunteer).map(r => (
                      <option key={r.id} value={r.id}>
                        [{r.id}] {r.animalType} - {r.condition} ({r.location ? r.location.split(" (")[0] : ""})
                      </option>
                    ))}
                  </select>
                  {rescues.filter(r => r.assignedVolunteer === "None" || !r.assignedVolunteer).length === 0 && (
                    <div style={{
                      backgroundColor: "#FFF9EB",
                      border: "1px solid #FDE68A",
                      borderRadius: "12px",
                      padding: "10px 14px",
                      marginTop: "10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "0.82rem",
                      color: "#92400E",
                      fontWeight: 600
                    }}>
                      <span>ℹ️</span> All active rescues are currently assigned.
                    </div>
                  )}
                </div>

              </form>
            </div>
            <div className="ngo-modal-footer">
              <button type="button" className="ngo-modal-btn-cancel" onClick={() => setShowTaskModal(false)}>
                Cancel
              </button>
              <button form="task-form" type="submit" className="ngo-modal-btn-primary" disabled={rescues.filter(r => r.assignedVolunteer === "None" || !r.assignedVolunteer).length === 0}>
                Commit Assignment
              </button>
            </div>
          </div>
        </div>
      )}

    </div >
  );
};

export default HomeOverview;
