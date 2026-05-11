// src/component/layout/sidebar/sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './sidebar.css'; // 👈 Re-importing your stylesheet!
import { 
  LayoutDashboard, User, BookOpen, Library, BarChart, 
  FolderGit2, Coins, Building2, Users, BookMarked, 
  CheckSquare, FileText, ShieldAlert, Stamp,
  Activity, Database, PlusSquare, Clock
} from 'lucide-react';

// 1. Data-Driven Configuration
const sidebarConfig = {
  STUDENT: [
    { title: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { title: 'Profile', path: '/student/profile', icon: User },
    { title: 'Programs', path: '/student/programs', icon: BookOpen },
    { title: 'Resources', path: '/student/resources', icon: Library },
    { title: 'Request Resource', path: '/student/request', icon: FileText },
    { title: 'Analytics', path: '/student/analytics', icon: BarChart },
  ],
  FACULTY: [
    { title: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
    { title: 'Profile', path: '/faculty/profile', icon: User },
    { title: 'Assigned Courses', path: '/faculty/courses', icon: BookOpen },
    { title: 'Projects', path: '/faculty/projects', icon: FolderGit2 },
    { title: 'Grants', path: '/faculty/grants', icon: Coins },
    { title: 'Infrastructures', path: '/faculty/infrastructure', icon: Building2 },
    { title: 'Request Infrastructure', path: '/faculty/request', icon: FileText },
  ],
  UNIV_ADMIN: [
    { title: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { title: 'Users', path: '/admin/users/approve', icon: Users },
    { title: 'Programs', path: '/admin/programs/create', icon: BookMarked },
    { title: 'Courses', path: '/admin/courses/create', icon: BookOpen },
    { title: 'Enrollments', path: '/admin/enrollments/approve', icon: CheckSquare },
    { title: 'Reports', path: '/admin/reports', icon: FileText },
  ],
  PROG_MANAGER: [
    { title: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
    { title: 'Approve Grants', path: '/manager/grants/approve', icon: Coins },
    { title: 'Requests', path: '/manager/requests', icon: FileText },
    { title: 'Manage Resources', path: '/manager/resources', icon: Library },
    { title: 'Manage Infrastructure', path: '/manager/infrastructure', icon: Building2 }
  ],
  COMPLIANCE_OFFICER: [
    { title: 'Dashboard', path: '/compliance/dashboard', icon: LayoutDashboard },
    { title: 'Run System Scan', path: '/compliance/scan', icon: Activity },
    { title: 'Compliance Records', path: '/compliance/records', icon: Database },
    { title: 'Manual Entry', path: '/compliance/entry', icon: PlusSquare },
  ],
  GOVT_AUDITOR: [
    { title: 'Dashboard', path: '/auditor/dashboard', icon: LayoutDashboard },
    { title: 'Pending Audits', path: '/auditor/pending', icon: Clock },
    { title: 'Submit Approvals', path: '/auditor/approvals', icon: Stamp },
  ],
};

const Sidebar = ({ role = 'STUDENT' }) => {
  const navLinks = sidebarConfig[role] || [];

  return (
    <aside className="edugov-sidebar">
      
      {/* Header Area */}
      <div className="sidebar-header">
        <h2 className="module-title">Governance Module</h2>
        <div className="status-badge">
          <span className="status-indicator"></span>
          <span className="module-status">{role.replace('_', ' ')} Workspace</span>
        </div>
      </div>

      {/* Dynamic Navigation Links */}
      <nav className="sidebar-menu">
        <div className="menu-group">
          <p className="group-label">Navigation</p>
          
          {navLinks.map((link, index) => {
            const IconComponent = link.icon;
            
            return (
              <NavLink
                key={index}
                to={link.path}
                // React Router provides isActive. We apply your custom 'active' class if true.
                className={({ isActive }) => 
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
              >
                <IconComponent className="link-icon" />
                {link.title}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">SD</div>
          <div className="user-info">
            <span className="user-name">Sandesh Dunbale</span>
            <span className="user-role">{role.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;