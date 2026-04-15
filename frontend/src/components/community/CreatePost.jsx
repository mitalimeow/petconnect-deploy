import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ImagePlus, Send, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

const CLOUDINARY_URL = "YOUR_CLOUDINARY_URL_HERE";
const UPLOAD_PRESET = "YOUR_UPLOAD_PRESET_HERE";

export default function CreatePost({ onPostCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    try {
      const res = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      console.error('Image upload failed', err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    setIsLoading(true);
    let imageUrl = '';

    if (image) {
      if (CLOUDINARY_URL === "YOUR_CLOUDINARY_URL_HERE") {
        imageUrl = imagePreview; 
      } else {
        imageUrl = await uploadImageToCloudinary(image);
      }
    }

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ content, imageUrl })
      });
      
      const data = await res.json();
      if (res.ok) {
        onPostCreated(data);
        setContent('');
        setImage(null);
        setImagePreview(null);
      }
    } catch (err) {
      console.error('Posting failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#B5D2CB] bg-opacity-30 rounded-2xl p-5 shadow-sm backdrop-blur-md mb-6 transition-all duration-300 border border-white/20">
      <div className="flex gap-4">
        <img 
          src={user?.profilePhoto || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=DBB3B1&color=fff`} 
          alt="Profile" 
          className="w-12 h-12 rounded-full object-cover shadow-sm bg-white"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Make a post..."
            className="w-full bg-white bg-opacity-80 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#DBB3B1] resize-none transition-shadow text-gray-800"
            rows="3"
            disabled={isLoading}
          />
          {imagePreview && (
            <div className="relative mt-2">
              <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-cover rounded-xl shadow-inner" />
              <button 
                onClick={() => { setImage(null); setImagePreview(null); }}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors"
                title="Remove image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          )}
          <div className="flex justify-between items-center mt-3">
            <label className="cursor-pointer text-gray-600 hover:text-[#DBB3B1] transition-colors p-2 rounded-full hover:bg-white/50">
              <ImagePlus size={22} />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={isLoading} />
            </label>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading || (!content.trim() && !image)}
              onClick={handleSubmit}
              className="bg-[#DBB3B1] text-white px-6 py-2 rounded-full font-semibold flex gap-2 items-center hover:bg-opacity-90 disabled:opacity-50 transition-all shadow-md active:shadow-sm"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> Post</>}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
