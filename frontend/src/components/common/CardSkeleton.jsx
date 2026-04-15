import React from 'react';

const CardSkeleton = ({ variant = 'horizontal' }) => {
  if (variant === 'horizontal') {
    return (
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-8 px-4 border-b border-gray-200 bg-transparent">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-6 w-48 skeleton-item rounded-lg" /> {/* Title */}
            <div className="h-6 w-16 skeleton-item rounded-full" /> {/* Distance badge */}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
            <div className="h-4 w-32 skeleton-item rounded-md" /> {/* Municipality */}
            <div className="h-4 w-64 skeleton-item rounded-md opacity-70" /> {/* Address */}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0 shrink-0">
          <div className="w-11 h-11 skeleton-item rounded-xl" /> {/* Action button 1 */}
          <div className="w-11 h-11 skeleton-item rounded-xl" /> {/* Action button 2 */}
        </div>
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-soft h-full flex flex-col">
        <div className="h-56 w-full skeleton-item" /> {/* Image area */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="h-7 w-32 skeleton-item rounded-lg" /> {/* Pet Name */}
            <div className="h-5 w-16 skeleton-item rounded-lg" /> {/* Age tag */}
          </div>
          <div className="flex flex-col gap-3 mt-auto">
            <div className="h-4 w-full skeleton-item rounded-md" /> {/* Location */}
            <div className="h-3 w-24 skeleton-item rounded-md opacity-60" /> {/* User label */}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 rounded-full skeleton-item" /> {/* Color pip */}
              <div className="h-3 w-12 skeleton-item rounded-md" /> {/* Color text */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'slider') {
    return (
      <div className="bg-[#FFF9C4]/30 rounded-[32px] overflow-hidden shadow-xl border border-yellow-100/50 h-[450px]">
        <div className="h-60 w-full skeleton-item" /> {/* Image area */}
        <div className="p-7">
          <div className="mb-6">
            <div className="h-8 w-40 skeleton-item rounded-lg mb-2" /> {/* Name */}
            <div className="flex gap-2">
              <div className="h-3 w-12 skeleton-item rounded-md" />
              <div className="h-3 w-2 skeleton-item rounded-full" />
              <div className="h-3 w-16 skeleton-item rounded-md" />
            </div>
          </div>
          <div className="h-4 w-full skeleton-item rounded-md mb-8" /> {/* Address */}
          <div className="w-full h-12 skeleton-item rounded-2xl" /> {/* Button */}
        </div>
      </div>
    );
  }

  return null;
};

export default CardSkeleton;
