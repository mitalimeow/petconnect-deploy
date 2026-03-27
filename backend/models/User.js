const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profilePhoto: { type: String, default: '' },
  bannerImage: { type: String, default: '' },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  tags: [{ type: String }],
  notifications: [{ type: String }],
  phone: { type: String, default: '' },
  isPhonePublic: { type: Boolean, default: false },
  isEmailVisible: { type: Boolean, default: false },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FriendRequest' }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
