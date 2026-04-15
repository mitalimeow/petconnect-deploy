const mongoose = require('mongoose');

const lostPetSchema = new mongoose.Schema({
  petName: { type: String, required: true },
  animalType: { type: String, required: true },
  extraInfo: String,

  image: { type: String, required: true }, // Base64 Compressed

  lastSeenLocation: {
    address: String,
    lat: Number,
    lng: Number
  },

  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }

}, { timestamps: true });

module.exports = mongoose.model('LostPet', lostPetSchema);
