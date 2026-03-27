import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Loader2, Cat } from 'lucide-react';
import FiltersPanel from '../components/adopt/FiltersPanel';
import PetCard from '../components/adopt/PetCard';
import ShelterLocator from '../components/adopt/ShelterLocator';

const Adopt = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
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
      
      if (filtersObj.type && filtersObj.type.length > 0) params.append('type', filtersObj.type.join(','));
      if (filtersObj.color && filtersObj.color.length > 0) params.append('color', filtersObj.color.join(','));
      if (filtersObj.location) params.append('location', filtersObj.location);
      if (filtersObj.age !== null && filtersObj.age !== 999) params.append('age', filtersObj.age);
      if (filtersObj.ownerType && filtersObj.ownerType.length > 0) params.append('ownerType', filtersObj.ownerType.join(','));
      
      const res = await fetch(`http://localhost:5000/api/pets?${params.toString()}`);
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
    <div className="min-h-screen bg-[#fafafa] pt-8 pb-20">
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
              <form onSubmit={handleSearchSubmit} className="relative w-full md:flex-1 md:max-w-md">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                 <input 
                   type="text" 
                   placeholder="Search pets, shelters.." 
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   className="w-full pl-11 pr-4 py-3 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:border-pastel-pink focus:bg-white transition-all text-sm font-medium"
                 />
                 <button type="submit" className="hidden">Search</button>
              </form>

              {/* Filters Button */}
              {activeTab === 'Pets' && (
                <button 
                   onClick={() => setIsFilterOpen(true)}
                   className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-full font-bold shadow-lg hover:bg-gray-800 transition-colors"
                >
                   <Filter size={18} />
                   Filters ▼
                </button>
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
            <div className="py-20 flex justify-center items-center">
              <Loader2 className="animate-spin text-pastel-pink" size={48} />
            </div>
          ) : (
            <React.Fragment>
              {pets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {pets.map(pet => (
                  <PetCard key={pet._id} pet={pet} />
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
    </div>
  );
};

export default Adopt;
