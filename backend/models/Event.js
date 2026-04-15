const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: {
    type: String,
    required: true,
    validate: {
      validator: v => /^https?:\/\/.+/.test(v),
      message: "Invalid URL"
    }
  },
  date: { type: Date, required: true },
  venue: { type: String, required: true },
  image: { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
