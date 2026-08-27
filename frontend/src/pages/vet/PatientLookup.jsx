import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { Scan, Search, AlertCircle, ArrowRight, Loader } from "lucide-react";

const PatientLookup = () => {
  const { animals } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("Initializing sensor...");
  const [isSearching, setIsSearching] = useState(false);
  const [filteredResults, setFilteredResults] = useState([]);
  const navigate = useNavigate();

  // Handle Search Input Filter with a Mock 400ms Delay to simulate API lookup
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayTimer = setTimeout(() => {
      const searchLower = searchTerm.toLowerCase();
      const results = animals.filter(pet => 
        pet.id.toLowerCase().includes(searchLower) ||
        pet.name.toLowerCase().includes(searchLower) ||
        pet.breed.toLowerCase().includes(searchLower)
      );
      setFilteredResults(results);
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(delayTimer);
  }, [searchTerm, animals]);

  // Simulate scanning QR/NFC Tag
  const handleStartScan = () => {
    setIsScanning(true);
    setScanStatus("Opening lens module...");

    // Stage 1: Viewfinder active
    setTimeout(() => {
      setScanStatus("Focusing on collar QR code...");
    }, 800);

    // Stage 2: QR detected
    setTimeout(() => {
      setScanStatus("Decrypting microchip ID...");
    }, 1500);

    // Stage 3: Resolve & Navigate
    setTimeout(() => {
      // Pick a random animal from the database
      const randomIdx = Math.floor(Math.random() * animals.length);
      const chosenPet = animals[randomIdx];
      setIsScanning(false);
      navigate(`/vet/medical/${chosenPet.id}`);
    }, 2200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "800px", margin: "0 auto" }}>
      
      {/* Header Info */}
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "8px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
          Patient Record Lookup
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Scan collar QR tags or search manual registries to lookup existing animal clinical histories.
        </p>
        <div style={{
          alignSelf: "center",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "var(--accent-coral-light)",
          color: "var(--accent-coral)",
          padding: "6px 16px",
          borderRadius: "30px",
          fontSize: "0.82rem",
          fontWeight: 700,
          border: "1px solid rgba(217, 83, 79, 0.2)",
          marginTop: "4px"
        }}>
          <AlertCircle size={14} /> Look up an existing animal record — new profiles are created by NGOs or Pet Parents only.
        </div>
      </div>

      {/* SCANNING & SEARCH SPLIT INTERFACE */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "32px",
        marginTop: "16px"
      }}>
        
        {/* Row 1: Large NFC/QR Trigger */}
        <div className="card" style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          padding: "48px 32px",
          border: "2px dashed var(--border-color)",
          backgroundColor: "#FCFAF6",
          textAlign: "center",
          cursor: "pointer"
        }} onClick={handleStartScan}>
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "var(--accent-coral)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 16px rgba(217, 83, 79, 0.2)"
          }}>
            <Scan size={36} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)" }}>Scan Collar QR / NFC Chip</h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "4px", maxWidth: "340px" }}>
              Click to initiate hardware scanner simulation and decode collar identification tags.
            </p>
          </div>
        </div>

        {/* Row 2: Manual Search Registry */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Search Registry Manually</h3>
          
          <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "16px", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Type patient registration ID (e.g., PL-2026-0040) or name..."
              className="form-control"
              style={{ width: "100%", paddingLeft: "46px", paddingRight: "16px", borderRadius: "14px" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Search Result Skeletons & Display List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {isSearching ? (
              // Skeleton loading list items (simulate fetch delay)
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="skeleton" style={{ height: "64px", borderRadius: "12px" }} />
                ))}
              </div>
            ) : filteredResults.length > 0 ? (
              // Results Display
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {filteredResults.map((pet) => (
                  <div
                    key={pet.id}
                    onClick={() => navigate(`/vet/medical/${pet.id}`)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 18px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "12px",
                      backgroundColor: "#FCFAF6",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "white";
                      e.currentTarget.style.borderColor = "var(--accent-coral)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#FCFAF6";
                      e.currentTarget.style.borderColor = "var(--border-color)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <img 
                        src={pet.photo} 
                        alt={pet.name} 
                        style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border-color)" }} 
                      />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 800, fontSize: "0.9rem" }}>{pet.name}</span>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "monospace" }}>{pet.id} • {pet.breed}</span>
                      </div>
                    </div>
                    <ArrowRight size={16} color="var(--accent-coral)" />
                  </div>
                ))}
              </div>
            ) : searchTerm.trim() ? (
              // Search has run but returned no records
              <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                🔍 No existing records found for "{searchTerm}".
              </div>
            ) : null}
          </div>
        </div>

      </div>

      {/* ========================================================
          CAMERA SCAN VIEW VIEWPORT (OVERLAY MODAL)
      ======================================================== */}
      {isScanning && (
        <div className="modal-overlay" style={{ zIndex: 9999, backgroundColor: "rgba(0,0,0,0.85)" }}>
          <div className="modal-content" style={{
            maxWidth: "460px",
            backgroundColor: "#111",
            color: "white",
            border: "1px solid rgba(255,255,255,0.1)",
            textAlign: "center",
            padding: "32px 24px"
          }}>
            <h2 style={{ color: "white", fontWeight: 800, marginBottom: "8px", fontSize: "1.3rem" }}>
              QR Scanner Active
            </h2>
            <p style={{ fontSize: "0.8rem", color: "#888", marginBottom: "20px" }}>
              Keep collar tag within the frame lines.
            </p>

            {/* Simulated camera scanning box */}
            <div style={{
              position: "relative",
              width: "280px",
              height: "280px",
              margin: "0 auto 24px",
              border: "2px solid rgba(255,255,255,0.3)",
              borderRadius: "20px",
              overflow: "hidden",
              backgroundColor: "#222",
              boxShadow: "inset 0 0 40px rgba(0,0,0,0.8)"
            }}>
              {/* Animated Scan Line */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                backgroundColor: "var(--accent-coral)",
                boxShadow: "0 0 10px var(--accent-coral)",
                animation: "scanner-move 2.2s linear infinite"
              }} />

              {/* Central QR Code Silhouette */}
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "160px",
                height: "160px",
                opacity: 0.25,
                backgroundImage: "radial-gradient(#FFF 2px, transparent 2px)",
                backgroundSize: "8px 8px"
              }} />

              {/* Target bracket overlays */}
              <div style={{ position: "absolute", top: "20px", left: "20px", width: "24px", height: "24px", borderTop: "3px solid white", borderLeft: "3px solid white" }} />
              <div style={{ position: "absolute", top: "20px", right: "20px", width: "24px", height: "24px", borderTop: "3px solid white", borderRight: "3px solid white" }} />
              <div style={{ position: "absolute", bottom: "20px", left: "20px", width: "24px", height: "24px", borderBottom: "3px solid white", borderLeft: "3px solid white" }} />
              <div style={{ position: "absolute", bottom: "20px", right: "20px", width: "24px", height: "24px", borderBottom: "3px solid white", borderRight: "3px solid white" }} />
            </div>

            {/* Status indicators */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", color: "var(--accent-coral)" }}>
              <Loader size={16} className="animate-spin" />
              <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>{scanStatus}</span>
            </div>
            
            <button
              onClick={() => setIsScanning(false)}
              className="btn btn-outline"
              style={{ color: "white", borderColor: "rgba(255,255,255,0.3)", marginTop: "24px", width: "100%" }}
            >
              Terminate Scanner
            </button>
          </div>
        </div>
      )}

      {/* Embedded scanner-move animations */}
      <style>{`
        @keyframes scanner-move {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>

    </div>
  );
};

export default PatientLookup;
