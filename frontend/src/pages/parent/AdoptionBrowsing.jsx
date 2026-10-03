import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import client from "../../api/client";
import { Search, Filter, ClipboardList, Clock, Check, X, Info, Dog } from "lucide-react";

const AdoptionBrowsing = () => {
  const { animals, adoptions, addAdoptionApplication, addAdoptionApplicationPersisted } = useApp();
  const { user } = useAuth();
  const [adoptableList, setAdoptableList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("All");

  // Application Modal States
  const [selectedPet, setSelectedPet] = useState(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [appForm, setAppForm] = useState({
    applicantName: user?.name || "",
    applicantContact: user?.phone || "",
    notes: ""
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Fetch adoptable animals specifically
    client.get("/animals?status=Available for Adoption")
      .then((res) => {
        setAdoptableList(res.data);
      })
      .catch((err) => {
        console.error("Failed to load adoptable animals:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Filter animals marked "Available for Adoption" (from dedicated query or context)
  const availableAnimals = adoptableList.length > 0
    ? adoptableList
    : animals.filter(pet => pet.status === "Available for Adoption");

  const filteredAnimals = availableAnimals.filter(pet => {
    const matchesSearch = 
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecies = speciesFilter === "All" || pet.species === speciesFilter;
    
    return matchesSearch && matchesSpecies;
  });

  // Track parent's own applications
  const myApplications = adoptions.filter(app => app.applicantName === user?.name || app.userId === user?.id);

  const handleOpenPreview = (pet) => {
    setSelectedPet(pet);
    setShowApplyForm(false);
    setAppForm({
      applicantName: user?.name || "",
      applicantContact: user?.phone || "",
      notes: `Interested in adopting ${pet.name}. We have a spacious apartment in Kalyani Nagar with lots of natural light and a balcony. I work from home and can spend full time training.`
    });
    setErrors({});
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!appForm.applicantName || !appForm.applicantContact || !appForm.notes) {
      setErrors({ form: "All fields are required to submit the application dossier." });
      return;
    }

    try {
      await addAdoptionApplicationPersisted({
        applicantName: appForm.applicantName,
        applicantContact: appForm.applicantContact,
        animalId: selectedPet.id,
        animalName: selectedPet.name,
        animalPhoto: selectedPet.photo,
        notes: appForm.notes
      });
    } catch (err) {
      return;
    }

    setShowApplyForm(false);
    setSelectedPet(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Header Summary */}
      <div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
          Adoptable Animal Registry
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
          Browse healthy stray and foster animals ready to join new homes. Apply directly to NGO custodians.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center", padding: "20px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", position: "relative", flex: 1, minWidth: "260px" }}>
          <Search size={16} style={{ position: "absolute", left: "14px", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search adoptable pets by name, breed, or keyword..."
            className="form-control"
            style={{ width: "100%", paddingLeft: "40px", borderRadius: "30px" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Filter size={14} color="var(--text-muted)" />
          <select
            className="form-control"
            style={{ padding: "8px 16px", fontSize: "0.85rem", borderRadius: "30px" }}
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
          >
            <option value="All">All Species</option>
            <option value="Dog">Dogs</option>
            <option value="Cat">Cats</option>
            <option value="Cow">Cattle</option>
            <option value="Bird">Birds</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        // Skeleton grid
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "28px" }}>
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="skeleton skeleton-card" style={{ height: "260px", borderRadius: "20px" }} />
          ))}
        </div>
      ) : (
        /* Main Catalog Grid */
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {filteredAnimals.length === 0 ? (
            <div className="card" style={{ padding: "40px", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No animals matching filters are currently available for adoption.</p>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "28px"
            }}>
              {filteredAnimals.map((pet) => (
                <div
                  key={pet.id}
                  className="card animate-slide-up"
                  onClick={() => handleOpenPreview(pet)}
                  style={{
                    padding: 0,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                    borderRadius: "20px 16px 20px 16px",
                    position: "relative"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                  }}
                >
                  <img 
                    src={pet.photo} 
                    alt={pet.name} 
                    style={{ width: "100%", height: "180px", objectFit: "cover" }}
                  />
                  <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyBetween: "space-between", justifyContent: "space-between", alignItems: "baseline" }}>
                      <strong style={{ fontSize: "1.1rem", color: "var(--text-main)" }}>{pet.name}</strong>
                      <span className="badge badge-shelter" style={{ fontSize: "0.68rem" }}>{pet.species}</span>
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{pet.breed} • {pet.age}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                      Custodian: <strong>{pet.custodian}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* APPLICATION TRACKING DASHBOARD FOR PARENT */}
          {myApplications.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
                <ClipboardList size={18} color="var(--accent-amber)" /> My Adoption Applications
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {myApplications.map((app) => {
                  const statusClass = 
                    app.status === "Approved" ? "adopted" :
                    app.status === "Rejected" ? "rescued" :
                    app.status === "Applications Received" ? "shelter" : "treatment";
                  
                  return (
                    <div key={app.id} className="card animate-slide-up" style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 20px",
                      borderRadius: "16px",
                      borderLeft: "5px solid var(--accent-amber)",
                      flexWrap: "wrap",
                      gap: "16px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img 
                          src={app.animalPhoto} 
                          alt={app.animalName} 
                          style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border-color)" }} 
                        />
                        <div>
                          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                            <strong style={{ fontSize: "1rem" }}>{app.animalName}</strong>
                            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>ID: {app.animalId}</span>
                          </div>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Applied: {app.date}</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span className={`badge badge-${statusClass}`} style={{ fontSize: "0.7rem" }}>
                          {app.status === "Applications Received" ? "Awaiting NGO Review" : app.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================
          MODAL: PREVIEW & APPLY PORTAL
      ======================================================== */}
      {selectedPet && (
        <div className="modal-overlay" onClick={() => setSelectedPet(null)} style={{ zIndex: 9999 }}>
          <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px", padding: 0, overflow: "hidden" }}>
            
            {/* Header info */}
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 800 }}>🐾 Review Adoption Profile</span>
              <button onClick={() => setSelectedPet(null)} style={{ background: "none", border: 0, cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={20} />
              </button>
            </div>

            {/* Read-Only Profile Body */}
            <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: "20px", maxHeight: "450px", overflowY: "auto" }}>
              <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <img 
                  src={selectedPet.photo} 
                  alt={selectedPet.name} 
                  style={{ width: "100px", height: "100px", borderRadius: "14px", objectFit: "cover", border: "1px solid var(--border-color)" }} 
                />
                <div>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 800 }}>{selectedPet.name}</h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{selectedPet.species} • {selectedPet.breed} • {selectedPet.age}</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                    Node custodian: <strong>{selectedPet.custodian}</strong>
                  </span>
                </div>
              </div>

              <div style={{
                backgroundColor: "#FCFAF6",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid var(--border-color)"
              }}>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 800, marginBottom: "6px" }}>Clinical Summary</h4>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {selectedPet.healthSummary?.treatmentNotes || "Initial health assessment matches optimal recovery checklist."}
                </p>
              </div>

              {/* Form trigger / display */}
              {showApplyForm ? (
                <form onSubmit={handleApplySubmit} className="animate-slide-up" style={{
                  borderTop: "1px solid var(--border-color)",
                  paddingTop: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px"
                }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 800 }}>Complete Adoption Request</h4>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={appForm.applicantName}
                        onChange={(e) => setAppForm({ ...appForm, applicantName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Contact Phone *</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={appForm.applicantContact}
                        onChange={(e) => setAppForm({ ...appForm, applicantContact: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Living Environment Notes *</label>
                    <textarea 
                      placeholder="Describe your family size, housing layout, and check indicators..."
                      className="form-control"
                      rows="3"
                      value={appForm.notes}
                      onChange={(e) => setAppForm({ ...appForm, notes: e.target.value })}
                      required
                    />
                  </div>

                  {errors.form && <span className="form-error">{errors.form}</span>}

                  <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                    <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowApplyForm(false)}>
                      Back
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, backgroundColor: "var(--accent-amber)", borderColor: "var(--accent-amber)" }}>
                      Submit Adoption Application
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSelectedPet(null)}>
                    Close
                  </button>
                  <button className="btn btn-primary" style={{ flex: 1, backgroundColor: "var(--accent-amber)", borderColor: "var(--accent-amber)" }} onClick={() => setShowApplyForm(true)}>
                    Apply to Adopt
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdoptionBrowsing;
