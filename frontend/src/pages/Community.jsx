import React from 'react';
import UserSearch from '../components/community/UserSearch';
import FriendsDropdown from '../components/community/FriendsDropdown';
import PostFeed from '../components/community/PostFeed';

export default function Community() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-[#B5D2CB]/10 to-[#DBB3B1]/10 pt-4 pb-20 relative px-4 sm:px-6 lg:px-8 font-body">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 z-40 relative py-2">
          <h1 className="text-3xl font-bold text-gray-800 hidden md:block tracking-tight">Community</h1>
          
          <div className="flex w-full sm:flex-1 items-center justify-between sm:justify-end gap-3 z-50">
            <UserSearch />
            <FriendsDropdown />
          </div>
        </div>

        {/* Main Feed Content */}
        <div className="w-full relative z-0">
          <PostFeed />
        </div>

      </div>
    </div>
  );
}
