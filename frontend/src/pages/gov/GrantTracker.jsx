import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { Landmark, CheckCircle, AlertTriangle, Search, FileText } from "lucide-react";

const GrantTracker = () => {
  const { grantDisbursements } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const filteredGrants = (grantDisbursements || []).filter((g) => {
    return (
      g.ngoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Header Info */}
      <div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "-0.02em" }}>
          Municipal Grant Dispersal ledger
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
          Audit financial payouts, compliance checks, and welfare disbursement statuses across partner shelters.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ padding: "16px 24px" }}>
        <input
          type="text"
          placeholder="Search grant logs by recipient name, ID, or purpose..."
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
        /* Ledger Table */
        <div className="table-container" style={{ border: "1px solid var(--border-color)", borderRadius: "20px" }}>
          <table className="table" style={{ fontSize: "0.85rem" }}>
            <thead>
              <tr>
                <th>Disbursement ID</th>
                <th>Recipient NGO</th>
                <th>Assigned Purpose</th>
                <th>Grant Amount</th>
                <th>Compliance Status</th>
                <th>Dispatched Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrants.map((g) => (
                <tr key={g.id}>
                  <td style={{ fontWeight: 800 }}>{g.id}</td>
                  <td style={{ fontWeight: 700 }}>{g.ngoName}</td>
                  <td>{g.purpose}</td>
                  <td style={{ fontWeight: 800, color: "var(--primary-color)" }}>{g.amount}</td>
                  <td>
                    <span 
                      className={`badge badge-${g.compliance === "Approved" ? "adopted" : "lost"}`} 
                      style={{ fontSize: "0.68rem", display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      {g.compliance === "Approved" ? (
                        <>
                          <CheckCircle size={10} /> Verified
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={10} /> Pending Audit
                        </>
                      )}
                    </span>
                  </td>
                  <td>{g.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default GrantTracker;
