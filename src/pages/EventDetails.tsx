// src/pages/EventDetails.tsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { events } from '../data/events';
import { RegistrationForm } from '../components/RegistrationForm';
import { supabase } from '../supabaseClient';

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    const foundEvent = events.find((event) => event.id === id);
    setEvent(foundEvent);
  }, [id]);

  const handleRegistrationSubmit = async (data: any) => {
    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('register', {
        body: JSON.stringify({ ...data, eventId: id }),
      });
      if (functionError) throw functionError;
      console.log('Registration successful:', functionData);
      setEvent((prev: any) => ({
        ...prev,
        participants: { ...prev.participants, current: prev.participants.current + 1 },
      }));
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  if (!event) return <div className="flex justify-center items-center h-screen bg-black text-white">Loading...</div>;

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col md:flex-row gap-8 p-6 bg-black/30 backdrop-blur-lg rounded-lg shadow-lg border border-gray-800">
        <div className="flex-shrink-0 w-full md:w-1/2">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover rounded-lg shadow-lg" />
        </div>
        <div className="flex flex-col gap-6 md:w-1/2">
          <h1 className="text-4xl font-bold text-green-500">{event.title}</h1>
          <p className="text-lg text-white">{event.description}</p>
        </div>
      </div>

      {event.registrationStatus === 'started' && (
        event.useCustomForm ? (
          <div className="mt-8">
            <RegistrationForm
              eventId={event.id}
              onSubmit={handleRegistrationSubmit}
              whatsappLink="https://chat.whatsapp.com/example"
            />
          </div>
        ) : (
          event.registrationLink && (
            <a href={event.registrationLink} target="_blank" rel="noopener noreferrer" className="inline-block text-lg text-white bg-green-500 hover:bg-green-600 py-3 px-8 mt-4 rounded-lg shadow-lg transition duration-300">
              Register Now
            </a>
          )
        )
      )}
    </div>
  );
};

export default EventDetails;