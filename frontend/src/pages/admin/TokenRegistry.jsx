import React, { useState, useEffect, useCallback } from "react";
import client from "../../api/client";
import {
  Search,
  Trash2,
  Loader2,
  RefreshCw,
  QrCode,
  Layers,
  ChevronRight,
  ArrowLeft,
  Building2,
  User,
  CheckCircle,
  Clock,
  Truck,
  ExternalLink,
  Download,
  Copy,
  Check,
  X,
  PackageCheck
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getPublicBaseUrl, getScanUrl } from "../../utils/publicUrl";

const TokenRegistry = () => {
  // Tabs: 'ngo' vs 'parent'
  const [activeTab, setActiveTab] = useState("ngo");

  // Batches state
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [batchSearch, setBatchSearch] = useState("");

  // Selected Batch (Drill-down Level 2)
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchTokens, setBatchTokens] = useState([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [tokenSearch, setTokenSearch] = useState("");
  const [filterClaimStatus, setFilterClaimStatus] = useState("all");
  const [filterPhysicalStatus, setFilterPhysicalStatus] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  // Selected Individual Token (Modal Level 3)
  const [selectedToken, setSelectedToken] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // Fetch all batches
  const fetchBatches = useCallback(async () => {
    setLoadingBatches(true);
    try {
      const res = await client.get("/tokens/batches");
      setBatches(res.data);
    } catch (err) {
      console.error("Failed to load batches", err);
    } finally {
      setLoadingBatches(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  // Fetch individual tokens when a batch is clicked
  const handleSelectBatch = async (batch) => {
    setSelectedBatch(batch);
    setLoadingTokens(true);
    setTokenSearch("");
    setFilterClaimStatus("all");
    setFilterPhysicalStatus("all");
    try {
      const res = await client.get(`/tokens/batches/${batch.batchId}`);
      setBatchTokens(res.data);
    } catch (err) {
      console.error("Failed to load batch tokens", err);
    } finally {
      setLoadingTokens(false);
    }
  };

  const handleBackToBatches = () => {
    setSelectedBatch(null);
    setBatchTokens([]);
    fetchBatches();
  };

  const handleDeleteToken = async (tokenId) => {
    if (!window.confirm(`Delete token ${tokenId}? This cannot be undone.`)) return;
    setDeletingId(tokenId);
    try {
      await client.delete(`/tokens/${tokenId}`);
      setBatchTokens((prev) => prev.filter((t) => t.tokenId !== tokenId));
      // update batch count locally
      setSelectedBatch((prev) =>
        prev
          ? {
              ...prev,
              totalCount: Math.max(0, prev.totalCount - 1),
              unclaimedCount: Math.max(0, prev.unclaimedCount - 1)
            }
          : prev
      );
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDownloadQR = (token) => {
    if (token.qrCodeDataUrl) {
      const link = document.createElement("a");
      link.href = token.qrCodeDataUrl;
      link.download = `petlink-qr-${token.tokenId}.png`;
      link.click();
    } else {
      // SVG download fallback
      const scanUrl = getScanUrl(token.tokenId);
      window.open(scanUrl, "_blank");
    }
  };

  // Filter batches by active role tab & search term
  const filteredBatches = batches.filter((b) => {
    if (b.assignedTo !== activeTab) return false;
    if (!batchSearch) return true;
    const q = batchSearch.toLowerCase();
    return (
      (b.batchId || "").toLowerCase().includes(q) ||
      (b.batchLabel || "").toLowerCase().includes(q) ||
      (b.assignedUserName || "").toLowerCase().includes(q)
    );
  });

  // Filter tokens within selected batch
  const filteredTokens = batchTokens.filter((t) => {
    if (filterClaimStatus !== "all" && t.status !== filterClaimStatus) return false;
    if (filterPhysicalStatus === "received" && !t.physicallyReceived) return false;
    if (filterPhysicalStatus === "in_transit" && t.physicallyReceived) return false;
    if (!tokenSearch) return true;
    const q = tokenSearch.toLowerCase();
    return (
      t.tokenId.toLowerCase().includes(q) ||
      (t.linkedPetName || "").toLowerCase().includes(q) ||
      (t.linkedAnimalId || "").toLowerCase().includes(q)
    );
  });

  const ngoBatchesCount = batches.filter((b) => b.assignedTo === "ngo").length;
  const parentBatchesCount = batches.filter((b) => b.assignedTo === "parent").length;

  return (
    <div className="admin-page">
      {/* ─── Breadcrumb Navigation ─── */}
      <nav className="admin-breadcrumbs">
        <button
          className="admin-breadcrumb-link"
          onClick={handleBackToBatches}
        >
          Token Registry
        </button>
        <ChevronRight size={14} color="#9CA3AF" />
        <button
          className="admin-breadcrumb-link"
          onClick={() => {
            if (selectedBatch) handleBackToBatches();
          }}
        >
          {activeTab === "ngo" ? "NGO Collar Tags" : "Parent Collar Tags"}
        </button>
        {selectedBatch && (
          <>
            <ChevronRight size={14} color="#9CA3AF" />
            <span className="admin-breadcrumb-current">
              Batch: {selectedBatch.batchLabel || selectedBatch.batchId}
            </span>
          </>
        )}
      </nav>

      {/* ─── Header ─── */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            {selectedBatch
              ? `Batch Details: ${selectedBatch.batchLabel || selectedBatch.batchId}`
              : "Token Registry"}
          </h1>
          <p className="admin-page-subtitle">
            {selectedBatch
              ? `Managing individual collar tags generated in this batch for ${selectedBatch.assignedUserName}.`
              : "Hierarchical registry of pre-generated collar tags grouped by organization and generation batch."}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {selectedBatch ? (
            <button
              className="admin-btn admin-btn-ghost"
              onClick={handleBackToBatches}
            >
              <ArrowLeft size={16} /> Back to Batches
            </button>
          ) : (
            <button
              className="admin-btn admin-btn-ghost"
              onClick={fetchBatches}
              title="Refresh Batches"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          )}
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════
          LEVEL 1: TABS & BATCH LIST
      ═════════════════════════════════════════════════════════════ */}
      {!selectedBatch && (
        <>
          {/* Top-Level Tabs: NGO vs Parent */}
          <div className="admin-tabs-nav">
            <button
              className={`admin-tab-btn ${activeTab === "ngo" ? "active" : ""}`}
              onClick={() => setActiveTab("ngo")}
            >
              <Building2 size={18} />
              NGO Collar Batches
              <span className="admin-tab-count">{ngoBatchesCount}</span>
            </button>
            <button
              className={`admin-tab-btn ${activeTab === "parent" ? "active" : ""}`}
              onClick={() => setActiveTab("parent")}
            >
              <User size={18} />
              Parent Collar Batches
              <span className="admin-tab-count">{parentBatchesCount}</span>
            </button>
          </div>

          {/* Search bar for batches */}
          <div className="admin-filter-bar">
            <div className="admin-search-wrapper" style={{ maxWidth: "450px" }}>
              <Search size={15} className="admin-search-icon" />
              <input
                className="admin-search-input"
                placeholder="Search batch ID, label, or recipient account…"
                value={batchSearch}
                onChange={(e) => setBatchSearch(e.target.value)}
              />
            </div>
            <div style={{ marginLeft: "auto", fontSize: "0.85rem", color: "#6B7280", fontWeight: 600 }}>
              Showing {filteredBatches.length} batch{filteredBatches.length !== 1 ? "es" : ""}
            </div>
          </div>

          {/* Batches Content */}
          {loadingBatches ? (
            <div className="admin-loading">
              <Loader2 size={24} className="spin" /> Loading batches…
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="admin-empty">
              <Layers size={40} style={{ opacity: 0.3 }} />
              <h3 style={{ margin: "8px 0 4px", fontSize: "1rem", color: "#374151" }}>No batches found</h3>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#9CA3AF" }}>
                Generate collar tokens for {activeTab.toUpperCase()} accounts from the Generate page.
              </p>
            </div>
          ) : (
            <div className="admin-batch-grid">
              {filteredBatches.map((b) => {
                const physicalPct = b.totalCount > 0 ? Math.round((b.physicallyReceivedCount / b.totalCount) * 100) : 0;
                const claimedPct = b.totalCount > 0 ? Math.round((b.claimedCount / b.totalCount) * 100) : 0;

                return (
                  <div
                    key={b.batchId}
                    className="admin-batch-card"
                    onClick={() => handleSelectBatch(b)}
                  >
                    <div className="admin-batch-header">
                      <div>
                        <h3 className="admin-batch-title">
                          <Layers size={17} color="#4F46E5" />
                          {b.batchLabel || b.batchId}
                        </h3>
                        <p className="admin-batch-subtitle">
                          Assigned to: <strong>{b.assignedUserName || "Unknown User"}</strong>
                        </p>
                      </div>
                      <span className={`admin-role-pill admin-role-${b.assignedTo}`}>
                        {b.assignedTo.toUpperCase()}
                      </span>
                    </div>

                    {/* Stats pills */}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", fontSize: "0.78rem" }}>
                      <span style={{ padding: "4px 10px", borderRadius: "6px", background: "#EEF2FF", color: "#4338CA", fontWeight: 700 }}>
                        {b.totalCount} Total Tags
                      </span>
                      <span style={{ padding: "4px 10px", borderRadius: "6px", background: "#FEF3C7", color: "#92400E", fontWeight: 700 }}>
                        {b.unclaimedCount} Unclaimed
                      </span>
                      <span style={{ padding: "4px 10px", borderRadius: "6px", background: "#D1FAE5", color: "#065F46", fontWeight: 700 }}>
                        {b.claimedCount} Claimed
                      </span>
                    </div>

                    {/* Physical Delivery Fulfillment Progress */}
                    <div className="admin-progress-wrapper">
                      <div className="admin-progress-labels">
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Truck size={13} color="#D97706" /> Physical Delivery
                        </span>
                        <span>{b.physicallyReceivedCount} of {b.totalCount} ({physicalPct}%)</span>
                      </div>
                      <div className="admin-progress-bar-bg">
                        <div
                          className="admin-progress-bar-fill"
                          style={{
                            width: `${physicalPct}%`,
                            backgroundColor: physicalPct === 100 ? "#10B981" : "#F59E0B"
                          }}
                        />
                      </div>
                    </div>

                    {/* Card footer */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #F3F4F6", paddingTop: "12px", marginTop: "auto" }}>
                      <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                        {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "Recent"}
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "#4F46E5", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                        Inspect Batch <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ═════════════════════════════════════════════════════════════
          LEVEL 2: BATCH DETAIL VIEW (Tokens inside this batch)
      ═════════════════════════════════════════════════════════════ */}
      {selectedBatch && (
        <div>
          {/* Batch Summary Header Banner */}
          <div className="admin-card" style={{ padding: "20px 24px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <code style={{ fontSize: "1rem", fontWeight: 800, color: "#4338CA", background: "#EEF2FF", padding: "4px 10px", borderRadius: "8px" }}>
                    {selectedBatch.batchId}
                  </code>
                  {selectedBatch.batchLabel && (
                    <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1F2937" }}>
                      ({selectedBatch.batchLabel})
                    </span>
                  )}
                  <span className={`admin-role-pill admin-role-${selectedBatch.assignedTo}`}>
                    {selectedBatch.assignedTo.toUpperCase()}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#6B7280" }}>
                  Assigned Account: <strong>{selectedBatch.assignedUserName}</strong> · Created on:{" "}
                  {selectedBatch.createdAt ? new Date(selectedBatch.createdAt).toLocaleString() : "Recent"}
                </p>
              </div>

              {/* Summary counters */}
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ textAlign: "center", padding: "8px 14px", background: "#F9FAFB", borderRadius: "10px", border: "1px solid #E5E7EB" }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#111827" }}>{selectedBatch.totalCount}</div>
                  <div style={{ fontSize: "0.7rem", color: "#6B7280", fontWeight: 700, textTransform: "uppercase" }}>Total Tags</div>
                </div>
                <div style={{ textAlign: "center", padding: "8px 14px", background: "#FEF3C7", borderRadius: "10px", border: "1px solid #FDE68A" }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#92400E" }}>{selectedBatch.unclaimedCount}</div>
                  <div style={{ fontSize: "0.7rem", color: "#92400E", fontWeight: 700, textTransform: "uppercase" }}>Unclaimed</div>
                </div>
                <div style={{ textAlign: "center", padding: "8px 14px", background: "#D1FAE5", borderRadius: "10px", border: "1px solid #A7F3D0" }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#065F46" }}>{selectedBatch.claimedCount}</div>
                  <div style={{ fontSize: "0.7rem", color: "#065F46", fontWeight: 700, textTransform: "uppercase" }}>Claimed</div>
                </div>
                <div style={{ textAlign: "center", padding: "8px 14px", background: "#F0FDF4", borderRadius: "10px", border: "1px solid #BBF7D0" }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#166534" }}>{selectedBatch.physicallyReceivedCount}</div>
                  <div style={{ fontSize: "0.7rem", color: "#166534", fontWeight: 700, textTransform: "uppercase" }}>Received</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Bar for tokens in this batch */}
          <div className="admin-filter-bar">
            <div className="admin-search-wrapper" style={{ flex: 1 }}>
              <Search size={15} className="admin-search-icon" />
              <input
                className="admin-search-input"
                placeholder="Search token ID, pet name, animal ID…"
                value={tokenSearch}
                onChange={(e) => setTokenSearch(e.target.value)}
              />
            </div>

            <select
              className="admin-select admin-select-sm"
              value={filterClaimStatus}
              onChange={(e) => setFilterClaimStatus(e.target.value)}
            >
              <option value="all">All Claim Statuses</option>
              <option value="assigned">Unclaimed Only</option>
              <option value="claimed">Claimed Only</option>
            </select>

            <select
              className="admin-select admin-select-sm"
              value={filterPhysicalStatus}
              onChange={(e) => setFilterPhysicalStatus(e.target.value)}
            >
              <option value="all">All Physical Delivery</option>
              <option value="received">Physically Received</option>
              <option value="in_transit">In Transit (Pending)</option>
            </select>
          </div>

          {/* Tokens Table */}
          {loadingTokens ? (
            <div className="admin-loading">
              <Loader2 size={24} className="spin" /> Loading tokens…
            </div>
          ) : filteredTokens.length === 0 ? (
            <div className="admin-empty">
              <QrCode size={40} style={{ opacity: 0.3 }} />
              <p>No tokens in this batch match your filter criteria.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: "65px" }}>QR Code</th>
                    <th>Token ID</th>
                    <th>Physical Tag Status</th>
                    <th>Digital Claim Status</th>
                    <th>Linked Pet Profile</th>
                    <th>Created / Claimed Date</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTokens.map((t) => {
                    const isClaimed = t.status === "claimed";
                    const isReceived = Boolean(t.physicallyReceived);

                    return (
                      <tr
                        key={t.tokenId}
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedToken(t)}
                      >
                        {/* Scannable QR Thumbnail */}
                        <td onClick={(e) => e.stopPropagation()}>
                          <div
                            onClick={() => setSelectedToken(t)}
                            title="Click to enlarge scannable QR"
                            style={{
                              width: "48px",
                              height: "48px",
                              backgroundColor: "#FFFFFF",
                              border: "1px solid #E5E7EB",
                              borderRadius: "8px",
                              padding: "2px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                            }}
                          >
                            {t.qrCodeDataUrl ? (
                              <img
                                src={t.qrCodeDataUrl}
                                alt={`QR for ${t.tokenId}`}
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                              />
                            ) : (
                              <QRCodeSVG
                                value={getScanUrl(t.tokenId)}
                                size={40}
                                level="M"
                              />
                            )}
                          </div>
                        </td>

                        {/* Token ID */}
                        <td>
                          <code className="admin-token-id" style={{ fontSize: "0.88rem" }}>
                            {t.tokenId}
                          </code>
                        </td>

                        {/* Physical Receipt Status */}
                        <td>
                          {isReceived ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "4px 10px",
                                borderRadius: "50px",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                backgroundColor: "#DCFCE7",
                                color: "#15803D"
                              }}
                            >
                              <PackageCheck size={13} /> Physically Received
                            </span>
                          ) : (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "4px 10px",
                                borderRadius: "50px",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                backgroundColor: "#FEF3C7",
                                color: "#B45309"
                              }}
                            >
                              <Truck size={13} /> In Transit
                            </span>
                          )}
                        </td>

                        {/* Digital Claim Status */}
                        <td>
                          <span
                            className="admin-status-badge"
                            style={{
                              backgroundColor: isClaimed ? "#D1FAE5" : "#FEF3C7",
                              color: isClaimed ? "#065F46" : "#92400E"
                            }}
                          >
                            {isClaimed ? "Claimed" : "Unclaimed"}
                          </span>
                        </td>

                        {/* Linked Pet Profile */}
                        <td>
                          {isClaimed ? (
                            <div>
                              <strong style={{ color: "#111827", fontSize: "0.85rem" }}>
                                {t.linkedPetName || "Unnamed Pet"}
                              </strong>
                              {t.linkedAnimalId && (
                                <div style={{ fontSize: "0.75rem", color: "#6B7280", fontFamily: "monospace" }}>
                                  ID: {t.linkedAnimalId}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: "#9CA3AF", fontSize: "0.85rem" }}>—</span>
                          )}
                        </td>

                        {/* Dates */}
                        <td style={{ fontSize: "0.82rem", color: "#6B7280" }}>
                          {isClaimed && t.claimedAt
                            ? `Claimed: ${new Date(t.claimedAt).toLocaleDateString()}`
                            : `Created: ${new Date(t.createdAt).toLocaleDateString()}`}
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <button
                              className="admin-btn admin-btn-ghost"
                              style={{ padding: "6px 10px", fontSize: "0.78rem" }}
                              onClick={() => setSelectedToken(t)}
                            >
                              Details
                            </button>
                            {!isClaimed && (
                              <button
                                className="admin-icon-btn admin-icon-btn-danger"
                                onClick={() => handleDeleteToken(t.tokenId)}
                                disabled={deletingId === t.tokenId}
                                title="Delete unclaimed token"
                              >
                                {deletingId === t.tokenId ? (
                                  <Loader2 size={14} className="spin" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="admin-table-footer">
                Showing {filteredTokens.length} of {batchTokens.length} token
                {batchTokens.length !== 1 ? "s" : ""} in this batch
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          LEVEL 3: INDIVIDUAL TOKEN MODAL
      ═════════════════════════════════════════════════════════════ */}
      {selectedToken && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelectedToken(null)}
        >
          <div
            className="admin-modal-card animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="admin-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <QrCode size={22} color="#4F46E5" />
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#111827" }}>
                    Collar Token Details
                  </h3>
                  <span style={{ fontSize: "0.78rem", color: "#6B7280" }}>
                    Batch: {selectedToken.batchLabel || selectedToken.batchId}
                  </span>
                </div>
              </div>
              <button
                className="admin-modal-close-btn"
                onClick={() => setSelectedToken(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="admin-modal-body">
              {/* QR Code Presentation Box */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "24px",
                  background: "#FAFAFA",
                  borderRadius: "16px",
                  border: "1.5px solid #E5E7EB",
                  gap: "12px"
                }}
              >
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    padding: "12px",
                    borderRadius: "14px",
                    border: "1px solid #D1D5DB",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {selectedToken.qrCodeDataUrl ? (
                    <img
                      src={selectedToken.qrCodeDataUrl}
                      alt={selectedToken.tokenId}
                      style={{ width: "160px", height: "160px", objectFit: "contain" }}
                    />
                  ) : (
                    <QRCodeSVG
                      value={getScanUrl(selectedToken.tokenId)}
                      size={160}
                      level="M"
                    />
                  )}
                </div>

                {/* Token ID pill with copy button */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <code style={{ fontFamily: "monospace", fontSize: "1rem", fontWeight: 800, color: "#3730A3", background: "#EEF2FF", padding: "4px 12px", borderRadius: "8px" }}>
                    {selectedToken.tokenId}
                  </code>
                  <button
                    onClick={() => handleCopy(selectedToken.tokenId)}
                    style={{ background: "none", border: "1px solid #D1D5DB", borderRadius: "8px", padding: "6px", cursor: "pointer", color: "#4B5563" }}
                    title="Copy Token ID"
                  >
                    {copiedId ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                  </button>
                </div>

                {/* Download and Scan Links */}
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <button
                    className="admin-btn admin-btn-sm admin-btn-primary"
                    onClick={() => handleDownloadQR(selectedToken)}
                    style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem" }}
                  >
                    <Download size={14} /> Download QR Tag
                  </button>
                  <a
                    href={getScanUrl(selectedToken.tokenId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-btn admin-btn-sm admin-btn-ghost"
                    style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", textDecoration: "none" }}
                  >
                    <ExternalLink size={14} /> Public Scan Page
                  </a>
                </div>
              </div>

              {/* Status Breakdown Section */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* 1. Physical Tag Delivery Status */}
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: `1.5px solid ${selectedToken.physicallyReceived ? "#BBF7D0" : "#FDE68A"}`,
                    backgroundColor: selectedToken.physicallyReceived ? "#F0FDF4" : "#FFFBEB",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px"
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      backgroundColor: selectedToken.physicallyReceived ? "#DCFCE7" : "#FEF3C7",
                      color: selectedToken.physicallyReceived ? "#166534" : "#B45309",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    {selectedToken.physicallyReceived ? <PackageCheck size={20} /> : <Truck size={20} />}
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 2px", fontSize: "0.9rem", fontWeight: 700, color: selectedToken.physicallyReceived ? "#166534" : "#92400E" }}>
                      Physical Tag: {selectedToken.physicallyReceived ? "Confirmed Received" : "In Transit / Awaiting Arrival"}
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: selectedToken.physicallyReceived ? "#15803D" : "#78350F" }}>
                      {selectedToken.physicallyReceived && selectedToken.receivedAt
                        ? `Recipient confirmed physical tag arrival on ${new Date(selectedToken.receivedAt).toLocaleString()}.`
                        : "Collar tag has been dispatched and is currently awaiting recipient delivery confirmation."}
                    </p>
                  </div>
                </div>

                {/* 2. Digital Claim Lifecycle Status */}
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: `1.5px solid ${selectedToken.status === "claimed" ? "#A7F3D0" : "#E5E7EB"}`,
                    backgroundColor: selectedToken.status === "claimed" ? "#F0FDF4" : "#F9FAFB",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px"
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      backgroundColor: selectedToken.status === "claimed" ? "#D1FAE5" : "#F3F4F6",
                      color: selectedToken.status === "claimed" ? "#065F46" : "#6B7280",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    {selectedToken.status === "claimed" ? <CheckCircle size={20} /> : <Clock size={20} />}
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 2px", fontSize: "0.9rem", fontWeight: 700, color: selectedToken.status === "claimed" ? "#065F46" : "#374151" }}>
                      Digital Profile: {selectedToken.status === "claimed" ? "Claimed & Activated" : "Unclaimed (Available)"}
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: selectedToken.status === "claimed" ? "#047857" : "#6B7280" }}>
                      {selectedToken.status === "claimed" ? (
                        <>
                          Linked to animal: <strong>{selectedToken.linkedPetName || "Unnamed Pet"}</strong> (ID: {selectedToken.linkedAnimalId}).
                          {selectedToken.claimedAt && ` Activated on ${new Date(selectedToken.claimedAt).toLocaleDateString()}.`}
                        </>
                      ) : (
                        "Ready to be linked to an animal profile either directly via portal or by scanning the collar tag."
                      )}
                    </p>
                  </div>
                </div>

                {/* Metadata details table */}
                <div style={{ marginTop: "8px", borderTop: "1px solid #E5E7EB", paddingTop: "14px", fontSize: "0.82rem", color: "#4B5563", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <span style={{ color: "#9CA3AF", display: "block", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700 }}>Assigned To</span>
                    <strong>{selectedToken.assignedUserName || "—"}</strong> ({selectedToken.assignedTo?.toUpperCase()})
                  </div>
                  <div>
                    <span style={{ color: "#9CA3AF", display: "block", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700 }}>Batch ID</span>
                    <span style={{ fontFamily: "monospace" }}>{selectedToken.batchId}</span>
                  </div>
                  <div>
                    <span style={{ color: "#9CA3AF", display: "block", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700 }}>Created Timestamp</span>
                    <span>{new Date(selectedToken.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span style={{ color: "#9CA3AF", display: "block", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700 }}>Public Scan Endpoint</span>
                    <span style={{ fontFamily: "monospace", color: "#4F46E5" }}>/scan/{selectedToken.tokenId}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenRegistry;
