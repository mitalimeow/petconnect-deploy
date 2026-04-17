const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`;
import React, { useState } from 'react';
import { X, UploadCloud, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import ElasticSlider from './ElasticSlider';
import { useAuth } from '../../context/AuthContext';

const DATA_MAP = {
  type: ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Turtle', 'Hamster', 'Guinea Pig', 'Others'],
  color: ['White', 'Black', 'Brown', 'Golden', 'Mixed', 'Others'],
  location: [
    "Agartala", "Agra", "Ahmedabad", "Aizawl", "Ajmer", "Aligarh", "Allahabad (Prayagraj)", 
    "Ambala", "Amravati", "Amritsar", "Anand", "Anantapur", "Asansol", "Aurangabad", "Bareilly", 
    "Belgaum", "Bengaluru", "Bhagalpur", "Bharatpur", "Bhavnagar", "Bhilai", "Bhopal", 
    "Bhubaneswar", "Bikaner", "Bilaspur", "Bokaro", "Chandigarh", "Chennai", "Coimbatore", 
    "Cuttack", "Dehradun", "Delhi", "Dhanbad", "Dibrugarh", "Dimapur", "Durgapur", "Erode", 
    "Faridabad", "Firozabad", "Gandhinagar", "Ghaziabad", "Gorakhpur", "Guntur", "Gurgaon (Gurugram)", 
    "Guwahati", "Gwalior", "Haldia", "Haridwar", "Hisar", "Hosur", "Hubli-Dharwad", "Hyderabad", 
    "Imphal", "Indore", "Itanagar", "Jabalpur", "Jaipur", "Jalandhar", "Jammu", "Jamnagar", 
    "Jamshedpur", "Jhansi", "Jodhpur", "Junagadh", "Kakinada", "Kannur", "Kanpur", "Karnal", 
    "Kochi", "Kolhapur", "Kolkata", "Kollam", "Kota", "Kozhikode", "Kurnool", "Lucknow", "Ludhiana", 
    "Madurai", "Mangalore", "Meerut", "Moradabad", "Mumbai", "Muzaffarpur", "Mysuru", "Nagpur", 
    "Nanded", "Nashik", "Navi Mumbai", "Noida", "Panaji", "Panipat", "Patiala", "Patna", 
    "Pimpri-Chinchwad", "Pondicherry (Puducherry)", "Pune", "Raipur", "Rajahmundry", "Rajkot", 
    "Ranchi", "Rourkela", "Salem", "Sangli", "Shimla", "Siliguri", "Solapur", "Srinagar", "Surat", 
    "Thane", "Thiruvananthapuram", "Thrissur", "Tiruchirappalli", "Tirunelveli", "Tirupati", 
    "Udaipur", "Ujjain", "Vadodara", "Varanasi", "Vellore", "Vijayawada", "Visakhapatnam", "Warangal"
  ]
};

const UploadPetModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    petName: '',
    animalType: 'Dog',
    location: 'Mumbai',
    age: 12, // Default in middle
    color: 'Mixed',
    image: ''
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max dimensions for sub-50kb target
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Recursive compression to hit 50KB limit
        const MAX_BYTES = 50 * 1024;
        let quality = 0.8;
        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

        while (compressedDataUrl.length * 0.75 > MAX_BYTES && quality > 0.1) {
          quality -= 0.1;
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        if (compressedDataUrl.length * 0.75 > MAX_BYTES) {
          showToast("Image too large to compress below 50KB. Choose a smaller file.", "error");
          setIsUploading(false);
          return;
        }

        setFormData(prev => ({ ...prev, image: compressedDataUrl }));
        setIsUploading(false);
        showToast("Image optimized to sub-50KB!");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.petName || !formData.image) {
      return showToast("Please fill all required fields and upload an image.", "error");
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        contactPhone: user?.phone || '(Visit Profile for Contact)'
      };

      const res = await fetch(`${API_BASE}/api/adoption`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onUploadSuccess();
        onClose();
      } else {
        showToast("Failed to list pet for adoption.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error occurred.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      {toast && (
        <div className={`fixed top-8 right-8 z-[10001] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${toast.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

      <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden p-8 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-3xl font-bold font-handwritten text-gray-900">Put up for Adoption</h2>
           <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} className="text-gray-400" />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pet Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Pet's Name *</label>
            <input 
              type="text" 
              required
              className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-pastel-pink outline-none transition-all"
              value={formData.petName}
              onChange={e => setFormData({...formData, petName: e.target.value})}
              placeholder="e.g. Buddy"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Animal Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Animal Type *</label>
              <select 
                className="w-full px-5 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-pastel-pink bg-white"
                value={formData.animalType}
                onChange={e => setFormData({...formData, animalType: e.target.value})}
              >
                {DATA_MAP.type.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {/* Color */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Color *</label>
              <select 
                className="w-full px-5 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-pastel-pink bg-white"
                value={formData.color}
                onChange={e => setFormData({...formData, color: e.target.value})}
              >
                {DATA_MAP.color.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Location *</label>
            <select 
              className="w-full px-5 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-pastel-pink bg-white"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
            >
              {DATA_MAP.location.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Age Slider */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-4 text-center">Pet's Age</label>
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
               <ElasticSlider defaultValue={formData.age} onChange={v => setFormData({...formData, age: v})} />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Pet Photo *</label>
            <div className="flex flex-col items-center gap-4">
               {formData.image ? (
                  <div className="relative w-full h-48 rounded-3xl overflow-hidden shadow-soft border-2 border-pastel-pink/20">
                    <img src={formData.image} alt="Pet" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setFormData({...formData, image: ''})} className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur rounded-full text-red-500 shadow-sm border border-red-50">
                      <X size={16} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-bold tracking-wider">
                       OPTIMIZED SUB-50KB
                    </div>
                  </div>
               ) : (
                  <label className="w-full h-48 border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 hover:border-pastel-pink/50 transition-all group">
                    <div className="p-4 bg-gray-100 rounded-full text-gray-400 group-hover:bg-pastel-pink/10 group-hover:text-pastel-pink transition-all">
                      {isUploading ? <Loader2 className="animate-spin" /> : <UploadCloud size={32} />}
                    </div>
                    <div className="text-center px-4">
                       <p className="text-sm font-bold text-gray-600">Click to upload photo</p>
                       <p className="text-[10px] text-gray-400 font-medium mt-1">Maximum sub-50KB compression applied</p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e.target.files[0])} />
                  </label>
               )}
            </div>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={isSaving || isUploading}
            className="w-full py-4 bg-black text-white rounded-2xl font-bold text-lg shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:translate-y-0"
          >
            {isSaving ? <Loader2 className="animate-spin inline mr-2" /> : "List for Adoption"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadPetModal;
