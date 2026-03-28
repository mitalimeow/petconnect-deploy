import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const cards = [
  {
    id: 0,
    title: "Want to adopt a pet?",
    subtitle: "Find your new best friend!",
    action: "Adopt Me! >",
    link: "/adopt",
    color: "bg-pastel-blue/20",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=600",
  },
  {
    id: 1,
    title: "Report a lost pet!",
    subtitle: "Help reunite families in need.",
    action: "Lost & Found >",
    link: "/lost-found",
    color: "bg-pastel-pink/20",
    image: "https://images.unsplash.com/photo-1593134257782-e89567b7718a?q=80&w=600",
  },
  {
    id: 2,
    title: "Connect with others",
    subtitle: "Join the local pet community!",
    action: "Community >",
    link: "/community",
    color: "bg-pastel-yellow/20",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600",
  },
  {
    id: 3,
    title: "Injured Pet?",
    subtitle: "Find your nearest vet clinic!",
    action: "Helpline >",
    link: "/helpline",
    color: "bg-pastel-green/20",
    image: "https://images.pexels.com/photos/6235227/pexels-photo-6235227.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 4,
    title: "Education & Care",
    subtitle: "Tips for a happy, healthy pet.",
    action: "Education >",
    link: "/education",
    color: "bg-purple-100",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=600",
  },
  {
    title: "Professional Verification",
    subtitle: "Apply for expert tags like Vet, Trainer, or Shelter Owner.",
    action: "Apply Now >",
    link: "/applications",
    color: "bg-orange-100/50",
    image: "https://images.pexels.com/photos/8354525/pexels-photo-8354525.jpeg?auto=compress&cs=tinysrgb&w=800"
  }
];

const NavigationCards = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Smooth scroll handler for arrows shifting exactly 1 card + gap width
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.children[0].offsetWidth + 24; // Card width + gap-6 (24px)
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Intersection Observer to link Scroll Snap position seamlessly to pagination dots
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveIndex(Number(entry.target.dataset.index));
          }
        });
      },
      {
        root: container,
        threshold: 0.6, // Update active dot when card is heavily in view
      }
    );

    Array.from(container.children).forEach((child) => {
      // Don't observe the trailing invisible spacer div
      if (child.dataset.index !== undefined) {
        observer.observe(child);
      }
    });
    
    return () => observer.disconnect();
  }, []);

  // Autoplay functionality with built in edge-stop reset logic
  useEffect(() => {
    if (isHovered) return;
    
    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        
        // Loop completely back to zero natively if we've hit the exact end bound
        if (Math.ceil(scrollLeft + clientWidth) >= scrollWidth) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scroll('right');
        }
      }
    }, 4500); // Wait 4.5 seconds on each card

    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div 
      className="relative w-full max-w-7xl mx-auto mb-16 px-4 md:px-12 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      
      {/* Absolute Left Boundary Arrow */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 lg:left-4 top-[45%] -translate-y-1/2 z-20 p-3 rounded-full border border-gray-200 text-[#8B7355] hover:bg-[#8B7355] hover:text-white hover:border-[#8B7355] transition-all bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center opacity-100"
        aria-label="Scroll left"
      >
        <ChevronLeft size={24} strokeWidth={2.5} />
      </button>

      {/* Native CSS Drag/Snap Scroll Interface */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth py-6 px-2 md:px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // IE / Firefox scrollbar hidden
      >
        {/* Chrome / Safari Hide Webkit scrollbar cleanly */}
        <style>{`
          .flex::-webkit-scrollbar {
            display: none; // Hides native scrollbar
          }
        `}</style>

        {cards.map((card, index) => (
          <div 
            key={card.id}
            data-index={index}
            onClick={() => navigate(card.link)}
            className="w-[280px] md:w-[320px] shrink-0 snap-start flex flex-col p-6 rounded-[2rem] border border-gray-100/50 shadow-sm cursor-pointer hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 bg-white"
          >
            <h3 className="text-xl font-raleway font-bold text-[#8B7355] leading-tight mb-1 h-12">
              {card.title}
            </h3>
            <p className="text-[17px] font-playwrite text-gray-500 font-medium mb-4 h-12 line-clamp-3 leading-tight tracking-wide">
              {card.subtitle}
            </p>
            
            {/* Highly Realistic Unsplash Box featuring strictly locked aspect-ratios via cover */}
            <div className={`relative flex-grow rounded-[1.5rem] mb-6 overflow-hidden min-h-[160px] md:min-h-[180px] w-full ${card.color}`}>
              <img 
                src={card.image} 
                alt={card.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 hover:scale-[1.1]"
              />
            </div>
            
            <span className="text-[17px] font-raleway font-extrabold tracking-wide text-[#8B7355] hover:text-pastel-pink transition-colors w-full text-right pr-2">
              {card.action}
            </span>
          </div>
        ))}
        {/* Invisible Spacer ensuring the absolute last card can be snapped fully into view gracefully */}
        <div className="w-[10px] shrink-0 pointer-events-none" />
      </div>

      {/* Absolute Right Boundary Arrow */}
      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 lg:right-4 top-[45%] -translate-y-1/2 z-20 p-3 rounded-full border border-gray-200 text-[#8B7355] hover:bg-[#8B7355] hover:text-white hover:border-[#8B7355] transition-all bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center opacity-100"
        aria-label="Scroll right"
      >
        <ChevronRight size={24} strokeWidth={2.5} />
      </button>

      {/* Pagination Dots Removed for aesthetic consistency */}
    </div>
  );
};

export default NavigationCards;
