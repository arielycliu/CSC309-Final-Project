import { useEffect, useState } from "react";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/Events.css";
import { fetchEvents } from "../lib/events";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 9;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setErr("");

        const data = await fetchEvents({
          page,
          limit,
          showFull: false,
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
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(count / limit));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="events-page">
      <header className="events-header">
        <h1>Events</h1>
        <p>Browse and RSVP to upcoming events</p>
      </header>

      {loading && <p>Loading events…</p>}
      {err && !loading && <p className="error">{err}</p>}

      {!loading && !err && (
        <>
          {/* main content area that will stretch */}
          <div className="events-main">
            <section className="events-grid">
              {events.map((event) => (
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

              {events.length === 0 && (
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
