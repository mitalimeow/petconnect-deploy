import React, { useState } from 'react';
import { Phone, Search, MapPin, Navigation, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ShelterCard = ({ shelter }) => {
  const { name, distance, address, municipality, phone, lat, lng } = shelter;
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between py-8 px-4 border-b border-gray-200 bg-transparent hover:bg-gray-50 transition-all duration-300 group"
      >
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-green-700 transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">{distance.toFixed(1)} KM</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-x-4 gap-y-2 text-sm text-gray-500 font-medium mt-2 w-full">
            {municipality && (
              <div className="flex flex-shrink-0 items-center gap-1.5 text-gray-700 font-bold">
                <MapPin size={14} className="text-green-500" />
                <span>{municipality}</span>
              </div>
            )}
            {address && (
              <div className="flex flex-1 min-w-0 items-center gap-1.5 opacity-70">
                <span className="truncate w-full">{address}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 md:mt-0 shrink-0">
          {phone ? (
            <button  
              onClick={() => setShowPhoneModal(true)}
              className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all duration-300 shadow-sm"
              title="View Phone Number"
            >
              <Phone size={20} strokeWidth={2.5} />
            </button>
          ) : (
            <a 
              href={`https://www.google.com/search?q=${encodeURIComponent(name + " animal shelter")}`}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all duration-300 shadow-sm"
              title="Search Online"
            >
              <Search size={20} strokeWidth={2.5} />
            </a>
          )}
          
          <a 
            href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm"
            title="Directions"
          >
            <Navigation size={20} strokeWidth={2.5} />
          </a>
        </div>
      </motion.div>

      <AnimatePresence>
        {showPhoneModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-xl relative"
            >
              <button 
                onClick={() => setShowPhoneModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
              
              <div className="flex flex-col items-center text-center mt-2">
                <div className="w-16 h-16 bg-green-50 rounded-[20px] flex items-center justify-center text-green-600 mb-5 shadow-inner">
                  <Phone size={28} strokeWidth={2.5} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1 px-4">{name}</h3>
                <p className="text-gray-500 font-medium mb-6 text-sm">Contact the shelter directly at</p>
                
                <div 
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gray-50 border border-gray-200 text-gray-800 rounded-2xl font-bold text-xl tracking-wide select-all"
                >
                  {phone}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ShelterCard;
