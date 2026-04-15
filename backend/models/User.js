const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profilePhoto: { type: String, default: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png" },
  googlePhoto: { type: String, default: '' },
  googleName: { type: String, default: '' },
  bannerImage: { type: String, default: '' },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  trueLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: { type: [Number], default: undefined } // [longitude, latitude]
  },
  tags: [{ 
    name: { type: String }, 
    color: { type: String } 
  }],
  notifications: [
    {
      type: {
        type: String,
        enum: ['LOST_PET_ALERT', 'FRIEND_REQUEST', 'APPLICATION_UPDATE'],
      },
      message: String,
      petId: { type: mongoose.Schema.Types.ObjectId, ref: 'LostPet' },
      image: String,
      isRead: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  phone: { type: String, default: '' },
  isPhonePublic: { type: Boolean, default: true },
  isEmailVisible: { type: Boolean, default: true },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  lostPets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LostPet' }],
  role: {
    type: String,
    enum: ["user", "admin", "professional"],
    default: "user"
  },
  isVerified: { type: Boolean, default: false },
  searchTokens: [{ type: String, index: true }]
}, { timestamps: true });

// EdgeGrams Algorithm: Generate prefixes for name and username
UserSchema.pre('save', async function() {
  if (this.isModified('name') || this.isModified('username')) {
    const tokens = new Set();
    const fieldsToTokenize = [this.name || '', this.username || ''];
    
    fieldsToTokenize.forEach(field => {
      const words = field.toLowerCase().split(/\s+/);
      words.forEach(word => {
        for (let i = 1; i <= word.length; i++) {
          tokens.add(word.substring(0, i));
        }
      });
      // Also tokenize the full field if it has spaces
      for (let i = 1; i <= field.length; i++) {
        tokens.add(field.substring(0, i).toLowerCase());
      }
    });
    
    this.searchTokens = Array.from(tokens);
  }
});

UserSchema.index({ trueLocation: '2dsphere' });

module.exports = mongoose.model('User', UserSchema);
