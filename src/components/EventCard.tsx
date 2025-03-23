import { Event } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Calendar, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const [popupVisible, setPopupVisible] = useState(false);
  const [currentParticipants, setCurrentParticipants] = useState(event.participants.current);

  // Fetch the number of registrations for this event
  const fetchRegistrations = async () => {
    const { count, error } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', event.id.toString());

    if (error) {
      console.error('Error fetching registrations for event', event.id, ':', error);
      setCurrentParticipants(event.participants.current); // Fallback to static value on error
      return;
    }

    setCurrentParticipants(count || 0);
  };

  // Set up real-time subscription and initial fetch if FetchFromDB is true
  useEffect(() => {
    // If FetchFromDB is false or undefined, use the static value
    if (!event.FetchFromDB) {
      setCurrentParticipants(event.participants.current);
      return;
    }

    // Initial fetch
    fetchRegistrations();

    // Subscribe to new registrations
    const subscription = supabase
      .channel(`registrations-event-${event.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'registrations',
          filter: `event_id=eq.${event.id.toString()}`,
        },
        () => {
          fetchRegistrations(); // Re-fetch on new registration
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [event.id, event.FetchFromDB, event.participants.current]);

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const participantPercentage = (currentParticipants / event.participants.total) * 100;

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
        {/* Event Image with 4:5 aspect ratio */}
        <div className="relative w-full aspect-[4/5] mb-4">
          <img
            src={event.image}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover rounded-md"
          />
        </div>

        {/* Event Date */}
        <div className="flex items-center gap-2 text-cyan mb-2">
          <Calendar size={16} />
          <span className="text-sm">{formatDate(event.date)}</span>
        </div>

        {/* Event Title */}
        <h3 className="text-xl font-bold mb-2">{event.title}</h3>

        {/* Event Description */}
        <p className="text-gray-400 mb-4 line-clamp-3">{event.description}</p>

        {/* Participants */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-cyan" />
            <span className="text-sm text-gray-400">
              {currentParticipants}/{event.participants.total} Participants
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