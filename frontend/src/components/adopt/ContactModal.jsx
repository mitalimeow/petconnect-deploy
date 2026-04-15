import React, { useState, useEffect } from 'react';
import { X, Phone, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const ContactModal = ({ pet, onClose }) => {
  const navigate = useNavigate();
  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pet) return;
    if (pet.ownerId && typeof pet.ownerId === 'object' && pet.ownerId.name) {
      setOwnerData(pet.ownerId);
      return;
    }
    
    // Fallback: Fetch if ownerId is just a string or missing populated fields
    const fetchOwner = async () => {
      setLoading(true);
      try {
        const idToFetch = typeof pet.ownerId === 'string' ? pet.ownerId : pet.ownerId?._id;
        if (!idToFetch) { setLoading(false); return; }
        
        const res = await fetch(`${API_BASE}/api/profile/${idToFetch}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.profile) {
            setOwnerData(data.profile);
          }
        }
      } catch (err) {
        console.error("Error fetching pet owner:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOwner();
  }, [pet]);

  if (!pet) return null;
  
  const displayPhone = pet.contactPhone || Math.floor(1000000000 + Math.random() * 9000000000).toString();
  
  const owner = ownerData || (typeof pet.ownerId === 'object' ? pet.ownerId : {});
  const ownerName = owner.name || 'Community User';
  const ownerUsername = owner.username ? `@${owner.username}` : '';
  const ownerPhoto = owner.profilePhoto || owner.googlePhoto || owner.avatar || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';
  let ownerType = 'COMMUNITY USER';
  if (owner.tags && owner.tags.length > 0) {
     ownerType = typeof owner.tags[0] === 'string' ? owner.tags[0].toUpperCase() : (owner.tags[0].name || '').toUpperCase();
  } else if (owner.role) {
     ownerType = owner.role.toUpperCase();
  }

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-sm p-8 animate-in zoom-in-95 duration-300 text-center">
         
         <button onClick={onClose} className="absolute top-6 left-6 text-gray-400 hover:text-black transition-colors">
            <X size={24} />
         </button>

         <div className="w-20 h-20 bg-pastel-pink/5 rounded-full flex items-center justify-center mx-auto mb-4 mt-2">
            <Phone size={32} className="text-[#f7b5b5]" />
         </div>
         
         <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words leading-tight px-2">
            <span className="font-handwritten">Connect with </span>
            <span className="font-sans">{pet.petName}'s</span>
            <span className="font-handwritten"> Owner</span>
         </h3>
         
         <p className="text-gray-500 mb-6 font-medium text-sm">Please mention <span className="text-black font-bold">PetConnect</span> when you call!</p>
         
         <div 
           onClick={() => {
              if (owner._id) {
                 navigate(`/profile/${owner._id}`);
                 onClose();
              }
           }}
           className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4 mb-6 group hover:border-[#8b80fc] hover:bg-white cursor-pointer transition-all flex items-center gap-4 text-left shadow-sm"
         >
            <img 
               src={ownerPhoto} 
               alt={ownerName} 
               className="w-14 h-14 rounded-full object-cover border-2 border-[#8b80fc] shadow-sm transform group-hover:scale-105 transition-transform"
               referrerPolicy="no-referrer"
            />
            <div className="flex-1 overflow-hidden">
               <div className="flex items-center gap-2 mb-0.5">
                 <h4 className="font-bold text-gray-900 truncate tracking-tight">{ownerName}</h4>
                 <span className="text-[9px] font-black uppercase text-[#8b80fc] bg-[#8b80fc]/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                   {ownerType}
                 </span>
               </div>
               <p className="text-sm font-medium text-gray-500 truncate tracking-tight">{ownerUsername}</p>
            </div>
         </div>

         <button 
           onClick={onClose}
           className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-colors shadow-lg"
         >
            Got it!
         </button>
      </div>
    </div>
  );
};

export default ContactModal;
