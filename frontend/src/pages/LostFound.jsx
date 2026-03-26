import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import geohash from 'ngeohash';
import L from 'leaflet';
import { CheckCircle, UploadCloud, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    // Here we would dispatch the `ghash`, `imagePreview` (secure sanitization required on backend), 
    // and payload to the backend server.
    // For now, we simulate backend success gracefully.
    setShowSuccessModal(true);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-8 mb-20 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-handwritten font-bold text-gray-900 leading-none mb-3">
            Lost & Found Network
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto font-medium text-lg">
            Drag the pin to accurately mark where the pet was last seen.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Map Column */}
          <div className="w-full lg:w-2/3 h-[500px] rounded-[30px] overflow-hidden shadow-lg border border-black/5 relative bg-gray-100 z-0">
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

          {/* Action Column */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <div className="bg-white p-7 rounded-[30px] shadow-soft border border-gray-100/60 transition-transform duration-300 hover:-translate-y-1">
              <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
                Report Details
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Refactored: Smart Location Display */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-2 block">Location Insight</label>
                  <div className="px-5 py-3.5 bg-[#f0f4f8] text-gray-700 font-medium rounded-2xl shadow-inner border border-[#e2e8f0] flex items-center gap-3">
                    {fetchingAddress ? (
                      <span className="animate-pulse text-indigo-400">Fetching local context...</span>
                    ) : (
                      <span className="line-clamp-2 text-sm leading-relaxed text-indigo-900">
                        {address ? `Last seen near: ${address}` : "Pin a location on the map."}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-2 block">Pet Name / Description</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Max the Golden Retriever..."
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pastel-pink transition-all font-medium text-[15px]"
                  />
                </div>

                {/* New Drop Zone UX element */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-2 block">Pet Photo (Optional)</label>
                  {!imagePreview ? (
                    <div 
                      className={`w-full h-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${isDragging ? 'border-pastel-purple bg-pastel-purple/10 scale-[1.02]' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadCloud className={`${isDragging ? 'text-pastel-purple' : 'text-gray-400'} mb-3 transition-colors`} size={32} />
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
                    <div className="relative w-full h-44 rounded-2xl overflow-hidden shadow-inner border border-gray-200 group">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                      <button 
                        type="button" 
                        onClick={() => setImagePreview(null)}
                        className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md opacity-0 group-hover:opacity-100"
                        title="Remove Image"
                      >
                        <X size={16} strokeWidth={3} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full py-4 bg-black text-white font-bold rounded-2xl shadow-lg hover:bg-gray-800 hover:scale-[1.02] transition-all text-lg flex justify-center items-center gap-2">
                    Trigger Ripple Alert 🐾
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>

      {/* Success Modal Overlay */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSuccessModal(false)}></div>
          <div className="bg-white rounded-[36px] shadow-2xl w-full max-w-[400px] relative z-10 p-10 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300 border border-gray-100">
            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm border-8 border-white ring-1 ring-green-100">
              <CheckCircle size={44} strokeWidth={2.5} />
            </div>
            <h2 className="text-4xl font-handwritten font-bold text-gray-900 mb-4 leading-tight">Alert Broadcasted!</h2>
            <p className="text-gray-500 font-medium mb-10 text-[15px] leading-relaxed px-2">
              We've notified pet owners in your current area. Stay near your phone for updates.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 bg-green-500 text-white font-bold rounded-2xl shadow-lg hover:bg-green-600 hover:shadow-green-500/25 hover:scale-[1.02] transition-all text-lg flex justify-center items-center"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LostFound;
