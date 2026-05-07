import React from 'react';
import './footer.css';

const Footer = () => {
  return (
    <footer className="edugov-footer">
      <div className="footer-container">
        
        {/* Section 1: Brand & Identity */}
        <div className="footer-section brand-section">
          <h3 className="footer-logo">EduGov</h3>
          <p className="brand-tagline">
            Higher Education & Research Governance System. 
            Ensuring compliance and fostering academic growth.
          </p>
        </div>

        {/* Section 2: About Us */}
        <div className="footer-section">
          <h4 className="section-title">About Us</h4>
          <ul className="footer-links">
            <li><a href="/mission">Mission & Vision</a></li>
            <li><a href="/leadership">Leadership</a></li>
            <li><a href="/compliance">Compliance Standards</a></li>
            <li><a href="/careers">Careers</a></li>
          </ul>
        </div>

        {/* Section 3: Committees (Commots) */}
        <div className="footer-section">
          <h4 className="section-title">Committees</h4>
          <ul className="footer-links">
            <li><a href="/academic-board">Academic Board</a></li>
            <li><a href="/ethics-audit">Ethics & Audit</a></li>
            <li><a href="/grant-review">Grant Review</a></li>
            <li><a href="/curriculum">Curriculum Oversight</a></li>
          </ul>
        </div>

        {/* Section 4: Contact */}
        <div className="footer-section contact-section">
          <h4 className="section-title">Contact</h4>
          <ul className="footer-links">
            <li><a href="mailto:support@edugov.edu">support@edugov.edu</a></li>
            <li>1-800-EDU-GOV</li>
            <li>University Management Wing</li>
            <li>Global Helpdesk</li>
          </ul>
        </div>

      </div>
      
      {/* Copyright & Legal */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} EduGov. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;