const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUsers() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/petconnect';
    await mongoose.connect(uri);
    const users = await User.find({}, 'name username email googleName profilePhoto').lean();
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

checkUsers();
