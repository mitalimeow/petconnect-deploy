import React, { useState, useEffect } from 'react';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function PostFeed() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/posts`, {
          credentials: 'include'
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error('Failed to fetch posts', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  const handlePostCreated = (newPost) => {
    // Add new post instantly to the top (no refresh)
    setPosts([newPost, ...posts]);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-[#DBB3B1]" size={36} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto lg:mx-0 lg:flex-1">
      <CreatePost onPostCreated={handlePostCreated} />
      
      <div className="mt-8">
        {posts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 bg-white/40 rounded-[20px] p-12 font-medium shadow-sm border border-white/20"
          >
            <p className="text-lg text-gray-600 mb-2">It's quiet here...</p>
            <p className="text-sm">Be the first to share something with the community!</p>
          </motion.div>
        ) : (
          posts.map(post => (
            <PostCard key={post._id} post={post} />
          ))
        )}
      </div>
    </div>
  );
}
