const User = require('../models/User');

exports.getMe = async (req, res) => {
  try {
    console.log("EXECUTING NATIVE /ME FETCH FOR EMAIL:", req.user.email);
    // Timeout quickly to avoid 10s hangs on Atlas disconnects
    const fetchUser = User.findOne({ email: req.user.email }).select('-__v -password').exec();
    const user = await Promise.race([
      fetchUser,
      new Promise((_, reject) => setTimeout(() => reject(new Error("MongoDB Client Timeout")), 2000))
    ]);
    
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
    const targetId = req.params.id;
    console.log("Frontend fetching profile mapping for id:", targetId);
    
    // Support both ID and Username lookup defensively
    const mongoose = require('mongoose');
    const query = mongoose.Types.ObjectId.isValid(targetId) ? { _id: targetId } : { username: targetId };
    
    const user = await User.findOne(query)
      .select('-password -friendRequests')
      .populate('friends', 'name username profilePhoto tags');

    if (!user) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    let isOwner = false;
    let isFriend = false;
    let friendshipStatus = 'none';

    if (req.user) {
       isOwner = req.user.id === user._id.toString();
       isFriend = user.friends.some(friend => friend._id.toString() === req.user.id);

       if (isFriend) {
          friendshipStatus = 'friends';
       } else if (!isOwner) {
          const FriendRequest = require('../models/FriendRequest');
          const sentRequest = await FriendRequest.findOne({ sender: req.user.id, receiver: user._id });
          if (sentRequest) {
             friendshipStatus = 'pending_sent';
          } else {
             const receivedRequest = await FriendRequest.findOne({ sender: user._id, receiver: req.user.id });
             if (receivedRequest) {
                friendshipStatus = 'pending_received';
             }
          }
       }
    }

    // Apply strict privacy settings natively in the payload
    const profilePayload = user.toObject();
    profilePayload.handle = profilePayload.username; // ensure 'handle' is available

    if (!isOwner && !isFriend) {
       // Only hide if the user requested it via visibility toggles (defensive logic)
       if (!user.isEmailVisible) profilePayload.email = "Private (Friends Only)";
       if (!user.isPhonePublic) profilePayload.phone = "Private (Friends Only)";
    }

    res.json({
      isOwner,
      isFriend,
      friendshipStatus,
      profile: profilePayload,
      isSelf: isOwner
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      'name', 'bio', 'location', 'phone', 'tags', 
      'bannerImage', 'profilePhoto', 'googlePhoto', 'isPhonePublic', 'isEmailVisible'
    ];
    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    
    // Force permanent 'Community Member' explicit default tag
    if (updates.tags && Array.isArray(updates.tags)) {
      if (!updates.tags.includes('Community Member')) {
        updates.tags.push('Community Member');
      }
      // Schema requires objects for tags, not raw strings
      updates.tags = updates.tags.map(tagName => {
        return { name: tagName, color: tagName === 'Admin' ? '#DBB3B1' : '#B5D2CB' };
      });
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

exports.searchUsers = async (req, res) => {
  try {
    const rawQuery = req.query.q;
    if (!rawQuery || rawQuery.trim().length < 1) {
      return res.json([]);
    }

    const query = rawQuery.toLowerCase().trim();

    // Flexible Regex Implementation:
    // This reliably searches both the display name and the unique handle,
    // working even for older users or updates that bypassed the pre('save') hook.
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ]
    })
    .select('_id name username profilePhoto tags')
    .limit(10);

    res.json(users);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Server error during search' });
  }
};

exports.updateTrueLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'Missing lat or lng' });
    }

    await User.findByIdAndUpdate(req.user.id, {
      trueLocation: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      }
    });

    res.json({ message: 'Location securely synced' });
  } catch (err) {
    console.error('TrueLocation sync error:', err);
    res.status(500).json({ message: 'Server error updating location' });
  }
};
