const mongoose = require('mongoose');
require('dotenv').config();

async function checkCollections() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/petconnect';
    await mongoose.connect(uri);
    console.log('Connected to:', uri);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    for (const coll of collections) {
      const count = await mongoose.connection.db.collection(coll.name).countDocuments();
      console.log(`Collection ${coll.name} count: ${count}`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCollections();
