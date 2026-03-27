const Pet = require('../models/Pet');

// Temporary Seed logic for testing
exports.seedPets = async (req, res) => {
  try {
    const count = await Pet.countDocuments();
    if (count === 0) {
      const mockPets = [
        { name: "Max", type: "Dogs", location: "Mumbai", ageMonths: 5, color: "Golden", ownerType: "Independent adopters", breed: "Golden Retriever", imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80", shelterName: "" },
        { name: "Luna", type: "Cats", location: "Delhi", ageMonths: 12, color: "Black", ownerType: "Shelters / NGOs", breed: "Bombay Cat", imageUrl: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=500&q=80", shelterName: "Hope Shelter" },
        { name: "Charlie", type: "Dogs", location: "Bangalore", ageMonths: 24, color: "Brown", ownerType: "Professional sellers", breed: "Labrador", imageUrl: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=500&q=80", shelterName: "" },
        { name: "Bella", type: "Cats", location: "Pune", ageMonths: 2, color: "White", ownerType: "Independent adopters", breed: "Persian", imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=80", shelterName: "" },
        { name: "Nemo", type: "Fish", location: "Mumbai", ageMonths: 6, color: "Mixed", ownerType: "Professional sellers", breed: "Clownfish", imageUrl: "https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?auto=format&fit=crop&w=500&q=80", shelterName: "" }
      ];
      await Pet.insertMany(mockPets);
      return res.json({ message: "Mock pets fully seeded!" });
    }
    res.json({ message: "Database already seeded." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPets = async (req, res) => {
  try {
    const { search, type, location, age, color, ownerType } = req.query;
    
    // Build dynamic query
    let query = {};

    // 1. Search Bar (checks pet name, breed, location, and shelterName)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { breed: searchRegex },
        { location: searchRegex },
        { shelterName: searchRegex }
      ];
    }

    // 2. Animal Type (multi-select: 'Cats,Dogs')
    if (type) {
      const types = type.split(',');
      query.type = { $in: types };
    }

    // 3. Location (exact match)
    if (location) {
      query.location = location;
    }

    // 4. Age (max age in months, so find pets <= requested age)
    if (age) {
      query.ageMonths = { $lte: parseInt(age) };
    }

    // 5. Colour (multi-select: 'White,Black')
    if (color) {
      const colors = color.split(',');
      query.color = { $in: colors };
    }

    // 6. Owner Type
    if (ownerType) {
      query.ownerType = ownerType;
    }

    const pets = await Pet.find(query).sort({ createdAt: -1 });
    res.json(pets);
  } catch (err) {
    console.error("Error fetching filtered pets:", err);
    res.status(500).json({ error: "Failed to fetch pets" });
  }
};
