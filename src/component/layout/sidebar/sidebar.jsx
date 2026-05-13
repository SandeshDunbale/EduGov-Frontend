import React from 'react';
import { NavLink } from 'react-router-dom';
import './sidebar.css'; 
import { 
  LayoutDashboard, User, BookOpen, Library, BarChart, 
  FolderGit2, Coins, Building2, Users, BookMarked, 
  CheckSquare, FileText, Activity, Database, PlusSquare, Clock, Stamp
} from 'lucide-react';

const sidebarConfig = {
  STUDENT: [
    { title: 'Dashboard', path: '/dashboard/student', icon: LayoutDashboard },
    { title: 'Profile', path: '/student/profile', icon: User },
    { title: 'Programs', path: '/student/programs', icon: BookOpen },
    { title: 'Resources', path: '/student/resources', icon: Library },
    { title: 'Analytics', path: '/student/analytics', icon: BarChart },
  ],
  FACULTY: [
    { title: 'Dashboard', path: '/dashboard/faculty', icon: LayoutDashboard },
    { title: 'Profile', path: '/faculty/profile', icon: User },
    { title: 'Assigned Courses', path: '/faculty/courses', icon: BookOpen },
    { title: 'Projects', path: '/faculty/projects', icon: FolderGit2 },
    { title: 'Grants', path: '/faculty/grants', icon: Coins },
    { title: 'Infrastructures', path: '/faculty/infrastructure', icon: Building2 },
  ],
  UNIV_ADMIN: [
    { title: 'Dashboard', path: '/dashboard/admin', icon: LayoutDashboard },
    // 📍 This is the only change: matching your App.jsx route exactly
    { title: 'Users', path: '/admin/user-management', icon: Users }, 
    { title: 'Programs', path: '/admin/programs/create', icon: BookMarked },
    { title: 'Courses', path: '/admin/courses/create', icon: BookOpen },
    { title: 'Enrollments', path: '/admin/enrollments/approve', icon: CheckSquare },
    { title: 'Reports', path: '/admin/reports', icon: FileText },
  ],
  PROG_MANAGER: [
    { title: 'Dashboard', path: '/dashboard/manager', icon: LayoutDashboard },
    { title: 'Approve Grants', path: '/manager/grants/approve', icon: Coins },
    { title: 'Requests', path: '/manager/requests', icon: FileText },
    { title: 'Manage Resources', path: '/manager/resources', icon: Library },
    { title: 'Manage Infrastructure', path: '/manager/infrastructure', icon: Building2 }
  ],
  COMPLIANCE_OFFICER: [
    { title: 'Dashboard', path: '/dashboard/compliance', icon: LayoutDashboard },
    { title: 'Run System Scan', path: '/compliance/scan', icon: Activity },
    { title: 'Compliance Records', path: '/compliance/records', icon: Database },
    { title: 'Manual Entry', path: '/compliance/entry', icon: PlusSquare },
  ],
  GOVT_AUDITOR: [
    { title: 'Dashboard', path: '/dashboard/auditor', icon: LayoutDashboard },
    { title: 'Pending Audits', path: '/auditor/pending', icon: Clock },
    { title: 'Submit Approvals', path: '/auditor/approvals', icon: Stamp },
  ],
};

const Sidebar = ({ role = 'STUDENT', user }) => {
  const cleanRole = role.replace('ROLE_', '');
  const navLinks = sidebarConfig[cleanRole] || sidebarConfig['STUDENT'];

  const getAvatarInitials = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <aside className="edugov-sidebar">
      <div className="sidebar-header">
        <h2 className="module-title">Governance Module</h2>
        <div className="status-badge">
          <span className="status-indicator"></span>
          <span className="module-status">{cleanRole.replace('_', ' ')} Workspace</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        <div className="menu-group">
          <p className="group-label">Navigation</p>
          {navLinks.map((link, index) => {
            const IconComponent = link.icon;
            return (
              <NavLink
                key={index}
                to={link.path}
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

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">{getAvatarInitials()}</div>
          <div className="user-info">
            <span className="user-name">{user?.name || user?.email || 'System User'}</span>
            <span className="user-role">{cleanRole.replace('_', ' ')}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;