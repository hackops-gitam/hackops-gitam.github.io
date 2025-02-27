import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { events } from '../data/events';
import { EventSlider } from '../components/EventSlider';

export default function Home() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const ongoingEvents = events.filter(event => event.status === 'ongoing');
  const upcomingEvents = events.filter(event => event.status === 'upcoming');

  const tiles = [
    {
      title: 'Vision',
      content: 'To create a community of cybersecurity enthusiasts and professionals who work together to make the digital world a safer place.',
    },
    {
      title: 'Mission',
      content: 'Empowering individuals with knowledge and skills in cybersecurity through hands-on experience, workshops, and collaborative learning.',
    },
    {
      title: 'About Us',
      content: 'We are a passionate group of cybersecurity enthusiasts dedicated to learning, sharing, and growing together in the field of information security.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-20"
      >
        <img
          src="https://res.cloudinary.com/dae56bvjp/image/upload/v1734460980/6_ygaqii.webp"
          alt="HackOps Club Logo"
          className="h-20 w-auto mx-auto mb-6"
        />
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan to-purple-500 text-transparent bg-clip-text">
          HackOps
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Join us in our mission to explore, learn, and master the art of cybersecurity
        </p>
      </motion.div>

      {/* Sliding Tiles Section */}
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
      >
        {tiles.map((tile, index) => (
          <motion.div
            key={tile.title}
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="bg-navy-light p-6 rounded-lg backdrop-blur-sm border border-gray-800 hover:border-cyan transition-colors"
          >
            <h2 className="text-xl font-bold mb-4 text-cyan">{tile.title}</h2>
            <p className="text-gray-400">{tile.content}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Ongoing Events Section */}
      {ongoingEvents.length > 0 && (
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">Ongoing Events</h2>
          <EventSlider events={ongoingEvents} />
        </section>
      )}

      {/* Upcoming Events Section */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">Upcoming Events</h2>
        <EventSlider events={upcomingEvents} />
      </section>
    </div>
  );
}
