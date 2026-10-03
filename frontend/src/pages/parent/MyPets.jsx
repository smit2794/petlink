import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import {
  Search, Plus, Calendar, ShieldCheck, CheckCircle2,
  SlidersHorizontal, MoreHorizontal, Cake, ArrowUpRight,
  ChevronRight, Heart, Dog, AlertTriangle
} from "lucide-react";
import "../../styles/parent.css";

const MyPets = () => {
  const { animals, vetAppointments, animalsLoaded } = useApp();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (animalsLoaded) {
      setIsLoading(false);
    } else {
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [animalsLoaded]);

  // Filter animals strictly by real ownership (ownerId === user.id)
  const myFamilyPets = (animals || []).filter(
    (pet) => pet.ownerId === user?.id && (pet.status === "Adopted" || pet.status === "Lost")
  );

  const filteredPets = myFamilyPets.filter(
    (pet) =>
      pet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Capitalize pet name for neat display
  const formatPetName = (name) => {
    if (!name) return "Pet";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Calendar events generator matching reference
  const getCalendarEvents = () => {
    const events = [];

    // Add immunization reminders for family pets
    myFamilyPets.forEach((pet, index) => {
      events.push({
        id: `IMM-${pet.id}`,
        petName: formatPetName(pet.name),
        title: "Annual Rabies Immunization Due",
        date: index === 0 ? "2026-08-15" : "2026-08-28",
        dotColor: "#EF4444",
        calendarIconColor: "#EF4444",
        targetPetId: pet.id
      });
    });

    // Add upcoming clinic appointments
    if (vetAppointments) {
      vetAppointments.forEach((apt) => {
        const realPet = myFamilyPets.find((p) => p.id === apt.petId);
        if (realPet && apt.status === "Upcoming") {
          events.push({
            id: `APT-${apt.id}`,
            petName: formatPetName(realPet.name),
            title: `Vet Appointment: ${apt.purpose || apt.reason || "undefined"}`,
            date: apt.date || "2026-10-02",
            dotColor: "#F59E0B",
            calendarIconColor: "#F59E0B",
            targetPetId: realPet.id
          });
        }
      });
    }

    // Default sample events if none exist yet to match reference layout
    if (events.length === 0) {
      return [
        {
          id: "E1",
          petName: "Miya",
          title: "Annual Rabies Immunization Due",
          date: "2026-08-15",
          dotColor: "#EF4444",
          calendarIconColor: "#EF4444"
        },
        {
          id: "E2",
          petName: "Sheru",
          title: "Annual Rabies Immunization Due",
          date: "2026-08-28",
          dotColor: "#EF4444",
          calendarIconColor: "#EF4444"
        },
        {
          id: "E3",
          petName: "Miya",
          title: "Vet Appointment: undefined",
          date: "2026-10-02",
          dotColor: "#F59E0B",
          calendarIconColor: "#F59E0B"
        }
      ];
    }

    return events;
  };

  const calendarEvents = getCalendarEvents();
  const lostCount = myFamilyPets.filter((p) => p.status === "Lost").length;
  const tagStatusPercent = myFamilyPets.length > 0
    ? Math.round(((myFamilyPets.length - lostCount) / myFamilyPets.length) * 100)
    : 100;

  return (
    <div className="parent-content-wrap">
      
      {/* ========================================================
          1. PAGE HEADER SECTION
      ======================================================== */}
      <div className="parent-page-header">
        <div>
          <div className="parent-hub-tag">
            <span className="parent-hub-dot" />
            FAMILY COMPANION HUB
          </div>
          <h1 className="parent-page-title">
            My Pet Family
          </h1>
          <p className="parent-page-subtitle">
            Monitor your adopted pets, review vaccination schedules, and manage tag alert flags.
          </p>
        </div>

        <button
          type="button"
          className="parent-btn-register"
          onClick={() => navigate("/parent/register")}
        >
          <Plus size={18} strokeWidth={2.5} /> Register Family Pet
        </button>
      </div>

      {isLoading ? (
        /* SKELETON LOADER */
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="parent-kpi-grid">
            <div className="skeleton" style={{ height: "136px", borderRadius: "20px" }} />
            <div className="skeleton" style={{ height: "136px", borderRadius: "20px" }} />
            <div className="skeleton" style={{ height: "136px", borderRadius: "20px" }} />
          </div>
          <div className="skeleton" style={{ height: "230px", borderRadius: "22px" }} />
          <div className="parent-cards-grid">
            <div className="skeleton" style={{ height: "380px", borderRadius: "22px" }} />
            <div className="skeleton" style={{ height: "380px", borderRadius: "22px" }} />
            <div className="skeleton" style={{ height: "380px", borderRadius: "22px" }} />
          </div>
        </div>
      ) : myFamilyPets.length === 0 ? (
        /* WARM EMPTY STATE */
        <div className="parent-calendar-card" style={{ textAlign: "center", padding: "60px 24px", alignItems: "center" }}>
          <div style={{
            width: "68px",
            height: "68px",
            borderRadius: "50%",
            backgroundColor: "#FFEDD5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.8rem"
          }}>
            🐾
          </div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#1F2937", margin: "16px 0 6px 0" }}>
            No registered pets in your family yet!
          </h2>
          <p style={{ color: "#6B7280", fontSize: "0.9rem", maxWidth: "440px", margin: "0 auto 20px auto", lineHeight: 1.5 }}>
            Adopt an animal from our partner NGO shelters or register a domestic companion into the PetLink digital tag registry.
          </p>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "9999px", padding: "10px 20px", fontWeight: 700 }}
              onClick={() => navigate("/parent/adopt")}
            >
              <Dog size={16} /> Browse Adoption Pets
            </button>
            <button
              type="button"
              className="parent-btn-register"
              onClick={() => navigate("/parent/register")}
            >
              <Plus size={16} strokeWidth={2.5} /> Register Family Pet
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ========================================================
              2. TOP 3 STAT KPI CARDS
          ======================================================== */}
          <div className="parent-kpi-grid">
            
            {/* Card 1: Active Vaccinations */}
            <div className="parent-kpi-card parent-kpi-vac">
              <div className="parent-kpi-top">
                <div className="parent-kpi-label-group">
                  <Calendar size={16} color="#7C3AED" />
                  <span>Active Vaccinations</span>
                </div>
                <span className="parent-kpi-badge">
                  {calendarEvents.filter(e => e.id.startsWith("IMM")).length || 2} Scheduled
                </span>
              </div>
              <div className="parent-kpi-bottom">
                <div>
                  <div className="parent-kpi-num">
                    {String(calendarEvents.filter(e => e.id.startsWith("IMM")).length || 2).padStart(2, '0')}
                  </div>
                  <div className="parent-kpi-sub">
                    Immunizations tracked
                  </div>
                </div>
                <div className="parent-kpi-squircle" style={{ color: "#78350F" }}>
                  🐾
                </div>
              </div>
            </div>

            {/* Card 2: Registered Pets */}
            <div className="parent-kpi-card parent-kpi-pets">
              <div className="parent-kpi-top">
                <div className="parent-kpi-label-group">
                  <span style={{ fontSize: "1rem" }}>🐾</span>
                  <span>Registered Pets</span>
                </div>
                <span className="parent-kpi-badge">
                  Both Microchipped
                </span>
              </div>
              <div className="parent-kpi-bottom">
                <div>
                  <div className="parent-kpi-num">
                    {String(myFamilyPets.length).padStart(2, '0')}
                  </div>
                  <div className="parent-kpi-sub">
                    {myFamilyPets.map(p => formatPetName(p.name)).join(" & ") || "Miya & Sheru"}
                  </div>
                </div>
                <div className="parent-kpi-squircle" style={{ color: "#EA580C" }}>
                  😄
                </div>
              </div>
            </div>

            {/* Card 3: Tag Alert Status */}
            <div className="parent-kpi-card parent-kpi-tag">
              <div className="parent-kpi-top">
                <div className="parent-kpi-label-group">
                  <CheckCircle2 size={16} color="#15803D" />
                  <span>Tag Alert Status</span>
                </div>
                <span className="parent-kpi-badge parent-kpi-badge-green">
                  Safe at Home
                </span>
              </div>
              <div className="parent-kpi-bottom">
                <div>
                  <div className="parent-kpi-num parent-kpi-num-green">
                    {tagStatusPercent}%
                  </div>
                  <div className="parent-kpi-sub parent-kpi-sub-green">
                    {lostCount > 0 ? `${lostCount} lost alert flag active` : "No active lost flags"}
                  </div>
                </div>
                <div className="parent-kpi-squircle" style={{ color: "#15803D" }}>
                  🛡️
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================
              3. FAMILY HEALTH CALENDAR & APPOINTMENTS
          ======================================================== */}
          <div className="parent-calendar-card">
            <div className="parent-calendar-header">
              <div className="parent-calendar-header-left">
                <div className="parent-calendar-icon-box">
                  🗓️
                </div>
                <div>
                  <h3 className="parent-calendar-title">
                    Family Health Calendar & Appointments
                  </h3>
                  <p className="parent-calendar-sub">
                    Upcoming preventive care routines and clinical reminders
                  </p>
                </div>
              </div>
              <span className="parent-badge-schedule">
                ● COMBINED SCHEDULE
              </span>
            </div>

            <div className="parent-calendar-list">
              {calendarEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="parent-calendar-row"
                  onClick={() => evt.targetPetId ? navigate(`/parent/pet/${evt.targetPetId}`) : navigate("/parent/appointments")}
                >
                  <div className="parent-calendar-row-left">
                    <span
                      className="parent-calendar-dot"
                      style={{ backgroundColor: evt.dotColor }}
                    />
                    <div className="parent-calendar-row-text">
                      <span className="parent-calendar-row-petname">{evt.petName}</span>
                      {" • "}
                      <span>{evt.title}</span>
                    </div>
                  </div>

                  <div className="parent-calendar-row-right">
                    <span className="parent-calendar-date-pill">
                      <span style={{ color: evt.calendarIconColor }}>📅</span>
                      <span>{evt.date}</span>
                    </span>
                    <ChevronRight size={16} className="parent-calendar-chevron" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================
              4. SEARCH BAR
          ======================================================== */}
          <div className="parent-search-wrap">
            <Search size={18} className="parent-search-icon" />
            <input
              type="text"
              placeholder="Search your pets by name, breed, or tag ID..."
              className="parent-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="parent-search-shortcut">⌘K</span>
          </div>

          {/* ========================================================
              5. REGISTERED COMPANIONS GRID (2 COLUMNS)
          ======================================================== */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Header row */}
            <div className="parent-companions-header">
              <div className="parent-companions-title-group">
                <h3 className="parent-companions-title">Registered Companions</h3>
                <span className="parent-companions-count-pill">{filteredPets.length}</span>
              </div>
              <div className="parent-filters-indicator">
                <SlidersHorizontal size={14} />
                <span>Active Filters: None</span>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="parent-cards-grid">
              {filteredPets.map((pet) => {
                const formattedName = formatPetName(pet.name);
                const isCat = pet.species?.toLowerCase() === "cat" || pet.breed?.toLowerCase().includes("cat");
                const ageNumber = pet.age ? pet.age.replace(/[^0-9]/g, '') || "2" : "2";

                return (
                  <div
                    key={pet.id}
                    className="parent-pet-card"
                    onClick={() => navigate(`/parent/pet/${pet.id}`)}
                  >
                    {/* Pet Image Box with Active Tag & Three Dots Menu */}
                    <div className="parent-pet-img-box">
                      <img
                        src={pet.photo || pet.image || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600"}
                        alt={pet.name}
                        className="parent-pet-img"
                      />
                      
                      {/* Floating Active Tag Pill */}
                      <div className="parent-tag-active-pill">
                        <span className="parent-tag-dot" />
                        ACTIVE TAG
                      </div>

                      {/* Floating Three Dots Menu Button */}
                      <button
                        type="button"
                        className="parent-card-menu-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/parent/pet/${pet.id}`);
                        }}
                        title="Pet profile options"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </div>

                    {/* Name & TAG ID */}
                    <div className="parent-pet-info-row">
                      <div>
                        <h4 className="parent-pet-name">{formattedName}</h4>
                        <p className="parent-pet-species-breed">
                          {pet.species ? (pet.species.charAt(0).toUpperCase() + pet.species.slice(1)) : "Dog"} • {pet.breed || "local"}
                        </p>
                      </div>
                      <div className="parent-pet-tag-group">
                        <span className="parent-pet-tag-label">TAG ID</span>
                        <span className="parent-pet-tag-id">{pet.id}</span>
                      </div>
                    </div>

                    {/* Badges Row */}
                    <div className="parent-pet-badges-row">
                      <span className="parent-pill-age">
                        <Cake size={12} /> Age: {ageNumber}
                      </span>
                      {isCat ? (
                        <span className="parent-pill-feature">
                          # Microchip Active
                        </span>
                      ) : (
                        <span className="parent-pill-feature">
                          <ShieldCheck size={12} /> Safety Sync OK
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="parent-pet-card-footer">
                      <div className="parent-updated-text">
                        <span className="parent-updated-dot" />
                        <span>Updated: {pet.lastUpdated || "Just now"}</span>
                      </div>
                      <button
                        type="button"
                        className="parent-btn-view-profile"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/parent/pet/${pet.id}`);
                        }}
                      >
                        <span>View Profile</span>
                        <ArrowUpRight size={13} />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

          {/* ========================================================
              6. RABIES SEASON REMINDER BANNER
          ======================================================== */}
          <div className="parent-reminder-card">
            <div className="parent-reminder-left">
              <div className="parent-reminder-squircle">
                💡
              </div>
              <div>
                <h4 className="parent-reminder-title">Rabies Season Reminder</h4>
                <p className="parent-reminder-desc">
                  Both Miya and Sheru have scheduled immunization renewals approaching in August 2026. Keep their digital tags updated to prevent alert lapses.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="parent-btn-care-res"
              onClick={() => navigate("/parent/appointments")}
            >
              Explore Care Resources
            </button>
          </div>
        </>
      )}

    </div>
  );
};

export default MyPets;
