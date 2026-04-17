import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'motion/react';
import { Heart, Share2, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PostCard({ post }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [likes, setLikes] = useState(post.likes || []);
  const [isLiked, setIsLiked] = useState(post.likes?.includes(user?.id));

  const handleLike = async () => {
    // Optimistic UI update
    setIsLiked(!isLiked);
    if (isLiked) {
      setLikes(likes.filter(id => id !== user?.id));
    } else {
      setLikes([...likes, user?.id]);
    }

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`;
      await fetch(`${API_BASE}/api/posts/${post._id}/like`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Like failed', err);
      // Revert if failed
      setIsLiked(post.likes?.includes(user?.id));
      setLikes(post.likes || []);
    }
  };

  const handleShare = () => {
    // Mock post URL share
    const url = `${window.location.origin}/community/post/${post._id}`;
    navigator.clipboard.writeText(url);
    // Simple alert instead of complex toast for brevity, though standard toast can be added
    alert("Post link copied to clipboard!");
  };

  const author = post.authorId || {};
  let timeAgo = '';
  try {
    timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }).replace('about ', '');
  } catch (e) {
    timeAgo = 'recently';
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#B5D2CB] bg-opacity-20 rounded-[20px] p-5 mb-5 shadow-sm border border-white/30 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3 items-center cursor-pointer" onClick={() => navigate(`/profile/${author.username}`)}>
          <img 
            src={author.profilePhoto || `https://ui-avatars.com/api/?name=${author.name || 'U'}&background=DBB3B1&color=fff`} 
            alt={author.name} 
            className="w-12 h-12 rounded-full object-cover shadow-sm bg-white"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-800 hover:text-[#DBB3B1] transition-colors">{author.name}</h3>
              <span className="text-gray-500 text-sm">• {timeAgo}</span>
            </div>
            {author.tags && author.tags.length > 0 && (
              <div className="flex gap-1 mt-1 flex-wrap">
                {author.tags.slice(0, 3).map((tag, i) => {
                  const tagText = typeof tag === 'string' ? tag : tag.name;
                  const tagColor = typeof tag === 'string' ? '#DBB3B1' : (tag.color || '#DBB3B1');
                  return (
                    <span 
                      key={i} 
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white shadow-sm"
                      style={{ backgroundColor: tagColor }}
                    >
                      {tagText}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1.5 hover:bg-white/40">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="mb-4">
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{post.content}</p>
        {post.imageUrl && (
          <motion.img 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
            src={post.imageUrl} 
            alt="Post attachment" 
            className="mt-3 rounded-xl w-full max-h-96 object-cover shadow-sm border border-black/5"
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex gap-6 mt-2 border-t border-black/5 pt-3">
        <motion.button 
          whileTap={{ scale: 0.8 }}
          onClick={handleLike}
          className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-[#DBB3B1]' : 'text-gray-500 hover:text-[#DBB3B1]'}`}
        >
          <motion.div animate={{ scale: isLiked ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.3 }}>
            <Heart size={20} className={isLiked ? "fill-current" : ""} />
          </motion.div>
          <span className="text-sm font-medium">{likes.length > 0 ? likes.length : 'Like'}</span>
        </motion.button>
        
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={handleShare}
          className="flex items-center gap-2 text-gray-500 hover:text-[#B5D2CB] transition-colors"
        >
          <Share2 size={20} />
          <span className="text-sm font-medium">Share</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
