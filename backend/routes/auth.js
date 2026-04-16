const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const REDIRECT_URI = `${BACKEND_URL}/api/auth/google/callback`;

// ─── Helper: find or create user from Google profile ──────────────────────────
async function findOrCreateUser(payload) {
  const mongoose = require('mongoose');
  const adminEmails = ['mitalipaullol268@gmail.com', 'siddhipatel0707@gmail.com'];
  const isAdmin = adminEmails.includes(payload.email);

  if (mongoose.connection.readyState !== 1) {
    // DB offline – return a minimal guest payload
    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      tags: [],
      isAdmin,
    };
  }

  let user = await User.findOne({ email: payload.email });

  if (!user) {
    const baseUsername = payload.name.replace(/\s+/g, '-').toLowerCase();
    let username = baseUsername;
    let suffix = 1;
    while (await User.findOne({ username })) {
      username = `${baseUsername}${suffix}`;
      suffix++;
    }

    const initialTags = [{ name: 'Community Member', color: '#B5D2CB' }];
    if (isAdmin) initialTags.push({ name: 'Admin', color: '#DBB3B1' });

    user = new User({
      username,
      name: payload.name,
      email: payload.email,
      googleName: payload.name,
      googlePhoto: payload.picture || '',
      tags: initialTags,
      role: isAdmin ? 'admin' : 'user',
    });
    await user.save();
  } else {
    let shouldSave = false;
    if (user.googleName !== payload.name) { user.googleName = payload.name; shouldSave = true; }
    if (user.googlePhoto !== (payload.picture || '')) { user.googlePhoto = payload.picture || ''; shouldSave = true; }
    if (isAdmin && (!user.tags.some(t => t.name === 'Admin') || user.role !== 'admin')) {
      if (!user.tags.some(t => t.name === 'Admin')) user.tags.push({ name: 'Admin', color: '#DBB3B1' });
      user.role = 'admin';
      shouldSave = true;
    }
    if (shouldSave) await user.save();
  }

  return user;
}

// ─── Route 1: Generate Google OAuth URL ───────────────────────────────────────
// GET /api/auth/google/url
// Returns the Google consent-screen URL so the frontend can redirect the user.
router.get('/google/url', (req, res) => {
  const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

  const url = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'openid',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  });

  res.json({ url });
});

// ─── Route 2: OAuth Callback (Authorization Code → JWT Cookie) ────────────────
// GET /api/auth/google/callback
// Google redirects here after the user consents. We exchange the code for tokens,
// verify the ID token, find/create the user, mint a JWT, set it as a cookie, and
// redirect the user back to the frontend /dashboard.
router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    console.error('OAuth callback error:', error);
    return res.redirect(`${FRONTEND_URL}/?login_error=cancelled`);
  }

  try {
    const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

    // Exchange authorization code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Verify the ID token to get the user's profile
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // Find or create the user in MongoDB
    const user = await findOrCreateUser(payload);

    const dbTags = user.tags || [];
    const isAdmin = ['mitalipaullol268@gmail.com', 'siddhipatel0707@gmail.com'].includes(payload.email);
    if (isAdmin && !dbTags.some(t => t.name === 'Admin')) {
      dbTags.push({ name: 'Admin', color: '#DBB3B1' });
    }

    // Mint the JWT
    const token = jwt.sign(
      { id: user._id || user.id, email: user.email, name: user.name, tags: dbTags },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '7d' }
    );

    // Set it as an httpOnly cookie
    res.cookie('petconnect_auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect back to the frontend dashboard
    res.redirect(`${FRONTEND_URL}/dashboard`);
  } catch (err) {
    console.error('Error in /google/callback:', err);
    res.redirect(`${FRONTEND_URL}/?login_error=failed`);
  }
});

// ─── Route 3: Legacy – POST /google (kept for backwards compat) ───────────────
// The old implicit-flow path. Still works for local dev if needed.
router.post('/google', async (req, res) => {
  const { credential, userInfo } = req.body;
  let payload;

  try {
    if (userInfo) {
      payload = {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        sub: userInfo.sub || 'mock-id-' + Date.now(),
      };
    } else if (credential) {
      const client = new OAuth2Client(CLIENT_ID);
      const ticket = await client.verifyIdToken({ idToken: credential, audience: CLIENT_ID });
      payload = ticket.getPayload();
    } else {
      return res.status(400).json({ message: 'No auth data provided' });
    }

    const user = await findOrCreateUser(payload);
    const dbTags = user.tags || [];

    const token = jwt.sign(
      { id: user._id || user.id, email: user.email, name: user.name, tags: dbTags },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '7d' }
    );

    res.cookie('petconnect_auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error validating Google token', error);
    res.status(401).json({ message: 'Invalid tokens' });
  }
});

// ─── Route 4: Logout ──────────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie('petconnect_auth');
  res.json({ message: 'Logged out' });
});

module.exports = router;
