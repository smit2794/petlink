import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ShieldCheck, AlertTriangle, MapPin, Camera, Phone, CheckCircle, ArrowLeft } from "lucide-react";

const PublicScanPage = () => {
  const { tagId } = useParams();
  const navigate = useNavigate();
  const { animals, logTagScan, submitFoundReport } = useApp();

  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(1); // 1 = Detail/Form, 2 = Success screen
  const [formData, setFormData] = useState({
    location: "",
    photoPreview: "",
    contact: ""
  });
  const [error, setError] = useState("");
  const scanLoggedRef = useRef(false);

  const pet = animals.find((p) => p.id === tagId);

  useEffect(() => {
    // Resolve scanner check-in simulation on render (run exactly once)
    if (pet && !scanLoggedRef.current) {
      logTagScan(pet.id, "Pune Central Ward (GPS Simulated)");
      scanLoggedRef.current = true;
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 550);

    return () => clearTimeout(timer);
  }, [tagId, pet]);

  if (!pet) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#FCFAF6", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div className="card" style={{ maxWidth: "450px", width: "100%", padding: "40px", textAlign: "center", borderRadius: "20px" }}>
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
    );
  }

  const handleGPSAutoCapture = () => {
    // Simulate GPS coordinates capture
    setFormData((prev) => ({
      ...prev,
      location: "Lat: 18.5204, Lng: 73.8567 (Pune Central Depot Area)"
    }));
    setError("");
  };

  const handlePhotoUploadMock = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        photoPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!formData.location.trim()) {
      setError("Please supply your current location coordinates or landmark address.");
      return;
    }

    try {
      await submitFoundReport(pet.id, {
        finderLocation: formData.location,
        finderPhoto: formData.photoPreview,
        finderContact: formData.contact
      });
      setStep(2);
    } catch (err) {
      // error toast already shown inside submitFoundReport
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F7F5F0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 16px" }}>
      <div style={{ maxWidth: "480px", width: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {isLoading ? (
          // Resolving scan state skeleton loader
          <div className="card" style={{ padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", borderRadius: "24px" }}>
            <div className="skeleton" style={{ width: "80px", height: "80px", borderRadius: "50%" }} />
            <div className="skeleton" style={{ width: "180px", height: "24px" }} />
            <div className="skeleton" style={{ width: "100%", height: "100px", borderRadius: "12px" }} />
          </div>
        ) : step === 1 ? (
          <div className="animate-scale-up" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* 1. Header Navigation Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={() => navigate("/")} style={{ background: "none", border: 0, color: "var(--text-muted)", cursor: "pointer", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "4px", fontWeight: 700 }}>
                <ArrowLeft size={14} /> Selector Page
              </button>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Collar Tag ID: {pet.id}
              </span>
            </div>

            {/* 2. Main Animal Profile details Card */}
            <div className="card" style={{ padding: "0px", borderRadius: "24px", overflow: "hidden", border: "1px solid var(--border-color)", boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>
              
              {/* Pet Photo Cover */}
              <div style={{ position: "relative", height: "280px" }}>
                <img 
                  src={pet.photo} 
                  alt={pet.name} 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                />
                
                {/* State Tag Overlay */}
                <div style={{ position: "absolute", bottom: "16px", left: "16px", zIndex: 10 }}>
                  <span 
                    className={`badge badge-${pet.status === "Lost" ? "rescued" : "adopted"}`} 
                    style={{ fontSize: "0.75rem", padding: "6px 14px", border: "2px solid white", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                  >
                    {pet.status === "Lost" ? "⚠️ Reported Lost" : "🟢 Registered Safe"}
                  </span>
                </div>
              </div>

              {/* Bio details Block */}
              <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h1 style={{ fontSize: "1.7rem", fontWeight: 800, margin: 0, color: "var(--text-main)" }}>
                    {pet.name}
                  </h1>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "4px", fontWeight: 500 }}>
                    {pet.species} • {pet.breed}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", backgroundColor: "#FCFAF6", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                  <ShieldCheck size={18} color="var(--primary-color)" />
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)" }}>
                    Collar Chip registered with Pune Municipal Welfare.
                  </span>
                </div>

                {/* 3. Render Mode depending on status */}
                {pet.status === "Lost" ? (
                  // Alert Finder Reporting form
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
                      
                      {/* Location details */}
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 800 }}>Found Location / Landmark Address *</label>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="e.g. Near Kothrud Petrol Pump, Pune"
                            value={formData.location}
                            onChange={(e) => { setFormData({ ...formData, location: e.target.value }); setError(""); }}
                            required
                          />
                          <button 
                            type="button" 
                            className="btn btn-outline" 
                            style={{ padding: "10px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                            onClick={handleGPSAutoCapture}
                            title="Auto Capture Coordinates"
                          >
                            <MapPin size={18} />
                          </button>
                        </div>
                        {error && <span style={{ fontSize: "0.72rem", color: "var(--accent-coral)", fontWeight: 700, marginTop: "4px", display: "block" }}>{error}</span>}
                      </div>

                      {/* Photo Capture */}
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 800 }}>Upload Current Photo (Optional)</label>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <label className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "8px 16px", fontSize: "0.82rem" }}>
                            <Camera size={14} /> Snap / Pick File
                            <input 
                              type="file" 
                              accept="image/*" 
                              style={{ display: "none" }} 
                              onChange={handlePhotoUploadMock}
                            />
                          </label>
                          {formData.photoPreview && (
                            <img 
                              src={formData.photoPreview} 
                              alt="Upload preview" 
                              style={{ width: "44px", height: "44px", borderRadius: "6px", objectFit: "cover" }} 
                            />
                          )}
                        </div>
                      </div>

                      {/* Contact Phone */}
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 800 }}>Your Contact Number (Optional)</label>
                        <div style={{ position: "relative" }}>
                          <Phone size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="e.g. +91 98765 43210"
                            style={{ paddingLeft: "36px" }}
                            value={formData.contact}
                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                          />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ width: "100%", backgroundColor: "var(--accent-coral)", borderColor: "var(--accent-coral)", padding: "12px", fontWeight: 800, marginTop: "10px" }}
                      >
                        Submit Found Report
                      </button>

                    </form>
                  </div>
                ) : (
                  // Safe Mode view
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px", borderTop: "1px solid var(--border-color)", paddingTop: "20px" }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, color: "var(--primary-color)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <CheckCircle size={16} /> Safe & Cared For
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                      This pet has a loving custodian node registered in our system and is not reported missing. Thank you for verifying their digital tag compliance details.
                    </p>
                  </div>
                )}

              </div>
            </div>

          </div>
        ) : (
          // Step 2: Verification Success screen
          <div className="card animate-scale-up" style={{ padding: "40px 32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "18px", borderRadius: "24px" }}>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "var(--secondary-light)",
              color: "var(--primary-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
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
