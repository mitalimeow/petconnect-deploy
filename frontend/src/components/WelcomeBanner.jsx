import React, { useState, useEffect } from 'react';

const WelcomeBanner = () => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('petconnect_token');
        if (!token) {
          // Fallback to localStorage user if token isn't strictly used in the same way 
          const storedUser = localStorage.getItem('petconnect_user');
          if (storedUser) {
            setUserName(JSON.parse(storedUser).name);
          }
          return;
        }

        const response = await fetch('http://localhost:5000/api/user/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserName(data.name);
        } else {
          // Fallback if API fails
          const storedUser = localStorage.getItem('petconnect_user');
          if (storedUser) setUserName(JSON.parse(storedUser).name);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        const storedUser = localStorage.getItem('petconnect_user');
        if (storedUser) setUserName(JSON.parse(storedUser).name);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="mb-8 pl-2">
      <h1 className="text-4xl md:text-5xl font-handwritten font-bold text-foreground tracking-wide">
        Welcome back, {userName || 'Guest'}!
      </h1>
    </div>
  );
};

export default WelcomeBanner;
