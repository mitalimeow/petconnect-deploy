import React, { useState } from 'react';
import ShelterList from './ShelterList';
import { SearchBox } from '@mapbox/search-js-react';
import { RefreshCw } from 'lucide-react';

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
     name: feature.properties.name || feature.properties.place_name || 'Animal Shelter',
     phone: feature.properties.telephone || feature.properties.metadata?.phone || null,
     address: feature.properties.full_address || feature.properties.place_name || null,
     municipality: feature.properties.context?.locality?.name || feature.properties.context?.place?.name || null,
     lat: fLat,
     lng: fLng,
     distance: dist,
     specialties: [],
     isOpen: true,
     is247: false
  };
};

const ShelterLocator = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  const [userLoc, setUserLoc] = useState({ lat: 19.0760, lng: 72.8777 });

  const fetchInitialShelters = async (lat, lng) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const accessToken = "pk.eyJ1IjoibWl0YWxpbWVvdyIsImEiOiJjbW5wa3JwbG0xNjBxMnFwbHB4emVtaHFrIn0.Gd1xvYQpeZYXjajCZT00eQ";
      const targetUrl = `https://api.mapbox.com/search/searchbox/v1/forward?q=animal shelter&proximity=${lng},${lat}&access_token=${accessToken}`;
      const res = await fetch(targetUrl);
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      
      if (data.features && data.features.length > 0) {
        const realShelters = data.features.map(f => mapMapboxData(f, lat, lng));
        realShelters.sort((a,b) => a.distance - b.distance);
        setShelters(realShelters);
      } else {
        setErrorMsg("No shelters found nearby.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("We're having trouble reaching the shelter database.");
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
          fetchInitialShelters(lat, lng);
        },
        (err) => {
          setUserLoc({ lat: 19.0760, lng: 72.8777 });
          fetchInitialShelters(19.0760, 72.8777);
        }
      );
    } else {
      setUserLoc({ lat: 19.0760, lng: 72.8777 });
      fetchInitialShelters(19.0760, 72.8777);
    }
  }, []);

  const handleRetrieve = (res) => {
    if (res && res.features && res.features.length > 0) {
      const feature = res.features[0];
      const newShelter = mapMapboxData(feature, userLoc.lat, userLoc.lng);
      setShelters(prev => {
        const filtered = prev.filter(c => c.id !== newShelter.id);
        return [newShelter, ...filtered];
      });
      setVisibleCount(10);
      console.log("Shelter found at:", feature.geometry.coordinates);
    }
  };

  const visibleShelters = shelters.slice(0, visibleCount);
  const hasMore = visibleCount < shelters.length;

  return (
    <div className="flex flex-col w-full h-full min-h-[400px]">
      {errorMsg && (
        <div className="mb-6 bg-amber-50 text-amber-700 px-4 py-3 border border-amber-100 rounded-2xl text-[14px] font-bold shadow-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
          {errorMsg}
        </div>
      )}

      <div className="mb-6 flex items-center gap-2">
        <div className="relative flex-1 rounded-2xl bg-white border border-gray-100 shadow-sm p-2">
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
                unit: '16px',
                padding: '0.75em 1em',
                borderRadius: '1rem',
                boxShadow: 'none',
              }
            }}
          />
        </div>
        <button
          onClick={() => fetchInitialShelters(userLoc.lat, userLoc.lng)}
          title="Refresh locations"
          className="p-3 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 hover:text-green-600 transition-all shadow-sm active:scale-95 flex items-center justify-center h-[58px]"
        >
          <RefreshCw size={22} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <ShelterList 
        shelters={visibleShelters} 
        loading={loading} 
        hasMore={hasMore} 
        onLoadMore={() => setVisibleCount(prev => prev + 10)} 
      />
    </div>
  );
};

export default ShelterLocator;
