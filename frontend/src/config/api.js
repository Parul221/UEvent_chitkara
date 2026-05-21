export const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
export const API_URL = `${API_BASE}/api`;
export const WS_URL =
  import.meta.env.VITE_BACKEND_WS_URL || API_BASE.replace(/^http/, "ws");
