import React from 'react';
import { MapPin } from 'lucide-react';

const ShelterLocator = ({ searchQuery }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-[24px] shadow-sm border border-gray-100 min-h-[400px]">
      <MapPin className="text-gray-300 w-16 h-16 mb-4" />
      <h2 className="text-3xl font-bold text-gray-800 font-handwritten mb-2">Shelter Locator</h2>
      <p className="text-gray-500 text-center max-w-md">
        This feature is coming soon! We are partnering with local shelters to help you find them easily{searchQuery ? ` matching "${searchQuery}"` : ''}.
      </p>
    </div>
  );
};

export default ShelterLocator;
