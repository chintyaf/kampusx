import React from 'react';
import {
  Sparkles, Layout, Settings, Award, ShieldCheck,
  ChevronRight
} from 'lucide-react';
import './Sidebar.css';

const NAV_SECTIONS = [
  {
    label: 'Organizer',
    badge: 'Dashboard',
    items: [
      { id: 'editor',    label: 'Editor Template',       Icon: Layout,     desc: 'Desain sertifikat' },
      { id: 'distribusi', label: 'Manajemen Distribusi', Icon: Settings,   desc: 'Atur & rilis' },
    ],
  },
  {
    label: 'Peserta',
    badge: 'PWA',
    items: [
      { id: 'vault', label: 'Sertifikat Vault', Icon: Award, desc: 'Koleksi sertifikat' },
    ],
  },
  {
    label: 'Publik',
    badge: 'Open',
    items: [
      { id: 'verify', label: 'Verifikasi Sertifikat', Icon: ShieldCheck, desc: 'Tanpa login' },
    ],
  },
];

const Sidebar = ({ activePage, onNavigate }) => {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Sparkles size={18} color="#fff" />
        </div>
        <div>
          <div className="logo-title">KampusX</div>
          <div className="logo-sub">Certificate Tool</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_SECTIONS.map(section => (
          <div key={section.label} className="nav-section-group">
            <div className="nav-section-header">
              <span>{section.label}</span>
              <span className="nav-section-badge">{section.badge}</span>
            </div>
            {section.items.map(({ id, label, Icon, desc }) => (
              <button
                key={id}
                className={`nav-item ${activePage === id ? 'active' : ''}`}
                onClick={() => onNavigate(id)}
              >
                <div className="nav-item-icon">
                  <Icon size={16} />
                </div>
                <div className="nav-item-text">
                  <span className="nav-item-label">{label}</span>
                  <span className="nav-item-desc">{desc}</span>
                </div>
                {activePage === id && (
                  <ChevronRight size={13} className="nav-item-arrow" />
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="sidebar-user">
        <div className="user-avatar">CA</div>
        <div className="user-info">
          <div className="user-name">Chintya A.</div>
          <div className="user-role">Organizer</div>
        </div>
        <div className="user-dot" />
      </div>
    </aside>
  );
};

export default Sidebar;
