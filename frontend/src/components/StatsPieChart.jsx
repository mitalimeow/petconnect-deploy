import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Dogs adopted', value: 40, color: '#A54A6B' }, // Magenta/Maroon
  { name: 'Cats adopted', value: 30, color: '#FF6B8B' }, // Bright Pink
  { name: 'Fishes adopted', value: 20, color: '#FF9E80' }, // Light Orange
  { name: 'Others adopted', value: 10, color: '#FFE082' }, // Pale Yellow
];

const StatsPieChart = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-12 mb-16 mt-8">
      
      {/* Title */}
      <h2 className="text-center md:text-left text-[28px] md:text-3xl font-poppins font-semibold text-[#2D3748] mb-8">
        Animals Adopted Last Year
      </h2>

      {/* Container */}
      <div className="bg-white/80 rounded-3xl p-8 md:p-12 border border-border/50 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-2px_rgba(0,0,0,0.05)] backdrop-blur-md">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          
          {/* Chart Area (Left Side) */}
          <div className="flex-1 w-full flex justify-center items-center h-[300px] md:h-[400px] order-1">
            <div className="w-[280px] h-[280px] md:w-[350px] md:h-[350px] relative">
              
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <PieChart>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                      fontFamily: 'inherit',
                      fontWeight: 'bold'
                    }} 
                    itemStyle={{ color: '#3D3D3D' }}
                    formatter={(value) => [`${value}%`, 'Adoption Rate']}
                  />
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius="65%"
                    outerRadius="90%"
                    paddingAngle={4}
                    cornerRadius={8}
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={2}
                    animationBegin={200}
                    animationDuration={1500}
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        style={{ outline: 'none' }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend Area (Right Side) */}
          <div className="flex-1 w-full space-y-4 md:pl-8 order-2">
            {data.map((entry, index) => (
              <div key={index} className="flex justify-between items-center group cursor-default w-full p-3 hover:bg-black/5 rounded-xl transition-colors">
                
                <div className="flex items-center gap-4">
                  {/* Rounded square swatch: 12px x 12px, border-radius 4px */}
                  <div 
                    className="w-[12px] h-[12px] shrink-0 rounded-[4px] shadow-sm transition-transform group-hover:scale-110"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-lg md:text-xl font-raleway font-medium text-[#4A5568]">
                    {entry.name}
                  </span>
                </div>

                {/* Table feel percentage */}
                <span className="text-lg md:text-xl font-raleway font-bold text-[#4A5568] pl-5 border-l-2 border-gray-200/60">
                  {entry.value}%
                </span>

              </div>
            ))}
          </div>

        </div>
        
      </div>
    </div>
  );
};

export default StatsPieChart;
