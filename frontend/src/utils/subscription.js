/**
 * getUserPlan — all features are free and unlocked for every signed-in user.
 */
export function getUserPlan(user) {
  return {
    type: "free",
    name: "Free",
    isActive: true,
    hasAI: true,
    hasExport: true,
    hasWatermark: false,
    daysLeft: 999999,
  };
}
