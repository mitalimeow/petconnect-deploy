import React from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, Home, Heart, Users, Phone, MapPin, BookOpen, ClipboardList } from 'lucide-react';

const SidebarMenu = ({ isOpen, onClose }) => {
  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Adopt Me!', icon: Heart, path: '/adopt' },
    { name: 'Helpline', icon: Phone, path: '/helpline' },
    { name: 'Lost & Found', icon: MapPin, path: '/lost-found' },
    { name: 'Education', icon: BookOpen, path: '/education' },
    { name: 'Tag Applications', icon: ClipboardList, path: '/applications' },
  ];

  return createPortal(
    <>
      {/* Overlay - now properly dark and blurred over the entire screen */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-md z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      ></div>

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 left-0 w-72 h-[100dvh] bg-white shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 flex flex-col h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-handwritten font-bold text-pastel-pink">Menu</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-red-50 text-foreground transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link 
                  key={index} 
                  to={item.path}
                  onClick={onClose}
                  className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-pastel-bg text-foreground font-medium transition-colors hover:translate-x-1 duration-200"
                >
                  <Icon size={20} className="text-pastel-purple" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 pt-8 border-t border-border/60">
            <p className="text-sm text-gray-400 text-center font-handwritten text-xl">
              Connecting Hearts.
            </p>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default SidebarMenu;
