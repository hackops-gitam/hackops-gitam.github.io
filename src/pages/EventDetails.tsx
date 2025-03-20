import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { events } from '../data/events';
import { RegistrationForm } from '../components/RegistrationForm';
import { supabase } from '../supabaseClient'; // Adjust the path if needed

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [currentParticipants, setCurrentParticipants] = useState(0);

  // Fetch event details and initial registration count
  useEffect(() => {
    const foundEvent = events.find((event) => event.id === id);
    if (foundEvent) {
      setEvent(foundEvent);
      setCurrentParticipants(foundEvent.participants.current); // Initial value
    }
  }, [id]);

  // Fetch the number of registrations for this event
  const fetchRegistrations = async () => {
    if (!id) return;

    const { count, error } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id);

    if (error) {
      console.error('Error fetching registrations for event', id, ':', error);
      return;
    }

    setCurrentParticipants(count || 0);
  };

  // Set up real-time subscription and initial fetch
  useEffect(() => {
    if (!id) return;

    // Initial fetch
    fetchRegistrations();

    // Subscribe to new registrations
    const subscription = supabase
      .channel(`registrations-event-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'registrations',
          filter: `event_id=eq.${id}`,
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
  }, [id]);

  // Regex for validating social media link (basic URL validation)
  const isValidUrl = (url: string) => {
    const regex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/[a-z0-9-._~:/?#[\]@!$&'()*+,;=]*)?$/;
    return regex.test(url) && url !== "#";
  };

  const handleRegistrationSubmit = async (data: any) => {
    try {
      const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cnhybHhyeHdxcHB6ZGFzd251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMTEzMzgsImV4cCI6MjA1NjU4NzMzOH0.H7NH1KAugyrUi0QHWfXTe6C4P9vXzH-ZOYDnwGJRo0A';
      const functionUrl = 'https://lyrxrlxrxwqppzdaswnu.functions.supabase.co/register';

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          eventId: id,
          title: event?.title,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Registration failed: ${errorText}`);
      }

      const result = await response.json();
      console.log('Registration successful:', result.message);
      // No need to manually update participants; real-time subscription will handle it
    } catch (error) {
      console.error('Error:', error.message || error);
      throw error;
    }
  };

  const isEventOngoingAndRegistrationStarted = () => {
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today && event.registrationStatus === 'started';
  };

  if (!event) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <p>Loading...</p>
      </div>
    );
  }

  const buttonStyle = "inline-block text-lg text-white bg-green-500 hover:bg-green-600 py-3 px-8 mt-4 rounded-lg shadow-lg transition duration-300";

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col md:flex-row gap-8 p-6 bg-black/30 backdrop-blur-lg rounded-lg shadow-lg border border-gray-800">
        <div className="flex-shrink-0 w-full md:w-1/2 aspect-[4/5] relative">
          <img
            src={event.image}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-lg"
          />
        </div>

        <div className="flex flex-col gap-6 md:w-1/2">
          <h1 className="text-4xl font-bold text-green-500">{event.title}</h1>
          <p className="text-lg text-white">{event.description}</p>

          <div className="flex items-center gap-4 text-xl text-white font-semibold">
            <span className="text-lg text-white">Event Date:</span>
            <span className="text-2xl">{new Date(event.date).toLocaleDateString()}</span>
          </div>

          {event.venue && (
            <div className="flex items-center gap-4 text-xl text-white font-semibold">
              <span className="text-lg text-white">Event Venue:</span>
              <span className="text-2xl">{event.venue}</span>
            </div>
          )}

          {event.timings && (
            <div className="flex items-center gap-4 text-xl text-white font-semibold">
              <span className="text-lg text-white">Event Timings:</span>
              <span className="text-2xl">{event.timings}</span>
            </div>
          )}

          <div className="flex flex-col gap-2 text-xl text-white font-semibold">
            <div className="flex items-center gap-4">
              <span className="text-lg text-white">Participants:</span>
              <span className="text-2xl text-green-500">
                {currentParticipants}/{event.participants.total}
              </span>
            </div>

            <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(currentParticipants / event.participants.total) * 100}%` }}
              ></div>
            </div>
          </div>

          {event.certificateLink && !isEventOngoingAndRegistrationStarted() && (
            <div className="text-center mt-8">
              <h3 className="text-2xl font-semibold text-green-500">Certificate</h3>
              <div className="mt-4 flex flex-col gap-4">
                <a
                  href={event.certificateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonStyle}
                >
                  Download Certificate
                </a>
              </div>
            </div>
          )}

          {event.additionalLinks && event.additionalLinks.length > 0 && (
            <div className="text-center mt-8">
              <h3 className="text-2xl font-semibold text-green-500">Additional Resources</h3>
              <div className="mt-4 flex flex-col gap-4">
                {event.additionalLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonStyle}
                  >
                    {link.text}
                  </a>
                ))}
              </div>
            </div>
          )}

          {event.socialLink && event.socialLink.length > 0 && (
            <div className="text-center mt-8">
              <h3 className="text-2xl font-semibold text-green-500">Follow us on Social Media</h3>
              <div className="mt-4 flex flex-col gap-4">
                {event.socialLink.map((social, index) => (
                  <a
                    key={index}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonStyle}
                  >
                    {social.text}
                  </a>
                ))}
              </div>
            </div>
          )}

          {event.registrationStatus === 'started' && event.useCustomForm && (
            <div className="mt-8">
              <RegistrationForm
                eventId={id}
                onSubmit={handleRegistrationSubmit}
                whatsappLink={event.whatsappLink}
              />
            </div>
          )}
        </div>
      </div>

      {event.eventImages && event.eventImages.length > 0 && (
        <div className="mt-8">
          <h3 className="text-2xl font-semibold text-green-500">Event Photos</h3>
          <div className="relative mt-4 overflow-hidden">
            <div
              className="flex animation-slide"
              style={{
                animation: `slideImages 10s linear infinite`,
              }}
            >
              {event.eventImages.map((image, index) => (
                <div key={index} className="flex-shrink-0 w-full sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4 px-2">
                  <img
                    src={image}
                    alt={`Event Image ${index + 1}`}
                    className="w-full h-60 object-cover rounded-lg shadow-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideImages {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        @media (max-width: 768px) {
          .animation-slide {
            display: flex;
            flex-wrap: nowrap;
            animation: slideImages 10s linear infinite;
          }

          .animation-slide > div {
            width: 100%;
          }
        }

        @media (min-width: 769px) {
          .animation-slide {
            display: flex;
            flex-wrap: nowrap;
            animation: slideImages 10s linear infinite;
          }

          .animation-slide > div {
            width: 25%;
          }
        }
      `}</style>
    </div>
  );
};

export default EventDetails;