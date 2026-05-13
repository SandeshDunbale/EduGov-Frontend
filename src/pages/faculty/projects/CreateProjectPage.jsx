import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { ProjectAPI } from "../../../services/projectService";
import './ProjectForm.css'; 
import { jwtDecode } from 'jwt-decode';

const CreateProjectPage = () => {
  const navigate = useNavigate();
  
  // State to hold our form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission with secure JWT checking
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 1. Grab the token from Local Storage
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert("Your session has expired. Please log in again.");
        return;
      }

      // 2. Decode the token to find out who is making this request
      const decodedToken = jwtDecode(token);
      const facultyId = decodedToken.facultyId;

      // 3. Safety check: Block students or unauthorized users
      if (!facultyId) {
        alert("Action Denied: Only verified Faculty members can create projects.");
        return;
      }
      
      console.log("Sending data to Spring Boot for Faculty ID:", facultyId);
      
      // ✅ FIXED: Changed to ProjectAPI (Capital P) and swapped arguments to (facultyId, formData)
      // This ensures the ID goes into the URL and the Data goes into the Body.
      const response = await ProjectAPI.createProject(facultyId, formData);
      
      console.log("Success! Backend responded with:", response);
      alert("Project Created Successfully!");
      
      // Navigate back to the grid
      navigate('/faculty/projects');
      
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Failed to create project. Please check your connection or server.");
    }
  };

  return (
    <div className="container py-4 form-container">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/faculty/projects')} 
        className="btn btn-link btn-back d-flex align-items-center gap-2 p-0 mb-4 fw-medium text-decoration-none"
      >
        <ArrowLeft size={20} />
        Back to Projects
      </button>

      {/* Form Card */}
      <div className="card shadow-sm border-0 border-light rounded-3 overflow-hidden">
        
        {/* Header */}
        <div className="card-header form-header text-white p-4">
          <h3 className="fw-bold mb-1">Create New Research Project</h3>
          <p className="text-white-50 small mb-0">Draft a new proposal. You can update these details later.</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="card-body p-4 p-md-5">
          
          <div className="d-flex flex-column gap-4">
            {/* Title Input */}
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
                placeholder="e.g., AI in Autonomous Drones"
                className="form-control p-2"
              />
            </div>

            {/* Description Input */}
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
                placeholder="Provide a detailed overview of the research goals, methodologies, and expected outcomes..."
                className="form-control p-2"
                style={{ resize: 'none' }}
              ></textarea>
            </div>

            {/* Dates Grid */}
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
                  // HTML5 validation: End date can't be before start date!
                  min={formData.startDate} 
                  className="form-control p-2"
                />
              </div>
            </div>
          </div>

          {/* Form Footer / Action Buttons */}
          <div className="mt-5 pt-4 border-top d-flex justify-content-end gap-3">
            <button 
              type="button"
              onClick={() => navigate('/faculty/projects')}
              className="btn btn-light text-secondary d-flex align-items-center gap-2 px-4 fw-semibold border"
            >
              <X size={18} />
              Cancel
            </button>
            <button 
              type="submit"
              className="btn btn-primary-custom d-flex align-items-center gap-2 px-4 fw-semibold"
            >
              <Save size={18} />
              Save Project Draft
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateProjectPage;