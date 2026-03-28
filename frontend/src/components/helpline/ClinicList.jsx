import React from 'react';
import ClinicCard from './ClinicCard';
import { motion, AnimatePresence } from 'motion/react';

const ClinicList = ({ clinics, loading, hasMore, onLoadMore }) => {
  if (loading && clinics.length === 0) {
    return (
      <div className="flex flex-col gap-4 py-10">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (clinics.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[30px] my-4">
        <span className="text-gray-500 font-bold text-xl block mb-2">No clinics found matching your criteria.</span>
        <p className="text-gray-400 font-medium text-sm">Try expanding your search query or changing filters.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm mt-4 mb-20 min-h-[100px]">
      <AnimatePresence mode="popLayout">
        {clinics && clinics.length > 0 ? (
          clinics.map((clinic) => (
            clinic && clinic.id ? <ClinicCard key={clinic.id} clinic={clinic} /> : null
          ))
        ) : (
          <div className="p-10 text-center text-gray-400 font-bold">
            No results available in this view.
          </div>
        )}
      </AnimatePresence>
      {hasMore && (
        <div className="p-6 border-t border-gray-50 flex justify-center bg-gray-50/30">
          <button 
            onClick={onLoadMore}
            className="px-8 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95"
          >
            Load More Clinics
          </button>
        </div>
      )}
    </div>
  );
};

export default ClinicList;
