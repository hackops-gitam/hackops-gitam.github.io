import { motion } from 'framer-motion';
import { events } from '../data/events';
import { EventSlider } from '../components/EventSlider';
import ParticlesBackground from '../components/ParticlesBackground'; // Adjust the path as needed

export default function Events() {
  // Filter events based on status
  const ongoingEvents = events.filter((event) => event.status === 'ongoing');
  const upcomingEvents = events.filter((event) => event.status === 'upcoming');
  const pastEvents = events.filter((event) => event.status === 'past');

  return (
    <div className="relative min-h-screen">
      {/* Particles Background */}
      <ParticlesBackground />

      {/* Glassmorphism Container */}
      <div className="relative z-10 min-h-screen bg-black/30 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4 text-white">Events</h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Join our workshops, webinars, and competitions to enhance your cybersecurity skills
            </p>
          </motion.div>

          {ongoingEvents.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-8 text-white">Ongoing Events</h2>
              <EventSlider events={ongoingEvents} />
            </section>
          )}

          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-white">Upcoming Events</h2>
            <EventSlider events={upcomingEvents} />
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-8 text-white">Past Events</h2>
            <EventSlider events={pastEvents} />
          </section>
        </div>
      </div>
    </div>
  );
}