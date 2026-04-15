import React from 'react';

const TAG_COLORS = {
  'Community Member': '#d9d9d9',
  'Volunteer': '#f7f5c3',
  'Pet Owner': '#adb2ee',
  'Shelter Owner': '#f7f5c3',
  'Vet': '#aeeead',
  'Pet Enthusiasts': '#adb2ee',
  'Pet Store': '#eeadad',
  'Aspiring Adopter': '#adb2ee',
  'Trainer': '#eeadad',
  'Ethical Breeder': '#eeadad',
  'Transporter': '#eeadad',
  'Pet Stylist': '#eeadeb',
  'Rescuer': '#f7f5c3',
  'Admin': '#d9d9d9',
};

const TagBadge = ({ tag, size = 'default' }) => {
  const tagName = typeof tag === 'object' ? tag.name : tag;
  const tagColor = TAG_COLORS[tagName] || '#d9d9d9'; // strictly override
  
  const sizeClasses = size === 'sm' 
    ? "px-1.5 py-[1px] rounded-[6px] text-[10px]" 
    : "px-3 py-1 rounded-[10px] text-sm";

  return (
    <span 
      className={`${sizeClasses} font-semibold text-gray-800 shadow-sm border border-black/80 transition-transform hover:scale-105 inline-block shrink-0`}
      style={{ backgroundColor: tagColor }}
    >
      {tagName}
    </span>
  );
};

export default TagBadge;
