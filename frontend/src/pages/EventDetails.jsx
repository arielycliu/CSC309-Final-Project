import { useState } from "react";
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
import { toast } from 'sonner';


export default function EventDetail() {
  const { id } = useParams();
  const [isRsvped, setIsRsvped] = useState(false);

  // Mock event data
  const event = {
    id: id || "1",
    title: "Mock 1",
    description:
      "Mock event",
    longDescription:
      "forgot if we have long description field in db.",
    date: "2025-11-25",
    time: "14:00",
    endTime: "18:00",
    location: "123",
    attendees: 45,
    maxAttendees: 100,
    pointsReward: 200,
    published: true,
    organizer: "John 111",
  };

  const handleRsvp = () => {
    setIsRsvped((prev) => {
        const next = !prev;
        if (next) {
        console.log(`RSVP'd to event ${event.id}`);
        toast.success(`Successfully RSVP'd to ${event.title}`);
        } else {
        toast.success("RSVP cancelled");
        }
        return next;
    });
    };  


  const attendancePercent = Math.round(
    (event.attendees / event.maxAttendees) * 100
  );

  return (
    <div className="event-detail-page">
      {/* Header with back button */}
      <div className="event-detail-header">
        <Link to="/events" className="event-detail-back-button">
          <ArrowLeft className="event-detail-back-icon" />
        </Link>
        <div>
          <h1 className="event-detail-title">{event.title}</h1>
          <p className="event-detail-subtitle">Event details and RSVP</p>
        </div>
      </div>

      {/* Main card */}
      <div className="event-detail-card">
        <div className="event-detail-card-header">
          <div className="event-detail-badges-left">
            <span className="event-detail-badge-points">
              <Award className="event-detail-badge-icon" />
              {event.pointsReward} pts reward
            </span>
            <span className="event-detail-badge-status">Published</span>
          </div>
          {isRsvped && (
            <span className="event-detail-badge-rsvped">
              <Check className="event-detail-badge-icon" />
              RSVP&apos;d
            </span>
          )}
        </div>

        <div className="event-detail-card-body">
          <h2 className="event-detail-card-title">{event.title}</h2>
          <p className="event-detail-description">{event.description}</p>

          <div className="event-detail-info-grid">
            {/* Left column: date/time + location */}
            <div className="event-detail-info-column">
              <div className="event-detail-info-row">
                <Calendar className="event-detail-info-icon" />
                <div>
                  <p className="event-detail-info-label">Date &amp; Time</p>
                  <p className="event-detail-info-main">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="event-detail-info-secondary">
                    {event.time} - {event.endTime}
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
                    {event.attendees} / {event.maxAttendees} attending
                  </p>
                  <div className="event-detail-progress-bar">
                    <div
                      className="event-detail-progress-fill"
                      style={{ width: `${attendancePercent}%` }}
                    />
                  </div>
                  <p className="event-detail-info-secondary">
                    {attendancePercent}% full
                  </p>
                </div>
              </div>

              <div className="event-detail-info-row">
                <Award className="event-detail-info-icon" />
                <div>
                  <p className="event-detail-info-label">Organizer</p>
                  <p className="event-detail-info-main">{event.organizer}</p>
                </div>
              </div>
            </div>
          </div>

          {/* About section */}
          <div className="event-detail-section">
            <h3 className="event-detail-section-title">About This Event</h3>
            <p className="event-detail-long-description">
              {event.longDescription}
            </p>
          </div>

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
                You&apos;ll receive {event.pointsReward} points when you attend
                this event.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
