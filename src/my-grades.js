import React, { useEffect, useState } from "react";
import { auth, db } from "./firebaseConfig"; // Import centralized db and auth
import { collection, getDocs, query, where } from "firebase/firestore"; // Firestore functions
import "./my-grades.css"; // Import CSS for styling

const MyGrades = () => {
  const [reports, setReports] = useState([]); // State to store detailed reports
  const [loading, setLoading] = useState(true); // Loading state
  const [userEmail, setUserEmail] = useState(""); // Logged-in user's email

  useEffect(() => {
    const fetchReports = async () => {
      try {
        if (!auth.currentUser) {
          console.error("No user is currently signed in.");
          setLoading(false);
          return;
        }

        const user = auth.currentUser;
        setUserEmail(user.email || "Unknown");

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
        console.error("Error fetching reports:", error);
        setLoading(false);
      }
    };

    fetchReports();
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