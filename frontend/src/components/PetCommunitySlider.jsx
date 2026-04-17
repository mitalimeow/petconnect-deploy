const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`;
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Calendar } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const PetCommunitySlider = () => {
   const [events, setEvents] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
       const fetchEvents = async () => {
           try {
               const res = await fetch(`${API_BASE}/api/events`);
               const data = await res.json();
               setEvents(data);
           } catch (err) {
               console.error("Slider Fetch Error", err);
           } finally {
               setLoading(false);
           }
       };
       fetchEvents();
   }, []);

   if (loading) {
      return (
         <div className="w-full flex gap-6 overflow-hidden">
            {[1, 2, 3].map(i => (
               <div key={i} className="min-w-[100%] md:min-w-[48%] lg:min-w-[31%] bg-gray-50 animate-pulse rounded-[30px] h-[400px] border border-gray-100 shadow-sm shrink-0"></div>
            ))}
         </div>
      );
   }

   return (
       <div className="w-full relative px-1 lg:px-4">
           <Swiper
             modules={[Navigation, Pagination, Autoplay]}
             spaceBetween={30}
             slidesPerView={1}  
             navigation
             pagination={{ clickable: true, dynamicBullets: true }}
             autoplay={{ delay: 6000, disableOnInteraction: true }}
             breakpoints={{
                 768: { slidesPerView: 2 },   
                 1024: { slidesPerView: 3 }   
             }}
             className="pb-14 pt-2"
           >
               {events.map((ev) => (
                   <SwiperSlide key={ev.id} className="h-auto">
                       <div className="bg-white rounded-[24px] shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-[400px] group relative">
                           
                           {/* Hero Image Block with object-fit: cover */}
                           <div className="w-full h-48 relative overflow-hidden shrink-0">
                               <img src={ev.imageUrl} alt={ev.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                               <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                               
                               {/* Category Badge at top left with semi-transparent background */}
                               <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-in slide-in-from-top-4">
                                   <span className="text-[11px] font-extrabold text-white tracking-widest uppercase mt-0.5">{ev.category || 'Community Event'}</span>
                               </div>
                           </div>
                           
                           {/* Validated Content Formats */}
                           <div className="p-6 flex flex-col flex-1 bg-white relative -mt-4 rounded-t-[24px] z-10 mx-1">
                               <div className="flex items-center gap-2 text-gray-400 mb-2.5 font-bold text-[12px] uppercase tracking-wider">
                                  <Calendar size={14} strokeWidth={3} />
                                  <span>{new Date(ev.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                               </div>
                               
                               {/* Bold Title */}
                               <h3 className="text-[19px] font-extrabold text-gray-900 leading-tight mb-2 line-clamp-2 font-body group-hover:text-blue-600 transition-colors">
                                   {ev.name}
                               </h3>
                               
                               {/* Short Description (Limit to 2 lines) */}
                               <p className="text-[14px] text-gray-500 font-medium line-clamp-2 mb-4 flex-1 leading-relaxed">
                                   {ev.description}
                               </p>
                               
                               {/* Read more text link in brand's orange color */}
                               <a 
                                 href={ev.url} 
                                 target="_blank" 
                                 rel="noreferrer" 
                                 className="flex items-center justify-start gap-1 py-1 text-[#f97316] hover:text-[#ea580c] transition-all font-extrabold text-[15px] mt-auto"
                               >
                                  Read more &gt;
                               </a>
                           </div>
                       </div>
                   </SwiperSlide>
               ))}
           </Swiper>
           
           {/* Custom CSS for Blue Pagination Dots and Navigation */}
           <style jsx>{`
             .swiper-button-next, .swiper-button-prev { color: #3b82f6 !important; transform: scale(0.6); font-weight: 900; opacity: 0; transition: opacity 0.3s; }
             .swiper:hover .swiper-button-next, .swiper:hover .swiper-button-prev { opacity: 1; }
             .swiper-pagination-bullet-active { background: #3b82f6 !important; }
           `}</style>
       </div>
   );
};

export default PetCommunitySlider;
