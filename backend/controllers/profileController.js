const User = require('../models/User');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      location,
      tags,
      isEmailVisible,
      isPhonePublic,
      phone,
      profilePhoto,
      bannerImage
    } = req.body;

    const profileFields = {};
    if (name) profileFields.name = name;
    if (location) profileFields.location = location;
    if (isEmailVisible !== undefined) profileFields.isEmailVisible = isEmailVisible;
    if (isPhonePublic !== undefined) profileFields.isPhonePublic = isPhonePublic;
    if (phone) profileFields.phone = phone;
    if (profilePhoto) profileFields.profilePhoto = profilePhoto;
    if (bannerImage) profileFields.bannerImage = bannerImage;
    if (tags) {
      // Tags might come as strings or objects, map accordingly
      profileFields.tags = Array.isArray(tags) ? tags.map(t => typeof t === 'string' ? { name: t } : t) : [];
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfileById = async (req, res) => {
  try {
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    
    let query = {};
    if (isObjectId) {
        query._id = req.params.id;
    } else {
        query.username = req.params.id;
    }

    const user = await User.findOne(query).select('-password -friendRequests');
    if (!user) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const isOwner = req.user && req.user.id === user._id.toString();
    const isFriend = req.user && user.friends.includes(req.user.id);

    res.json({
      isOwner,
      isFriend,
      profile: user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.json([]);
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ]
    })
    .select('_id name username profilePhoto')
    .limit(10);

    res.json(users);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Server error during search' });
  }
};
