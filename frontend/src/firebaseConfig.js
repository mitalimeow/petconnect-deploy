import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "dummy-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-petconnect.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-petconnect",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-petconnect.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

let app;
let db;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase Initialization Error:", error);
  // Fallback to prevent immediate crash if keys are missing
  db = null;
}

export { db };
