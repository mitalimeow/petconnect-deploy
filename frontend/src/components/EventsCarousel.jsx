import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Fallback images (placeholder) in case the actual images aren't present yet, using visually pleasing colors
const fallbacks = [
  'bg-pastel-pink', 'bg-pastel-blue', 'bg-pastel-yellow', 'bg-pastel-green'
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`;

const EventsCarousel = ({ triggerFetch }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/events`);
        if (res.ok) {
          const data = await res.json();
          // Filter to double ensure frontend safely enforces date>now
          const validEvents = data.filter(e => new Date(e.date) >= new Date());
          setEvents(validEvents);
          setCurrentIndex(0);
        }
      } catch (err) {
        console.error("Failed to fetch events", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [triggerFetch]);

  useEffect(() => {
    if (events.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
    }, 5000); // 5 seconds

    return () => clearInterval(timer);
  }, [events.length]);

  if (isLoading) {
    return <div className="h-[300px] w-full max-w-5xl mx-auto rounded-[30px] bg-gray-100 animate-pulse flex items-center justify-center font-handwritten text-gray-400 text-2xl mb-12">Loading upcoming events...</div>;
  }

  if (events.length === 0) {
    return (
      <div 
        onClick={() => navigate('/applications')}
        className="h-[300px] md:h-[400px] w-full max-w-5xl mx-auto rounded-[30px] mb-12 overflow-hidden cursor-pointer hover:shadow-lg transition-transform hover:-translate-y-1 shadow-soft bg-[#f4ece3]"
      >
        <img 
          src="/no-events.png" 
          alt="No upcoming events" 
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto mb-12">
      {/* Carousel Container */}
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden rounded-[30px] shadow-soft bg-white">
        
        {events.map((event, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out cursor-pointer group ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            onClick={() => window.open(event.url || event.link, '_blank')}
          >
            {/* Image / Fallback background */}
            <div className={`w-full h-full ${fallbacks[index % fallbacks.length]} relative overflow-hidden`}>
              <img 
                src={event.image || event.imageUrl} 
                alt={event.title || event.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  e.target.style.display = 'none'; // Hide broken image
                }}
              />
              
              {/* Overlay on hover for tooltip-style name */}
              <div className="absolute inset-0 bg-black/40 xl:bg-black/20 xl:opacity-0 xl:group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <div className="flex flex-col items-center xl:transform xl:translate-y-4 xl:group-hover:translate-y-0 transition-all duration-300 bg-white/95 text-foreground px-8 py-5 rounded-[24px] shadow-2xl shrink-0 max-w-[80%] text-center">
                  <span className="font-bold text-2xl md:text-3xl font-handwritten mb-2 tracking-wide leading-tight">
                    {event.title || event.name}
                  </span>
                  <div className="flex flex-col items-center gap-1 text-gray-600 font-medium text-sm md:text-base">
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400"></div> {event.venue}</span>
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> {new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
      </div>

      {/* Indicator Dots */}
      <div className="flex justify-center mt-6 gap-3">
        {events.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-[#8B7355] scale-125' 
                : 'bg-[#8B7355]/30 hover:bg-[#8B7355]/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default EventsCarousel;
