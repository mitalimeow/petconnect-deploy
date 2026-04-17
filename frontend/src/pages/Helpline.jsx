import React, { useState } from 'react';
import { Phone, MapPin, Globe, Clock, Search, RefreshCw } from 'lucide-react';
import ClinicList from '../components/helpline/ClinicList';
import { SearchBox } from '@mapbox/search-js-react';

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; 
}

const mapMapboxData = (feature, userLat, userLng) => {
  const fLat = feature.properties?.coordinates?.latitude ?? feature.geometry.coordinates[1];
  const fLng = feature.properties?.coordinates?.longitude ?? feature.geometry.coordinates[0];
  const dist = (userLat && userLng) ? getDistance(userLat, userLng, fLat, fLng) : 0;

  return {
     id: feature.properties.mapbox_id,
     name: feature.properties.name || feature.properties.place_name || 'Veterinary Clinic',
     phone: feature.properties.telephone || feature.properties.metadata?.phone || null,
     address: feature.properties.full_address || feature.properties.place_name || null,
     municipality: feature.properties.context?.locality?.name || feature.properties.context?.place?.name || null,
     lat: fLat,
     lng: fLng,
     distance: dist,
     specialties: feature.properties.poi_category ? [feature.properties.poi_category[0]] : ["General Care"],
     isOpen: true,
     is247: false
  };
};

const Helpline = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  const [userLoc, setUserLoc] = useState({ lat: 19.0760, lng: 72.8777 });

  const fetchInitialClinics = async (lat, lng) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const accessToken = "pk.eyJ1IjoibWl0YWxpbWVvdyIsImEiOiJjbW5wa3JwbG0xNjBxMnFwbHB4emVtaHFrIn0.Gd1xvYQpeZYXjajCZT00eQ";
      const targetUrl = `https://api.mapbox.com/search/searchbox/v1/forward?q=veterinary&proximity=${lng},${lat}&access_token=${accessToken}`;
      const res = await fetch(targetUrl);
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      
      if (data.features && data.features.length > 0) {
        const realClinics = data.features.map(f => mapMapboxData(f, lat, lng));
        realClinics.sort((a,b) => a.distance - b.distance);
        setClinics(realClinics);
      } else {
        setErrorMsg("No clinics found matching your criteria.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("We're having trouble reaching the clinic database.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLoc({ lat, lng });
          fetchInitialClinics(lat, lng);

          // Background sync to backend for distance calculations
          const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`;
          fetch(`${API_BASE}/api/profile/location`, {
             method: 'PATCH',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ lat, lng }),
             credentials: 'include'
          }).catch(err => console.log('Location sync failed silently', err));
        },
        (err) => {
          console.warn("Geolocation denied. Using fallback mapping zones (Mumbai).", err);
          setUserLoc({ lat: 19.0760, lng: 72.8777 });
          fetchInitialClinics(19.0760, 72.8777); // Mumbai fallback
        }
      );
    } else {
      setUserLoc({ lat: 19.0760, lng: 72.8777 });
      fetchInitialClinics(19.0760, 72.8777);
    }
  }, []);

  const handleRetrieve = (res) => {
    if (res && res.features && res.features.length > 0) {
      const feature = res.features[0];
      const newClinic = mapMapboxData(feature, userLoc.lat, userLoc.lng);
      setClinics(prev => {
        const filtered = prev.filter(c => c.id !== newClinic.id);
        return [newClinic, ...filtered];
      });
      setVisibleCount(10);
      console.log("Clinic found at:", feature.geometry.coordinates);
    }
  };

  const visibleClinics = clinics.slice(0, visibleCount);
  const hasMore = visibleCount < clinics.length;

  return (
    <div className="w-full flex justify-center py-8 px-4 animate-in slide-in-from-bottom-4 duration-500 bg-[#fafafa] min-h-screen">
      
      <div className="w-full max-w-4xl mx-auto min-h-[85vh] relative flex flex-col">
        
        <div className="flex flex-col mb-10 gap-3">
          <h1 className="text-4xl lg:text-5xl font-handwritten font-extrabold tracking-wide uppercase text-gray-900 leading-none">
            Emergency <span className="text-green-600">Helpline</span>
          </h1>
          <p className="text-gray-500 font-medium text-sm lg:text-base opacity-80">
            Connect with nearby veterinary clinics.
          </p>
        </div>

        {/* Search */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md pt-2 pb-6 border-b border-gray-50 -mx-4 px-4 mb-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 rounded-2xl bg-white border border-gray-100 shadow-sm p-1">
                <SearchBox
                  accessToken="pk.eyJ1IjoibWl0YWxpbWVvdyIsImEiOiJjbW5wa3JwbG0xNjBxMnFwbHB4emVtaHFrIn0.Gd1xvYQpeZYXjajCZT00eQ"
                  options={{
                    language: 'en',
                    country: 'IN'
                  }}
                  popoverOptions={{
                    placement: 'bottom-start'
                  }}
                  onRetrieve={handleRetrieve}
                  theme={{
                    variables: {
                      fontFamily: 'inherit',
                      unit: '18px',
                      padding: '0.75em 1em 0.75em 1em',
                      borderRadius: '1rem',
                      boxShadow: 'none',
                    }
                  }}
                />
              </div>
              <button
                onClick={() => fetchInitialClinics(userLoc.lat, userLoc.lng)}
                title="Refresh locations"
                className="p-3 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 hover:text-green-600 transition-all shadow-sm active:scale-95 flex items-center justify-center h-[58px]"
              >
                <RefreshCw size={22} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">

          {errorMsg && (
            <div className="mb-6 bg-amber-50 text-amber-700 px-4 py-3 border border-amber-100 rounded-2xl text-[14px] font-bold shadow-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              {errorMsg}
            </div>
          )}

          <ClinicList 
            clinics={visibleClinics} 
            loading={loading} 
            hasMore={hasMore} 
            onLoadMore={() => setVisibleCount(prev => prev + 10)} 
          />
        </div>
      </div>

    </div>
  );
};

export default Helpline;
