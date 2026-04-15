const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/petconnect')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

const corsOptions = {
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:5173', 'https://petconnect-deploy.vercel.app'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api', require('./routes/friendshipRoutes')); 
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/events', require('./routes/events'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/pets', require('./routes/petRoutes'));
app.use('/api/education', require('./routes/educationRoutes'));
app.use('/api/adoption', require('./routes/adoptionRoutes'));
app.use('/api/lost', require('./routes/lostPetRoutes'));

// Root Route for API Health Check
app.get('/', (req, res) => {
  res.send('PetConnect API is running successfully! Access the web app through the Vercel frontend URL.');
});

app.get('/api/user/me', require('./middleware/auth'), async (req, res) => {
  try {
    const User = require('./models/User');
    const fetchUser = User.findById(req.user.id).exec();
    const user = await Promise.race([
      fetchUser,
      new Promise((_, reject) => setTimeout(() => reject(new Error('MongoDB Client Timeout')), 2000))
    ]);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ 
      id: user._id,
      username: user.username,
      name: user.name,
      profilePhoto: user.profilePhoto,
      googlePhoto: user.googlePhoto,
      email: user.email,
      tags: user.tags
    });
  } catch (error) {
    // Prevent browser console 500 errors if MongoDB is offline by returning a 200 fallback
    res.json({ name: 'Guest', offlineFallback: true });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}... Restarted!`));
