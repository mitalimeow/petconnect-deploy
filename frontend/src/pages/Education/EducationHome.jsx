import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tilt } from 'react-tilt';
import { articles } from './data';
import { Search } from 'lucide-react';

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
const ArticleCard = ({ article }) => {
  const navigate = useNavigate();

  return (
    <Tilt
      options={{ max: 15, scale: 1.05, speed: 400, glare: true, "max-glare": 0.3 }}
      className="cursor-pointer h-full"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={() => navigate(`/education/${article.id}`)}
        className="bg-white rounded-[1.5rem] overflow-hidden shadow-soft hover:shadow-2xl transition-all duration-300 h-full flex flex-col border border-pink-50"
      >
        <div className="relative h-56 md:h-64 overflow-hidden">
          <img 
            src={article.image} 
            alt={article.title} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
        
        <div className="p-8 flex-1 flex flex-col relative z-10 bg-white">
          <h3 className="text-2xl font-bold text-gray-800 line-clamp-2 leading-snug">{article.title}</h3>
          <p className="text-sm text-pastel-pink font-semibold mt-2">— {article.author}</p>
          <p className="text-gray-600 mt-4 line-clamp-3 flex-1 leading-relaxed text-md">{article.excerpt}</p>
          <div className="mt-6 flex items-center text-pastel-pink font-bold text-sm hover:text-pink-400 transition-colors">
            Read full article <span className="ml-2">→</span>
          </div>
        </div>
      </motion.div>
    </Tilt>
  );
};

const EducationHome = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredArticles, setFilteredArticles] = useState(articles);

  useEffect(() => {
    const filtered = articles.filter(a =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredArticles(filtered);
  }, [searchTerm]);

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
              <ArticleCard article={article} />
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
