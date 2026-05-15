import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Info, Flag } from 'lucide-react';
import { ProjectAPI } from "../../../services/projectService";
import { GrantAPI } from "../../../services/grantService";
import './ProjectDetailsPage.css';
import { jwtDecode } from 'jwt-decode';
import toast, { Toaster } from 'react-hot-toast';

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [requestedAmount, setRequestedAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const data = await ProjectAPI.getProjectById(projectId);
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
    if (!status) return 'badge bg-light text-dark';
    switch (status) {
      case 'DRAFT': return 'badge bg-secondary text-white';
      case 'UNDER_REVIEW': return 'badge bg-info text-dark';
      case 'COMPLETED': return 'badge bg-success text-white';
      default: return 'badge bg-primary text-white';
    }
  };

  const handleApplyForGrant = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error("Your session has expired. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      const decodedToken = jwtDecode(token);
      const facultyId = decodedToken.facultyId;

      if (!facultyId) {
        toast.error("Only faculty can apply.");
        setIsSubmitting(false);
        return;
      }

      await GrantAPI.applyForGrant(projectId, facultyId, {
        requestedAmount: Number(requestedAmount)
      });

      toast.success("Grant Application Submitted!");

      setShowModal(false);
      setRequestedAmount('');

      setTimeout(() => window.location.reload(), 1500);

    } catch (error) {
      toast.error(error.response?.data?.message || "Already applied or failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loader-box">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="error-box">{error}</div>;
  }

  return (
    <div className="details-wrapper">

      {/* ✅ TOASTER FIXED */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e3a5f',
            color: '#fff',
            borderRadius: '8px'
          },
          success: {
            iconTheme: {
              primary: '#0ea5e9',
              secondary: '#fff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff'
            }
          }
        }}
      />

      <button onClick={() => navigate('/faculty/projects')} className="back-btn">
        <ArrowLeft size={18}/> Back to Projects
      </button>

      <div className="details-card">

        <div className="details-header">
          <div>
            <h2>{project.title}</h2>
            <span className={getStatusBadge(project.status)}>
              {project.status}
            </span>
          </div>

          {project.status === 'DRAFT' && (
            <button onClick={() => setShowModal(true)} className="primary-btn">
              Apply for Grant
            </button>
          )}
        </div>

        <div className="desc-box">
          <h5>Project Description</h5>
          <p>{project.description}</p>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <Info size={16}/>
            <span>Project ID</span>
            <strong>#{project.projectId}</strong>
          </div>

          <div className="info-card">
            <Calendar size={16}/>
            <span>Start Date</span>
            <strong>{project.startDate}</strong>
          </div>

          <div className="info-card">
            <Flag size={16}/>
            <span>End Date</span>
            <strong>{project.endDate}</strong>
          </div>
        </div>

      </div>

      {/* ✅ MODAL */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show"></div>

          <div className="modal show d-block">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content custom-modal">

                <div className="modal-header">
                  <h5>Apply for Funding</h5>
                  <button className="btn-close" onClick={()=>setShowModal(false)}></button>
                </div>

                <form onSubmit={handleApplyForGrant}>
                  <div className="modal-body">

                    <p>Request funding for <strong>{project.title}</strong></p>

                    {/* ✅ FIXED INPUT GROUP */}
                    <div className="custom-input-group">
                      <span>₹</span>
                      <input
                        type="number"
                        required
                        min="1"
                        value={requestedAmount}
                        onChange={(e)=>setRequestedAmount(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="e.g., 50000"
                      />
                    </div>

                  </div>

                  <div className="modal-footer">
                    <button type="button" onClick={()=>setShowModal(false)}>
                      Cancel
                    </button>

                    <button type="submit" disabled={isSubmitting || !requestedAmount}>
                      {isSubmitting ? 'Submitting...' : 'Submit'}
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
