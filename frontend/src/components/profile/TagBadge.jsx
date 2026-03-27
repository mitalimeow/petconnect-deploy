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

const TagBadge = ({ tag }) => {
  const tagName = typeof tag === 'object' ? tag.name : tag;
  const tagColor = TAG_COLORS[tagName] || '#d9d9d9'; // strictly override
  
  return (
    <span 
      className="px-3 py-1 rounded-[10px] text-sm font-semibold text-gray-800 shadow-sm border border-black/80 transition-transform hover:scale-105 inline-block"
      style={{ backgroundColor: tagColor }}
    >
      {tagName}
    </span>
  );
};

export default TagBadge;
