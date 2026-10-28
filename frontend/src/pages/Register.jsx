import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  PawPrint, Heart, Stethoscope, Building2, ArrowRight, Lock,
  Mail, AlertCircle, ArrowLeft, User, Phone, MapPin, Building, ShieldCheck
} from "lucide-react";

const ROLES = [
  {
    id: "parent",
    label: "Pet Parent",
    nameLabel: "Full Name",
    namePlaceholder: "e.g. Rohan Deshmukh",
    color: "#D97706",
    bgLight: "rgba(245, 198, 71, 0.12)",
    icon: Heart,
    redirect: "/parent/pets"
  },
  {
    id: "ngo",
    label: "NGO Worker",
    nameLabel: "Organization Name",
    namePlaceholder: "e.g. Asha Animal Rescue Foundation",
    color: "#2E6F56",
    bgLight: "rgba(46, 111, 86, 0.12)",
    icon: Building2,
    redirect: "/ngo/overview"
  },
  {
    id: "vet",
    label: "Veterinarian",
    nameLabel: "Doctor Full Name",
    namePlaceholder: "e.g. Dr. Priya Patil",
    color: "#E05D5D",
    bgLight: "rgba(224, 93, 93, 0.12)",
    icon: Stethoscope,
    redirect: "/vet/queue"
  }
];

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") || "parent";

  const [selectedRole, setSelectedRole] = useState(
    ["ngo", "vet", "parent"].includes(initialRole) ? initialRole : "parent"
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    city: "Pune",
    // NGO specific
    region: "",
    // Vet specific
    clinicName: "",
    licenseNumber: ""
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const currentRole = ROLES.find(r => r.id === selectedRole) || ROLES[0];

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam && ["ngo", "vet", "parent"].includes(roleParam)) {
      setSelectedRole(roleParam);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate
    if (!form.name || !form.email || !form.password || !form.address || !form.city) {
      setError("Please complete all required fields (Name, Email, Password, Address, City).");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (selectedRole === "vet" && (!form.clinicName || !form.licenseNumber)) {
      setError("Please enter your Clinic Name and Veterinary License Number.");
      return;
    }

    if (selectedRole === "ngo" && !form.region) {
      setError("Please enter your NGO operating region or jurisdiction.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        role: selectedRole,
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        address: form.address,
        city: form.city,
        ...(selectedRole === "ngo" ? { region: form.region } : {}),
        ...(selectedRole === "vet" ? { clinicName: form.clinicName, licenseNumber: form.licenseNumber } : {})
      };

      const user = await register(payload);
      // Immediately redirect to user's portal without requiring another login
      if (user.role === "ngo") navigate("/ngo/overview");
      else if (user.role === "vet") navigate("/vet/queue");
      else navigate("/parent/pets");
    } catch (err) {
      const msg = err.response?.data?.error || "Registration failed. Please check the form and try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at 10% 20%, rgba(46, 111, 86, 0.04) 0%, rgba(250, 248, 245, 1) 90%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 16px",
      position: "relative"
    }}>
      {/* Top Bar Back Link */}
      <div style={{
        position: "absolute",
        top: "24px",
        left: "24px"
      }}>
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--text-muted)",
            textDecoration: "none",
            fontSize: "0.9rem",
            fontWeight: 600,
            padding: "8px 14px",
            borderRadius: "10px",
            backgroundColor: "white",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)"
          }}
        >
          <ArrowLeft size={16} /> Home
        </Link>
      </div>

      <div style={{
        width: "100%",
        maxWidth: "560px",
        display: "flex",
        flexDirection: "column",
        gap: "24px"
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            backgroundColor: currentRole.bgLight,
            color: currentRole.color,
            marginBottom: "14px",
            transition: "all 0.3s ease"
          }}>
            <PawPrint size={30} />
          </div>
          <h1 style={{
            fontSize: "1.85rem",
            fontWeight: 800,
            color: "var(--text-main)",
            letterSpacing: "-0.02em",
            marginBottom: "6px"
          }}>
            Create PawSetu Account
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
            Register as a {currentRole.label} to connect with the municipal network
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div>
          <label style={{
            fontSize: "0.78rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--text-muted)",
            display: "block",
            marginBottom: "8px",
            textAlign: "center"
          }}>
            Choose Account Role
          </label>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "8px",
            backgroundColor: "white",
            padding: "6px",
            borderRadius: "16px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)"
          }}>
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setSelectedRole(r.id);
                    setError("");
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                    padding: "12px 8px",
                    borderRadius: "12px",
                    border: isSelected ? `2px solid ${r.color}` : "2px solid transparent",
                    backgroundColor: isSelected ? r.bgLight : "transparent",
                    color: isSelected ? r.color : "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <Icon size={20} strokeWidth={isSelected ? 2.5 : 2} />
                  <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Registration Card */}
        <div className="card" style={{
          padding: "32px",
          borderRadius: "20px",
          borderTop: `4px solid ${currentRole.color}`,
          boxShadow: "var(--shadow-md)"
        }}>
          {error && (
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "12px 14px",
              backgroundColor: "rgba(224, 93, 93, 0.1)",
              border: "1px solid rgba(224, 93, 93, 0.3)",
              borderRadius: "10px",
              color: "var(--accent-coral)",
              fontSize: "0.85rem",
              fontWeight: 500,
              marginBottom: "20px"
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "1px" }} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Name field */}
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                {currentRole.nameLabel} <span style={{ color: "var(--accent-coral)" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <User size={17} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder={currentRole.namePlaceholder}
                  value={form.name}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: "40px", borderRadius: "12px" }}
                />
              </div>
            </div>

            {/* Email & Password Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                  Email <span style={{ color: "var(--accent-coral)" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={17} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    style={{ paddingLeft: "40px", borderRadius: "12px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                  Password <span style={{ color: "var(--accent-coral)" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={17} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    required
                    style={{ paddingLeft: "40px", borderRadius: "12px" }}
                  />
                </div>
              </div>
            </div>

            {/* Phone & City Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                  Phone Number
                </label>
                <div style={{ position: "relative" }}>
                  <Phone size={17} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={handleChange}
                    style={{ paddingLeft: "40px", borderRadius: "12px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                  City <span style={{ color: "var(--accent-coral)" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <MapPin size={17} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    placeholder="e.g. Pune"
                    value={form.city}
                    onChange={handleChange}
                    required
                    style={{ paddingLeft: "40px", borderRadius: "12px" }}
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                Street / Area Address <span style={{ color: "var(--accent-coral)" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <MapPin size={17} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  placeholder="e.g. 14 Kothrud Road, Near Shivaji Chowk"
                  value={form.address}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: "40px", borderRadius: "12px" }}
                />
              </div>
            </div>

            {/* Role-Specific Fields */}
            {selectedRole === "ngo" && (
              <div style={{
                padding: "16px",
                borderRadius: "14px",
                backgroundColor: currentRole.bgLight,
                border: "1px solid rgba(46, 111, 86, 0.2)",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 800, color: currentRole.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  NGO Region & Jurisdiction
                </div>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                    Operating Region / Ward <span style={{ color: "var(--accent-coral)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="region"
                    className="form-control"
                    placeholder="e.g. Pune Central & Kothrud Division"
                    value={form.region}
                    onChange={handleChange}
                    required
                    style={{ borderRadius: "10px", backgroundColor: "white" }}
                  />
                </div>
              </div>
            )}

            {selectedRole === "vet" && (
              <div style={{
                padding: "16px",
                borderRadius: "14px",
                backgroundColor: currentRole.bgLight,
                border: "1px solid rgba(224, 93, 93, 0.2)",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 800, color: currentRole.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Veterinary Credentials
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                      Clinic / Hospital <span style={{ color: "var(--accent-coral)" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <Building size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                      <input
                        type="text"
                        name="clinicName"
                        className="form-control"
                        placeholder="e.g. Pune Vet Hospital"
                        value={form.clinicName}
                        onChange={handleChange}
                        required
                        style={{ paddingLeft: "34px", borderRadius: "10px", backgroundColor: "white" }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                      License / Reg No <span style={{ color: "var(--accent-coral)" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <ShieldCheck size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                      <input
                        type="text"
                        name="licenseNumber"
                        className="form-control"
                        placeholder="e.g. MH-VET-3401"
                        value={form.licenseNumber}
                        onChange={handleChange}
                        required
                        style={{ paddingLeft: "34px", borderRadius: "10px", backgroundColor: "white" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn"
              style={{
                backgroundColor: currentRole.color,
                color: "white",
                borderColor: currentRole.color,
                padding: "13px",
                borderRadius: "12px",
                fontSize: "0.95rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? "Creating Account..." : `Register as ${currentRole.label}`}
              {!isSubmitting && <ArrowRight size={17} />}
            </button>
          </form>

          {/* Switch to Login */}
          <div style={{
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid var(--border-color)",
            textAlign: "center",
            fontSize: "0.88rem",
            color: "var(--text-muted)"
          }}>
            Already have an account?{" "}
            <Link
              to={`/login?role=${selectedRole}`}
              style={{
                color: currentRole.color,
                fontWeight: 700,
                textDecoration: "none"
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
