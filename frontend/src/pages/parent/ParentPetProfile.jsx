import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PetQRCode from "../../components/PetQRCode";
import { useApp } from "../../context/AppContext";
import {
  ArrowLeft, Heart, Calendar, ShieldCheck, FileText, Activity,
  AlertTriangle, Download, Eye, Clock, ClipboardList, Info, Camera
} from "lucide-react";

const ParentPetProfile = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { animals, petMemories, addPetMemory, updateAnimalPersisted, addToast } = useApp();

  const pet = animals.find((p) => p.id === petId);
  const [activeTab, setActiveTab] = useState("timeline");
  const [showExternalVisitModal, setShowExternalVisitModal] = useState(false);
  const [externalVisitForm, setExternalVisitForm] = useState({ clinicName: "", visitDate: "", notes: "" });
  const [isSavingExternalVisit, setIsSavingExternalVisit] = useState(false);

  const handleLogExternalVisit = async (e) => {
    e.preventDefault();
    if (!externalVisitForm.clinicName || !externalVisitForm.visitDate) return;
    if (isSavingExternalVisit) return;
    setIsSavingExternalVisit(true);

    const newEntry = {
      date: externalVisitForm.visitDate,
      title: "External Vet Visit (Unverified)",
      description: `Reported by parent: visited ${externalVisitForm.clinicName}. Notes: ${externalVisitForm.notes || "None provided"}. This entry is self-reported and has not been verified through PetLink's Vet Portal.`
    };

    try {
      await updateAnimalPersisted(pet.id, {
        timeline: [newEntry, ...pet.timeline]
      });
      addToast("External vet visit logged to timeline.", "success");
      setShowExternalVisitModal(false);
      setExternalVisitForm({ clinicName: "", visitDate: "", notes: "" });
    } catch (err) {
      // error toast already shown inside updateAnimalPersisted
    }
    setIsSavingExternalVisit(false);
  };

  if (!pet) {
    return (
      <div className="card" style={{ padding: "40px", textAlign: "center" }}>
        <h2 style={{ color: "var(--accent-coral)" }}>Pet Profile Not Found</h2>
        <p style={{ color: "var(--text-muted)", margin: "8px 0 20px" }}>The requested pet record does not exist in the shared registry.</p>
        <button className="btn btn-primary" onClick={() => navigate("/parent/pets")}>Return Home</button>
      </div>
    );
  }

  // Extract vet-entered prescriptions from animal timeline logs (simulated parsing)
  const prescriptionLogs = pet.timeline.filter(e => e.title === "Prescription Authored");

  // Extract vet-entered vaccinations from animal timeline logs
  const vaccinationLogs = pet.timeline.filter(e => e.title === "Immunization Administered" || e.title === "Vaccination Completed");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

      {/* Top Navigation Back Row */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", justifyContent: "space-between" }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate("/parent/pets")}>
          <ArrowLeft size={16} /> Back to Pets
        </button>
        <span className="badge" style={{ backgroundColor: "var(--accent-amber-light)", color: "var(--accent-amber)", border: "1px solid var(--accent-amber)" }}>
          Digital Animal ID Card
        </span>
      </div>

      {/* READ-ONLY BIOLOGICAL HEADER */}
      <div className="card animal-profile-grid profile-header-card" style={{
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        gap: "32px",
        padding: "24px 32px",
        backgroundColor: "#FFFFFF",
        border: "1px solid var(--border-color)",
        position: "relative"
      }}>

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

        {/* Biological Info Card (Read-Only) */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "20px" }}>
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

          {/* QR Collar stamp & Lost mode triggers */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <MiniQR value={pet.id} />
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>Collar QR Chip</span>
                <span style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)", maxWidth: "160px" }}>Scan collar tag to view digital immunization proofs.</span>
              </div>
            </div>

            {/* Quick Lost Alert shortcut */}
            {pet.status === "Lost" ? (
              <button
                className="btn btn-primary"
                style={{ backgroundColor: "var(--secondary-color)", borderColor: "var(--secondary-color)" }}
                onClick={() => navigate(`/parent/lost?petId=${pet.id}`)}
              >
                Mark as Recovered / Found
              </button>
            ) : (
              <button
                className="btn btn-danger"
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
                onClick={() => navigate(`/parent/lost?petId=${pet.id}`)}
              >
                <AlertTriangle size={14} /> Report Pet as Lost
              </button>
            )}
            <button
              className="btn btn-outline"
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
              onClick={() => setShowExternalVisitModal(true)}
            >
              Log External Vet Visit
            </button>
          </div>
        </div>

      </div>

      {/* DETAILED PANE SECTION */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "28px" }} className="animal-profile-grid">

        {/* 1. Left Side Navigation Card */}
        <div className="card left-nav-card" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px", height: "fit-content" }}>

          {/* Collar QR Code — permanent scan link + downloadable tag image */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0 16px", borderBottom: "1px solid var(--border-color)", marginBottom: "8px" }}>
            <PetQRCode animalId={pet.id} size={100} showDownload={true} />
          </div>

          {[
            { id: "timeline", label: "Medical Timeline", icon: Activity },
            { id: "vaccines", label: "Vaccination Reminders", icon: ShieldCheck },
            { id: "prescriptions", label: "Active Medicines", icon: ClipboardList },
            { id: "docs", label: "Adoption Documents", icon: FileText },
            { id: "memories", label: "Sentimental Memories", icon: Heart }
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
                  gap: "12px",
                  padding: "12px 16px",
                  border: 0,
                  borderRadius: "10px",
                  backgroundColor: isTabActive ? "var(--accent-amber)" : "transparent",
                  color: isTabActive ? "white" : "var(--text-main)",
                  fontWeight: isTabActive ? 800 : 600,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  transition: "all var(--transition-fast)"
                }}
                onMouseEnter={(e) => {
                  if (!isTabActive) e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.03)";
                }}
                onMouseLeave={(e) => {
                  if (!isTabActive) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <TabIcon size={16} color={isTabActive ? "white" : "var(--text-muted)"} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 2. Main Content Card */}
        <div className="card tab-panel-card main-content-card" style={{ minHeight: "340px", padding: "28px" }}>

          {/* 1. Clinic & Admittance History Log */}
          {activeTab === "timeline" && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "var(--primary-color)" }}>Clinic & Admittance History Log</h3>
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                borderLeft: "2px dashed var(--border-color)",
                paddingLeft: "20px",
                marginLeft: "8px",
                marginTop: "8px"
              }}>
                {pet.timeline.map((event, idx) => (
                  <div key={idx} style={{ position: "relative" }}>
                    <div style={{
                      position: "absolute",
                      left: "-25px",
                      top: "6px",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "var(--accent-amber)"
                    }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)" }}>{event.date}</span>
                      <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-main)" }}>{event.title}</span>
                      <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.4 }}>{event.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Upcoming Immunizations */}
          {activeTab === "vaccines" && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "var(--primary-color)" }}>Upcoming Immunizations</h3>
                <span className="badge badge-adopted" style={{ fontSize: "0.7rem" }}>Sync Status: Active</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {vaccinationLogs.length > 0 ? (
                  vaccinationLogs.map((log, idx) => {
                    const logDateStr = log.date;
                    const nextDue = new Date(logDateStr);
                    nextDue.setFullYear(nextDue.getFullYear() + 1);
                    const isOverdue = nextDue.getTime() < Date.now();

                    return (
                      <div key={idx} className="responsive-booster-row" style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 18px",
                        border: "1px solid var(--border-color)",
                        borderRadius: "12px",
                        backgroundColor: "#FCFAF6"
                      }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <ShieldCheck size={18} color="var(--accent-amber)" />
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "0.88rem", fontWeight: 800 }}>{log.title} Logged</span>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{log.description}</span>
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", block: "true" }}>Next Booster Due</span>
                          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: isOverdue ? "var(--accent-coral)" : "var(--primary-color)" }}>
                            {nextDue.toISOString().split("T")[0]} {isOverdue && "(Overdue)"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div className="responsive-booster-row" style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 18px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "12px",
                      backgroundColor: "#FCFAF6"
                    }}>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <ShieldCheck size={18} color="var(--accent-amber)" />
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "0.88rem", fontWeight: 800 }}>Anti-Rabies Booster</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Required annual rabies immunization booster.</span>
                        </div>
                      </div>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--primary-color)" }}>Due: In 6 Months</span>
                    </div>

                    <div className="responsive-booster-row" style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 18px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "12px",
                      backgroundColor: "#FCFAF6"
                    }}>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <ShieldCheck size={18} color="var(--accent-amber)" />
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "0.88rem", fontWeight: 800 }}>Deworming Pill Cycle</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Routine quarterly de-worming tablet checklist.</span>
                        </div>
                      </div>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-amber)" }}>Due: In 1 Month</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 3. Active Prescriptions */}
          {activeTab === "prescriptions" && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "var(--primary-color)" }}>Active Prescriptions Checklist</h3>
              {prescriptionLogs.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {prescriptionLogs.map((log, idx) => (
                    <div key={idx} style={{
                      padding: "14px 18px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "12px",
                      backgroundColor: "#FBF9F4"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-amber)" }}>
                        <ClipboardList size={16} />
                        <span style={{ fontSize: "0.82rem", fontWeight: 800 }}>AUTHORED BY CLINIC ON {log.date}</span>
                      </div>
                      <p style={{ fontSize: "0.9rem", color: "var(--text-main)", marginTop: "8px", fontWeight: 600, margin: "8px 0 0" }}>
                        {log.description.replace("Items: ", "")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" style={{ padding: "30px", border: "none" }}>
                  <div className="empty-state-icon" style={{ width: "40px", height: "40px", marginBottom: "8px" }}>
                    <ClipboardList size={18} />
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>No active prescriptions/medicine logs found.</p>
                </div>
              )}
            </div>
          )}

          {/* 4. Compliance Certificates & Deeds */}
          {activeTab === "docs" && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "var(--primary-color)" }}>Compliance Certificates & Deeds</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {pet.documents && pet.documents.length > 0 ? (
                  pet.documents.map((doc, idx) => (
                    <div key={idx} className="responsive-doc-row" style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 18px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "12px",
                      backgroundColor: "#FCFAF6"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <FileText size={18} color="var(--accent-amber)" />
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "0.88rem", fontWeight: 800 }}>{doc.name}</span>
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{doc.type} • {doc.size}</span>
                        </div>
                      </div>
                      <button className="btn btn-outline btn-sm" onClick={() => alert(`Simulated download of ${doc.name}`)}>
                        <Download size={12} />
                      </button>
                    </div>
                  ))
                ) : null}

                <div className="responsive-doc-row" style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 18px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "12px",
                  backgroundColor: "#FCFAF6"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <FileText size={18} color="var(--accent-amber)" />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.88rem", fontWeight: 800 }}>Municipal Immunization Certificate.pdf</span>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>PDF Document • 1.1 MB</span>
                    </div>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={() => alert("Simulated download of Immunization Certificate")}>
                    <Download size={12} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. Sentimental Memory Journal */}
          {activeTab === "memories" && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px", margin: 0, color: "var(--primary-color)" }}>
                <Heart size={18} color="var(--accent-amber)" fill="var(--accent-amber)" /> Sentimental Memory Journal
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                Create and capture precious milestones, playful park sessions, and family memories with your pet.
              </p>

              <form onSubmit={(e) => {
                e.preventDefault();
                const captionText = e.target.caption.value.trim();
                const dateStr = e.target.memoryDate.value;
                const photoUrl = e.target.photoUrl.value;
                if (!captionText) return;

                addPetMemory({
                  petId: pet.id,
                  date: dateStr,
                  caption: captionText,
                  photo: photoUrl
                });
                e.target.reset();
              }} style={{ padding: "16px", border: "1px solid var(--border-color)", borderRadius: "12px", backgroundColor: "#FCFAF6", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="responsive-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: "0.75rem" }}>Memory Date</label>
                    <input type="date" name="memoryDate" className="form-control" defaultValue={new Date().toISOString().split("T")[0]} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: "0.75rem" }}>Choose Memory Theme</label>
                    <select name="photoUrl" className="form-control" required>
                      <option value="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=400">Playing in Park</option>
                      <option value="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400">Sleeping Cozy</option>
                      <option value="https://images.unsplash.com/photo-1535268647977-a403b69fc756?auto=format&fit=crop&q=80&w=400">Adoption Anniversary</option>
                      <option value="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=400">Playing with Toy</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>Journal Entry / Caption *</label>
                  <input type="text" name="caption" placeholder="Describe this precious moment..." className="form-control" required />
                </div>
                <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: "flex-start", backgroundColor: "var(--accent-amber)", borderColor: "var(--accent-amber)" }}>
                  Add Journal Entry
                </button>
              </form>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px", marginTop: "10px" }}>
                {petMemories.filter(m => m.petId === pet.id).length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", gridColumn: "1/-1", margin: 0 }}>No memories logged in this pet's journal yet.</p>
                ) : (
                  petMemories.filter(m => m.petId === pet.id).map(m => (
                    <div key={m.id} style={{ border: "1px solid var(--border-color)", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column", backgroundColor: "white" }}>
                      <img src={m.photo} alt="Memory" style={{ width: "100%", height: "110px", objectFit: "cover" }} />
                      <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>{m.date}</span>
                        <p style={{ fontSize: "0.78rem", color: "var(--text-main)", margin: 0, fontWeight: 500, lineHeight: 1.3 }}>{m.caption}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. Health Guard Tips Card */}
        <div className="tips-card-container" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--primary-color)", margin: 0 }}>Health Guard Tips</h3>

          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "20px 24px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <Info size={18} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ fontSize: "0.88rem", display: "block" }}>Annual Rabies Booster</strong>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Ensure your pet receives their yearly anti-rabies dose. Keep the digital tag verifiable online.
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <Info size={18} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ fontSize: "0.88rem", display: "block" }}>GPS Smart Collar</strong>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Verify that your QR badge is securely fitted. Scanning matches coordinates instantly.
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media (min-width: 769px) {
          .left-nav-card {
            grid-column: 1;
            grid-row: 1;
          }
          .main-content-card {
            grid-column: 2;
            grid-row: 1 / span 2;
          }
          .tips-card-container {
            grid-column: 1;
            grid-row: 2;
          }
        }

        @media (max-width: 768px) {
          .animal-profile-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
        @media (max-width: 640px) {
          .profile-header-card {
            grid-template-columns: 1fr !important;
            padding: 16px !important;
            gap: 20px !important;
          }
          .tab-panel-card {
            padding: 16px !important;
          }
          .responsive-booster-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .responsive-booster-row > div:last-child {
            text-align: left !important;
            margin-left: 28px;
          }
          .responsive-doc-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .responsive-doc-row > button {
            width: 100% !important;
          }
          .responsive-form-grid {
            grid-template-columns: 1fr !important;
          }
        }
            `}</style>

      {showExternalVisitModal && (
        <div className="modal-overlay" onClick={() => setShowExternalVisitModal(false)}>
          <div className="modal-content" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontWeight: 800 }}>Log External Vet Visit</h2>
              <button className="modal-close" onClick={() => setShowExternalVisitModal(false)}>✕</button>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0 0 16px" }}>
              This logs a note about a visit to a vet outside PetLink OS. It will be clearly marked as <strong>unverified</strong> and will not change {pet.name}'s official vaccination/sterilization status — only a PetLink-registered vet can update that.
            </p>
            <form onSubmit={handleLogExternalVisit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Clinic / Vet Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={externalVisitForm.clinicName}
                  onChange={(e) => setExternalVisitForm({ ...externalVisitForm, clinicName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Visit Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={externalVisitForm.visitDate}
                  onChange={(e) => setExternalVisitForm({ ...externalVisitForm, visitDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={externalVisitForm.notes}
                  onChange={(e) => setExternalVisitForm({ ...externalVisitForm, notes: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSavingExternalVisit}>
                {isSavingExternalVisit ? "Saving..." : "Log Visit"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ParentPetProfile;
