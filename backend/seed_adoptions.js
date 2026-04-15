const mongoose = require('mongoose');
const Adoption = require('./models/Adoption');
require('dotenv').config();

const mockAdoptions = [
  {
    petName: "Buddy",
    animalType: "Dogs",
    location: "Mumbai",
    age: 4, // 1-2 years
    color: "Golden",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80",
    contactPhone: "9876543210",
    ownerId: "65f1a2b3c4d5e6f7a8b9c0d1" // Mock ID
  },
  {
    petName: "Luna",
    animalType: "Cats",
    location: "Delhi",
    age: 2, // 4-7 months
    color: "Black",
    image: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=500&q=80",
    contactPhone: "9876543211",
    ownerId: "65f1a2b3c4d5e6f7a8b9c0d2" // Mock ID
  },
  {
    petName: "Charlie",
    animalType: "Dogs",
    location: "Bangalore",
    age: 6, // 6-10 years
    color: "Brown",
    image: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=500&q=80",
    contactPhone: "9876543212",
    ownerId: "65f1a2b3c4d5e6f7a8b9c0d3" // Mock ID
  }
];

async function seedAdoptions() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/petconnect';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    // Clear existing adoptions first
    await Adoption.deleteMany({});
    console.log('Cleared existing adoptions');

    await Adoption.insertMany(mockAdoptions);
    console.log('Successfully seeded 3 adoptions');
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedAdoptions();
