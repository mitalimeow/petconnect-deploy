const Adoption = require('../models/Adoption');
const User = require('../models/User');

exports.getAdoptions = async (req, res) => {
  try {
    const { search, type, location, age, color } = req.query;
    console.log("Adoption search params:", { search, type, location, age, color });
    
    let query = {};

    // 1. Unified Search (petName, location, animalType)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { petName: searchRegex },
        { location: searchRegex },
        { animalType: searchRegex }
      ];
    }

    // 2. Animal Type (multi-select mapping 'type' to 'animalType')
    if (type) {
      const types = type.split(',');
      query.animalType = { $in: types };
    }

    // 3. Location (exact city match)
    if (location) {
      query.location = location;
    }

    // 4. Age (max age in months)
    if (age && age !== 'null' && age !== '999') {
      const maxAgeMonths = parseInt(age);
      // Logic: pet.age is the birth month count. If slider is 12, find pets <= 12 months.
      query.age = { $lte: maxAgeMonths };
    }

    // 5. Color (multi-select)
    if (color) {
      const colors = color.split(',');
      query.color = { $in: colors };
    }

    console.log("Final Mongo Query:", JSON.stringify(query));
    let adoptions = await Adoption.find(query).sort({ createdAt: -1 }).lean();
    
    // Robust manual population to bypass schema ref issues
    for (let pet of adoptions) {
      if (pet.ownerId) {
        const userObj = await User.findById(pet.ownerId)
          .select('name username profilePhoto tags role googlePhoto')
          .lean();
        if (userObj) {
          pet.ownerId = userObj;
        }
      }
    }

    res.json(adoptions);
  } catch (err) {
    console.error("Error in getAdoptions:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createAdoption = async (req, res) => {
  try {
    console.log("Creating adoption with payload:", JSON.stringify(req.body, (key, val) => key === 'image' ? (val.length > 50 ? '[Base64 Image]' : val) : val, 2));
    
    const { petName, animalType, location, age, color, image, contactPhone } = req.body;
    
    if (!req.user || !req.user.id) {
      console.warn("Unauthorized attempt to create adoption");
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Create new adoption record tied to the current user
    const newAdoption = new Adoption({
      petName,
      animalType,
      location,
      age,
      color,
      image,
      contactPhone,
      ownerId: req.user.id
    });

    const savedAdoption = await newAdoption.save();
    console.log("Successfully saved adoption:", savedAdoption._id);
    res.json(savedAdoption);
  } catch (err) {
    console.error("Error in createAdoption:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAdoptionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    let adoptions = await Adoption.find({ ownerId: userId }).sort({ createdAt: -1 }).lean();
    
    for (let pet of adoptions) {
      if (pet.ownerId) {
        const userObj = await User.findById(pet.ownerId).select('name username profilePhoto tags role googlePhoto').lean();
        if (userObj) {
          pet.ownerId = userObj;
        }
      }
    }
    
    res.json(adoptions);
  } catch (err) {
    console.error("Error in getAdoptionsByUser:", err);
    res.status(500).json({ message: 'Server error', detail: err.message, stack: err.stack });
  }
};

exports.getAdoptionById = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id)
      .populate('ownerId', 'name username profilePhoto tags role googlePhoto');
    if (!adoption) return res.status(404).json({ message: 'Pet not found' });
    res.json(adoption);
  } catch (err) {
    console.error("Error in getAdoptionById:", err);
    res.status(500).json({ message: 'Server error from getId', detail: err.message });
  }
};

exports.deleteAdoption = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);
    if (!adoption) return res.status(404).json({ message: 'Pet not found' });
    
    if (adoption.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this pet' });
    }

    await Adoption.findByIdAndDelete(req.params.id);
    res.json({ message: 'Pet listing deleted' });
  } catch (err) {
    console.error("Error in deleteAdoption:", err);
    res.status(500).json({ message: 'Server error' });
  }
};
