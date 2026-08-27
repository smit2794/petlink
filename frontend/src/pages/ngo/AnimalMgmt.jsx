import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { 
  Search, Filter, ArrowLeft, Heart, FileText, Activity, 
  Calendar, Layers, ShieldAlert, User, Eye, PawPrint, Tag, ClipboardList,
  MessageSquare, Upload, Check
} from "lucide-react";

// Mock QR Code SVG Component
const QRPlaceholder = ({ petId }) => (
  <svg width="120" height="120" viewBox="0 0 100 100" style={{ backgroundColor: "#F7F5F0", padding: "6px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
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

const AnimalMgmt = () => {
  const { animals, updateAnimal, updateAnimalPersisted, addAnimal, caseNotes, addCaseNote, addAnimalPersisted, foundReports, confirmFoundMatch, dismissFoundReport } = useApp();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [speciesFilter, setSpeciesFilter] = useState("All");
  const [selectedPet, setSelectedPet] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Extended Module States
  const [showImportModal, setShowImportModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [importCount, setImportCount] = useState(5);
  const [dragActive, setDragActive] = useState(false);
  const [mockFileName, setMockFileName] = useState("");

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setMockFileName(e.dataTransfer.files[0].name);
    }
  };

  const handleBulkImport = () => {
    setIsUploading(true);
    setTimeout(async () => {
      const names = ["Max", "Bella", "Rocky", "Luna", "Coco", "Milo", "Daisy", "Leo", "Simba", "Lucy"];
      const dogBreeds = ["Indie Dog", "Indian Spitz", "Pariah Dog", "Labrador Mix"];
      const catBreeds = ["Indian Billi", "Persian Mix", "Siamese Mix"];
      const cowBreeds = ["Gir Cattle", "Sahiwal Cattle", "Ongole Cattle"];
      const birdBreeds = ["Spotted Owl", "Pigeon", "Indian Ringneck Parakeet"];

      const count = parseInt(importCount) || 5;
      
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < count; i++) {
        const randomName = names[Math.floor(Math.random() * names.length)];
        const speciesChoices = ["Dog", "Cat", "Cow", "Bird"];
        const randomSpecies = speciesChoices[Math.floor(Math.random() * speciesChoices.length)];
        
        let breed = "Indie Mix";
        let photo = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400";
        
        if (randomSpecies === "Dog") {
          breed = dogBreeds[Math.floor(Math.random() * dogBreeds.length)];
          photo = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400";
        } else if (randomSpecies === "Cat") {
          breed = catBreeds[Math.floor(Math.random() * catBreeds.length)];
          photo = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400";
        } else if (randomSpecies === "Cow") {
          breed = cowBreeds[Math.floor(Math.random() * cowBreeds.length)];
          photo = "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=400";
        } else if (randomSpecies === "Bird") {
          breed = birdBreeds[Math.floor(Math.random() * birdBreeds.length)];
          photo = "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=400";
        }

        const newPet = {
          name: randomName,
          species: randomSpecies,
          breed: breed,
          gender: Math.random() > 0.5 ? "Male" : "Female",
          age: `${Math.floor(Math.random() * 4) + 1} years`,
          weight: randomSpecies === "Cow" ? "250 kg" : randomSpecies === "Dog" ? "15 kg" : "4 kg",
          photo: photo,
          custodian: "Pune Central Animal Shelter",
          status: "In Shelter",
          assignedVetId: "VET-1"
        };

        try {
          await addAnimalPersisted(newPet);
          successCount++;
        } catch (err) {
          failCount++;
        }
      }

      if (failCount > 0) {
        addToast(`Bulk import: ${successCount} saved, ${failCount} failed. Check connection and retry if needed.`, "warning");
      }
      
      setIsUploading(false);
      setShowImportModal(false);
      setMockFileName("");
    }, 1500); // 1.5s simulated delay
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredAnimals = animals.filter((pet) => {
    const matchesSearch = 
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      pet.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || pet.status === statusFilter;
    const matchesSpecies = speciesFilter === "All" || pet.species === speciesFilter;
    return matchesSearch && matchesStatus && matchesSpecies;
  });

  const custodySteps = [
    { label: "Rescued", key: "Rescued" },
    { label: "Under Treatment", key: "Under Treatment" },
    { label: "In Shelter", key: "In Shelter" },
    { label: "Available for Adoption", key: "Available for Adoption" },
    { label: "Adopted", key: "Adopted" }
  ];

  const getCurrentStepIndex = (status) => {
    return custodySteps.findIndex(step => step.key === status);
  };

  const currentStepIdx = selectedPet ? getCurrentStepIndex(selectedPet.status) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {selectedPet ? (
        /* DETAIL VIEW COMPONENT */
        <div className="animate-scale-up" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          
           {/* Detail Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", justifyContent: "space-between" }}>
            <button className="btn btn-outline btn-sm" onClick={() => setSelectedPet(null)}>
              <ArrowLeft size={16} /> Back to Directory
            </button>
            <span className={`badge badge-${
              selectedPet.status === "Adopted" ? "adopted" :
              selectedPet.status === "Available for Adoption" ? "adoption" :
              selectedPet.status === "In Shelter" ? "shelter" :
              selectedPet.status === "Under Treatment" ? "treatment" : "rescued"
            }`}>
              {selectedPet.status}
            </span>
          </div>

          {/* Stepper Progress Tracker */}
          <div className="card" style={{ padding: "32px", borderLeft: "5px solid var(--secondary-color)" }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "24px" }}>
              Custody Pipeline Stage Tracker
            </h4>
            
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
              margin: "0 auto",
              width: "100%",
              maxWidth: "800px"
            }} className="stepper-container">
              
              {/* Stepper Line */}
              <div style={{
                position: "absolute",
                top: "14px",
                left: "40px",
                right: "40px",
                height: "4px",
                backgroundColor: "#EAE6DF",
                zIndex: 1
              }} />

              {/* Progress Line */}
              <div style={{
                position: "absolute",
                top: "14px",
                left: "40px",
                width: currentStepIdx === -1 ? "0%" : `${(currentStepIdx / (custodySteps.length - 1)) * 90}%`,
                height: "4px",
                backgroundColor: "var(--secondary-color)",
                zIndex: 2,
                transition: "width 0.4s ease"
              }} />

              {custodySteps.map((step, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div key={idx} style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    zIndex: 3,
                    position: "relative",
                    width: "80px"
                  }}>
                    <button
                      onClick={async () => {
                        setSelectedPet(prev => ({ ...prev, status: step.key })); // instant UI feedback
                        try {
                          await updateAnimalPersisted(selectedPet.id, { status: step.key });
                        } catch (err) {
                          setSelectedPet(prev => ({ ...prev, status: selectedPet.status })); // revert on failure
                        }
                      }}
                      
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        border: `3px solid ${isPassed ? "var(--secondary-color)" : "#EAE6DF"}`,
                        backgroundColor: isCurrent ? "var(--secondary-color)" : isPassed ? "var(--secondary-light)" : "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: isCurrent ? "white" : "var(--primary-color)",
                        transition: "all 0.3s ease"
                      }}
                    >
                      {idx + 1}
                    </button>
                    <span style={{
                      fontSize: "0.75rem",
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent ? "var(--primary-color)" : "var(--text-muted)",
                      textAlign: "center",
                      marginTop: "8px",
                      lineHeight: 1.2
                    }}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Profile Details Layout */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "240px 1fr",
            gap: "32px"
          }} className="animal-profile-grid">
            
            {/* Left Block: Picture Card */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "center", alignSelf: "start" }}>
              <img 
                src={selectedPet.photo} 
                alt={selectedPet.name} 
                style={{
                  width: "100%",
                  height: "220px",
                  objectFit: "cover",
                  borderRadius: "16px",
                  border: "1px solid var(--border-color)"
                }}
              />
              <div style={{ textAlign: "center" }}>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 800 }}>{selectedPet.name || "Unnamed Stray"}</h2>
                <span style={{ color: "var(--text-muted)", fontSize: "0.88rem", fontWeight: 700 }}>ID: {selectedPet.id}</span>
              </div>
              <QRPlaceholder petId={selectedPet.id} />
              <div style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                <span>Scan collar QR tag for offline EHR lookup</span>
              </div>
            </div>

            {/* Right Block: Content Cards with Tabs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Tab Navigation header */}
              <div style={{
                display: "flex",
                borderBottom: "2px solid var(--border-color)",
                gap: "8px",
                overflowX: "auto"
              }}>
                {[
                  { id: "overview", label: "Overview", icon: PawPrint },
                  { id: "health", label: "Health Summary", icon: ShieldAlert },
                  { id: "timeline", label: "Timeline Log", icon: Activity },
                  { id: "docs", label: "Documents", icon: FileText },
                  { id: "history", label: "Custody History", icon: User },
                  { id: "notes", label: "Internal Notes", icon: MessageSquare }
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
                        gap: "8px",
                        padding: "12px 18px",
                        border: 0,
                        borderBottom: isTabActive ? "3px solid var(--secondary-color)" : "3px solid transparent",
                        backgroundColor: "transparent",
                        color: isTabActive ? "var(--primary-color)" : "var(--text-muted)",
                        fontWeight: isTabActive ? 800 : 600,
                        fontSize: "0.92rem",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all var(--transition-fast)"
                      }}
                    >
                      <TabIcon size={16} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Panels */}
              <div className="card" style={{ minHeight: "320px" }}>
                
                {/* 1. Overview Tab */}
                {activeTab === "overview" && (
                  <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>General Information</h3>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "24px",
                      fontSize: "0.98rem"
                    }} className="info-grid-2col">
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Species</span>
                        <strong style={{ color: "var(--text-main)", fontSize: "1.05rem" }}>{selectedPet.species}</strong>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Breed</span>
                        <strong style={{ color: "var(--text-main)", fontSize: "1.05rem" }}>{selectedPet.breed}</strong>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Gender</span>
                        <strong style={{ color: "var(--text-main)", fontSize: "1.05rem" }}>{selectedPet.gender}</strong>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Estimated Age</span>
                        <strong style={{ color: "var(--text-main)", fontSize: "1.05rem" }}>{selectedPet.age}</strong>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Weight</span>
                        <strong style={{ color: "var(--text-main)", fontSize: "1.05rem" }}>{selectedPet.weight}</strong>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Current Custodian</span>
                        <strong style={{ color: "var(--text-main)", fontSize: "1.05rem" }}>{selectedPet.custodian || "Pune Central Shelter"}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Health Summary Tab */}
                {activeTab === "health" && (() => {
                  const health = selectedPet.healthSummary || {};
                  return (
                    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Medical Diagnostics</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Vaccination Status</span>
                            <span className="badge badge-shelter" style={{ backgroundColor: "#E3F2FD", color: "#1E88E5", fontSize: "0.78rem" }}>
                              {health.vaccinationStatus || "Not Vaccinated"}
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Sterilization Status</span>
                            <span className="badge badge-adopted" style={{ fontSize: "0.78rem" }}>
                              {health.sterilizationStatus || "Pending"}
                            </span>
                          </div>
                        </div>

                        <div style={{
                          padding: "20px",
                          borderRadius: "14px",
                          backgroundColor: "#FCFAF6",
                          border: "1px solid var(--border-color)"
                        }}>
                          <h4 style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: "10px" }}>Clinical Diagnostic Notes</h4>
                          <p style={{ fontSize: "0.95rem", color: "var(--text-main)", lineHeight: 1.6 }}>
                            {health.treatmentNotes || "No clinical ailments recorded."}
                          </p>
                        </div>

                        <button className="btn btn-outline btn-sm" onClick={async () => {
          const notes = prompt("Enter additional veterinary notes:", health.treatmentNotes || "");
          if (notes !== null) {
            setSelectedPet(prev => ({
              ...prev,
              healthSummary: {
                ...health,
                treatmentNotes: notes
              }
            }));
            try {
              await updateAnimalPersisted(selectedPet.id, {
                healthSummary: {
                  ...health,
                  treatmentNotes: notes
                }
              });
            } catch (err) {
              // error toast already shown inside updateAnimalPersisted
            }
                          }
                        }} style={{ alignSelf: "flex-start" }}>
                          Update Medical Notes
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* 3. Timeline Tab */}
                {activeTab === "timeline" && (
                  <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Admittance & Care History</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px", borderLeft: "2px dashed var(--border-color)", paddingLeft: "20px", marginLeft: "8px" }}>
                      {selectedPet.timeline.map((event, idx) => (
                        <div key={idx} style={{ position: "relative" }}>
                          <div style={{
                            position: "absolute",
                            left: "-25px",
                            top: "8px",
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: "var(--secondary-color)"
                          }} />
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>{event.date}</span>
                            <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-main)" }}>{event.title}</span>
                            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{event.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Documents Tab */}
                {activeTab === "docs" && (
                  <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Clinical Certificates & Reports</h3>
                    {selectedPet.documents.length === 0 ? (
                      <div className="empty-state" style={{ padding: "30px", border: "none" }}>
                        <div className="empty-state-icon" style={{ width: "48px", height: "48px", marginBottom: "12px" }}>
                          <FileText size={20} />
                        </div>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No digital certificates uploaded.</p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {selectedPet.documents.map((doc, idx) => (
                          <div key={idx} style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "14px 20px",
                            borderRadius: "12px",
                            border: "1px solid var(--border-color)",
                            backgroundColor: "#FCFAF6"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                              <FileText size={20} color="var(--secondary-color)" />
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: "0.9rem", fontWeight: 800 }}>{doc.name}</span>
                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{doc.type} • {doc.size}</span>
                              </div>
                            </div>
                            <button className="btn btn-outline btn-sm" onClick={() => alert(`Simulated download of ${doc.name}`)}>
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Custody History Tab */}
                {activeTab === "history" && (
                  <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Custodianship Log</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "14px 20px",
                        borderLeft: "4px solid var(--secondary-color)",
                        backgroundColor: "#FCFAF6",
                        borderRadius: "0 12px 12px 0"
                      }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "0.9rem", fontWeight: 800 }}>Current Custodian</span>
                          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{selectedPet.custodian || "Pune Central Shelter"}</span>
                        </div>
                        <span className="badge badge-adopted" style={{ fontSize: "0.6rem" }}>Active</span>
                      </div>

                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "14px 20px",
                        borderLeft: "4px solid var(--border-color)",
                        opacity: 0.65
                      }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "0.9rem", fontWeight: 800 }}>Intake Dispatch Node</span>
                          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Pune Municipal Ambulance Area Hub</span>
                        </div>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Closed</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Internal Notes Tab */}
                {activeTab === "notes" && (
                  <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Internal Staff Notes</h3>
                    
                    {/* Add note form */}
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const txt = e.target.noteText.value.trim();
                      if (!txt) return;
                      addCaseNote({
                        animalId: selectedPet.id,
                        author: "NGO Staff",
                        text: txt
                      });
                      e.target.reset();
                    }} style={{ display: "flex", gap: "10px" }}>
                      <input 
                        type="text" 
                        name="noteText" 
                        placeholder="Write an internal comment..." 
                        className="form-control" 
                        required 
                      />
                      <button type="submit" className="btn btn-primary btn-sm" style={{ padding: "8px 16px" }}>Add Note</button>
                    </form>

                    {/* Notes thread */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "300px", overflowY: "auto" }}>
                      {caseNotes.filter(n => n.animalId === selectedPet.id).length === 0 ? (
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "10px 0" }}>No internal case notes logged for this profile.</p>
                      ) : (
                        caseNotes.filter(n => n.animalId === selectedPet.id).map(n => (
                          <div key={n.id} style={{ padding: "12px", border: "1px solid var(--border-color)", borderRadius: "10px", backgroundColor: "#FCFAF6" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.78rem" }}>
                              <strong style={{ color: "var(--primary-color)" }}>{n.author}</strong>
                              <span style={{ color: "var(--text-muted)" }}>{n.timestamp}</span>
                            </div>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-main)", margin: 0 }}>{n.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      ) : (
        /* DIRECTORY CATALOG LIST - REDESIGNED PET PROFILE CARDS */
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          
          {/* Header block with Bulk Import */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
                Animal Digital Identities
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
                Audit digital collars, scan NFC tag registries, and track treatment histories.
              </p>
            </div>
            <button 
              className="btn btn-outline" 
              onClick={() => setShowImportModal(true)}
              style={{ display: "flex", alignItems: "center", gap: "8px", borderColor: "var(--primary-color)", color: "var(--primary-color)" }}
            >
              <Upload size={16} /> Bulk CSV Import
            </button>
          </div>

          {/* Header Filtering card */}
          <div className="card" style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center", padding: "20px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", position: "relative", flex: 1, minWidth: "260px" }}>
              <Search size={16} style={{ position: "absolute", left: "14px", color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search catalog by name, tag ID, or breed..."
                className="form-control"
                style={{ width: "100%", paddingLeft: "40px", borderRadius: "30px" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
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
                  <option value="Cow">Cows</option>
                  <option value="Bird">Birds</option>
                </select>
              </div>

              <select
                className="form-control"
                style={{ padding: "8px 16px", fontSize: "0.85rem", borderRadius: "30px" }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Rescued">Rescued</option>
                <option value="Under Treatment">Under Treatment</option>
                <option value="In Shelter">In Shelter</option>
                <option value="Available for Adoption">Available for Adoption</option>
                <option value="Adopted">Adopted</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "28px" }}>
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="skeleton skeleton-card" style={{ height: "300px" }} />
              ))}
            </div>
          ) : (
            /* REDESIGNED ANIMAL CARDS GRID */
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "28px"
            }}>
              {filteredAnimals.length === 0 ? (
                <div className="empty-state" style={{ gridColumn: "1/-1" }}>
                  <div className="empty-state-icon">
                    <PawPrint size={32} />
                  </div>
                  <h3 className="empty-state-title">No Pet Profiles Found</h3>
                  <p className="empty-state-desc">We couldn't find any animal files matching your keyword filters.</p>
                  <button className="btn btn-primary btn-sm" onClick={() => { setSearchTerm(""); setStatusFilter("All"); setSpeciesFilter("All"); }}>
                    Reset Directory Filters
                  </button>
                </div>
              ) : (
                filteredAnimals.map((pet) => {
                  const statusClass = 
                    pet.status === "Adopted" ? "adopted" :
                    pet.status === "Available for Adoption" ? "adoption" :
                    pet.status === "In Shelter" ? "shelter" :
                    pet.status === "Under Treatment" ? "treatment" : "rescued";
                  
                  return (
                    <div 
                      key={pet.id} 
                      className="card animate-slide-up"
                      onClick={() => {
                        setSelectedPet(pet);
                        setActiveTab("overview");
                      }}
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
                        e.currentTarget.style.transform = "translateY(-8px)";
                        e.currentTarget.style.boxShadow = "var(--shadow-md)";
                        const btn = e.currentTarget.querySelector(".view-profile-btn");
                        if (btn) btn.style.opacity = 1;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                        const btn = e.currentTarget.querySelector(".view-profile-btn");
                        if (btn) btn.style.opacity = 0;
                      }}
                    >
                      {/* Photo wrapper */}
                      <div style={{ position: "relative", width: "100%", height: "180px", overflow: "hidden" }}>
                        <img 
                          src={pet.photo} 
                          alt={pet.name} 
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.4s ease"
                          }}
                          className="pet-card-image"
                        />
                        
                        {/* Overlapping status badge pill in bottom-left */}
                        <div style={{
                          position: "absolute",
                          bottom: "12px",
                          left: "12px",
                          zIndex: 5
                        }}>
                          <span className={`badge badge-${statusClass}`} style={{ fontSize: "0.68rem", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
                            {pet.status}
                          </span>
                        </div>
                      </div>
                      
                      {/* Card details */}
                      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px", flexGrow: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
                            {pet.name || "Unnamed"}
                            {(() => {
                              const cust = pet.custodian || "Pune Central Shelter";
                              const isParentPet = cust.toLowerCase().includes("family") || cust.toLowerCase().includes("home");
                              const reportsCount = isParentPet ? 0 : (foundReports || []).filter(r => r.animalId === pet.id && r.status === "Pending").length;
                              return reportsCount > 0 && (
                                <span 
                                  className="badge" 
                                  style={{ 
                                    fontSize: "0.62rem", 
                                    backgroundColor: "var(--accent-coral)", 
                                    color: "white", 
                                    padding: "2px 6px",
                                    animation: "pulse 1.5s infinite",
                                    cursor: "pointer"
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/ngo/found-reports?petId=${pet.id}`);
                                  }}
                                  title="Pending Found Scan Report Filed. Click to view reports."
                                >
                                  Scan Alert
                                </span>
                              );
                            })()}
                          </h3>
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", fontFamily: "monospace" }}>
                            {pet.id}
                          </span>
                        </div>

                        {/* Attribute icons row */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 12px", fontSize: "0.8rem", color: "var(--text-muted)", margin: "4px 0" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
                            <PawPrint size={12} /> {pet.breed}
                          </span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
                            <Calendar size={12} /> {pet.age}
                          </span>
                        </div>

                        <hr style={{ border: 0, borderBottom: "1px solid var(--border-color)", margin: "4px 0" }} />

                        {/* Custodian tag */}
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          fontWeight: 600
                        }}>
                          <span>Updated: {pet.lastUpdated}</span>
                          <span>{(() => {
                            const cust = pet.custodian || "Pune Central Shelter";
                            return cust.length > 18 ? cust.substring(0, 15) + "..." : cust;
                          })()}</span>
                        </div>
                      </div>

                      {/* Hover Overlay Button */}
                      <div 
                        className="view-profile-btn"
                        style={{
                          position: "absolute",
                          inset: 0,
                          backgroundColor: "rgba(26,62,47,0.15)",
                          backdropFilter: "blur(2px)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: 0,
                          transition: "opacity 0.25s ease",
                          zIndex: 10,
                          pointerEvents: "none"
                        }}
                      >
                        <span className="btn btn-primary btn-sm" style={{ pointerEvents: "auto", boxShadow: "var(--shadow-md)" }}>
                          <Eye size={14} /> View profile
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* CSV Bulk Import Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => { if (!isUploading) setShowImportModal(false); }} style={{ zIndex: 9999 }}>
          <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px" }}>
            <div className="modal-header">
              <h2 style={{ fontWeight: 800, color: "var(--primary-color)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Upload size={20} /> Bulk CSV Profile Registry
              </h2>
              <button className="modal-close" onClick={() => { if (!isUploading) setShowImportModal(false); }} disabled={isUploading}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                Upload a CSV file containing animal registry fields (name, species, breed, age, weight) to insert profiles at scale.
              </p>

              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                style={{
                  border: dragActive ? "2px dashed var(--secondary-color)" : "2px dashed var(--border-color)",
                  backgroundColor: dragActive ? "var(--secondary-light)" : "#FCFAF6",
                  borderRadius: "12px",
                  padding: "30px 20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <Upload size={32} color={dragActive ? "var(--secondary-color)" : "var(--text-muted)"} />
                <div style={{ textAlign: "center" }}>
                  {mockFileName ? (
                    <strong style={{ fontSize: "0.85rem", color: "var(--primary-color)" }}>{mockFileName}</strong>
                  ) : (
                    <>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, display: "block" }}>Drag & Drop CSV template file</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>or click here to select from local storage</span>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={(e) => { if (e.target.files[0]) setMockFileName(e.target.files[0].name); }}
                  style={{ display: "none" }} 
                  id="csv-file-picker" 
                />
                <label htmlFor="csv-file-picker" style={{ display: mockFileName ? "none" : "block", padding: "4px 12px", border: "1px solid var(--border-color)", borderRadius: "20px", fontSize: "0.75rem", cursor: "pointer", backgroundColor: "white", marginTop: "4px" }}>
                  Select File
                </label>
              </div>

              {/* Record count selector */}
              <div className="form-group">
                <label className="form-label">Simulated Record Count to Generate</label>
                <input
                  type="number"
                  className="form-control"
                  value={importCount}
                  onChange={(e) => setImportCount(e.target.value)}
                  min="1"
                  max="50"
                  disabled={isUploading}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  style={{ flex: 1 }} 
                  onClick={() => { setShowImportModal(false); setMockFileName(""); }}
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  onClick={handleBulkImport}
                  disabled={isUploading || !mockFileName}
                >
                  {isUploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" style={{ width: "14px", height: "14px", border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                      <span>Parsing CSV...</span>
                    </>
                  ) : (
                    <span>Simulate Upload</span>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
      <style>{`
        @media (max-width: 768px) {
          .animal-profile-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AnimalMgmt;
