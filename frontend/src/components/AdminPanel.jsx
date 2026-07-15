import React, { useState, useEffect } from "react";
import "../css/AdminPanel.css";
import { supabase } from "../services/supabase";
import { useDialog } from "../context/DialogContext";

export default function AdminPanel({ isOpen, onClose, user }) {
  const { showAlert } = useDialog();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all', 'pending', 'approved', 'completed', 'rejected'
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ pending: 0, completed: 0, revenue: 0 });

  const fetchPayments = async () => {
    if (!isOpen) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("gcash_payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching payments:", error);
      } else if (data) {
        setPayments(data);
        
        // Calculate stats
        const pendingCount = data.filter(p => p.status === "pending").length;
        const completedCount = data.filter(p => p.status === "completed").length;
        const totalRevenue = data
          .filter(p => p.status === "completed" || p.status === "approved")
          .reduce((sum, p) => sum + (p.amount || 0), 0);
        
        setStats({
          pending: pendingCount,
          completed: completedCount,
          revenue: totalRevenue
        });
      }
    } catch (err) {
      console.error("Fetch catch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdateStatus = async (refNo, newStatus) => {
    try {
      const { error } = await supabase
        .from("gcash_payments")
        .update({ status: newStatus })
        .eq("reference_number", refNo);

      if (error) {
        await showAlert("Failed to update status: " + error.message, "Error");
      } else {
        fetchPayments();
      }
    } catch (err) {
      console.error("Update catch error:", err);
    }
  };

  // Filter and search
  const filteredPayments = payments.filter(p => {
    const matchesFilter = filter === "all" 
      || p.status === filter 
      || (filter === "rejected" && p.status === "rejected_notified");
    const matchesSearch = 
      (p.email && p.email.toLowerCase().includes(search.toLowerCase())) ||
      (p.reference_number && p.reference_number.includes(search)) ||
      (p.plan_name && p.plan_name.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="pricing-modal-overlay" onClick={onClose}>
      <div className="pricing-modal-box admin-modal-box" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="pricing-modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="admin-panel-header">
          <h2 className="admin-panel-title">👑 Payment Management Console</h2>
          <p className="admin-panel-subtitle">Review, approve, and audit Resora Premium GCash transactions</p>
        </div>

        {/* Stats Section */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <span className="stat-label">Pending Checks</span>
            <span className="stat-value text-amber">{stats.pending}</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">Subscribed Accounts</span>
            <span className="stat-value text-green">{stats.completed}</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value text-blue">₱{stats.revenue.toLocaleString()}</span>
          </div>
        </div>

        {/* Controls Section */}
        <div className="admin-controls-row">
          <div className="admin-filter-tabs">
            {["all", "pending", "approved", "completed", "rejected"].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`admin-filter-btn ${filter === tab ? "active" : ""}`}
                onClick={() => setFilter(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="admin-search-wrapper">
            <input
              type="text"
              placeholder="Search reference, email, or plan..."
              className="admin-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="admin-table-container">
          {loading ? (
            <div className="admin-loading-row">
              <span className="spinner-dot"></span>
              Loading transaction records...
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="admin-empty-row">
              No transactions matching the criteria found.
            </div>
          ) : (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Submitted At</th>
                  <th>Reference Number</th>
                  <th>User Email</th>
                  <th>Plan & Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.reference_number}>
                    <td>{new Date(payment.created_at).toLocaleString()}</td>
                    <td className="font-mono font-bold text-blue">{payment.reference_number}</td>
                    <td>{payment.email || "anonymous"}</td>
                    <td>
                      <span className={`plan-badge badge-${payment.plan_name}`}>
                        {payment.plan_name === "premium_pro" ? "Pro" : "Plus"}
                      </span>
                      <strong style={{ marginLeft: "6px" }}>₱{payment.amount || (payment.plan_name === "premium_pro" ? 119 : 179)}</strong>
                    </td>
                    <td>
                      <span className={`status-pill status-${payment.status === "rejected_notified" ? "rejected" : payment.status}`}>
                        {payment.status === "rejected_notified" ? "rejected" : payment.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions-cell">
                        {payment.status === "pending" && (
                          <>
                            <button
                              type="button"
                              className="admin-action-btn-approve"
                              onClick={() => handleUpdateStatus(payment.reference_number, "approved")}
                              title="Approve transaction"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="admin-action-btn-reject"
                              onClick={() => handleUpdateStatus(payment.reference_number, "rejected")}
                              title="Reject transaction"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {(payment.status === "approved" || payment.status === "completed") && (
                          <span className="action-completed-check">Verified ✓</span>
                        )}
                        {(payment.status === "rejected" || payment.status === "rejected_notified") && (
                          <button
                            type="button"
                            className="admin-action-btn-reconsider"
                            onClick={() => handleUpdateStatus(payment.reference_number, "pending")}
                            title="Re-open check"
                          >
                            Re-verify
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="admin-panel-footer">
          <button type="button" className="admin-refresh-btn" onClick={fetchPayments}>
            ↻ Refresh Records
          </button>
        </div>
      </div>
    </div>
  );
}
