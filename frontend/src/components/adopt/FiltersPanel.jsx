import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Check } from 'lucide-react';
import ElasticSlider from './ElasticSlider';

const CATEGORIES = [
  { id: 'type', label: 'Animal Type', icon: '🐾' },
  { id: 'location', label: 'Location', icon: '📍' },
  { id: 'age', label: 'Age', icon: '🎚️' },
  { id: 'color', label: 'Colour', icon: '🎨' },
  { id: 'ownerType', label: 'Owner', icon: '👤' }
];

const DATA_MAP = {
  type: ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Turtle', 'Hamster', 'Guinea Pig', 'Others'],
  color: ['White', 'Black', 'Brown', 'Golden', 'Mixed', 'Others'],
  ownerType: ['Independent', 'Shelter', 'Ethical Breeder'],
  location: [
    "Agartala", "Agra", "Ahmedabad", "Aizawl", "Ajmer", "Aligarh", "Allahabad (Prayagraj)", 
    "Ambala", "Amravati", "Amritsar", "Anand", "Anantapur", "Asansol", "Aurangabad", "Bareilly", 
    "Belgaum", "Bengaluru", "Bhagalpur", "Bharatpur", "Bhavnagar", "Bhilai", "Bhopal", 
    "Bhubaneswar", "Bikaner", "Bilaspur", "Bokaro", "Chandigarh", "Chennai", "Coimbatore", 
    "Cuttack", "Dehradun", "Delhi", "Dhanbad", "Dibrugarh", "Dimapur", "Durgapur", "Erode", 
    "Faridabad", "Firozabad", "Gandhinagar", "Ghaziabad", "Gorakhpur", "Guntur", "Gurgaon (Gurugram)", 
    "Guwahati", "Gwalior", "Haldia", "Haridwar", "Hisar", "Hosur", "Hubli-Dharwad", "Hyderabad", 
    "Imphal", "Indore", "Itanagar", "Jabalpur", "Jaipur", "Jalandhar", "Jammu", "Jamnagar", 
    "Jamshedpur", "Jhansi", "Jodhpur", "Junagadh", "Kakinada", "Kannur", "Kanpur", "Karnal", 
    "Kochi", "Kolhapur", "Kolkata", "Kollam", "Kota", "Kozhikode", "Kurnool", "Lucknow", "Ludhiana", 
    "Madurai", "Mangalore", "Meerut", "Moradabad", "Mumbai", "Muzaffarpur", "Mysuru", "Nagpur", 
    "Nanded", "Nashik", "Navi Mumbai", "Noida", "Panaji", "Panipat", "Patiala", "Patna", 
    "Pimpri-Chinchwad", "Pondicherry (Puducherry)", "Pune", "Raipur", "Rajahmundry", "Rajkot", 
    "Ranchi", "Rourkela", "Salem", "Sangli", "Shimla", "Siliguri", "Solapur", "Srinagar", "Surat", 
    "Thane", "Thiruvananthapuram", "Thrissur", "Tiruchirappalli", "Tirunelveli", "Tirupati", 
    "Udaipur", "Ujjain", "Vadodara", "Varanasi", "Vellore", "Vijayawada", "Visakhapatnam", "Warangal"
  ]
};

