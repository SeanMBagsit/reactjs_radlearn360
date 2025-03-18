// Profile.js
import React, { useEffect, useState } from "react";
import { auth } from "./firebaseConfig";
import { signOut } from "firebase/auth";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for changes in the authentication state
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Set the current user
      } else {
        setUser(null); // No user is signed in
      }
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      console.log("User logged out successfully");
      
      // Redirect the user to the signup page after logout
      window.location.href = "/signup"; // Redirect to /signup
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", maxWidth: "400px", margin: "auto" }}>
      <h2>Profile</h2>
      {user ? (
        <>
          <p><strong>Name:</strong> {user.displayName || "Not provided"}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <button 
            onClick={handleLogout} 
            style={{ padding: "10px 20px", background: "#ff4d4d", color: "white", border: "none", cursor: "pointer" }}
          >
            Logout
          </button>
        </>
      ) : (
        <p>No user is currently signed in.</p>
      )}
    </div>
  );
};

export default Profile;