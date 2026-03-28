const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/friends', require('./routes/friendRoutes')); 
app.use('/api/notifications', require('./routes/notifications'));
// app.use('/api/events', require('./routes/events')); // Temporarily disabled - file missing from remote
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/pets', require('./routes/petRoutes'));
app.use('/api/education', require('./routes/educationRoutes'));
// app.use('/api/users', require('./routes/userRoutes')); // File deleted
// app.use('/api/posts', require('./routes/postRoutes')); // File deleted

// Root Route for API Health Check
app.get('/', (req, res) => {
  res.send('PetConnect API is running successfully! Access the web app through the Vercel frontend URL.');
});

app.get('/api/user/me', require('./middleware/auth'), async (req, res) => {
  try {
    const User = require('./models/User');
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ name: user.name });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
