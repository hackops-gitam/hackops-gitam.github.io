import { Event } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Calendar, Users, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for programmatic navigation
import { supabase } from '../supabaseClient';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const [popupVisible, setPopupVisible] = useState<'notStarted' | 'slotsFilled' | null>(null);
  const [currentParticipants, setCurrentParticipants] = useState(event.participants.current);
  const navigate = useNavigate(); // Use navigate for programmatic navigation

  // Fetch the number of registrations for this event
  const fetchRegistrations = async () => {
    const { count, error } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', event.id.toString());

    if (error) {
      console.error('Error fetching registrations for event', event.id, ':', error);
      setCurrentParticipants(event.participants.current);
      return;
    }

    console.log(`Fetched participants for event ${event.id}: ${count}`);
    setCurrentParticipants(count || 0);
  };

  // Set up real-time subscription and initial fetch if FetchFromDB is true
  useEffect(() => {
    if (!event.FetchFromDB) {
      console.log(`Using static participants for event ${event.id}: ${event.participants.current}`);
      setCurrentParticipants(event.participants.current);
      return;
    }

    fetchRegistrations();

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
          fetchRegistrations();
        }
      )
      .subscribe();

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
  const isEventFull = currentParticipants >= event.participants.total;

  // Debug log for isEventFull condition
  useEffect(() => {
    console.log(`Event ${event.id} - Current: ${currentParticipants}, Total: ${event.participants.total}, Is Full: ${isEventFull}`);
  }, [currentParticipants, event.participants.total, event.id, isEventFull]);

  // Debug log for popupVisible state changes
  useEffect(() => {
    console.log(`Popup Visible State: ${popupVisible}`);
  }, [popupVisible]);

  // Handle "Register" button click
  const handleRegisterClick = () => {
    console.log(`Register button clicked for event ${event.id}`);

    // Check if the event is full
    if (isEventFull) {
      console.log(`Event ${event.id} is full, setting popup to slotsFilled`);
      setPopupVisible('slotsFilled');
      return;
    }

    // Check if registration hasn't started
    if (event.status !== 'past' && event.registrationStatus === 'notStarted') {
      console.log(`Event ${event.id} registrations not started, setting popup to notStarted`);
      setPopupVisible('notStarted');
      return;
    }

    // Navigate to the event page if no conditions are met
    console.log(`Navigating to event page for event ${event.id}`);
    navigate(`/event/${event.id}`);
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

        {/* Popup for "Registrations Not Started" */}
        {popupVisible === 'notStarted' && (
          <div
            className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50"
            role="dialog"
            aria-labelledby="not-started-title"
            aria-modal="true"
          >
            <div className="bg-black p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
              <h2 id="not-started-title" className="text-lg font-bold mb-4 text-white">
                Event Registrations Not Started
              </h2>
              <p className="text-gray-400 mb-4">
                Thank you for your interest! Registrations for this event have not started yet.
              </p>
              <button
                onClick={() => setPopupVisible(null)}
                className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Popup for "Slots Filled" (Deadline Alert Style) */}
        {popupVisible === 'slotsFilled' && (
          <div
            className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-70 z-50"
            role="dialog"
            aria-labelledby="slots-filled-title"
            aria-modal="true"
          >
            <div className="bg-navy-light p-6 rounded-lg shadow-xl text-center max-w-md w-full border border-red-500/50">
              <div className="flex justify-center mb-4">
                <AlertCircle size={40} className="text-red-500" />
              </div>
              <h2 id="slots-filled-title" className="text-xl font-bold mb-4 text-white">
                Event Capacity Reached
              </h2>
              <p className="text-gray-300 mb-6">
                We’re sorry, but all slots for this event are filled. The maximum capacity of{' '}
                <span className="font-semibold text-cyan-400">{event.participants.total}</span> has been reached. For further
                assistance or inquiries, please contact us at{' '}
                <a href="tel:+917993703484" className="text-cyan-400 hover:underline">
                  +91 7993703484
                </a>
                . Thank you for your understanding!
              </p>
              <button
                onClick={() => setPopupVisible(null)}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          variant={event.status === 'past' ? 'secondary' : 'primary'}
          onClick={handleRegisterClick}
          disabled={isEventFull}
          className={isEventFull ? 'opacity-50 cursor-not-allowed' : ''}
        >
          {event.status === 'past' ? 'View Details' : 'Register Now'}
        </Button>
      </Card>
    </motion.div>
  );
}