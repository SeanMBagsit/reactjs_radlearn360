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
import Homepage from "./homepage";

const App = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Check if current path is study-related
  const isStudyRoute = () => {
    const studyPaths = ['/study', '/upper', '/hand', '/wrist', '/elbow', '/lower', '/foot', '/ankle'];
    return studyPaths.some(path => location.pathname === path);
  };

  // Toggle menu function
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Close menu when a link is clicked
  const closeMenu = () => {
    setMenuOpen(false);
  };

  // 🔥 Fix: Restore scrolling when switching pages
  useEffect(() => {
    if (location.pathname === "/") {
      document.body.style.overflow = "auto"; // Always enable scrolling on homepage
    } else if (location.pathname === "/simulation") {
      document.body.style.overflow = "hidden"; // Hide scrolling in simulation
    }
  }, [location.pathname]);

  return (
    <div>
      {/* Navigation Bar */}
      <header className="navbar">
        <div className="logo">RadLearn360</div>
        
        {/* Hamburger Menu Button */}
        <div 
          className={`hamburger ${menuOpen ? 'open' : ''}`} 
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
        
        {/* Navigation Links */}
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
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
          <NavLink 
            to="/simulation" 
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeMenu}
          >
            Simulation
          </NavLink>
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
        <Route path="/simulation" element={<Simulation />} />
      </Routes>
    </div>
  );
};

export default App;