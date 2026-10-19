import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import {
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Camera,
  Phone,
  CheckCircle,
  ArrowLeft,
  QrCode,
  Clock,
  LogIn,
  LogOut,
  Edit,
  Check,
  AlertCircle,
  User,
  X
} from "lucide-react";

const SAMPLE_PET_PHOTOS = [
  { label: "Dog (Golden)", url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800" },
  { label: "Dog (Husky)", url: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=800" },
  { label: "Cat (Tabby)", url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800" },
  { label: "Cat (Ginger)", url: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=800" }
];

const PublicScanPage = () => {
  const { tagId } = useParams();
  const navigate = useNavigate();
  const { animals, logTagScan, submitFoundReport, registerPetPersisted, updateAnimal, addToast } = useApp();
  const { user, logout } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [tokenState, setTokenState] = useState(null); // null | { type: 'unclaimed', token } | { type: 'claimed', token, animal }
  const [step, setStep] = useState(1); // 1 = Detail/Form, 2 = Success screen (found report)

  // Lost pet report form state (for Scenario 2/3 when status === 'Lost')
  const [reportFormData, setReportFormData] = useState({
    location: "",
    photoPreview: "",
    contact: ""
  });
  const [reportError, setReportError] = useState("");
  const scanLoggedRef = useRef(false);

  // Edit mode state (for Scenario 3)
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    species: "Dog",
    breed: "",
    gender: "Male",
    age: "",
    weight: "",
    photo: "",
    vaccinationStatus: "Fully Vaccinated",
    sterilizationStatus: "Sterilized"
  });

  // Fill-in registration state (for Scenario 1b)
  const [fillFormData, setFillFormData] = useState({
    name: "",
    species: "Dog",
    breed: "",
    gender: "Male",
    age: "",
    weight: "",
    photo: SAMPLE_PET_PHOTOS[0].url,
    vaccinationStatus: "Fully Vaccinated",
    sterilizationStatus: "Sterilized"
  });

  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Step 1: resolve whether this tagId is a QR token or a legacy animal ID ──
  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      setIsLoading(true);
      setServerError("");
      try {
        const res = await client.get(`/tokens/lookup/${tagId}`);
        if (!cancelled) {
          const tok = res.data.token;
          if (tok.status === "claimed") {
            setTokenState({
              type: "claimed",
              token: tok,
              animal: res.data.animal || null
            });
            // Pre-fill edit form if animal exists
            if (res.data.animal) {
              const a = res.data.animal;
              setEditFormData({
                name: a.name || "",
                species: a.species || "Dog",
                breed: a.breed || "",
                gender: a.gender || "Male",
                age: a.age || "",
                weight: a.weight || "",
                photo: a.photo || SAMPLE_PET_PHOTOS[0].url,
                vaccinationStatus: a.healthSummary?.vaccinationStatus || "Fully Vaccinated",
                sterilizationStatus: a.healthSummary?.sterilizationStatus || "Sterilized"
              });
            }
          } else {
            // Unclaimed token
            setTokenState({ type: "unclaimed", token: tok });
          }
          setIsLoading(false);
        }
      } catch {
        // 404 → not a QR token → fall through to legacy animal-ID mode
        if (!cancelled) {
          setTokenState(null);
          setIsLoading(false);
        }
      }
    };

    resolve();
    return () => {
      cancelled = true;
    };
  }, [tagId]);

  // Determine active pet record (either from token resolution or legacy list)
  const pet =
    tokenState?.type === "claimed"
      ? tokenState.animal
      : tokenState === null && !isLoading
      ? animals.find((p) => p.id === tagId) || null
      : null;

  // Check if current logged-in user is the assigned owner of this token
  const isOwner = Boolean(
    user &&
    tokenState?.token?.assignedUserId &&
    String(tokenState.token.assignedUserId._id || tokenState.token.assignedUserId) === String(user.id || user._id)
  );

  // ── Scan Logging (once per session for loaded pets) ──
  useEffect(() => {
    if (pet && !scanLoggedRef.current) {
      logTagScan(pet.id, "Pune Central Ward (GPS Simulated)");
      scanLoggedRef.current = true;
    }
  }, [pet, logTagScan]);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // ── Handlers for Lost Pet Found Report ──
  const handleGPSAutoCapture = () => {
    setReportFormData((prev) => ({
      ...prev,
      location: "Lat: 18.5204, Lng: 73.8567 (Pune Central Depot Area)"
    }));
    setReportError("");
  };

  const handleReportPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertToBase64(file);
      setReportFormData((prev) => ({ ...prev, photoPreview: base64 }));
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportFormData.location.trim()) {
      setReportError("Please supply your current location coordinates or landmark address.");
      return;
    }
    try {
      await submitFoundReport(pet.id, {
        finderLocation: reportFormData.location,
        finderPhoto: reportFormData.photoPreview,
        finderContact: reportFormData.contact
      });
      setStep(2);
    } catch (err) {
      // Handled in submitFoundReport
    }
  };

  // ── Handler for Scenario 1b: Fill-in Unclaimed Token Registration ──
  const handleRegisterFillIn = async (e) => {
    e.preventDefault();
    setServerError("");
    const errs = {};
    if (!fillFormData.name.trim()) errs.name = "Pet name is required.";
    if (!fillFormData.breed.trim()) errs.breed = "Breed is required.";
    if (!fillFormData.age.trim()) errs.age = "Age is required (e.g. '2 years').";
    if (!fillFormData.weight.trim()) errs.weight = "Weight is required (e.g. '14 kg').";
    if (!fillFormData.photo) errs.photo = "A pet photo is required.";

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});
    setIsSubmitting(true);

    const mockId = `PL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAnimalPayload = {
      id: mockId,
      name: fillFormData.name.trim(),
      species: fillFormData.species,
      breed: fillFormData.breed.trim(),
      gender: fillFormData.gender,
      age: fillFormData.age.trim(),
      weight: fillFormData.weight.trim(),
      photo: fillFormData.photo,
      status: "Adopted",
      custodian: user ? `${user.name} (Home)` : "Home Guardian",
      ownerId: user?.id || user?._id,
      createdBy: user?.id || user?._id,
      lastUpdated: "Just now",
      qrCode: `MOCK-QR-${mockId}`,
      timeline: [
        {
          date: new Date().toISOString().split("T")[0],
          title: "Tag Linked & Activated",
          description: `Direct domestic registration by Parent ${user?.name || "Guardian"}. Collar tag ${tagId} linked.`
        }
      ],
      healthSummary: {
        vaccinationStatus: fillFormData.vaccinationStatus,
        sterilizationStatus: fillFormData.sterilizationStatus,
        treatmentNotes: "Registered directly via scanned collar tag."
      },
      documents: []
    };

    try {
      // 1. Create animal
      const createdAnimal = await registerPetPersisted(newAnimalPayload);

      // 2. Claim token
      const claimRes = await client.post("/tokens/claim", {
        tokenId: tagId,
        animalId: mockId,
        petName: newAnimalPayload.name
      });

      addToast(`🎉 Collar tag ${tagId} claimed and linked to ${newAnimalPayload.name}!`, "success");

      // Switch state directly to claimed scenario
      setTokenState({
        type: "claimed",
        token: claimRes.data,
        animal: createdAnimal
      });
      setEditFormData({
        name: createdAnimal.name,
        species: createdAnimal.species,
        breed: createdAnimal.breed,
        gender: createdAnimal.gender,
        age: createdAnimal.age,
        weight: createdAnimal.weight,
        photo: createdAnimal.photo,
        vaccinationStatus: createdAnimal.healthSummary?.vaccinationStatus || "Fully Vaccinated",
        sterilizationStatus: createdAnimal.healthSummary?.sterilizationStatus || "Sterilized"
      });
    } catch (err) {
      console.error("Claim or registration error:", err);
      const msg = err.response?.data?.error || err.message || "Failed to complete token registration.";
      setServerError(msg);
      addToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Handler for Scenario 3: Edit Claimed Pet Details ──
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const errs = {};
    if (!editFormData.name.trim()) errs.name = "Pet name is required.";
    if (!editFormData.breed.trim()) errs.breed = "Breed is required.";
    if (!editFormData.age.trim()) errs.age = "Age is required.";
    if (!editFormData.weight.trim()) errs.weight = "Weight is required.";

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});
    setIsSubmitting(true);

    const updatePayload = {
      name: editFormData.name.trim(),
      species: editFormData.species,
      breed: editFormData.breed.trim(),
      gender: editFormData.gender,
      age: editFormData.age.trim(),
      weight: editFormData.weight.trim(),
      photo: editFormData.photo,
      healthSummary: {
        vaccinationStatus: editFormData.vaccinationStatus,
        sterilizationStatus: editFormData.sterilizationStatus
      }
    };

    try {
      const res = await client.put(`/tokens/${tagId}/edit`, updatePayload);
      const updatedAnimal = res.data;

      // Update state locally and in AppContext
      setTokenState((prev) => ({
        ...prev,
        animal: updatedAnimal,
        token: {
          ...prev.token,
          linkedPetName: updatedAnimal.name
        }
      }));

      if (updatedAnimal.id) {
        updateAnimal(updatedAnimal.id, updatedAnimal, true);
      }

      addToast("✅ Pet profile updated successfully!", "success");
      setIsEditing(false);
    } catch (err) {
      console.error("Edit pet error:", err);
      const msg = err.response?.data?.error || err.message || "Failed to update pet details.";
      setServerError(msg);
      addToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ──────────────── Top Header Bar ────────────────
  const renderHeader = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        paddingBottom: "12px",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        marginBottom: "8px"
      }}
    >
      <button
        onClick={() => navigate("/")}
        style={{
          background: "none",
          border: 0,
          color: "var(--text-muted)",
          cursor: "pointer",
          fontSize: "0.82rem",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontWeight: 700
        }}
      >
        <ArrowLeft size={14} /> Portal Selection
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#1E1E2E",
                backgroundColor: "#F3F4F6",
                padding: "4px 10px",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <User size={12} color="#6366F1" />
              {user.name} ({user.role})
            </span>
            <button
              onClick={() => logout()}
              title="Log out"
              style={{
                background: "none",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                padding: "4px 8px",
                cursor: "pointer",
                color: "#6B7280",
                fontSize: "0.75rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <LogOut size={12} /> Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate(`/login?redirect=/scan/${tagId}&role=parent`)}
            className="btn btn-outline"
            style={{
              padding: "5px 12px",
              fontSize: "0.78rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "8px"
            }}
          >
            <LogIn size={13} /> Log In
          </button>
        )}
      </div>
    </div>
  );

  // ──────────────── Loading skeleton ────────────────
  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F7F5F0", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div className="card" style={{ padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", borderRadius: "24px", maxWidth: "480px", width: "100%" }}>
          <div className="skeleton" style={{ width: "80px", height: "80px", borderRadius: "50%" }} />
          <div className="skeleton" style={{ width: "180px", height: "24px" }} />
          <div className="skeleton" style={{ width: "100%", height: "100px", borderRadius: "12px" }} />
        </div>
      </div>
    );
  }

  // ──────────────── SCENARIO 1 & 1B: UNCLAIMED QR TOKEN ────────────────
  if (tokenState?.type === "unclaimed") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F7F5F0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        <div style={{ maxWidth: "500px", width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
          {renderHeader()}

          {serverError && (
            <div
              style={{
                backgroundColor: "#FEF2F2",
                border: "1px solid #FCA5A5",
                borderRadius: "12px",
                padding: "14px 16px",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                color: "#991B1B",
                fontSize: "0.85rem"
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ display: "block", marginBottom: "2px" }}>Registration Error</strong>
                <span>{serverError}</span>
              </div>
            </div>
          )}

          {!user ? (
            /* Scenario 1: Not logged in */
            <div className="card" style={{ padding: "36px 28px", textAlign: "center", borderRadius: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
              <div style={{ width: "70px", height: "70px", borderRadius: "50%", backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <QrCode size={34} color="#D97706" />
              </div>

              <div>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1E1E2E", margin: "0 0 8px" }}>
                  Tag Not Yet Activated
                </h2>
                <p style={{ fontSize: "0.875rem", color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
                  This collar tag exists in the PetLink system but has not been linked to a pet profile yet.
                </p>
              </div>

              <div style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "14px", padding: "16px 18px", width: "100%", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <Clock size={16} color="#D97706" />
                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#92400E" }}>Assigned Tag — Activation Required</span>
                </div>
                <p style={{ fontSize: "0.82rem", color: "#78350F", margin: 0, lineHeight: 1.5 }}>
                  Are you the pet parent who received this collar tag? Log in to your PetLink account to fill in your pet's details and activate this tag immediately.
                </p>
              </div>

              <div style={{ fontSize: "0.72rem", color: "#9CA3AF", borderTop: "1px solid #F3F4F6", paddingTop: "14px", width: "100%" }}>
                Collar Tag ID: <code style={{ fontFamily: "monospace", color: "#6366F1", fontWeight: 700 }}>{tagId}</code>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => navigate(`/login?redirect=/scan/${tagId}&role=parent`)}
                style={{ width: "100%", padding: "12px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                <LogIn size={16} /> Log In as Pet Parent to Activate
              </button>

              <button className="btn btn-outline" onClick={() => navigate("/")} style={{ width: "100%", fontSize: "0.82rem" }}>
                Return to Portal Selection
              </button>
            </div>
          ) : (
            /* Scenario 1b: Logged in -> Fill-in Form */
            <div className="card" style={{ padding: "30px 24px", borderRadius: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", backgroundColor: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <QrCode size={22} color="#4F46E5" />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, color: "#1E1E2E" }}>
                    Activate Collar Tag
                  </h2>
                  <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>
                    Linking Tag <code style={{ color: "#4F46E5", fontWeight: 700 }}>{tagId}</code> to your pet
                  </span>
                </div>
              </div>

              <div style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "10px", padding: "10px 14px", marginBottom: "18px", fontSize: "0.8rem", color: "#166534" }}>
                Logged in as <strong>{user.name}</strong>. Complete the details below to claim this tag and publish your pet's public safety profile.
              </div>

              <form onSubmit={handleRegisterFillIn} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Pet Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Bella, Bruno, Milo"
                    value={fillFormData.name}
                    onChange={(e) => setFillFormData({ ...fillFormData, name: e.target.value })}
                  />
                  {formErrors.name && <span style={{ fontSize: "0.72rem", color: "#DC2626", fontWeight: 600 }}>{formErrors.name}</span>}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Species *</label>
                    <select
                      className="form-control"
                      value={fillFormData.species}
                      onChange={(e) => setFillFormData({ ...fillFormData, species: e.target.value })}
                    >
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Bird">Bird</option>
                      <option value="Rabbit">Rabbit</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Gender</label>
                    <select
                      className="form-control"
                      value={fillFormData.gender}
                      onChange={(e) => setFillFormData({ ...fillFormData, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Breed *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Golden Retriever, Indie, Persian"
                    value={fillFormData.breed}
                    onChange={(e) => setFillFormData({ ...fillFormData, breed: e.target.value })}
                  />
                  {formErrors.breed && <span style={{ fontSize: "0.72rem", color: "#DC2626", fontWeight: 600 }}>{formErrors.breed}</span>}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Age *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 2 years"
                      value={fillFormData.age}
                      onChange={(e) => setFillFormData({ ...fillFormData, age: e.target.value })}
                    />
                    {formErrors.age && <span style={{ fontSize: "0.72rem", color: "#DC2626", fontWeight: 600 }}>{formErrors.age}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Weight *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 14 kg"
                      value={fillFormData.weight}
                      onChange={(e) => setFillFormData({ ...fillFormData, weight: e.target.value })}
                    />
                    {formErrors.weight && <span style={{ fontSize: "0.72rem", color: "#DC2626", fontWeight: 600 }}>{formErrors.weight}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Pet Photo *</label>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    {fillFormData.photo && (
                      <img
                        src={fillFormData.photo}
                        alt="Preview"
                        style={{ width: "56px", height: "56px", borderRadius: "10px", objectFit: "cover", border: "1px solid #E5E7EB" }}
                      />
                    )}
                    <label className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", padding: "8px 14px", fontSize: "0.8rem" }}>
                      <Camera size={14} /> Upload Custom Photo
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const b64 = await convertToBase64(file);
                            setFillFormData({ ...fillFormData, photo: b64 });
                          }
                        }}
                      />
                    </label>
                  </div>
                  {/* Preset quick select photos */}
                  <div style={{ marginTop: "8px", display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.72rem", color: "#6B7280" }}>Or pick preset:</span>
                    {SAMPLE_PET_PHOTOS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFillFormData({ ...fillFormData, photo: p.url })}
                        style={{
                          fontSize: "0.7rem",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          border: fillFormData.photo === p.url ? "1px solid #4F46E5" : "1px solid #E5E7EB",
                          backgroundColor: fillFormData.photo === p.url ? "#EEF2FF" : "#FFF",
                          color: fillFormData.photo === p.url ? "#4F46E5" : "#374151",
                          cursor: "pointer"
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  {formErrors.photo && <span style={{ fontSize: "0.72rem", color: "#DC2626", fontWeight: 600 }}>{formErrors.photo}</span>}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Vaccination Status</label>
                    <select
                      className="form-control"
                      value={fillFormData.vaccinationStatus}
                      onChange={(e) => setFillFormData({ ...fillFormData, vaccinationStatus: e.target.value })}
                    >
                      <option value="Fully Vaccinated">Fully Vaccinated</option>
                      <option value="Partially Vaccinated">Partially Vaccinated</option>
                      <option value="Not Vaccinated">Not Vaccinated</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Sterilization Status</label>
                    <select
                      className="form-control"
                      value={fillFormData.sterilizationStatus}
                      onChange={(e) => setFillFormData({ ...fillFormData, sterilizationStatus: e.target.value })}
                    >
                      <option value="Sterilized">Sterilized</option>
                      <option value="Not Sterilized">Not Sterilized</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "12px", fontWeight: 700, marginTop: "8px" }}
                >
                  {isSubmitting ? "Linking & Activating Tag..." : "Complete Registration & Activate Tag"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ──────────────── LEGACY ANIMAL NOT FOUND ────────────────
  if (!pet) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#FCFAF6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ maxWidth: "450px", width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
          {renderHeader()}
          <div className="card" style={{ width: "100%", padding: "40px", textAlign: "center", borderRadius: "20px" }}>
            <AlertTriangle size={48} color="var(--accent-coral)" style={{ margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Collar Tag Not Found</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", margin: "8px 0 20px" }}>
              The scanned collar QR tag does not match any digital animal records in the municipal registry.
            </p>
            <button className="btn btn-primary" onClick={() => navigate("/")} style={{ width: "100%" }}>
              Go to Portal Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────── SCENARIO 2 & 3: CLAIMED PET PROFILE (OR LEGACY SCAN) ────────────────
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F7F5F0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ maxWidth: "500px", width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
        {renderHeader()}

        {serverError && (
          <div
            style={{
              backgroundColor: "#FEF2F2",
              border: "1px solid #FCA5A5",
              borderRadius: "12px",
              padding: "14px 16px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              color: "#991B1B",
              fontSize: "0.85rem"
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong style={{ display: "block", marginBottom: "2px" }}>Update Error</strong>
              <span>{serverError}</span>
            </div>
          </div>
        )}

        {isEditing ? (
          /* ── INLINE EDIT FORM (Scenario 3 edit mode) ── */
          <div className="card animate-scale-up" style={{ padding: "28px 24px", borderRadius: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0, color: "#1E1E2E" }}>
                  Edit Pet Profile
                </h2>
                <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>
                  Collar Tag: <code style={{ color: "#D97706", fontWeight: 700 }}>{tagId}</code>
                </span>
              </div>
              <button
                type="button"
                onClick={() => { setIsEditing(false); setServerError(""); }}
                style={{
                  background: "none",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  color: "#6B7280",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <X size={14} /> Cancel
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Pet Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
                {formErrors.name && <span style={{ fontSize: "0.72rem", color: "#DC2626", fontWeight: 600 }}>{formErrors.name}</span>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Species</label>
                  <select
                    className="form-control"
                    value={editFormData.species}
                    onChange={(e) => setEditFormData({ ...editFormData, species: e.target.value })}
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Gender</label>
                  <select
                    className="form-control"
                    value={editFormData.gender}
                    onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Breed *</label>
                <input
                  type="text"
                  className="form-control"
                  value={editFormData.breed}
                  onChange={(e) => setEditFormData({ ...editFormData, breed: e.target.value })}
                />
                {formErrors.breed && <span style={{ fontSize: "0.72rem", color: "#DC2626", fontWeight: 600 }}>{formErrors.breed}</span>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Age *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editFormData.age}
                    onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                  />
                  {formErrors.age && <span style={{ fontSize: "0.72rem", color: "#DC2626", fontWeight: 600 }}>{formErrors.age}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Weight *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editFormData.weight}
                    onChange={(e) => setEditFormData({ ...editFormData, weight: e.target.value })}
                  />
                  {formErrors.weight && <span style={{ fontSize: "0.72rem", color: "#DC2626", fontWeight: 600 }}>{formErrors.weight}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Photo</label>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  {editFormData.photo && (
                    <img
                      src={editFormData.photo}
                      alt="Preview"
                      style={{ width: "56px", height: "56px", borderRadius: "10px", objectFit: "cover", border: "1px solid #E5E7EB" }}
                    />
                  )}
                  <label className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", padding: "8px 14px", fontSize: "0.8rem" }}>
                    <Camera size={14} /> Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const b64 = await convertToBase64(file);
                          setEditFormData({ ...editFormData, photo: b64 });
                        }
                      }}
                    />
                  </label>
                </div>
                <div style={{ marginTop: "8px", display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.72rem", color: "#6B7280" }}>Preset photos:</span>
                  {SAMPLE_PET_PHOTOS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, photo: p.url })}
                      style={{
                        fontSize: "0.7rem",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        border: editFormData.photo === p.url ? "1px solid #D97706" : "1px solid #E5E7EB",
                        backgroundColor: editFormData.photo === p.url ? "#FEF3C7" : "#FFF",
                        color: editFormData.photo === p.url ? "#B45309" : "#374151",
                        cursor: "pointer"
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Vaccination Status</label>
                  <select
                    className="form-control"
                    value={editFormData.vaccinationStatus}
                    onChange={(e) => setEditFormData({ ...editFormData, vaccinationStatus: e.target.value })}
                  >
                    <option value="Fully Vaccinated">Fully Vaccinated</option>
                    <option value="Partially Vaccinated">Partially Vaccinated</option>
                    <option value="Not Vaccinated">Not Vaccinated</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Sterilization Status</label>
                  <select
                    className="form-control"
                    value={editFormData.sterilizationStatus}
                    onChange={(e) => setEditFormData({ ...editFormData, sterilizationStatus: e.target.value })}
                  >
                    <option value="Sterilized">Sterilized</option>
                    <option value="Not Sterilized">Not Sterilized</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-outline"
                  style={{ flex: 1, padding: "11px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ flex: 2, padding: "11px", backgroundColor: "#D97706", borderColor: "#D97706", fontWeight: 700 }}
                >
                  {isSubmitting ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        ) : step === 1 ? (
          /* ── PUBLIC PET PROFILE VIEW (Scenario 2 & 3) ── */
          <div className="animate-scale-up" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Tag: {tagId}
              </span>

              {/* Scenario 3: If owner is logged in, show the Edit Pet Details button */}
              {isOwner && (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setServerError("");
                    setEditFormData({
                      name: pet.name || "",
                      species: pet.species || "Dog",
                      breed: pet.breed || "",
                      gender: pet.gender || "Male",
                      age: pet.age || "",
                      weight: pet.weight || "",
                      photo: pet.photo || SAMPLE_PET_PHOTOS[0].url,
                      vaccinationStatus: pet.healthSummary?.vaccinationStatus || "Fully Vaccinated",
                      sterilizationStatus: pet.healthSummary?.sterilizationStatus || "Sterilized"
                    });
                  }}
                  className="btn btn-outline"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    borderColor: "#D97706",
                    color: "#D97706",
                    backgroundColor: "rgba(217, 119, 6, 0.08)",
                    borderRadius: "8px"
                  }}
                >
                  <Edit size={13} /> Edit Pet Details
                </button>
              )}
            </div>

            {/* Registered Owner Banner when logged in as owner */}
            {isOwner && (
              <div style={{ backgroundColor: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: "10px", padding: "8px 12px", fontSize: "0.78rem", color: "#92400E", display: "flex", alignItems: "center", gap: "6px" }}>
                <Check size={14} color="#D97706" />
                <span>You are logged in as the verified owner of this pet tag.</span>
              </div>
            )}

            {/* Animal profile card */}
            <div className="card" style={{ padding: "0px", borderRadius: "24px", overflow: "hidden", border: "1px solid var(--border-color)", boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>
              <div style={{ position: "relative", height: "280px" }}>
                <img src={pet.photo} alt={pet.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", bottom: "16px", left: "16px", zIndex: 10 }}>
                  <span
                    className={`badge badge-${pet.status === "Lost" ? "rescued" : "adopted"}`}
                    style={{ fontSize: "0.75rem", padding: "6px 14px", border: "2px solid white", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                  >
                    {pet.status === "Lost" ? "⚠️ Reported Lost" : "🟢 Registered Safe"}
                  </span>
                </div>
              </div>

              <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h1 style={{ fontSize: "1.7rem", fontWeight: 800, margin: 0, color: "var(--text-main)" }}>{pet.name}</h1>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "4px", fontWeight: 500 }}>
                    {pet.species} • {pet.breed} {pet.gender ? `• ${pet.gender}` : ""} {pet.age ? `• ${pet.age}` : ""}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", backgroundColor: "#FCFAF6", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                  <ShieldCheck size={18} color="var(--primary-color)" />
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)" }}>
                    Collar Chip registered with Pune Municipal Welfare.
                  </span>
                </div>

                {pet.status === "Lost" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "8px" }}>
                    <div style={{ backgroundColor: "var(--accent-coral-light)", padding: "16px", borderRadius: "14px", border: "1px solid rgba(224, 93, 93, 0.15)" }}>
                      <h4 style={{ color: "var(--accent-coral)", fontWeight: 800, fontSize: "0.92rem", margin: "0 0 4px" }}>
                        Help Us Find {pet.name}!
                      </h4>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
                        This animal has been flagged as missing by their custodian. Please submit your current location details to trigger coordinates tracking.
                      </p>
                    </div>

                    <form onSubmit={handleSubmitReport} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 800 }}>Found Location / Landmark Address *</label>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Near Kothrud Petrol Pump, Pune"
                            value={reportFormData.location}
                            onChange={(e) => { setReportFormData({ ...reportFormData, location: e.target.value }); setReportError(""); }}
                            required
                          />
                          <button type="button" className="btn btn-outline" style={{ padding: "10px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={handleGPSAutoCapture} title="Auto Capture Coordinates">
                            <MapPin size={18} />
                          </button>
                        </div>
                        {reportError && <span style={{ fontSize: "0.72rem", color: "var(--accent-coral)", fontWeight: 700, marginTop: "4px", display: "block" }}>{reportError}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 800 }}>Upload Current Photo (Optional)</label>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <label className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "8px 16px", fontSize: "0.82rem" }}>
                            <Camera size={14} /> Snap / Pick File
                            <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleReportPhotoUpload} />
                          </label>
                          {reportFormData.photoPreview && (
                            <img src={reportFormData.photoPreview} alt="Upload preview" style={{ width: "44px", height: "44px", borderRadius: "6px", objectFit: "cover" }} />
                          )}
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 800 }}>Your Contact Number (Optional)</label>
                        <div style={{ position: "relative" }}>
                          <Phone size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                          <input type="text" className="form-control" placeholder="e.g. +91 98765 43210" style={{ paddingLeft: "36px" }} value={reportFormData.contact} onChange={(e) => setReportFormData({ ...reportFormData, contact: e.target.value })} />
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ width: "100%", backgroundColor: "var(--accent-coral)", borderColor: "var(--accent-coral)", padding: "12px", fontWeight: 800, marginTop: "10px" }}>
                        Submit Found Report
                      </button>
                    </form>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px", borderTop: "1px solid var(--border-color)", paddingTop: "20px" }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, color: "var(--primary-color)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <CheckCircle size={16} /> Safe &amp; Cared For
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                      This pet has a registered custodian and is not reported missing.
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "6px" }}>
                      <div style={{ padding: "12px 14px", backgroundColor: "#FCFAF6", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                        <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Vaccination Status</span>
                        <p style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-main)", margin: "4px 0 0" }}>{pet.healthSummary?.vaccinationStatus || "Not on file"}</p>
                      </div>
                      <div style={{ padding: "12px 14px", backgroundColor: "#FCFAF6", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                        <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Sterilization Status</span>
                        <p style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-main)", margin: "4px 0 0" }}>{pet.healthSummary?.sterilizationStatus || "Not on file"}</p>
                      </div>
                    </div>

                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "6px 0 0", lineHeight: 1.4 }}>
                      Owner contact details are kept private. If this pet appears distressed or unattended, please use the municipal rescue network.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Found report submission success */
          <div className="card animate-scale-up" style={{ padding: "40px 32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "18px", borderRadius: "24px" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "var(--secondary-light)", color: "var(--primary-color)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle size={32} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>Thank you, Finder!</h2>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "8px", lineHeight: 1.5 }}>
                Your report has been successfully logged. {pet.name}'s custodian and municipal volunteer rescue hubs have been notified of your location.
              </p>
            </div>
            <div style={{ width: "100%", borderTop: "1px solid var(--border-color)", paddingTop: "20px", marginTop: "10px" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0 0 16px" }}>
                Keep this window open to receive proximity alerts once a custodian responds.
              </p>
              <button className="btn btn-outline" onClick={() => navigate("/")} style={{ width: "100%" }}>
                Return to Selector
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicScanPage;
