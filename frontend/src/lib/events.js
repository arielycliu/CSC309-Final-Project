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

// --- event management ---
export async function createEvent(payload) {
  const res = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `POST /events failed: ${res.status}`);
  }
  return data; // created event
}

export async function updateEvent(eventId, payload) {
  const res = await fetch(`${API_BASE}/events/${eventId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `PATCH /events/${eventId} failed: ${res.status}`);
  }
  return data;
}

export async function deleteEvent(eventId) {
  const res = await fetch(`${API_BASE}/events/${eventId}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!res.ok && res.status !== 204) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `DELETE /events/${eventId} failed: ${res.status}`);
  }
}

// --- organizer management ---
export async function addOrganizer(eventId, utorid) {
  const res = await fetch(`${API_BASE}/events/${eventId}/organizers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ utorid }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `POST /events/${eventId}/organizers failed: ${res.status}`);
  }
  return data;
}

// --- guests (manager route, not /me) ---
export async function addGuestToEvent(eventId, utorid) {
  const res = await fetch(`${API_BASE}/events/${eventId}/guests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ utorid }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `POST /events/${eventId}/guests failed: ${res.status}`);
  }
  return data;
}

export async function removeGuestFromEvent(eventId, userId) {
  const res = await fetch(`${API_BASE}/events/${eventId}/guests/${userId}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!res.ok && res.status !== 204) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      data.error || `DELETE /events/${eventId}/guests/${userId} failed: ${res.status}`
    );
  }
}

// --- award points ---
export async function awardEventPoints(eventId, { utorid, amount, remark }) {
  const body = {
    type: "event",
    amount: Number(amount),
  };
  if (utorid) body.utorid = utorid;
  if (remark) body.remark = remark;

  const res = await fetch(`${API_BASE}/events/${eventId}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data.error ||
        `POST /events/${eventId}/transactions (award points) failed: ${res.status}`
    );
  }
  return data;
}

export async function fetchOrganizerEvents() {
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


export async function fetchMe() {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  let body = {};
  try {
    body = await res.json();
  } catch {
    body = {};
  }

  if (!res.ok) {
    const msg = body.error || `GET /users/me failed with status ${res.status}`;
    throw new Error(msg);
  }

  return body; // { id, utorid, name, role, ... }
}

export async function removeOrganizerFromEvent(eventId, userId) {
  const res = await fetch(
    `${API_BASE}/events/${eventId}/organizers/${userId}`,
    {
      method: "DELETE",
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  if (!res.ok && res.status !== 204) {
    let msg = `DELETE /events/${eventId}/organizers/${userId} failed: ${res.status}`;
    try {
      const body = await res.json();
      if (body && body.error) msg = body.error;
    } catch {
      // 111
    }
    throw new Error(msg);
  }
}