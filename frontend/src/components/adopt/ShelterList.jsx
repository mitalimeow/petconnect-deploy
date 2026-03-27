import React from 'react';
import ShelterCard from './ShelterCard';

const ShelterList = ({ shelters, loading, hasMore, onLoadMore }) => {
  if (loading && shelters.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-full h-32 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (shelters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-white rounded-[32px] border-2 border-dashed border-gray-100">
        <h3 className="text-xl font-bold text-gray-400 mb-2">No shelters found matching your search.</h3>
        <p className="text-gray-400 max-w-sm">Try expanding your search query or enabling location services.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden mb-10">
        {shelters.map(shelter => (
          <ShelterCard key={shelter.id} shelter={shelter} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pb-10">
          <button 
            onClick={onLoadMore}
            className="px-8 py-3 bg-white border-2 border-pastel-pink/20 text-pastel-pink rounded-2xl font-bold hover:bg-pastel-pink/10 transition-all shadow-sm flex items-center gap-2"
          >
            Load More Shelters
          </button>
        </div>
      )}
    </div>
  );
};

export default ShelterList;
