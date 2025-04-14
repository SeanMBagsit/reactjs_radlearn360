import React, { useEffect, useState } from "react";
import { auth, db } from "./firebaseConfig"; // Import centralized db and auth
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore"; // Firestore functions
import "./view-detailed-reports.css";

const DetailedReports = () => {
  const [reports, setReports] = useState([]); // State to store detailed reports
  const [loading, setLoading] = useState(true); // Loading state
  const [userEmail, setUserEmail] = useState(""); // Logged-in user's email
  const [userDetails, setUserDetails] = useState({ firstName: "", lastName: "" }); // User's first and last name
  const [selectedReport, setSelectedReport] = useState(null); // Selected report for detailed view
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state

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

        setReports(fetchedReports);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data or detailed reports:", error);
        setLoading(false);
      }
    };

    fetchUserDataAndReports();
  }, []);

  // Handle click on a report date to show detailed performance data
  const handleReportClick = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true); // Open modal
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null); // Reset selected report
  };

  // Function to trigger print functionality
  const handlePrintReport = () => {
    window.print(); // Triggers the browser's print dialog
  };

  if (loading) {
    return (
      <div className="dr-loader-container">
        <div className="dr-spinner"></div>
        <p className="dr-loading-text">Loading your reports...</p>
      </div>
    );
  }

  return (
    <div className="dr-reports-container">
      <h1 className="dr-title">My Detailed Reports</h1>
      <p className="dr-user-email">User Email: {userEmail}</p>
      <p className="dr-user-name">
        Name: {userDetails.firstName} {userDetails.lastName}
      </p>

      {/* List of reports */}
      <div className="dr-report-list">
        {reports.length === 0 ? (
          <p className="dr-no-reports">
            No reports available. Please complete simulations to generate reports.
          </p>
        ) : (
          <ul className="dr-report-items">
            {reports.map((report) => (
              <li key={report.id} className="dr-report-item">
                <button
                  onClick={() => handleReportClick(report)}
                  className="dr-report-button"
                  aria-label={`View report for ${new Date(
                    report.timestamp.toDate()
                  ).toLocaleString()}`}
                >
                  {new Date(report.timestamp.toDate()).toLocaleString()}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal for Detailed Performance Data */}
{isModalOpen && selectedReport && (
  <div className="dr-modal-overlay" onClick={closeModal}>
    <div
      className="dr-modal-content"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="dr-modal-header">
        <div className="dr-modal-title-container">
          <h2 className="dr-modal-title">
            Performance Data for Simulation on{" "}
            {new Date(selectedReport.timestamp.toDate()).toLocaleString()}
          </h2>
          {/* Display User's Email Address Below Title */}
          <p className="dr-modal-email">Email: {userEmail}</p>
          {/* Display User's Full Name Below Email */}
          <p className="dr-modal-name">
            Name: {userDetails.firstName} {userDetails.lastName}
          </p>
        </div>
        <button
          className="dr-print-button"
          onClick={handlePrintReport}
          aria-label="Print report"
        >
          Print Report
        </button>
      </div>
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
          {selectedReport.performanceData.map((data, index) => (
            <tr key={`${selectedReport.id}-${index}`}>
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
      <button className="dr-close-modal" onClick={closeModal}>
        Close
      </button>
    </div>
  </div>
      )}
    </div>
  );
};

export default DetailedReports;