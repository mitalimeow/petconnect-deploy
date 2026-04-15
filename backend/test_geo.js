const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const testGeoLogic = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/petconnect');
    console.log("MongoDB Connected");

    await User.syncIndexes();
    console.log("Indexes Synced.");

    // Clear test users if any
    await User.deleteMany({ email: { $in: ['testgeo1@test.com', 'testgeo2@test.com', 'testgeo3_far@test.com'] } });

    // Target Location (Lost Pet): Mumbai CST (18.9400, 72.8353)

    // User 1: Very close (Gateway of India ~ 1.5km) -> 18.9220, 72.8347
    const user1 = new User({
      username: 'geouser1',
      name: 'Geo User 1',
      email: 'testgeo1@test.com',
      trueLocation: {
        type: 'Point',
        coordinates: [72.8347, 18.9220]
      }
    });

    // User 2: Right on top (CST) -> 18.9400, 72.8353
    const user2 = new User({
      username: 'geouser2',
      name: 'Geo User 2',
      email: 'testgeo2@test.com',
      trueLocation: {
        type: 'Point',
        coordinates: [72.8353, 18.9400]
      }
    });

    // User 3: Far away (Andheri ~ 20km) -> 19.1136, 72.8697
    const user3 = new User({
      username: 'geouser3',
      name: 'Geo User 3 far',
      email: 'testgeo3_far@test.com',
      trueLocation: {
        type: 'Point',
        coordinates: [72.8697, 19.1136]
      }
    });

    await user1.save();
    await user2.save();
    await user3.save();

    console.log("Mapped 3 test users.");

    // Simulate the $near query for a lost pet at CST
    const petLat = 18.9400;
    const petLng = 72.8353;

    const nearbyUsers = await User.find({
      trueLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [petLng, petLat]
          },
          $maxDistance: 5000 // 5km
        }
      }
    });

    console.log(`\nFound ${nearbyUsers.length} users within 5km of CST.`);
    nearbyUsers.forEach(u => console.log(`- ${u.name}`));

    if (nearbyUsers.length === 2) {
      console.log("\n✅ SUCCESS: Only User 1 and User 2 were detected. User 3 (Andheri) correctly ignored.");
    } else {
      console.log("\n❌ FAILED to isolate users properly.");
    }

  } catch (err) {
    console.error("Test Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Done.");
  }
};

testGeoLogic();
