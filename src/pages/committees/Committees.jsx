import React from 'react';
import { BookOpen, FileSearch, PieChart, Server, ShieldAlert, ChevronRight } from 'lucide-react';
import './committees.css';

const Committees = () => {
  const committeeData = [
    {
      title: "Academic Affairs & Senate",
      icon: <BookOpen size={28} />,
      color: "emerald",
      description: "Governs curriculum design, degree approvals, and institutional academic standards across all university departments.",
      chair: "Dr. Sarah Jenkins",
      schedule: "Meets Bi-Weekly"
    },
    {
      title: "Research & Ethics Board",
      icon: <FileSearch size={28} />,
      color: "violet",
      description: "Evaluates research proposals for ethical compliance and manages the distribution of federal research grants.",
      chair: "Prof. Marcus Vance",
      schedule: "Meets Monthly"
    },
    {
      title: "Financial Audit Oversight",
      icon: <PieChart size={28} />,
      color: "amber",
      description: "Maintains absolute financial transparency, allocating budgets and interfacing directly with government auditors.",
      chair: "Auditor Gen. Robert Chen",
      schedule: "Meets Quarterly"
    },
    {
      title: "Infrastructure & IT",
      icon: <Server size={28} />,
      color: "blue",
      description: "Approves laboratory expansions, campus development, and maintains enterprise-grade cybersecurity policies.",
      chair: "Director Elena Rostova",
      schedule: "Meets Bi-Weekly"
    },
    {
      title: "Compliance & Grievance",
      icon: <ShieldAlert size={28} />,
      color: "rose",
      description: "Ensures strict adherence to federal education laws and provides a neutral ground for institutional dispute resolution.",
      chair: "Officer David Alarie",
      schedule: "Meets On-Demand"
    }
  ];

  return (
    <div className="committees-page">
      
      {/* Page Header */}
      <section className="committees-header">
        <div className="badge">Governance Bodies</div>
        <h1 className="title">Institutional <span className="highlight">Committees</span></h1>
        <p className="subtitle">
          The central pillars of decision-making. Our committees ensure that academic excellence is matched by ethical integrity, financial transparency, and strict regulatory compliance.
        </p>
      </section>

      {/* Committees Grid */}
      <section className="committees-grid">
        {committeeData.map((committee, index) => (
          <div className="committee-card" key={index}>
            <div className={`card-icon-header ${committee.color}`}>
              {committee.icon}
            </div>
            
            <div className="card-body">
              <h2>{committee.title}</h2>
              <p className="desc">{committee.description}</p>
              
              <div className="committee-meta">
                <div className="meta-item">
                  <span className="meta-label">Chairperson:</span>
                  <span className="meta-value">{committee.chair}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Schedule:</span>
                  <span className="meta-value">{committee.schedule}</span>
                </div>
              </div>

              <button className="view-details-btn">
                View Mandate <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </section>

    </div>
  );
};

export default Committees;