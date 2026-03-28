const admin = require('firebase-admin');

// Note: Ensure FIREBASE_SERVICE_ACCOUNT_KEY is configured in .env 
// or providing fallback initialization for testing purposes.
let db;
let bucket;

try {
  // If service account is available, initialize
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'petconnect-default.appspot.com'
    });
  } else {
    // Fallback initialize to suppress errors if key is missing during script validation
    console.warn("WARNING: FIREBASE_SERVICE_ACCOUNT_KEY missing. Initializing dummy admin for validation.");
    admin.initializeApp({
      projectId: "demo-petconnect"
    });
  }
  
  db = admin.firestore();
  
  // Try to initialize bucket, handle missing default bucket error gracefully
  try {
    bucket = admin.storage().bucket();
  } catch (err) {
    console.warn("Firebase Storage Bucket initialization skipped: " + err.message);
    bucket = null; 
  }
  
  // Connect to emulator if requested
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    db.settings({
      host: process.env.FIRESTORE_EMULATOR_HOST,
      ssl: false
    });
  }
} catch (error) {
  console.error("Firebase Admin Initialization Error:", error);
}

module.exports = { admin, db, bucket };
