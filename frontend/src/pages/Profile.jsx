import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Edit2, Phone, Mail } from 'lucide-react';
import TagBadge from '../components/profile/TagBadge';
import PostCard from '../components/profile/PostCard';
import FriendDropdown from '../components/profile/FriendDropdown';
import EditProfileModal from '../components/profile/EditProfileModal';
import { useAuth } from '../context/AuthContext';

const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Helper trigger to explicitly wipe DOM caching when profile overwrites push
  const handleProfileRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Load target profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const userCache = JSON.parse(localStorage.getItem('petconnect_user') || '{}');
        const token = userCache.token;
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const targetId = id === 'me' ? (userCache.id || 'me') : id;
        if (!targetId) {
          setLoading(false);
          return;
        }

        const endpoint = id === 'me' ? 'http://localhost:5000/api/profile/me' : `http://localhost:5000/api/profile/${targetId}`;
        
        const fallbackPayload = {
          isOwner: id === 'me' || id === userCache.id,
          isFriend: false,
          profile: {
            name: userCache.name || 'New Pet Owner',
            username: userCache.username || 'user',
            location: userCache.location || '',
            phone: '',
            email: userCache.email || '',
            tags: [...(userCache.tags || []), { name: 'Community Member', color: '#B5D2CB' }],
            friends: [],
            bannerImage: '',
            profilePhoto: userCache.avatar || DEFAULT_AVATAR,
            posts: []
          }
        };
        const res = await fetch(`${endpoint}?t=${Date.now()}`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.offlineFallback) {
             setProfileData(fallbackPayload);
          } else {
             setProfileData(data);
          }
        } else {
          setProfileData(fallbackPayload);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
        const userCache = JSON.parse(localStorage.getItem('petconnect_user') || '{}');
        setProfileData({
          isOwner: id === 'me' || id === userCache.id,
          isFriend: false,
          profile: {
            name: userCache.name || 'Community Member',
            username: userCache.username || 'mock-user',
            location: userCache.location || '',
            phone: '',
            email: userCache.email || '',
            tags: [{ name: 'Community Member', color: '#B5D2CB' }],
            friends: [],
            bannerImage: '',
            profilePhoto: userCache.avatar || DEFAULT_AVATAR,
            posts: []
          }
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [id, user, refreshTrigger]);

  const handleAddFriend = async () => {
    try {
      const userCache = JSON.parse(localStorage.getItem('petconnect_user') || '{}');
      const token = userCache.token;
      const res = await fetch(`http://localhost:5000/api/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ targetUserId: profileData.profile._id })
      });
      if (res.ok) alert("Friend request sent!");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-2xl">Loading...</div>;
  if (!profileData) return <div className="p-20 text-center font-bold text-2xl">Profile not found.</div>;

  const { profile, isOwner, isFriend } = profileData;

  // Privacy Logic: Public vs Private Account Status
  const isPublic = profile.accountStatus === 'public';
  const displayPhone = profile.phone ? (isPublic || isOwner || isFriend ? profile.phone : "Hidden for Privacy") : null;
  const displayEmail = profile.email ? (isPublic || isOwner || isFriend ? profile.email : "Hidden for Privacy") : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mb-20">
      {/* 1. Top Banner Section */}
      <div className="relative w-full h-64 md:h-80 rounded-t-[30px] overflow-hidden bg-gray-200 shadow-sm border border-border">
        {profile.bannerImage && (
          <img src={profile.bannerImage} alt="Banner" className="w-full h-full object-cover" />
        )}
        
        {/* Friends button floating inside banner right side */}
        <div className="absolute top-6 right-6 z-10">
          <FriendDropdown friends={profile.friends || []} />
        </div>
      </div>

      {/* Profile Main Content Box */}
      <div className="bg-white rounded-b-[30px] border border-t-0 border-black/10 shadow-soft px-8 pb-10 relative">
        
        <div className="flex flex-col md:flex-row justify-between items-start pt-4">
          
          {/* Left Side: Avatar & Name */}
          <div className="flex flex-col">
            <div className="-mt-24 mb-4 relative ml-4">
              <img 
                src={profile.profilePhoto || DEFAULT_AVATAR} 
                alt="Profile" 
                className="w-40 h-40 rounded-full border-4 border-white object-cover shadow-lg bg-gray-100"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <h1 className="text-4xl md:text-5xl font-handwritten font-bold text-gray-900 m-0 leading-none">
                {profile.name}
              </h1>
              {isOwner && (
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-1.5 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100 border border-gray-200 shadow-sm"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>

            {profile.username && (
               <p className="text-pastel-blue font-bold text-lg mt-2 tracking-wide">
                  @{profile.username}
               </p>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              {profile.tags && Array.from(new Set(profile.tags.map(t => typeof t === 'object' ? t.name : t))).map((tagName, i) => (
                 <TagBadge key={i} tag={tagName} />
              ))}
            </div>

            {profile.location && (
              <div className="flex items-center text-gray-600 font-medium mt-4 gap-1.5">
                <MapPin size={20} className="text-red-500" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>
          
          {/* Right Side: Info Panel (Contact Suite Implementation) */}
          <div className="mt-8 md:mt-2 flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
            {isOwner ? (
              <button className="px-6 py-2.5 bg-[#f7b5b5] text-black border border-black/20 font-bold rounded-[12px] hover:scale-105 transition-transform shadow-sm whitespace-nowrap">
                Manage Profile
              </button>
            ) : (
              <div className="flex flex-col gap-3 w-full md:w-auto">
                {isPublic ? (
                  <div className="flex flex-col md:flex-row gap-3">
                    <button 
                      onClick={() => window.location.href = `tel:${profile.phone}`}
                      className="px-8 py-3 bg-gray-900 text-white font-black rounded-[15px] hover:bg-black transition-all shadow-lg text-sm uppercase tracking-widest flex items-center gap-2"
                    >
                      <Phone size={16} /> Call Owner
                    </button>
                    <button className="px-8 py-3 bg-white text-gray-900 border-2 border-gray-900 font-black rounded-[15px] hover:bg-gray-50 transition-all text-sm uppercase tracking-widest flex items-center gap-2">
                      <Mail size={16} /> Message
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => alert(`Emergency notification sent to ${profile.name}! They will be notified that you may have found their pet.`)}
                    className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-black rounded-[20px] shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3 border-2 border-white/20"
                  >
                    <CheckCircle size={20} /> Send Emergency Request
                  </button>
                )}
                {!isFriend && (
                  <button 
                    onClick={handleAddFriend}
                    className="w-full px-6 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 font-bold rounded-[12px] hover:bg-indigo-100 transition-all text-[11px] uppercase tracking-wider"
                  >
                    Add to Network
                  </button>
                )}
              </div>
            )}

            <div className="text-left md:text-right mt-4 flex flex-col gap-2 w-full md:w-auto">
              {displayPhone && (
                <div className={`flex items-center justify-start md:justify-end gap-2 font-bold tracking-wide ${isPublic || isOwner || isFriend ? "text-gray-800" : "text-gray-400 italic font-medium opacity-60"}`}>
                  <Phone size={16} className="text-gray-400" />
                  {displayPhone}
                </div>
              )}
              {displayEmail && (
                <div className={`flex items-center justify-start md:justify-end gap-2 font-medium ${isPublic || isOwner || isFriend ? "text-blue-500 cursor-pointer hover:underline" : "text-gray-400 italic opacity-60"}`}>
                  <Mail size={16} className="text-blue-400" />
                  {isPublic || isOwner || isFriend ? (
                    <a href={`mailto:${profile.email}`}>{displayEmail}</a>
                  ) : (
                    displayEmail
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Posts Section */}
      <div className="mt-12">
        <h2 className="text-3xl font-handwritten font-bold text-gray-800 mb-6">Recent posts:</h2>
        
        {profile.posts && profile.posts.length > 0 ? (
          <div className="space-y-6">
            {profile.posts.map(post => <PostCard key={post._id} post={post} />)}
          </div>
        ) : (
          <div className="bg-white rounded-[20px] p-8 text-center text-gray-500 border border-gray-100 shadow-sm">
            {isOwner ? "You haven't made any posts." : `${profile.name} hasn't posted anything yet.`}
          </div>
        )}
      </div>

      {isOwner && (
        <EditProfileModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          initialData={profile} 
          onSaveSuccess={handleProfileRefresh}
        />
      )}
    </div>
  );
};

export default Profile;
