import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  Award,
  ArrowLeft,
  Check,
} from "lucide-react";
import "../styles/EventDetail.css";
import { toast } from "sonner";
import {
  fetchEventById,
  rsvpMe,
  unRsvpMe,
} from "../lib/events";

export default function EventDetail() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [isRsvped, setIsRsvped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ─────────────────────────────
  // Load event details
  // ─────────────────────────────
  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        const data = await fetchEventById(id);
        setEvent(data);

        // If later your backend returns something like `isGuest`,
        // you can init from it:
        // setIsRsvped(!!data.isGuest);
      } catch (e) {
        setErr(e.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  // ─────────────────────────────
  // RSVP / cancel
  // ─────────────────────────────
  const handleRsvp = async () => {
    if (!event) return;

    try {
      if (!isRsvped) {
        // RSVP
        await rsvpMe(event.id);
        setIsRsvped(true);
        setEvent((prev) =>
          prev
            ? { ...prev, numGuests: (prev.numGuests ?? 0) + 1 }
            : prev
        );
        toast.success(`Successfully RSVP'd to ${event.name}`);
      } else {
        // Cancel
        await unRsvpMe(event.id);
        setIsRsvped(false);
        setEvent((prev) =>
          prev
            ? { ...prev, numGuests: Math.max(0, (prev.numGuests ?? 1) - 1) }
            : prev
        );
        toast.success("RSVP cancelled");
      }
    } catch (e) {
      toast.error(e.message || "Something went wrong");
    }
  };

  // ─────────────────────────────
  // Loading / error states
  // ─────────────────────────────
  if (loading) {
    return (
      <div className="event-detail-page">
        <p>Loading event…</p>
      </div>
    );
  }

  if (err || !event) {
    return (
      <div className="event-detail-page">
        <Link to="/events" className="event-detail-back-button-inline">
          <ArrowLeft className="event-detail-back-icon" /> Back to events
        </Link>
        <p className="event-detail-error">{err || "Event not found"}</p>
      </div>
    );
  }

  // ─────────────────────────────
  // data from backend 
  // ─────────────────────────────
  const attendees = event.numGuests ?? 0;
  const maxAttendees = event.capacity ?? 0;
  const attendancePercent =
    maxAttendees > 0 ? Math.round((attendees / maxAttendees) * 100) : 0;

  const start = new Date(event.startTime || event.date);
  const end = new Date(event.endTime || event.date);

  const organizerNames =
    event.organizers && event.organizers.length > 0
      ? event.organizers.map((o) => o.name).join(", ")
      : event.organizer || "TBA";

  const pointsReward =
    event.pointsReward ?? event.pointsTotal ?? event.pointsRemain ?? null;

  const pointRemained = event.pointsRemain ?? null;

  return (
    <div className="event-detail-page">
      {/* Header with back button */}
      <div className="event-detail-header">
        <Link to="/events" className="event-detail-back-button">
          <ArrowLeft className="event-detail-back-icon" />
        </Link>
        <div>
          <h1 className="event-detail-title">{event.name}</h1>
          <p className="event-detail-subtitle">Event details and RSVP</p>
        </div>
      </div>

      {/* Main card */}
      <div className="event-detail-card">
        <div className="event-detail-card-header">
          <div className="event-detail-badges-left">
            {pointsReward != null && (
              <span className="event-detail-badge-points">
                <Award className="event-detail-badge-icon" />
                {pointsReward} pts in total
              </span>
            )}
            {/* Points remained*/}
            {pointRemained != null && (
              <span className="event-detail-badge-points">
                <Award className="event-detail-badge-icon" />
                {pointRemained} pts remained
              </span>
            )}
            {"published" in event && (
              <span className="event-detail-badge-status">
                {event.published ? "Published" : "Unpublished"}
              </span>
            )}
          </div>
          {isRsvped && (
            <span className="event-detail-badge-rsvped">
              <Check className="event-detail-badge-icon" />
              RSVP&apos;d
            </span>
          )}
        </div>

        <div className="event-detail-card-body">
          <h2 className="event-detail-card-title">{event.name}</h2>
          {event.description && (
            <p className="event-detail-description">{event.description}</p>
          )}

          <div className="event-detail-info-grid">
            {/* Left column: date/time + location */}
            <div className="event-detail-info-column">
              <div className="event-detail-info-row">
                <Calendar className="event-detail-info-icon" />
                <div>
                  <p className="event-detail-info-label">Date &amp; Time</p>
                  <p className="event-detail-info-main">
                    {start.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="event-detail-info-secondary">
                    {start.toLocaleTimeString()} – {end.toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="event-detail-info-row">
                <MapPin className="event-detail-info-icon" />
                <div>
                  <p className="event-detail-info-label">Location</p>
                  <p className="event-detail-info-main">{event.location}</p>
                </div>
              </div>
            </div>

            {/* Right column: attendance + organizer */}
            <div className="event-detail-info-column">
              <div className="event-detail-info-row">
                <Users className="event-detail-info-icon" />
                <div>
                  <p className="event-detail-info-label">Attendance</p>
                  <p className="event-detail-info-main">
                    {attendees}
                    {maxAttendees ? ` / ${maxAttendees}` : ""} attending
                  </p>
                  {maxAttendees > 0 && (
                    <>
                      <div className="event-detail-progress-bar">
                        <div
                          className="event-detail-progress-fill"
                          style={{ width: `${attendancePercent}%` }}
                        />
                      </div>
                      <p className="event-detail-info-secondary">
                        {attendancePercent}% full
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="event-detail-info-row">
                <Award className="event-detail-info-icon" />
                <div>
                  <p className="event-detail-info-label">Organizer</p>
                  <p className="event-detail-info-main">{organizerNames}</p>
                </div>
              </div>
            </div>
          </div>

          {/* About section */}
          {event.description && (
            <div className="event-detail-section">
              <h3 className="event-detail-section-title">About This Event</h3>
              <p className="event-detail-long-description">
                {event.description}
              </p>
            </div>
          )}

          {/* RSVP section */}
          <div className="event-detail-section event-detail-rsvp">
            <button
              type="button"
              onClick={handleRsvp}
              className={
                isRsvped
                  ? "event-detail-rsvp-button event-detail-rsvp-button-outline"
                  : "event-detail-rsvp-button"
              }
            >
              {isRsvped ? (
                <>
                  <Check className="event-detail-rsvp-icon" />
                  Cancel RSVP
                </>
              ) : (
                "RSVP to Event"
              )}
            </button>

            {isRsvped && (
              <p className="event-detail-rsvp-note">
                You&apos;ll receive points when you attend this
                event. Specific amount will be decided by the organizers.
              </p>
            )}
               
          </div>
        </div>
      </div>
    </div>
  );
}
