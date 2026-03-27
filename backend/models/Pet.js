const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // 'Cats', 'Dogs', 'Fish', 'Birds', 'Others'
  location: { type: String, required: true }, // Indian Cities
  ageMonths: { type: Number, required: true }, // 0 to 240+ (20 years)
  color: { type: String }, // 'White', 'Black', 'Brown', 'Golden', 'Mixed', 'Others'
  ownerType: { type: String }, // 'Independent adopters', 'Shelters / NGOs', 'Professional sellers'
  shelterName: { type: String }, // Populated if ownerType is shelter
  breed: { type: String },
  imageUrl: { type: String },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Pet', PetSchema);
