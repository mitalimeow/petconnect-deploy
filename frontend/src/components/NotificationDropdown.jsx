import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const NotificationDropdown = ({ onClose }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [friendRes, notifRes] = await Promise.all([
         fetch(`${API_BASE}/api/friend-request/received`, { credentials: 'include' }),
         fetch(`${API_BASE}/api/notifications`, { credentials: 'include' })
      ]);

      let combined = [];

      if (friendRes.ok) {
         const friends = await friendRes.json();
         friends.forEach(f => {
            combined.push({
               _id: f._id,
               type: 'FRIEND_REQUEST_ACTIONABLE',
               sender: f.sender,
               createdAt: f.createdAt // Assuming friend-request backend might have it, or it will fall back to bottom
            });
         });
      }

      if (notifRes.ok) {
         const notifs = await notifRes.json();
         notifs.forEach(n => {
            combined.push({
               _id: n.id,
               type: n.type,
               message: n.message,
               image: n.image,
               redirect: n.redirect,
               isRead: n.isRead,
               createdAt: n.createdAt,
               petId: n.petId
            });
         });
      }

      // Sort with newest first. Items without dates fall to bottom
      combined.sort((a,b) => {
         const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
         const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
         return dateB - dateA;
      });

      setItems(combined);
    } catch (err) {
      console.error("Failed to fetch notification drops", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFriendAction = async (action, requestId, senderId) => {
    try {
      const endpoint = `${API_BASE}/api/friend-request/${action}/${senderId}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        setItems(prev => prev.filter(req => req._id !== requestId));
      }
    } catch (err) {
      console.error(`Failed to ${action} request`, err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_BASE}/api/notifications/read/${id}`, {
        method: 'PATCH',
        credentials: 'include'
      });
      setItems(prev => prev.map(item => item._id === id ? { ...item, isRead: true } : item));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="absolute top-14 right-0 md:right-14 mt-2 w-80 bg-white rounded-3xl shadow-soft border border-border overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
      <div className="p-4 border-b border-border bg-pastel-pink/10 flex justify-between items-center">
        <h3 className="font-bold text-foreground text-lg font-handwritten">Notifications</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-foreground">
          <X size={18} />
        </button>
      </div>
      
      <div className="max-h-[320px] overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-sm font-medium text-gray-500">Loading...</div>
        ) : items.length > 0 ? (
          items.map(item => {
            if (item.type === 'FRIEND_REQUEST_ACTIONABLE') {
               return (
                  <div key={item._id} className="flex items-center gap-3 p-4 border-b border-border/50 hover:bg-pastel-bg/50 transition-colors">
                    <Link to={`/profile/${item.sender.username}`} onClick={onClose}>
                      <img src={item.sender.profilePhoto || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} alt="avatar" className="w-10 h-10 rounded-full flex-shrink-0 border-2 border-white shadow-sm hover:scale-105 transition-transform" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/profile/${item.sender.username}`} onClick={onClose} className="hover:underline">
                        <p className="text-sm font-bold text-foreground truncate">{item.sender.name}</p>
                        <p className="text-xs text-pastel-blue font-semibold truncate">@{item.sender.username}</p>
                      </Link>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleFriendAction('accept', item._id, item.sender._id)}
                        className="p-2 bg-green-500 text-white rounded-full hover:scale-110 transition-transform shadow-sm flex-shrink-0"
                        title="Accept"
                      >
                         <Check size={14} strokeWidth={3} />
                      </button>
                      <button 
                        onClick={() => handleFriendAction('reject', item._id, item.sender._id)}
                        className="p-2 bg-red-400 text-white rounded-full hover:scale-110 transition-transform shadow-sm flex-shrink-0"
                        title="Reject"
                      >
                         <X size={14} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
               );
            }

            // General Notifications (LOST_PET_ALERT)
            return (
               <div key={item._id} className={`flex items-start gap-3 p-4 border-b border-border/50 hover:bg-pastel-bg/50 transition-colors ${!item.isRead ? 'bg-orange-50/40' : ''}`}>
                 <Link to={item.redirect || '/'} state={{ openPetId: item.petId }} onClick={() => { if(!item.isRead) markAsRead(item._id); onClose(); }}>
                   <img src={item.image || "https://images.unsplash.com/photo-1543466835-00a7907e9de1"} alt="alert" className="w-10 h-10 object-cover rounded-full flex-shrink-0 border-2 border-white shadow-sm hover:scale-105 transition-transform" />
                 </Link>
                 <div className="flex-1 min-w-0 pt-0.5">
                   <Link to={item.redirect || '/'} state={{ openPetId: item.petId }} onClick={() => { if(!item.isRead) markAsRead(item._id); onClose(); }} className="hover:underline block">
                     <p className="text-sm font-bold text-gray-900 leading-tight mb-1">{item.message}</p>
                     {item.type === 'LOST_PET_ALERT' && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-orange-100 text-orange-600 font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                           <MapPin size={10} strokeWidth={3} /> Lost Pet Nearby
                        </span>
                     )}
                   </Link>
                 </div>
                 {!item.isRead && (
                    <button onClick={() => markAsRead(item._id)} className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-2 shrink-0" title="Mark as read"></button>
                 )}
               </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-sm font-medium text-gray-500">
             You have no new notifications.
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
