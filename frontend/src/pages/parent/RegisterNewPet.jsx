import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import client from "../../api/client";
import {
  ArrowLeft,
  ShieldCheck,
  Upload,
  Info,
  Sparkles,
  Lock,
  Lightbulb,
  PawPrint,
  Check,
  CreditCard,
  QrCode
} from "lucide-react";

const RegisterNewPet = () => {
  const { registerPetPersisted, addToast } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenIdParam = searchParams.get("tokenId") || "";
  const [activeTokenId, setActiveTokenId] = useState(tokenIdParam);
  const fileInputRef = useRef(null);

  // Auto-fetch unclaimed token assigned to this parent if not specified in URL
  useEffect(() => {
    if (tokenIdParam) {
      setActiveTokenId(tokenIdParam);
      return;
    }
    client.get("/tokens/mine")
      .then(async (res) => {
        const batches = res.data || [];
        for (const b of batches) {
          if (b.unclaimedCount > 0) {
            try {
              const detail = await client.get(`/tokens/mine/batches/${b.batchId}`);
              const freeTokens = (detail.data || []).filter(t => t.status !== "claimed");
              if (freeTokens.length > 0) {
                setActiveTokenId(freeTokens[0].tokenId);
                break;
              }
            } catch {}
          }
        }
      })
      .catch(() => {});
  }, [tokenIdParam]);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    species: "Dog",
    breed: "",
    gender: "Male",
    age: "",
    weight: "",
    photoFile: null,
    photoPreview: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      try {
        const base64 = await convertToBase64(file);
        setFormData((prev) => ({
          ...prev,
          photoFile: file,
          photoPreview: base64
        }));
        if (errors.photo) {
          setErrors((prev) => ({ ...prev, photo: null }));
        }
      } catch (err) {
        addToast("Failed to process photo file", "error");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tempErrors = {};

    if (!formData.name.trim()) tempErrors.name = "Pet name is required";
    if (!formData.breed.trim()) tempErrors.breed = "Breed is required";
    if (!formData.age.trim()) tempErrors.age = "Estimated age is required (e.g. '2 years')";
    if (!formData.weight.trim()) tempErrors.weight = "Weight is required (e.g. '14 kg')";
    if (!formData.photoPreview) tempErrors.photo = "Pet photo is required for digital collar tag validation";

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      addToast("Failed to register. Please resolve highlighted form errors.", "error");
      return;
    }

    setIsSubmitting(true);

    // Generate mock parameters
    const mockId = `PL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPet = {
      id: mockId,
      name: formData.name.trim(),
      species: formData.species,
      breed: formData.breed.trim(),
      gender: formData.gender,
      age: formData.age.trim(),
      weight: formData.weight.trim(),
      photo: formData.photoPreview,
      status: "Adopted",
      custodian: user ? `${user.name} (Home)` : "Home Guardian",
      ownerId: user?.id,
      createdBy: user?.id,
      lastUpdated: "Just now",
      tokenId: activeTokenId || null,
      qrCode: activeTokenId || `MOCK-QR-${mockId}`,
      timeline: [
        {
          date: new Date().toISOString().split("T")[0],
          title: "Registry Created",
          description: `Direct domestic registration by Parent ${user?.name || "Guardian"}. Collar tag ${activeTokenId || mockId} issued.`
        }
      ],
      healthSummary: {
        vaccinationStatus: "Not Vaccinated",
        sterilizationStatus: "Not Sterilized",
        treatmentNotes: "Registered directly by parent. No previous rescue timeline logged."
      },
      documents: []
    };

    try {
      await registerPetPersisted(newPet);
      if (activeTokenId) {
        try {
          await client.post('/tokens/claim', {
            tokenId: activeTokenId,
            animalId: mockId,
            petName: newPet.name
          });
          addToast(`🎉 Collar tag ${activeTokenId} claimed and linked to ${newPet.name}!`, "success");
        } catch (claimErr) {
          console.error("Token claim failed:", claimErr);
          addToast(`Registered pet, but token claim had an issue: ${claimErr.response?.data?.error || claimErr.message}`, "warning");
        }
      } else {
        addToast(`🎉 ${newPet.name} successfully registered with digital tag ${mockId}!`, "success");
      }
      navigate("/parent/pets");
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="parent-content-wrap parent-register-container">
      {/* 1. TOP NAVIGATION ROW */}
      <div className="parent-register-nav-row">
        <button
          type="button"
          className="parent-register-back-btn"
          onClick={() => navigate("/parent/pets")}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="parent-register-protocol-pill">
          <ShieldCheck size={14} /> Household Registry Protocol
        </div>
      </div>

      {/* 2. HERO HEADER CARD */}
      <div className="parent-register-hero-card">
        <div>
          <span className="parent-register-hero-badge">
            NEW DIGITAL PET COLLAR
          </span>
          <h1 className="parent-register-hero-title">
            Register Family Pet
          </h1>
          <p className="parent-register-hero-sub">
            Create a digital identity collar tag for pets born or reared directly inside your household.
          </p>
        </div>

        <div className="parent-register-hero-icon-box">
          <CreditCard size={36} color="#EA580C" strokeWidth={1.8} />
          <div className="parent-register-hero-plus-badge">+</div>
        </div>
      </div>

      {/* Pre-Assigned Collar Token Linked Banner */}
      {activeTokenId && (
        <div style={{ backgroundColor: "#EEF2FF", border: "1.5px solid #C7D2FE", borderRadius: "14px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "12px", backgroundColor: "#E0E7FF", color: "#4338CA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <QrCode size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#4338CA", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Assigned Collar Tag Linked
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#1E1B4B", marginTop: "2px" }}>
              Linking this pet directly to Collar Tag: <code style={{ fontFamily: "monospace", color: "#4F46E5", background: "#FFFFFF", padding: "2px 8px", borderRadius: "6px", border: "1px solid #C7D2FE" }}>{activeTokenId}</code>
            </div>
            <p style={{ margin: "3px 0 0", fontSize: "0.8rem", color: "#6B7280" }}>
              Upon registration, this token will be automatically claimed and linked to your pet. Scanning the physical tag or QR code will display this pet's profile.
            </p>
          </div>
        </div>
      )}

      {/* 3. IMPORTANT VERIFICATION NOTICE BANNER */}
      <div className="parent-register-notice-box">
        <div className="parent-register-notice-icon">i</div>
        <div className="parent-register-notice-text">
          <strong>Important Verification Policy:</strong> Vets and parents cannot register stray rescues.
          If your pet was adopted through a shelter, do not fill this form—the NGO's approval automatically
          grants registry rights. Use this form <u>only</u> for private household pets.
        </div>
      </div>

      {/* 4. MAIN 2-COLUMN GRID */}
      <div className="parent-register-grid">
        {/* Left Column: Form Card */}
        <div className="parent-register-form-card">
          <form onSubmit={handleSubmit}>
            {/* Pet Photo Section */}
            <div className="parent-register-photo-section">
              <label className="parent-register-section-label">
                Pet Photo Profile *
              </label>

              <div className="parent-register-photo-box">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />

                <div
                  className="parent-register-photo-uploader"
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to upload pet portrait"
                >
                  {formData.photoPreview ? (
                    <img
                      src={formData.photoPreview}
                      alt="Pet preview"
                      className="parent-register-photo-preview"
                    />
                  ) : (
                    <>
                      <Upload size={22} color="#EA580C" />
                      <span className="parent-register-photo-upload-label">
                        Upload<br />Photo
                      </span>
                    </>
                  )}
                </div>

                <div className="parent-register-photo-info">
                  <h4>Clear front portrait recommended</h4>
                  <p>
                    JPG, PNG, or WEBP up to 5MB. This photo will be engraved onto the live NFC smart tag & lost-alert flyers.
                  </p>
                  {errors.photo && (
                    <p style={{ color: "#DC2626", fontWeight: 700, marginTop: "6px" }}>
                      ⚠️ {errors.photo}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Inputs Grid (2 columns) */}
            <div className="parent-register-fields-grid">
              {/* Pet Name */}
              <div className="parent-register-field">
                <label className="parent-register-field-label">Pet Name *</label>
                <input
                  type="text"
                  className="parent-register-input"
                  placeholder="e.g. Bruno"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: null });
                  }}
                />
                {errors.name && (
                  <span style={{ color: "#DC2626", fontSize: "0.75rem", fontWeight: 700 }}>
                    {errors.name}
                  </span>
                )}
              </div>

              {/* Species */}
              <div className="parent-register-field">
                <label className="parent-register-field-label">Species *</label>
                <select
                  className="parent-register-select"
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Rabbit">Rabbit</option>
                  <option value="Bird">Bird</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Breed */}
              <div className="parent-register-field">
                <label className="parent-register-field-label">Breed *</label>
                <input
                  type="text"
                  className="parent-register-input"
                  placeholder="e.g. Indie / Persian Cat"
                  value={formData.breed}
                  onChange={(e) => {
                    setFormData({ ...formData, breed: e.target.value });
                    if (errors.breed) setErrors({ ...errors, breed: null });
                  }}
                />
                {errors.breed && (
                  <span style={{ color: "#DC2626", fontSize: "0.75rem", fontWeight: 700 }}>
                    {errors.breed}
                  </span>
                )}
              </div>

              {/* Gender */}
              <div className="parent-register-field">
                <label className="parent-register-field-label">Gender *</label>
                <select
                  className="parent-register-select"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Estimated Age */}
              <div className="parent-register-field">
                <label className="parent-register-field-label">Estimated Age *</label>
                <input
                  type="text"
                  className="parent-register-input"
                  placeholder="e.g. 2 years / 6 months"
                  value={formData.age}
                  onChange={(e) => {
                    setFormData({ ...formData, age: e.target.value });
                    if (errors.age) setErrors({ ...errors, age: null });
                  }}
                />
                {errors.age && (
                  <span style={{ color: "#DC2626", fontSize: "0.75rem", fontWeight: 700 }}>
                    {errors.age}
                  </span>
                )}
              </div>

              {/* Weight */}
              <div className="parent-register-field">
                <label className="parent-register-field-label">Weight *</label>
                <input
                  type="text"
                  className="parent-register-input"
                  placeholder="e.g. 14 kg / 4.2 kg"
                  value={formData.weight}
                  onChange={(e) => {
                    setFormData({ ...formData, weight: e.target.value });
                    if (errors.weight) setErrors({ ...errors, weight: null });
                  }}
                />
                {errors.weight && (
                  <span style={{ color: "#DC2626", fontSize: "0.75rem", fontWeight: 700 }}>
                    {errors.weight}
                  </span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="parent-register-submit-btn"
            >
              <Sparkles size={18} />
              <span>{isSubmitting ? "Registering Tag..." : "Register Digital Identity Card"}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Sidecar Cards */}
        <div className="parent-register-sidecar">
          {/* Tag Preview Card */}
          <div className="parent-register-preview-card">
            <div className="parent-register-preview-head">
              <span className="parent-register-preview-tag">
                TAG PREVIEW
              </span>
              <span className="parent-register-nfc-pill">
                <span className="parent-register-nfc-dot" /> Live NFC Tag
              </span>
            </div>

            <div className="parent-register-inner-card">
              <div className="parent-register-inner-pet-head">
                <div className="parent-register-inner-avatar">
                  {formData.photoPreview ? (
                    <img
                      src={formData.photoPreview}
                      alt="Avatar"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <PawPrint size={24} color="#EA580C" />
                  )}
                </div>
                <div>
                  <h3 className="parent-register-inner-pet-name">
                    {formData.name.trim() || "Pet Name"}
                  </h3>
                  <p className="parent-register-inner-pet-sub">
                    {formData.species} • Household...
                  </p>
                </div>
              </div>

              <div className="parent-register-inner-stats">
                <div className="parent-register-stat-box orange">
                  <span className="parent-register-stat-label">REGISTRY STATUS</span>
                  <span className="parent-register-stat-val">Ready to Issue</span>
                </div>

                <div className="parent-register-stat-box slate">
                  <span className="parent-register-stat-label">QR MICROCHIP</span>
                  <span className="parent-register-stat-val">V4 Encrypted</span>
                </div>
              </div>
            </div>

            <div className="parent-register-lock-note">
              <Lock size={14} color="#6366F1" style={{ marginTop: "2px", flexShrink: 0 }} />
              <span>
                Once registered, the digital ID collar code links directly to your family dashboard and emergency locator.
              </span>
            </div>
          </div>

          {/* Why Register Early Card */}
          <div className="parent-register-why-card">
            <div className="parent-register-why-head">
              <div className="parent-register-why-icon-circle">
                <Lightbulb size={16} color="#16A34A" />
              </div>
              <h4 className="parent-register-why-title">Why register early?</h4>
            </div>
            <p className="parent-register-why-text">
              Registered family pets receive fast-track triage at network partner clinics and instant community push alerts if reported missing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterNewPet;
