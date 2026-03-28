const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  handle: { type: String, required: true },
  displayName: { type: String, required: true },
  text: { type: String, required: true },
  id: { type: Number, default: Date.now }
}, { timestamps: true });

const EducationInteractionSchema = new mongoose.Schema({
  articleId: { type: String, required: true, unique: true },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Optional: to prevent multiple likes from same user
  comments: [CommentSchema]
}, { timestamps: true });

module.exports = mongoose.model('EducationInteraction', EducationInteractionSchema);
