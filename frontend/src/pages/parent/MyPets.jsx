import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { Heart, Search, HelpCircle, AlertTriangle, ChevronRight, PlusCircle, Dog } from "lucide-react";

const MyPets = () => {
  const { animals, vetAppointments, animalsLoaded } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (animalsLoaded) {
      setIsLoading(false);
    }
  }, [animalsLoaded]);

  // Filter animals in parent custody (status is Adopted or Lost)
  const myFamilyPets = animals.filter(
    (pet) => pet.status === "Adopted" || pet.status === "Lost"
  );

  const filteredPets = myFamilyPets.filter(
    (pet) =>
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Header Summary */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
            My Pet Family
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
            Monitor your adopted pets, review vaccination schedules, and manage tag alert flags.
          </p>
        </div>
        
        {myFamilyPets.length > 0 && (
          <button 
            className="btn btn-primary" 
            style={{ backgroundColor: "var(--accent-amber)", borderColor: "var(--accent-amber)", display: "flex", alignItems: "center", gap: "6px" }}
            onClick={() => navigate("/parent/register")}
          >
            <PlusCircle size={16} /> Register Family Pet
          </button>
        )}
      </div>

      {isLoading ? (
        // Skeleton loader grid
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "28px" }}>
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="skeleton skeleton-card" style={{ height: "260px", borderRadius: "20px" }} />
          ))}
        </div>
      ) : myFamilyPets.length === 0 ? (
        // Warm Empty State
        <div className="card" style={{
          textAlign: "center",
          padding: "60px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          border: "2px dashed var(--border-color)",
          backgroundColor: "#FCFAF6"
        }}>
          <div style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            backgroundColor: "var(--accent-amber-light)",
            color: "var(--accent-amber)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Heart size={32} fill="var(--accent-amber)" stroke="var(--accent-amber)" />
          </div>
          
          <div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-main)" }}>You haven't added any pets yet!</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: "440px", margin: "6px auto 0", lineHeight: 1.5 }}>
              If you have recently approved an adoption with a PetLink partner NGO, your pet will automatically sync here. 
              Alternatively, you can register a pet born into your household.
            </p>
          </div>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
            <button className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: "8px" }} onClick={() => navigate("/parent/adopt")}>
              <Dog size={16} /> Browse Animals for Adoption
            </button>
            <button className="btn btn-primary" style={{ backgroundColor: "var(--accent-amber)", borderColor: "var(--accent-amber)", display: "flex", alignItems: "center", gap: "8px" }} onClick={() => navigate("/parent/register")}>
              <PlusCircle size={16} /> Register a New Pet
            </button>
          </div>
        </div>
      ) : (
        // Grid List of Family Pets
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          
          {/* Family Health & Appointments Calendar */}
          <div className="card" style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "var(--primary-color)" }}>
                📅 Family Health Calendar & Appointments
              </h2>
              <span className="badge badge-adopted" style={{ fontSize: "0.7rem" }}>Combined Schedule</span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {(() => {
                const calendarEvents = [];
                if (vetAppointments) {
                  vetAppointments.forEach(apt => {
                    const realPet = myFamilyPets.find(p => p.id === apt.petId);
                    if (realPet && apt.status === "Upcoming") {
                      calendarEvents.push({
                        id: apt.id,
                        petName: realPet.name,
                        type: "appointment",
                        title: `Vet Appointment: ${apt.purpose}`,
                        date: apt.date,
                        color: "var(--accent-amber)"
                      });
                    }
                  });
                }

                myFamilyPets.forEach((pet, index) => {
                  calendarEvents.push({
                    id: `BST-${pet.id}`,
                    petName: pet.name,
                    type: "booster",
                    title: "Annual Rabies Immunization Due",
                    date: index === 0 ? "2026-08-15" : "2026-08-28",
                    color: "var(--accent-coral)"
                  });
                });

                calendarEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

                if (calendarEvents.length === 0) {
                  return <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>No upcoming health events scheduled.</p>;
                }

                return calendarEvents.map(event => (
                  <div key={event.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", border: "1px solid var(--border-color)", borderRadius: "12px", backgroundColor: "#FCFAF6" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: event.color }} />
                      <div>
                        <strong style={{ fontSize: "0.88rem" }}>{event.petName}</strong>
                        <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginLeft: "8px" }}>{event.title}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-main)" }}>{event.date}</span>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Quick Search bar */}
          <div style={{ display: "flex", alignItems: "center", position: "relative", maxWidth: "400px" }}>
            <Search size={16} style={{ position: "absolute", left: "14px", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search your pets by name, breed, or tag ID..."
              className="form-control"
              style={{ width: "100%", paddingLeft: "40px", borderRadius: "30px" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "28px"
          }}>
            {filteredPets.map((pet) => {
              const isLost = pet.status === "Lost";
              return (
                <div
                  key={pet.id}
                  className="card animate-slide-up"
                  onClick={() => navigate(`/parent/pet/${pet.id}`)}
                  style={{
                    padding: 0,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                    borderRadius: "20px 16px 20px 16px",
                    borderLeft: isLost ? "5px solid var(--accent-coral)" : "5px solid var(--accent-amber)",
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
                  {/* Photo Head */}
                  <div style={{ position: "relative", width: "100%", height: "180px", overflow: "hidden" }}>
                    <img 
                      src={pet.photo} 
                      alt={pet.name} 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    {isLost && (
                      <div style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        backgroundColor: "var(--accent-coral)",
                        color: "white",
                        padding: "4px 10px",
                        borderRadius: "30px",
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
                      }}>
                        <AlertTriangle size={10} /> LOST ALERT
                      </div>
                    )}
                  </div>

                  {/* Info Body */}
                  <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-main)" }}>
                        {pet.name}
                      </h3>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "monospace", fontWeight: 600 }}>
                        {pet.id}
                      </span>
                    </div>

                    <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                      <span>{pet.species} • {pet.breed}</span>
                      <span>{pet.age}</span>
                    </div>

                    <hr style={{ border: 0, borderBottom: "1px solid var(--border-color)", margin: "4px 0" }} />

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>
                      <span>Updated: {pet.lastUpdated}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", color: isLost ? "var(--accent-coral)" : "var(--accent-amber)" }}>
                        View Profile <ChevronRight size={10} />
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default MyPets;
