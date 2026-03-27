import React from 'react';
import { motion } from 'motion/react';

const FilterToggle = ({ activeFilter, setActiveFilter }) => {
  const filters = [
    { id: 'All', label: 'All Clinics' }
  ];

  return (
    <div className="flex items-center gap-2 p-1 bg-gray-100/80 backdrop-blur-sm rounded-xl w-fit border border-gray-200/50">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => setActiveFilter(filter.id)}
          className={`relative px-4 py-1.5 text-xs font-bold transition-all duration-300 rounded-lg ${
            activeFilter === filter.id 
              ? 'text-green-700' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {activeFilter === filter.id && (
            <motion.div
              layoutId="activeFilter"
              className="absolute inset-0 bg-white shadow-sm rounded-lg"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{filter.label}</span>
        </button>
      ))}
    </div>
  );
};

export default FilterToggle;
