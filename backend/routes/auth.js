const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  const { credential, userInfo } = req.body;
  let payload;

  try {
    if (userInfo) {
       payload = {
           email: userInfo.email,
           name: userInfo.name,
           picture: userInfo.picture,
           sub: userInfo.sub || 'mock-id-' + Date.now()
       };
    } else if (credential) {
       const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
       payload = ticket.getPayload();
    } else {
       return res.status(400).json({ message: 'No auth data provided' });
    }
    
    const mongoose = require('mongoose');
    let userId = payload['sub'];
    let dbEmail = payload['email'];
    let dbUsername = payload['name'].replace(/\s+/g, '-').toLowerCase();
    let dbTags = [];
    let dbName = payload['name'];
    let dbAvatar = payload['picture'];

    const adminEmails = ["mitalipaullol268@gmail.com", "siddhipatel0707@gmail.com"];
    const isAdmin = adminEmails.includes(payload['email']);

    if (mongoose.connection.readyState === 1) {
      // Find or create User in DB
      let user = await User.findOne({ email: payload['email'] });
      if (!user) {
        const baseUsername = payload['name'].replace(/\s+/g, '-').toLowerCase();
        let username = baseUsername;
        let suffix = 1;
        while (await User.findOne({ username })) {
          username = `${baseUsername}${suffix}`;
          suffix++;
        }
        
        let initialTags = [{ name: 'Community Member', color: '#B5D2CB' }];
        if (isAdmin) initialTags.push({ name: 'Admin', color: '#DBB3B1' });

        user = new User({
          username,
          name: payload['name'],
          email: payload['email'],
          profilePhoto: payload['picture'] || '',
          tags: initialTags,
          role: isAdmin ? 'admin' : 'user'
        });
        await user.save();
      } else if (isAdmin && (!user.tags.some(t => t.name === 'Admin') || user.role !== 'admin')) {
        if (!user.tags.some(t => t.name === 'Admin')) user.tags.push({ name: 'Admin', color: '#DBB3B1' });
        user.role = 'admin';
        await user.save();
      }
      userId = user._id;
      dbUsername = user.username;
      dbTags = user.tags;
      dbName = user.name;
      dbAvatar = user.profilePhoto || payload['picture'];
    }

    if (isAdmin && !dbTags.some(t => t.name === 'Admin')) {
      dbTags.push({ name: 'Admin', color: '#DBB3B1' });
    }

    // 5. Build JWT and Login Response
    const token = jwt.sign({ id: userId, email: dbEmail, name: dbName, tags: dbTags }, process.env.JWT_SECRET || 'secret-key', { expiresIn: '7d' });

    res.json({ 
      user: {
        id: userId,
        username: dbUsername,
        name: dbName,
        avatar: dbAvatar,
        profilePhoto: dbAvatar,
        email: payload['email'],
        tags: dbTags
      },  
      token 
    });
  } catch (error) {
    console.error('Error validating Google token', error);
    res.status(401).json({ message: 'Invalid tokens' });
  }
});

module.exports = router;
