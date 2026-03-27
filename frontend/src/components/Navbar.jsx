import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SidebarMenu from './SidebarMenu';
import ProfileMenu from './ProfileMenu';
import NotificationDropdown from './NotificationDropdown';
import { useGoogleLogin } from '@react-oauth/google';

const Navbar = () => {
  const { user, login } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());
        
        // Pass info to our backend to generate DB-tied JWT
        const res = await fetch('http://localhost:5000/api/auth/google', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ userInfo })
        });
        
        if (res.ok) {
           const data = await res.json();
           login({ ...data.user, token: data.token, avatar: userInfo.picture });
        } else {
           console.error("Backend login sync failed");
           alert("Login failed: The backend server rejected the login.");
        }
      } catch (err) {
        console.error('Login failed', err);
        alert("Login failed: Could not connect to the backend server. Is your backend running on port 5000?");
      }
    },
    onError: (error) => {
      console.error("Google Login failed:", error);
      alert("Google Login failed: " + (error.error || "Unknown error"));
    }
  });

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
        {(user?.tags?.includes('Admin') || user?.email === 'mitalipaullol268@gmail.com') && (
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
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
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
