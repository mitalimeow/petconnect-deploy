const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const checkRecentAlerts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/petconnect');
        console.log("MongoDB Connected");

        // Find users who have notifications of type 'LOST_PET_ALERT'
        const users = await User.find({ "notifications.type": "LOST_PET_ALERT" }).select('username name notifications');
        let found = [];

        users.forEach(u => {
            u.notifications.forEach(n => {
                if(n.type === "LOST_PET_ALERT") {
                    found.push({
                        username: u.username,
                        name: u.name,
                        date: n.createdAt
                    });
                }
            });
        });

        // Sort by most recent
        found.sort((a,b) => new Date(b.date) - new Date(a.date));

        console.log("\nUsers who received LOST_PET_ALERTS recently:");
        found.slice(0, 5).forEach(f => {
            console.log(`- ${f.name} (@${f.username}) at ${f.date}`);
        });

    } catch(err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

checkRecentAlerts();
