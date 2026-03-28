import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { articles } from './data';
import { ScrollReveal } from './EducationHome';
import { ArrowLeft, Heart, Share2, MessageCircle, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { educationApi } from '../../services/api';

const ArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = articles.find(a => a.id === Number(id));
  const { user } = useAuth();

  const [, setRefresh] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [stats, setStats] = useState({ likes: 0, comments: [], likedBy: [] });
  
  const isLiked = user?.id && stats.likedBy?.includes(user.id);

  const fetchInteractions = async () => {
    try {
      const data = await educationApi.getInteractions();
      const currentStats = data.find(item => item.articleId === id);
      if (currentStats) setStats(currentStats);
    } catch (error) {
      console.error('Error fetching interactions:', error);
    }
  };

  // Scroll to top and fetch interactions on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchInteractions();
  }, [id]);

  const handleLike = async () => {
    if (article && user?.id) {
      const previousStats = { ...stats };
      
      const newLikedBy = isLiked 
        ? stats.likedBy.filter(id => id !== user.id)
        : [...(stats.likedBy || []), user.id];

      const newStats = { 
        ...stats, 
        likes: isLiked ? Math.max(0, stats.likes - 1) : stats.likes + 1,
        likedBy: newLikedBy
      };

      setStats(newStats); // Optimistic Update

      try {
        await educationApi.likeArticle(id, user.id);
      } catch (error) {
        console.error('Error liking article:', error);
        setStats(previousStats); // Rollback
      }
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !article) return;

    const newComment = {
      handle: user?.username ? `@${user.username}` : '@guest',
      displayName: user?.name || 'Guest User',
      text: commentText,
      id: Date.now()
    };

    const previousStats = { ...stats };
    const newStats = { ...stats, comments: [...stats.comments, newComment] };
    
    setStats(newStats); // Optimistic Update
    setCommentText('');

    try {
      await educationApi.addComment(id, newComment);
    } catch (error) {
      console.error('Error adding comment:', error);
      setStats(previousStats); // Rollback
      setCommentText(newComment.text); // Restore text
    }
  };

  const handleShare = () => {
    if (article) {
      navigator.clipboard.writeText(window.location.origin + article.articleUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (!article) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdf2f8]">
      <h2 className="text-3xl font-bold text-gray-800">Article not found</h2>
      <button onClick={() => navigate('/education')} className="mt-4 text-pastel-pink hover:underline">
        Go back to Education Hub
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdf2f8] pb-24">
      {/* Top Banner */}
      <div className="relative h-[60vh] min-h-[500px] w-full mt-[-80px] pt-[80px]">
        <img 
          src={article.image} 
          alt={article.title} 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />
        
        <div className="absolute bottom-0 left-0 right-0 max-w-5xl mx-auto px-6 pb-16 text-white z-10 w-full">
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/education')}
            className="mb-8 flex items-center gap-2 text-white/90 hover:text-white hover:underline transition-all bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm w-fit"
          >
            <ArrowLeft size={18} /> Back to all articles
          </motion.button>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold leading-tight text-white drop-shadow-lg"
          >
            {article.title}
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-white/20 pt-6"
          >
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-pastel-pink flex items-center justify-center font-bold text-xl text-white shadow-soft">
                 {article.author.charAt(4)} {/* Grab First Letter of Name */}
               </div>
               <div>
                  <p className="text-xl font-bold">{article.author}</p>
                  <p className="text-white/80 text-sm font-medium mt-1 uppercase tracking-wide">Veterinary Expert</p>
               </div>
            </div>
            <div className="text-left sm:text-right mt-4 sm:mt-0 text-white/90 font-medium bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
              Published on {article.date}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-12 py-16 bg-white rounded-[2rem] -mt-10 relative z-20 shadow-2xl border border-pink-50 min-h-[50vh]">
        <ScrollReveal>
          <div 
            className="prose prose-lg md:prose-xl prose-pink max-w-none 
                       prose-headings:font-bold prose-headings:text-gray-800 
                       prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-pink-100
                       prose-p:text-gray-600 prose-p:leading-relaxed 
                       prose-li:text-gray-600 prose-ul:list-disc
                       auto-fmt-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Social Interaction Layer */}
          <div className="mt-16 pt-10 border-t border-gray-200">
            <div className="flex items-center gap-6 mb-12">
              <button 
                onClick={handleLike}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-pink-50 text-pastel-pink hover:bg-pink-100 transition-colors font-bold text-lg"
                title={isLiked ? "Unlike" : "Like"}
              >
                <Heart size={24} className={isLiked ? "fill-pastel-pink text-pastel-pink" : ""} />
                <span>Like {stats.likes > 0 && `(${stats.likes})`}</span>
              </button>
              
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-50 text-pastel-blue hover:bg-blue-100 transition-colors font-bold text-lg relative"
              >
                <Share2 size={24} />
                <span>Share</span>
                {copySuccess && (
                  <motion.span 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded shadow"
                  >
                    Link Copied!
                  </motion.span>
                )}
              </button>
            </div>

            {/* Comments Section */}
            <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MessageCircle size={24} className="text-pastel-pink" />
                Comments ({stats.comments.length})
              </h3>
              
              <form onSubmit={handleComment} className="mb-8 flex flex-col gap-3">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts on this article..."
                  className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pastel-pink/50 resize-y min-h-[100px] text-gray-700"
                />
                <button 
                  type="submit"
                  disabled={!commentText.trim()}
                  className="self-end px-6 py-2.5 bg-pastel-pink text-white font-bold rounded-xl hover:bg-pink-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post Comment
                </button>
              </form>

              <div className="space-y-4">
                {stats.comments.slice().reverse().map(comment => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={comment.id || comment._id} 
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-pastel-blue text-white flex items-center justify-center font-bold">
                        {comment.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{comment.displayName}</p>
                        <p className="text-sm text-gray-500">{comment.handle}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 ml-13 pl-3 border-l-2 border-pink-100">{comment.text}</p>
                  </motion.div>
                ))}
                
                {stats.comments.length === 0 && (
                  <p className="text-gray-500 text-center py-6 italic">No comments yet. Be the first to share your thoughts!</p>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default ArticlePage;
