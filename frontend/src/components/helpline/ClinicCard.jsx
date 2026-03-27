import React from 'react';
import { Phone, MapPin, Navigation } from 'lucide-react';
import { motion } from 'motion/react';

const ClinicCard = ({ clinic }) => {
  const { name, distance, isOpen, address, municipality, phone, lat, lng, specialties } = clinic;

  return (
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

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 font-medium">
          <div className="flex items-center gap-4">
            {municipality && (
              <div className="flex items-center gap-1.5 text-gray-700 font-bold">
                <MapPin size={14} className="text-green-500" />
                <span>{municipality}</span>
              </div>
            )}
            {address && (
              <div className="flex items-center gap-1.5 truncate opacity-70">
                <span className="truncate">{address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 md:mt-0 shrink-0">
        {phone ? (
          <a  
            href={`tel:${phone}`}
            className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all duration-300 shadow-sm"
            title="Call Now"
          >
            <Phone size={20} strokeWidth={2.5} />
          </a>
        ) : (
          <a 
            href={`https://www.google.com/search?q=${encodeURIComponent(name + " veterinary")}`}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all duration-300 shadow-sm"
            title="Search Online"
          >
            <Phone size={20} strokeWidth={2.5} />
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
  );
};

export default ClinicCard;
