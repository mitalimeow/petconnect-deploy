import React from 'react';
import { useAuth } from '../context/AuthContext';

const WelcomeBanner = () => {
  const { user } = useAuth();

  return (
    <div className="mb-2 pl-2">
      <h1 
        className="text-[42px] md:text-6xl text-foreground tracking-wide font-normal"
        style={{ fontFamily: "'Gloria Hallelujah', cursive" }}
      >
        Welcome back, {user?.name?.split(' ')[0] || 'Guest'}!
      </h1>
    </div>
  );
};

export default WelcomeBanner;
