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
import { auth } from "./firebaseConfig";
import Admin from "./admin"; // Import Admin component

const App = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false); // State for dropdown

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

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Function to close the profile dropdown
  const closeProfileDropdown = () => {
    setProfileDropdownOpen(false);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (location.pathname === "/") {
      document.body.style.overflow = "auto";
    } else if (location.pathname === "/simulation") {
      document.body.style.overflow = "hidden";
    }
  }, [location.pathname]);

  // Add event listener to close dropdown when clicking outside
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
      {/* Navigation Bar */}
      <header className="navbar">
        <div className="logo">RadLearn360</div>
        {/* Hamburger Menu Button */}
        <div
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
        {/* Navigation Links */}
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
          {/* Replace Simulation with Admin */}
          <NavLink
            to="/admin"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeMenu}
          >
            dashboard
          </NavLink>
          {/* Dynamically update navigation based on authentication state */}
          {user ? (
            <div
              className="profile-dropdown"
              style={{ display: "flex", justifyContent: "center" }}
            >
              <div
                className="profile-name"
                onClick={() =>
                  setProfileDropdownOpen(!profileDropdownOpen)
                } // Toggle dropdown on click
              >
                PROFILE {profileDropdownOpen ? "+" : "-"}
              </div>
              {profileDropdownOpen && (
                <div
                  className="profile-menu"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "#ffffff",
                    padding: "10px",
                    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
                    borderRadius: "5px",
                    zIndex: 1000,
                  }}
                >
                  {/* Show only Logout button in /admin */}
                  {location.pathname === "/admin" ? (
                    <button
                      onClick={() => {
                        auth.signOut();
                        closeProfileDropdown();
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      Logout
                    </button>
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
          ) : (
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