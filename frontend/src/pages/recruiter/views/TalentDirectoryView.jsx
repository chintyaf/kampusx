import React from 'react';
import { Badge, Button } from 'react-bootstrap';
import { Sparkles, SlidersHorizontal, Users } from 'lucide-react';
import JobMatchingPanel from '../components/JobMatchingPanel';
import CandidateList from '../components/CandidateList';

/**
 * View TalentDirectoryView
 * Halaman utama penelusuran talenta mahasiswa dengan candidate grid dan mode Job Matching
 */
const TalentDirectoryView = ({
  candidates = [],
  loading = false,
  error = null,
  onRetry,
  totalResults = 0,
  activeSkills = [],
  // Matching Props
  isMatchingActive = false,
  showMatchingPanel = false,
  onToggleMatchingPanel,
  jobTitle = '',
  onJobTitleChange,
  requiredSkills = [],
  onAddSkill,
  onRemoveSkill,
  onSelectPreset,
  onResetSkills,
  onRunMatch,
  matching = false,
  matchError = null,
  isCriteriaDirty = false,
  onResetMatch,
  // Navigation
  onViewProfile,
}) => {
  return (
    <div className="talent-directory-view">
      {/* Top Action Bar */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <Button
            variant={showMatchingPanel ? 'primary' : 'outline-primary'}
            size="sm"
            className="rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm"
            style={{ fontSize: '12.5px' }}
            onClick={onToggleMatchingPanel}
          >
            <Sparkles size={14} />
            <span>{showMatchingPanel ? 'Sembunyikan Panel Kriteria' : 'Buka Kriteria Job Matching'}</span>
          </Button>

          {isMatchingActive && (
            <Badge bg="success" className="px-2.5 py-1.5 rounded-pill d-inline-flex align-items-center gap-1">
              <Sparkles size={12} /> Hasil Job Matching Terperingkat ({candidates.length})
            </Badge>
          )}
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small" style={{ fontSize: '12px' }}>
            Menampilkan <strong className="text-dark">{candidates.length}</strong> dari {totalResults} talenta
          </span>

          {isMatchingActive && onResetMatch && (
            <Button
              variant="light"
              size="sm"
              className="border rounded-pill px-2.5 py-0.5 text-muted"
              style={{ fontSize: '11.5px' }}
              onClick={onResetMatch}
            >
              Reset Hasil Matching
            </Button>
          )}
        </div>
      </div>

      {/* Collapsible Job Matching Panel */}
      {showMatchingPanel && (
        <JobMatchingPanel
          jobTitle={jobTitle}
          onJobTitleChange={onJobTitleChange}
          requiredSkills={requiredSkills}
          onAddSkill={onAddSkill}
          onRemoveSkill={onRemoveSkill}
          onSelectPreset={onSelectPreset}
          onResetSkills={onResetSkills}
          onRunMatch={onRunMatch}
          matching={matching}
          matchError={matchError}
          isCriteriaDirty={isCriteriaDirty}
          isMatchingActive={isMatchingActive}
          onClose={onToggleMatchingPanel}
        />
      )}

      {/* Candidate Grid */}
      <CandidateList
        candidates={candidates}
        loading={loading}
        error={error}
        onRetry={onRetry}
        activeSkills={activeSkills}
        onViewProfile={onViewProfile}
        isMatchingActive={isMatchingActive}
        onResetMatch={onResetMatch}
      />
    </div>
  );
};

export default TalentDirectoryView;
