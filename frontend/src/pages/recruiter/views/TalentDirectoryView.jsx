import React from 'react';
import { Badge, Button } from 'react-bootstrap';
import { Sparkles } from 'lucide-react';
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
  onResetMatch,
  // Navigation
  onViewProfile,
}) => {
  return (
    <div className="talent-directory-view">
      {/* Top Action Bar */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
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
