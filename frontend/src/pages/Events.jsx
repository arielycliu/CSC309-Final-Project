// import { Link } from 'react-router-dom';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
// import { Badge } from '../components/ui/badge';
// import { Button } from '../components/ui/button';
// import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';

// export default function Events() {
//   // Mock events data
//   const events = [
//     {
//       id: '1',
//       title: 'Customer Appreciation Day',
//       description: 'Join us for a special celebration with exclusive rewards and giveaways!',
//       date: '2025-11-25',
//       time: '14:00',
//       location: 'Main Store',
//       attendees: 45,
//       maxAttendees: 100,
//       pointsReward: 200,
//       published: true,
//     },
//     {
//       id: '2',
//       title: 'Holiday Shopping Event',
//       description: 'Early access to holiday deals and earn bonus points on all purchases',
//       date: '2025-12-05',
//       time: '10:00',
//       location: 'All Locations',
//       attendees: 32,
//       maxAttendees: 150,
//       pointsReward: 150,
//       published: true,
//     },
//     {
//       id: '3',
//       title: 'Member Exclusive Preview',
//       description: 'Be the first to see our new product line and earn rewards',
//       date: '2025-11-30',
//       time: '18:00',
//       location: 'Downtown Location',
//       attendees: 28,
//       maxAttendees: 50,
//       pointsReward: 300,
//       published: true,
//     },
//   ];

//   return (
//     <div className="w-full max-w-6xl mx-auto px-6 py-8 space-y-6 text-left">
//       <div>
//         <h1 className="text-3xl font-semibold tracking-tight">Events</h1>
//         <p className="text-muted-foreground">
//           Browse and RSVP to upcoming events
//         </p>
//       </div>

//       <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
//         {events.map((event) => (
//           <Card
//             key={event.id}
//             className="flex h-full flex-col rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg transition-shadow"
//           >
//             <CardHeader className="p-6 pb-4">
//               <div className="mb-3 flex items-start justify-between">
//                 <Badge className="bg-blue-100 text-blue-700 border-blue-300">
//                   {event.pointsReward} pts
//                 </Badge>
//                 <Badge variant="outline">Published</Badge>
//               </div>
//               <CardTitle className="text-lg font-semibold">
//                 {event.title}
//               </CardTitle>
//               <CardDescription>{event.description}</CardDescription>
//             </CardHeader>

//             <CardContent className="flex flex-1 flex-col space-y-3 p-6 pt-0 text-sm text-muted-foreground">
//               <div className="flex items-center gap-2">
//                 <Calendar className="size-4" />
//                 <span>
//                   {new Date(event.date).toLocaleDateString()} at {event.time}
//                 </span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <MapPin className="size-4" />
//                 <span>{event.location}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Users className="size-4" />
//                 <span>
//                   {event.attendees} / {event.maxAttendees} attending
//                 </span>
//               </div>

//               <div className="mt-auto pt-4">
//                 <Link to={`/events/${event.id}`} className="block">
//                   <Button className="w-full justify-center">
//                     View Details
//                     <ArrowRight className="ml-2 size-4" />
//                   </Button>
//                 </Link>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }

import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import{ Link } from "react-router-dom"
import "../styles/Events.css";

const EVENTS = [
  {
    id: "1",
    title: "Event 1",
    description: "123",
    date: "2025-11-24",
    time: "14:00",
    location: "123",
    attendees: 45,
    maxAttendees: 100,
    points: 200,
  },
  {
    id: "2",
    title: "Event 2",
    description: "123",
    date: "2025-12-04",
    time: "10:00",
    location: "All Locations",
    attendees: 32,
    maxAttendees: 150,
    points: 150,
  },
  {
    id: "3",
    title: "Event 3",
    description: "123",
    date: "2025-11-29",
    time: "18:00",
    location: "Downtown Location",
    attendees: 28,
    maxAttendees: 50,
    points: 300,
  },
];

export default function Events() {
  return (
    <div className="events-page">
      <header className="events-header">
        <h1>Events</h1>
        <p>Browse and RSVP to upcoming events</p>
      </header>

      <section className="events-grid">
        {EVENTS.map((event) => (
          <article className="event-card" key={event.id}>
            <div className="event-card-top">
              <span className="event-badge-points">{event.points} pts</span>
              <span className="event-badge-status">Published</span>
            </div>

            <div className="event-card-body">
              <h2 className="event-title">{event.title}</h2>
              <p className="event-description">{event.description}</p>

              <div className="event-meta">
                <div className="event-meta-row">
                  <Calendar className="event-icon" />
                  <span>
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </span>
                </div>
                <div className="event-meta-row">
                  <MapPin className="event-icon" />
                  <span>{event.location}</span>
                </div>
                <div className="event-meta-row">
                  <Users className="event-icon" />
                  <span>
                    {event.attendees} / {event.maxAttendees} attending
                  </span>
                </div>
              </div>
            </div>

            <Link  to={`/events/${event.id}`} className="w-full">
            <button className="event-button">
              <span>View Details</span>
              <ArrowRight className="event-button-icon" />
            </button>
            </Link >
          </article>
        ))}
      </section>
    </div>
  );
}
