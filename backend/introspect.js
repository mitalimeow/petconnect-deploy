const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function introspectUser() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/petconnect';
    await mongoose.connect(uri);
    
    // Find the user (likely mitali based on paths, but we'll get the real users)
    const users = await User.find({}).lean();
    
    // Write out cleanly so it won't be mangled
    const fs = require('fs');
    fs.writeFileSync('users_dump.json', JSON.stringify(users, null, 2));
    console.log('Dumped users to users_dump.json successfully');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

introspectUser();
