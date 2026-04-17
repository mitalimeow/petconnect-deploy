const API_URL = `${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`}/api`;

export const educationApi = {
  getInteractions: async () => {
    const response = await fetch(`${API_URL}/education`);
    return response.json();
  },
  
  likeArticle: async (articleId, userId) => {
    const response = await fetch(`${API_URL}/education/like/${articleId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return response.json();
  },
  
  addComment: async (articleId, commentData) => {
    const response = await fetch(`${API_URL}/education/comment/${articleId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData)
    });
    return response.json();
  }
};
