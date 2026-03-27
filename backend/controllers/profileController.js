const User = require('../models/User');

exports.getMe = async (req, res) => {
  try {
    console.log("EXECUTING NATIVE /ME FETCH FOR EMAIL:", req.user.email);
    // Timeout quickly to avoid 10s hangs on Atlas disconnects
    const user = await User.findOne({ email: req.user.email }).maxTimeMS(3000).select('-__v');
    if (!user) {
      console.log('User not found in DB. Mocking fallback.');
      throw new Error("User not found");
    }
    res.json({
        profile: user.toObject(),
        isOwner: true,
        isFriend: false,
        isSelf: true
    });
  } catch (err) {
    console.error("GETME FETCH FAILED, SENDING OFFLINE FLAG:", err.message);
    res.json({ offlineFallback: true });
  }
};

exports.getProfileById = async (req, res) => {
  try {
    console.log("Frontend fetching profile mapping for ID:", req.params.id);
    const user = await User.findById(req.params.id).select('-__v');
      
    if (!user) {
      console.log("User not found in DB returning 404!");
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log("Frontend Profile Fetched. Name returned:", user.name);

    const isOwner = req.user && req.user.id === user._id.toString();
    const isFriend = req.user && user.friends.includes(req.user.id);
    const isProfessional = user.role === 'professional';

    const profile = user.toObject();
    
    // Privacy logic overrides
    if (!isOwner && !isFriend && !isProfessional) {
      profile.phone = 'Private (Contacts Only)';
      profile.email = 'Private (Contacts Only)';
    }

    res.json({ profile, isOwner, isFriend, isSelf: isOwner });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      'name', 'bio', 'location', 'phone', 'tags', 
      'bannerImage', 'profilePhoto', 'isPhonePublic', 'isEmailVisible'
    ];
    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    
    // Convert string tags to standard DB Object formatting to prevent CastErrors
    if (updates.tags && Array.isArray(updates.tags)) {
      if (!updates.tags.includes('Community Member')) {
        updates.tags.push('Community Member');
      }
      updates.tags = updates.tags.map(t => ({
         name: typeof t === 'string' ? t : t.name,
         color: (typeof t === 'string' ? (t === 'Admin' ? '#DBB3B1' : '#B5D2CB') : t.color)
      }));
    }
    
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      console.log("Applying updates to DB EMAIL:", req.user.email);
      
      try {
        const user = await User.findOneAndUpdate({ email: req.user.email }, updates, { new: true, maxTimeMS: 3000 }).select('-__v');
        if (!user) throw new Error("Not found");
        console.log("SUCCESSFULLY UPDATED DB! User's new name is:", user.name);
        res.json(user);
      } catch (dbErr) {
        console.log('MongoDB Timeout/Error during update. Mocking success for UI sync. Error:', dbErr.message);
        res.json(updates); // Return mockup so local cache reflects the changes
      }
    } else {
      console.log('MongoDB Offline. Mocking profile update.');
      res.json(updates);
    }
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
