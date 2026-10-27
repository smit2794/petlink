/**
 * Single source of truth for the public-facing base URL used in QR codes.
 *
 * Priority:
 *  1. VITE_PUBLIC_URL environment variable (set in frontend/.env)
 *  2. Current browser origin (window.location.origin)
 *
 * Every component that generates or displays a QR scan URL must import
 * this helper instead of rolling its own resolution logic.
 */
export const getPublicBaseUrl = () => {
  // 1. Env var takes absolute priority
  if (import.meta.env.VITE_PUBLIC_URL) {
    return import.meta.env.VITE_PUBLIC_URL.replace(/\/+$/, ""); // strip trailing slash
  }

  // 2. Fallback to production public domain
  return "https://petlink-pddx.onrender.com";
};

/**
 * Build the full scan URL for a given token / scan ID.
 */
export const getScanUrl = (scanId) => `${getPublicBaseUrl()}/scan/${scanId}`;
