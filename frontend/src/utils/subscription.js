export function getUserPlan(user) {
  if (!user) {
    return {
      type: "none",
      name: "No Plan",
      isActive: false,
      hasAI: false,
      hasExport: false,
      hasWatermark: false,
      daysLeft: 0,
    };
  }

  const metadata = user.user_metadata || {};
  const plan = metadata.plan; // 'premium_plus' | 'premium_pro'
  const expiryStr = metadata.plan_expiry;

  if (plan === "premium_pro" || plan === "premium_plus") {
    return {
      type: plan,
      name: plan === "premium_pro" ? "Premium Pro" : "Premium Plus",
      isActive: true,
      hasAI: plan === "premium_pro",
      hasExport: true,
      hasWatermark: false,
      expiryDate: null,
      daysLeft: 999999,
    };
  }

  // Fallback to 30-day automatic premium trial for new users
  // We use user.created_at, with a fallback in case metadata is loading
  const createdAt = new Date(user.created_at || Date.now()).getTime();
  const trialExpiry = createdAt + 30 * 24 * 60 * 60 * 1000;
  if (Date.now() < trialExpiry) {
    return {
      type: "trial",
      name: "Premium Pro Trial",
      isActive: true,
      hasAI: true,
      hasExport: true,
      hasWatermark: true,
      expiryDate: new Date(trialExpiry).toISOString(),
      daysLeft: Math.max(0, Math.ceil((trialExpiry - Date.now()) / (24 * 60 * 60 * 1000))),
    };
  }

  // Expired state
  return {
    type: "expired",
    name: "Trial Expired",
    isActive: false,
    hasAI: false,
    hasExport: false,
    hasWatermark: false,
    daysLeft: 0,
  };
}
