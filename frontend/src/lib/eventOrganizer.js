import { API_BASE, getAuthHeaders } from "./AuthGetter";

export async function fetchMyOrganizerEvents() {
  const res = await fetch(`${API_BASE}/users/me/organizer-events`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = body?.error || `GET /users/me/organizer-events failed: ${res.status}`;
    throw new Error(msg);
  }

  return body; // { isOrganizer, events }
}
