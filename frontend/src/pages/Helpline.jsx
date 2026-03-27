import React, { useState, useEffect, useRef } from 'react';
import { Search, Phone, MapPin, Globe, Clock } from 'lucide-react';
import geohash from 'ngeohash';
import ClinicList from '../components/helpline/ClinicList';

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

// 2. Data Mapping: Map TomTom API response to Clinic UI
const mapTomTomData = (poiData) => {
  // Convert dist from meters provided by TomTom, fallback to calculating if missing
  const distKm = poiData.dist ? (poiData.dist / 1000) : 0;
  
  // TomTom specific open/close logic from openingHours
  let openNow = true;
  if (poiData.poi && poiData.poi.openingHours && typeof poiData.poi.openingHours.isOpen === 'boolean') {
    openNow = poiData.poi.openingHours.isOpen;
  }
  
  // Extract categories dynamically
  const specialList = poiData.poi?.categories 
        ? poiData.poi.categories.filter(c => c !== "veterinarian") 
        : ["General Care"];
  
  return {
     id: poiData.id,
     name: poiData.poi?.name || 'Veterinary Clinic',
     phone: poiData.poi?.phone || null,
     address: poiData.address?.freeformAddress || null,
     municipality: poiData.address?.municipality || poiData.address?.localName || null,
     lat: poiData.position?.lat,
     lng: poiData.position?.lon,
     distance: distKm,
     specialties: specialList.length > 0 ? specialList : ["General Care"],
     isOpen: openNow,
     is247: false
  };
};

