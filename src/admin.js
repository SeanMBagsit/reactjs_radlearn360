import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  getDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, deleteUser as deleteAuthUser } from "firebase/auth";
import { db, auth } from "./firebaseConfig"; // Adjust the import based on your project structure
import "./admin.css"; // Import your CSS file for styling

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    username: "",
  });
  const [editingUserId, setEditingUserId] = useState(null);
  const [isAddingUser, setIsAddingUser] = useState(true); // Toggle state
  const [error, setError] = useState(""); // Error state
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [performanceData, setPerformanceData] = useState([]);
  const [selectedTimestamp, setSelectedTimestamp] = useState(""); // State for selected timestamp
  const [uniqueTimestamps, setUniqueTimestamps] = useState([]); // Unique simulation timestamps for dropdown
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Edit modal state

  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to add a new user
  const addUser = async (e) => {
    e.preventDefault();
    try {
      const authInstance = getAuth(); // Initialize Firebase Auth
      // Create a new user in Firebase Authentication with email and default password
      const userCredential = await createUserWithEmailAndPassword(
        authInstance,
        newUser.email,
        "000000" // Default password
      );
      const uid = userCredential.user.uid; // Get the UID of the newly created user

      // Create a new user object with the required fields and include the UID
      const newUserWithRole = {
        uid: uid, // Store the UID in Firestore
        contactNumber: newUser.contactNumber, // Ensure this is a string
        createdAt: new Date(), // Use JavaScript Date object for Firestore Timestamp
        email: newUser.email, // Ensure this is a string
        firstName: newUser.firstName, // Ensure this is a string
        lastName: newUser.lastName, // Ensure this is a string
        role: "user", // Set default role to 'user'
        username: newUser.username, // Ensure this is a string
      };

      // Add the user details to Firestore under the "users" collection
      await addDoc(collection(db, "users"), newUserWithRole);

      // Reset the form fields
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        contactNumber: "",
        username: "",
      });

      // Refresh the list of users
      fetchUsers();
      console.log("User added successfully:", newUserWithRole);
    } catch (error) {
      console.error("Error adding user:", error);
      setError("Failed to add user. Please try again.");
    }
  };

  // Function to delete a user
  const deleteUser = async (userId) => {
    try {
      // Find the user by UID and delete from Firebase Authentication
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const user = auth.currentUser;
        if (user && user.uid === userData.uid) {
          await deleteAuthUser(user); // Delete from Firebase Auth
        }
      }
      // Delete the user document from Firestore
      await deleteDoc(doc(db, "users", userId));
      fetchUsers(); // Refresh the list of users
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete user. Please try again.");
    }
  };

  // Function to update a user
  const updateUser = async (e) => {
    e.preventDefault();
    try {
      const userRef = doc(db, "users", editingUserId);
      await updateDoc(userRef, {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        contactNumber: newUser.contactNumber,
        username: newUser.username,
      });

      // Reset the form fields
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        contactNumber: "",
        username: "",
      });
      setEditingUserId(null);
      setIsEditModalOpen(false);
      fetchUsers(); // Refresh the list of users
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Failed to update user. Please try again.");
    }
  };

  return (
    <div className="admin-container">
      {error && <p style={{ color: "red" }}>{error}</p>}
      <h1 className="admin-title">Admin Panel</h1>
      {/* Toggle Switch with Labels */}
      <div className="toggle-switch-container">
        <span className={`toggle-label ${isAddingUser ? "active" : ""}`}>
          Add User
        </span>
        <label className="toggle-switch" aria-label="Toggle between Add and Edit">
          <input
            type="checkbox"
            checked={isAddingUser}
            onChange={() => setIsAddingUser(!isAddingUser)}
          />
          <span className="slider round"></span>
        </label>
        <span className={`toggle-label ${!isAddingUser ? "active" : ""}`}>
          Modify User
        </span>
      </div>
      {/* Conditional Rendering */}
      {isAddingUser ? (
        // Add User Form
        <form onSubmit={addUser} className="admin-form">
          <input
            type="text"
            placeholder="First Name"
            value={newUser.firstName}
            onChange={(e) =>
              setNewUser({ ...newUser, firstName: e.target.value })
            }
            className="admin-input"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={newUser.lastName}
            onChange={(e) =>
              setNewUser({ ...newUser, lastName: e.target.value })
            }
            className="admin-input"
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) =>
              setNewUser({ ...newUser, email: e.target.value })
            }
            className="admin-input"
          />
          <input
            type="text"
            placeholder="Contact Number"
            value={newUser.contactNumber}
            onChange={(e) => {
              const value = e.target.value;
              if (!value || /^[0-9]*$/.test(value)) {
                setNewUser({ ...newUser, contactNumber: value });
              }
            }}
            className="admin-input"
          />
          <input
            type="text"
            placeholder="Username"
            value={newUser.username}
            onChange={(e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
            className="admin-input"
          />
          <button type="submit" className="admin-button">
            Add User
          </button>
        </form>
      ) : (
        // Edit User List
        <>
          <h2 className="user-records-title">User Records</h2>
          <ul className="user-list">
            {users.map((user) => (
              <li key={user.id} className="user-item">
                <span className="user-info">
                  {user.firstName} {user.lastName} - {user.email}
                </span>
                <div className="user-actions">
                  <button
                    onClick={() => {
                      setEditingUserId(user.id);
                      setNewUser({
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        contactNumber: user.contactNumber,
                        username: user.username,
                      });
                      setIsEditModalOpen(true);
                    }}
                    className="edit-button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Admin;