import React, { useState, useEffect, useRef } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FriendsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const fetchFriends = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/friends/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch friends");
      const data = await res.json();
      setFriends(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchFriends();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="flex items-center gap-2 bg-white/80 hover:bg-white px-5 py-2.5 rounded-full shadow-sm text-gray-700 font-medium transition-colors border border-gray-100"
      >
        <Users size={18} className="text-[#DBB3B1]" />
        Friends
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-gray-100 bg-gray-50 text-sm font-semibold text-gray-700">
            Your Friends
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center p-6 bg-white">
                <Loader2 className="animate-spin text-[#DBB3B1]" size={24} />
              </div>
            ) : friends.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500 bg-white">
                You haven't added any friends yet.
              </div>
            ) : (
              friends.map(friend => (
                <div
                  key={friend._id}
                  onClick={() => {
                    navigate(`/profile/${friend.username}`);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#B5D2CB] hover:bg-opacity-20 cursor-pointer transition-colors bg-white border-b border-gray-50 last:border-0"
                >
                  <img
                    src={friend.profilePhoto || `https://ui-avatars.com/api/?name=${friend.name || 'U'}&background=DBB3B1&color=fff`}
                    alt={friend.name}
                    className="w-10 h-10 rounded-full object-cover shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{friend.name}</p>
                    <p className="text-xs text-gray-500 truncate">@{friend.username}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
