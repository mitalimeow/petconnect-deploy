import React from 'react';
import { MapPin, Clock, UserCircle, Heart } from 'lucide-react';
import TagBadge from '../profile/TagBadge';

const PetCard = ({ pet }) => {
  return (
    <div className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col h-full relative">
      
      {/* Save / Favorite Icon */}
      <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full text-gray-400 hover:text-red-500 hover:bg-white z-10 transition-colors shadow-sm">
         <Heart size={18} />
      </button>

      {/* Image Area */}
      <div className="h-56 w-full overflow-hidden bg-gray-100 relative">
         {pet.imageUrl ? (
           <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
         ) : (
           <div className="w-full h-full flex items-center justify-center text-4xl">🐾</div>
         )}
         <div className="absolute bottom-3 left-3 flex gap-2">
            <span className="bg-white/90 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded-md text-gray-800 shadow-sm">
              {pet.type}
            </span>
            {pet.breed && (
              <span className="bg-black/70 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded-md text-white shadow-sm">
                {pet.breed}
              </span>
            )}
         </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
           <h3 className="text-2xl font-bold font-handwritten text-gray-900">{pet.name}</h3>
           <span className="text-lg font-bold text-pastel-pink">{pet.ageMonths}m</span>
        </div>
        
        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
             <MapPin size={16} className="text-gray-400 shrink-0" />
             <span className="truncate">{pet.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
             <UserCircle size={16} className="text-gray-400 shrink-0" />
             <span className="truncate">{pet.shelterName || pet.ownerType}</span>
          </div>

          {/* Color pip */}
          {pet.color && (
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mt-1">
               <div className="w-3 h-3 rounded-full border border-gray-300 shadow-inner" style={{ 
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
