const mongoose = require('mongoose');

const AdoptionSchema = new mongoose.Schema({
  petName: { type: String, required: true },
  animalType: { type: String, required: true },
  location: { type: String, required: true },
  age: { type: Number, required: true }, // Index for age range mapping
  color: { type: String, required: true },
  image: { type: String, required: true }, // Base64 string
  contactPhone: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Adoption', AdoptionSchema);
