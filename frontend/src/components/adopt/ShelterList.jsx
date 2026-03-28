import React from 'react';
import ShelterCard from './ShelterCard';
import { motion, AnimatePresence } from 'motion/react';

const ShelterList = ({ shelters, loading, hasMore, onLoadMore }) => {
  if (loading && shelters.length === 0) {
    return (
      <div className="flex flex-col gap-4 py-10 w-full">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse w-full" />
        ))}
      </div>
    );
  }

  if (shelters.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[30px] my-4 w-full">
        <span className="text-gray-500 font-bold text-xl block mb-2">No shelters found nearby.</span>
        <p className="text-gray-400 font-medium text-sm">Try expanding your search query or changing your location.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm mt-4 mb-20 w-full">
      <AnimatePresence mode="popLayout">
        {shelters.map((shelter) => (
          <ShelterCard key={shelter.id} shelter={shelter} />
        ))}
      </AnimatePresence>

      {hasMore && (
        <div className="p-6 flex justify-center w-full">
          <button 
            onClick={onLoadMore}
            className="px-8 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95"
          >
            Load More Shelters
          </button>
        </div>
      )}
    </div>
  );
};

export default ShelterList;
