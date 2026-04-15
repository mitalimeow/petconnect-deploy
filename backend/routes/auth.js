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
          name: payload['name'], // Initial default from Google
          email: payload['email'],
          googleName: payload['name'],
          googlePhoto: payload['picture'] || '',
          // profilePhoto defaults to grey humanoid via schema
          tags: initialTags,
          role: isAdmin ? 'admin' : 'user'
        });
        await user.save();
      } else {
        // Existing user - update Google-synced fields only
        let shouldSave = false;
        if (user.googleName !== payload['name']) {
           user.googleName = payload['name'];
           shouldSave = true;
        }
        if (user.googlePhoto !== (payload['picture'] || '')) {
           user.googlePhoto = payload['picture'] || '';
           shouldSave = true;
        }
        if (isAdmin && (!user.tags.some(t => t.name === 'Admin') || user.role !== 'admin')) {
           if (!user.tags.some(t => t.name === 'Admin')) user.tags.push({ name: 'Admin', color: '#DBB3B1' });
           user.role = 'admin';
           shouldSave = true;
        }
        if (shouldSave) await user.save();
      }

      userId = user._id;
      dbUsername = user.username;
      dbTags = user.tags;
      dbName = user.name;
      dbAvatar = user.profilePhoto; // This is the PetConnect profile photo (or default)
      dbGooglePhoto = user.googlePhoto;
    }

    if (isAdmin && !dbTags.some(t => t.name === 'Admin')) {
      dbTags.push({ name: 'Admin', color: '#DBB3B1' });
    }

    // 5. Build JWT and Login Response
    const token = jwt.sign({ id: userId, email: dbEmail, name: dbName, tags: dbTags }, process.env.JWT_SECRET || 'secret-key', { expiresIn: '7d' });

    res.cookie('petconnect_auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ message: "Login successful" });
  } catch (error) {
    console.error('Error validating Google token', error);
    res.status(401).json({ message: 'Invalid tokens' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('petconnect_auth');
  res.json({ message: 'Logged out' });
});

module.exports = router;
