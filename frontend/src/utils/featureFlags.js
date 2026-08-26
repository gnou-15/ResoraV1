/**
 * Feature Flags Manager for Resora
 * Allows progressive rollout and safe toggling of features in production.
 */

const DEFAULT_FLAGS = {
  ENABLE_GROQ_AI_PARSER: true,
  ENABLE_NEUMORPHIC_CARDS: true,
  ENABLE_PARSING_CHUNKING_MODAL: true,
  ENABLE_CONFIRM_COUNTDOWN: true,
  ENABLE_EXPERIMENTAL_MODELS: false,
};

export function isFeatureEnabled(flagName) {
  if (!flagName) return false;

  // 1. Check local storage override (useful for dev testing)
  try {
    const localOverride = localStorage.getItem(`resora_ff_${flagName}`);
    if (localOverride !== null) {
      return localOverride === "true";
    }
  } catch {
    // ignore
  }

  // 2. Check Vite environment variable override (e.g. VITE_FEATURE_ENABLE_GROQ_AI_PARSER=true)
  const envKey = `VITE_FEATURE_${flagName}`;
  if (import.meta.env[envKey] !== undefined) {
    return import.meta.env[envKey] === "true";
  }

  // 3. Fallback to default flags
  return DEFAULT_FLAGS[flagName] ?? false;
}

export function getAllFeatureFlags() {
  const flags = {};
  for (const key of Object.keys(DEFAULT_FLAGS)) {
    flags[key] = isFeatureEnabled(key);
  }
  return flags;
}
