import React, { useEffect, useState } from "react";
import { auth } from "./firebaseConfig";
import { signOut, updateEmail, updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig"; // Import centralized db
import "./profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Listen for changes in the authentication state
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Set the current user
        setFormData({
          firstName: currentUser.displayName?.split(" ")[0] || "",
          lastName: currentUser.displayName?.split(" ")[1] || "",
          email: currentUser.email || "",
        });
      } else {
        setUser(null); // No user is signed in
      }
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { firstName, lastName } = formData;

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: `${firstName} ${lastName}`,
      });

      // Update Firestore document
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, {
        firstName,
        lastName,
      });

      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "An error occurred while updating the profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      console.log("User logged out successfully");
      window.location.href = "/signup"; // Redirect to /signup
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="profile-container">
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Profile
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {user ? (
              <>
                {success && (
                  <div className="mb-4 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded">
                    <p>{success}</p>
                  </div>
                )}
                {error && (
                  <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>{error}</p>
                  </div>
                )}
                <form className="space-y-6" onSubmit={handleUpdateProfile}>
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      First Name
                    </label>
                    <div className="mt-1">
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Enter your first name"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Last Name
                    </label>
                    <div className="mt-1">
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Enter your last name"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email address
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        readOnly // Prevent editing
                        value={formData.email}
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Enter your email address"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                      disabled={loading}
                    >
                      {loading ? "Updating profile..." : "Update Profile"}
                    </button>
                  </div>
                </form>
                <div className="mt-6 text-center">
                  <button
                    onClick={handleLogout}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <p>No user is currently signed in.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;