const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestedTag: { type: String, required: true },
  reason: { type: String, required: true },
  documents: [{
    data: String,
    mimetype: String,
    size: Number
  }],
  urls: [{ type: String }],
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] }
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);
