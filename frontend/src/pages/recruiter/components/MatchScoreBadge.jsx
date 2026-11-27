import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Komponen MatchScoreBadge
 * Menampilkan persentase kecocokan kualifikasi (Cosine Similarity)
 */
const MatchScoreBadge = ({ score, verdict, size = 'md' }) => {
  if (score === null || score === undefined) return null;

  const numScore = parseFloat(score);
  let colorClass = 'match-score-low';
  if (numScore >= 75) {
    colorClass = 'match-score-high';
  } else if (numScore >= 50) {
    colorClass = 'match-score-medium';
  }

  const paddingStyle = size === 'sm' ? { padding: '2px 8px', fontSize: '11px' } : {};

  return (
    <div className="d-inline-flex flex-column align-items-end">
      <div className={`match-score-pill ${colorClass}`} style={paddingStyle}>
        <Sparkles size={size === 'sm' ? 11 : 13} />
        <span>{numScore}% Match</span>
      </div>
      {verdict && (
        <span className="text-muted mt-1" style={{ fontSize: '10.5px' }}>
          {verdict}
        </span>
      )}
    </div>
  );
};

export default MatchScoreBadge;
