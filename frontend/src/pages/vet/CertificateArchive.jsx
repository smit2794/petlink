import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { FileText, Eye, Download, X, Award, ShieldAlert } from "lucide-react";

// Verifiable Mini QR representation
const MiniQR = ({ value }) => (
  <svg width="45" height="45" viewBox="0 0 100 100" style={{ backgroundColor: "#F7F5F0", padding: "2px", borderRadius: "4px" }}>
    <rect x="5" y="5" width="25" height="25" fill="var(--primary-color)" />
    <rect x="10" y="10" width="15" height="15" fill="white" />
    <rect x="70" y="5" width="25" height="25" fill="var(--primary-color)" />
    <rect x="75" y="10" width="15" height="15" fill="white" />
    <rect x="5" y="70" width="25" height="25" fill="var(--primary-color)" />
    <rect x="10" y="75" width="15" height="15" fill="white" />
    <rect x="40" y="40" width="20" height="20" fill="var(--primary-color)" />
  </svg>
);

const CertificateArchive = () => {
  const { animals } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Mock certificate list
  const mockCertificates = [
    { id: "CERT-901", petId: "PET-101", petName: "Sheru", type: "vaccination", date: "2026-07-05", issuer: "Dr. Dev Karve" },
    { id: "CERT-902", petId: "PET-101", petName: "Sheru", type: "sterilization", date: "2026-07-06", issuer: "Dr. Dev Karve" },
    { id: "CERT-903", petId: "PET-102", petName: "Gauri", type: "vaccination", date: "2026-07-02", issuer: "Dr. Dev Karve" },
    { id: "CERT-904", petId: "PET-103", petName: "Mani", type: "sterilization", date: "2026-07-11", issuer: "Dr. Ananya Rao" },
    { id: "CERT-905", petId: "PET-104", petName: "Kalu", type: "vaccination", date: "2026-07-15", issuer: "Dr. Dev Karve" }
  ];

  const filteredCerts = mockCertificates.filter((cert) => {
    return (
      cert.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.petId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getTargetPet = (petId, fallbackName) => {
    return animals.find((a) => a.id === petId) || {
      id: petId,
      name: fallbackName,
      species: "Dog",
      breed: "Indie Dog",
      custodian: "Pune Central Shelter"
    };
  };

  const activePet = selectedCert ? getTargetPet(selectedCert.petId, selectedCert.petName) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Header Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
            Clinic Certificate Archive
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
            Audit and reprint legal animal health documentations, vaccination cards, and sterilizations certificates.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ padding: "16px 24px" }}>
        <input
          type="text"
          placeholder="Search archives by animal name, ID, or certificate code..."
          className="form-control"
          style={{ width: "100%", padding: "10px 18px", borderRadius: "30px", fontSize: "0.85rem" }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        // Skeleton loader
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="skeleton" style={{ height: "65px", borderRadius: "14px" }} />
          ))}
        </div>
      ) : (
        /* Certificate Table Ledger */
        <div className="table-container" style={{ border: "1px solid var(--border-color)", borderRadius: "20px" }}>
          <table className="table" style={{ fontSize: "0.85rem" }}>
            <thead>
              <tr>
                <th>Certificate ID</th>
                <th>Patient Details</th>
                <th>Document Type</th>
                <th>Date Generated</th>
                <th>Signing CVO</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCerts.map((cert) => (
                <tr key={cert.id}>
                  <td style={{ fontWeight: 800 }}>{cert.id}</td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 700 }}>{cert.petName}</span>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "monospace" }}>{cert.petId}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${cert.type === "vaccination" ? "shelter" : "adopted"}`} style={{ fontSize: "0.68rem" }}>
                      {cert.type === "vaccination" ? "Immunization Cert" : "Sterilization Card"}
                    </span>
                  </td>
                  <td>{cert.date}</td>
                  <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>{cert.issuer}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderColor: "var(--accent-coral)", color: "var(--accent-coral)" }}
                      onClick={() => setSelectedCert(cert)}
                    >
                      <Eye size={12} /> Reprint / View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================
          MODAL: BEAUTIFUL PRINTABLE CERTIFICATE PREVIEW
      ======================================================== */}
      {selectedCert && activePet && (
        <div className="modal-overlay" onClick={() => setSelectedCert(null)} style={{ zIndex: 9999 }}>
          <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "580px", padding: 0, overflow: "hidden", border: "1px solid var(--border-color)" }}>
            
            {/* Header control */}
            <div style={{
              padding: "16px 24px",
              backgroundColor: "#FCFAF6",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--primary-color)" }}>
                📜 Document Certificate Archive Reprint
              </span>
              <button 
                onClick={() => setSelectedCert(null)}
                style={{ background: "none", border: 0, cursor: "pointer", color: "var(--text-muted)", display: "flex" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Printable Area */}
            <div style={{
              padding: "40px",
              backgroundColor: "#FFFDF9", // parchment tone
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px"
            }}>
              {/* Border ring decoration */}
              <div style={{
                border: "4px double var(--border-color)",
                padding: "32px",
                width: "100%",
                borderRadius: "8px",
                position: "relative"
              }}>
                {/* Stamp watermark */}
                <div style={{
                  position: "absolute",
                  bottom: "20px",
                  right: "30px",
                  opacity: 0.15,
                  transform: "rotate(-12deg)",
                  pointerEvents: "none"
                }}>
                  <Award size={90} color="var(--accent-coral)" />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <Award size={36} color="var(--accent-amber)" style={{ margin: "0 auto 8px" }} />
                  <span style={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                    Government of Maharashtra Welfare Registry
                  </span>
                  <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--primary-color)", fontFamily: "serif" }}>
                    {selectedCert.type === "vaccination" ? "CERTIFICATE OF VACCINATION" : "CERTIFICATE OF STERILIZATION"}
                  </h2>
                </div>

                <hr style={{ border: 0, borderBottom: "1px solid var(--border-color)", margin: 16 }} />

                <div style={{ fontSize: "0.85rem", color: "var(--text-main)", lineHeight: 1.8, textAlign: "left" }}>
                  This documents and certifies that the animal details recorded herein:
                  <div style={{
                    margin: "12px 0",
                    padding: "10px 16px",
                    backgroundColor: "#FBF9F4",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)"
                  }}>
                    • <strong>Animal Name:</strong> {activePet.name || "Desi Stray"} <br />
                    • <strong>Registration Tag ID:</strong> {activePet.id} <br />
                    • <strong>Biological Type:</strong> {activePet.species} ({activePet.breed}) <br />
                    • <strong>Custodian Unit:</strong> {activePet.custodian}
                  </div>
                  was clinically audited on <strong>{selectedCert.date}</strong> at <strong>PetLink Animal Care Clinic</strong> by licensed practitioners and stands fully compliant with immunization frameworks.
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "32px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <MiniQR value={activePet.id} />
                    <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", marginTop: "4px" }}>Verifiable QR Collar Tag</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "serif", fontSize: "0.9rem", fontStyle: "italic", borderBottom: "1px solid var(--text-muted)", paddingBottom: "2px" }}>
                      {selectedCert.issuer} (CVO)
                    </div>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 700 }}>Authorized Signatory</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Control */}
            <div style={{
              padding: "16px 24px",
              backgroundColor: "#FCFAF6",
              borderTop: "1px solid var(--border-color)",
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end"
            }}>
              <button className="btn btn-outline btn-sm" onClick={() => setSelectedCert(null)}>
                Close Preview
              </button>
              <button className="btn btn-primary btn-sm" style={{ backgroundColor: "var(--accent-coral)", borderColor: "var(--accent-coral)", display: "flex", alignItems: "center", gap: "6px" }} onClick={() => alert("Simulated certificate download completed.")}>
                <Download size={14} /> Download PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CertificateArchive;
