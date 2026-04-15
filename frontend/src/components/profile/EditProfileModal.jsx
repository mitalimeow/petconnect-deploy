const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, UploadCloud, Loader2, AlertCircle } from 'lucide-react';
import Select from 'react-select';
import { useAuth } from '../../context/AuthContext';

const TAGS = [
  { name: "Volunteer" },
  { name: "Pet Owner" }, 
  { name: "Pet Enthusiasts" },
  { name: "Aspiring Adopter" }, 
  { name: "Rescuer" }
];

const INDIAN_CITIES = [
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
].map(city => ({ value: city, label: city }));

const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

const EditProfileModal = ({ isOpen, onClose, initialData, onSaveSuccess }) => {
  const { updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '', phone: '', isPhonePublic: false, location: null,
    isEmailVisible: false, tags: [], profilePhoto: '', bannerImage: ''
  });
  
  // Loading states
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Modern Toast Architecture
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        phone: initialData.phone || '',
        isPhonePublic: initialData.isPhonePublic || false,
        location: initialData.location ? { value: initialData.location, label: initialData.location } : null,
        isEmailVisible: initialData.isEmailVisible || false,
        tags: (initialData.tags || []).map(t => {
          const tagName = typeof t === 'object' ? t.name : t;
          return { value: tagName, label: tagName };
        }),
        profilePhoto: initialData.profilePhoto || '',
        bannerImage: initialData.bannerImage || ''
      });
    }
  }, [initialData]);

  const handleImageUpload = (file, type) => {
    if (!file) return;
    const isPhoto = type === 'photo';
    if (isPhoto) setIsUploadingPhoto(true); else setIsUploadingBanner(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let MAX_WIDTH = isPhoto ? 500 : 1200;
        let MAX_HEIGHT = isPhoto ? 500 : 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Advanced recursive compression to strictly honor byte caps
        const MAX_BYTES = isPhoto ? 100 * 1024 : 200 * 1024;
        let quality = 0.9;
        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        while (compressedDataUrl.length * 0.75 > MAX_BYTES && quality > 0.1) {
          quality -= 0.1;
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        if (compressedDataUrl.length * 0.75 > MAX_BYTES) {
          showToast(`Image too complex to compress securely. Please choose a simpler file.`, 'error');
          if (isPhoto) setIsUploadingPhoto(false); else setIsUploadingBanner(false);
          return;
        }

        if (isPhoto) setFormData(prev => ({ ...prev, profilePhoto: compressedDataUrl }));
        else setFormData(prev => ({ ...prev, bannerImage: compressedDataUrl }));
        
        if (isPhoto) setIsUploadingPhoto(false); else setIsUploadingBanner(false);
        showToast(`Image compressed natively to below ${isPhoto ? '100kb' : '200kb'}!`);
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      showToast("Failed to securely read the local image byte stream.", 'error');
      if (isPhoto) setIsUploadingPhoto(false); else setIsUploadingBanner(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return showToast("Name is a mandatory required field", 'error');
    
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        location: formData.location?.value || '',
        tags: formData.tags.map(t => t.value)
      };

      const res = await fetch(`${API_BASE}/api/profile/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        // Intercept backend payload instantly
        const backendDoc = await res.json();
        
        // Push update to Global React Context so the Navbar live-reloads instantly!
        updateUser(backendDoc);

        // Dispatch React DOM Refresh sequence
        onSaveSuccess();
        onClose();
      } else {
        showToast("Failed to securely map updated payload to server.", 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-24 pb-8">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      {/* Global Page-Level Toast System */}
      {toast && (
        <div className={`fixed top-[90px] right-6 z-[99999] px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 ${toast.type === 'error' ? 'bg-red-50 border border-red-100 text-red-600' : 'bg-green-50 border border-green-200 text-green-700'}`}>
           {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
           <p className="text-[15px] font-bold">{toast.message}</p>
        </div>
      )}

      {/* Modal Container */}
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto relative z-10 animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-border z-20 px-6 py-4 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-foreground font-handwritten m-0 leading-none">Edit Profile</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Images Upload Area */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-3">Profile Picture</label>
                <div className="flex items-center gap-4">
                   <img src={formData.profilePhoto || DEFAULT_AVATAR} alt="Avatar" className="w-16 h-16 rounded-full object-cover shadow-sm bg-gray-100 border border-gray-200" referrerPolicy="no-referrer" />
                   <div className="flex flex-col gap-2">
                     <label className="cursor-pointer text-center px-4 py-2.5 bg-pastel-blue/10 text-blue-700 hover:bg-pastel-blue hover:text-white rounded-[12px] text-sm font-bold transition-colors">
                       {isUploadingPhoto ? <Loader2 className="animate-spin inline" size={16}/> : <UploadCloud className="inline mr-2" size={16} />} Update
                       <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e.target.files[0], 'photo')} />
                     </label>
                     {formData.profilePhoto && (
                       <button onClick={() => setFormData(prev => ({...prev, profilePhoto: ''}))} className="text-xs text-red-500 hover:text-red-700 font-bold transition-colors">Remove</button>
                     )}
                   </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-3">Banner</label>
                <div className="flex flex-col gap-3">
                   {formData.bannerImage ? (
                     <img src={formData.bannerImage} alt="Banner" className="w-full h-16 rounded-[12px] object-cover shadow-sm bg-gray-100 border border-gray-200" />
                   ) : (
                     <div className="w-full h-16 rounded-[12px] shadow-sm bg-gray-200 border border-gray-200"></div>
                   )}
                   <div className="flex items-center gap-3">
                     <label className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-[12px] text-sm font-bold transition-colors">
                       {isUploadingBanner ? <Loader2 className="animate-spin inline" size={16}/> : <UploadCloud className="inline mr-2" size={16} />} Update
                       <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e.target.files[0], 'banner')} />
                     </label>
                     {formData.bannerImage && (
                       <button onClick={() => setFormData(prev => ({...prev, bannerImage: ''}))} className="text-xs text-red-500 hover:text-red-700 font-bold transition-colors">Remove</button>
                     )}
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Identity Parameters */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">Display Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-[12px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pastel-pink bg-gray-50 hover:bg-white transition-colors"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">City Location</label>
              <Select 
                options={INDIAN_CITIES}
                value={formData.location}
                onChange={val => setFormData({...formData, location: val})}
                className="text-sm text-gray-800"
                placeholder="Search Indian Cities..."
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">Select Roles / Tags</label>
              <Select 
                isMulti
                options={TAGS.map(t => ({ value: t.name, label: t.name }))}
                value={formData.tags}
                onChange={val => setFormData({...formData, tags: val})}
                className="text-sm text-gray-800"
                placeholder="Add role tags..."
              />
            </div>
          </div>

          {/* Contact Blocks */}
          <div className="space-y-4">
            
            {/* Registered Email Line */}
            <div className="bg-gray-50 border border-gray-100 rounded-[16px] p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-sm">
              <div className="w-full">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Registered Email (Non-Editable)</label>
                <input 
                  type="email" 
                  disabled
                  className="w-full px-4 py-2 rounded-[12px] border border-gray-200 bg-gray-100 text-gray-500 shadow-inner"
                  value={initialData?.email || ''}
                />
              </div>
              <div className="flex flex-col items-start sm:items-end shrink-0 sm:pt-6">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Network Broadcast Toggle</label>
                <button 
                  onClick={() => setFormData({...formData, isEmailVisible: !formData.isEmailVisible})}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${formData.isEmailVisible ? 'bg-pastel-blue' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${formData.isEmailVisible ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className={`text-[11px] mt-1.5 font-bold ${formData.isEmailVisible ? 'text-pastel-blue' : 'text-gray-400'}`}>
                  {formData.isEmailVisible ? 'World Public' : 'Friends Network Only'}
                </span>
              </div>
            </div>

            {/* Direct Phone Field */}
            <div className="bg-white border border-gray-100 rounded-[16px] p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-soft">
              <div className="w-full">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Comm-Link Phone Number</label>
                <div className="flex gap-2">
                  <input 
                    type="tel" 
                    placeholder="Enter phone number..."
                    className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pastel-purple shadow-sm transition-all"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                  {formData.phone && (
                    <div className="px-4 py-2 bg-[#f7f5c3] text-gray-800 rounded-[12px] flex items-center gap-2 font-bold whitespace-nowrap border border-[#e4e2a1]">
                      <CheckCircle size={18} className="text-green-600" /> Ready
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-start sm:items-end shrink-0 sm:pt-6">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Network Broadcast Toggle</label>
                <button 
                  onClick={() => setFormData({...formData, isPhonePublic: !formData.isPhonePublic})}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${formData.isPhonePublic ? 'bg-pastel-blue' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${formData.isPhonePublic ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className={`text-[11px] mt-1.5 font-bold ${formData.isPhonePublic ? 'text-pastel-blue' : 'text-gray-400'}`}>
                  {formData.isPhonePublic ? 'World Public' : 'Friends Network Only'}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-border z-20 px-6 py-4 flex justify-end gap-4 rounded-b-[24px]">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:text-black hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving} className="px-8 py-2.5 rounded-xl font-bold text-white bg-black hover:bg-gray-800 transition-colors shadow-lg flex items-center gap-2">
            {isSaving && <Loader2 size={16} className="animate-spin" />}
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditProfileModal;
