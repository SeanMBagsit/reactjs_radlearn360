// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDuZot1h2L3w4nfIM-oq7LoB-wvOg4HYg",
  authDomain: "reactjsradlearn360.firebaseapp.com",
  projectId: "reactjsradlearn360",
  storageBucket: "reactjsradlearn360.firebasestorage.app",
  messagingSenderId: "845489737794",
  appId: "1:845489737794:web:5d5de7d5c6e8c045949ddb",
  measurementId: "G-HP6JBZHMGN"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore and Auth instances
export const db = getFirestore(app);
export const auth = getAuth(app);