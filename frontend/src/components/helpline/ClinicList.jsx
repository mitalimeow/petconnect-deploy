import React from 'react';
import ClinicCard from './ClinicCard';

const ClinicList = ({ clinics, loading, hasMore, onLoadMore }) => {
  if (loading && clinics.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-full h-32 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (clinics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-white rounded-[32px] border-2 border-dashed border-gray-100">
        <h3 className="text-xl font-bold text-gray-400 mb-2">No clinics found matching your criteria.</h3>
        <p className="text-gray-400 max-w-sm">Try expanding your search query or changing filters.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden mb-10">
        {clinics.map(clinic => (
          <ClinicCard key={clinic.id} clinic={clinic} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pb-10">
          <button 
            onClick={onLoadMore}
            className="px-8 py-3 bg-white border-2 border-green-100 text-green-600 rounded-2xl font-bold hover:bg-green-50 transition-all shadow-sm flex items-center gap-2"
          >
            Load More Clinics
          </button>
        </div>
      )}
    </div>
  );
};

export default ClinicList;
