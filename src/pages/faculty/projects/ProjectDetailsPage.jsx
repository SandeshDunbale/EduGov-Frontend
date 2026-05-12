import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Info, Flag, DollarSign } from 'lucide-react';
import { projectService } from '../../../services/projectService';
import { grantService } from '../../../services/grantService'; // 👈 Import the new Grant Service
import './ProjectDetailsPage.css';
import { jwtDecode } from 'jwt-decode';

const ProjectDetailsPage = () => {
  const { projectId } = useParams(); 
  const navigate = useNavigate();

  // Data states
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 👈 NEW: Modal and Application States
  const [showModal, setShowModal] = useState(false);
  const [requestedAmount, setRequestedAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const data = await projectService.getProjectById(projectId);
        setProject(data);
      } catch (err) {
        setError("Failed to load project details. It may have been deleted.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  const getStatusBadge = (status) => {
    if (!status) return 'bg-light text-dark';
    switch(status) {
      case 'DRAFT': return 'bg-secondary text-white';
      case 'UNDER_REVIEW': return 'bg-info text-dark';
      case 'COMPLETED': return 'bg-success text-white';
      default: return 'bg-primary text-white';
    }
  };

  // 👈 UPDATED: Handle Grant Submission with Dynamic JWT Token
  const handleApplyForGrant = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Grab the token from Local Storage
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert("Your session has expired. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      // 2. Decode it to find out who is making this request
      const decodedToken = jwtDecode(token);
      const facultyId = decodedToken.facultyId;

      // 3. Safety check: What if a Student somehow clicks this button?
      if (!facultyId) {
        alert("Action Denied: Only verified Faculty members can apply for grants.");
        setIsSubmitting(false);
        return;
      }
      
      // 4. Send the real dynamic ID to the backend!
      await grantService.applyForGrant(projectId, facultyId, requestedAmount);
      
      alert("Grant Application Submitted Successfully!");
      
      setShowModal(false);
      setRequestedAmount('');
      window.location.reload(); 
      
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit grant application. You may have already applied for this project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center text-muted">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p>Loading project details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger d-inline-block" role="alert">{error}</div>
        <br />
        <button onClick={() => navigate('/faculty/projects')} className="btn btn-outline-primary mt-3">
          Return to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4 details-container position-relative">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/faculty/projects')}
        className="btn btn-link btn-back d-flex align-items-center gap-2 p-0 mb-4 fw-medium text-decoration-none"
      >
        <ArrowLeft size={20} />
        Back to Projects
      </button>

      {/* Details Container */}
      <div className="card shadow-sm border-0 border-light rounded-3">
        <div className="card-body p-4 p-md-5">
          
          {/* Header Row: Title, Status, and APPLY BUTTON */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-4 gap-3">
            <div>
              <h2 className="fw-bold text-navy mb-2">{project.title}</h2>
              <span className={`badge rounded-pill px-3 py-2 fw-semibold fs-6 ${getStatusBadge(project.status)}`}>
                {project.status ? project.status.replace('_', ' ') : 'N/A'}
              </span>
            </div>
            
            {/* 👈 NEW: Only show the "Apply for Grant" button if it's a DRAFT */}
            {project.status === 'DRAFT' && (
              <button 
                onClick={() => setShowModal(true)}
                className="btn btn-success d-flex align-items-center gap-2 px-4 shadow-sm"
              >
                {/* <DollarSign size={18} /> */}
                Apply for Grant
              </button>
            )}
          </div>

          {/* Description Box */}
          <div className="info-grid-box p-4 mb-5">
            <h5 className="fw-bold text-dark mb-3">Project Description</h5>
            <p className="text-secondary mb-0" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
              {project.description}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="row g-4">
            <div className="col-12 col-md-4">
              <div className="p-3 border rounded bg-white shadow-sm h-100">
                <h6 className="text-muted fw-bold text-uppercase tracking-wider mb-2 d-flex align-items-center gap-2">
                  <Info size={16} className="text-primary"/> Project ID
                </h6>
                <p className="fs-5 fw-bold text-dark mb-0">#{project.projectId}</p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-3 border rounded bg-white shadow-sm h-100">
                <h6 className="text-muted fw-bold text-uppercase tracking-wider mb-2 d-flex align-items-center gap-2">
                  <Calendar size={16} className="text-primary"/> Start Date
                </h6>
                <p className="fs-5 text-dark mb-0">{project.startDate}</p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-3 border rounded bg-white shadow-sm h-100">
                <h6 className="text-muted fw-bold text-uppercase tracking-wider mb-2 d-flex align-items-center gap-2">
                  <Flag size={16} className="text-primary"/> End Date
                </h6>
                <p className="fs-5 text-dark mb-0">{project.endDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 👈 NEW: THE BOOTSTRAP MODAL UI */}
      {showModal && (
        <>
          {/* Modal Backdrop (the dark gray overlay) */}
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          
          {/* Modal Container */}
          <div className="modal fade show d-block" style={{ zIndex: 1050 }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                
                {/* Modal Header */}
                <div className="modal-header bg-light border-bottom-0 pt-4 px-4 pb-0">
                  <h5 className="modal-title fw-bold text-dark">Apply for Funding</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>

                {/* Modal Body (The Form) */}
                <form onSubmit={handleApplyForGrant}>
                  <div className="modal-body px-4 py-4">
                    <p className="text-muted small mb-4">
                      Submit a funding request for <strong>{project.title}</strong>. Your application will be sent to the Program Manager for review.
                    </p>

                    <label className="form-label fw-bold text-dark mb-2">
                      Requested Amount ($) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted">$</span>
                      <input 
                        type="number" 
                        required
                        min="1"
                        step="0.01"
                        className="form-control p-2"
                        placeholder="e.g., 50000"
                        value={requestedAmount}
                        onChange={(e) => setRequestedAmount(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="modal-footer border-top-0 px-4 pb-4 pt-0">
                    <button 
                      type="button" 
                      className="btn btn-light text-secondary fw-semibold" 
                      onClick={() => setShowModal(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-success fw-semibold px-4"
                      disabled={isSubmitting || !requestedAmount}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default ProjectDetailsPage;