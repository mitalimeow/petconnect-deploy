const mongoose = require('mongoose');
const Adoption = require('./backend/models/Adoption');
require('dotenv').config({ path: './backend/.env' });

async function checkDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/petconnect');
    console.log('Connected to MongoDB');
    const adoptions = await Adoption.find();
    console.log('Adoptions count:', adoptions.length);
    console.log('Adoptions:', JSON.stringify(adoptions, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDb();
