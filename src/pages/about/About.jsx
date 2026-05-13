import React from 'react';
import { ShieldCheck, Scale, Zap, BarChart, GraduationCap, Users, Building2, BookOpen, Server } from 'lucide-react';
import './about.css';

const About = () => {
  return (
    <div className="about-page-container">
      
      {/* --- HERO SECTION --- */}
      <section className="about-hero">
        <div className="hero-badge-alt">Our Mission</div>
        <h1 className="about-title">Empowering the Future of <br/><span className="text-highlight">Academic Governance</span></h1>
        <p className="about-subtitle">
          EduGov is a next-generation, unified digital ecosystem designed to bridge the gap between educational institutions, government auditors, and research bodies. We eliminate administrative silos to accelerate academic innovation.
        </p>
      </section>

      {/* --- CORE PILLARS SECTION --- */}
      <section className="about-section">
        <div className="section-header">
          <h2>Core Pillars</h2>
          <p>The foundational principles driving our architecture.</p>
        </div>
        
        <div className="pillars-grid">
          <div className="glass-card">
            <div className="card-icon-wrapper"><ShieldCheck size={28} /></div>
            <h3>Uncompromising Security</h3>
            <p>Built on military-grade architecture with strict Role-Based Access Control (RBAC), ensuring sensitive data is visible only to authorized personnel.</p>
          </div>
          
          <div className="glass-card">
            <div className="card-icon-wrapper"><Scale size={28} /></div>
            <h3>Absolute Compliance</h3>
            <p>Automated audit trails and regulatory tracking keep universities perfectly aligned with government and institutional standards.</p>
          </div>
          
          <div className="glass-card">
            <div className="card-icon-wrapper"><Zap size={28} /></div>
            <h3>Streamlined Innovation</h3>
            <p>From curriculum approvals to infrastructure requests, our agile workflows cut bureaucratic red tape instantly.</p>
          </div>
          
          <div className="glass-card">
            <div className="card-icon-wrapper"><BarChart size={28} /></div>
            <h3>Data-Driven Decisions</h3>
            <p>Real-time analytics dashboards provide administrators with a bird's-eye view of institutional health and resource allocation.</p>
          </div>
        </div>
      </section>

      {/* --- UNIFIED ECOSYSTEM SECTION --- */}
      <section className="about-section ecosystem-section">
        <div className="section-header">
          <h2>A Unified Ecosystem</h2>
          <p>Seamlessly connecting every level of the academic hierarchy.</p>
        </div>

        <div className="ecosystem-grid">
          <div className="eco-row">
            <div className="eco-icon student-icon"><GraduationCap size={24} /></div>
            <div className="eco-content">
              <h4>Students</h4>
              <p>A centralized portal for seamless enrollments, resource requests, and academic tracking.</p>
            </div>
          </div>

          <div className="eco-row">
            <div className="eco-icon faculty-icon"><BookOpen size={24} /></div>
            <div className="eco-content">
              <h4>Faculty</h4>
              <p>A dedicated workspace for managing courses, tracking research grants, and requesting vital infrastructure.</p>
            </div>
          </div>

          <div className="eco-row">
            <div className="eco-icon admin-icon"><Building2 size={24} /></div>
            <div className="eco-content">
              <h4>University Administrators</h4>
              <p>Complete oversight over user approvals, curriculum design, and institutional reporting.</p>
            </div>
          </div>

          <div className="eco-row">
            <div className="eco-icon auditor-icon"><Users size={24} /></div>
            <div className="eco-content">
              <h4>Auditors & Managers</h4>
              <p>Highly transparent, read-only views into financial ledgers and compliance records for frictionless auditing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- TECH STACK SECTION --- */}
      <section className="about-section tech-section">
        <div className="tech-glass-panel">
          <Server size={32} className="tech-icon" />
          <div className="tech-text">
            <h3>Built for Enterprise Scale</h3>
            <p>EduGov operates on a highly resilient <strong>Microservices Architecture</strong>, powered by Spring Boot and Spring Cloud Gateway. The responsive, interactive frontend is driven by React.js, ensuring a seamless experience across all devices and regions.</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;