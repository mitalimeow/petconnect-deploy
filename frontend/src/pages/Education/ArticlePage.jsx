import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { articles } from './data';
import { ScrollReveal } from './EducationHome';
import { ArrowLeft } from 'lucide-react';

const ArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = articles.find(a => a.id === Number(id));

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

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
        </ScrollReveal>
      </div>
    </div>
  );
};

export default ArticlePage;
