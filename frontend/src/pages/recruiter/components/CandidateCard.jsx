import React from 'react';
import { Badge, Button } from 'react-bootstrap';
import { ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import userPlaceholder from '@/assets/images/user-placeholder.avif';
import MatchScoreBadge from './MatchScoreBadge';

/**
 * Komponen CandidateCard
 * Kartu profil ringkas, informatif, dan bersih untuk direktori talenta KampusX
 */
const CandidateCard = ({
  candidate,
  activeSkills = [],
  onViewProfile,
}) => {
  if (!candidate) return null;

  const initials = candidate.name
    ? candidate.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'KM';

  const sbtCount = candidate.verified_sbt_count || (candidate.has_sbt ? 1 : 0);

  return (
    <div className="candidate-compact-card">
      <div>
        {/* Header: Avatar, Name, Headline, and Match Score (if active) */}
        <div className="candidate-compact-header">
          <div className="candidate-compact-avatar overflow-hidden">
            {candidate.avatar ? (
              <img
                src={candidate.avatar}
                alt={candidate.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = userPlaceholder;
                }}
              />
            ) : (
              initials
            )}
          </div>

          <div className="flex-grow-1 overflow-hidden">
            <div className="d-flex align-items-center justify-content-between gap-2">
              <div
                role="button"
                tabIndex={0}
                className="candidate-compact-name text-truncate"
                onClick={() => onViewProfile && onViewProfile(candidate.id)}
                onKeyDown={(e) => e.key === 'Enter' && onViewProfile && onViewProfile(candidate.id)}
              >
                {candidate.name}
              </div>

              {/* Match score is ONLY displayed when matching was actively executed */}
              {candidate.match_score_pct !== undefined && (
                <MatchScoreBadge score={candidate.match_score_pct} size="sm" />
              )}
            </div>

            <div className="candidate-compact-campus text-truncate">
              {candidate.campus || 'Universitas Indonesia'} • {candidate.major || 'Teknik Informatika'}
            </div>
          </div>
        </div>

        {/* Bio / Summary */}
        <p className="candidate-compact-bio">
          {candidate.bio || 'Mahasiswa berprestasi dengan rekam jejak capaian belajar dan portofolio terverifikasi.'}
        </p>

        {/* Relevant Skills */}
        <div className="candidate-compact-skills">
          {Array.isArray(candidate.skills) && candidate.skills.slice(0, 5).map((skill, idx) => {
            const skillName = typeof skill === 'string' ? skill : skill.name;
            const isMatched = activeSkills.some(
              (q) => q.toLowerCase() === skillName?.toLowerCase()
            );

            return (
              <span
                key={idx}
                className={`compact-skill-badge ${isMatched ? 'matched' : ''}`}
              >
                {skillName}
              </span>
            );
          })}
        </div>
      </div>

      {/* Footer: Credential Count & View Portfolio Button */}
      <div className="candidate-compact-footer">
        <div>
          {sbtCount > 0 ? (
            <span className="credential-tag">
              <ShieldCheck size={12} /> {sbtCount} Kredensial Terverifikasi
            </span>
          ) : (
            <span className="text-muted" style={{ fontSize: '11px' }}>
              Tier {candidate.tier || 'Silver'} • {candidate.points || 0} Pts
            </span>
          )}
        </div>

        <Button
          variant="outline-primary"
          size="sm"
          className="rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1"
          style={{ fontSize: '12px' }}
          onClick={() => onViewProfile && onViewProfile(candidate)}
        >
          Lihat Portofolio <ArrowRight size={13} />
        </Button>
      </div>
    </div>
  );
};

export default CandidateCard;
