import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { articles } from './data';
import { Search, Heart, Share2, MessageCircle, Send, User as UserIcon } from 'lucide-react';
import { educationApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// Scroll Reveal Wrapper
export const ScrollReveal = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

// Tilted Card Component
const ArticleCard = ({ article, interactions, onInteraction }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const stats = interactions || { likes: 0, comments: [] };

  const isLiked = user?.id && stats.likedBy?.includes(user.id);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user?.id) return; // Optional: Only allow likes if logged in

    // Optimistic Update
    const previousStats = { ...stats };
    const newLikedBy = isLiked 
      ? stats.likedBy.filter(id => id !== user.id)
      : [...(stats.likedBy || []), user.id];
    
    const newStats = { 
      ...stats, 
      likes: isLiked ? Math.max(0, stats.likes - 1) : stats.likes + 1,
      likedBy: newLikedBy
    };
    
    // Update parent state immediately
    onInteraction(article.id, newStats);

    try {
      await educationApi.likeArticle(article.id, user.id);
    } catch (error) {
      console.error('Error liking article:', error);
      // Rollback on error
      onInteraction(article.id, previousStats);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const url = window.location.origin + article.articleUrl;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!commentText.trim()) return;

    const newComment = {
      handle: user?.username ? `@${user.username}` : '@guest',
      displayName: user?.name || 'Guest User',
      text: commentText,
      id: Date.now()
    };

    // Optimistic Update
    const previousStats = { ...stats };
    const newStats = { 
      ...stats, 
      comments: [...stats.comments, newComment] 
    };

    // Update parent state immediately
    onInteraction(article.id, newStats);
    setCommentText('');

    try {
      await educationApi.addComment(article.id, newComment);
    } catch (error) {
      console.error('Error adding comment:', error);
      // Rollback on error
      onInteraction(article.id, previousStats);
      setCommentText(newComment.text); // Restore text
    }
  };

  return (
    <Tilt
      tiltMaxAngleX={10}
      tiltMaxAngleY={10}
      scale={1.02}
      transitionSpeed={400}
      glareEnable={true}
      glareMaxOpacity={0.2}
      className="cursor-pointer h-full"
    >
      <motion.div
        whileHover={{ y: -5 }}
        onClick={() => navigate(`/education/${article.id}`)}
        className="bg-white rounded-[1.5rem] overflow-hidden shadow-soft hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-pink-50"
      >
        <div className="relative h-48 md:h-56 overflow-hidden">
          <img 
            src={article.image} 
            alt={article.title} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          
          {/* Quick Stats Overlay */}
          <div className="absolute top-4 right-4 flex gap-2">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5 text-pastel-pink text-xs font-bold shadow-sm">
              <Heart size={14} className={isLiked ? "fill-pastel-pink text-pastel-pink" : ""} />
              {stats.likes}
            </div>
          </div>
        </div>
        
        <div className="p-6 flex-1 flex flex-col relative z-10 bg-white">
          <h3 className="text-xl font-bold text-gray-800 line-clamp-2 leading-snug mb-1">{article.title}</h3>
          <p className="text-xs text-pastel-pink font-semibold">— {article.author}</p>
          <p className="text-gray-600 mt-3 line-clamp-2 leading-relaxed text-sm">{article.excerpt}</p>
          
          {/* Latest Comments Preview (2-3) */}
          {stats.comments.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-gray-50 pt-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Recent Comments</p>
              {stats.comments.slice(-2).reverse().map((comment) => (
                <div key={comment.id || comment._id} className="flex gap-2 items-start py-1">
                  <div className="w-5 h-5 rounded-full bg-pastel-blue/20 flex items-center justify-center shrink-0">
                    <UserIcon size={10} className="text-pastel-blue" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] text-gray-700 leading-tight">
                      <span className="font-bold text-gray-900">{comment.displayName}</span>: {comment.text}
                    </p>
                  </div>
                </div>
              ))}
              {stats.comments.length > 2 && (
                <p className="text-[10px] text-pastel-pink font-medium mt-1">
                  + {stats.comments.length - 2} more comments
                </p>
              )}
            </div>
          )}

          {/* Interaction Bar */}
          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleLike}
                className="flex items-center gap-1 text-gray-400 hover:text-pastel-pink transition-colors"
                title={isLiked ? "Unlike" : "Like"}
              >
                <Heart size={18} className={isLiked ? "fill-pastel-pink text-pastel-pink" : ""} />
                <span className="text-xs font-bold">{stats.likes}</span>
              </button>
              
              <div className="flex items-center gap-1 text-gray-400">
                <MessageCircle size={18} />
                <span className="text-xs font-bold">{stats.comments.length}</span>
              </div>
            </div>

            <button 
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-blue-50 text-gray-400 hover:text-pastel-blue transition-all relative"
              title="Copy Link"
            >
              <Share2 size={18} />
              {copySuccess && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
                  Copied!
                </span>
              )}
            </button>
          </div>

          {/* Comment Form (Visible on Card) */}
          <form 
            onSubmit={handleCommentSubmit}
            className="mt-4 flex gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <input 
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-transparent border-none text-xs focus:ring-0 placeholder-gray-400 p-1"
            />
            <button 
              type="submit"
              disabled={!commentText.trim()}
              className="p-1.5 bg-pastel-pink text-white rounded-lg hover:bg-pink-400 transition-colors disabled:opacity-30"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </motion.div>
    </Tilt>
  );
};

const EducationHome = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [filteredArticles, setFilteredArticles] = useState(articles);
  const [allInteractions, setAllInteractions] = useState({});

  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const data = await educationApi.getInteractions();
        const interactionMap = {};
        data.forEach(item => {
          interactionMap[item.articleId] = item;
        });
        setAllInteractions(interactionMap);
      } catch (error) {
        console.error('Error fetching interactions:', error);
      }
    };
    fetchInteractions();
  }, [refresh]);

  useEffect(() => {
    const filtered = articles.filter(a =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredArticles(filtered);
  }, [searchTerm]);

  const handleInteraction = (articleId, newStats) => {
    if (articleId && newStats) {
      setAllInteractions(prev => ({
        ...prev,
        [articleId]: newStats
      }));
    } else {
      setRefresh(prev => !prev);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#fdf2f8] font-sans pt-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <ScrollReveal>
          <div className="text-center mb-16 mt-8 relative">
            <h1 className="text-5xl md:text-6xl font-extrabold text-foreground mb-4">
              Learn to be the <span className="text-pastel-pink font-handwritten tracking-wide">best pet parent</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
              Expert advice, essential guides, and helpful tips to help you and your pet thrive together.
            </p>

            <div className="mt-12 max-w-lg mx-auto relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400 group-focus-within:text-pastel-pink transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-full border-2 border-white shadow-soft focus:outline-none focus:border-pastel-pink focus:ring-4 focus:ring-pastel-pink/20 bg-white text-lg transition-all"
              />
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredArticles.map((article, i) => (
            <motion.div 
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="h-full"
            >
              <ArticleCard 
                article={article} 
                interactions={allInteractions[article.id]}
                onInteraction={handleInteraction} 
              />
            </motion.div>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center text-gray-500 mt-20 text-lg"
          >
            No articles found matching your search. Try different keywords!
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EducationHome;
