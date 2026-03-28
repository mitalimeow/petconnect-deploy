const geofire = require('geofire-common');
const { v4: uuidv4 } = require('uuid');

/**
 * Validates and maps incoming pet report data into a distinct
 * NoSQL document schema for Firestore.
 */
class LostPetReport {
  constructor({
    owner_id,
    pet_name,
    animal_type,
    characteristics,
    status = 'Lost',
    photo_url = '',
    lat,
    lng
  }) {
    if (!owner_id || !pet_name || !animal_type || lat === undefined || lng === undefined) {
      throw new Error("Missing required schema fields (owner_id, pet_name, animal_type, lat, lng)");
    }

    this.report_id = uuidv4();
    this.owner_id = owner_id;
    this.pet_name = pet_name;
    this.animal_type = animal_type;
    this.characteristics = characteristics || '';
    this.status = status;
    this.photo_url = photo_url;
    
    // Strict schema requirement: GeoPoint and Geohash for queries
    this.location = {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng)
    };
    
    // Convert coordinate to geohash
    this.geohash = geofire.geohashForLocation([this.location.latitude, this.location.longitude]);
    
    // UNIX Timestamp
    this.timestamp = Date.now();
  }

  // Returns raw object for Firestore
  toFirestore() {
    return {
      report_id: this.report_id,
      owner_id: this.owner_id,
      pet_name: this.pet_name,
      animal_type: this.animal_type,
      characteristics: this.characteristics,
      status: this.status,
      photo_url: this.photo_url,
      // For firestore, we usually map `{ latitude, longitude }` to a real `admin.firestore.GeoPoint`
      // but standard latitude/longitude numbers are acceptable for generic queries.
      location: this.location,
      geohash: this.geohash,
      timestamp: this.timestamp
    };
  }
}

module.exports = LostPetReport;
