import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';

const ProfileMenu = ({ onClose }) => {
  const { user, logout } = useAuth();

  return (
    <div className="absolute top-14 right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200 origin-top-right">
      <div className="p-4 border-b border-border bg-pastel-bg/50">
        <p className="font-bold text-foreground truncate">{user?.name}</p>
        <p className="text-sm text-gray-500 truncate">{user?.email}</p>
      </div>
      
      <div className="p-2">
        <Link 
          to={`/profile/${user?.id}`}  
          onClick={onClose}
          className="flex items-center gap-3 w-full px-3 py-2 text-left text-foreground hover:bg-pastel-blue/20 rounded-xl transition-colors"
        >
          <User size={18} />
          View Profile
        </Link>
        <button 
          onClick={() => {
            logout();
            onClose();
          }}
          className="flex items-center gap-3 w-full px-3 py-2 mt-1 text-left text-red-500 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileMenu;
