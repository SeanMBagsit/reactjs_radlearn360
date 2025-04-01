import React, { useEffect, useState } from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
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
import { db, auth } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Admin from "./admin"; // Import Admin component

const App = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false); // State for dropdown
  const [role, setRole] = useState(null);
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
        }
      } else {
        setUser(null);
        setRole(null);
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

          

          {role === "user" && (
            <NavLink
              to="/simulation"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={closeMenu}
            >
              Simulation
            </NavLink>
          )}

          {role === "user" && (
            <div className="profile-dropdown">
              <div
                className="profile-name"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                PROFILE {profileDropdownOpen ? "+" : "-"}
              </div>
              {profileDropdownOpen && (
                <div className="profile-menu">
                  {location.pathname === "/admin" ? (
                    <button onClick={() => auth.signOut()}>Logout</button>
                  ) : (
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
                  )}
                </div>
              )}
            </div>
          )}


          {role === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={closeMenu}
            >
              Dashboard
            </NavLink>
          )}

{role === "admin" && (
            <div className="profile-dropdown">
              <div
                className="profile-name"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                PROFILE {profileDropdownOpen ? "+" : "-"}
              </div>
              {profileDropdownOpen && (
                <div className="profile-menu">
                  {location.pathname === "/admin" ? (
                    <button onClick={() => auth.signOut()}>Logout</button>
                  ) : (
                    <>
                      <NavLink
                        to="/profile"
                        className={({ isActive }) => (isActive ? "active" : "")}
                        onClick={closeMenu}
                      >
                        My Profile
                      </NavLink>
                    </>
                  )}
                </div>
              )}
            </div>
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
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
};

export default App;