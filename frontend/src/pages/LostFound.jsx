import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import geohash from 'ngeohash';
import L from 'leaflet';
import { CheckCircle, UploadCloud, X, MapPin, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, startAt, endAt, onSnapshot } from 'firebase/firestore';
import * as geofire from 'geofire-common';

// Fix leaflet default icon issue when used with Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LostFound = () => {
  const [position, setPosition] = useState({ lat: 19.0760, lng: 72.8777 }); // Default: Mumbai
  const [ghash, setGhash] = useState('');
  const [loadingLoc, setLoadingLoc] = useState(true);

  // Smart Location State
  const [address, setAddress] = useState('');
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Image Upload State
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // New Form Fields State
  const [animalType, setAnimalType] = useState('');
  const [petName, setPetName] = useState('');
  const [characteristics, setCharacteristics] = useState('');

  // Real-time Firebase State (Replaced Mocks)
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    if (!position || position.lat === 0) return;

    const center = [position.lat, position.lng];
    const radiusInM = 5 * 1000; // 5km radius
    const bounds = geofire.geohashQueryBounds(center, radiusInM);

    const unsubscribes = [];
    const matchedDocs = new Map();

    if (!db) {
      console.warn("Firebase not configured. Bypassing live sync.");
      setRecentReports([]);
      return;
    }

    for (const b of bounds) {
      const q = query(
        collection(db, 'LostPets'),
        orderBy('geohash'),
        startAt(b[0]),
        endAt(b[1])
      );

      const unsub = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const pet = change.doc.data();
          const docId = change.doc.id;
          
          if (change.type === 'removed' || pet.status !== 'Lost') {
            matchedDocs.delete(docId);
          } else {
            const dist = geofire.distanceBetween(center, [pet.location.latitude, pet.location.longitude]);
            if (dist <= 5) { // 5km strict
              // Format exactly like the mocks so the slider works out-of-the-box
              matchedDocs.set(docId, { 
                id: docId, 
                distanceKm: dist, 
                name: pet.pet_name, 
                type: pet.animal_type,
                photo: pet.photo_url || "https://images.unsplash.com/photo-1543466835-00a7907e9de1",
                characteristics: pet.characteristics,
                ownerUsername: pet.owner_id, // Map for routing
                ...pet 
              });
            } else {
              matchedDocs.delete(docId); 
            }
          }
        });
        
        setRecentReports(Array.from(matchedDocs.values()));
      });
      unsubscribes.push(unsub);
    }

    return () => unsubscribes.forEach(unsub => unsub());
  }, [position]);

  const navigate = useNavigate();
  const markerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLoadingLoc(false);
        },
        (err) => {
          console.warn("Geolocation denied or error. Using default location.", err);
          setLoadingLoc(false);
        }
      );
    } else {
      setLoadingLoc(false);
    }
  }, []);

  useEffect(() => {
    // 1. Technical Backend Data
    setGhash(geohash.encode(position.lat, position.lng, 7));

    // 2. Reverse Geocoding for Smart Location UI
    const fetchAddress = async () => {
      setFetchingAddress(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`);
        const data = await res.json();

        // Extract a clean, contextual location name without dumping the entire raw address
        if (data.display_name) {
          const parts = data.display_name.split(',');
          // Just take the first two specific identifiers (e.g. Landmark, Neighborhood)
          const friendlyName = parts.slice(0, Math.min(2, parts.length)).join(',').trim();
          setAddress(friendlyName);
        } else {
          setAddress("Unknown Location");
        }
      } catch (err) {
        console.error("Reverse Geocoding failed", err);
        setAddress("Location details unavailable");
      } finally {
        setFetchingAddress(false);
      }
    };

    // Add a debounce to prevent spamming OSM API while the user drags the pin
    const timeoutId = setTimeout(fetchAddress, 800);
    return () => clearTimeout(timeoutId);
  }, [position]);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          setPosition(latLng);
        }
      },
    }),
    [],
  );

  // --- DIAGNOSTIC PROTOCOL: STEP 1 (Frontend Illusion) ---
  useEffect(() => {
    // If Oliver is still in state, the API hasn't successfully overwritten it.
    const isMockData = recentReports.some(pet => pet.name === "Oliver" && pet.ownerUsername === "mitalimeow");
    
    console.group("Diagnostic: Swiper Data Source");
    console.log("Current Array Length:", recentReports.length);
    console.log("Data Source:", isMockData ? "❌ HARDCODED MOCKS" : "✅ LIVE API DATA");
    console.table(recentReports.map(p => ({ Name: p.name || p.pet_name, Type: p.type || p.animal_type })));
    console.groupEnd();
  }, [recentReports]);

  // --- DIAGNOSTIC PROTOCOL: STEP 3 (Read Failure Coordinate Interceptor) ---
  useEffect(() => {
    // Simulating the interceptor before a theoretical fetch call
    const radiusInKm = 5;
    console.group("Diagnostic: API Request Payload (Interceptor)");
    if (!position || position.lat === 0 || position.lng === 0) {
        console.error("🚨 CRITICAL: Browser sent zero-coordinates. Geolocation is pending or blocked.");
    } else {
        const isSwapped = position.lat > 50 && position.lng < 30; 
        console.log("Target Lat:", position.lat);
        console.log("Target Lng:", position.lng);
        console.log("Radius:", radiusInKm, "km");
        if (isSwapped) console.warn("⚠️ WARNING: Coordinates appear swapped! You might be querying the ocean.");
    }
    console.groupEnd();
  }, [position]);

  // --- Image Compression & Upload Logic ---
  const processImage = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX = 1200; // Limit as per prompt specifications
        
        if (width > height) {
          if (width > MAX) { height *= MAX / width; width = MAX; }
        } else {
          if (height > MAX) { width *= MAX / height; height = MAX; }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85); // Compress and set as preview
        setImagePreview(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImage(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      processImage(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Technical Broadcast Logic Simulation
    console.group("Lost & Found Broadcast Activity");
    console.log(`[Diagnostic] Triggering 5km proximity scan from { lat: ${position.lat}, lng: ${position.lng} }`);
    console.log(`[Diagnostic] Payload: ${petName} (${animalType}), Characteristics: ${characteristics}`);
    console.log(`[Technical] API Request: POST /api/v1/broadcast/lost-pet radius=5000 location=${ghash}`);
    console.log("[Status] Alert sent! Community nodes within 5km notified.");
    console.groupEnd();

    setShowSuccessModal(true);
  };

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-8 mb-20 animate-in fade-in zoom-in-95 duration-500 font-sans">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-handwritten font-bold text-gray-900 leading-none mb-3">
            Lost & Found Network
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto font-medium text-lg">
            Help your community bring your pet home safely.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {/* Top Map Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <MapPin size={16} className="text-pastel-pink" />
              Confirm Last Seen Location
            </h3>
            <div className="w-full h-[250px] rounded-[30px] overflow-hidden shadow-lg border border-black/5 relative bg-gray-100 z-0">
              {!loadingLoc ? (
                <MapContainer center={position} zoom={15} scrollWheelZoom={true} className="w-full h-full z-0">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  <Marker
                    draggable={true}
                    eventHandlers={eventHandlers}
                    position={position}
                    ref={markerRef}
                  >
                    <Popup minWidth={90}>Drag to pinpoint exact location.</Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center font-bold text-gray-500 gap-3">
                  <div className="w-8 h-8 rounded-full border-4 border-pastel-pink border-t-transparent animate-spin"></div>
                  Locating you...
                </div>
              )}
            </div>
            {/* Location Insight Sub-bar */}
            <div className="px-5 py-3 bg-indigo-50/50 text-indigo-900 font-bold rounded-2xl border border-indigo-100/50 flex items-center gap-3 text-sm">
              {fetchingAddress ? (
                <span className="animate-pulse opacity-60 italic">Updating context...</span>
              ) : (
                <span className="line-clamp-1 italic font-medium">
                  {address ? `Pinned near: ${address}` : "Move the pin to set the location."}
                </span>
              )}
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-xl shadow-gray-200/50 border border-gray-100 transition-all duration-300">
            <h2 className="text-2xl font-bold mb-8 text-gray-800">
              Reporting Details
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Animal Type Selector - Manual Input */}
              <div className="md:col-span-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-2.5 block">Animal Type</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Dog, Cat, Parrot..."
                  value={animalType}
                  onChange={(e) => setAnimalType(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-bold text-[15px]"
                />
              </div>

              {/* Pet Name */}
              <div className="md:col-span-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-2.5 block">Pet Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Max, Bella..."
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-bold text-[15px]"
                />
              </div>

              {/* Distinct Characteristics */}
              <div className="md:col-span-2">
                <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-2.5 block">Distinct Characteristics</label>
                <textarea
                  required
                  rows="3"
                  placeholder="e.g. Wearing a red collar, Limping on back leg, Blue eyes..."
                  value={characteristics}
                  onChange={(e) => setCharacteristics(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-medium text-[15px] leading-relaxed resize-none"
                ></textarea>
              </div>

              {/* Media Upload */}
              <div className="md:col-span-2">
                <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-2.5 block">Update Photo Evidence</label>
                {!imagePreview ? (
                  <div 
                    className={`w-full h-40 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-orange-500 bg-orange-50 scale-[1.01]' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/50 hover:border-gray-300'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3 text-gray-400">
                      <UploadCloud size={24} />
                    </div>
                    <span className="text-sm font-bold text-gray-500">Drag & Drop or Click to Upload</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileInput} 
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-48 rounded-3xl overflow-hidden shadow-inner border border-gray-100 group">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                    <button 
                      type="button" 
                      onClick={() => setImagePreview(null)}
                      className="absolute top-4 right-4 w-10 h-10 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-md opacity-0 group-hover:opacity-100"
                      title="Remove Image"
                    >
                      <X size={20} strokeWidth={3} />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 pt-4">
                <button type="submit" className="w-full py-5 bg-[#E65100] text-white font-black rounded-3xl shadow-xl shadow-orange-900/10 hover:bg-[#BF360C] hover:-translate-y-1 active:scale-[0.98] transition-all text-xl uppercase tracking-widest flex justify-center items-center gap-3">
                  {loadingLoc ? 'Securing Location...' : 'Report Lost Pet'} 🐾
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Recent Reports Slider Section */}
        <div className="mt-20 pt-10 border-t border-gray-100 mb-10">
          <div className="flex flex-col items-center mb-10">
            <h2 className="text-5xl font-handwritten font-bold text-gray-900 leading-none mb-3">
              Help Find These Pets
            </h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] opacity-60">
              Community sightings needed within your 15km area
            </p>
          </div>

          <div className="px-2">
            <Swiper
              modules={[Pagination]}
              spaceBetween={20}
              slidesPerView={'auto'}
              pagination={{ clickable: true }}
              className="pb-16 pet-slider"
            >
              {recentReports.map((pet) => {
                const dist = 1.2;
                return (
                  <SwiperSlide key={pet.id} className="w-[300px]">
                    <div className="bg-white rounded-[40px] overflow-hidden shadow-xl shadow-gray-100/50 border border-gray-100 group transition-all duration-300 hover:-translate-y-2">
                      <div className="h-56 relative w-full overflow-hidden">
                        <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute top-4 left-4 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                          <MapPin size={12} className="text-orange-400" />
                          Last seen {dist}km away
                        </div>
                      </div>
                      <div className="p-7">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-2xl font-handwritten font-bold text-gray-900 leading-tight">{pet.name}</h3>
                            <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400">{pet.type}</span>
                          </div>
                        </div>
                        <p className="text-gray-500 text-sm font-medium mb-6 line-clamp-2 leading-relaxed italic">"{pet.characteristics}"</p>
                        <div className="flex gap-2">
                          <button onClick={() => navigate(`/profile/${pet.ownerUsername}`)} className="flex-1 py-4 bg-gray-900 text-white font-black rounded-[20px] shadow-lg hover:bg-black transition-all text-[10px] uppercase tracking-widest flex justify-center items-center gap-2"><Phone size={14} /> Contact</button>
                          <button 
                            onClick={() => {
                              setRecentReports(prev => prev.filter(r => r.id !== pet.id));
                              alert(`Thank you! The community has been notified that ${pet.name} may have been spotted.`);
                            }}
                            className="px-5 py-4 bg-orange-50 text-[#E65100] border border-orange-100 font-black rounded-[20px] hover:bg-orange-100 transition-all text-[10px] uppercase tracking-widest"
                          >
                            Found
                          </button>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>
      </div>

      <style>{`
        .pet-slider .swiper-pagination-bullet { width: 30px; height: 6px; border-radius: 3px; background: #E65100; opacity: 0.2; transition: all 0.3s; }
        .pet-slider .swiper-pagination-bullet-active { width: 50px; opacity: 1; background: #E65100; }
        .pet-slider .swiper-slide { height: auto; }
      `}</style>

      {/* Success Modal Overlay */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowSuccessModal(false)}></div>
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-[450px] relative z-10 p-12 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500 border border-white">
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            >
              <X size={24} strokeWidth={2.5} />
            </button>
            <div className="w-28 h-28 bg-orange-50 text-orange-500 rounded-[35px] flex items-center justify-center mb-8 shadow-inner border-4 border-white ring-2 ring-orange-100 animate-bounce group">
              <CheckCircle size={56} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-4xl font-handwritten font-bold text-gray-900 mb-5 leading-tight">Alert Sent!</h2>
            <p className="text-gray-500 font-bold mb-2 text-[16px] leading-relaxed px-2">
              Your community has been notified. We will alert you the moment a sighting is reported.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default LostFound;
