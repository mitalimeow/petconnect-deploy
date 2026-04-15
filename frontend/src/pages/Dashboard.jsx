import React from 'react';
import WelcomeBanner from '../components/WelcomeBanner';
import EventsCarousel from '../components/EventsCarousel';
import NavigationCards from '../components/NavigationCards';
import StatsPieChart from '../components/StatsPieChart';
import UserSearch from '../components/community/UserSearch';
import AddEventModal from '../components/events/AddEventModal';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [isAddEventModalOpen, setIsAddEventModalOpen] = React.useState(false);
  const [eventTriggerCount, setEventTriggerCount] = React.useState(0);

  
  const professionalTags = [
    'shelter owner', 
    'vet', 
    'pet store', 
    'trainer', 
    'ethical breeder', 
    'transporter', 
    'pet stylist',
    'admin'
  ];
  const isProfessional = user?.tags?.some(tag => {
    const tagName = typeof tag === 'string' ? tag : (tag?.name || '');
    return professionalTags.includes(tagName.toLowerCase());
  });

  return (
    <div className="w-full min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 pt-8">
        {/* User Search Bar */}
        <div className="w-full flex justify-end mb-6">
          <UserSearch />
        </div>

        {/* 1. Welcome Section */}
        <WelcomeBanner />

        <hr className="border-[#d4cacc] my-8 max-w-[98%] mx-auto" />

        {/* 2. Pet Events Carousel (Top Highlight) */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
          <div>
            <h2 
              className="text-4xl md:text-[46px] font-bold tracking-tighter leading-none"
              style={{ fontFamily: "'Rowdies', cursive", textTransform: 'uppercase', color: '#6e2626' }}
            >
              UPCOMING EVENTS
            </h2>
            <p className="mt-4 text-xl md:text-3xl leading-snug" style={{ fontFamily: "'Dekko', cursive", color: '#5e4141' }}>
              Discover paws-itive ways to get involved and meet other pet lovers in your area.
            </p>
          </div>
          {isProfessional && (
            <button 
              onClick={() => setIsAddEventModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all focus:ring-2 focus:ring-green-400 focus:outline-none focus:ring-offset-2 shrink-0 h-fit"
            >
              Add Event
            </button>
          )}
        </div>
        <EventsCarousel triggerFetch={eventTriggerCount} />

        <hr className="border-[#d4cacc] mt-2 mb-10 max-w-[98%] mx-auto" />

        {/* 3. Navigation Cards Carousel */}
        <div className="mb-6 px-2">
          <h2 
            className="text-4xl md:text-[46px] font-bold tracking-tighter leading-none"
            style={{ fontFamily: "'Rowdies', cursive", textTransform: 'uppercase', color: '#6e2626' }}
          >
            QUICK REDIRECTS
          </h2>
          <p className="mt-4 text-xl md:text-3xl leading-snug" style={{ fontFamily: "'Dekko', cursive", color: '#5e4141' }}>
            Everything you need to care for, connect with, and protect your pets is just a click away.
          </p>
        </div>
        <NavigationCards />

        <hr className="border-[#d4cacc] mt-2 mb-10 max-w-[98%] mx-auto" />

        {/* 4. Pie Chart (Statistics) */}
        <div className="px-2">
          <StatsPieChart />
        </div>
      </div>

      <AddEventModal 
        isOpen={isAddEventModalOpen} 
        onClose={() => setIsAddEventModalOpen(false)} 
        onSuccess={() => setEventTriggerCount(prev => prev + 1)}
      />
    </div>
  );
};

export default Dashboard;
