import React from 'react';
import LogoIcon from '@/assets/images/logo/icon.svg';
import CandidateFilters from './CandidateFilters';
import JobMatchingPanel from './JobMatchingPanel';

/**
 * Komponen RecruiterLeftSidebar
 * Sidebar 2-kolom yang menampilkan filter kandidat dan panel Job Matching secara langsung
 */
const RecruiterLeftSidebar = ({
  user,
  stats = {},
  // Filter Props
  search = '',
  onSearchChange,
  tier = 'ALL',
  onTierChange,
  sbtOnly = false,
  onSbtOnlyChange,
  onResetFilters,
  // Job Matching Props
  jobTitle = '',
  onJobTitleChange,
  availableSkills = [],
  loadingSkills = false,
  skillsError = null,
  requiredSkills = [],
  onToggleSkill,
  onRemoveSkill,
  onResetSkills,
  matching = false,
  matchError = null,
  isMatchingActive = false,
  matchCount = 0,
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

      {/* Filter Kandidat & Job Matching Panel */}
      <CandidateFilters
        search={search}
        onSearchChange={onSearchChange}
        tier={tier}
        onTierChange={onTierChange}
        sbtOnly={sbtOnly}
        onSbtOnlyChange={onSbtOnlyChange}
        onReset={onResetFilters}
      />

      <JobMatchingPanel
        jobTitle={jobTitle}
        onJobTitleChange={onJobTitleChange}
        availableSkills={availableSkills}
        loadingSkills={loadingSkills}
        skillsError={skillsError}
        requiredSkills={requiredSkills}
        onToggleSkill={onToggleSkill}
        onRemoveSkill={onRemoveSkill}
        onResetSkills={onResetSkills}
        matching={matching}
        matchError={matchError}
        isMatchingActive={isMatchingActive}
        matchCount={matchCount}
      />
    </div>
  );
};

export default RecruiterLeftSidebar;
