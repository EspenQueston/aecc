import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { to: '/admin', icon: 'fas fa-tachometer-alt', label: 'Dashboard', end: true },
    { to: '/admin/blogs', icon: 'fas fa-blog', label: 'Blog' },
    { to: '/admin/events', icon: 'fas fa-calendar-alt', label: 'Événements' },
    { to: '/admin/resources', icon: 'fas fa-book', label: 'Ressources' },
    { to: '/admin/learning', icon: 'fab fa-telegram-plane', label: 'Apprentissage' },
    { to: '/admin/users', icon: 'fas fa-users', label: 'Utilisateurs' },
    { to: '/admin/contacts', icon: 'fas fa-envelope', label: 'Messages' },
    { to: '/admin/newsletter', icon: 'fas fa-newspaper', label: 'Newsletter' },
    { to: '/admin/settings', icon: 'fas fa-cog', label: 'Paramètres' },
  ];

  return (
    <div className="admin-wrapper">
      <aside className={`admin-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header">
          <Link to="/admin" className="admin-logo">
            <img src="/logo.png" alt="AECC" className="admin-logo-img" onError={e => e.target.style.display='none'} />
            {sidebarOpen && <span>AECC Admin</span>}
          </Link>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className={`fas fa-${sidebarOpen ? 'chevron-left' : 'chevron-right'}`}></i>
          </button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              <i className={item.icon}></i>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <Link to="/" className="sidebar-link">
            <i className="fas fa-globe"></i>
            {sidebarOpen && <span>Voir le site</span>}
          </Link>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-header-left">
            <button className="mobile-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <i className="fas fa-bars"></i>
            </button>
            <h2 className="admin-breadcrumb">Administration</h2>
          </div>
          <div className="admin-header-right">
            <div className="admin-user-info">
              <div className="admin-avatar">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <span className="admin-user-name">{user?.firstName} {user?.lastName}</span>
            </div>
            <button onClick={logout} className="btn btn-ghost btn-sm">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
