import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, NavLink, useLocation } from "react-router-dom";
import "./App.css";
import Study from "./study";
import Upper from "./upper-ex";
import Hand from "./hand";
import Wrist from "./wrist";
import Elbow from "./elbow";
import Lower from "./lower-ex";
import Foot from "./foot";
import Ankle from "./ankle";
import Simulation from "./simulation";
import SignUp from "./signup";
import Homepage from "./homepage";
import Landing from "./landing";
import Profile from "./profile";
import MyGrades from "./my-grades"; // Import new component
import DetailedReports from "./view-detailed-reports"; // Import new component
import Admin from "./admin"; // Import Admin component
import { db, auth } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const App = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false); // State for dropdown
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state

  const isStudyRoute = () => {
    const studyPaths = [
      "/study",
      "/upper",
      "/hand",
      "/wrist",
      "/elbow",
      "/lower",
      "/foot",
      "/ankle",
    ];
    return studyPaths.some((path) => location.pathname === path);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Function to close the profile dropdown
  const closeProfileDropdown = () => {
    setProfileDropdownOpen(false);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Fetch the user's role from Firestore
        try {
          const userID = currentUser.uid;
          const userDocRef = doc(db, "users", userID);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const userRole = userData.role || null; // Extract the "role" field
            setRole(userRole);
            console.log("User Role:", userRole);
          } else {
            console.log("No such document!");
            setRole(null);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setRole(null);
        } finally {
          setLoading(false); // Mark loading as complete
        }
      } else {
        setUser(null);
        setRole(null);
        setLoading(false); // Mark loading as complete
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []); // Dependency array ensures this runs only once on mount/unmount

  useEffect(() => {
    if (location.pathname === "/") {
      document.body.style.overflow = "auto";
    } else if (location.pathname === "/simulation") {
      document.body.style.overflow = "hidden";
    }
  }, [location.pathname]);

  // Add event listener when profile is clicked
  useEffect(() => {
    const handleClickOutside = (event) => {
      const profileDropdown = document.querySelector(".profile-dropdown");
      if (
        profileDropdown &&
        !profileDropdown.contains(event.target) &&
        profileDropdownOpen
      ) {
        closeProfileDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownOpen]);

  // Role-based route guard component
  const RoleBasedRoute = ({ allowedRoles, children }) => {
    if (!user) {
      return <Navigate to="/signup" replace />;
    }

    if (!allowedRoles.includes(role)) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  if (loading) {
    return <div className="loading">Loading...</div>; // Display a loading message
  }

  return (
    <div>
      <header className="navbar">
        <div className="logo">RadLearn360</div>
        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeMenu}
          >
            Home
          </NavLink>

          <NavLink
            to="/study"
            className={isStudyRoute() ? "active" : ""}
            onClick={closeMenu}
          >
            Study
          </NavLink>

          {/* Render user-specific links only after login */}
          {role === "user" && (
            <>
              <NavLink
                to="/simulation"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={closeMenu}
              >
                Simulation
              </NavLink>
              <div className="profile-dropdown">
                <div
                  className="profile-name"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  PROFILE {profileDropdownOpen ? "+" : "-"}
                </div>
                {profileDropdownOpen && (
                  <div className="profile-menu">
                    <>
                      <NavLink
                        to="/profile"
                        className={({ isActive }) => (isActive ? "active" : "")}
                        onClick={closeMenu}
                      >
                        My Profile
                      </NavLink>
                      <NavLink
                        to="/my-grades"
                        className={({ isActive }) => (isActive ? "active" : "")}
                        onClick={closeMenu}
                      >
                        My Grades
                      </NavLink>
                      <NavLink
                        to="/view-detailed-reports"
                        className={({ isActive }) => (isActive ? "active" : "")}
                        onClick={closeMenu}
                      >
                        My Reports
                      </NavLink>
                    </>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Render admin-specific links only after login */}
          {role === "admin" && (
            <>
              <NavLink
                to="/admin"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={closeMenu}
              >
                Dashboard
              </NavLink>
              <div className="profile-dropdown">
                <div
                  className="profile-name"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  PROFILE {profileDropdownOpen ? "+" : "-"}
                </div>
                {profileDropdownOpen && (
                  <div className="profile-menu">
                    <>
                      <NavLink
                        to="/profile"
                        className={({ isActive }) => (isActive ? "active" : "")}
                        onClick={closeMenu}
                      >
                        My Profile
                      </NavLink>
                    </>
                  </div>
                )}
              </div>
            </>
          )}

          {!user && (
            <NavLink
              to="/signup"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={closeMenu}
            >
              Sign Up
            </NavLink>
          )}
        </nav>
      </header>
      {/* Main Content */}
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/study" element={<Study />} />
        <Route path="/upper" element={<Upper />} />
        <Route path="/hand" element={<Hand />} />
        <Route path="/wrist" element={<Wrist />} />
        <Route path="/elbow" element={<Elbow />} />
        <Route path="/lower" element={<Lower />} />
        <Route path="/foot" element={<Foot />} />
        <Route path="/ankle" element={<Ankle />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-grades" element={<MyGrades />} /> {/* New route */}
        <Route
          path="/view-detailed-reports"
          element={<DetailedReports />}
        /> {/* New route */}
        {/* Admin route with role-based protection */}
        <Route
          path="/admin"
          element={
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Admin />
            </RoleBasedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;