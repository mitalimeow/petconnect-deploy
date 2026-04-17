import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LocationGuard = ({ children, title = "Location Access Required", message = "You must enable location access to view nearby pets, clinics, and community data." }) => {
  const [locStatus, setLocStatus] = useState('checking'); // checking, granted, denied
  const { user } = useAuth();

  useEffect(() => {
    const checkLocation = () => {
      if (!navigator.geolocation) {
        setLocStatus('denied');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocStatus('granted');
          
          // Securely sync the location to backend for background geo-alerts
          if (user) {
            fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`}/api/profile/location`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'include',
              body: JSON.stringify({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
              })
            }).catch(e => console.error("Silently failed to sync geo-location.", e));
          }
        },
        (error) => {
          setLocStatus('denied');
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 }
      );
    };

    checkLocation();
  }, []);

  if (locStatus === 'checking') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full animate-in fade-in duration-500 font-sans">
        <div className="w-16 h-16 border-4 border-gray-100 border-t-orange-500 rounded-full animate-spin mb-6"></div>
        <h3 className="text-2xl font-handwritten font-bold text-gray-900 mb-2">Finding you...</h3>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Please allow location access</p>
      </div>
    );
  }

  if (locStatus === 'denied') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4 text-center py-12 font-sans animate-in zoom-in duration-300">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[30px] flex items-center justify-center mb-8 shadow-sm border border-red-100 transform rotate-3">
          <MapPin size={40} className="opacity-80" />
        </div>
        
        <h2 className="text-5xl font-handwritten font-bold text-gray-900 mb-6">{title}</h2>
        
        <p className="text-gray-500 font-bold text-lg max-w-md mx-auto mb-10 leading-relaxed">
          {message}
        </p>

        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-soft max-w-md w-full relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 bg-amber-400 h-full"></div>
           <div className="flex flex-col gap-4 text-left relative z-10">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                <h4 className="font-bold text-xl text-gray-900">How to fix this?</h4>
              </div>
              <p className="text-[13px] text-gray-500 font-bold leading-relaxed">
                 You must allow location access in your browser settings to proceed. Click the lock icon 🔒 next to the URL bar, set Location to "Allow", and refresh this page.
              </p>
           </div>

           <button 
             onClick={() => window.location.reload()}
             className="mt-8 w-full py-4.5 bg-gray-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all"
           >
             I've Enabled It — Refresh
           </button>
        </div>
      </div>
    );
  }

  // If granted, render the actual page
  return <>{children}</>;
};

export default LocationGuard;
