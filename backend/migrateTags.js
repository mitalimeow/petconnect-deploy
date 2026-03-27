const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/petconnect');
    console.log('Connected to DB. Migrating tags...');
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    
    let count = 0;
    for (let user of users) {
      if (user.tags && Array.isArray(user.tags)) {
        let modified = false;
        const newTags = user.tags.map(t => {
          if (typeof t === 'string') {
            modified = true;
            return { name: t, color: t === 'Admin' ? '#DBB3B1' : '#B5D2CB' };
          }
          return t;
        });
        
        if (modified) {
          await db.collection('users').updateOne({ _id: user._id }, { $set: { tags: newTags } });
          count++;
        }
      }
    }
    console.log(`Successfully migrated ${count} users.`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
