import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'motion/react';

const initialCards = [
  {
    title: "Want to adopt a pet?",
    subtitle: "<pet name> is looking for a home!",
    action: "Adopt Me! >",
    link: "/adopt",
    color: "bg-pastel-blue/20",
    imagePlaceholder: "image of pet"
  },
  {
    title: "Report a lost pet!",
    subtitle: "1 in 3 pets go missing every year.",
    action: "Lost & Found >",
    link: "/lost-found",
    color: "bg-pastel-pink/20",
    imagePlaceholder: "lost pet image"
  },
  {
    title: "Have something on your mind?",
    subtitle: "Let us know!",
    action: "Community >",
    link: "/community",
    color: "bg-pastel-yellow/20",
    imagePlaceholder: "community discussion"
  },
  {
    title: "Injured Pet?",
    subtitle: "Search for your nearest clinic!",
    action: "Helpline >",
    link: "/helpline",
    color: "bg-pastel-green/20",
    imagePlaceholder: "clinic image"
  },
  {
    title: "Get to know your furry friend better!",
    subtitle: "How much do you know?",
    action: "Education >",
    link: "/education",
    color: "bg-purple-100",
    imagePlaceholder: "education image"
  },
  {
    title: "Professional Verification",
    subtitle: "Apply for expert tags like Vet, Trainer, or Shelter Owner.",
    action: "Apply Now >",
    link: "/applications",
    color: "bg-orange-100/50",
    imagePlaceholder: "verification image"
  }
];

const NavigationCards = () => {
  const [cards, setCards] = useState(initialCards);
  const navigate = useNavigate();

  const handleNext = () => {
    setCards((prev) => {
      const copy = [...prev];
      const first = copy.shift();
      copy.push(first);
      return copy;
    });
  };

  const handlePrev = () => {
    setCards((prev) => {
      const copy = [...prev];
      const last = copy.pop();
      copy.unshift(last);
      return copy;
    });
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto mb-16 px-4 md:px-12">
      {/* Left Arrow */}
      <button 
        onClick={handlePrev}
        className="absolute left-0 lg:left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full border-2 border-[#8B7355] text-[#8B7355] hover:bg-[#8B7355] hover:text-white transition-colors bg-white shadow-soft flex items-center justify-center"
        aria-label="Scroll left"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Infinite Carousel Container */}
      <div className="overflow-hidden py-4 px-2 w-full">
        <motion.div layout className="flex gap-6 w-max">
          <AnimatePresence mode="popLayout" initial={false}>
            {cards.map((card) => (
              <motion.div 
                layout
                key={card.title}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                onClick={() => navigate(card.link)}
                className={`w-[280px] md:w-[320px] shrink-0 flex flex-col p-6 rounded-[30px] border border-border/50 shadow-sm cursor-pointer hover:shadow-xl hover:scale-[1.03] transition-all duration-300 bg-[#F4F5F7]`}
              >
                <h3 className="text-xl font-handwritten font-bold text-[#8B7355] leading-tight mb-2 h-14">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600 font-medium mb-4 h-10">
                  {card.subtitle}
                </p>
                
                {/* Image Placeholder area */}
                <div className="flex-grow bg-slate-200/50 rounded-[20px] mb-6 flex items-center justify-center relative overflow-hidden min-h-[140px]">
                  <span className="text-xs text-gray-400 font-handwritten absolute pointer-events-none">{card.imagePlaceholder}</span>
                </div>
                
                <span className="text-lg font-handwritten font-bold text-[#8B7355] hover:text-pastel-pink transition-colors">
                  {card.action}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Right Arrow */}
      <button 
        onClick={handleNext}
        className="absolute right-0 lg:right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full border-2 border-[#8B7355] text-[#8B7355] hover:bg-[#8B7355] hover:text-white transition-colors bg-white shadow-soft flex items-center justify-center"
        aria-label="Scroll right"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default NavigationCards;
