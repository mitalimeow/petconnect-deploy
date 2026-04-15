const mongoose = require('mongoose');

const clearInteractions = async () => {
    try {
        await mongoose.connect('mongodb+srv://petconnect:mitalimeow@petconnect.hibs7vj.mongodb.net/?appName=petconnect');
        console.log('Connected to MongoDB');
        const EducationInteraction = require('./models/EducationInteraction');
        const result = await EducationInteraction.deleteMany({});
        console.log(`Deleted ${result.deletedCount} interactions.`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

clearInteractions();
