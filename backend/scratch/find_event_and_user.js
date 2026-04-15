const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Event = require('../models/Event');
const User = require('../models/User');

async function updateEventOwner() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the event
    const event = await Event.findOne({ title: /Clay Modelling w. Puppies/i });
    if (!event) {
      console.log('Event not found');
      process.exit(1);
    }
    console.log('Found Event:', event.title, event._id);

    // Find the user. Assuming mitalimeow or similar.
    // I will look for all users and let the model decide or I will check the users list.
    const users = await User.find({}, 'name username email');
    console.log('Users:', users);

    // I'll wait to run this until I see the user list.
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateEventOwner();
