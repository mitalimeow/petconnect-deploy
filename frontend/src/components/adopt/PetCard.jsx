import React from 'react';
import { MapPin, Clock, UserCircle, Heart, Phone, Trash2 } from 'lucide-react';
import TagBadge from '../profile/TagBadge';

const PetCard = ({ pet, onContactClick, onDelete, hideContact, distance, onClick }) => {
  const handleContact = (e) => {
    e.stopPropagation();
    if (onContactClick) {
      onContactClick(pet);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(pet);
    }
  };

  const getAgeLabel = (months) => {
    if (months === undefined || months === null) return null;
    if (months === 0) return "Newborn";
    if (months <= 4) return "1-4 months";
    if (months <= 8) return "4-8 months";
    if (months <= 12) return "8-12 months";
    if (months <= 36) return "1-3 years";
    if (months <= 60) return "3-5 years";
    if (months <= 120) return "5-10 years";
    if (months <= 180) return "10-15 years";
    return "15+ years";
  };

  const displayAgeLabel = getAgeLabel(pet.age);
  const displayLocation = pet.lastSeenLocation?.address || pet.location || "Unknown Location";
  const isLostPet = !!pet.lastSeenLocation;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col h-full relative"
    >
      
      {/* Contact Icon */}
      {!hideContact && (
        <button 
          onClick={handleContact}
          className="absolute top-4 left-4 p-2 bg-black/80 backdrop-blur rounded-full text-white hover:bg-black z-10 transition-colors shadow-sm"
        >
           <Phone size={16} />
        </button>
      )}

      {/* Delete Icon (if authorized) */}
      {onDelete && (
        <button 
          onClick={handleDelete}
          className="absolute top-4 right-4 p-2 bg-red-500/90 backdrop-blur rounded-full text-white hover:bg-red-600 z-10 transition-colors shadow-sm"
        >
           <Trash2 size={16} />
        </button>
      )}

      {/* Image Area */}
      <div className="h-56 w-full overflow-hidden bg-gray-100 relative">
         {pet.image ? (
           <img src={pet.image} alt={pet.petName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
         ) : (
           <div className="w-full h-full flex items-center justify-center text-4xl">🐾</div>
         )}
         
          {/* Distance Badge */}
          {distance && (
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-orange-600/90 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 z-10 shadow-lg border border-white/20">
              <MapPin size={12} className="text-white" />
              {distance}
            </div>
          )}

         {/* Animal Type Tag Floating Bottom Left */}
         <div className="absolute bottom-3 left-3">
            <div className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
               <span className="text-[11px] font-black uppercase tracking-wider text-gray-800">
                  {pet.animalType}
               </span>
            </div>
         </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
           <h3 className="text-2xl font-bold font-handwritten text-gray-900 truncate">{pet.petName}</h3>
           {displayAgeLabel ? (
             <span className="text-[10px] font-bold text-pastel-pink bg-pastel-pink/10 border border-pastel-pink/10 px-2 py-1 rounded-lg uppercase tracking-widest whitespace-nowrap">{displayAgeLabel}</span>
           ) : isLostPet ? (
             <span className="text-[10px] font-bold text-orange-600 bg-orange-100 border border-orange-200 px-2 py-1 rounded-lg uppercase tracking-widest whitespace-nowrap">Lost Pet</span>
           ) : null}
        </div>
        
        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
             <MapPin size={16} className={isLostPet ? "text-orange-400 shrink-0" : "text-gray-400 shrink-0"} />
             <span className="truncate" title={displayLocation}>{displayLocation}</span>
          </div>

          


          {/* Color pip */}
          {pet.color && (
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mt-1 uppercase tracking-tighter">
               <div className="w-2.5 h-2.5 rounded-full border border-gray-100" style={{ 
                 backgroundColor: pet.color.toLowerCase() === 'white' ? '#fff' : 
                                  pet.color.toLowerCase() === 'black' ? '#333' :
                                  pet.color.toLowerCase() === 'brown' ? '#8B4513' :
                                  pet.color.toLowerCase() === 'golden' ? '#DAA520' : '#e5e7eb' 
               }} />
               {pet.color}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default PetCard;
