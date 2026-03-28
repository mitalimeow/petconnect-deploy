const express = require('express');
const router = express.Router();
const multer = require('multer');
const geofire = require('geofire-common');
const LostPetReport = require('../models/LostPetReport');

// Only proceed if db is configured (avoiding script crash if environment not ready)
let db;
let bucket;
try {
  const firebaseConfig = require('../config/firebase');
  db = firebaseConfig.db;
  bucket = firebaseConfig.bucket;
} catch (e) {
  console.warn("Firebase not fully configured. API routes may fail if hit.");
}

// Multer configured for memory parsing (do not store base64 in DB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Helper for formatting GeoFire queries
function distanceBetween(lat1, lon1, lat2, lon2) {
  return geofire.distanceBetween([lat1, lon1], [lat2, lon2]);
}

/**
 * Phase 1 & 2: POST /api/reports/lost
 * Uploads image to Firebase Storage, constructs the geohashed LostPetReport, and saves to Firestore.
 */
router.post('/lost', upload.single('photo'), async (req, res) => {
  try {
    if (!req.body.owner_id || !req.body.lat || !req.body.lng) {
      return res.status(400).json({ error: 'Missing core location/auth fields' });
    }

    let publicUrl = '';

    // 1. Process and stream multipart image to Cloud Storage
    if (req.file && bucket) {
      const fileName = `lost_pets/${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '')}`;
      const file = bucket.file(fileName);
      
      await file.save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype },
        resumable: false
      });
      // Generate public URL (assumes bucket is public, or use getSignedUrl for strict private)
      await file.makePublic();
      publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    }

    // 2. Map payload through precise Schema and Geohash engine
    const reportData = new LostPetReport({
      ...req.body,
      photo_url: publicUrl
    });

    const firestoreData = reportData.toFirestore();

    // 3. Save to Firestore
    if (db) {
      await db.collection('LostPets').doc(firestoreData.report_id).set(firestoreData);
    }
    
    return res.status(201).json({ message: 'Report created successfully', data: firestoreData });
    
  } catch (error) {
    console.error('Error creating lost pet report:', error);
    res.status(500).json({ error: 'Failed to process report: ' + error.message });
  }
});

/**
 * Phase 2: GET /api/reports/nearby
 * Accepts lat, lng, radiusInKm. Returns active Lost reports bounded by geohash within the exact geographic radius.
 */
router.get('/nearby', async (req, res) => {
  try {
    const defaultRadius = 20; // Increased to 20km
    const { lat, lng, radiusInKm } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng parameters are required' });
    }

    const center = [parseFloat(lat), parseFloat(lng)];
    const radiusInM = (parseFloat(radiusInKm) || defaultRadius) * 1000;

    // Calculate Geohash boundaries
    const bounds = geofire.geohashQueryBounds(center, radiusInM);
    const promises = [];

    // Query each geohash constraint range
    for (const b of bounds) {
      const q = db.collection('LostPets')
        .orderBy('geohash')
        .startAt(b[0])
        .endAt(b[1]);
      
      promises.push(q.get());
    }

    // Await all boundary queries
    const snapshots = await Promise.all(promises);

    const matchingPets = [];
    for (const snap of snapshots) {
      for (const doc of snap.docs) {
        const pet = doc.data();

        // Ensure we are only grabbing "Lost" status
        if (pet.status !== 'Lost') continue;

        // Strip false positives resulting from square geohash bounding boxes
        // Strict geographic math ensuring exactly within 5km circle
        const petLocation = [pet.location.latitude, pet.location.longitude];
        const distanceInKm = distanceBetween(center, petLocation);
        const distanceInM = distanceInKm * 1000;

        if (distanceInM <= radiusInM) {
          matchingPets.push({
            ...pet,
            distanceKm: parseFloat(distanceInKm.toFixed(2)) // Pass downstream for UI tag
          });
        }
      }
    }

    // Return final array
    res.status(200).json({ success: true, count: matchingPets.length, reports: matchingPets });

  } catch (error) {
    console.error('Error finding nearby pets:', error);
    res.status(500).json({ error: 'Failed to query nearby reports' });
  }
});

module.exports = router;
