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
import { motion, AnimatePresence } from 'motion/react';

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
    const radiusInM = 20 * 1000; // 20km for coverage
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
            const petLat = pet.location?.latitude;
            const petLng = pet.location?.longitude;
            
            if (petLat && petLng) {
                const dist = geofire.distanceBetween(center, [petLat, petLng]);
                if (dist <= 20) { 
                  matchedDocs.set(docId, { 
                    id: docId, 
                    distanceKm: dist, 
                    name: pet.pet_name, 
                    type: pet.animal_type,
                    photo: pet.photo_url || "https://images.unsplash.com/photo-1543466835-00a7907e9de1",
                    characteristics: pet.characteristics,
                    ownerUsername: pet.owner_id,
                    ...pet 
                  });
                } else {
                  matchedDocs.delete(docId); 
                }
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate Broadcast
    setShowSuccessModal(true);
    setIsReportModalOpen(false);
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
              Report A Lost Pet 🚨
            </button>
            <p className="text-gray-500 font-bold text-sm tracking-wide bg-gray-50 px-6 py-2 rounded-full border border-gray-100">
              Users within <span className="text-orange-600">10km</span> from your location will be pinged.
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

          <div className="px-1 overflow-hidden">
            <Swiper
              modules={[Pagination]}
              spaceBetween={24}
              slidesPerView={'auto'}
              pagination={{ clickable: true }}
              className="pb-16 pet-slider"
            >
              {recentReports.length > 0 ? recentReports.map((pet) => (
                <SwiperSlide key={pet.id} className="w-[320px]">
                  <div className="bg-[#FFF9C4] rounded-[32px] overflow-hidden shadow-xl shadow-yellow-900/5 border border-yellow-100 group transition-all duration-300 hover:-translate-y-2">
                    <div className="h-60 relative w-full overflow-hidden">
                      <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute top-4 left-4 px-4 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={12} className="text-yellow-400" />
                        {pet.distanceKm?.toFixed(1) || '0.5'}km away
                      </div>
                    </div>
                    <div className="p-7">
                      <div className="mb-4">
                        <h3 className="text-2xl font-handwritten font-bold text-gray-900">{pet.name}</h3>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] font-bold text-gray-500 uppercase">Age: {pet.age || '2 yrs'}</span>
                          <span className="text-[10px] font-bold text-gray-500 uppercase">•</span>
                          <span className="text-[10px] font-bold text-gray-500 uppercase">{pet.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-6">
                        <MapPin size={14} className="text-orange-400 shrink-0" />
                        <span className="truncate">{pet.address || 'Near Mumbai Highway'}</span>
                      </div>
                      <button onClick={() => navigate(`/profile/${pet.ownerUsername}`)} className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl shadow-lg hover:bg-black transition-all text-xs uppercase tracking-widest">
                        Contact Owner
                      </button>
                    </div>
                  </div>
                </SwiperSlide>
              )) : (
                [1,2,3].map(i => (
                  <SwiperSlide key={i} className="w-[320px]">
                    <div className="bg-gray-100/50 h-[450px] rounded-[32px] animate-pulse flex items-center justify-center text-gray-300 font-bold italic">
                      Looking for pets...
                    </div>
                  </SwiperSlide>
                ))
              )}
            </Swiper>
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
                          <input 
                            required type="text" placeholder="e.g. Dog" value={animalType} onChange={(e) => setAnimalType(e.target.value)}
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold"
                          />
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
                        <label className="text-[11px] uppercase tracking-widest font-black text-gray-400 mb-2 block">Distinct Characteristics</label>
                        <textarea 
                          required rows="3" placeholder="Red collar, blue eyes, limping..." value={characteristics} onChange={(e) => setCharacteristics(e.target.value)}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-medium resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] uppercase tracking-widest font-black text-gray-400 mb-2 block">Update Photo Evidence</label>
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
                        Report Lost Pet 🐾
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
        .pet-slider .swiper-pagination-bullet { width: 30px; height: 6px; border-radius: 3px; background: #E65100; opacity: 0.1; transition: all 0.3s; }
        .pet-slider .swiper-pagination-bullet-active { width: 50px; opacity: 1; background: #E65100; }
        .pet-slider .swiper-slide { height: auto; }
        .custom-scrollbar-hidden::-webkit-scrollbar { display: none; }
        .custom-scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

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
