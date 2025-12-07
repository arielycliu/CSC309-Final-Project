export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}
