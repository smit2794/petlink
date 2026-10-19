import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PawPrint, Heart, Stethoscope, Building2, ArrowRight, Lock, Mail, AlertCircle, ArrowLeft } from "lucide-react";

const ROLES = [
  {
    id: "parent",
    label: "Pet Parent",
    subtitle: "My Pets & Health",
    color: "#D97706",
    bgLight: "rgba(245, 198, 71, 0.12)",
    icon: Heart,
    redirect: "/parent/pets"
  },
  {
    id: "ngo",
    label: "NGO Worker",
    subtitle: "Rescues & Shelter",
    color: "#2E6F56",
    bgLight: "rgba(46, 111, 86, 0.12)",
    icon: Building2,
    redirect: "/ngo/overview"
  },
  {
    id: "vet",
    label: "Veterinarian",
    subtitle: "Clinic & Patients",
    color: "#E05D5D",
    bgLight: "rgba(224, 93, 93, 0.12)",
    icon: Stethoscope,
    redirect: "/vet/queue"
  }
];

const DEMO_ACCOUNTS = {
  parent: { email: "parent@test.com", password: "password123", label: "Pet Parent" },
  ngo: { email: "ngo@test.com", password: "password123", label: "NGO Worker" },
  vet: { email: "vet@test.com", password: "password123", label: "Veterinarian" }
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine initial role from URL query or navigation origin (e.g. redirected from /ngo/animals)
  const queryRole = new URLSearchParams(location.search).get("role");
  const fromPath = location.state?.from?.pathname || "";
  const initialRole = queryRole && ["parent", "ngo", "vet"].includes(queryRole)
    ? queryRole
    : fromPath.startsWith("/ngo")
    ? "ngo"
    : fromPath.startsWith("/vet")
    ? "vet"
    : "ngo"; // Default to NGO as requested

  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [email, setEmail] = useState(DEMO_ACCOUNTS[initialRole]?.email || "ngo@test.com");
  const [password, setPassword] = useState(DEMO_ACCOUNTS[initialRole]?.password || "password123");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();

  const currentRole = ROLES.find(r => r.id === selectedRole) || ROLES[1]; // default to NGO if not found

  // Switch role tab and sync demo credentials
  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setError("");
    const demo = DEMO_ACCOUNTS[roleId];
    if (demo) {
      setEmail(demo.email);
      setPassword(demo.password);
    }
  };

  const executeLogin = async (loginEmail, loginPass, roleHint) => {
    setError("");
    const cleanEmail = (loginEmail || "").trim().toLowerCase();
    const cleanPass = (loginPass || "").trim();

    if (!cleanEmail || !cleanPass) {
      setError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Authenticate without strict role constraint so valid accounts always succeed
      const user = await login(cleanEmail, cleanPass);
      const redirect = new URLSearchParams(location.search).get("redirect");
      if (redirect) {
        navigate(redirect);
      } else if (user.role === "ngo") {
        navigate("/ngo/animals");
      } else if (user.role === "vet") {
        navigate("/vet/queue");
      } else {
        navigate("/parent/pets");
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed. Please check your credentials.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeLogin(email, password, selectedRole);
  };

  const handleQuickDemoLogin = (roleId) => {
    const demo = DEMO_ACCOUNTS[roleId] || DEMO_ACCOUNTS.ngo;
    setSelectedRole(roleId);
    setEmail(demo.email);
    setPassword(demo.password);
    executeLogin(demo.email, demo.password, roleId);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at 10% 20%, rgba(46, 111, 86, 0.05) 0%, rgba(250, 248, 245, 1) 90%)",
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
        maxWidth: "480px",
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
            Welcome to PetLink OS
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
            Sign in to access your portal and records
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
            Select Your Account Role
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
                  onClick={() => handleRoleSelect(r.id)}
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

        {/* Login Card */}
        <div className="card" style={{
          padding: "32px",
          borderRadius: "20px",
          borderTop: `4px solid ${currentRole.color}`,
          boxShadow: "var(--shadow-md)"
        }}>
          {error && (
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              padding: "12px 14px",
              backgroundColor: "rgba(224, 93, 93, 0.1)",
              border: "1px solid rgba(224, 93, 93, 0.3)",
              borderRadius: "10px",
              color: "var(--accent-coral)",
              fontSize: "0.85rem",
              fontWeight: 500,
              marginBottom: "20px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin(selectedRole)}
                style={{
                  alignSelf: "flex-start",
                  background: "none",
                  border: "none",
                  color: currentRole.color,
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: 0
                }}
              >
                Click here to auto-fill & sign in with Demo {currentRole.label} Account ({DEMO_ACCOUNTS[selectedRole]?.email})
              </button>
            </div>
          )}

          {/* Quick Demo Credentials Helper */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 14px",
            backgroundColor: currentRole.bgLight,
            borderRadius: "12px",
            border: `1px dashed ${currentRole.color}`,
            marginBottom: "20px",
            fontSize: "0.82rem"
          }}>
            <div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.74rem", display: "block" }}>Demo {currentRole.label} Account:</span>
              <strong style={{ color: currentRole.color }}>{DEMO_ACCOUNTS[selectedRole]?.email}</strong>
              <span style={{ color: "var(--text-muted)", marginLeft: "6px" }}>(pass: <code>password123</code>)</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const demo = DEMO_ACCOUNTS[selectedRole];
                setEmail(demo.email);
                setPassword(demo.password);
                setError("");
              }}
              style={{
                backgroundColor: currentRole.color,
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "6px 12px",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
              }}
            >
              Auto-fill
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={17} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    paddingLeft: "40px",
                    borderRadius: "12px",
                    borderColor: "var(--border-color)"
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={17} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    paddingLeft: "40px",
                    borderRadius: "12px",
                    borderColor: "var(--border-color)"
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn"
              style={{
                backgroundColor: currentRole.color,
                color: "white",
                borderColor: currentRole.color,
                padding: "12px",
                borderRadius: "12px",
                fontSize: "0.95rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "6px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? "Signing In..." : `Sign In as ${currentRole.label}`}
              {!isSubmitting && <ArrowRight size={17} />}
            </button>

            {/* Direct 1-Click Demo Login */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleQuickDemoLogin(selectedRole)}
              style={{
                background: currentRole.bgLight,
                border: `1.5px solid ${currentRole.color}`,
                color: currentRole.color,
                padding: "10px",
                borderRadius: "12px",
                fontSize: "0.88rem",
                fontWeight: 700,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.2s ease"
              }}
            >
              ⚡ Instant 1-Click Sign In as {currentRole.label}
            </button>
          </form>

          {/* Switch to Register */}
          <div style={{
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid var(--border-color)",
            textAlign: "center",
            fontSize: "0.88rem",
            color: "var(--text-muted)"
          }}>
            Don't have an account yet?{" "}
            <Link
              to={`/register?role=${selectedRole}`}
              style={{
                color: currentRole.color,
                fontWeight: 700,
                textDecoration: "none"
              }}
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