const Helpline = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userLoc, setUserLoc] = useState({ lat: 19.0760, lng: 72.8777 }); 
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');


  const [visibleCount, setVisibleCount] = useState(10);
  const [isExpanding, setIsExpanding] = useState(false);

  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Implement Debouncing: 500ms wrapper for API triggering
  const triggerFetch = (lat, lng, source) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
        fetchLocalClinics(lat, lng, source);
    }, 500);
  };

  // 1. Fetching Logic with Diagnostics, Session Caching, Deduplication, and Exponential Backoff
  const fetchLocalClinics = async (lat, lng, source = "Initial Page Load") => {
    setLoading(true);
    setIsExpanding(false);
    setErrorMsg('');
    setVisibleCount(10);
    
    console.group(`Helpline Diagnostics: ${source}`);
    const startTime = performance.now();

    // Request Deduplication: Cancel older inflight active requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      // --- Caching Layer: Geohash tied to SessionStorage ---
      const geoKey = geohash.encode(lat, lng, 5); 
      const cacheKey = `petconnect_helpline_cache_${geoKey}_${searchQuery}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      
      if (cachedData && !searchQuery) {
        console.log(`[Diagnostic] Valid Local Cache Found!`);
        const activeClinics = JSON.parse(cachedData).map(c => ({
            ...c,
            distance: getDistance(lat, lng, c.lat, c.lng)
        })).sort((a,b) => a.distance - b.distance);
        
        setClinics(activeClinics);
        setLoading(false);
        console.groupEnd();
        return; 
      }

      const API_KEY = import.meta.env.VITE_TOMTOM_API_KEY;
      if (!API_KEY) throw new Error("Missing VITE_TOMTOM_API_KEY");
      
      if (API_KEY.includes('...') || API_KEY.length < 20) {
        throw new Error("VITE_TOMTOM_API_KEY_FORMAT_INVALID");
      }

      const fetchWithRadius = async (radius) => {
        const queryTerm = searchQuery || 'veterinarian';
        // If name search, use huge radius or no radius (TomTom categorySearch needs radius or it defaults)
        const finalRadius = searchQuery ? 100000 : radius; 
        const targetUrl = `https://api.tomtom.com/search/2/categorySearch/${encodeURIComponent(queryTerm)}.json?key=${API_KEY}&lat=${lat}&lon=${lng}&radius=${finalRadius}&categorySet=9375`;

        const executeFetchWithBackoff = async (retries = 3, delay = 1000) => {
          try {
            const res = await fetch(targetUrl, { method: 'GET', signal });
            if (res.status === 429 && retries > 0) {
              setErrorMsg("High Traffic - Retrying...");
              await new Promise(r => setTimeout(r, delay));
              return executeFetchWithBackoff(retries - 1, delay * 2); 
            }
            if (!res.ok) {
              if (res.status === 403 || res.status === 400) throw new Error("VITE_TOMTOM_API_KEY_FORMAT_INVALID");
              throw new Error(`API failed. Status: ${res.status}`);
            }
            return res;
          } catch (err) {
            if (err.name === 'AbortError') throw err; 
            if (retries > 0) {
              await new Promise(r => setTimeout(r, delay));
              return executeFetchWithBackoff(retries - 1, delay * 2);
            }
            throw err;
          }
        };

        const res = await executeFetchWithBackoff();
        return await res.json();
      };

      // strictly 15km search per latest request
      let data = await fetchWithRadius(15000);

      if (!data.results || data.results.length === 0) {
        setErrorMsg("No verified clinics found in your immediate area. Please call our central helpline.");
        setClinics([]);
      } else {
        const realClinics = data.results.map(mapTomTomData);
        realClinics.sort((a,b) => a.distance - b.distance);
        
        if (!searchQuery) sessionStorage.setItem(cacheKey, JSON.stringify(realClinics));
        setClinics(realClinics);
      }
    } catch(err) {
      if (err.name === 'AbortError') return;
      console.error("[Diagnostic] Fatal Error:", err);
      if (err.message === "VITE_TOMTOM_API_KEY_FORMAT_INVALID") {
        setErrorMsg('Invalid API Key Detected - Please check .env formatting.');
      } else {
        setErrorMsg(`We're having trouble reaching the clinic database. Please try again later.`);
      }
    } finally {
      console.groupEnd();
      setLoading(false);
      setIsExpanding(false);
    }
  };

  useEffect(() => {
    // Component Mount execution
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLoc(loc);
          triggerFetch(loc.lat, loc.lng, "Geolocation Success");
        },
        (err) => {
          console.warn("Geolocation denied. Using fallback mapping zones (Mumbai).", err);
          setErrorMsg(''); 
          triggerFetch(userLoc.lat, userLoc.lng, "Geolocation Fallback");
        }
      );
    } else {
      triggerFetch(userLoc.lat, userLoc.lng, "Geolocation Unsupported");
    }

    // Cleanup aborts to prevent ghost state updates on unmount
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredClinics = clinics
    .filter(c => 
      (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       c.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())))
    );

  const visibleClinics = filteredClinics.slice(0, visibleCount);
  const hasMore = visibleCount < filteredClinics.length;

  return (
    <div className="w-full flex justify-center py-8 px-4 animate-in slide-in-from-bottom-4 duration-500 bg-[#fafafa] min-h-screen">
      
      <div className="w-full max-w-4xl mx-auto min-h-[85vh] relative flex flex-col">
        
        <div className="flex flex-col mb-10 gap-3">
          <h1 className="text-4xl lg:text-5xl font-handwritten font-extrabold tracking-wide uppercase text-gray-900 leading-none">
            Emergency <span className="text-green-600">Helpline</span>
          </h1>
          <p className="text-gray-500 font-medium text-sm lg:text-base opacity-80">
            Real-time geospatial tracking for verified veterinary clinics expanding up to 15km.
          </p>
        </div>

        {/* Sticky Search and Filter Bar */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md pt-2 pb-6 border-b border-gray-50 -mx-4 px-4 mb-4">
          <div className="flex flex-col gap-4">
            <div className="relative w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                 type="text" 
                 placeholder="Search clinics, specialties..."
                 className="w-full pl-14 pr-6 py-3.5 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 border border-gray-100 font-bold placeholder-gray-400 transition-all text-lg text-gray-800"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
              />
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
