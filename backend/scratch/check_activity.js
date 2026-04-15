const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Event = require('../models/Event');
const User = require('../models/User');
const Adoption = require('../models/Adoption');

async function checkActivity() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adoptions = await Adoption.find({}, 'createdBy animalType');
    console.log('Adoptions createdBy:', adoptions);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkActivity();
