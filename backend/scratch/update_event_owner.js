const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Event = require('../models/Event');

async function updateEventOwner() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const eventId = '69dca367efee473560911842';
    const userId = '69c769541d69b41279812e04'; // Mitali Paul

    const result = await Event.updateOne(
      { _id: eventId },
      { $set: { createdBy: userId } }
    );

    console.log('Update result:', result);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateEventOwner();
