import { useEffect, useState } from "react";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/Events.css";
import { fetchEvents } from "../lib/events";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [limit, setLimit] = useState(9); // control of limit

  // filters
  const [orderBy, setOrderBy] = useState("start-asc"); // "start-asc" | "start-desc" | "name-asc"
  const [capacityFilter, setCapacityFilter] = useState("all"); // "all" | "not-full" | "full"

  const [endFilter, setEndFilter] = useState("all");   


  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setErr("");

        const data = await fetchEvents({
          page,
          limit,
          showFull: capacityFilter === "all",
        });

        setEvents(data.results || []);
        setCount(data.count || 0);
      } catch (e) {
        setErr(e.message || "Failed to load events");
        setEvents([]);
        setCount(0);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [page, limit]);

  const totalPages = Math.max(1, Math.ceil(count / limit));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  // ---------- sorting ----------

  const filteredEvents = events.filter((event) => {
    const now = new Date();
    // filter by status
    if (endFilter !== "all") {
    const hasEnd = !!event.endTime;
    const isEnded = hasEnd ? new Date(event.endTime) < now : false;

    if (endFilter === "not-ended" && isEnded) {
      return false; 
    }
    if (endFilter === "ended" && !isEnded) {
      return false; 
    }
  }

    if (capacityFilter === "all") return true;

    const capacity = event.capacity;
    const numGuests = event.numGuests ?? 0;

    // If there is no capacity, treat as "not full" <=> capacity is not specified during event creation
    const isFull =
      capacity != null && typeof capacity === "number"
        ? numGuests >= capacity
        : false;

    if (capacityFilter === "full") return isFull;
    if (capacityFilter === "not-full") return !isFull;

    return true;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = a.startTime ? new Date(a.startTime).getTime() : 0;
    const dateB = b.startTime ? new Date(b.startTime).getTime() : 0;

    switch (orderBy) {
      case "start-desc":
        return dateB - dateA; // latest first
      case "name-asc":
        return (a.name || "").localeCompare(b.name || "");
      case "start-asc":
      default:
        return dateA - dateB; // earliest first
    }
  });

  return (
    <div className="events-page">
      <header className="events-header">
        <h1>Events</h1>
        <p>Browse and RSVP to upcoming events</p>
      </header>

      {/* Filter bar */}
      <section className="events-filters">
        <div className="events-filter-group">
          <label htmlFor="events-order" className="events-filter-label">
            Order By
          </label>
          <select
            id="events-order"
            className="events-filter-select"
            value={orderBy}
            onChange={(e) => {
              setOrderBy(e.target.value);
              setPage(1); // reset pagination
            }}
          >
            <option value="start-asc">Start time (earliest first)</option>
            <option value="start-desc">Start time (latest first)</option>
            <option value="name-asc">Name (A → Z)</option>
          </select>
        </div>

        <div className="events-filter-group">
          <label htmlFor="events-status" className="events-filter-label">
            Status
          </label>
          <select
            id="events-status"
            className="events-filter-select"
            value={endFilter}
            onChange={(e) => {
              setEndFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All</option>
            <option value="not-ended">Active (not ended)</option>
            <option value="ended">Ended</option>
          </select>
        </div>

        <div className="events-filter-group">
          <label htmlFor="events-capacity" className="events-filter-label">
            Capacity
          </label>
          <select
            id="events-capacity"
            className="events-filter-select"
            value={capacityFilter}
            onChange={(e) => {
              setCapacityFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All</option>
            <option value="not-full">Not full</option>
            <option value="full">Full</option>
          </select>
        </div>

        <div className="events-filter-group">
          <label htmlFor="events-limit" className="events-filter-label">
            Per Page
          </label>
          <select
            id="events-limit"
            className="events-filter-select"
            value={limit}
            onChange={(e) => {
              const newLimit = Number(e.target.value) || 9;
              setLimit(newLimit);
              setPage(1);
            }}
          >
            <option value={6}>6</option>
            <option value={9}>9</option>
            <option value={12}>12</option>
            <option value={18}>18</option>
          </select>
        </div>
      </section>

      {loading && <p>Loading events…</p>}
      {err && !loading && <p className="error">{err}</p>}

      {!loading && !err && (
        <>
          {/* main content area that will stretch */}
          <div className="events-main">
            <section className="events-grid">
              {sortedEvents.map((event) => (
                <article className="event-card" key={event.id}>
                  <div className="event-card-top">
                    {"pointsRemain" in event && (
                      <span className="event-badge-points">
                        Remained Points: {event.pointsRemain}
                      </span>
                    )}
                    {"published" in event && (
                      <span className="event-badge-status">
                        {event.published ? "Published" : "Unpublished"}
                      </span>
                    )}
                  </div>

                  <div className="event-card-body">
                    <h2 className="event-title">{event.name}</h2>

                    {event.description && (
                      <p className="event-description">{event.description}</p>
                    )}

                    <div className="event-meta">
                      <div className="event-meta-row">
                        <Calendar className="event-icon" />
                        <span>
                          {new Date(event.startTime).toLocaleString()} –{" "}
                          {new Date(event.endTime).toLocaleString()}
                        </span>
                      </div>
                      <div className="event-meta-row">
                        <MapPin className="event-icon" />
                        <span>{event.location}</span>
                      </div>
                      <div className="event-meta-row">
                        <Users className="event-icon" />
                        <span>
                          {event.numGuests}
                          {event.capacity != null ? ` / ${event.capacity}` : ""}{" "}
                          attending
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link to={`/events/${event.id}`} className="event-card-footer-link">
                    <button className="event-button">
                      <span>View Details</span>
                      <ArrowRight className="event-button-icon" />
                    </button>
                  </Link>
                </article>
              ))}

              {sortedEvents.length === 0 && (
                <p className="events-empty">No events match your filters.</p>
              )}
            </section>
          </div>

          <footer className="events-pagination">
            <button
              className="events-page-button"
              onClick={() => canPrev && setPage((p) => p - 1)}
              disabled={!canPrev}
            >
              Prev
            </button>

            <span className="events-page-info">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>

            <button
              className="events-page-button"
              onClick={() => canNext && setPage((p) => p + 1)}
              disabled={!canNext}
            >
              Next
            </button>

            <span className="events-count">
              Total: <strong>{count}</strong>
            </span>
          </footer>
        </>
      )}

    </div>
  );
}
