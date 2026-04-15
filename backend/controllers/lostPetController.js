const LostPet = require('../models/LostPet');
const User = require('../models/User');
const sharp = require('sharp');

// Haversine distance formula
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * 
    Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // inside in km
  
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  const formattedKm = Math.round(distance * 10) / 10;
  return `${formattedKm}km`;
}

// Compress Base64 if larger than 200KB (~266666 chars)
const compressImageIfNeeded = async (base64Image) => {
  if (!base64Image) return base64Image;
  
  // Basic check if it's over ~200KB
  if (base64Image.length < 266666) {
    return base64Image;
  }

  try {
    const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64Image;
    }
    
    const type = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    
    const compressedBuffer = await sharp(buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .jpeg({ quality: 70 }) // reduce quality to drop size
      .toBuffer();
    
    const sizeKb = Buffer.byteLength(compressedBuffer) / 1024;
    console.log(`Compressed image down to ${sizeKb.toFixed(2)} KB`);
    
    // Convert back to base64
    return `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
  } catch (error) {
    console.error("Error compressing image:", error);
    return base64Image; // Return original if compression fails
  }
};

exports.createLostPet = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { petName, animalType, extraInfo, image, lastSeenLocation } = req.body;

    if (!petName || !animalType || !image || !lastSeenLocation || lastSeenLocation.lat === undefined || lastSeenLocation.lng === undefined) {
      return res.status(400).json({ message: 'Missing required fields (petName, animalType, image, lastSeenLocation.lat/lng)' });
    }

    // Compress image if needed
    const processedImage = await compressImageIfNeeded(image);

    const newLostPet = new LostPet({
      petName,
      animalType,
      extraInfo,
      image: processedImage,
      lastSeenLocation,
      ownerId: req.user.id
    });

    const savedPet = await newLostPet.save();

    // Push to User's array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { lostPets: savedPet._id }
    });

    // Trigger Geo-Notification Logic
    try {
      if (lastSeenLocation && lastSeenLocation.lat && lastSeenLocation.lng) {
        const petLat = parseFloat(lastSeenLocation.lat);
        const petLng = parseFloat(lastSeenLocation.lng);

        // Find users within 5km (5000 meters) from this point skip owner
        const nearbyUsers = await User.find({
          _id: { $ne: req.user.id },
          trueLocation: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [petLng, petLat]
              },
              $maxDistance: 5000
            }
          }
        }).select('_id');

        console.log(`Geo-Notification: Triggered alerts to ${nearbyUsers.length} nearby users.`);

        if (nearbyUsers.length > 0) {
          const userIds = nearbyUsers.map(u => u._id);
          const notificationPayload = {
            type: "LOST_PET_ALERT",
            message: "Have you seen this pet?",
            petId: savedPet._id,
            image: savedPet.image,
            isRead: false,
            createdAt: new Date()
          };

          await User.updateMany(
            { _id: { $in: userIds } },
            { $push: { notifications: notificationPayload } }
          );
        }
      }
    } catch (geoError) {
      console.error("Error triggering geo-notifications:", geoError);
      // Failsafe: Don't crash pet creation if notifications fail
    }

    res.status(201).json(savedPet);
  } catch (error) {
    console.error("Error in createLostPet:", error);
    res.status(500).json({ message: 'Server error', detail: error.message });
  }
};

exports.getAllLostPets = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    const pets = await LostPet.find()
      .populate('ownerId', 'name username profilePhoto phone')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate distance if user loc is provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      pets.forEach(pet => {
        if (pet.lastSeenLocation && pet.lastSeenLocation.lat !== undefined && pet.lastSeenLocation.lng !== undefined) {
          pet.distance = getDistance(userLat, userLng, pet.lastSeenLocation.lat, pet.lastSeenLocation.lng);
        }
      });
    }

    res.json(pets);
  } catch (error) {
    console.error("Error in getAllLostPets:", error);
    res.status(500).json({ message: 'Server error', detail: error.message });
  }
};

exports.getLostPetById = async (req, res) => {
  try {
    const pet = await LostPet.findById(req.params.id)
      .populate('ownerId', 'name username profilePhoto phone');
      
    if (!pet) return res.status(404).json({ message: 'Lost pet not found' });
    
    res.json(pet);
  } catch (error) {
    console.error("Error in getLostPetById:", error);
    res.status(500).json({ message: 'Server error', detail: error.message });
  }
};

exports.getLostPetsByUser = async (req, res) => {
  try {
    const pets = await LostPet.find({ ownerId: req.params.userId })
      .populate('ownerId', 'name username profilePhoto phone')
      .sort({ createdAt: -1 })
      .lean();
      
    res.json(pets);
  } catch (error) {
    console.error("Error in getLostPetsByUser:", error);
    res.status(500).json({ message: 'Server error', detail: error.message });
  }
};

exports.deleteLostPet = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const pet = await LostPet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ message: 'Lost pet not found' });
    }

    if (pet.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this pet' });
    }

    await LostPet.findByIdAndDelete(req.params.id);

    // Remove from User's array
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { lostPets: pet._id }
    });

    res.json({ message: 'Lost pet deleted successfully' });
  } catch (error) {
    console.error("Error in deleteLostPet:", error);
    res.status(500).json({ message: 'Server error', detail: error.message });
  }
};
