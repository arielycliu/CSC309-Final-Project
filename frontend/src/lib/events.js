import { API_BASE, getAuthHeaders } from "./AuthGetter";

async function handleJsonResponse(res, fallbackMsg) {
  let body = null;
  try {
    body = await res.json();        // may fail e.g. 204
  } catch {
    body = null;
  }

  if (!res.ok) {
    const msg =
      body?.error ||
      body?.message ||
      `${fallbackMsg} (status ${res.status})`;

    const err = new Error(msg);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}

export async function fetchEvents(params = {}) {
  const qs = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      qs.append(key, String(value));
    }
  });

  const res = await fetch(`${API_BASE}/events?${qs.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  return handleJsonResponse(res, `GET /events failed`);
}

export async function fetchEventById(eventId) {
  const res = await fetch(`${API_BASE}/events/${eventId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });


  return handleJsonResponse(res, `GET /events/${eventId} failed`);
}

export async function rsvpMe(eventId) {
  const res = await fetch(`${API_BASE}/events/${eventId}/guests/me`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

//   if (!res.ok) {
//     throw new Error(`POST /events/${eventId}/guests/me failed: ${res.status}`);
//   }

//   return res.json();

  return handleJsonResponse(res, `POST /events/${eventId}/guests/me failed`);
}

export async function unRsvpMe(eventId) {
  const res = await fetch(`${API_BASE}/events/${eventId}/guests/me`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  return handleJsonResponse(res, `DELETE /events/${eventId}/guests/me failed`);
}
