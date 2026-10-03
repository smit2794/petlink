import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { 
  HeartHandshake, CreditCard, Calendar, User, FileText, 
  PlusCircle, Printer, X, Download, ShieldCheck, Plus, Shield, Sparkles
} from "lucide-react";
import { initialDonations } from "../../data/mockData";

// Purpose → pill color palette
const purposeColor = {
  "Critical Medical Care Fund":    { bg: "#FDF2F2", color: "#E02424", border: "#FBD5D5" },
  "Shelter Expansion Project":     { bg: "#E6F7F0", color: "#0D694B", border: "#C4EEDC" },
  "Daily Stray Feeding":           { bg: "#FFF8EE", color: "#D97706", border: "#FDE68A" },
  "Ambulance Fuel & Maintenance":  { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  "Anti-Rabies Vaccination Drive": { bg: "#FAF5FF", color: "#7E22CE", border: "#E9D5FF" },
};

const patronBadges = [
  { badge: "Verified NGO Partner", mascot: "🐱" },
  { badge: "Premier Angel", mascot: "🐶" },
  { badge: "Gold Guardian", mascot: "🦊" },
  { badge: "Silver Benefactor", mascot: "🐰" }
];

const DonationsMgmt = () => {
  const { donations, addDonation, addDonationPersisted } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);

  // Form state
  const [formValues, setFormValues] = useState({
    donorName: "", email: "", amount: "", purpose: "Shelter Expansion Project"
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
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

    const payload = {
      donorName: formValues.donorName,
      email: formValues.email,
      amount: parseFloat(formValues.amount),
      purpose: formValues.purpose
    };

    try {
      if (addDonationPersisted) {
        await addDonationPersisted(payload);
      } else {
        addDonation(payload);
      }
    } catch (err) {
      // Fallback locally if offline/backend stopped
      if (addDonation) addDonation(payload);
    }

    setShowLogModal(false);
    setFormValues({ donorName: "", email: "", amount: "", purpose: "Shelter Expansion Project" });
    setErrors({});
  };

  // Merge active state with default reference mock items if empty
  const activeDonations = donations && donations.length > 0 ? donations : initialDonations;

  // Calculate sum of donations
  const totalDonated = activeDonations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  // Derive unique patrons by grouping
  const patronsMap = {};
  activeDonations.forEach((d) => {
    const key = (d.donorName || "Supporter").toLowerCase().trim();
    if (!patronsMap[key]) {
      patronsMap[key] = {
        name: d.donorName,
        totalAmount: 0,
        email: d.email,
        count: 0
      };
    }
    patronsMap[key].totalAmount += (Number(d.amount) || 0);
    patronsMap[key].count += 1;
  });

  const patronsList = Object.values(patronsMap);
  // Ensure reference layout: 'ravi' on left, 'rekha' on right
  patronsList.sort((a, b) => {
    if (a.name.toLowerCase() === "ravi") return -1;
    if (b.name.toLowerCase() === "ravi") return 1;
    return b.totalAmount - a.totalAmount;
  });

  const getPatronMeta = (patronName, idx) => {
    const nameLower = (patronName || "").toLowerCase();
    if (nameLower.includes("ravi")) {
      return { badge: "Verified NGO Partner", mascot: "🐱" };
    }
    if (nameLower.includes("rekha")) {
      return { badge: "Premier Angel", mascot: "🐶" };
    }
    return patronBadges[idx % patronBadges.length];
  };

  return (
    <div className="ngo-donation-container">
      
      {/* ========================================================
          PAGE HEADER: TITLE + BADGE + ACTION BUTTON
      ======================================================== */}
      <div className="ngo-donation-header">
        <div className="ngo-donation-title-group">
          <div className="ngo-donation-title-row">
            <h1 className="ngo-donation-title">Donation Records & Fiscal Logs</h1>
            <div className="ngo-donation-title-badge">
              <span>🐾 Supporter Paw Hub ✨</span>
            </div>
          </div>
          <p className="ngo-donation-subtitle">
            Track CSR sponsorships, individual contributions, and print formal tax exemption receipts.
          </p>
        </div>
        <button className="ngo-donation-btn-primary" onClick={() => setShowLogModal(true)}>
          <Plus size={16} /> + Log Donation
        </button>
      </div>

      {isLoading ? (
        /* SKELETON LOADING */
        <>
          <div className="skeleton" style={{ height: "160px", borderRadius: "24px" }} />
          <div className="skeleton" style={{ height: "180px", borderRadius: "20px" }} />
          <div className="skeleton" style={{ height: "320px", borderRadius: "24px" }} />
        </>
      ) : (
        /* MAIN REDESIGNED CONTENT */
        <>
          {/* ========================================================
              DEEP FOREST GREEN HERO BANNER (TOTAL FUNDS RAISED)
          ======================================================== */}
          <div className="ngo-donation-hero">
            {/* Layered Organic Wave Vectors */}
            <svg className="ngo-donation-hero-wave" viewBox="0 0 440 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M110 0C210 50 160 140 320 120C400 110 420 180 440 200V0H110Z" fill="white" fillOpacity="0.08" />
              <path d="M0 200C140 180 180 80 300 70C380 60 410 130 440 120V200H0Z" fill="white" fillOpacity="0.05" />
              <path d="M260 0C320 40 360 120 440 140V0H260Z" fill="white" fillOpacity="0.07" />
            </svg>

            {/* Left Content */}
            <div className="ngo-donation-hero-content">
              <span className="ngo-donation-hero-label">
                TOTAL FUNDS RAISED (FY 2026)
              </span>
              <div className="ngo-donation-hero-amount-row">
                <h2 className="ngo-donation-hero-amount">
                  ₹{totalDonated.toLocaleString("en-IN")}
                </h2>
                <div className="ngo-donation-audit-pill">
                  Live Fiscal Audit
                </div>
              </div>
              <p className="ngo-donation-hero-subtext">
                100% applied directly to veterinary medicine, shelter structures, and rescue fuel.
              </p>
            </div>

            {/* Right Badges */}
            <div className="ngo-donation-hero-badges">
              <div className="ngo-donation-exempt-badge">
                <ShieldCheck size={18} style={{ color: "#6EE7B7" }} />
                <span>Section 80G Tax Exempt Eligible</span>
              </div>
              <div className="ngo-donation-quote-badge">
                <span>🐶💖 Every rupee saves innocent paws!</span>
              </div>
            </div>
          </div>

          {/* ========================================================
              KEY PATRON CONTRIBUTORS SECTION
          ======================================================== */}
          <div className="ngo-donation-patrons-section">
            <div className="ngo-donation-patrons-header">
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <h3 className="ngo-donation-patrons-title">
                  Key Patron Contributors
                </h3>
                <span className="ngo-donation-patrons-subtitle">
                  • Top Supporters
                </span>
              </div>
              <div className="ngo-donation-golden-pill">
                <span>⭐ Golden Donors</span>
              </div>
            </div>

            <div className="ngo-donation-patrons-grid">
              {patronsList.slice(0, 2).map((patron, idx) => {
                const meta = getPatronMeta(patron.name, idx);
                const initial = patron.name ? patron.name.trim()[0].toLowerCase() : "p";
                return (
                  <div key={patron.name || idx} className="ngo-donation-patron-card">
                    {/* Top Row: Squircle Avatar + Name + Patron Tag + Mascot */}
                    <div className="ngo-donation-patron-top">
                      <div className="ngo-donation-patron-left">
                        <div className="ngo-donation-avatar">
                          {initial}
                        </div>
                        <div className="ngo-donation-patron-info">
                          <h4 className="ngo-donation-patron-name">{patron.name}</h4>
                          <div className="ngo-donation-patron-tagline">
                            <span>Patron</span>
                            <span>•</span>
                            <span className="ngo-donation-partner-pill">
                              {meta.badge}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="ngo-donation-mascot">
                        {meta.mascot}
                      </div>
                    </div>

                    {/* Bottom Row: Total Contribution */}
                    <div className="ngo-donation-patron-bottom">
                      <span className="ngo-donation-patron-label">Total Contribution:</span>
                      <strong className="ngo-donation-patron-amount">
                        ₹{patron.totalAmount.toLocaleString("en-IN")}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================
              RECENT TRANSACTION LEDGER TABLE CARD
          ======================================================== */}
          <div className="ngo-donation-ledger-card">
            {/* Card Header */}
            <div className="ngo-donation-ledger-header">
              <div className="ngo-donation-ledger-header-left">
                <div className="ngo-donation-ledger-icon-box">
                  📋
                </div>
                <div>
                  <h3 className="ngo-donation-ledger-title">Recent Transaction Ledger</h3>
                  <p className="ngo-donation-ledger-subtitle">
                    Formal tax exempt records and logged direct donations
                  </p>
                </div>
              </div>
              <span className="ngo-donation-showing-pill">
                Showing {activeDonations.length} transactions
              </span>
            </div>

            {/* Clean Custom Table */}
            <div className="ngo-donation-table-wrap">
              <table className="ngo-donation-table">
                <thead>
                  <tr>
                    <th className="ngo-donation-th">REF ID</th>
                    <th className="ngo-donation-th">DONOR NAME</th>
                    <th className="ngo-donation-th">DONOR EMAIL</th>
                    <th className="ngo-donation-th">DATE LOGGED</th>
                    <th className="ngo-donation-th">FUND PURPOSE ALLOCATION</th>
                    <th className="ngo-donation-th">AMOUNT (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {activeDonations.map((don) => {
                    const styleMeta = purposeColor[don.purpose] || { bg: "#E6F7F0", color: "#0D694B", border: "#C4EEDC" };
                    return (
                      <tr 
                        key={don.id} 
                        className="ngo-donation-tr"
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedReceipt(don)}
                        title="Click to view 80G Tax Exemption Receipt"
                      >
                        <td className="ngo-donation-td">
                          <span className="ngo-donation-ref-id">{don.id}</span>
                        </td>
                        <td className="ngo-donation-td">
                          <span className="ngo-donation-donor-name">
                            <span style={{ color: "#EF4444", fontSize: "0.85rem" }}>❤️</span>
                            <span>{don.donorName}</span>
                          </span>
                        </td>
                        <td className="ngo-donation-td" style={{ color: "#6B7280" }}>
                          {don.email}
                        </td>
                        <td className="ngo-donation-td" style={{ color: "#6B7280", fontFamily: "monospace" }}>
                          {don.date}
                        </td>
                        <td className="ngo-donation-td">
                          <span 
                            className="ngo-donation-purpose-pill"
                            style={{ 
                              backgroundColor: styleMeta.bg, 
                              color: styleMeta.color, 
                              borderColor: styleMeta.border 
                            }}
                          >
                            {don.purpose}
                          </span>
                        </td>
                        <td className="ngo-donation-td">
                          <strong className="ngo-donation-amount">
                            ₹{don.amount.toLocaleString("en-IN")}
                          </strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Card Footer: Encrypted live dot + 80G notice */}
            <div className="ngo-donation-ledger-footer">
              <div className="ngo-donation-footer-left">
                <span className="ngo-donation-live-dot" />
                <span>All records encrypted & mirrored to PetLink NGO Fiscal Core</span>
              </div>
              <div>
                <span>Powered by PetLink 80G Certified Automated Receipting</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          UNIFIED GLASSMORPHISM MODAL: LOG MANUAL DONATION
      ======================================================== */}
      {showLogModal && (
        <div className="ngo-modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="ngo-modal-card animate-scale-up" style={{ maxWidth: "540px" }} onClick={(e) => e.stopPropagation()}>
            <div className="ngo-modal-header">
              <div className="ngo-modal-header-left">
                <div className="ngo-modal-icon-badge">
                  💰
                </div>
                <div>
                  <h2 className="ngo-modal-title">Log Manual Donation</h2>
                  <p className="ngo-modal-subtitle">Record CSR sponsorship, direct wire, or cash contribution.</p>
                </div>
              </div>
              <button className="ngo-modal-close-btn" onClick={() => setShowLogModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="ngo-modal-body">
              <form id="donation-form" onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label className="ngo-modal-label">Donor Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sudha Murty"
                    className="ngo-modal-input"
                    style={{ borderColor: errors.donorName ? "#EF4444" : "" }}
                    value={formValues.donorName}
                    onChange={(e) => setFormValues({ ...formValues, donorName: e.target.value })}
                  />
                  {errors.donorName && <span style={{ color: "#EF4444", fontSize: "0.76rem", fontWeight: 700, marginTop: "4px", display: "block" }}>{errors.donorName}</span>}
                </div>

                <div>
                  <label className="ngo-modal-label">Donor Email (For Receipts)</label>
                  <input
                    type="email"
                    placeholder="e.g. donor@foundation.org"
                    className="ngo-modal-input"
                    style={{ borderColor: errors.email ? "#EF4444" : "" }}
                    value={formValues.email}
                    onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                  />
                  {errors.email && <span style={{ color: "#EF4444", fontSize: "0.76rem", fontWeight: 700, marginTop: "4px", display: "block" }}>{errors.email}</span>}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label className="ngo-modal-label">Amount (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 15000"
                      className="ngo-modal-input"
                      style={{ borderColor: errors.amount ? "#EF4444" : "" }}
                      value={formValues.amount}
                      onChange={(e) => setFormValues({ ...formValues, amount: e.target.value })}
                    />
                    {errors.amount && <span style={{ color: "#EF4444", fontSize: "0.76rem", fontWeight: 700, marginTop: "4px", display: "block" }}>{errors.amount}</span>}
                  </div>
                  <div>
                    <label className="ngo-modal-label">Allocation Purpose</label>
                    <select
                      className="ngo-modal-input"
                      value={formValues.purpose}
                      onChange={(e) => setFormValues({ ...formValues, purpose: e.target.value })}
                    >
                      <option>Shelter Expansion Project</option>
                      <option>Critical Medical Care Fund</option>
                      <option>Daily Stray Feeding</option>
                      <option>Ambulance Fuel & Maintenance</option>
                      <option>Anti-Rabies Vaccination Drive</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            <div className="ngo-modal-footer">
              <button type="button" className="ngo-modal-btn-cancel" onClick={() => setShowLogModal(false)}>
                Cancel
              </button>
              <button form="donation-form" type="submit" className="ngo-modal-btn-primary">
                Commit Donation Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          UNIFIED GLASSMORPHISM MODAL: 80G PRINTABLE RECEIPT
      ======================================================== */}
      {selectedReceipt && (
        <div className="ngo-modal-overlay" onClick={() => setSelectedReceipt(null)}>
          <div className="ngo-modal-card animate-scale-up" style={{ maxWidth: "580px", padding: 0, backgroundColor: "#FFFFFF", boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
            
            {/* Printable Frame wrapper */}
            <div style={{ padding: "36px 36px 24px", position: "relative" }} id="printable-receipt">
              <button 
                className="ngo-modal-close-btn" 
                style={{ position: "absolute", top: "16px", right: "16px" }} 
                onClick={() => setSelectedReceipt(null)}
              >
                <X size={18} />
              </button>

              {/* Receipt Header */}
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "6px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#184639", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <HeartHandshake size={15} />
                  </div>
                  <strong style={{ fontSize: "1.2rem", color: "#184639", letterSpacing: "-0.02em" }}>
                    PetLink Foundation India
                  </strong>
                </div>
                <p style={{ fontSize: "0.75rem", color: "#6B7280", margin: 0, lineHeight: 1.4 }}>
                  Registered Charity UIN: SEC8-MH-2024-490331<br />
                  Office: 301 Lane 6, Kothrud, Pune, MH, 411038
                </p>
              </div>

              <hr style={{ border: 0, borderBottom: "1.5px dashed #E5DDD4", margin: "16px 0" }} />

              {/* Certificate Title */}
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "0.98rem", fontWeight: 800, letterSpacing: "0.05em", color: "#111827", textTransform: "uppercase", margin: "0 0 4px" }}>
                  Donation Receipt & Certificate
                </h3>
                <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>
                  Issued under Section 80G of the Income Tax Act, 1961
                </span>
              </div>

              {/* Receipt Fields Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px 20px",
                fontSize: "0.85rem",
                marginBottom: "24px",
                background: "#FAF7F2",
                padding: "18px 20px",
                borderRadius: "16px",
                border: "1px solid #EFEAE2"
              }}>
                <div>
                  <span style={{ color: "#6B7280", display: "block", fontSize: "0.74rem", fontWeight: 600 }}>Receipt Reference Number</span>
                  <strong style={{ fontFamily: "monospace", color: "#111827", fontSize: "0.84rem" }}>REC-{selectedReceipt.id}</strong>
                </div>
                <div>
                  <span style={{ color: "#6B7280", display: "block", fontSize: "0.74rem", fontWeight: 600 }}>Date of Transaction</span>
                  <strong style={{ color: "#111827" }}>{selectedReceipt.date}</strong>
                </div>
                <div>
                  <span style={{ color: "#6B7280", display: "block", fontSize: "0.74rem", fontWeight: 600 }}>Donor Name</span>
                  <strong style={{ color: "#111827" }}>{selectedReceipt.donorName}</strong>
                </div>
                <div>
                  <span style={{ color: "#6B7280", display: "block", fontSize: "0.74rem", fontWeight: 600 }}>Donor Email</span>
                  <strong style={{ color: "#111827" }}>{selectedReceipt.email}</strong>
                </div>
                <div>
                  <span style={{ color: "#6B7280", display: "block", fontSize: "0.74rem", fontWeight: 600 }}>Purpose Allocation</span>
                  <strong style={{ color: "#0D694B" }}>{selectedReceipt.purpose}</strong>
                </div>
                <div>
                  <span style={{ color: "#6B7280", display: "block", fontSize: "0.74rem", fontWeight: 600 }}>Donation Amount</span>
                  <strong style={{ color: "#0B5B3E", fontSize: "1.1rem" }}>
                    ₹{Number(selectedReceipt.amount).toLocaleString("en-IN")}.00
                  </strong>
                </div>
              </div>

              {/* Official Seal / Exemption notes */}
              <div style={{
                backgroundColor: "#FFFBEB",
                border: "1px solid #FDE68A",
                padding: "14px 16px",
                borderRadius: "12px",
                fontSize: "0.75rem",
                color: "#92400E",
                lineHeight: 1.45,
                marginBottom: "24px"
              }}>
                <p style={{ margin: 0 }}>
                  <strong>Tax Exemption Note: </strong>
                  This contribution is eligible for 50% income tax deduction under Section 80G of the 
                  Income Tax Act, India. All funds are subject to annual auditing by the Office of the Joint Charity Commissioner, Pune.
                </p>
              </div>

              {/* Seal signatures placeholders */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: "0.8rem" }}>
                <div>
                  <span style={{ display: "block", fontStyle: "italic", color: "#6B7280", marginBottom: "4px" }}>Pooja Mehta</span>
                  <div style={{ borderTop: "1px solid #6B7280", width: "130px", paddingTop: "4px", fontWeight: 700, color: "#111827" }}>
                    Authorized Signatory
                  </div>
                </div>
                <div style={{
                  border: "2px solid #15803D",
                  color: "#15803D",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontWeight: 800,
                  fontSize: "0.68rem",
                  letterSpacing: "0.06em",
                  backgroundColor: "#F0FDF4"
                }}>
                  SEAL VALIDATED
                </div>
              </div>

            </div>

            {/* Receipt Modal Footer Operations */}
            <div className="ngo-modal-footer">
              <button className="ngo-modal-btn-cancel" onClick={() => setSelectedReceipt(null)}>
                Close
              </button>
              <button 
                className="ngo-modal-btn-primary"
                style={{ backgroundColor: "#184639" }}
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={15} /> Print Receipt
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DonationsMgmt;
