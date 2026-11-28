import React from 'react';
import { Users, Sparkles, ShieldCheck } from 'lucide-react';
import LogoIcon from '@/assets/images/logo/icon.svg';
import CandidateFilters from './CandidateFilters';

/**
 * Komponen RecruiterLeftSidebar
 * Sidebar 2-kolom yang ringkas: navigasi mode (Direktori vs Job Matching) dan filter pencarian
 */
const RecruiterLeftSidebar = ({
  user,
  activeMode = 'directory', // 'directory' | 'matching'
  onModeChange,
  stats = {},
  // Filter Props
  search = '',
  onSearchChange,
  tier = 'ALL',
  onTierChange,
  sbtOnly = false,
  onSbtOnlyChange,
  onResetFilters,
}) => {
  const userName = user?.name || 'Tim Rekruter';
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'TR';

  return (
    <div className="recruiter-left-col">
      {/* Compact Recruiter Profile Badge (No giant banner) */}
      <div className="clean-card mb-3">
        <div className="recruiter-user-box">
          <div className="recruiter-avatar-circle">
            {initials}
          </div>
          <div className="overflow-hidden">
            <div className="recruiter-user-name text-truncate">{userName}</div>
            <div className="recruiter-user-role d-flex align-items-center gap-1.5 mt-0.5">
              <img
                src={LogoIcon}
                alt="KampusX"
                style={{ width: '13px', height: '13px', flexShrink: 0 }}
              />
              <span>Portal Rekruter KampusX</span>
            </div>
          </div>
        </div>

        {/* Real Stats Only (No hardcoded partners or fake match averages) */}
        <div className="p-3 bg-light d-flex justify-content-between align-items-center small">
          <div>
            <div className="text-muted" style={{ fontSize: '11px' }}>Total Talenta</div>
            <strong className="text-dark">{stats.total_candidates || 0} Mahasiswa</strong>
          </div>
          <div className="text-end">
            <div className="text-muted" style={{ fontSize: '11px' }}>Kredensial Terverifikasi</div>
            <strong className="text-success">{stats.total_verified_credentials || 0} Terbit</strong>
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="clean-card p-2 mb-3">
        <div className="fw-bold text-dark px-3 py-1.5 small text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.04em' }}>
          Navigasi Talenta
        </div>

        <button
          type="button"
          className={`nav-tab-btn ${activeMode === 'directory' ? 'active' : ''}`}
          onClick={() => onModeChange && onModeChange('directory')}
        >
          <Users size={15} />
          <span>Direktori Talenta</span>
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${activeMode === 'matching' ? 'active' : ''}`}
          onClick={() => onModeChange && onModeChange('matching')}
        >
          <Sparkles size={15} />
          <span>Job Matching Engine</span>
        </button>
      </div>

      {/* Filter Kandidat (Active when in directory view) */}
      <CandidateFilters
        search={search}
        onSearchChange={onSearchChange}
        tier={tier}
        onTierChange={onTierChange}
        sbtOnly={sbtOnly}
        onSbtOnlyChange={onSbtOnlyChange}
        onReset={onResetFilters}
      />
    </div>
  );
};

export default RecruiterLeftSidebar;
