import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import PetCard from '../components/adopt/PetCard';
import geohash from 'ngeohash';
import L from 'leaflet';
import { CheckCircle, UploadCloud, X, MapPin, Phone } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import CardSkeleton from '../components/common/CardSkeleton';

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
  
  // New State for Modal Flow
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

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
  const [visibleCount, setVisibleCount] = useState(16);

  useEffect(() => {
    if (!position || position.lat === 0) return;

    const fetchLocalPets = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/lost?lat=${position.lat}&lng=${position.lng}`);
        if (res.ok) {
          const data = await res.json();
          const mappedPets = data.map(pet => {
             // Handle numeric extraction from distance string like "3.1 km" or "400 m"
             let distNum = 0.5;
             if (pet.distance) {
                if (pet.distance.includes('m') && !pet.distance.includes('km')) {
                   // meters
                   distNum = parseFloat(pet.distance) / 1000;
                } else {
                   distNum = parseFloat(pet.distance);
                }
             }
             
              return {
                ...pet,
                id: pet._id,
                distanceKm: distNum, 
                distanceRaw: pet.distance,
                name: pet.petName,
                type: pet.animalType,
                photo: pet.image,
                characteristics: pet.extraInfo,
                ownerUsername: pet.ownerId?.username || '',
                ownerName: pet.ownerId?.name || 'Community Member',
                ownerPhoto: pet.ownerId?.profilePhoto || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
                lat: pet.lastSeenLocation?.lat,
                lng: pet.lastSeenLocation?.lng,
                address: pet.lastSeenLocation?.address || 'Unknown Location'
             };
          });
          // Sort descendingly to be closest distance first
          const sortedPets = mappedPets.sort((a, b) => a.distanceKm - b.distanceKm);
          setRecentReports(sortedPets);
        }
      } catch (err) {
        console.error("Error fetching lost pets from backend:", err);
      }
    };

    fetchLocalPets();
  }, [position]);

  const navigate = useNavigate();
  const location = useLocation();
  const markerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Hook into Notification cross-page clicks
  useEffect(() => {
    if (location.state?.openPetId) {
       const fetchTargetPet = async () => {
          try {
             const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
             const res = await fetch(`${API_BASE}/api/lost/${location.state.openPetId}`);
             if (res.ok) {
                const p = await res.json();
                setSelectedPet({
                   id: p._id,
                   distanceKm: 0.1, // mock since it could be far
                   name: p.petName,
                   type: p.animalType,
                   photo: p.image,
                   characteristics: p.extraInfo,
                   ownerUsername: p.ownerId?.username || '',
                   ownerName: p.ownerId?.name || 'Community Member',
                   ownerPhoto: p.ownerId?.profilePhoto || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
                   lat: p.lastSeenLocation?.lat,
                   lng: p.lastSeenLocation?.lng,
                   address: p.lastSeenLocation?.address || 'Unknown Location'
                });

                // Clear history state immediately so refresh doesn't reopen it
                window.history.replaceState({}, document.title);
             }
          } catch(err) {
             console.error("Failed to load cross-page pet", err);
          }
       };
       fetchTargetPet();
    }
  }, [location.state]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLoadingLoc(false);

          // Background sync to backend for distance calculations
          const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
          fetch(`${API_BASE}/api/profile/location`, {
             method: 'PATCH',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
             credentials: 'include'
          }).catch(err => console.log('Location sync failed silently', err));
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
    setGhash(geohash.encode(position.lat, position.lng, 7));
    const fetchAddress = async () => {
      setFetchingAddress(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`);
        const data = await res.json();
        if (data.display_name) {
          const parts = data.display_name.split(',');
          const friendlyName = parts.slice(0, Math.min(2, parts.length)).join(',').trim();
          setAddress(friendlyName);
        } else {
          setAddress("Unknown Location");
        }
      } catch (err) {
        setAddress("Location details unavailable");
      } finally {
        setFetchingAddress(false);
      }
    };
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

  const processImage = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX = 1200;
        if (width > height) {
          if (width > MAX) { height *= MAX / width; width = MAX; }
        } else {
          if (height > MAX) { width *= MAX / height; height = MAX; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImagePreview(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processImage(e.dataTransfer.files[0]);
  };
  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) processImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const payload = {
        petName,
        animalType,
        extraInfo: characteristics,
        image: imagePreview,
        lastSeenLocation: {
          address,
          lat: position.lat,
          lng: position.lng
        }
      };

      const res = await fetch(`${API_BASE}/api/lost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setShowSuccessModal(true);
        setIsReportModalOpen(false);
        setPetName('');
        setAnimalType('');
        setCharacteristics('');
        setImagePreview(null);
        
        // Trigger a fake pos-change to re-fetch easily
        setPosition(prev => ({...prev})); 
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to post");
      }
    } catch (err) {
      console.error(err);
      alert("Error reporting lost pet");
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-12 mb-20 animate-in fade-in duration-700 font-sans">
        
        {/* Main Hero Section */}
        <div className="text-center mb-16 pt-6">
          <h1 className="text-6xl font-handwritten font-bold text-gray-900 mb-6 drop-shadow-sm">
            Lost & Found Hub
          </h1>
          
          <div className="flex flex-col items-center justify-center gap-4">
            <button 
              onClick={() => setIsReportModalOpen(true)}
              className="px-10 py-5 bg-[#E65100] text-white font-black rounded-full shadow-2xl shadow-orange-900/20 hover:bg-[#BF360C] hover:scale-105 active:scale-95 transition-all text-2xl uppercase tracking-tighter flex items-center gap-3"
            >
              Report A Lost Pet
            </button>
            <p className="text-gray-500 font-bold text-sm tracking-wide bg-gray-50 px-6 py-2 rounded-full border border-gray-100">
               Users within <span className="text-orange-600">5km</span> from your location will be pinged.
            </p>
          </div>
        </div>

        {/* Recently Lost Pets Slider */}
        <div className="mt-12">
          <div className="flex justify-between items-end mb-8 px-2">
            <div>
              <h2 className="text-3xl font-handwritten font-bold text-gray-800">Recently Lost Pets</h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Found reports in your vicinity</p>
            </div>
          </div>

          <div className="px-1 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recentReports.length > 0 ? recentReports.slice(0, visibleCount).map((pet) => (
                <PetCard 
                  key={pet.id} 
                  pet={pet} 
                  distance={pet.distanceRaw}
                  hideContact={true}
                  onClick={() => setSelectedPet(pet)}
                />
              )) : (
                [1,2,3,4,5,6,7,8].map(i => (
                  <CardSkeleton key={i} variant="grid" />
                ))
              )}
            </div>

            {recentReports.length > visibleCount && (
              <div className="flex justify-center mt-12">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 16)}
                  className="px-8 py-4 bg-white border-2 border-orange-100 text-[#E65100] font-black rounded-full hover:bg-orange-50 hover:scale-105 active:scale-95 transition-all shadow-md uppercase tracking-wider text-sm"
                >
                  View More ({recentReports.length - visibleCount} Left)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reporting Modal Overlay */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsReportModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 custom-scrollbar-hidden"
            >
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="absolute top-6 right-8 p-3 bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-all z-20"
              >
                <X size={24} strokeWidth={2.5} />
              </button>

              <div className="p-8 md:p-12">
                <header className="mb-10 text-center md:text-left">
                  <h2 className="text-4xl font-handwritten font-bold text-gray-900 mb-2">Lost & Found Network</h2>
                  <p className="text-gray-500 font-medium">Help your community bring your pet home safely.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                  {/* Left Column: Map */}
                  <div className="lg:col-span-2 space-y-4">
                    <label className="text-[11px] uppercase tracking-widest font-black text-gray-400">Last Seen Location</label>
                    <div className="w-full h-[300px] md:h-[400px] rounded-[30px] overflow-hidden shadow-inner border border-gray-100 relative bg-gray-50">
                      {!loadingLoc ? (
                        <MapContainer center={position} zoom={15} scrollWheelZoom={true} className="w-full h-full">
                          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                          <Marker draggable={true} eventHandlers={eventHandlers} position={position} ref={markerRef} />
                        </MapContainer>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center animate-pulse text-gray-400 font-bold italic">Zeroing in...</div>
                      )}
                    </div>
                    <div className="px-5 py-3 bg-indigo-50/50 rounded-2xl flex items-center gap-3 text-[13px] font-bold text-indigo-900">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                      <span className="line-clamp-1 italic">{fetchingAddress ? 'Calculating address...' : `Pinned near: ${address}`}</span>
                    </div>
                  </div>

                  {/* Right Column: Details */}
                  <div className="lg:col-span-3">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <label className="text-[11px] uppercase tracking-widest font-black text-gray-400 mb-2 block">Animal Type</label>
                          <select 
                            required value={animalType} onChange={(e) => setAnimalType(e.target.value)}
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-gray-800"
                          >
                            <option value="" disabled hidden>Select Animal Type...</option>
                            {['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Turtle', 'Hamster', 'Guinea Pig', 'Others'].map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-1">
                          <label className="text-[11px] uppercase tracking-widest font-black text-gray-400 mb-2 block">Pet Name</label>
                          <input 
                            required type="text" placeholder="e.g. Max" value={petName} onChange={(e) => setPetName(e.target.value)}
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] uppercase tracking-widest font-black text-gray-400 mb-2 block">Extra Information</label>
                        <textarea 
                          required rows="3" placeholder="Red collar, blue eyes, limping..." value={characteristics} onChange={(e) => setCharacteristics(e.target.value)}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-medium resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] uppercase tracking-widest font-black text-gray-400 mb-2 block">Upload photo of pet</label>
                        {!imagePreview ? (
                          <div 
                            className={`w-full h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
                            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
                          >
                            <UploadCloud className="text-gray-300 mb-2" size={32} />
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Drag & Drop Image</span>
                            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileInput} />
                          </div>
                        ) : (
                          <div className="relative h-40 rounded-2xl overflow-hidden group">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button type="button" onClick={() => setImagePreview(null)} className="p-3 bg-red-500 text-white rounded-full"><X size={20} /></button>
                            </div>
                          </div>
                        )}
                      </div>

                      <button type="submit" className="w-full py-5 bg-[#E65100] text-white font-black rounded-3xl shadow-xl hover:bg-[#BF360C] transition-all text-xl uppercase tracking-widest">
                        Report Lost Pet
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar-hidden::-webkit-scrollbar { display: none; }
        .custom-scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Pet Details Modal */}
      <AnimatePresence>
        {selectedPet && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setSelectedPet(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#EBE3DC] rounded-[40px] shadow-2xl w-full max-w-4xl overflow-y-auto relative z-10 custom-scrollbar-hidden flex flex-col md:flex-row p-6 md:p-10 gap-8"
              style={{ maxHeight: 'calc(100vh - 40px)' }}
            >
              <button 
                onClick={() => setSelectedPet(null)}
                className="absolute top-6 right-8 p-3 bg-white/60 hover:bg-white text-gray-600 rounded-full transition-all z-20 shadow-sm"
              >
                <X size={24} strokeWidth={2.5} />
              </button>

              {/* Left: Image */}
              <div className="w-full md:w-5/12 shrink-0 h-64 md:h-[500px] rounded-[32px] overflow-hidden shadow-inner bg-white/50 border border-white/40">
                <img src={selectedPet.photo} alt={selectedPet.name} className="w-full h-full object-cover" />
              </div>

              {/* Right: Details */}
              <div className="flex-1 flex flex-col pt-4">
                 <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                       <span className="font-handwritten text-xl font-bold text-gray-800 ml-2">Name</span>
                       <div className="mt-1 bg-white/90 px-6 py-4 rounded-2xl font-bold text-gray-900 border border-white shadow-sm text-lg">
                          {selectedPet.name}
                       </div>
                    </div>
                    <div>
                       <span className="font-handwritten text-xl font-bold text-gray-800 ml-2">Animal Type</span>
                       <div className="mt-1 bg-white/90 px-6 py-4 rounded-2xl font-bold text-gray-900 border border-white shadow-sm text-lg">
                          {selectedPet.type}
                       </div>
                    </div>
                 </div>

                 <div className="mb-6">
                    <span className="font-handwritten text-xl font-bold text-gray-800 ml-2">Extra information</span>
                    <div className="mt-1 bg-white/90 px-6 py-4 rounded-2xl font-medium text-gray-700 border border-white shadow-sm min-h-[100px]">
                       {selectedPet.characteristics || 'No additional details provided.'}
                    </div>
                 </div>

                 <div className="mb-8 relative">
                    <span className="font-handwritten text-xl font-bold text-gray-800 ml-2">Last seen near</span>
                    <div className="mt-1 bg-white/90 pl-6 pr-2 py-2 rounded-2xl shadow-sm border border-white flex items-center justify-between">
                       <span className="font-medium text-gray-700 line-clamp-2 mr-4">{selectedPet.address}</span>
                       <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${selectedPet.lat},${selectedPet.lng}`}
                          target="_blank" rel="noreferrer"
                          title="Open in Google Maps"
                          className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shrink-0"
                       >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                       </a>
                    </div>
                 </div>

                 <div className="mt-auto text-center pt-4">
                    <p className="font-handwritten text-2xl font-bold text-gray-800 mb-4">Seen this pet? Contact owner ASAP!</p>
                    
                    <div 
                       onClick={() => {
                         setSelectedPet(null);
                         navigate(`/profile/${selectedPet.ownerUsername}`);
                       }}
                       className="inline-flex items-center gap-4 bg-white/95 p-2 pr-8 rounded-full border border-white shadow-sm hover:shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
                    >
                       <img src={selectedPet.ownerPhoto} alt="Owner" className="w-14 h-14 rounded-full object-cover shadow-sm bg-gray-100" />
                       <div className="text-left">
                          <div className="flex items-center gap-2">
                             <span className="font-handwritten font-bold text-xl text-gray-900">{selectedPet.ownerName}</span>
                             <span className="bg-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">Community Member</span>
                          </div>
                          <span className="text-gray-400 font-bold text-sm">@{selectedPet.ownerUsername}</span>
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Static Success Modal (Kept from Previous) */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowSuccessModal(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-[420px] relative z-10 p-12 text-center"
            >
              <div className="w-24 h-24 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} />
              </div>
              <h2 className="text-4xl font-handwritten font-bold text-gray-900 mb-4">Alert Sent!</h2>
              <p className="text-gray-500 font-bold mb-8">Your community has been notified. We will alert you the moment a sighting is reported.</p>
              <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl uppercase tracking-widest">Great</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LostFound;
