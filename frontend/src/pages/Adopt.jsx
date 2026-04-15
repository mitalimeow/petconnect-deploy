const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Loader2, Cat, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import FiltersPanel from '../components/adopt/FiltersPanel';
import PetCard from '../components/adopt/PetCard';
import ShelterLocator from '../components/adopt/ShelterLocator';
import CardSkeleton from '../components/common/CardSkeleton';
import UploadPetModal from '../components/adopt/UploadPetModal';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ContactModal from '../components/adopt/ContactModal';

const Adopt = () => {
  const { user } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPetForContact, setSelectedPetForContact] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  
  // Real-time active filters
  const [activeFilters, setActiveFilters] = useState({
    type: [],
    location: '',
    age: null,
    color: [],
    ownerType: []
  });

  const [activeTab, setActiveTab] = useState('Pets'); // 'Pets' or 'Shelters'

  const fetchPets = async (filtersObj, searchStr) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchStr) params.append('search', searchStr);
      
      // Map 'type' filter to 'type' param (backend handles it as animalType)
      if (filtersObj.type && filtersObj.type.length > 0) params.append('type', filtersObj.type.join(','));
      if (filtersObj.color && filtersObj.color.length > 0) params.append('color', filtersObj.color.join(','));
      if (filtersObj.location) params.append('location', filtersObj.location);
      if (filtersObj.age !== null && filtersObj.age !== 999) params.append('age', filtersObj.age);
      
      const res = await fetch(`${API_BASE}/api/adoption?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPets(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
     // Fetch initially
     fetchPets(activeFilters, searchQuery);

     if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(
         (pos) => {
           // Background sync to backend for distance calculations
           fetch(`${API_BASE}/api/profile/location`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
              credentials: 'include'
           }).catch(err => console.log('Location sync failed silently', err));
         },
         (err) => { console.warn("Adopt Geolocation tracking declined.", err); }
       );
     }
  }, []);

  const handleApplyFilters = (newFilters) => {
     setActiveFilters(newFilters);
     setIsFilterOpen(false);
     fetchPets(newFilters, searchQuery);
  };

  const handleSearchSubmit = (e) => {
     e.preventDefault();
     fetchPets(activeFilters, searchQuery);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pt-8 pb-20 relative">
      
      {toast && (
        <div className={`fixed top-24 right-8 z-[10001] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${toast.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4">
        
        <div className="text-center mb-6">
          <h1 className="text-5xl md:text-6xl font-handwritten font-bold text-gray-900 mb-4">Adopt a Pet!</h1>
        </div>

        {/* Unified Search & Header Bar */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-4 mb-8">
           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              
              {/* Tabs */}
              <div className="flex bg-gray-50 p-1.5 rounded-full w-full md:w-auto">
                 <button onClick={() => setActiveTab('Pets')} className={`flex-1 md:w-32 py-2 rounded-full font-bold text-sm transition-all ${activeTab === 'Pets' ? 'bg-white shadow-soft text-black' : 'text-gray-500 hover:text-black'}`}>
                   Pets
                 </button>
                 <button onClick={() => setActiveTab('Shelters')} className={`flex-1 md:w-32 py-2 rounded-full font-bold text-sm transition-all ${activeTab === 'Shelters' ? 'bg-white shadow-soft text-black' : 'text-gray-500 hover:text-black'}`}>
                   Shelters
                 </button>
              </div>

              {/* Search Form */}
              {activeTab === 'Pets' && (
                <form onSubmit={handleSearchSubmit} className="relative w-full md:flex-1 md:max-w-md">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                   <input 
                     type="text" 
                     placeholder="Search pets.." 
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                     className="w-full pl-11 pr-4 py-3 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:border-pastel-pink focus:bg-white transition-all text-sm font-medium"
                   />
                   <button type="submit" className="hidden">Search</button>
                </form>
              )}

              {/* Actions Area */}
              {activeTab === 'Pets' && (
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                   {user && (
                     <button 
                       onClick={() => setIsUploadModalOpen(true)}
                       className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#f7b5b5] text-black border border-black/20 rounded-full font-bold shadow-sm hover:scale-105 transition-transform whitespace-nowrap"
                     >
                       Upload Pet
                     </button>
                   )}
                   <button 
                      onClick={() => setIsFilterOpen(true)}
                      className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-full font-bold shadow-lg hover:bg-gray-800 transition-colors"
                   >
                      <Filter size={18} />
                      Filters ▼
                   </button>
                </div>
              )}
           </div>
        </div>


        {/* Grid Area */}
        {activeTab === 'Shelters' ? (
          <div className="mt-4 min-h-[50vh]">
              <ShelterLocator searchQuery={searchQuery} />
           </div>
        ) : (
          loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <CardSkeleton key={i} variant="grid" />
              ))}
            </div>
          ) : (
            <React.Fragment>
              {pets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {pets.map(pet => (
                  <PetCard key={pet._id} pet={pet} onContactClick={(p) => setSelectedPetForContact(p)} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-white border border-gray-100 rounded-[30px] shadow-sm">
                 <Cat className="text-gray-400 mx-auto mb-4" size={64} />
                 <h3 className="text-2xl font-bold font-handwritten text-gray-800">No furry friends found</h3>
                 <p className="text-gray-500 mt-2">Try adjusting your filters or search criteria.</p>
                 <button onClick={() => handleApplyFilters({ type: [], location: '', age: null, color: [], ownerType: [] })} className="mt-6 px-6 py-2 bg-pastel-pink text-white rounded-full font-bold hover:scale-105 transition-transform shadow-sm">Clear Filters</button>
              </div>
             )}
            </React.Fragment>
          )
        )}

      </div>

      <FiltersPanel 
         isOpen={isFilterOpen} 
         onClose={() => setIsFilterOpen(false)} 
         initialFilters={activeFilters}
         onApply={handleApplyFilters}
      />

      <ContactModal 
         pet={selectedPetForContact} 
         onClose={() => setSelectedPetForContact(null)} 
      />

      {user && (
        <UploadPetModal 
          isOpen={isUploadModalOpen} 
          onClose={() => setIsUploadModalOpen(false)} 
          onUploadSuccess={() => {
            setIsUploadModalOpen(false);
            showToast("Pet successfully listed!");
            fetchPets(activeFilters, searchQuery);
          }}
        />
      )}
    </div>
  );
};

export default Adopt;
