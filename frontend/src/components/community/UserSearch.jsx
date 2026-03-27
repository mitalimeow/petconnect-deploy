import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      try {
        const userCache = JSON.parse(localStorage.getItem('petconnect_user') || '{}');
        const res = await fetch(`http://localhost:5000/api/users/search?q=${query}`, {
          headers: { 'Authorization': `Bearer ${userCache.token}` }
        });
        if (!res.ok) throw new Error("Search API error");
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error('Search failed', err);
      }
    };

    const timer = setTimeout(() => {
      fetchUsers();
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full max-w-sm" ref={searchRef}>
      <div className="relative shadow-sm rounded-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search users..."
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100/50 rounded-full shadow-sm focus:ring-2 focus:ring-[#DBB3B1] focus:outline-none transition-all placeholder:text-gray-400"
        />
      </div>

      {isOpen && results.length > 0 && query.trim() !== '' && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-50 overflow-hidden z-50 py-2">
          {results.map((user) => (
            <div
              key={user._id}
              onClick={() => {
                navigate(`/profile/${user._id}`);
                setIsOpen(false);
                setQuery('');
              }}
              className="flex items-center gap-3 px-4 py-2 hover:bg-[#B5D2CB] hover:bg-opacity-20 cursor-pointer transition-colors"
            >
              <img
                src={user.profilePhoto || `https://ui-avatars.com/api/?name=${user.name || 'U'}&background=DBB3B1&color=fff`}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">@{user.username}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {isOpen && query.trim() !== '' && results.length === 0 && (
         <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-50 py-4 text-center text-sm text-gray-500 z-50">
           No users found for "{query}"
         </div>
      )}
    </div>
  );
}
