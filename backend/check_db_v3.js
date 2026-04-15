const mongoose = require('mongoose');
const Adoption = require('./models/Adoption');
const Pet = require('./models/Pet');
require('dotenv').config();

async function checkDb() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/petconnect';
    console.log('Connecting to:', uri);
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    const adoptions = await Adoption.find();
    console.log('Adoptions count:', adoptions.length);
    if (adoptions.length > 0) console.log('First Adoption:', JSON.stringify(adoptions[0], null, 2));

    const pets = await Pet.find();
    console.log('Pets count:', pets.length);
    if (pets.length > 0) console.log('First Pet:', JSON.stringify(pets[0], null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDb();
