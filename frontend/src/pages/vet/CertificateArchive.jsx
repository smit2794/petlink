import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { Search, Eye, Download, X, Award } from "lucide-react";
import "../../styles/vet.css";

// Verifiable Mini QR representation
const MiniQR = ({ value }) => (
  <svg width="45" height="45" viewBox="0 0 100 100" style={{ backgroundColor: "#F7F5F0", padding: "2px", borderRadius: "4px" }}>
    <rect x="5" y="5" width="25" height="25" fill="#1C130D" />
    <rect x="10" y="10" width="15" height="15" fill="white" />
    <rect x="70" y="5" width="25" height="25" fill="#1C130D" />
    <rect x="75" y="10" width="15" height="15" fill="white" />
    <rect x="5" y="70" width="25" height="25" fill="#1C130D" />
    <rect x="10" y="75" width="15" height="15" fill="white" />
    <rect x="40" y="40" width="20" height="20" fill="#1C130D" />
  </svg>
);

const CertificateArchive = () => {
  const { animals, addToast } = useApp();
  const [selectedCert, setSelectedCert] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef(null);

  // Keyboard shortcut (⌘K or Ctrl+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Mock certificate list matching reference image 1:1
  const mockCertificates = [
    { id: "CERT-901", petId: "PET-101", petName: "Sheru", type: "vaccination", date: "2026-07-05", issuer: "Dr. Dev Karve" },
    { id: "CERT-902", petId: "PET-101", petName: "Sheru", type: "sterilization", date: "2026-07-06", issuer: "Dr. Dev Karve" },
    { id: "CERT-903", petId: "PET-102", petName: "Gauri", type: "vaccination", date: "2026-07-02", issuer: "Dr. Dev Karve" },
    { id: "CERT-904", petId: "PET-103", petName: "Mani", type: "sterilization", date: "2026-07-11", issuer: "Dr. Ananya Rao" },
    { id: "CERT-905", petId: "PET-104", petName: "Kalu", type: "vaccination", date: "2026-07-15", issuer: "Dr. Dev Karve" }
  ];

  const filteredCerts = mockCertificates.filter((cert) => {
    const q = searchTerm.toLowerCase();
    return (
      cert.petName.toLowerCase().includes(q) ||
      cert.petId.toLowerCase().includes(q) ||
      cert.id.toLowerCase().includes(q) ||
      cert.issuer.toLowerCase().includes(q) ||
      (cert.type === "vaccination" ? "immunization cert" : "sterilization card").includes(q)
    );
  });

  const getTargetPet = (petId, fallbackName) => {
    return animals?.find((a) => a.id === petId) || {
      id: petId,
      name: fallbackName,
      species: "Dog",
      breed: "Indie Dog",
      custodian: "Pune Central Shelter"
    };
  };

  const activePet = selectedCert ? getTargetPet(selectedCert.petId, selectedCert.petName) : null;

  // Handle Export CSV action
  const handleExportCSV = () => {
    const headers = ["Certificate ID", "Patient Name", "Patient ID", "Document Type", "Date Generated", "Signing CVO"];
    const rows = filteredCerts.map(c => [
      c.id,
      c.petName,
      c.petId,
      c.type === "vaccination" ? "Immunization Cert" : "Sterilization Card",
      c.date,
      c.issuer
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PetLink_Certificate_Archive_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (addToast) {
      addToast("Certificate archive exported to CSV!", "success");
    }
  };

  return (
    <div className="vet-cert-container animate-fade-in">
      
      {/* Header Info & CVO Verified Signatures Card */}
      <div className="vet-cert-header">
        <div className="vet-cert-title-group">
          <h1 className="vet-cert-title">
            Clinic Certificate Archive 📜🐾
          </h1>
          <p className="vet-cert-subtitle">
            Audit and reprint legal animal health documentations, vaccination cards, and sterilizations certificates.
          </p>
        </div>

        {/* Top-Right CVO Card */}
        <div className="vet-cert-cvo-card">
          <div className="vet-cert-cvo-icon">
            <span>★</span>
          </div>
          <div>
            <h4 className="vet-cert-cvo-title">CVO Verified Signatures</h4>
            <p className="vet-cert-cvo-desc">Valid for interstate transport & rabies proof</p>
          </div>
        </div>
      </div>

      {/* Pill Search Bar */}
      <div className="vet-cert-search-bar">
        <Search size={18} color="#9CA3AF" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search archives by animal name, ID, or certificate code..."
          className="vet-cert-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <kbd className="vet-cert-kbd">⌘K</kbd>
      </div>

      {/* Certificate Table Ledger Card */}
      <div className="vet-cert-table-card">
        <div style={{ overflowX: "auto" }}>
          <table className="vet-cert-table">
            <thead>
              <tr>
                <th className="vet-cert-th" style={{ width: "16%" }}>Certificate ID</th>
                <th className="vet-cert-th" style={{ width: "18%" }}>Patient Details</th>
                <th className="vet-cert-th" style={{ width: "20%" }}>Document Type</th>
                <th className="vet-cert-th" style={{ width: "16%" }}>Date Generated</th>
                <th className="vet-cert-th" style={{ width: "16%" }}>Signing CVO</th>
                <th className="vet-cert-th" style={{ width: "14%", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCerts.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px 24px", textAlign: "center", color: "#6B7280" }}>
                    No certificate records match "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredCerts.map((cert) => (
                  <tr key={cert.id} className="vet-cert-row">
                    <td className="vet-cert-td">
                      <span className="vet-cert-id">{cert.id}</span>
                    </td>
                    <td className="vet-cert-td">
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span className="vet-cert-patient-name">{cert.petName}</span>
                        <span className="vet-cert-patient-id">{cert.petId}</span>
                      </div>
                    </td>
                    <td className="vet-cert-td">
                      {cert.type === "vaccination" ? (
                        <span className="vet-cert-badge-immunization">
                          IMMUNIZATION CERT
                        </span>
                      ) : (
                        <span className="vet-cert-badge-sterilization">
                          STERILIZATION CARD
                        </span>
                      )}
                    </td>
                    <td className="vet-cert-td" style={{ color: "#374151", fontWeight: 500, fontSize: "0.88rem" }}>
                      {cert.date}
                    </td>
                    <td className="vet-cert-td" style={{ color: "#1F2937", fontWeight: 600, fontSize: "0.88rem" }}>
                      {cert.issuer}
                    </td>
                    <td className="vet-cert-td" style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        className="vet-cert-btn-reprint"
                        onClick={() => setSelectedCert(cert)}
                      >
                        <Eye size={14} color="#5028FF" />
                        <span>Reprint / View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Ledger Footer */}
        <div className="vet-cert-table-footer">
          <div style={{ display: "flex", alignItems: "center" }}>
            <span className="vet-cert-status-dot" />
            <span>Showing {filteredCerts.length} verified records of {mockCertificates.length}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#9CA3AF" }}>Official digital pet certification ledger  • </span>
            <button
              type="button"
              className="vet-cert-export-btn"
              onClick={handleExportCSV}
            >
              Export All (CSV)
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL: BEAUTIFUL PRINTABLE CERTIFICATE PREVIEW
      ======================================================== */}
      {selectedCert && activePet && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedCert(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px"
          }}
        >
          <div
            className="modal-content animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "600px",
              width: "100%",
              backgroundColor: "#FFFFFF",
              padding: 0,
              overflow: "hidden",
              border: "1.5px solid #EDE6DD",
              borderRadius: "20px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.3)"
            }}
          >
            {/* Header control */}
            <div style={{
              padding: "16px 24px",
              backgroundColor: "#FCFAF6",
              borderBottom: "1px solid #EDE6DD",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#111827" }}>
                📜 Document Certificate Archive Reprint
              </span>
              <button 
                type="button"
                onClick={() => setSelectedCert(null)}
                style={{ background: "none", border: 0, cursor: "pointer", color: "#6B7280", display: "flex" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Printable Area */}
            <div style={{
              padding: "36px",
              backgroundColor: "#FFFDF9",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px"
            }}>
              {/* Border ring decoration */}
              <div style={{
                border: "3px double #D1D5DB",
                padding: "28px",
                width: "100%",
                borderRadius: "12px",
                position: "relative",
                background: "#FFFFFF"
              }}>
                {/* Stamp watermark */}
                <div style={{
                  position: "absolute",
                  bottom: "20px",
                  right: "30px",
                  opacity: 0.12,
                  transform: "rotate(-12deg)",
                  pointerEvents: "none"
                }}>
                  <Award size={100} color="#5028FF" />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "#EEF2FF",
                    border: "1.5px solid #C7D2FE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 6px"
                  }}>
                    <Award size={26} color="#5028FF" />
                  </div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6B7280" }}>
                    Government of Maharashtra Welfare Registry
                  </span>
                  <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#111827", margin: "4px 0" }}>
                    {selectedCert.type === "vaccination" ? "CERTIFICATE OF VACCINATION" : "CERTIFICATE OF STERILIZATION"}
                  </h2>
                  <span style={{ fontSize: "0.8rem", color: "#5028FF", fontWeight: 700 }}>
                    Certificate ID: {selectedCert.id}
                  </span>
                </div>

                <hr style={{ border: 0, borderBottom: "1px solid #EDE6DD", margin: "16px 0" }} />

                <div style={{ fontSize: "0.85rem", color: "#374151", lineHeight: 1.8, textAlign: "left" }}>
                  This documents and certifies that the animal details recorded herein:
                  <div style={{
                    margin: "12px 0",
                    padding: "12px 18px",
                    backgroundColor: "#FBF9F4",
                    borderRadius: "10px",
                    border: "1px solid #EDE6DD"
                  }}>
                    • <strong>Animal Name:</strong> {activePet.name || "Desi Stray"} <br />
                    • <strong>Registration Tag ID:</strong> {activePet.id} <br />
                    • <strong>Biological Type:</strong> {activePet.species || "Canine"} ({activePet.breed || "Indie"}) <br />
                    • <strong>Custodian Unit:</strong> {activePet.custodian || "Pune Central Animal Shelter"}
                  </div>
                  was clinically audited on <strong>{selectedCert.date}</strong> at <strong>PetLink Animal Care Clinic</strong> by licensed practitioners and stands fully compliant with state immunization frameworks.
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "28px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <MiniQR value={activePet.id} />
                    <span style={{ fontSize: "0.62rem", color: "#9CA3AF", marginTop: "4px" }}>Verifiable QR Collar Tag</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "serif", fontSize: "0.95rem", fontStyle: "italic", borderBottom: "1px solid #9CA3AF", paddingBottom: "2px", color: "#111827" }}>
                      {selectedCert.issuer} (CVO)
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "#6B7280", fontWeight: 700 }}>Authorized Signatory</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Control */}
            <div style={{
              padding: "16px 24px",
              backgroundColor: "#FCFAF6",
              borderTop: "1px solid #EDE6DD",
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end"
            }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ padding: "8px 18px", borderRadius: "10px", fontWeight: 700 }}
                onClick={() => setSelectedCert(null)}
              >
                Close Preview
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{
                  backgroundColor: "#5028FF",
                  borderColor: "#5028FF",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 20px",
                  borderRadius: "10px",
                  fontWeight: 700
                }}
                onClick={() => {
                  window.print();
                }}
              >
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
