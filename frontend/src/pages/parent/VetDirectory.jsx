import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  MapPin,
  Phone,
  Building2,
  Calendar,
  ChevronRight,
  SlidersHorizontal,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Check,
  Briefcase
} from "lucide-react";

const VetDirectory = () => {
  const { fetchVets, animals, requestVetAppointment } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [vets, setVets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("");
  const [debouncedCity, setDebouncedCity] = useState("");
  const [activeLocationPill, setActiveLocationPill] = useState("All Locations");
  const [loadError, setLoadError] = useState(null);

  // Request modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedVet, setSelectedVet] = useState(null);
  const [form, setForm] = useState({ petId: "", requestedDate: "", reason: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // My pets (owned by the logged-in parent)
  const myPets = (animals || []).filter(
    (a) => a.ownerId === user?.id || a.ownerId?.toString() === user?.id
  );

  // Debounce city filter input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCity(cityFilter), 300);
    return () => clearTimeout(timer);
  }, [cityFilter]);

  // Fetch vets when debounced city changes
  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);
    fetchVets(debouncedCity)
      .then((data) => {
        setVets(data || []);
        setIsLoading(false);
      })
      .catch(() => {
        setLoadError("Failed to load vet directory. Please try again.");
        setIsLoading(false);
      });
  }, [debouncedCity]);

  const handleOpenModal = (vet) => {
    setSelectedVet(vet);
    setForm({ petId: myPets[0]?.id || "", requestedDate: "", reason: "" });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVet(null);
    setForm({ petId: "", requestedDate: "", reason: "" });
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!form.petId || !form.requestedDate || !form.reason || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await requestVetAppointment(form.petId, selectedVet._id, form.requestedDate, form.reason);
      handleCloseModal();
    } catch (err) {
      // Error toast already shown in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name) => {
    return (name || "?")
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("");
  };

  return (
    <div className="parent-content-wrap parent-findvet-wrap">
      {/* ========================================================
          1. HERO HEADER BANNER
          ======================================================== */}
      <div className="parent-findvet-hero">
        <div className="parent-findvet-hero-content">
          <div className="parent-findvet-hero-badge">
            <Check size={14} color="#16A34A" strokeWidth={3} />
            Verified Care Directory
          </div>
          <h1 className="parent-findvet-hero-title">Find a Veterinarian</h1>
          <p className="parent-findvet-hero-sub">
            Browse registered vets on PetLink and send a booking request directly — no phone tag needed.
          </p>
        </div>

        <div className="parent-findvet-hero-stat">
          <div className="parent-findvet-hero-stat-icon">
            <Briefcase size={22} />
          </div>
          <div className="parent-findvet-hero-stat-info">
            <span className="parent-findvet-hero-stat-label">NETWORK VETS</span>
            <span className="parent-findvet-hero-stat-val">24/7 Available</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. FILTER ROW (SEARCH BAR + LOCATION PILLS)
          ======================================================== */}
      <div className="parent-findvet-filter-row">
        <div className="parent-findvet-search-box">
          <Search size={16} className="parent-findvet-search-icon" />
          <input
            type="text"
            className="parent-findvet-search-input"
            placeholder="Filter by city (e.g. Pune, Mu..."
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              if (e.target.value === "") {
                setActiveLocationPill("All Locations");
              } else if (e.target.value.toLowerCase() === "ahmedabad") {
                setActiveLocationPill("Ahmedabad");
              } else if (e.target.value.toLowerCase() === "surat") {
                setActiveLocationPill("Surat");
              } else {
                setActiveLocationPill("");
              }
            }}
          />
          {cityFilter && (
            <button
              type="button"
              className="parent-findvet-search-clear"
              onClick={() => {
                setCityFilter("");
                setActiveLocationPill("All Locations");
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="parent-findvet-pills">
          <button
            type="button"
            className={`parent-findvet-pill-btn ${activeLocationPill === "All Locations" ? "active" : ""}`}
            onClick={() => {
              setActiveLocationPill("All Locations");
              setCityFilter("");
            }}
          >
            <SlidersHorizontal size={14} /> All Locations
          </button>
          <button
            type="button"
            className={`parent-findvet-pill-btn ${activeLocationPill === "Ahmedabad" ? "active" : ""}`}
            onClick={() => {
              setActiveLocationPill("Ahmedabad");
              setCityFilter("Ahmedabad");
            }}
          >
            Ahmedabad
          </button>
          <button
            type="button"
            className={`parent-findvet-pill-btn ${activeLocationPill === "Surat" ? "active" : ""}`}
            onClick={() => {
              setActiveLocationPill("Surat");
              setCityFilter("Surat");
            }}
          >
            Surat
          </button>
        </div>
      </div>

      {/* ========================================================
          3. 3-COLUMN VET DIRECTORY GRID
          ======================================================== */}
      {isLoading ? (
        <div className="parent-findvet-grid">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: "260px", borderRadius: "22px" }}
            />
          ))}
        </div>
      ) : loadError ? (
        <div
          className="parent-findvet-card"
          style={{ textAlign: "center", padding: "48px 24px", gridColumn: "1 / -1" }}
        >
          <AlertCircle size={36} color="#DC2626" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1F2937", margin: "0 0 6px" }}>
            {loadError}
          </h3>
          <button
            type="button"
            className="parent-btn-book-visit"
            style={{ margin: "16px auto 0" }}
            onClick={() => setDebouncedCity(debouncedCity + " ")}
          >
            Retry Search
          </button>
        </div>
      ) : (
        <div className="parent-findvet-grid">
          {/* Real Vet Cards */}
          {vets.map((vet) => (
            <div key={vet._id} className="parent-findvet-card">
              <div className="parent-findvet-card-accent" />

              <div className="parent-findvet-card-header">
                <div className="parent-findvet-avatar-row">
                  <div className="parent-findvet-avatar">
                    {getInitials(vet.name)}
                  </div>
                  <div className="parent-findvet-title-block">
                    <span className="parent-findvet-name">Dr. {vet.name}</span>
                    <span className="parent-findvet-clinic">
                      <Building2 size={13} /> {vet.vetProfile?.clinicName || vet.city}
                    </span>
                  </div>
                </div>
                <span className="parent-findvet-status-pill">
                  <span className="parent-findvet-status-dot" /> Open Now
                </span>
              </div>

              <div className="parent-findvet-meta-box">
                <MapPin size={15} color="#FF6A00" style={{ flexShrink: 0 }} />
                <span>{vet.address ? `${vet.address}, ${vet.city}` : vet.city}</span>
              </div>

              {vet.phone && (
                <div className="parent-findvet-meta-box">
                  <Phone size={15} color="#FF6A00" style={{ flexShrink: 0 }} />
                  <span>{vet.phone}</span>
                </div>
              )}

              <button
                type="button"
                className="parent-findvet-btn-request"
                onClick={() => handleOpenModal(vet)}
              >
                <Calendar size={15} /> Request Appointment <ChevronRight size={15} />
              </button>
            </div>
          ))}

          {/* Need Urgent Care Callout Card */}
          <div className="parent-findvet-urgent-card">
            <div>
              <div className="parent-findvet-urgent-icon-circle">
                <HelpCircle size={22} />
              </div>
              <h3 className="parent-findvet-urgent-title">Need urgent care?</h3>
              <p className="parent-findvet-urgent-desc">
                Connect with 24-hour emergency on-call vets immediately or view nearest triage facilities.
              </p>
            </div>

            <button
              type="button"
              className="parent-findvet-urgent-btn"
              onClick={() => navigate("/parent/emergency")}
            >
              <Sparkles size={16} color="#DC2626" /> Emergency Facilities
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          4. APPOINTMENT REQUEST MODAL
          ======================================================== */}
      {showModal && selectedVet && (
        <div className="modal-overlay" onClick={handleCloseModal} style={{ zIndex: 9999 }}>
          <div
            className="modal-content animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "480px", borderRadius: "24px" }}
          >
            <div className="modal-header">
              <h2
                style={{
                  fontWeight: 800,
                  color: "#1F2937",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "1.2rem"
                }}
              >
                <Calendar size={20} color="#FF6A00" /> Request Appointment
              </h2>
              <button type="button" className="modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            {/* Selected Vet Summary */}
            <div
              style={{
                backgroundColor: "#FFF6EE",
                border: "1px solid #FEE2CD",
                borderRadius: "14px",
                padding: "14px 16px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "#FF6A00",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                  fontWeight: 800,
                  flexShrink: 0
                }}
              >
                {getInitials(selectedVet.name)}
              </div>
              <div>
                <div style={{ fontWeight: 800, color: "#111827", fontSize: "0.98rem" }}>
                  Dr. {selectedVet.name}
                </div>
                <div style={{ fontSize: "0.82rem", color: "#6B7280" }}>
                  {selectedVet.vetProfile?.clinicName || selectedVet.city}
                </div>
              </div>
            </div>

            {myPets.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#6B7280" }}>
                <p>You have no registered pets. Please <strong>Register a Family Pet</strong> first before booking an appointment.</p>
                <button
                  type="button"
                  className="parent-btn-book-visit"
                  style={{ margin: "14px auto 0" }}
                  onClick={() => navigate("/parent/register")}
                >
                  Register Family Pet
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Pet Selector */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>Which pet is this for? *</label>
                  <select
                    className="form-control"
                    value={form.petId}
                    onChange={(e) => setForm({ ...form, petId: e.target.value })}
                    required
                    style={{ borderRadius: "12px", padding: "10px 14px" }}
                  >
                    <option value="" disabled>Select a pet...</option>
                    {myPets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.species})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preferred Date */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>Preferred Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.requestedDate}
                    onChange={(e) => setForm({ ...form, requestedDate: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    required
                    style={{ borderRadius: "12px", padding: "10px 14px" }}
                  />
                </div>

                {/* Reason */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>Reason for Visit *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Annual checkup, vaccination, fever..."
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    required
                    style={{ borderRadius: "12px", padding: "10px 14px" }}
                  />
                </div>

                <p style={{ fontSize: "0.78rem", color: "#6B7280", margin: "-4px 0 0 0" }}>
                  The vet will review your request and accept, propose a new time, or decline.
                </p>

                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ flex: 1, borderRadius: "9999px" }}
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="parent-btn-book-visit"
                    disabled={isSubmitting}
                    style={{ flex: 1, justifyContent: "center", opacity: isSubmitting ? 0.7 : 1 }}
                  >
                    {isSubmitting ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VetDirectory;
