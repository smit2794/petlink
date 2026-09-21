import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { 
  HeartHandshake, CreditCard, Calendar, User, FileText, 
  PlusCircle, Printer, X, Download, ShieldCheck 
} from "lucide-react";

// Purpose → color mapping
const purposeColor = {
  "Critical Medical Care Fund":    { bg: "#FDF2F2", color: "var(--accent-coral)" },
  "Shelter Expansion Project":     { bg: "#F0F6F3", color: "var(--secondary-color)" },
  "Daily Stray Feeding":           { bg: "#FFF8EE", color: "var(--accent-amber)" },
  "Ambulance Fuel & Maintenance":  { bg: "#F0F4F8", color: "#2980B9" },
  "Anti-Rabies Vaccination Drive": { bg: "#FAF5FA", color: "#8E24AA" },
};

const DonationsMgmt = () => {
  const { donations, addDonation, addDonationPersisted } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);

  // Form state
  const [formValues, setFormValues] = useState({
    donorName: "", email: "", amount: "", purpose: "Critical Medical Care Fund"
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const tempErrors = {};
    if (!formValues.donorName) tempErrors.donorName = "Donor name is required";
    if (!formValues.email) tempErrors.email = "Donor email is required";
    if (!formValues.amount || isNaN(formValues.amount) || parseFloat(formValues.amount) <= 0) {
      tempErrors.amount = "Enter a valid donation amount";
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    try {
      await addDonationPersisted({
        donorName: formValues.donorName,
        email: formValues.email,
        amount: parseFloat(formValues.amount),
        purpose: formValues.purpose
      });
    } catch (err) {
      return;
    }

    setShowLogModal(false);
    setFormValues({ donorName: "", email: "", amount: "", purpose: "Critical Medical Care Fund" });
    setErrors({});
  };

  // Sum total donations
  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Page Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-main)" }}>
            Donation Records & Fiscal Logs
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Track CSR sponsorships, individual contributions, and print formal tax exemption receipts.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowLogModal(true)}>
          <PlusCircle size={18} /> + Log Donation
        </button>
      </div>

      {isLoading ? (
        /* SKELETON */
        <>
          <div className="skeleton" style={{ height: "120px", borderRadius: "var(--radius-lg)" }} />
          <div className="skeleton" style={{ height: "300px", borderRadius: "var(--radius-lg)" }} />
        </>
      ) : (
        /* ACTUAL CONTENT */
        <>
          {/* Fiscal Summary Card */}
          <div className="card" style={{
            background: "linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)",
            color: "white",
            padding: "28px",
            borderRadius: "var(--radius-xl)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px"
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, opacity: 0.8, textTransform: "uppercase" }}>
                Total Funds Raised (FY 2026)
              </span>
              <h2 style={{ fontSize: "2.5rem", fontWeight: 800 }}>
                ₹{totalDonated.toLocaleString("en-IN")}
              </h2>
              <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                100% applied directly to veterinary medicine, shelter structures, and rescue fuel.
              </p>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              padding: "10px 18px",
              borderRadius: "var(--radius-md)",
              fontSize: "0.9rem",
              fontWeight: 600
            }}>
              <ShieldCheck size={20} /> Section 80G Tax Exempt Eligible
            </div>
          </div>

          {/* Donor Profiles Mini Directory */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Key Patron Contributors</h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px"
            }} className="donors-grid">
              {donations.slice(0, 3).map((don) => (
                <div key={don.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: "var(--secondary-light)",
                      color: "var(--primary-color)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.8rem"
                    }}>
                      {don.donorName.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <h4 style={{ fontSize: "0.9rem", fontWeight: 700 }}>{don.donorName}</h4>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Patron</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginTop: "4px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Total Contribution:</span>
                    <strong style={{ color: "var(--secondary-color)" }}>₹{don.amount.toLocaleString("en-IN")}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Donations Ledger Table */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Recent Transaction Ledger</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Donor Name</th>
                    <th>Donor Email</th>
                    <th>Date Logged</th>
                    <th>Fund Purpose Allocation</th>
                    <th>Amount (₹)</th>
                    <th style={{ textAlign: "center" }}>Certificate Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((don) => (
                    <tr key={don.id}>
                      <td style={{ fontWeight: 700 }}>{don.id}</td>
                      <td style={{ fontWeight: 600 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <HeartHandshake size={14} style={{ color: "var(--accent-coral)", flexShrink: 0 }} />
                          {don.donorName}
                        </span>
                      </td>
                      <td>{don.email}</td>
                      <td>{don.date}</td>
                      <td>
                        {(() => {
                          const c = purposeColor[don.purpose] || { bg: "#F0F6F3", color: "var(--secondary-color)" };
                          return (
                            <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700, backgroundColor: c.bg, color: c.color }}>
                              {don.purpose}
                            </span>
                          );
                        })()}
                      </td>
                      <td style={{ fontWeight: 800, color: "var(--secondary-color)" }}>
                        ₹{don.amount.toLocaleString("en-IN")}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button 
                          className="btn btn-outline btn-sm"
                          style={{ display: "inline-flex", gap: "4px" }}
                          onClick={() => setSelectedReceipt(don)}
                        >
                          <FileText size={14} /> Generate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          MODAL: VIEW / PRINT OFFICIAL RECEIPT
      ======================================================== */}
      {selectedReceipt && (
        <div className="modal-overlay" onClick={() => setSelectedReceipt(null)}>
          <div className="modal-content animate-scale-up" style={{ maxWidth: "600px", padding: 0 }} onClick={(e) => e.stopPropagation()}>
            
            {/* Printable Frame wrapper */}
            <div style={{ padding: "40px", position: "relative" }} id="printable-receipt">
              <button 
                className="modal-close" 
                style={{ position: "absolute", top: "16px", right: "16px" }} 
                onClick={() => setSelectedReceipt(null)}
              >
                <X size={20} />
              </button>

              {/* Receipt Header */}
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "var(--primary-color)", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <HeartHandshake size={14} />
                  </div>
                  <strong style={{ fontSize: "1.2rem", color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
                    PetLink Foundation India
                  </strong>
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Registered Charity UIN: SEC8-MH-2024-490331<br />
                  Office: 301 Lane 6, Kothrud, Pune, MH, 411038
                </p>
              </div>

              <hr style={{ border: 0, borderBottom: "2px dashed var(--border-color)", margin: "16px 0" }} />

              {/* Certificate Title */}
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, letterSpacing: "0.05em", color: "var(--text-main)", textTransform: "uppercase" }}>
                  Donation Receipt & Certificate
                </h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Issued under Section 80G of the Income Tax Act, 1961
                </span>
              </div>

              {/* Receipt Fields Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px 24px",
                fontSize: "0.85rem",
                marginBottom: "28px"
              }}>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Receipt Reference Number</span>
                  <strong>REC-{selectedReceipt.id}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Date of Transaction</span>
                  <strong>{selectedReceipt.date}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Donor Name</span>
                  <strong>{selectedReceipt.donorName}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Donor Email</span>
                  <strong>{selectedReceipt.email}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Purpose Allocation</span>
                  <strong>{selectedReceipt.purpose}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Donation Amount</span>
                  <strong style={{ color: "var(--secondary-color)", fontSize: "1.05rem" }}>
                    ₹{selectedReceipt.amount.toLocaleString("en-IN")}.00
                  </strong>
                </div>
              </div>

              {/* Official Seal / Exemption notes */}
              <div style={{
                backgroundColor: "var(--bg-color)",
                border: "1px solid var(--border-color)",
                padding: "16px",
                borderRadius: "var(--radius-md)",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                lineHeight: 1.5,
                marginBottom: "28px"
              }}>
                <p>
                  <strong>Tax Exemption Note: </strong>
                  This contribution is eligible for 50% income tax deduction under Section 80G of the 
                  Income Tax Act, India. All funds are subject to annual auditing by the Office of the Joint Charity Commissioner, Pune.
                </p>
              </div>

              {/* Seal signatures placeholders */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: "0.8rem" }}>
                <div>
                  <span style={{ display: "block", fontStyle: "italic", color: "var(--text-muted)", marginBottom: "4px" }}>Pooja Mehta</span>
                  <div style={{ borderTop: "1px solid var(--text-muted)", width: "120px", paddingTop: "4px", fontWeight: 700, color: "var(--text-main)" }}>
                    Authorized Signatory
                  </div>
                </div>
                <div style={{
                  border: "2px solid #2E7D32",
                  color: "#2E7D32",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontWeight: 800,
                  fontSize: "0.65rem",
                  letterSpacing: "0.05em"
                }}>
                  SEAL VALIDATED
                </div>
              </div>

            </div>

            {/* Receipt Modal Footer Operations */}
            <div style={{
              backgroundColor: "var(--bg-color)",
              padding: "16px 40px",
              borderTop: "1px solid var(--border-color)",
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              borderRadius: "0 0 var(--radius-xl) var(--radius-xl)"
            }}>
              <button className="btn btn-outline btn-sm" onClick={() => setSelectedReceipt(null)}>
                Close
              </button>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={14} /> Print Receipt
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: LOG MANUAL DONATION
      ======================================================== */}
      {showLogModal && (
        <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="modal-content animate-scale-up" style={{ padding: 0 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontWeight: 800, color: "var(--primary-color)", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.3rem" }}>💰</span> Log Manual Donation
              </h2>
              <button className="modal-close" onClick={() => setShowLogModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
            <form id="donation-form" onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Donor Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sudha Murty"
                  className="form-control"
                  style={{ borderColor: errors.donorName ? "var(--accent-coral)" : "" }}
                  value={formValues.donorName}
                  onChange={(e) => setFormValues({ ...formValues, donorName: e.target.value })}
                />
                {errors.donorName && <span className="form-error">{errors.donorName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Donor Email (For Receipts)</label>
                <input
                  type="email"
                  placeholder="e.g. donor@foundation.org"
                  className="form-control"
                  style={{ borderColor: errors.email ? "var(--accent-coral)" : "" }}
                  value={formValues.email}
                  onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    className="form-control"
                    style={{ borderColor: errors.amount ? "var(--accent-coral)" : "" }}
                    value={formValues.amount}
                    onChange={(e) => setFormValues({ ...formValues, amount: e.target.value })}
                  />
                  {errors.amount && <span className="form-error">{errors.amount}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Allocation Purpose</label>
                  <select
                    className="form-control"
                    value={formValues.purpose}
                    onChange={(e) => setFormValues({ ...formValues, purpose: e.target.value })}
                  >
                    <option>Critical Medical Care Fund</option>
                    <option>Shelter Expansion Project</option>
                    <option>Daily Stray Feeding</option>
                    <option>Ambulance Fuel & Maintenance</option>
                    <option>Anti-Rabies Vaccination Drive</option>
                  </select>
                </div>
              </div>
            </form>
            </div>{/* end modal-body */}
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowLogModal(false)}>
                Cancel
              </button>
              <button form="donation-form" type="submit" className="btn btn-primary">
                Commit Donation Entry
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DonationsMgmt;
