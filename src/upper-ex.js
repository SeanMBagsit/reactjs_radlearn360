import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import './upper-ex.css';

const Upper = () => {
  return (
    <div>
      <main className="content">
        <h1>Select Your Common Procedures</h1>
        <p className="category">Upper Extremities Edition</p>

        <section className="procedure-section">
          <div className="section">
            <img src="hand.png" alt="Hand" className="procedure-image" />
            <div className="section-title">Hands</div>
          </div>
          <ul className="procedure-list">
            {/* Use Link for navigation to avoid page reload */}
            <li><Link to="/hand">PA</Link></li>
          </ul>
        </section>

        <hr />

        <section className="procedure-section">
          <div className="section">
            <img src="hand.png" alt="Wrist" className="procedure-image" />
            <div className="section-title">Wrist</div>
          </div>
          <ul className="procedure-list">
            <li><Link to="/wrist">Lateral</Link></li>
          </ul>
        </section>

        <hr />

        <section className="procedure-section">
          <div className="section">
            <img src="hand.png" alt="Elbow" className="procedure-image" />
            <div className="section-title">Elbow</div>
          </div>
          <ul className="procedure-list">
            <li><Link to="/elbow">PA</Link></li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default Upper;
