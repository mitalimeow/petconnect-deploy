const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

async function migrate() {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/petconnect'; 
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Connected!');

    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate.`);

    for (const user of users) {
      try {
        console.log(`Processing user: ${user.name} (${user.username})`);
        // Manually trigger EdgeGram generation just to be sure
        const tokens = new Set();
        const fieldsToTokenize = [user.name || '', user.username || ''];
        fieldsToTokenize.forEach(field => {
          const words = field.toLowerCase().split(/\s+/);
          words.forEach(word => {
            for (let i = 1; i <= word.length; i++) tokens.add(word.substring(0, i));
          });
          for (let i = 1; i <= field.length; i++) tokens.add(field.substring(0, i).toLowerCase());
        });
        user.searchTokens = Array.from(tokens);
        await user.save();
      } catch (userErr) {
        console.error(`Failed for user ${user.username}:`, userErr.message);
      }
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
