import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { ProjectAPI } from "../../../services/projectService"; // 👈 Import our service
import './ProjectForm.css'; 

const EditProjectPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams(); 
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  // Add a loading state so the form doesn't show blank inputs while fetching
  const [loading, setLoading] = useState(true);

  // 1. FETCH ACTUAL DATA ON LOAD
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const data = await ProjectAPI.getProjectById(projectId);
        
        // Populate the form with the data from the database
        setFormData({
          title: data.title || '',
          description: data.description || '',
          startDate: data.startDate || '',
          endDate: data.endDate || ''
        });
      } catch (error) {
        alert("Failed to load project details. It may have been deleted.");
        navigate('/faculty/projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. SEND UPDATES TO BACKEND ON SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send the updated formData to Spring Boot via PUT
      await ProjectAPI.updateProject(projectId, formData);
      
      alert(`Project Updated Successfully!`);
      navigate('/faculty/projects'); 
    } catch (error) {
      alert("Failed to update project. Please check your connection.");
    }
  };

  // Show a simple loading message while fetching data
  if (loading) {
    return (
      <div className="container py-5 text-center text-muted">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p>Loading project details...</p>
      </div>
    );
  }

  return (
    <div className="container py-4 form-container">
      
      <button 
        onClick={() => navigate('/faculty/projects')} 
        className="btn btn-link btn-back d-flex align-items-center gap-2 p-0 mb-4 fw-medium text-decoration-none"
      >
        <ArrowLeft size={20} />
        Back to Projects
      </button>

      <div className="card shadow-sm border-0 border-light rounded-3 overflow-hidden">
        
        <div className="card-header form-header text-white d-flex justify-content-between align-items-center p-4">
          <div>
            <h3 className="fw-bold mb-1">Edit Research Project</h3>
            <p className="text-white-50 small mb-0">Updating details for Project ID: {projectId}</p>
          </div>
          <span className="badge rounded-pill draft-badge px-3 py-2 text-uppercase fw-bold">
            Draft Mode
          </span>
        </div>

        <form onSubmit={handleSubmit} className="card-body p-4 p-md-5">
          <div className="d-flex flex-column gap-4">
            
            <div>
              <label className="form-label fw-bold text-dark mb-2">
                Project Title <span className="text-danger">*</span>
              </label>
              <input 
                type="text" 
                name="title" 
                required
                value={formData.title} 
                onChange={handleChange}
                className="form-control p-2"
              />
            </div>

            <div>
              <label className="form-label fw-bold text-dark mb-2">
                Project Description <span className="text-danger">*</span>
              </label>
              <textarea 
                name="description" 
                required 
                rows="5"
                value={formData.description} 
                onChange={handleChange}
                className="form-control p-2"
                style={{ resize: 'none' }}
              ></textarea>
            </div>

            <div className="row g-4">
              <div className="col-12 col-md-6">
                <label className="form-label fw-bold text-dark mb-2">
                  Start Date <span className="text-danger">*</span>
                </label>
                <input 
                  type="date" 
                  name="startDate" 
                  required
                  value={formData.startDate} 
                  onChange={handleChange}
                  className="form-control p-2"
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-bold text-dark mb-2">
                  End Date <span className="text-danger">*</span>
                </label>
                <input 
                  type="date" 
                  name="endDate" 
                  required
                  value={formData.endDate} 
                  onChange={handleChange} 
                  min={formData.startDate} 
                  className="form-control p-2"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-top d-flex justify-content-end gap-3">
            <button 
              type="button" 
              onClick={() => navigate('/faculty/projects')}
              className="btn btn-light text-secondary d-flex align-items-center gap-2 px-4 fw-semibold border"
            >
              <X size={18} /> Cancel
            </button>
            <button 
              type="submit"
              className="btn btn-primary-custom d-flex align-items-center gap-2 px-4 fw-semibold"
            >
              <Save size={18} /> Update Project
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditProjectPage;