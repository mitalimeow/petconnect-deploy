const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Adoption = require('../models/Adoption');

async function checkOwnerIds() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adoptions = await Adoption.find({}, 'ownerId petName');
    console.log('Adoptions ownerIds:', adoptions);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkOwnerIds();
