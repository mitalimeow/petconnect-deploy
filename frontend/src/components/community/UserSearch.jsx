import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TagBadge from '../profile/TagBadge';

const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`;

const UserSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        try {
          const res = await fetch(`${API_BASE}/api/profile/search?q=${encodeURIComponent(query)}`);
          if (res.ok) {
            const data = await res.json();
            setResults(data);
            setIsOpen(true);
          }
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleResultClick = (userId) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="w-full md:max-w-md relative group z-50" ref={dropdownRef}>
      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
        {isLoading ? (
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
        ) : (
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        )}
      </div>
      <input
        type="text"
        className="w-full pl-14 pr-6 py-3.5 bg-white border-2 border-gray-100 rounded-[28px] outline-none focus:border-blue-200 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-gray-700 placeholder:text-gray-400 shadow-sm hover:shadow-md"
        placeholder="Search users by name or handle..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (results.length > 0) setIsOpen(true); }}
      />
      
      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden max-h-[300px] overflow-y-auto z-50 scrollbar-hide">
          {results.map((user) => (
            <div 
              key={user._id}
              onClick={() => handleResultClick(user._id)}
              className="flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 text-sm font-bold bg-[#E2ECF6]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-gray-900 font-bold whitespace-nowrap shrink-0">{user.name}</span>
                  {user.tags && user.tags.length > 0 && (
                    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1 items-center">
                      {Array.from(new Set(user.tags.map(t => typeof t === 'object' ? t.name : t))).map((tagName, i) => (
                        <TagBadge key={i} tag={tagName} size="sm" />
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-gray-500 text-sm truncate" style={{ marginTop: '-4px' }}>@{user.username}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 text-center text-gray-500 font-medium z-50">
          No users found for "{query}"
        </div>
      )}
    </div>
  );
};

export default UserSearch;
