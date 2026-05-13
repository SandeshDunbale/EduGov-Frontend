import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Calendar, FileText, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProjectAPI } from "../../../services/projectService";
import './ProjectsPage.css'; 
import { jwtDecode } from 'jwt-decode'; 

const ProjectsPage = () => {
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6; 

  // Reset to page 1 whenever the user types in the search bar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const fetchMyProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.error("No token found. User might not be logged in.");
            return;
        }

        const decodedToken = jwtDecode(token);
        const facultyId = decodedToken.facultyId;

        if (!facultyId) {
            console.error("This user does not have a Faculty ID!");
            setLoading(false);
            return;
        }

        const data = await ProjectAPI.getProjectsByFaculty(facultyId);
        const sortedProjects = data.sort((a, b) => b.projectId - a.projectId);
        
        setProjects(sortedProjects); 
      } catch (error) {
        console.error("Failed to load projects from backend");
      } finally {
        setLoading(false);
      }
    };

    fetchMyProjects();
  }, []);

  const getStatusBadge = (status) => {
    if (!status) return 'bg-light text-dark';
    
    switch(status) {
      case 'DRAFT': return 'badge-draft';
      case 'UNDER_REVIEW': return 'badge-review';
      case 'COMPLETED': return 'badge-completed';
      default: return 'bg-light text-dark';
    }
  };

  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Math
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container-fluid py-4">
      
      {/* HEADER SECTION */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 bg-white p-4 rounded shadow-sm border gap-3">
        <div>
          <h2 className="fw-bold edugov-text-navy mb-1">My Research Projects</h2>
          <p className="text-muted mb-0 small">Manage your academic research, updates, and proposals.</p>
        </div>
        
        <div className="d-flex align-items-center gap-3">
          <div className="input-group shadow-sm" style={{ maxWidth: '300px' }}>
            <span className="input-group-text bg-light border-end-0 text-muted">
              <Search size={16} />
            </span>
            <input 
              type="text" 
              className="form-control border-start-0 bg-light" 
              placeholder="Search by title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            onClick={() => navigate('/faculty/projects/create')}
            className="btn edugov-btn-navy d-flex align-items-center gap-2 px-4 shadow-sm"
          >
            <Plus size={18} />
            <span className="d-none d-md-inline">Create New</span>
          </button>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p>Loading your projects from the database...</p>
        </div>
      ) : projects.length === 0 ? (
        
        /* EMPTY STATE */
        <div className="text-center py-5 bg-white rounded shadow-sm border">
          <p className="text-muted mb-3">You don't have any research projects yet.</p>
          <button 
            onClick={() => navigate('/faculty/projects/create')}
            className="btn btn-outline-primary"
          >
            Create your first project
          </button>
        </div>

      ) : filteredProjects.length === 0 ? (
        
        /* EMPTY SEARCH STATE */
        <div className="text-center py-5 bg-white rounded shadow-sm border">
          <Search size={40} className="text-muted mb-3 opacity-50" />
          <h5 className="fw-bold text-dark">No projects found</h5>
          <p className="text-muted mb-0">We couldn't find any projects matching "{searchTerm}".</p>
          <button 
            onClick={() => setSearchTerm('')}
            className="btn btn-link mt-2 text-decoration-none"
          >
            Clear Search
          </button>
        </div>

      ) : (
        <>
          {/* PROJECTS GRID SECTION */}
          <div className="row g-4">
            {currentProjects.map((project) => (
              <div key={project.projectId} className="col-12 col-md-6 col-lg-4">
                
                <div className="card h-100 shadow-sm project-card">
                  <div className="card-body d-flex flex-column">
                    
                    {/* 🟢 Added flex-grow-1 here to push the buttons to the bottom, since we removed the description text */}
                    <div className="d-flex justify-content-between align-items-start mb-3 flex-grow-1">
                      <h5 className="card-title fw-bold text-dark mb-0 pe-2">
                        {project.title}
                      </h5>
                      <span className={`badge rounded-pill ${getStatusBadge(project.status)}`}>
                        {project.status ? project.status.replace('_', ' ') : 'N/A'}
                      </span>
                    </div>

                    {/* ❌ Removed the project.description paragraph tag completely from here */}

                    <div className="mt-4 pt-3 border-top">
                      <div className="d-flex align-items-center gap-2 text-muted small fw-medium mb-3">
                        <Calendar size={14} />
                        <span>{project.startDate} &mdash; {project.endDate}</span>
                      </div>
                      
                      <div className="d-flex gap-2">
                        <button 
                          onClick={() => navigate(`/faculty/projects/${project.projectId}`)}
                          className="btn btn-light border flex-grow-1 d-flex justify-content-center align-items-center gap-2 btn-sm fw-semibold text-secondary"
                        >
                          <FileText size={14} /> Details
                        </button>
                        <button 
                          onClick={() => navigate(`/faculty/projects/edit/${project.projectId}`)}
                          className="btn btn-outline-primary flex-grow-1 d-flex justify-content-center align-items-center gap-2 btn-sm fw-semibold"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* BOOTSTRAP PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-5">
              <nav aria-label="Project page navigation">
                <ul className="pagination shadow-sm">
                  
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>

                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => paginate(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    );
                  })}

                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                  
                </ul>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectsPage;