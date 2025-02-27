import { Event } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Calendar, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const [popupVisible, setPopupVisible] = useState(false);

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const participantPercentage =
    (event.participants.current / event.participants.total) * 100;

  // Handle "Register" button click: Show popup only if event is not past and registration hasn't started
  const handleRegisterClick = (e: React.MouseEvent) => {
    if (event.status !== 'past' && event.registrationStatus === 'notStarted') {
      e.preventDefault(); // Prevent navigation
      setPopupVisible(true);
    }
  };

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card className="h-full">
        {/* Event Image */}
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-48 object-cover rounded-md mb-4"
        />

        {/* Event Date */}
        <div className="flex items-center gap-2 text-cyan mb-2">
          <Calendar size={16} />
          <span className="text-sm">{formatDate(event.date)}</span>
        </div>

        {/* Event Title */}
        <h3 className="text-xl font-bold mb-2">{event.title}</h3>

        {/* Event Description */}
        <p className="text-gray-400 mb-4">{event.description}</p>

        {/* Participants */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-cyan" />
            <span className="text-sm text-gray-400">
              {event.participants.current}/{event.participants.total} Participants
            </span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan transition-all duration-300"
              style={{ width: `${participantPercentage}%` }}
            />
          </div>
        </div>

        {/* Popup when registration hasn't started */}
        {popupVisible && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-black p-6 rounded shadow-lg text-center">
              <h2 className="text-lg font-bold mb-4">Event Registrations Not Started</h2>
              <p className="text-gray-600 mb-4">
                Thank you for your interest! Registrations for this event have not started yet.
              </p>
              <button
                onClick={() => setPopupVisible(false)}
                className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Link to={`/event/${event.id}`}>
          <Button
            variant={event.status === 'past' ? 'secondary' : 'primary'}
            onClick={handleRegisterClick}
          >
            {event.status === 'past' ? 'View Details' : 'Register Now'}
          </Button>
        </Link>
      </Card>
    </motion.div>
  );
}