const FiltersPanel = ({ isOpen, onClose, initialFilters, onApply }) => {
  const [activeCategory, setActiveCategory] = useState('type');
  const [filters, setFilters] = useState(initialFilters || {
    type: [],
    location: '',
    age: null,
    color: [],
    ownerType: []
  });

  const [locSearch, setLocSearch] = useState('');

  const handleArrayToggle = (key, value) => {
    setFilters(prev => {
      const arr = prev[key];
      if (arr.includes(value)) {
        return { ...prev, [key]: arr.filter(item => item !== value) };
      } else {
        return { ...prev, [key]: [...arr, value] };
      }
    });
  };

  const handleClear = () => {
    setFilters({ type: [], location: '', age: null, color: [], ownerType: [] });
  };

  const activeCount = Object.values(filters).reduce((acc, curr) => {
    if (Array.isArray(curr)) return acc + curr.length;
    if (curr !== null && curr !== '' && curr !== 999) return acc + 1;
    return acc;
  }, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[990]"
            onClick={onClose}
          />
          
          {/* Centering Wrapper */}
          <div className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none p-4">
            {/* Modal Container */}
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative pointer-events-auto bg-white rounded-[24px] shadow-2xl flex flex-col md:flex-row overflow-hidden w-full max-w-[92vw] md:max-w-[800px] h-[80vh] md:h-[500px]"
            >
              {/* Left Sidebar */}
            <div className="w-full md:w-1/3 bg-gray-50 flex flex-col border-r border-gray-100">
              <div className="p-5 flex justify-between items-center border-b border-gray-200 bg-white">
                <h2 className="text-xl font-bold font-handwritten">Filters {activeCount > 0 && <span className="bg-pastel-pink text-white text-xs px-2 py-0.5 rounded-full ml-2">{activeCount}</span>}</h2>
                <button onClick={onClose} className="md:hidden p-1 bg-gray-100 text-gray-500 rounded-full hover:text-black">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto w-full flex flex-row md:flex-col p-2 md:p-3 gap-1 hide-scrollbar">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap md:whitespace-normal text-sm md:text-base font-bold ${activeCategory === cat.id ? 'bg-white shadow-soft text-pastel-purple relative border border-gray-100' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <span>{cat.icon}</span> 
                    {cat.label}
                    {/* Tiny active indicator pip */}
                    {activeCategory === cat.id && <motion.div layoutId="activePip" className="absolute left-0 w-1.5 h-6 bg-pastel-purple rounded-r-lg" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Content Panel */}
            <div className="flex-1 flex flex-col bg-white">
              <div className="p-6 md:p-10 flex-1 overflow-y-auto">
                <h3 className="text-2xl font-handwritten font-bold mb-6 text-gray-800">
                  {CATEGORIES.find(c => c.id === activeCategory).label}
                </h3>

                {/* Content switching based on category */}
                {activeCategory === 'type' && (
                  <div className="flex flex-wrap gap-3">
                    {DATA_MAP.type.map(type => {
                      const isActive = filters.type.includes(type);
                      return (
                        <button key={type} onClick={() => handleArrayToggle('type', type)} className={`px-5 py-2.5 rounded-full border-2 font-bold transition-all flex items-center gap-2 ${isActive ? 'bg-pastel-pink/10 border-pastel-pink text-pastel-pink' : 'border-gray-200 text-gray-600 hover:border-pastel-pink/50'}`}>
                           {isActive && <Check size={16} />} {type}
                        </button>
                      )
                    })}
                  </div>
                )}

                {activeCategory === 'color' && (
                  <div className="flex flex-wrap gap-3">
                    {DATA_MAP.color.map(color => {
                      const isActive = filters.color.includes(color);
                      return (
                        <button key={color} onClick={() => handleArrayToggle('color', color)} className={`px-5 py-2.5 rounded-full border-2 font-bold transition-all flex items-center gap-2 ${isActive ? 'bg-pastel-purple/10 border-pastel-purple text-pastel-purple' : 'border-gray-200 text-gray-600 hover:border-pastel-purple/50'}`}>
                           {isActive && <Check size={16} />} {color}
                        </button>
                      )
                    })}
                  </div>
                )}

                {activeCategory === 'location' && (
                  <div className="pt-2">
                     <p className="text-gray-500 font-medium mb-4">Select a specific city to find pets.</p>
                     <div className="relative border-2 border-gray-200 rounded-2xl overflow-hidden bg-gray-50 hover:border-pastel-blue transition-colors focus-within:border-pastel-blue">
                       <select 
                         value={filters.location}
                         onChange={(e) => setFilters({...filters, location: e.target.value})}
                         className="w-full p-4 bg-transparent outline-none cursor-pointer appearance-none font-bold text-gray-700"
                       >
                         <option value="">Any Location</option>
                         {[...DATA_MAP.location].sort().map(loc => (
                           <option key={loc} value={loc}>{loc}</option>
                         ))}
                       </select>
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-sm">
                         ▼
                       </div>
                     </div>
                  </div>
                )}

                {activeCategory === 'age' && (
                  <div className="pt-4">
                     <p className="text-gray-500 font-medium mb-6">Select the maximum age of the pet.</p>
                     <ElasticSlider defaultValue={filters.age} onChange={(v) => setFilters({...filters, age: v})} />
                  </div>
                )}

                {activeCategory === 'ownerType' && (
                  <div className="flex flex-col gap-3">
                    {DATA_MAP.ownerType.map(owner => {
                      const isActive = (filters.ownerType || []).includes(owner);
                      return (
                        <button key={owner} onClick={() => handleArrayToggle('ownerType', owner)} className={`px-5 py-4 rounded-xl border-2 font-bold text-left transition-all flex items-center justify-between ${isActive ? 'bg-orange-50 border-orange-400 text-orange-600' : 'border-gray-200 text-gray-600 hover:border-orange-200'}`}>
                           <span>{owner}</span>
                           <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-300'}`}>
                             {isActive && <Check size={12} />}
                           </div>
                        </button>
                      )
                    })}
                  </div>
                )}

              </div>

              {/* Bottom Action Footer */}
              <div className="p-5 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-br-[24px]">
                 <button onClick={handleClear} className="font-bold text-gray-500 hover:text-black transition-colors px-4 py-2">
                    Clear Filters
                 </button>
                 <button onClick={() => onApply(filters)} className="bg-black text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all">
                    Apply Filters
                 </button>
              </div>

            </div>
            
            {/* Desktop Dismiss */}
            <button onClick={onClose} className="hidden md:flex absolute top-4 right-4 p-2 bg-gray-100 text-gray-500 hover:text-black hover:bg-gray-200 rounded-full transition-colors z-50 shadow-sm">
                <X size={20} />
            </button>

            </motion.div>
          </div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};

export default FiltersPanel;
