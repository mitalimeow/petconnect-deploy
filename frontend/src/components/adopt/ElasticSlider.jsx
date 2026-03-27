import React, { useState, useEffect } from 'react';

const STEPS = [
  { label: 'Newborn', value: 0 },
  { label: '1-4 months', value: 4 },
  { label: '4-8 months', value: 8 },
  { label: '8-12 months', value: 12 },
  { label: '1-3 years', value: 36 },
  { label: '3-5 years', value: 60 },
  { label: '5-10 years', value: 120 },
  { label: '10-15 years', value: 180 },
  { label: '15+ years', value: 999 }
];

const ElasticSlider = ({ defaultValue = null, onChange }) => {
  const getIndex = (val) => {
    if (val === null) return STEPS.length - 1; // max right thumb when default disabled
    const idx = STEPS.findIndex(s => s.value === val);
    return idx >= 0 ? idx : STEPS.length - 1;
  };

  const [isActive, setIsActive] = useState(defaultValue !== null);
  const [index, setIndex] = useState(() => getIndex(defaultValue));

  useEffect(() => {
    if (defaultValue === null) {
      setIsActive(false);
      setIndex(STEPS.length - 1);
    } else {
      setIsActive(true);
      setIndex(getIndex(defaultValue));
    }
  }, [defaultValue]);

  const handleChange = (newIndex) => {
    setIsActive(true);
    setIndex(newIndex);
    onChange(STEPS[newIndex].value);
  };

  const percentage = (index / (STEPS.length - 1)) * 100;
  const currentStep = STEPS[index];

  return (
    <div className="w-full flex flex-col gap-6 select-none relative my-4">
      <div 
        className="relative w-full h-8 flex items-center cursor-pointer group"
        onMouseDown={() => {
           if (!isActive) {
             setIsActive(true);
             onChange(STEPS[index].value);
           }
        }}
        onTouchStart={() => {
           if (!isActive) {
             setIsActive(true);
             onChange(STEPS[index].value);
           }
        }}
      >
        <div className="absolute w-full h-8 bg-gray-100 rounded-full overflow-hidden pointer-events-none">
          <div 
            className={`h-full rounded-full transition-all duration-75 ${isActive ? 'bg-gradient-to-r from-pastel-pink to-pastel-purple' : 'bg-gray-300'}`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <input
          type="range"
          min={0}
          max={STEPS.length - 1}
          value={index}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="absolute w-full h-8 opacity-0 cursor-pointer z-10 m-0"
        />
        
        <div 
           className={`w-10 h-10 shadow-lg rounded-full absolute top-1/2 -ml-5 flex items-center justify-center border pointer-events-none z-0 transition-transform duration-75 ${isActive ? 'bg-white border-gray-100 group-active:scale-95' : 'bg-gray-200 border-gray-300'}`}
           style={{ left: `${percentage}%`, transform: 'translateY(-50%)' }}
        >
          <div className={`w-4 h-4 rounded-full transition-transform duration-75 ${isActive ? 'bg-pastel-pink group-hover:scale-110' : 'bg-gray-400'}`} />
        </div>
      </div>

      <div className={`flex justify-between items-center text-xs sm:text-sm font-bold ${isActive ? 'text-gray-500' : 'text-gray-400'}`}>
        <span>{STEPS[0].label}</span>
        <span className={`text-base sm:text-lg px-4 py-1.5 rounded-full ${isActive ? 'text-black bg-pastel-bg' : 'text-gray-500 bg-gray-100'}`}>
          {isActive ? currentStep.label : "Any Age"}
        </span>
        <span>{STEPS[STEPS.length - 1].label}</span>
      </div>
    </div>
  );
};

export default ElasticSlider;
