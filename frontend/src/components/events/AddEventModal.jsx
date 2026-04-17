import React, { useState } from 'react';
import { X, UploadCloud, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Select from 'react-select';

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

const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`;

const AddEventModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '', url: '', date: '', venue: null, image: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
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
        const MAX_WIDTH = 1200; // Landscape preferred
        const MAX_HEIGHT = 800;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to securely honor 250kb caps
        const MAX_BYTES = 250 * 1024;
        let quality = 0.9;
        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        while (compressedDataUrl.length * 0.75 > MAX_BYTES && quality > 0.1) {
          quality -= 0.1;
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        if (compressedDataUrl.length * 0.75 > MAX_BYTES) {
          showToast(`Image too complex to compress to <250kb. Please use a smaller image.`, 'error');
          setIsUploading(false);
          return;
        }

        setFormData(prev => ({ ...prev, image: compressedDataUrl }));
        setIsUploading(false);
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      showToast("Failed to securely read the local image byte stream.", 'error');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.url || !formData.date || !formData.venue || !formData.image) {
       return showToast("All fields including a photo are required.", "error");
    }

    if (!/^https?:\/\/.+/.test(formData.url)) {
       return showToast("Please provide a valid URL starting with http:// or https://", "error");
    }

    setIsSaving(true);
    try {
      const payload = {
         ...formData,
         venue: formData.venue.value
      };

      const res = await fetch(`${API_BASE}/api/events`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         credentials: 'include',
         body: JSON.stringify(payload)
      });

      if (res.ok) {
         showToast("Event successfully published!");
         setTimeout(() => {
            onSuccess();
            onClose();
            setFormData({ title: '', url: '', date: '', venue: null, image: '' });
         }, 1000);
      } else {
         const data = await res.json();
         showToast(data.message || data.error || "Failed to create event.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error publishing event.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pt-24 sm:p-6 sm:pt-24 lg:p-8 lg:pt-24">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

       {/* Global Page-Level Toast System */}
       {toast && (
        <div className={`fixed top-[90px] right-6 z-[99999] px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 ${toast.type === 'error' ? 'bg-red-50 border border-red-100 text-red-600' : 'bg-green-50 border border-green-200 text-green-700'}`}>
           {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
           <p className="text-[15px] font-bold">{toast.message}</p>
        </div>
      )}

      {/* Modal */}
      <div className="bg-[#e9ded1] max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-[30px] p-6 sm:p-8 shadow-2xl relative z-10 border-2 border-black/80 animate-in fade-in zoom-in duration-300 scrollbar-hide">
         
         {/* Close Button */}
         <button onClick={onClose} className="absolute right-6 top-6 p-2 text-gray-500 hover:text-black hover:bg-black/10 rounded-full transition-colors">
            <X size={24} />
         </button>

         <div className="text-center mb-8 pr-12 pl-12 mt-2">
            <h2 className="text-3xl font-handwritten font-bold text-gray-900 mb-2">Add an Upcoming Event</h2>
            <p className="text-lg font-handwritten text-gray-700">Your pet event will be advertised on the dashboard.</p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-6 max-w-[90%] mx-auto">
            {/* Image Upload Area */}
            <div className="w-full">
               <label className="cursor-pointer block w-full">
                 <div className={`w-full h-40 md:h-48 rounded-[24px] border-2 border-dashed ${formData.image ? 'border-transparent' : 'border-gray-400 bg-[#f4ece3] hover:bg-white'} overflow-hidden transition-colors flex items-center justify-center relative shadow-inner`}>
                    {formData.image ? (
                        <div className="w-full h-full relative group">
                           <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <p className="font-handwritten text-white text-xl">Change Photo</p>
                           </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500 font-handwritten text-2xl">
                           {isUploading ? <Loader2 className="animate-spin mb-2" size={32}/> : <span className="mb-2">Upload Photo</span>}
                        </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e.target.files[0])} />
                 </div>
               </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
               <div>
                 <label className="block text-xl font-handwritten font-bold text-gray-800 mb-2">Name of event</label>
                 <input 
                    type="text" 
                    className="w-full px-5 py-3 rounded-[16px] border-0 shadow-sm focus:ring-4 focus:ring-green-100 placeholder:text-gray-400 font-medium"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter event name"
                 />
               </div>
               <div>
                 <label className="block text-xl font-handwritten font-bold text-gray-800 mb-2">URL to event website</label>
                 <input 
                    type="url" 
                    className="w-full px-5 py-3 rounded-[16px] border-0 shadow-sm focus:ring-4 focus:ring-green-100 placeholder:text-gray-400 font-medium"
                    value={formData.url}
                    onChange={e => setFormData({...formData, url: e.target.value})}
                    placeholder="https://..."
                 />
               </div>
               <div>
                 <label className="block text-xl font-handwritten font-bold text-gray-800 mb-2">Date of event</label>
                 <input 
                    type="datetime-local" 
                    className="w-full px-5 py-3 rounded-[16px] border-0 shadow-sm focus:ring-4 focus:ring-green-100 font-medium text-gray-700"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                 />
               </div>
               <div>
                 <label className="block text-xl font-handwritten font-bold text-gray-800 mb-2">Venue (city)</label>
                 <Select 
                    options={INDIAN_CITIES}
                    value={formData.venue}
                    onChange={val => setFormData({...formData, venue: val})}
                    className="text-gray-800 font-medium"
                    placeholder="Select city..."
                    styles={{
                       control: (base) => ({ ...base, borderRadius: '16px', padding: '4px', border: 'none', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' })
                    }}
                 />
               </div>
            </div>

            <div className="flex justify-center pt-6 pb-4">
               <button 
                 type="submit" 
                 disabled={isSaving}
                 className="px-10 py-4 bg-[#b5edb6] border border-[#91c592] hover:bg-[#a6ecb0] hover:scale-105 active:scale-95 transition-all text-gray-900 font-handwritten font-bold text-3xl rounded-[20px] shadow-sm flex items-center gap-3 disabled:opacity-50 disabled:pointer-events-none"
               >
                 {isSaving && <Loader2 className="animate-spin" size={24} />}
                 Add Event!
               </button>
            </div>
         </form>

      </div>
    </div>
  );
};

export default AddEventModal;
