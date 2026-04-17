const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SidebarMenu from './SidebarMenu';
import ProfileMenu from './ProfileMenu';
import NotificationDropdown from './NotificationDropdown';


const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

const Navbar = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Handle login_error query param set by backend callback redirect on failure
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loginError = params.get('login_error');
    if (loginError) {
      alert(loginError === 'cancelled' ? 'Google login was cancelled.' : 'Google login failed. Please try again.');
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const googleLogin = async () => {
    try {
      // Ask the backend for the Google consent URL (Authorization Code flow)
      const res = await fetch(`${API_BASE}/api/auth/google/url`);
      if (!res.ok) throw new Error('Could not reach backend');
      const { url } = await res.json();
      // Full-page redirect to Google — backend handles the callback
      window.location.href = url;
    } catch (err) {
      console.error('Failed to start Google login:', err);
      alert('Login failed: could not connect to the server. Please try again.');
    }
  };

  return (
    <header className="fixed w-full top-0 left-0 bg-white/80 backdrop-blur-md z-50 border-b border-border shadow-sm px-6 py-4 flex items-center justify-between transition-all">
      {/* Left Area */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-pastel-pink rounded-full flex items-center justify-center text-white font-bold text-xl shadow-soft group-hover:scale-105 transition-transform duration-300">
            🐾
          </div>
          <span className="font-handwritten text-3xl text-foreground font-bold">PetConnect</span>
        </Link>

        {/* Hamburger Menu - Visible only when logged in */ }
        {user && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 ml-4 rounded-xl hover:bg-pastel-bg transition-colors active:scale-95"
            aria-label="Open Menu"
          >
            <Menu size={28} className="text-foreground" />
          </button>
        )}
      </div>

      {/* Right Area */}
      <nav className="flex items-center gap-6 font-medium">
        <Link to="/about" className="hover:text-pastel-pink transition-colors hidden sm:block">About Us</Link>
        {(user?.tags?.some(tag => (tag?.name === 'Admin' || tag === 'Admin')) || user?.email === 'mitalipaullol268@gmail.com') && (
          <Link to="/admin-panel" className="hover:text-pastel-pink transition-colors hidden sm:block font-bold text-pastel-blue">Admin Panel</Link>
        )}
        
        {!user ? (
          <div className="flex items-center gap-4">
            <button onClick={() => googleLogin()} className="px-5 py-2 rounded-2xl border-2 border-border hover:border-pastel-blue hover:text-pastel-blue transition-all">Login</button>
            <button onClick={() => googleLogin()} className="px-5 py-2 rounded-2xl bg-pastel-pink text-white shadow-soft shadow-pastel-pink/40 hover:scale-105 hover:bg-[#ffa7a2] transition-all">Sign Up</button>
          </div>
        ) : (
          <div className="flex items-center gap-5 relative">
            <button 
              onClick={() => {
                setIsNotificationOpen(!isNotificationOpen);
                setIsProfileOpen(false);
              }}
              className="p-2 rounded-full hover:bg-pastel-bg relative transition-colors"
            >
              <Bell size={24} className="text-foreground" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-pastel-pink rounded-full"></span>
            </button>
            <button 
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotificationOpen(false);
              }}
              className="w-10 h-10 rounded-full border-2 border-pastel-blue overflow-hidden hover:scale-105 transition-transform relative z-10"
            >
              <img 
                src={user.profilePhoto || DEFAULT_AVATAR} 
                alt="Profile" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </button>

            {/* Dropdowns */}
            {isNotificationOpen && <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />}
            {isProfileOpen && <ProfileMenu onClose={() => setIsProfileOpen(false)} />}
          </div>
        )}
      </nav>

      {/* Sidebar Overlay */}
      <SidebarMenu isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </header>
  );
};

export default Navbar;
