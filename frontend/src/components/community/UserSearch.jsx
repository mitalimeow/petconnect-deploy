import React from 'react';
import { Search } from 'lucide-react';

const UserSearch = () => {
  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
      <Search className="text-gray-300 w-12 h-12 mb-4" />
      <h3 className="text-xl font-bold font-handwritten text-gray-800">Community User Search</h3>
      <p className="text-sm text-gray-500 mt-2 text-center max-w-sm">
        Easily find other pet lovers to connect with in your community. Coming soon!
      </p>
    </div>
  );
};

export default UserSearch;
