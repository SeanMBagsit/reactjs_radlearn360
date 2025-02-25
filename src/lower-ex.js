import React from 'react';
import { NavLink } from 'react-router-dom'; // Use NavLink for navigation
import './lower-ex.css';

const Lower = () => {
  return (
    <div>
      {/* Navigation Bar */}


      {/* Main Content */}
      <main className="content">
        <h1>Select Your Common Procedures</h1>
        <p className="category">Lower Extremities Edition</p>

        <section className="procedure-section">
          <div className="section">
            <img src="foot.png" alt="Foot" className="procedure-image" />
            <div className="section-title">Foot</div>
          </div>
          <ul className="procedure-list">
            <li>
              <NavLink to="/foot" className="link">AP</NavLink> {/* Use NavLink for routing */}
            </li>
          </ul>
        </section>

        <hr />

        <section className="procedure-section">
          <div className="section">
            <img src="ankle.png" alt="Ankle" className="procedure-image" />
            <div className="section-title">Ankle</div>
          </div>
          <ul className="procedure-list">
            <li>
              <NavLink to="/ankle" className="link">LATERAL</NavLink> {/* Use NavLink for routing */}
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default Lower;
