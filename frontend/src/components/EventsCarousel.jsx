import React, { useState, useEffect } from 'react';

const events = [
  {
    name: "Thane Pet Fest",
    image: "/images/event1.jpg",
    link: "https://dogsworldindia.com/thane-pet-fest/"
  },
  {
    name: "Paws in the Park",
    image: "/images/event2.jpg",
    link: "https://animeal.in/pages/paws-in-the-park-event?srsltid=AfmBOoovtr9_jmKTyG1xWbcMqnhWJZvBJJppaksnKDAa3xrvhjqyLo2e"
  },
  {
    name: "Clay Modelling with puppies",
    image: "/images/event3.jpg",
    link: "https://pawgapetsyoga.com/events/mumbai-jan-10th-clay-modelling-w-puppies-stand-by-coffee-worli/"
  },
  {
    name: "Pet Fed Goa Express Edition 2026",
    image: "/images/event4.jpg",
    link: "https://petfed.org/products/pet-fed-goa-express-edition-2026"
  }
];

// Fallback images (placeholder) in case the actual images aren't present yet, using visually pleasing colors
const fallbacks = [
  'bg-pastel-pink', 'bg-pastel-blue', 'bg-pastel-yellow', 'bg-pastel-green'
];

const EventsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
    }, 5000); // 5 seconds

    return () => clearInterval(timer);
  }, []);

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
            onClick={() => window.open(event.link, '_blank')}
          >
            {/* Image / Fallback background */}
            <div className={`w-full h-full ${fallbacks[index % fallbacks.length]} relative overflow-hidden`}>
              <img 
                src={event.image} 
                alt={event.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  e.target.style.display = 'none'; // Hide broken image
                }}
              />
              
              {/* Overlay on hover for tooltip-style name */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white/90 text-foreground px-6 py-3 rounded-2xl font-bold shadow-lg text-lg">
                  {event.name}
                </span>
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
