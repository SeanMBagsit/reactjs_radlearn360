// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDuZot1h2L3w4nfIM-oq7LoB-wvOg4HYg", // Replace with your actual API key
  authDomain: "radlearn360.firebaseapp.com",
  projectId: "radlearn360",
  storageBucket: "radlearn360.appspot.com",
  messagingSenderId: "668579421436",
  appId: "1:668579421436:web:7d1bbf58791c2a01b58b79"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore and Auth instances
export const db = getFirestore(app);
export const auth = getAuth(app);