import React, { useState, useEffect } from "react";
import "../css/App.css";
import { supabase } from "../services/supabase";

const ENCODED_GCASH_NUMBER = "MDkyOTIyMzI4MDA="; // base64 obfuscation of '09292232800'
const DECODED_GCASH_NUMBER = atob(ENCODED_GCASH_NUMBER);

export default function PricingModal({ isOpen, triggerRect, onClose, currentPlan, onPurchase, user, onNavigate }) {
  const [selectedPlan, setSelectedPlan] = useState(null); // 'premium_plus' or 'premium_pro'
  const [gcashMode, setGcashMode] = useState(false);
  const [refNumber, setRefNumber] = useState("");
  const [refError, setRefError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Live Mode states
  const [dbTableExists, setDbTableExists] = useState(false);
  const [isAwaitingSMS, setIsAwaitingSMS] = useState(false);
  const [pendingRef, setPendingRef] = useState(null);
  const [hasDismissedPending, setHasDismissedPending] = useState(false);

  // Genie Transition and Exit animation states
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);

  // Reset dismissed state when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasDismissedPending(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      
      const triggerX = triggerRect?.x ?? (window.innerWidth / 2);
      const triggerY = triggerRect?.y ?? (window.innerHeight * 0.8);
      
      const newDx = triggerX - (window.innerWidth / 2);
      const newDy = triggerY - (window.innerHeight / 2);
      
      setDx(newDx);
      setDy(newDy);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 350); // 350ms animation duration (matching our faster exit duration)
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender, triggerRect]);

  // Check if gcash_payments table exists in Supabase
  useEffect(() => {
    if (!isOpen) return;
    const checkTable = async () => {
      try {
        const { error } = await supabase
          .from("gcash_payments")
          .select("status")
          .limit(1);

        if (!error || error.code !== "42P01") {
          setDbTableExists(true);
        } else {
          setDbTableExists(false);
        }
      } catch (e) {
        setDbTableExists(false);
      }
    };
    checkTable();
  }, [isOpen]);

  // Check for any existing pending payments for this user in the database
  useEffect(() => {
    if (!isOpen || !user || !dbTableExists || hasDismissedPending) return;

    const checkPendingPayment = async () => {
      try {
        const { data, error } = await supabase
          .from("gcash_payments")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          const pending = data[0];
          setSelectedPlan(pending.plan_name);
          setRefNumber(pending.reference_number);
          setPendingRef(pending.reference_number);
          setIsAwaitingSMS(true);
          setGcashMode(true);
        }
      } catch (err) {
        console.error("Error checking pending payment:", err);
      }
    };

    checkPendingPayment();
  }, [isOpen, user, dbTableExists, hasDismissedPending]);

  // Poll for SMS Receipt / Admin approval
  useEffect(() => {
    if (!pendingRef || !isOpen || !user) return;

    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase.rpc("verify_and_claim_payment", {
          ref_no: pendingRef,
          current_user_id: user.id,
          current_email: user.email
        });

        if (error) return;

        if (data) {
          if (data.success) {
            clearInterval(interval);
            setPendingRef(null);
            setIsAwaitingSMS(false);
            setIsVerifying(false);

            // Sync with local React auth context
            await onPurchase(data.plan_name);
            setIsSuccess(true);
          } else {
            if (data.error === "already_used") {
              clearInterval(interval);
              setPendingRef(null);
              setIsAwaitingSMS(false);
              setIsVerifying(false);
              setRefError("This reference number has already been used.");
            } else if (data.error === "rejected") {
              clearInterval(interval);
              setPendingRef(null);
              setIsAwaitingSMS(false);
              setIsVerifying(false);
              setRefError("This transaction reference was rejected.");
            }
            // For 'pending' or 'not_found' (e.g. gateway hasn't received it yet), keep polling
          }
        }
      } catch (err) {
        console.error("Polling check failed:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [pendingRef, isOpen, user, onPurchase]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  const handleSelectUpgrade = (plan) => {
    if (!user) {
      onClose();
      onNavigate && onNavigate("auth", "Sign in to subscribe to premium plans");
      return;
    }
    setSelectedPlan(plan);
    setGcashMode(true);
    setRefNumber("");
    setRefError("");
    setIsSuccess(false);
    setIsAwaitingSMS(false);
    setPendingRef(null);
  };

  const handleCancelPayment = () => {
    setGcashMode(false);
    setSelectedPlan(null);
    setRefNumber("");
    setRefError("");
    setIsAwaitingSMS(false);
    setPendingRef(null);
    setHasDismissedPending(true);
  };

  const handleVerifyPayment = async (e) => {
    e.preventDefault();
    const cleanRef = refNumber.replace(/\s+/g, "");

    if (!/^\d{13}$/.test(cleanRef)) {
      setRefError("Please enter a valid 13-digit GCash Reference Number (e.g. 5012345678901).");
      return;
    }

    setRefError("");
    setIsVerifying(true);

    if (!dbTableExists) {
      // Simulation Mode: Accept any 13-digit code
      setTimeout(async () => {
        try {
          const success = await onPurchase(selectedPlan);
          if (success) {
            setIsVerifying(false);
            setIsSuccess(true);
          } else {
            setIsVerifying(false);
            setRefError("Verification server is currently busy. Please try again.");
          }
        } catch (err) {
          setIsVerifying(false);
          setRefError("Failed to update account plan. Please try again.");
        }
      }, 1500);
      return;
    }

    // Live Database Mode
    try {
      const { data, error } = await supabase.rpc("verify_and_claim_payment", {
        ref_no: cleanRef,
        current_user_id: user.id,
        current_email: user.email
      });

      if (error) {
        console.error("RPC claim check failed:", error);
        setIsVerifying(false);
        setRefError("Failed to connect to verification server. Please try again.");
        return;
      }

      if (data) {
        if (data.success) {
          // Sync with local React auth context
          const success = await onPurchase(data.plan_name);
          if (success) {
            setIsVerifying(false);
            setIsSuccess(true);
          } else {
            setIsVerifying(false);
            setRefError("Verification succeeded but account metadata sync failed. Reload the page.");
          }
        } else {
          if (data.error === "already_used") {
            setIsVerifying(false);
            setRefError("This reference number has already been used for another purchase.");
          } else if (data.error === "rejected") {
            setIsVerifying(false);
            setRefError("This transaction reference was rejected by the gateway. Try another.");
          } else if (data.error === "pending") {
            setPendingRef(cleanRef);
            setIsAwaitingSMS(true);
            setIsVerifying(false);
          } else if (data.error === "not_found") {
            // Save as pending in database and wait for phone SMS sync
            const { error: insertError } = await supabase
              .from("gcash_payments")
              .insert({
                reference_number: cleanRef,
                user_id: user.id,
                email: user.email,
                amount: planPrice,
                plan_name: selectedPlan,
                status: "pending"
              });

            if (insertError) {
              console.error("DB insert failed:", insertError);
              setIsVerifying(false);
              setRefError("Failed to register reference number. Please try again.");
            } else {
              setPendingRef(cleanRef);
              setIsAwaitingSMS(true);
              setIsVerifying(false);
            }
          }
        }
      }
    } catch (err) {
      console.error("Live verification catch:", err);
      setIsVerifying(false);
      setRefError("An unexpected error occurred during verification.");
    }
  };

  const planPrice = selectedPlan === "premium_pro" ? 199 : 179;
  const planName = selectedPlan === "premium_pro" ? "Premium Pro" : "Premium Plus";
  const planQR = selectedPlan === "premium_pro" ? "/gcash-pro.png" : "/gcash-plus.png";

  const handleCloseSuccess = () => {
    setIsSuccess(false);
    setGcashMode(false);
    setSelectedPlan(null);
    onClose();
  };

  return (
    <div className={`pricing-modal-overlay${isClosing ? " closing" : ""}`} onClick={onClose}>
      <div 
        className={`pricing-modal-box${isClosing ? " closing" : ""}`} 
        onClick={(e) => e.stopPropagation()}
        style={{
          "--genie-dx": `${dx}px`,
          "--genie-dy": `${dy}px`
        }}
      >
        <button type="button" className="pricing-modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {!gcashMode ? (
          // Plan Grid View
          <div className="pricing-grid-container">
            <div className="pricing-header-section">
              <h2 className="pricing-main-title">Choose the perfect plan for your journey</h2>
              <p className="pricing-subtitle">
                All plans are active for <strong>3 years</strong> upon purchase. No hidden recurring charges.
              </p>
            </div>

            <div className="pricing-cards-wrapper">
              {/* Card 1: Trial / Free */}
              <div className={`pricing-card-col trial-pricing-card ${currentPlan.type === "trial" ? "current-active-card" : ""}`}>
                <div className="pricing-card-inner">
                  <div className="card-visual-header">
                    <div className="glass-shield-outer">
                      <div className="glass-shine"></div>
                      <svg className="shield-icon" viewBox="0 0 24 24" width="32" height="32" fill="none">
                        <defs>
                          <linearGradient id="trialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#e2e8f0" />
                            <stop offset="100%" stopColor="#94a3b8" />
                          </linearGradient>
                        </defs>
                        <circle cx="12" cy="12" r="6" stroke="url(#trialGrad)" strokeWidth="2" />
                        <ellipse cx="12" cy="12" rx="9" ry="3" stroke="url(#trialGrad)" strokeWidth="1.5" transform="rotate(-30 12 12)" />
                      </svg>
                    </div>
                  </div>
                  <div className="card-badge-row">
                    <span className="card-badge badge-gray">Automatic Trial</span>
                  </div>
                  <h3 className="card-title">Premium Pro Trial</h3>
                  <div className="card-price-row">
                    <span className="card-price-amount">30 Days Free</span>
                  </div>
                  <p className="card-desc">
                    Experience full AI analysis capabilities. A diagonal watermark is applied on exports.
                  </p>
                  <ul className="card-features-list">
                    <li>
                      <span className="feature-icon check">✓</span>
                      <span>AI Resume Scorer & Tips</span>
                    </li>
                    <li>
                      <span className="feature-icon check">✓</span>
                      <span>Interactive Bullet Rewriter</span>
                    </li>
                    <li>
                      <span className="feature-icon check">✓</span>
                      <span>LinkedIn Match Metrics</span>
                    </li>
                    <li>
                      <span className="feature-icon alert">!</span>
                      <span className="text-secondary">Watermark on PDF exports</span>
                    </li>
                  </ul>
                  <div className="card-button-row">
                    {currentPlan.type === "trial" ? (
                      <button type="button" className="pricing-card-btn active-plan-btn" disabled>
                        Current Plan ({currentPlan.daysLeft} days left)
                      </button>
                    ) : (
                      <button type="button" className="pricing-card-btn disabled-plan-btn" disabled>
                        Available to New Accounts
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Premium Plus */}
              <div className={`pricing-card-col plus-pricing-card ${currentPlan.type === "premium_plus" ? "current-active-card" : ""}`}>
                <div className="pricing-card-inner">
                  <div className="card-visual-header">
                    <div className="glass-shield-outer">
                      <div className="glass-shine"></div>
                      <svg className="shield-icon" viewBox="0 0 24 24" width="32" height="32" fill="none">
                        <defs>
                          <linearGradient id="plusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fdba74" />
                            <stop offset="100%" stopColor="#f97316" />
                          </linearGradient>
                        </defs>
                        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" stroke="url(#plusGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9 15c2.5-2.5 5.5-3.5 8-3" stroke="url(#plusGrad)" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                  <div className="card-badge-row">
                    <span className="card-badge badge-blue">Generally Available</span>
                  </div>
                  <h3 className="card-title">Premium Plus</h3>
                  <div className="card-price-row">
                    <span className="card-price-amount">₱179</span>
                    <span className="card-price-duration">/ 3 years</span>
                  </div>
                  <p className="card-desc">
                    Perfect for users who have finalized their content and want high-quality exports with zero watermarks.
                  </p>
                  <ul className="card-features-list">
                    <li>
                      <span className="feature-icon check">✓</span>
                      <strong>High-Fidelity PDF Export</strong>
                    </li>
                    <li>
                      <span className="feature-icon check">✓</span>
                      <strong>Zero Watermarks on Output</strong>
                    </li>
                    <li>
                      <span className="feature-icon lock">✕</span>
                      <span className="text-muted">AI Resume Scorer Locked</span>
                    </li>
                    <li>
                      <span className="feature-icon lock">✕</span>
                      <span className="text-muted">Interactive Rewrite Engine Locked</span>
                    </li>
                  </ul>
                  <div className="card-button-row">
                    {currentPlan.type === "premium_plus" ? (
                      <button type="button" className="pricing-card-btn active-plan-btn" disabled>
                        Current Plan
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="pricing-card-btn primary-plan-btn"
                        onClick={() => handleSelectUpgrade("premium_plus")}
                      >
                        {currentPlan.type === "premium_pro" ? "Downgrade to Plus" : "Upgrade to Plus"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 3: Premium Pro */}
              <div className={`pricing-card-col featured-pricing-card ${currentPlan.type === "premium_pro" ? "current-active-card" : ""}`}>
                <div className="pricing-card-inner">
                  <div className="card-visual-header">
                    <div className="glass-shield-outer">
                      <div className="glass-shine"></div>
                      <svg className="shield-icon" viewBox="0 0 24 24" width="32" height="32" fill="none">
                        <defs>
                          <linearGradient id="proGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fef08a" />
                            <stop offset="100%" stopColor="#eab308" />
                          </linearGradient>
                        </defs>
                        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" stroke="url(#proGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3 20h18" stroke="url(#proGrad)" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                  <div className="card-badge-row">
                    <span className="card-badge badge-gold">For Developers & Pros</span>
                  </div>
                  <h3 className="card-title">Premium Pro</h3>
                  <div className="card-price-row">
                    <span className="card-price-amount">₱199</span>
                    <span className="card-price-duration">/ 3 years</span>
                  </div>
                  <p className="card-desc">
                    Unleash the full power of real-time AI scoring, optimization suggestions, and job matching.
                  </p>
                  <ul className="card-features-list">
                    <li>
                      <span className="feature-icon check">✓</span>
                      <strong>High-Fidelity PDF Export</strong>
                    </li>
                    <li>
                      <span className="feature-icon check">✓</span>
                      <strong>Zero Watermarks on Output</strong>
                    </li>
                    <li>
                      <span className="feature-icon check">✓</span>
                      <strong>Full AI Resume Scorer & Analyzer</strong>
                    </li>
                    <li>
                      <span className="feature-icon check">✓</span>
                      <strong>Interactive Bullet Metrics Optimizer</strong>
                    </li>
                    <li>
                      <span className="feature-icon check">✓</span>
                      <strong>LinkedIn Match Recommendations</strong>
                    </li>
                  </ul>
                  <div className="card-button-row">
                    {currentPlan.type === "premium_pro" ? (
                      <button type="button" className="pricing-card-btn active-plan-btn" disabled>
                        Current Plan
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="pricing-card-btn dark-plan-btn"
                        onClick={() => handleSelectUpgrade("premium_pro")}
                      >
                        Upgrade to Pro
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // GCash Checkout View
          <div className="gcash-checkout-panel">
            {isSuccess ? (
              // Success Screen
              <div className="checkout-success-view">
                <div className="success-icon-wrapper">
                  <svg viewBox="0 0 24 24" width="72" height="72">
                    <circle cx="12" cy="12" r="10" fill="#22c55e" />
                    <path
                      d="M8.5 12.5l2.5 2.5 5-5"
                      stroke="#ffffff"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>
                <h3 className="success-title">Payment Verified!</h3>
                <p className="success-message">
                  Thank you! Your account has been upgraded to <strong>{planName}</strong>.
                  Your premium access is valid for 3 years (expires {new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toLocaleDateString()}).
                </p>
                <button type="button" className="success-btn" onClick={handleCloseSuccess}>
                  Start Building
                </button>
              </div>
            ) : isAwaitingSMS ? (
              // Awaiting SMS Gateway Verification Screen
              <div className="checkout-awaiting-sms-view">
                <div className="awaiting-sms-icon-wrapper">
                  <div className="glowing-pulse-loader">
                    <span className="pulse-inner-ring"></span>
                    <span className="pulse-outer-ring"></span>
                    <span className="loader-lock-icon">📱</span>
                  </div>
                </div>
                <h3 className="awaiting-sms-title">Awaiting GCash Confirmation</h3>
                <div className="awaiting-sms-details-box">
                  <div className="sms-detail-row">
                    <span className="sms-d-label">Plan Selected:</span>
                    <span className="sms-d-value">{planName}</span>
                  </div>
                  <div className="sms-detail-row">
                    <span className="sms-d-label">Reference Number:</span>
                    <span className="sms-d-value highlighted-ref">{pendingRef}</span>
                  </div>
                  <div className="sms-detail-row">
                    <span className="sms-d-label">Amount Required:</span>
                    <span className="sms-d-value">₱{planPrice}.00</span>
                  </div>
                </div>
                <p className="awaiting-sms-message">
                  We are waiting for your phone's SMS gateway to sync the GCash receipt for <strong>Ref: {pendingRef}</strong>.
                  This process is automated and usually completes within a few seconds after the SMS arrives.
                </p>
                <div className="awaiting-sms-notice-badge">
                  <span>💡 You can safely close this window. Your premium plan will activate automatically in the background as soon as the SMS is processed.</span>
                </div>
                <div className="awaiting-actions-row">
                  <button type="button" className="awaiting-close-btn" onClick={handleCloseSuccess}>
                    Close and Wait
                  </button>
                  <button type="button" className="awaiting-cancel-btn" onClick={handleCancelPayment}>
                    Cancel & Try Again
                  </button>
                </div>
              </div>
            ) : (
              // Payment QR Scan & Input Screen
              <div className="checkout-form-view">
                <div className="checkout-brand-header">
                  <span className="gcash-logo-text">G) GCash</span>
                  <span className="checkout-title-badge">Secure Payment Gate</span>
                </div>

                <div className="checkout-details-layout">
                  {/* Left Column: QR Code */}
                  <div className="gcash-qr-container">
                    <div className="qr-border-box">
                      <img
                        src={planQR}
                        alt={`GCash QR for ${planName}`}
                        className="gcash-qr-image"
                        onError={(e) => {
                          // Fallback to dynamic qr server if image is missing
                          e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=gcash://to/${DECODED_GCASH_NUMBER}?amount=${planPrice}`;
                        }}
                      />
                    </div>
                    <span className="qr-instructions-sub">Scan to pay exactly ₱{planPrice}</span>
                  </div>

                  {/* Right Column: Transaction Info & Reference Gate */}
                  <div className="gcash-info-container">
                    <h3 className="billing-title">Transfer Details</h3>

                    <div className="billing-rows">
                      <div className="billing-row">
                        <span className="b-label">Payee Recipient</span>
                        <span className="b-value">NE*** M.</span>
                      </div>
                      <div className="billing-row">
                        <span className="b-label">GCash Account</span>
                        <span className="b-value">{DECODED_GCASH_NUMBER.substring(0, 4)} *** {DECODED_GCASH_NUMBER.substring(7)}</span>
                      </div>
                      <div className="billing-row">
                        <span className="b-label">Amount Due</span>
                        <span className="b-value price-total">₱{planPrice}.00</span>
                      </div>
                      <div className="billing-row">
                        <span className="b-label">Validity Period</span>
                        <span className="b-value">3 Years</span>
                      </div>
                    </div>

                    <form onSubmit={handleVerifyPayment} className="ref-number-form">
                      <label htmlFor="ref-input" className="ref-label">
                        Enter 13-Digit GCash Reference Number
                      </label>
                      <input
                        id="ref-input"
                        type="text"
                        className={`ref-input-field ${refError ? "input-error" : ""}`}
                        placeholder="e.g. 5012 3456 78901"
                        maxLength="17"
                        value={refNumber}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^[0-9\s]*$/.test(val)) {
                            setRefNumber(val);
                          }
                          if (refError) setRefError("");
                        }}
                        disabled={isVerifying}
                        required
                      />

                      {refError && <div className="ref-error-message">{refError}</div>}

                      {!dbTableExists && (
                        <div className="dev-simulation-banner">
                          <span className="dev-banner-icon">⚙️</span>
                          <span className="dev-banner-text">
                            <strong>Developer Notice:</strong> Operating in <strong>Simulation Mode</strong>. Create the Supabase `gcash_payments` table to enable live SMS gateway verification.
                          </span>
                        </div>
                      )}

                      <div className="checkout-action-buttons">
                        <button
                          type="submit"
                          className="gcash-action-btn submit-payment-btn"
                          disabled={isVerifying}
                        >
                          {isVerifying ? (
                            <span className="checkout-spinner-row">
                              <span className="spinner-dot"></span>
                              Verifying with GCash...
                            </span>
                          ) : (
                            "Verify & Activate Plan"
                          )}
                        </button>
                        <button
                          type="button"
                          className="gcash-action-btn cancel-payment-btn"
                          onClick={handleCancelPayment}
                          disabled={isVerifying}
                        >
                          Go Back
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
