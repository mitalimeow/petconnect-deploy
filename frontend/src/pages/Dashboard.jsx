import React from 'react';
import WelcomeBanner from '../components/WelcomeBanner';
import EventsCarousel from '../components/EventsCarousel';
import NavigationCards from '../components/NavigationCards';
import StatsPieChart from '../components/StatsPieChart';
import UserSearch from '../components/community/UserSearch';

const Dashboard = () => {
  return (
    <div className="w-full min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 pt-8">
        {/* User Search Bar */}
        <div className="w-full flex justify-end mb-6">
          <UserSearch />
        </div>

        {/* 1. Welcome Section */}
        <WelcomeBanner />

        {/* 2. Pet Events Carousel (Top Highlight) */}
        <EventsCarousel />

        {/* 3. Navigation Cards Carousel */}
        <NavigationCards />

        {/* 4. Pie Chart (Statistics) */}
        <StatsPieChart />
      </div>
    </div>
  );
};

export default Dashboard;
