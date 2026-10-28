import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  QrCode,
  Clock,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Truck,
  PackageCheck,
  PlusCircle,
  Download,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Layers,
  Package,
  Zap
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import client from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { getPublicBaseUrl, getScanUrl } from "../../utils/publicUrl";

// ─── small shared helpers ────────────────────────────────────────────────────

const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const Pill = ({ icon: Icon, label, bg, fg }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 11px", borderRadius: 50, fontSize: "0.72rem", fontWeight: 700, background: bg, color: fg }}>
    {Icon && <Icon size={12} />} {label}
  </span>
);

// ─── LEVEL 1 — Batch List ────────────────────────────────────────────────────

const BatchCard = ({ batch, onOpen, onBulkReceive, bulkMarkingId }) => {
  const allReceived = batch.physicallyReceivedCount >= batch.totalCount;
  const isBulkMarking = bulkMarkingId === batch.batchId;

  return (
    <div
      style={{
        background: "var(--card-bg, #FFFFFF)",
        border: "1.5px solid var(--border-color, #E5E7EB)",
        borderRadius: 18,
        padding: "22px 26px",
        display: "flex",
        alignItems: "center",
        gap: 20,
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s, border-color 0.2s",
        cursor: "default"
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = "#A5B4FC"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = "var(--border-color, #E5E7EB)"; }}
    >
      {/* Batch icon */}
      <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#EEF2FF,#DDD6FE)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Layers size={22} color="#4F46E5" />
      </div>

      {/* Batch info */}
      <div style={{ flex: "1 1 0", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
          <span style={{ fontWeight: 800, fontSize: "0.98rem", color: "var(--text-main, #111827)" }}>
            {batch.batchLabel || batch.batchId}
          </span>
          {batch.batchLabel && (
            <span style={{ fontSize: "0.7rem", color: "#6B7280", fontFamily: "monospace" }}>
              {batch.batchId}
            </span>
          )}
        </div>
        <div style={{ fontSize: "0.78rem", color: "#6B7280", marginBottom: 10 }}>
          Created {fmt(batch.createdAt)} · {batch.totalCount} tokens
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Pill icon={CheckCircle} label={`${batch.claimedCount} Claimed`} bg="#D1FAE5" fg="#065F46" />
          <Pill icon={Clock} label={`${batch.unclaimedCount} Unclaimed`} bg="#FEF3C7" fg="#92400E" />
          <Pill icon={PackageCheck} label={`${batch.physicallyReceivedCount}/${batch.totalCount} Received`} bg={allReceived ? "#DCFCE7" : "#F3F4F6"} fg={allReceived ? "#166534" : "#6B7280"} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
        <button
          onClick={() => onOpen(batch.batchId)}
          style={{
            background: "linear-gradient(135deg,#4F46E5,#7C3AED)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "8px 18px",
            fontWeight: 700,
            fontSize: "0.82rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
            transition: "opacity 0.15s"
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          View Tokens <ChevronRight size={14} />
        </button>

        {!allReceived && (
          <button
            onClick={() => onBulkReceive(batch.batchId)}
            disabled={isBulkMarking}
            style={{
              background: "#FFFFFF",
              color: "#166534",
              border: "1.5px solid #BBF7D0",
              borderRadius: 8,
              padding: "6px 13px",
              fontWeight: 700,
              fontSize: "0.75rem",
              cursor: isBulkMarking ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              opacity: isBulkMarking ? 0.65 : 1
            }}
            title="Mark every token in this batch as physically received"
          >
            <PackageCheck size={13} />
            {isBulkMarking ? "Marking…" : "Mark All as Received"}
          </button>
        )}
        {allReceived && (
          <span style={{ fontSize: "0.72rem", color: "#166534", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
            <PackageCheck size={12} /> All Received
          </span>
        )}
      </div>
    </div>
  );
};

// ─── LEVEL 2 — Batch Detail (individual tokens) ──────────────────────────────

const TokenDetail = ({ batchId, authToken, user, onBack }) => {
  const navigate = useNavigate();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [notice, setNotice] = useState(null);

  const fetchTokens = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await client.get(`/tokens/mine/batches/${batchId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setTokens(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load tokens.");
    } finally {
      setLoading(false);
    }
  }, [batchId, authToken]);

  useEffect(() => { fetchTokens(); }, [fetchTokens]);

  const handleMarkReceived = async (tokenId) => {
    setMarkingId(tokenId);
    try {
      const res = await client.put(`/tokens/${tokenId}/mark-received`, {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setTokens((prev) =>
        prev.map((t) =>
          t.tokenId === tokenId
            ? { ...t, physicallyReceived: true, receivedAt: res.data.token?.receivedAt || new Date().toISOString() }
            : t
        )
      );
      setNotice(`✅ Tag ${tokenId} confirmed received!`);
      setTimeout(() => setNotice(null), 4000);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to mark token as received.");
    } finally {
      setMarkingId(null);
    }
  };

  const handleRegisterWithToken = (t) => {
    if (user?.role === "ngo") {
      navigate(`/ngo/overview?intake=true&tokenId=${t.tokenId}`);
    } else {
      navigate(`/parent/register?tokenId=${t.tokenId}`);
    }
  };

  const handleCopy = (tokenId) => {
    navigator.clipboard.writeText(tokenId);
    setCopiedId(tokenId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadQR = (t) => {
    if (t.qrCodeDataUrl) {
      const link = document.createElement("a");
      link.href = t.qrCodeDataUrl;
      link.download = `pawsetu-qr-${t.tokenId}.png`;
      link.click();
    } else {
      window.open(getScanUrl(t.tokenId), "_blank");
    }
  };

  return (
    <div>
      {/* Sub-header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button
          onClick={onBack}
          style={{ background: "none", border: "1.5px solid var(--border-color,#E5E7EB)", borderRadius: 10, padding: "6px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted,#6B7280)" }}
        >
          <ArrowLeft size={14} /> Back to Batches
        </button>
        <span style={{ fontSize: "0.82rem", color: "#6B7280" }}>→</span>
        <span style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#4F46E5", fontWeight: 700 }}>{batchId}</span>
      </div>

      {/* Notice */}
      {notice && (
        <div style={{ margin: "0 0 16px", padding: "12px 18px", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 12, color: "#065F46", fontSize: "0.88rem", fontWeight: 700 }}>
          {notice}
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "60px 0", color: "var(--text-muted)", justifyContent: "center" }}>
          <div className="spinner" /> Loading tokens…
        </div>
      ) : error ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "24px 20px", background: "#FEF2F2", borderRadius: 12, color: "#991B1B", border: "1px solid #FECACA" }}>
          <AlertCircle size={18} /> <span style={{ fontSize: "0.875rem" }}>{error}</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {tokens.map((t) => {
            const isClaimed = t.status === "claimed";
            const isReceived = Boolean(t.physicallyReceived);
            return (
              <div
                key={t.tokenId}
                className="card"
                style={{
                  padding: "20px 24px",
                  borderRadius: 16,
                  border: `1.5px solid ${isClaimed ? "#A7F3D0" : "#FDE68A"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  background: isClaimed ? "#FAFFFE" : "#FFFEF7",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  flexWrap: "wrap"
                }}
              >
                {/* QR Code */}
                <div style={{ background: "#fff", padding: 8, borderRadius: 12, border: "1.5px solid #E5E7EB", boxShadow: "0 2px 6px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <QRCodeSVG value={getScanUrl(t.tokenId)} size={80} level="M" />
                  <button
                    onClick={() => handleDownloadQR(t)}
                    style={{ background: "none", border: "none", color: "#4F46E5", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 3, padding: 0 }}
                    title="Download QR code image"
                  >
                    <Download size={11} /> Save QR
                  </button>
                </div>

                {/* Token info */}
                <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <code style={{ fontFamily: "monospace", fontSize: "1rem", fontWeight: 800, color: "#3730A3" }}>{t.tokenId}</code>
                    <button onClick={() => handleCopy(t.tokenId)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", padding: "2px" }} title="Copy Token ID">
                      {copiedId === t.tokenId ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                    </button>
                  </div>

                  {isClaimed ? (
                    <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#065F46" }}>
                      🐾 Linked to pet: <strong>{t.linkedPetName || "Registered Pet"}</strong>
                      {t.linkedAnimalId && <span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#6B7280" }}> ({t.linkedAnimalId})</span>}
                      {t.claimedAt && <span style={{ color: "#6B7280" }}> · Claimed {new Date(t.claimedAt).toLocaleDateString()}</span>}
                    </p>
                  ) : (
                    <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#92400E" }}>⏳ Waiting to be registered with a pet.</p>
                  )}

                  <div style={{ marginTop: 8 }}>
                    {isReceived ? (
                      <Pill icon={PackageCheck} label={`Physical Tag Received${t.receivedAt ? ` (${new Date(t.receivedAt).toLocaleDateString()})` : ""}`} bg="#DCFCE7" fg="#166534" />
                    ) : (
                      <Pill icon={Truck} label="Physical Tag In Transit" bg="#FEF3C7" fg="#B45309" />
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
                  {!isClaimed ? (
                    <button
                      onClick={() => handleRegisterWithToken(t)}
                      style={{ background: "#FF6E14", color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 6px rgba(255,110,20,0.25)" }}
                    >
                      <PlusCircle size={15} /> Register Pet with This Token
                    </button>
                  ) : (
                    <Pill label="Claimed" bg="#D1FAE5" fg="#065F46" />
                  )}

                  {!isReceived ? (
                    <button
                      onClick={() => handleMarkReceived(t.tokenId)}
                      disabled={markingId === t.tokenId}
                      style={{ background: "#fff", color: "#166534", border: "1.5px solid #BBF7D0", borderRadius: 8, padding: "6px 12px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                      title="Confirm the physical metal collar tag has arrived"
                    >
                      <PackageCheck size={14} color="#166534" />
                      {markingId === t.tokenId ? "Marking…" : "Mark as Physically Received"}
                    </button>
                  ) : (
                    <span style={{ fontSize: "0.72rem", color: "#166534", fontWeight: 600 }}>✓ Delivery Confirmed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── ROOT COMPONENT ──────────────────────────────────────────────────────────

const MyTokens = () => {
  const { token: authToken, user } = useAuth();

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [bulkMarkingId, setBulkMarkingId] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await client.get("/tokens/mine", {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setBatches(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load your collar token batches. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  const handleBulkReceive = async (batchId) => {
    setBulkMarkingId(batchId);
    try {
      const res = await client.put(`/tokens/mine/batches/${batchId}/mark-received`, {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setBatches((prev) =>
        prev.map((b) =>
          b.batchId === batchId
            ? { ...b, physicallyReceivedCount: b.totalCount }
            : b
        )
      );
      setActionNotice(`✅ ${res.data.updated} tag(s) in batch marked as received!`);
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to bulk-mark batch as received.");
    } finally {
      setBulkMarkingId(null);
    }
  };

  // Aggregate summary across all batches
  const totalTokens    = batches.reduce((s, b) => s + b.totalCount, 0);
  const totalClaimed   = batches.reduce((s, b) => s + b.claimedCount, 0);
  const totalUnclaimed = batches.reduce((s, b) => s + b.unclaimedCount, 0);
  const totalReceived  = batches.reduce((s, b) => s + b.physicallyReceivedCount, 0);

  return (
    <div style={{ padding: "32px 36px", maxWidth: 980 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)", margin: 0 }}>My Collar Tokens</h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: "6px 0 0" }}>
            Pre-generated QR collar tag batches assigned to your account. Click a batch to view individual tokens.
          </p>
        </div>
        {!selectedBatchId && (
          <button
            onClick={fetchBatches}
            style={{ background: "none", border: "1.5px solid var(--border-color)", borderRadius: 10, padding: "8px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)", transition: "all 0.15s" }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        )}
      </div>

      {/* Action Notice */}
      {actionNotice && (
        <div style={{ margin: "16px 0", padding: "12px 18px", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 12, color: "#065F46", fontSize: "0.88rem", fontWeight: 700 }}>
          {actionNotice}
        </div>
      )}

      {/* Summary Pills — only show on batch list */}
      {!selectedBatchId && !loading && !error && batches.length > 0 && (
        <div style={{ display: "flex", gap: 10, margin: "20px 0 26px", flexWrap: "wrap" }}>
          <Pill icon={Layers}        label={`${batches.length} Batch${batches.length !== 1 ? "es" : ""}`} bg="#EEF2FF" fg="#4338CA" />
          <Pill icon={QrCode}        label={`${totalTokens} Total Tokens`}       bg="#F5F3FF" fg="#6D28D9" />
          <Pill icon={Clock}         label={`${totalUnclaimed} Unclaimed`}        bg="#FEF3C7" fg="#92400E" />
          <Pill icon={CheckCircle}   label={`${totalClaimed} Claimed`}            bg="#D1FAE5" fg="#065F46" />
          <Pill icon={PackageCheck}  label={`${totalReceived} Physically Received`} bg="#DCFCE7" fg="#166534" />
        </div>
      )}

      {/* ── BATCH DETAIL VIEW ── */}
      {selectedBatchId ? (
        <TokenDetail
          batchId={selectedBatchId}
          authToken={authToken}
          user={user}
          onBack={() => setSelectedBatchId(null)}
        />
      ) : loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "60px 20px", color: "var(--text-muted)", justifyContent: "center" }}>
          <div className="spinner" /> Loading your collar token batches…
        </div>
      ) : error ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "28px 20px", background: "#FEF2F2", borderRadius: 12, color: "#991B1B", border: "1px solid #FECACA" }}>
          <AlertCircle size={18} /> <span style={{ fontSize: "0.875rem" }}>{error}</span>
        </div>
      ) : batches.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <Layers size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
          <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 8px" }}>No collar token batches assigned yet</h3>
          <p style={{ fontSize: "0.875rem", margin: 0 }}>
            Collar tag batches generated by municipal admin will appear here once allocated to your account.
          </p>
        </div>
      ) : (
        <>
          {/* ── BATCH LIST ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {batches.map((b) => (
              <BatchCard
                key={b.batchId}
                batch={b}
                onOpen={setSelectedBatchId}
                onBulkReceive={handleBulkReceive}
                bulkMarkingId={bulkMarkingId}
              />
            ))}
          </div>

          {/* Instructions box */}
          <div style={{ marginTop: 28, padding: "18px 22px", background: "#EEF2FF", borderRadius: 14, border: "1px solid #C7D2FE" }}>
            <h4 style={{ margin: "0 0 6px", fontSize: "0.88rem", fontWeight: 700, color: "#3730A3", display: "flex", alignItems: "center", gap: 6 }}>
              <Sparkles size={16} /> How pre-generated collar tokens work
            </h4>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "#3730A3", lineHeight: 1.6 }}>
              • <strong>Batch Groups:</strong> Each bulk order appears as a separate batch. Click a batch to see its individual tokens.<br />
              • <strong>Direct Registration:</strong> You don't need to wait for the physical tag! Click <em>"Register Pet with This Token"</em> inside a batch to activate the pet profile immediately.<br />
              • <strong>Bulk Delivery Confirmation:</strong> When an entire batch's tags arrive by mail, use <em>"Mark All as Received"</em> to confirm the whole shipment in one click.<br />
              • <strong>Instant Scanning:</strong> Anyone scanning the collar tag will see your pet's public profile as soon as registration is complete.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default MyTokens;
