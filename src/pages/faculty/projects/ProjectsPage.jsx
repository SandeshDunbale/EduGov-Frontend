import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Calendar, Search, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProjectAPI } from "../../../services/projectService";
import './ProjectsPage.css';
import { jwtDecode } from 'jwt-decode';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const fetchMyProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const decodedToken = jwtDecode(token);
        const facultyId = decodedToken.facultyId;

        if (!facultyId) {
          setLoading(false);
          return;
        }

        const data = await ProjectAPI.getProjectsByFaculty(facultyId);
        setProjects(data.sort((a, b) => b.projectId - a.projectId));

      } catch (error) {
        console.error("Database connection failure.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyProjects();
  }, []);

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastProject = currentPage * projectsPerPage;
  const currentProjects = filteredProjects.slice(
    indexOfLastProject - projectsPerPage,
    indexOfLastProject
  );

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  return (
    <div className="edugov-wrapper">

      {/* HEADER */}
      <div className="edugov-header-row">
        <div>
          <h2 className="edugov-title">My Research Projects</h2>
          <p className="edugov-subtitle">Academic Governance Workspace</p>
        </div>

        <div className="edugov-controls">
          <div className="edugov-search-box">
            <Search size={16} className="edugov-search-icon" />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => navigate('/faculty/projects/create')}
            className="btn-edugov-create"
          >
            <Plus size={18} /> Create
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loader-box">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : (
        <>
       
          <div className="edugov-grid">
            {currentProjects.map((project) => (
              <div key={project.projectId} className="edugov-card">

                <div className="edugov-card-body">

                  <div className="edugov-card-header">
                    <h5>{project.title}</h5>
                    {/*  FIXED: Added dynamic class based on the project status */}
                    <span className={`edugov-badge status-${(project.status || 'DRAFT').toLowerCase()}`}>
                      {project.status || 'DRAFT'}
                    </span>
                  </div>

                  <div className="edugov-card-footer mt-4">

                    <div className="edugov-date-row">
                      <Calendar size={14} />
                      <span>{project.startDate} — {project.endDate}</span>
                    </div>

                    <div className="edugov-btn-group">
                      <button
                        onClick={() => navigate(`/faculty/projects/${project.projectId}`)}
                        className="edugov-btn secondary"
                      >
                        Details <ExternalLink size={14} />
                      </button>

                      <button
                        onClick={() => navigate(`/faculty/projects/edit/${project.projectId}`)}
                        className="edugov-btn primary"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="edugov-pagination">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectsPage;