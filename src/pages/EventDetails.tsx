import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { events } from '../data/events';

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    const foundEvent = events.find((event) => event.id === id);
    setEvent(foundEvent);
  }, [id]);

  // Regex for validating social media link (basic URL validation)
  const isValidUrl = (url: string) => {
    const regex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/[a-z0-9-._~:/?#[\]@!$&'()*+,;=]*)?$/;
    return regex.test(url) && url !== "#";
  };

  if (!event) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <p>Loading...</p>
      </div>
    );
  }

  // Common button style
  const buttonStyle = "inline-block text-lg text-white bg-green-500 hover:bg-green-600 py-3 px-8 mt-4 rounded-lg shadow-lg transition duration-300";

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 py-12">
      {/* Main Event Image + Event Details */}
      <div className="flex flex-col md:flex-row gap-8 p-6 bg-black/30 backdrop-blur-lg rounded-lg shadow-lg border border-gray-800">
        {/* Event Image */}
        <div className="flex-shrink-0 w-full md:w-1/2">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Event Details */}
        <div className="flex flex-col gap-6 md:w-1/2">
          <h1 className="text-4xl font-bold text-green-500">{event.title}</h1>
          <p className="text-lg text-white">{event.description}</p>

          {/* Date */}
          <div className="flex items-center gap-4 text-xl text-white font-semibold">
            <span className="text-lg text-white">Event Date:</span>
            <span className="text-2xl">{new Date(event.date).toLocaleDateString()}</span>
          </div>

          {/* Event Venue */}
          {event.venue && (
            <div className="flex items-center gap-4 text-xl text-white font-semibold">
              <span className="text-lg text-white">Event Venue:</span>
              <span className="text-2xl">{event.venue}</span>
            </div>
          )}

          {/* Event Timings */}
          {event.timings && (
            <div className="flex items-center gap-4 text-xl text-white font-semibold">
              <span className="text-lg text-white">Event Timings:</span>
              <span className="text-2xl">{event.timings}</span>
            </div>
          )}

          {/* Participants with progress animation and progress bar */}
          <div className="flex flex-col gap-2 text-xl text-white font-semibold">
            <div className="flex items-center gap-4">
              <span className="text-lg text-white">Participants:</span>
              <span className="text-2xl text-green-500">
                {event.participants.current}/{event.participants.total}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(event.participants.current / event.participants.total) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Certificate Section */}
          {event.certificateLink && (
            <div className="text-center mt-8">
              <h3 className="text-2xl font-semibold text-green-500">Certificate</h3>
              <div className='mt-4 flex flex-col gap-4'>
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

          {/* Additional Resources Section */}
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

          {/* Social Media Buttons */}
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
        </div>
      </div>

      {/* Event Images Gallery (Slider Section) */}
      {event.eventImages && event.eventImages.length > 0 && (
        <div className="mt-8">
          <h3 className="text-2xl font-semibold text-green-500">Event Photos</h3>
          <div className="relative mt-4 overflow-hidden">
            {/* Slider container with continuous sliding animation */}
            <div
              className="flex animation-slide"
              style={{
                animation: `slideImages 10s linear infinite`, // Adjust animation speed here
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

      {/* Adding keyframes for continuous slider animation */}
      <style jsx>{`
        @keyframes slideImages {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        /* Mobile styles for one image per slide */
        @media (max-width: 768px) {
          .animation-slide {
            display: flex;
            flex-wrap: nowrap;
            animation: slideImages 10s linear infinite;
          }

          .animation-slide > div {
            width: 100%; /* One image per slide */
          }
        }

        /* Larger screen styles (default) */
        @media (min-width: 769px) {
          .animation-slide {
            display: flex;
            flex-wrap: nowrap;
            animation: slideImages 10s linear infinite;
          }

          .animation-slide > div {
            width: 25%; /* Four images per slide */
          }
        }
      `}</style>
    </div>
  );
};

export default EventDetails;
