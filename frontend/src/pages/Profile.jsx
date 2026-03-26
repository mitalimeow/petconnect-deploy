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
  const { username } = useParams();
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
        
        // Smart fallback parser securely handling outdated Google LocalStorage architectures
        const fallbackSlug = userCache.name ? userCache.name.replace(/\s+/g, '-').toLowerCase() : 'mock-user';
        const targetUsername = username === 'me' ? (userCache.username || fallbackSlug) : username;
        
        if (!targetUsername) return;

        const endpoint = username === 'me' ? 'http://localhost:5000/api/profile/me' : `http://localhost:5000/api/profile/${targetUsername}`;
        const res = await fetch(`${endpoint}?t=${Date.now()}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
        } else {
          // Fallback context if DB isn't populated for this user preview
          setProfileData({
            isOwner: username === 'me',
            isFriend: false,
            profile: {
              name: 'Prisha Raje',
              username: targetUsername,
              location: 'Thane',
              phone: '+91 9594360507',
              email: 'mitalipaullol268@gmail.com',
              tags: ['Pet Owner', 'Volunteer'],
              friends: [],
              bannerImage: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1600&q=80',
              profilePhoto: DEFAULT_AVATAR,
              posts: [
                {
                  _id: 'mock1',
                  timeAgo: '5 days ago',
                  author: {
                    name: 'Prisha Raje',
                    profilePhoto: DEFAULT_AVATAR,
                    tags: ['Pet Owner', 'Volunteer']
                  }
                }
              ]
            }
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [username, user, refreshTrigger]);

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

  const displayPhone = (isOwner || isFriend) ? profile.phone : "Private (Friends Only)";
  const displayEmail = (isOwner || isFriend) ? profile.email : "Private (Friends Only)";

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

            <div className="flex flex-wrap gap-2 mt-4">
              {profile.tags && profile.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
            </div>

            {profile.location && (
              <div className="flex items-center text-gray-600 font-medium mt-4 gap-1.5">
                <MapPin size={20} className="text-red-500" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>
          
          {/* Right Side: Info Panel */}
          <div className="mt-8 md:mt-2 flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
            {isOwner ? (
              <button className="px-6 py-2.5 bg-[#f7b5b5] text-black border border-black/20 font-bold rounded-[12px] hover:scale-105 transition-transform shadow-sm whitespace-nowrap">
                Upload Pet
              </button>
            ) : (!isFriend && (
              <button 
                onClick={handleAddFriend}
                className="px-6 py-2.5 bg-pastel-blue text-white font-bold rounded-[12px] hover:scale-105 transition-transform shadow-sm whitespace-nowrap"
              >
                Add Friend
              </button>
            ))}

            <div className="text-left md:text-right mt-4 flex flex-col gap-2 w-full md:w-auto">
              <div className="flex items-center justify-start md:justify-end gap-2 text-gray-800 font-bold tracking-wide">
                <Phone size={16} className="text-gray-400" />
                {displayPhone}
              </div>
              <div className="flex items-center justify-start md:justify-end gap-2 text-blue-500 font-medium cursor-pointer hover:underline">
                <Mail size={16} className="text-blue-400" />
                {displayEmail}
              </div>
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
            {profile.name} hasn't posted anything yet.
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
