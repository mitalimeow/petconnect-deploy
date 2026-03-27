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
    <div className="w-full max-w-6xl mx-auto px-4 md:px-12 mb-16">
      <div className="bg-white rounded-[30px] p-8 md:p-12 border border-border/50 shadow-soft">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          
          {/* Legend Area (Left Side) */}
          <div className="flex-1 space-y-6 md:pl-8">
            {data.map((entry, index) => (
              <div key={index} className="flex items-center gap-4 group cursor-default">
                <div 
                  className="w-10 h-8 rounded-full shadow-sm transition-transform group-hover:scale-110"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-2xl md:text-3xl font-handwritten text-[#3D3D3D]">
                  {entry.name}
                </span>
              </div>
            ))}
          </div>

          {/* Chart Area (Right Side) */}
          <div className="flex-1 w-full flex justify-center items-center h-[300px] md:h-[400px]">
            <div className="w-[280px] h-[280px] md:w-[350px] md:h-[350px] relative">
              {/* Soft glow background behind chart */}
              <div className="absolute inset-0 bg-[#FFF0F0] rounded-full blur-2xl transform scale-110"></div>
              
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
                    innerRadius={0}
                    outerRadius="90%"
                    dataKey="value"
                    stroke="white"
                    strokeWidth={4}
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
                  
                  {/* Custom Labels overlay for percentages */}
                  {/* Only using Tooltip for exact match to clean aesthetic, but adding custom labels inside for the wireframe feel */}
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius="90%"
                    dataKey="value"
                    stroke="none"
                    fill="transparent"
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
                      const RADIAN = Math.PI / 180;
                      // Place labels a bit closer to the edge for better visibility
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.65;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);

                      return (
                        <text 
                          x={x} 
                          y={y} 
                          fill="white" 
                          textAnchor="middle" 
                          dominantBaseline="central"
                          className="font-bold text-sm md:text-base"
                          style={{ pointerEvents: 'none', filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))' }}
                        >
                          {`${value}%`}
                        </text>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
        </div>
        
      </div>
    </div>
  );
};

export default StatsPieChart;
