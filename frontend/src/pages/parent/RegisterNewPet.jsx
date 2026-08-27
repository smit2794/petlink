import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { PlusCircle, Upload, Info, CheckCircle, ArrowLeft } from "lucide-react";

const RegisterNewPet = () => {
  const { registerPetPersisted, addToast } = useApp();
  const navigate = useNavigate();

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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        photoFile: file,
        photoPreview: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tempErrors = {};

    if (!formData.name.trim()) tempErrors.name = "Pet name is required";
    if (!formData.breed.trim()) tempErrors.breed = "Breed is required";
    if (!formData.age.trim()) tempErrors.age = "Estimated age is required (e.g. '2 years')";
    if (!formData.weight.trim()) tempErrors.weight = "Weight is required (e.g. '12 kg')";
    if (!formData.photoPreview) tempErrors.photo = "Pet photo is required for digital collar tag validation";

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      addToast("Failed to register. Please resolve form errors.", "error");
      return;
    }

    // Generate mock parameters
    const mockId = `PL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPet = {
      id: mockId,
      name: formData.name,
      species: formData.species,
      breed: formData.breed,
      gender: formData.gender,
      age: formData.age,
      weight: formData.weight,
      photo: formData.photoPreview,
      status: "Adopted",
      custodian: "Aarav Sharma (Home)",
      lastUpdated: "Just now",
      qrCode: `MOCK-QR-${mockId}`,
      timeline: [
        { 
          date: new Date().toISOString().split("T")[0], 
          title: "Registry Created", 
          description: `Direct domestic registration by Parent Aarav Sharma. Collar tag issued under ID ${mockId}.` 
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
      navigate("/parent/pets");
    } catch (err) {
      // error toast already shown inside registerPetPersisted
    }
  };
  

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "600px", margin: "0 auto" }}>
      
      {/* Header Back Link */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate("/parent/pets")}>
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      {/* Title */}
      <div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
          Register Family Pet
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginTop: "4px" }}>
          Create a digital identity collar tag for pets born or reared directly inside your household.
        </p>
      </div>

      {/* Informational constraint warning callout */}
      <div style={{
        display: "flex",
        gap: "12px",
        padding: "16px 20px",
        backgroundColor: "var(--accent-amber-light)",
        color: "var(--accent-amber)",
        borderRadius: "14px",
        border: "1px solid rgba(224, 144, 37, 0.15)",
        fontSize: "0.88rem",
        lineHeight: 1.4
      }}>
        <Info size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
        <div>
          <strong>Important Verification Policy:</strong> Vets and parents cannot register stray rescues. 
          If your pet was adopted through a shelter, do not fill this form—the NGO's approval automatically grants registry rights. 
          Use this form <strong>only</strong> for private household pets.
        </div>
      </div>

      {/* Registration Form Card */}
      <div className="card" style={{ padding: "32px" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          
          {/* Photo Upload slot */}
          <div className="form-group" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <label className="form-label" style={{ alignSelf: "flex-start", fontWeight: 800 }}>Pet Photo Profile *</label>
            
            {formData.photoPreview ? (
              <div style={{ position: "relative", width: "120px", height: "120px" }}>
                <img 
                  src={formData.photoPreview} 
                  alt="Preview" 
                  style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent-amber)" }} 
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, photoFile: null, photoPreview: "" })}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    backgroundColor: "var(--accent-coral)",
                    color: "white",
                    border: 0,
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <label style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                border: errors.photo ? "2px dashed var(--accent-coral)" : "2px dashed var(--border-color)",
                backgroundColor: "#FCFAF6",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-muted)",
                fontSize: "0.8rem",
                transition: "all var(--transition-fast)"
              }}>
                <Upload size={20} style={{ marginBottom: "6px" }} />
                <span>Upload Photo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: "none" }} 
                  onChange={handlePhotoChange} 
                />
              </label>
            )}
            {errors.photo && <span className="form-error" style={{ fontSize: "0.75rem" }}>{errors.photo}</span>}
          </div>

          {/* Name & Species */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Pet Name *</label>
              <input
                type="text"
                placeholder="e.g. Bruno"
                className="form-control"
                style={{ borderColor: errors.name ? "var(--accent-coral)" : "" }}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Species *</label>
              <select
                className="form-control"
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
              >
                <option>Dog</option>
                <option>Cat</option>
                <option>Cow</option>
                <option>Bird</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          {/* Breed & Gender */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Breed *</label>
              <input
                type="text"
                placeholder="e.g. Indie / Persian Cat"
                className="form-control"
                style={{ borderColor: errors.breed ? "var(--accent-coral)" : "" }}
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              />
              {errors.breed && <span className="form-error">{errors.breed}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select
                className="form-control"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
          </div>

          {/* Age & Weight */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Estimated Age *</label>
              <input
                type="text"
                placeholder="e.g. 2 years / 6 months"
                className="form-control"
                style={{ borderColor: errors.age ? "var(--accent-coral)" : "" }}
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
              {errors.age && <span className="form-error">{errors.age}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Weight *</label>
              <input
                type="text"
                placeholder="e.g. 14 kg / 4.2 kg"
                className="form-control"
                style={{ borderColor: errors.weight ? "var(--accent-coral)" : "" }}
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />
              {errors.weight && <span className="form-error">{errors.weight}</span>}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ 
              backgroundColor: "var(--accent-amber)", 
              borderColor: "var(--accent-amber)", 
              marginTop: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            <PlusCircle size={16} /> Register Digital Identity Card
          </button>

        </form>
      </div>

    </div>
  );
};

export default RegisterNewPet;
