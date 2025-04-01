import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import { getAuth, deleteUser as deleteAuthUser } from "firebase/auth";
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
    role: "user", // Default role
  });
  const [editingUserId, setEditingUserId] = useState(null);
  const [error, setError] = useState(""); // Error state
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [performanceData, setPerformanceData] = useState([]);
  const [selectedTimestamp, setSelectedTimestamp] = useState(""); // State for selected timestamp
  const [uniqueTimestamps, setUniqueTimestamps] = useState([]); // Unique simulation timestamps for dropdown
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Edit modal state
  const [detailedReport, setDetailedReport] = useState(null); // State for detailed report
  const [grade, setGrade] = useState(null); // State for grade

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

  // Function to view performance
  const viewPerformance = async (userId) => {
    try {
      const scoresCollectionRef = collection(db, "users", userId, "scores");
      const q = query(scoresCollectionRef, where("timestamp", "!=", null));
      const querySnapshot = await getDocs(q);
      const fetchedReports = [];
      querySnapshot.forEach((doc) => {
        fetchedReports.push({ id: doc.id, ...doc.data() });
      });
      setPerformanceData(fetchedReports);
      // Extract unique timestamps for dropdown
      const timestamps = Array.from(
        new Set(fetchedReports.map((report) => report.timestamp.toDate().toLocaleString()))
      );
      setUniqueTimestamps(timestamps);
      setSelectedUser(userId);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching performance data:", error);
      setError("Failed to load performance data. Please try again.");
    }
  };

  // Function to handle timestamp selection
  const handleTimestampChange = async (timestamp) => {
    setSelectedTimestamp(timestamp);
    const selectedReport = performanceData.find(
      (data) => data.timestamp.toDate().toLocaleString() === timestamp
    );
    if (selectedReport) {
      setDetailedReport(selectedReport.performanceData);
      setGrade(`${selectedReport.score}/${selectedReport.total}`);
    } else {
      setDetailedReport(null);
      setGrade(null);
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
        role: newUser.role, // Update role
      });
      // Reset the form fields
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        contactNumber: "",
        username: "",
        role: "user", // Reset role to default
      });
      setEditingUserId(null);
      setIsEditModalOpen(false);
      fetchUsers(); // Refresh the list of users
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Failed to update user. Please try again.");
    }
  };

  const handlePrintReport = () => {
    window.print(); // Triggers the browser's print dialog
  };

  return (
    <div className="admin-container">
      {error && <p style={{ color: "red" }}>{error}</p>}
      <h1 className="admin-title">Admin Panel</h1>
      {/* Modify User List */}
      <>
        <h2 className="user-records-title">User Records</h2>
        <ul className="user-list">
          {users.map((user) => (
            <li key={user.id} className="user-item">
              <span className="user-info">
                [{user.role}] {user.firstName} {user.lastName} - {user.email}
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
                      role: user.role || "user", // Set role from user data or default to "user"
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
                <button
                  onClick={() => viewPerformance(user.id)}
                  className="view-performance-button"
                >
                  View Performance
                </button>
              </div>
            </li>
          ))}
        </ul>
      </>
    {/* Modal for Performance Data */}
{isModalOpen && (
  <div className="dr-modal-overlay" onClick={() => setIsModalOpen(false)}>
    <div
      className="dr-modal-content"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="dr-modal-header">
        <h2 className="dr-modal-title">Performance Data</h2>
        {/* Display Score beside the title */}
        {grade && (
          <span className="dr-modal-score">
            Score: {grade}
          </span>
        )}
        <select
          id="timestamp-dropdown"
          value={selectedTimestamp}
          onChange={(e) => handleTimestampChange(e.target.value)}
        >
          <option value="">Select a timestamp</option>
          {uniqueTimestamps.map((timestamp) => (
            <option key={timestamp} value={timestamp}>
              {timestamp}
            </option>
          ))}
        </select>
      </div>
      {detailedReport && (
        <>
          <table className="dr-reports-table">
            <thead>
              <tr>
                <th>Model Name</th>
                <th>Target Position</th>
                <th>Target Rotation</th>
                <th>Your Position</th>
                <th>Your Rotation</th>
                <th>Result</th>
                <th>Time Taken</th>
              </tr>
            </thead>
            <tbody>
              {detailedReport.map((data, index) => (
                <tr key={`${index}`}>
                  <td>{data.modelName}</td>
                  <td>
                    ({data.targetPosition.x.toFixed(2)},{" "}
                    {data.targetPosition.y.toFixed(2)},{" "}
                    {data.targetPosition.z.toFixed(2)})
                  </td>
                  <td>
                    ({data.targetRotation.x.toFixed(2)}°,{" "}
                    {data.targetRotation.y.toFixed(2)}°,{" "}
                    {data.targetRotation.z.toFixed(2)}°)
                  </td>
                  <td>
                    ({data.userPosition.x.toFixed(2)},{" "}
                    {data.userPosition.y.toFixed(2)},{" "}
                    {data.userPosition.z.toFixed(2)})
                  </td>
                  <td>
                    ({data.userRotation.x.toFixed(2)}°,{" "}
                    {data.userRotation.y.toFixed(2)}°,{" "}
                    {data.userRotation.z.toFixed(2)}°)
                  </td>
                  <td className={data.result === "Pass" ? "dr-pass" : "dr-fail"}>
                    {data.result}
                  </td>
                  <td>{data.timeToComplete} sec</td>
                </tr>
              ))}
            </tbody>
          </table>
             {/* Display Email Below Title */}
        {selectedUser && (
          <p className="dr-modal-email">
           Email:{" "}
            {users.find((user) => user.id === selectedUser)?.email || "N/A"}
          </p>
        )}
          {/* Print Report Button Container */}
          <div className="dr-print-button-container">
            <button
              className="dr-print-button"
              onClick={handlePrintReport}
              aria-label="Print report"
            >
              Print Report
            </button>
          </div>
        </>
      )}
      <button className="dr-close-modal" onClick={() => setIsModalOpen(false)}>
        Close
      </button>
    </div>
  </div>
)}
      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="dr-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div
            className="dr-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="dr-modal-title">Edit User</h2>
            <form onSubmit={updateUser} className="admin-form">
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
              {/* Role Dropdown */}
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                className="admin-input"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" className="admin-button">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;