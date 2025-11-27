// src/pages/ManagerEvents.jsx
import { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Trash2,
  Edit2,
  Award,
  UserPlus,
} from "lucide-react";
import {
  fetchEvents,
  fetchEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  addOrganizer,
  addGuestToEvent,
  removeGuestFromEvent,
  awardEventPoints,
  fetchOrganizerEvents,
  fetchMe,
  removeOrganizerFromEvent,
} from "../lib/events";
import "../styles/ManagerEvents.css";
import { toast } from "sonner";

export default function ManagerEvents() {
  const [events, setEvents] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 8;

  const [selectedId, setSelectedId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [loadingRole, setLoadingRole] = useState(true);
  const [role, setRole] = useState(null);

  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  // create form state (manager/superuser only)
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    location: "",
    startTime: "",
    endTime: "",
    capacity: "",
    points: "",
  });

  // edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    location: "",
    startTime: "",
    endTime: "",
    capacity: "",
    points: "",
  });

  // organizer form (manager/superuser only)
  const [organizerUtorid, setOrganizerUtorid] = useState("");

  // guest form (both)
  const [guestUtorid, setGuestUtorid] = useState("");

  // award points form (both)
  const [awardForm, setAwardForm] = useState({
    utorid: "",
    amount: "",
    remark: "",
  });

  const totalPages = Math.max(1, Math.ceil(count / limit));

  const isManagerOrSuper = role === "manager" || role === "superuser";
  const isOrganizerOnly = role === "organizer";

  // ---------- load current user's role ----------
  useEffect(() => {
    async function loadRole() {
      try {
        setLoadingRole(true);
        const me = await fetchMe(); // GET /users/me
        setRole(me.role); // "regular", "organizer", "cashier", "manager", "superuser"
      } catch (e) {
        setError(e.message || "Failed to load current user");
      } finally {
        setLoadingRole(false);
      }
    }

    loadRole();
  }, []);

  // ---------- load list ----------
  useEffect(() => {
    if (loadingRole) return; 

    async function loadList() {
      try {
        setLoadingList(true);
        setError("");

        if (isManagerOrSuper) {
          // managers + superusers see ALL events
          const data = await fetchEvents({
            page,
            limit,
            showFull: true,
          });
          setEvents(data.results || []);
          setCount(data.count || 0);

          if (!selectedId && data.results && data.results.length > 0) {
            setSelectedId(data.results[0].id);
          }
        } else if (true) { // always true. Regular user with no organized events will not see the nav link to this page
          // organizers see ONLY their assigned events
          const data = await fetchOrganizerEvents(); // { isOrganizer, events }
          const evts = data.events || [];
          setEvents(evts);
          setCount(evts.length);

          if (!selectedId && evts.length > 0) {
            setSelectedId(evts[0].id);
          }
        } else {
          // other roles shouldn't reach here because navbar guards access, but be safe
          setEvents([]);
          setCount(0);
        }
      } catch (e) {
        setError(e.message || "Failed to load events");
        setEvents([]);
        setCount(0);
      } finally {
        setLoadingList(false);
      }
    }

    loadList();
  }, [page, loadingRole, isManagerOrSuper, isOrganizerOnly]);

  // ---------- load selected detail ----------
  useEffect(() => {
    if (!selectedId) {
      setSelectedEvent(null);
      return;
    }

    async function loadDetail() {
      try {
        setLoadingDetail(true);
        const data = await fetchEventById(selectedId); // GET /events/:id
        setSelectedEvent(data);
        setEditForm({
          name: data.name || "",
          description: data.description || "",
          location: data.location || "",
          startTime: data.startTime ? data.startTime.slice(0, 16) : "",
          endTime: data.endTime ? data.endTime.slice(0, 16) : "",
          capacity:
            data.capacity === null || data.capacity === undefined
              ? ""
              : String(data.capacity),
          points:
            data.pointsRemain || data.pointsAwarded
              ? String((data.pointsRemain || 0) + (data.pointsAwarded || 0))
              : "",
        });
      } catch (e) {
        toast.error(e.message || "Failed to load event detail");
        setSelectedEvent(null);
      } finally {
        setLoadingDetail(false);
      }
    }

    loadDetail();
  }, [selectedId]);
  

  // ---------------- handlers: create event (manager/superuser only) ----------------
  const handleCreateChange = (field, value) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!isManagerOrSuper) return;

    try {
      const payload = {
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        location: createForm.location.trim(),
        startTime: createForm.startTime,
        endTime: createForm.endTime,
        capacity: createForm.capacity ? Number(createForm.capacity) : null,
        points: Number(createForm.points),
      };

      const created = await createEvent(payload);
      toast.success(`Event "${created.name}" created`);

      setCreateForm({
        name: "",
        description: "",
        location: "",
        startTime: "",
        endTime: "",
        capacity: "",
        points: "",
      });

      setSelectedId(created.id);
      setPage(1); // reload list from first page
    } catch (e) {
      toast.error(e.message || "Failed to create event");
    }
  };

  // ---------------- handlers: update event ----------------
  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;
    const eventId = selectedEvent.id;

    const payload = {};
    if (editForm.name.trim() !== selectedEvent.name) {
      payload.name = editForm.name.trim();
    }
    if (editForm.description.trim() !== selectedEvent.description) {
      payload.description = editForm.description.trim();
    }
    if (editForm.location.trim() !== selectedEvent.location) {
      payload.location = editForm.location.trim();
    }
    if (
      editForm.startTime &&
      editForm.startTime !== selectedEvent.startTime?.slice(0, 16)
    ) {
      payload.startTime = new Date(editForm.startTime).toISOString();
    }
    if (
      editForm.endTime &&
      editForm.endTime !== selectedEvent.endTime?.slice(0, 16)
    ) {
      payload.endTime = new Date(editForm.endTime).toISOString();
    }
    if (
      editForm.capacity !== "" &&
      Number(editForm.capacity) !== selectedEvent.capacity
    ) {
      payload.capacity = Number(editForm.capacity);
    }

    // Only manager/superuser can change points
    if (
      isManagerOrSuper &&
      editForm.points &&
      Number(editForm.points) > 0
    ) {
      payload.points = Number(editForm.points);
    }

    if (Object.keys(payload).length === 0) {
      toast.info("No changes to save");
      return;
    }

    try {
      const updated = await updateEvent(eventId, payload);
      toast.success(`Event "${updated.name}" updated`);

      setSelectedId(eventId);
      setEvents((prev) =>
        prev.map((ev) => (ev.id === eventId ? { ...ev, ...updated } : ev))
      );
    } catch (e) {
      toast.error(e.message || "Failed to update event");
    }
  };

  // ---------------- handlers: publish event (manager/superuser only) ----------------
  const handlePublishEvent = async () => {
    if (!isManagerOrSuper) return; // organizers cannot publish
    if (!selectedEvent || selectedEvent.published) return;

    try {
      setPublishing(true);
      const updated = await updateEvent(selectedEvent.id, { published: true });
      toast.success(`"${updated.name}" is now published`);

      setSelectedEvent((prev) =>
        prev ? { ...prev, published: true } : prev
      );
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === selectedEvent.id ? { ...ev, published: true } : ev
        )
      );
    } catch (e) {
      toast.error(e.message || "Failed to publish event");
    } finally {
      setPublishing(false);
    }
  };

  // ---------------- handlers: delete event (manager/superuser only) ----------------
  const handleDeleteEvent = async () => {
    if (!isManagerOrSuper) return;
    if (!selectedEvent) return;
    const eventId = selectedEvent.id;

    if (!window.confirm("Delete this event? This cannot be undone.")) return;

    try {
      await deleteEvent(eventId);
      toast.success("Event deleted");
      setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
      setCount((c) => Math.max(0, c - 1));
      setSelectedEvent(null);
      setSelectedId(null);
    } catch (e) {
      toast.error(e.message || "Failed to delete event");
    }
  };

  // ---------------- handlers: organizers (manager/superuser only) ----------------
  const handleAddOrganizer = async (e) => {
    e.preventDefault();
    if (!isManagerOrSuper) return;
    if (!selectedEvent || !organizerUtorid.trim()) return;

    try {
      await addOrganizer(selectedEvent.id, organizerUtorid.trim());
      toast.success(`Organizer ${organizerUtorid.trim()} added`);
      setOrganizerUtorid("");
      setSelectedId(selectedEvent.id); // reload detail
    } catch (e) {
      toast.error(e.message || "Failed to add organizer");
    }
  };

  const handleRemoveOrganizer = async (userId) => {
    if (!isManagerOrSuper) return;    // organizers can't remove
    if (!selectedEvent) return;

    if (!window.confirm("Remove this organizer from the event?")) return;

    try {
        await removeOrganizerFromEvent(selectedEvent.id, userId);
        toast.success("Organizer removed");

        // update local state so UI reflects change immediately
        setSelectedEvent((prev) =>
        prev
            ? {
                ...prev,
                organizers: (prev.organizers || []).filter(
                (o) => o.id !== userId
                ),
            }
            : prev
        );

        // also keep list in sync if you show organizers there later
        // (optional, currently not needed for list)
    } catch (e) {
        toast.error(e.message || "Failed to remove organizer");
    }
 };

  // ---------------- handlers: guests (both roles) ----------------
  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !guestUtorid.trim()) return;

    try {
      await addGuestToEvent(selectedEvent.id, guestUtorid.trim());
      toast.success(`Guest ${guestUtorid.trim()} added`);
      setGuestUtorid("");
      setSelectedId(selectedEvent.id);
    } catch (e) {
      toast.error(e.message || "Failed to add guest");
    }
  };

  const handleRemoveGuest = async (userId) => {
    if (!selectedEvent) return;
    if (!window.confirm("Remove this guest from the event?")) return;

    try {
      await removeGuestFromEvent(selectedEvent.id, userId);
      toast.success("Guest removed");
      setSelectedId(selectedEvent.id);
    } catch (e) {
      toast.error(e.message || "Failed to remove guest");
    }
  };

  // ---------------- handlers: award points (both roles) ----------------
  const handleAwardPoints = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;
    if (!awardForm.amount) {
      toast.error("Amount is required");
      return;
    }

    try {
      await awardEventPoints(selectedEvent.id, {
        utorid: awardForm.utorid.trim() || undefined,
        amount: Number(awardForm.amount),
        remark: awardForm.remark.trim() || undefined,
      });
      toast.success("Points awarded");
      setAwardForm({ utorid: "", amount: "", remark: "" });
      setSelectedId(selectedEvent.id);
    } catch (e) {
      toast.error(e.message || "Failed to award points");
    }
  };

  // ----- helpers -----
  const getAttendanceInfo = () => {
    if (!selectedEvent) return { text: "", percent: 0 };
    const numGuests =
      selectedEvent.guests?.length ?? selectedEvent.numGuests ?? 0;
    const capacity = selectedEvent.capacity ?? 0;
    if (!capacity) {
      return { text: `${numGuests} attending`, percent: 0 };
    }
    let pct = Math.round((numGuests / capacity) * 100);
    if (pct === 0 && numGuests > 0) pct = 1; // tiny bar if > 0
    return {
      text: `${numGuests} / ${capacity} attending`,
      percent: pct,
    };
  };

  const { text: attendanceText, percent: attendancePercent } =
    getAttendanceInfo();

  return (
    <div className="manager-page">
      <header className="manager-header">
        <div>
          <h1>
            {isManagerOrSuper ? "Event Management" : "My Organized Events"}
          </h1>
          <p>
            {isManagerOrSuper
              ? "Managers & superusers can create, update, and control events here."
              : "Update your assigned events, manage guests, and award points."}
          </p>
        </div>
      </header>

      {error && <p className="manager-error">{error}</p>}

      <div className="manager-layout">
        {/* LEFT: create (manager only) + event list */}
        <section className="manager-left">
          {isManagerOrSuper && (
            <div className="manager-card manager-create-card">
              <h2>
                <Plus className="manager-card-icon" /> Create New Event
              </h2>
              <form className="manager-form" onSubmit={handleCreateSubmit}>
                <label>
                  Name
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) =>
                      handleCreateChange("name", e.target.value)
                    }
                    required
                  />
                </label>
                <label>
                  Description
                  <textarea
                    value={createForm.description}
                    onChange={(e) =>
                      handleCreateChange("description", e.target.value)
                    }
                    rows={2}
                  />
                </label>
                <label>
                  Location
                  <input
                    type="text"
                    value={createForm.location}
                    onChange={(e) =>
                      handleCreateChange("location", e.target.value)
                    }
                    required
                  />
                </label>
                <div className="manager-form-row">
                  <label>
                    Start
                    <input
                      type="datetime-local"
                      value={createForm.startTime}
                      onChange={(e) =>
                        handleCreateChange("startTime", e.target.value)
                      }
                      required
                    />
                  </label>
                  <label>
                    End
                    <input
                      type="datetime-local"
                      value={createForm.endTime}
                      onChange={(e) =>
                        handleCreateChange("endTime", e.target.value)
                      }
                      required
                    />
                  </label>
                </div>
                <div className="manager-form-row">
                  <label>
                    Capacity (optional)
                    <input
                      type="number"
                      min="1"
                      value={createForm.capacity}
                      onChange={(e) =>
                        handleCreateChange("capacity", e.target.value)
                      }
                      placeholder="leave empty = unlimited"
                    />
                  </label>
                  <label>
                    Total points
                    <input
                      type="number"
                      min="1"
                      value={createForm.points}
                      onChange={(e) =>
                        handleCreateChange("points", e.target.value)
                      }
                      required
                    />
                  </label>
                </div>

                <button type="submit" className="manager-primary-btn">
                  <Plus size={16} /> Create Event
                </button>
              </form>
            </div>
          )}

          <div className="manager-card manager-events-list-card">
            <div className="manager-card-header-row">
              <h2>{isManagerOrSuper ? "All Events" : "My Events"}</h2>
              <span className="manager-chip">{count} total</span>
            </div>

            {loadingList || loadingRole ? (
              <p className="manager-muted">Loading events…</p>
            ) : events.length === 0 ? (
              <p className="manager-muted">No events.</p>
            ) : (
              <ul className="manager-events-list">
                {events.map((ev) => (
                  <li
                    key={ev.id}
                    className={
                      "manager-event-row" +
                      (ev.id === selectedId ? " manager-event-row-active" : "")
                    }
                    onClick={() => setSelectedId(ev.id)}
                  >
                    <div className="manager-event-row-main">
                      <span className="manager-event-row-title">
                        {ev.name}
                      </span>
                      <span className="manager-event-row-sub">
                        {ev.location} •{" "}
                        {new Date(ev.startTime).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="manager-tag">
                      {ev.published ? "Published" : "Draft"}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="manager-pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || !isManagerOrSuper}
              >
                Prev
              </button>
              <span>
                Page <strong>{isManagerOrSuper ? page : 1}</strong> of{" "}
                <strong>{isManagerOrSuper ? totalPages : 1}</strong>
              </span>
              <button
                onClick={() =>
                  setPage((p) => (p < totalPages ? p + 1 : p))
                }
                disabled={page >= totalPages || !isManagerOrSuper}
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT: selected event management */}
        <section className="manager-right">
          {!selectedEvent || loadingDetail ? (
            <div className="manager-card">
              <p className="manager-muted">
                {loadingDetail
                  ? "Loading event…"
                  : "Select an event from the left to manage it."}
              </p>
            </div>
          ) : (
            <>
              <div className="manager-card manager-event-summary-card">
                <div className="manager-event-summary-top">
                  <div>
                    <h2>{selectedEvent.name}</h2>
                    <p className="manager-muted">
                      ID #{selectedEvent.id} •{" "}
                      {selectedEvent.published ? "Published" : "Not published"}
                    </p>
                  </div>

                  {isManagerOrSuper && (
                    <button
                      type="button"
                      className="manager-danger-btn"
                      onClick={handleDeleteEvent}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  )}
                </div>

                <div className="manager-event-summary-grid">
                  <div className="manager-summary-item">
                    <Calendar className="manager-summary-icon" />
                    <div>
                      <p className="manager-summary-label">When</p>
                      <p className="manager-summary-main">
                        {new Date(
                          selectedEvent.startTime
                        ).toLocaleString()}{" "}
                        –{" "}
                        {new Date(
                          selectedEvent.endTime
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="manager-summary-item">
                    <MapPin className="manager-summary-icon" />
                    <div>
                      <p className="manager-summary-label">Location</p>
                      <p className="manager-summary-main">
                        {selectedEvent.location}
                      </p>
                    </div>
                  </div>
                  <div className="manager-summary-item">
                    <Users className="manager-summary-icon" />
                    <div>
                      <p className="manager-summary-label">Attendance</p>
                      <p className="manager-summary-main">
                        {attendanceText}
                      </p>
                      {selectedEvent.capacity && (
                        <div className="manager-progress-bar">
                          <div
                            className="manager-progress-fill"
                            style={{ width: `${attendancePercent}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="manager-summary-item">
                    <Award className="manager-summary-icon" />
                    <div>
                      <p className="manager-summary-label">Points</p>
                      <p className="manager-summary-main">
                        Remain: {selectedEvent.pointsRemain} • Awarded:{" "}
                        {selectedEvent.pointsAwarded}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit event */}
              <div className="manager-card manager-edit-card">
                <h2>
                  <Edit2 className="manager-card-icon" /> Update Event
                </h2>
                <form className="manager-form" onSubmit={handleUpdateEvent}>
                  <label>
                    Name
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        handleEditChange("name", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Description
                    <textarea
                      value={editForm.description}
                      onChange={(e) =>
                        handleEditChange("description", e.target.value)
                      }
                      rows={2}
                    />
                  </label>
                  <label>
                    Location
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) =>
                        handleEditChange("location", e.target.value)
                      }
                    />
                  </label>
                  <div className="manager-form-row">
                    <label>
                      Start
                      <input
                        type="datetime-local"
                        value={editForm.startTime}
                        onChange={(e) =>
                          handleEditChange("startTime", e.target.value)
                        }
                      />
                    </label>
                    <label>
                      End
                      <input
                        type="datetime-local"
                        value={editForm.endTime}
                        onChange={(e) =>
                          handleEditChange("endTime", e.target.value)
                        }
                      />
                    </label>
                  </div>

                  {isManagerOrSuper ? (
                    <div className="manager-form-row">
                      <label>
                        Capacity
                        <input
                          type="number"
                          min="1"
                          value={editForm.capacity}
                          onChange={(e) =>
                            handleEditChange("capacity", e.target.value)
                          }
                        />
                      </label>
                      <label>
                        Total points
                        <input
                          type="number"
                          min="1"
                          value={editForm.points}
                          onChange={(e) =>
                            handleEditChange("points", e.target.value)
                          }
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="manager-form-row">
                      <label>
                        Capacity
                        <input
                          type="number"
                          min="1"
                          value={editForm.capacity}
                          onChange={(e) =>
                            handleEditChange("capacity", e.target.value)
                          }
                        />
                      </label>
                    </div>
                  )}

                  <div className="manager-edit-actions">
                    <button type="submit" className="manager-primary-btn">
                      <Edit2 size={16} /> Save Changes
                    </button>

                    {isManagerOrSuper && (
                      <button
                        type="button"
                        className={
                          "manager-publish-btn" +
                          (selectedEvent.published
                            ? " manager-publish-btn-disabled"
                            : "")
                        }
                        onClick={handlePublishEvent}
                        disabled={selectedEvent.published || publishing}
                      >
                        {selectedEvent.published
                          ? "Published"
                          : publishing
                          ? "Publishing…"
                          : "Publish Event"}
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Organizers / Guests / Award points */}
              <div className="manager-bottom-grid">
                {/* Organizers: manager/superuser only for edit; organizers can still see list */}
                {isManagerOrSuper && (
                <div className="manager-card manager-small-card">
                    <h2>
                    <UserPlus className="manager-card-icon" /> Organizers
                    </h2>
                    <form
                    className="manager-inline-form"
                    onSubmit={handleAddOrganizer}
                    >
                    <input
                        type="text"
                        placeholder="utorid"
                        value={organizerUtorid}
                        onChange={(e) => setOrganizerUtorid(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="manager-secondary-btn"
                    >
                        Add
                    </button>
                    </form>
                    <ul className="manager-people-list">
                    {selectedEvent.organizers?.length ? (
                        selectedEvent.organizers.map((o) => (
                        <li key={o.id}>
                            <div>
                            <span className="manager-person-main">{o.name}</span>
                            <span className="manager-person-sub">{o.utorid}</span>
                            </div>
                            {/* remove button only for manager/superuser */}
                            <button
                            type="button"
                            className="manager-icon-btn"
                            onClick={() => handleRemoveOrganizer(o.id)}
                            >
                            <Trash2 size={14} />
                            </button>
                        </li>
                        ))
                    ) : (
                        <li className="manager-muted">No organizers yet.</li>
                    )}
                    </ul>
                </div>
                )}

                {/* Guests: both roles */}
                <div className="manager-card manager-small-card">
                  <h2>
                    <Users className="manager-card-icon" /> Guests
                  </h2>
                  <form
                    className="manager-inline-form"
                    onSubmit={handleAddGuest}
                  >
                    <input
                      type="text"
                      placeholder="utorid"
                      value={guestUtorid}
                      onChange={(e) => setGuestUtorid(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="manager-secondary-btn"
                    >
                      Add
                    </button>
                  </form>
                  <ul className="manager-people-list">
                    {selectedEvent.guests?.length ? (
                      selectedEvent.guests.map((g) => (
                        <li key={g.id}>
                          <div>
                            <span className="manager-person-main">
                              {g.name}
                            </span>
                            <span className="manager-person-sub">
                              {g.utorid}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="manager-icon-btn"
                            onClick={() => handleRemoveGuest(g.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="manager-muted">No guests yet.</li>
                    )}
                  </ul>
                </div>

                {/* Award points: both roles */}
                <div className="manager-card manager-small-card">
                  <h2>
                    <Award className="manager-card-icon" /> Award Points
                  </h2>
                  <p className="manager-muted">
                    Leave utorid empty to award to <strong>all</strong>{" "}
                    guests.
                  </p>
                  <form className="manager-form" onSubmit={handleAwardPoints}>
                    <label>
                      utorid (optional, single guest)
                      <input
                        type="text"
                        value={awardForm.utorid}
                        onChange={(e) =>
                          setAwardForm((prev) => ({
                            ...prev,
                            utorid: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <div className="manager-form-row">
                      <label>
                        Amount (points)
                        <input
                          type="number"
                          min="1"
                          value={awardForm.amount}
                          onChange={(e) =>
                            setAwardForm((prev) => ({
                              ...prev,
                              amount: e.target.value,
                            }))
                          }
                          required
                        />
                      </label>
                    </div>
                    <label>
                      Remark (optional)
                      <input
                        type="text"
                        value={awardForm.remark}
                        onChange={(e) =>
                          setAwardForm((prev) => ({
                            ...prev,
                            remark: e.target.value,
                          }))
                        }
                      />
                    </label>

                    <button type="submit" className="manager-primary-btn">
                      <Award size={16} /> Award Points
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
