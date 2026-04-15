const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const checkLocations = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/petconnect');
        console.log("MongoDB Connected");

        const allUsers = await User.find({}).select('username email trueLocation');
        let countWithLoc = 0;

        allUsers.forEach(u => {
            if (u.trueLocation && u.trueLocation.coordinates && u.trueLocation.coordinates.length === 2 && u.trueLocation.coordinates[0] !== null) {
                countWithLoc++;
                console.log(`User: ${u.username} | ${u.email} -> Loc: [${u.trueLocation.coordinates}]`);
            } else {
                console.log(`User: ${u.username} | ${u.email} -> NO LOCATION STORED`);
            }
        });

        console.log(`\nTotal Users: ${allUsers.length}`);
        console.log(`Users with valid trueLocation: ${countWithLoc}`);
    } catch(err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

checkLocations();
