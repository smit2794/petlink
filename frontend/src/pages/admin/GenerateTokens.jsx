import React, { useState, useEffect } from "react";
import client from "../../api/client";
import { QrCode, Plus, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const GenerateTokens = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    count: 5,
    assignedTo: "ngo",
    assignedUserId: "",
    batchLabel: "",
  });
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [result, setResult] = useState(null); // { success, tokens, error }

  // Load user accounts whenever assignedTo changes
  useEffect(() => {
    const load = async () => {
      setUsersLoading(true);
      try {
        const res = await client.get(`/tokens/users?role=${form.assignedTo}`);
        setUsers(res.data);
        setForm((prev) => ({ ...prev, assignedUserId: "" }));
      } catch (err) {
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };
    load();
  }, [form.assignedTo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.assignedUserId) {
      setResult({ success: false, error: "Please select a user account." });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await client.post("/tokens/generate", {
        count: Number(form.count),
        assignedTo: form.assignedTo,
        assignedUserId: form.assignedUserId,
        batchLabel: form.batchLabel,
      });
      setResult({ success: true, tokens: res.data.tokens, created: res.data.created });
    } catch (err) {
      setResult({ success: false, error: err.response?.data?.error || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Generate QR Tokens</h1>
      <p className="admin-page-subtitle">
        Pre-generate collar tag tokens in bulk and assign them to an NGO or Parent account.
      </p>

      <div className="admin-card">
        <form onSubmit={handleSubmit} className="admin-form">
          {/* Portal type */}
          <div className="admin-form-group">
            <label className="admin-label">Assign to Portal</label>
            <div className="admin-radio-group">
              {["ngo", "parent"].map((role) => (
                <label key={role} className={`admin-radio-pill ${form.assignedTo === role ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="assignedTo"
                    value={role}
                    checked={form.assignedTo === role}
                    onChange={handleChange}
                  />
                  {role === "ngo" ? "NGO Account" : "Parent Account"}
                </label>
              ))}
            </div>
          </div>

          {/* User selector */}
          <div className="admin-form-group">
            <label className="admin-label">
              Select {form.assignedTo === "ngo" ? "NGO" : "Parent"} Account
            </label>
            {usersLoading ? (
              <div className="admin-loading-inline"><Loader2 size={16} className="spin" /> Loading accounts…</div>
            ) : users.length === 0 ? (
              <div className="admin-empty-msg">No {form.assignedTo} accounts found. Register one first.</div>
            ) : (
              <select
                name="assignedUserId"
                className="admin-select"
                value={form.assignedUserId}
                onChange={handleChange}
                required
              >
                <option value="">— Select an account —</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email}) — {u.city}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Count */}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Number of Tokens (1–200)</label>
              <input
                type="number"
                name="count"
                className="admin-input"
                min={1}
                max={200}
                value={form.count}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Batch Label (optional)</label>
              <input
                type="text"
                name="batchLabel"
                className="admin-input"
                placeholder="e.g. Batch-Oct-2026"
                value={form.batchLabel}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={loading}
          >
            {loading ? (
              <><Loader2 size={16} className="spin" /> Generating…</>
            ) : (
              <><Plus size={16} /> Generate {form.count} Token{form.count > 1 ? "s" : ""}</>
            )}
          </button>
        </form>
      </div>

      {/* Result feedback */}
      {result && (
        <div className={`admin-result-box ${result.success ? "success" : "error"}`}>
          {result.success ? (
            <>
              <CheckCircle size={18} />
              <div>
                <strong>{result.created} token{result.created > 1 ? "s" : ""} generated successfully!</strong>
                <div className="admin-token-list">
                  {result.tokens.map((t) => (
                    <code key={t.tokenId} className="admin-token-chip">{t.tokenId}</code>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <AlertCircle size={18} />
              <span>{result.error}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GenerateTokens;
