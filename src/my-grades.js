import React, { useEffect, useState } from "react";
import { auth, db } from "./firebaseConfig"; // Import centralized db and auth
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore"; // Firestore functions
import "./my-grades.css"; // Import CSS for styling

const MyGrades = () => {
  const [reports, setReports] = useState([]); // State to store detailed reports
  const [loading, setLoading] = useState(true); // Loading state
  const [userEmail, setUserEmail] = useState(""); // Logged-in user's email
  const [userDetails, setUserDetails] = useState({ firstName: "", lastName: "" }); // User's first and last name

  useEffect(() => {
    const fetchUserDataAndReports = async () => {
      try {
        if (!auth.currentUser) {
          console.error("No user is currently signed in.");
          setLoading(false);
          return;
        }

        const user = auth.currentUser;
        setUserEmail(user.email || "Unknown");

        // Fetch user details (first name and last name) from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          setUserDetails({
            firstName: userData.firstName || "N/A",
            lastName: userData.lastName || "N/A",
          });
        } else {
          console.warn("User document does not exist in Firestore.");
          setUserDetails({ firstName: "N/A", lastName: "N/A" });
        }

        // Reference to the user's scores subcollection
        const scoresCollectionRef = collection(db, "users", user.uid, "scores");
        const q = query(scoresCollectionRef, where("timestamp", "!=", null)); // Fetch all scores with timestamps

        const querySnapshot = await getDocs(q);
        const fetchedReports = [];

        querySnapshot.forEach((doc) => {
          fetchedReports.push({ id: doc.id, ...doc.data() });
        });

        // Sort reports by timestamp (oldest first)
        fetchedReports.sort((a, b) =>
          a.timestamp.toDate() > b.timestamp.toDate() ? 1 : -1
        );

        setReports(fetchedReports);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data or reports:", error);
        setLoading(false);
      }
    };

    fetchUserDataAndReports();
  }, []);

  if (loading) {
    return (
      <div className="mg-loader-container">
        <p className="mg-loading-text">Loading your grades...</p>
      </div>
    );
  }

  return (
    <div className="mg-grades-container">
      <h1 className="mg-title">My Grades</h1>
      <p className="mg-user-email">User Email: {userEmail}</p>
      <p className="mg-user-name">
        Name: {userDetails.firstName} {userDetails.lastName}
      </p>

      {/* Table to display simulation data */}
      <div className="mg-grade-card">
        {reports.length === 0 ? (
          <p className="mg-no-simulations">No simulations completed yet.</p>
        ) : (
          <table className="mg-simulation-table">
            <thead>
              <tr>
                <th>Simulation Date</th>
                <th>User Score</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="mg-simulation-row">
                  <td>{new Date(report.timestamp.toDate()).toLocaleDateString()}</td>
                  <td>
                    {report.score !== undefined && report.total !== undefined
                      ? `${report.score}/${report.total}`
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MyGrades;