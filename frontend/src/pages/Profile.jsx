const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`;
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Edit2, Phone, Mail, CheckCircle } from 'lucide-react';
import TagBadge from '../components/profile/TagBadge';

import FriendDropdown from '../components/profile/FriendDropdown';
import EditProfileModal from '../components/profile/EditProfileModal';
import PetCard from '../components/adopt/PetCard';
import ContactModal from '../components/adopt/ContactModal';
import { useAuth } from '../context/AuthContext';

const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userPets, setUserPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [selectedPetForContact, setSelectedPetForContact] = useState(null);
  const [petToDelete, setPetToDelete] = useState(null);

  const [userLostPets, setUserLostPets] = useState([]);
  const [loadingLostPets, setLoadingLostPets] = useState(true);
  const [lostPetToDelete, setLostPetToDelete] = useState(null);

  const [userEvents, setUserEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

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
        const headers = { 'Content-Type': 'application/json' };
        
        const targetId = id === 'me' ? (user?.id || 'me') : id;
        if (!targetId) {
          setLoading(false);
          return;
        }

        const endpoint = id === 'me' ? `${API_BASE}/api/profile/me` : `${API_BASE}/api/profile/${targetId}`;
        
        const fallbackPayload = {
          isOwner: id === 'me' || id === user?.id,
          isFriend: false,
          profile: {
            name: user?.name || 'New Pet Owner',
            username: user?.username || 'user',
            location: user?.location || '',
            phone: '',
            email: user?.email || '',
            tags: [...(user?.tags || []), { name: 'Community Member', color: '#B5D2CB' }],
            friends: [],
            bannerImage: '',
            profilePhoto: user?.profilePhoto || DEFAULT_AVATAR,
            posts: []
          }
        };
        const res = await fetch(`${endpoint}?t=${Date.now()}`, { headers, credentials: 'include' });
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
        setProfileData({
          isOwner: id === 'me' || id === user?.id,
          isFriend: false,
          profile: {
            name: user?.name || 'Community Member',
            username: user?.username || 'mock-user',
            location: user?.location || '',
            phone: '',
            email: user?.email || '',
            tags: [{ name: 'Community Member', color: '#B5D2CB' }],
            friends: [],
            bannerImage: '',
            profilePhoto: user?.profilePhoto || DEFAULT_AVATAR,
            posts: []
          }
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [id, user, refreshTrigger]);

  const fetchPetsList = async (targetUserId) => {
    setLoadingPets(true);
    try {
      const res = await fetch(`${API_BASE}/api/adoption/user/${targetUserId}`);
      if (res.ok) {
        const data = await res.json();
        setUserPets(data);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoadingPets(false);
    }
  };

  const fetchLostPetsList = async (targetUserId) => {
    setLoadingLostPets(true);
    try {
      const res = await fetch(`${API_BASE}/api/lost/user/${targetUserId}`);
      if (res.ok) {
        const data = await res.json();
        setUserLostPets(data);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoadingLostPets(false);
    }
  };

  const fetchUserEvents = async (targetUserId) => {
    setLoadingEvents(true);
    try {
      const res = await fetch(`${API_BASE}/api/events/user/${targetUserId}`);
      if (res.ok) {
        const data = await res.json();
        setUserEvents(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (profileData?.profile?._id) {
      fetchPetsList(profileData.profile._id);
      fetchLostPetsList(profileData.profile._id);
      fetchUserEvents(profileData.profile._id);
    }
  }, [profileData?.profile?._id, refreshTrigger]);

  // --- FRIENDSHIP ACTIONS ---
  const handleFriendAction = async (method, endpoint, successStatus) => {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: method === 'POST' && endpoint === '/api/friend-request/send' ? JSON.stringify({ receiverId: profileData.profile._id }) : null
      });
      if (res.ok) {
        setProfileData(prev => ({
          ...prev,
          isFriend: successStatus === 'friends',
          friendshipStatus: successStatus
        }));
      } else {
        const error = await res.json();
        alert(error.message || "Action failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendRequest = () => handleFriendAction('POST', '/api/friend-request/send', 'pending_sent');
  const handleCancelRequest = () => handleFriendAction('DELETE', `/api/friend-request/cancel/${profileData.profile._id}`, 'none');
  const handleAcceptRequest = () => handleFriendAction('POST', `/api/friend-request/accept/${profileData.profile._id}`, 'friends');
  const handleRejectRequest = () => handleFriendAction('POST', `/api/friend-request/reject/${profileData.profile._id}`, 'none');
  const handleRemoveFriend = () => handleFriendAction('DELETE', `/api/friends/remove/${profileData.profile._id}`, 'none');


  if (loading) return <div className="p-20 text-center font-bold text-2xl">Loading...</div>;
  if (!profileData) return <div className="p-20 text-center font-bold text-2xl">Profile not found.</div>;

  // Merge local user state for instant feedback on the Owner's profile
  let { profile, isOwner, isFriend } = profileData;
  if (isOwner && user) {
     profile = { ...profile, ...user, friends: profile.friends || [] };
  }

  // Privacy Logic: Respect individual field visibility toggles
  const displayPhone = profile.phone ? (profile.isPhonePublic || isOwner || isFriend ? profile.phone : "Hidden for Privacy") : null;
  const displayEmail = profile.email ? (profile.isEmailVisible || isOwner || isFriend ? profile.email : "Hidden for Privacy") : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mb-20">
      {/* 1. Top Banner Section */}
      <div className="relative w-full h-64 md:h-80 rounded-t-[30px] overflow-hidden bg-gray-200 shadow-sm border border-border">
        {profile.bannerImage && (
          <img src={profile.bannerImage} alt="Banner" className="w-full h-full object-cover" />
        )}
        
        {/* Friends button floating inside banner right side */}
        {isOwner && (
          <div className="absolute top-6 right-6 z-10">
            <FriendDropdown friends={profile.friends || []} />
          </div>
        )}
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
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <h1 className="text-4xl md:text-5xl font-handwritten font-bold text-gray-900 m-0 leading-none">
                {profile.name}
              </h1>
              {user && isOwner && (
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
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-6 py-2.5 bg-white text-gray-900 border border-gray-200 font-bold rounded-[12px] hover:scale-105 transition-transform shadow-sm whitespace-nowrap"
                >
                  Manage Profile
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 w-full md:w-auto">
                {profileData.friendshipStatus === 'none' && (
                  <button 
                    onClick={handleSendRequest}
                    className="w-full px-6 py-2.5 bg-pastel-blue text-white font-bold rounded-[12px] hover:scale-105 transition-transform shadow-sm whitespace-nowrap"
                  >
                    Send Request
                  </button>
                )}
                {profileData.friendshipStatus === 'pending_sent' && (
                  <button 
                    onClick={handleCancelRequest}
                    className="w-full px-6 py-2.5 bg-gray-400 text-white font-bold rounded-[12px] hover:scale-105 transition-transform shadow-sm whitespace-nowrap"
                  >
                    Cancel Request
                  </button>
                )}
                {profileData.friendshipStatus === 'pending_received' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleAcceptRequest}
                      className="w-full px-6 py-2.5 bg-green-500 text-white font-bold rounded-[12px] hover:scale-105 transition-transform shadow-sm whitespace-nowrap"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={handleRejectRequest}
                      className="w-full px-6 py-2.5 bg-red-400 text-white font-bold rounded-[12px] hover:scale-105 transition-transform shadow-sm whitespace-nowrap"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {profileData.friendshipStatus === 'friends' && (
                  <button 
                    onClick={handleRemoveFriend}
                    className="w-full px-6 py-2.5 bg-red-500 text-white font-bold rounded-[12px] hover:scale-105 transition-transform shadow-sm whitespace-nowrap"
                  >
                    Remove Friend
                  </button>
                )}
              </div>
            )}

            <div className="text-left md:text-right mt-4 flex flex-col gap-2 w-full md:w-auto">
              {displayPhone && (
                <div className={`flex items-center justify-start md:justify-end gap-2 font-bold tracking-wide ${profile.isPhonePublic || isOwner || isFriend ? "text-gray-800" : "text-gray-400 italic font-medium opacity-60"}`}>
                  <Phone size={16} className="text-gray-400" />
                  {displayPhone}
                </div>
              )}
              {displayEmail && (
                <div className={`flex items-center justify-start md:justify-end gap-2 font-medium ${profile.isEmailVisible || isOwner || isFriend ? "text-blue-500 cursor-pointer hover:underline" : "text-gray-400 italic opacity-60"}`}>
                  <Mail size={16} className="text-blue-400" />
                  {profile.isEmailVisible || isOwner || isFriend ? (
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

      {/* Pets Listed Section */}
      <div className="mt-8 mb-4 px-4 md:px-8">
         <h2 className="text-3xl font-bold font-handwritten text-gray-900 mb-6">
            Pets Listed {isOwner ? 'by You' : 'for Adoption'}
         </h2>
         {loadingPets ? (
            <div className="text-gray-500 font-medium">Loading pets...</div>
         ) : userPets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {userPets.map(pet => (
                  <PetCard 
                     key={pet._id} 
                     pet={pet}
                     hideContact={true}

                     onDelete={user && isOwner ? (p) => {
                        setPetToDelete(p);
                     } : undefined}
                  />
               ))}
            </div>
         ) : (
            <div className="bg-white rounded-[24px] border border-gray-100 p-10 text-center text-gray-400 font-medium shadow-sm">
               No pets listed for adoption yet.
            </div>
         )}
      </div>

      {/* Lost Pets Section */}
      <div className="mt-8 mb-4 px-4 md:px-8">
         <h2 className="text-3xl font-bold font-handwritten text-gray-900 mb-6">
            Lost Pets {isOwner ? 'Reported by You' : ''}
         </h2>
         {loadingLostPets ? (
            <div className="text-gray-500 font-medium">Loading lost pets...</div>
         ) : userLostPets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {userLostPets.map(pet => (
                  <PetCard 
                     key={pet._id} 
                     pet={pet}
                     hideContact={true}
                     onDelete={user && isOwner ? (p) => {
                        setLostPetToDelete(p);
                     } : undefined}
                  />
               ))}
            </div>
         ) : (
            <div className="bg-white rounded-[24px] border border-gray-100 p-10 text-center text-gray-400 font-medium shadow-sm">
               No lost pets reported.
            </div>
         )}
      </div>

      {/* Events Hosted Section */}
      <div className="mt-8 mb-4 px-4 md:px-8">
         <h2 className="text-3xl font-bold font-handwritten text-gray-900 mb-6">
            Events Hosted by {isOwner ? 'You' : (profile.name || 'User')}
         </h2>
         {loadingEvents ? (
            <div className="text-gray-500 font-medium">Loading events...</div>
         ) : userEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {userEvents.map(event => (
                  <div 
                     key={event._id}
                     onClick={() => window.open(event.url, '_blank')}
                     className="bg-white rounded-[24px] overflow-hidden shadow-soft border border-black/5 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                  >
                     <div className="h-48 w-full relative overflow-hidden">
                        <img 
                           src={event.image} 
                           alt={event.title} 
                           className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-pastel-pink shadow-sm">
                           Upcoming
                        </div>
                     </div>
                     <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{event.title}</h3>
                        <div className="space-y-1.5">
                           <p className="text-sm font-bold text-gray-500 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                              {event.venue}
                           </p>
                           <p className="text-sm font-medium text-gray-400 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
                              {new Date(event.date).toLocaleDateString('en-IN', { 
                                 weekday: 'short', month: 'long', day: 'numeric', 
                                 hour: '2-digit', minute:'2-digit' 
                              })}
                           </p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <div className="bg-white rounded-[24px] border border-gray-100 p-10 text-center text-gray-400 font-medium shadow-sm">
               This user hasn’t hosted any events yet.
            </div>
         )}
      </div>

      <ContactModal 
         pet={selectedPetForContact} 
         onClose={() => setSelectedPetForContact(null)} 
      />

      {petToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-xl w-full max-w-sm overflow-hidden transform transition-all p-8 text-center animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold font-handwritten text-gray-900 mb-2">Delete Pet</h3>
            <p className="text-gray-600 mb-8 mt-2">Are you sure you want to delete this pet?</p>
            <div className="flex gap-4 justify-center w-full">
              <button
                onClick={() => setPetToDelete(null)}
                className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 flex-1 transition-colors"
              >
                No
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`${API_BASE}/api/adoption/${petToDelete._id}`, {
                       method: 'DELETE',
                       credentials: 'include'
                    });
                    if (res.ok) {
                       fetchPetsList(profileData.profile._id);
                       setPetToDelete(null);
                    } else {
                       alert("Failed to delete pet");
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="px-6 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 flex-1 transition-colors shadow-sm"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {lostPetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-xl w-full max-w-sm overflow-hidden transform transition-all p-8 text-center animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold font-handwritten text-gray-900 mb-2">Delete Lost Pet</h3>
            <p className="text-gray-600 mb-8 mt-2">Are you sure you want to delete this lost pet report?</p>
            <div className="flex gap-4 justify-center w-full">
              <button
                onClick={() => setLostPetToDelete(null)}
                className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 flex-1 transition-colors"
              >
                No
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`${API_BASE}/api/lost/${lostPetToDelete._id}`, {
                       method: 'DELETE',
                       credentials: 'include'
                    });
                    if (res.ok) {
                       fetchLostPetsList(profileData.profile._id);
                       setLostPetToDelete(null);
                    } else {
                       alert("Failed to delete lost pet report");
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="px-6 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 flex-1 transition-colors shadow-sm"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {user && isOwner && (
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
