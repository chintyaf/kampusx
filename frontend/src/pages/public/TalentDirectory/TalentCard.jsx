import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, BookmarkPlus, BookmarkCheck } from 'lucide-react';

const AVATAR_COLORS = [
  { bg: '#fef3c7', fg: '#92400e' },
  { bg: '#e0f2fe', fg: '#0369a1' },
  { bg: '#fce7f3', fg: '#9d174d' },
  { bg: '#ede9fe', fg: '#6d28d9' },
  { bg: '#dcfce7', fg: '#166534' }
];

const AVAILABILITY_LABEL = {
  open: 'Terbuka untuk peluang',
  internship_only: 'Hanya magang',
  not_available: 'Tidak tersedia'
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

/**
 * Kartu satu kandidat dari hasil /match.
 * Bentuk `talent`: { user_id, name, headline, bio, availability, top_skills[],
 *   cosine_similarity, skill_coverage, matched_skills[], missing_skills[] }
 */
const TalentCard = ({ talent, isShortlisted, isShortlisting, onShortlist }) => {
  const color = AVATAR_COLORS[talent.user_id % AVATAR_COLORS.length];
  const matchPercent = Math.round(talent.cosine_similarity * 100);

  return (
    <div className="talent-card">
      <div className="talent-card-banner" />
      <div className="talent-card-body">
        <div className="talent-avatar-row">
          <div
            className="talent-card-avatar"
            style={{ backgroundColor: color.bg, color: color.fg }}
          >
            {getInitials(talent.name)}
          </div>
          <div className="match-score-pill">
            <Sparkles size={12} /> {matchPercent}% Match
          </div>
        </div>

        <Link to={`/profile/${talent.user_id}`} className="talent-name-link">
          {talent.name}
        </Link>
        {talent.headline && <div className="talent-campus-major">{talent.headline}</div>}
        {talent.availability && (
          <div className="mt-1">
            <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: '11px' }}>
              {AVAILABILITY_LABEL[talent.availability] || talent.availability}
            </span>
          </div>
        )}
        {talent.bio && <p className="talent-bio-text">{talent.bio}</p>}

        {/* Skill terkuat member */}
        {talent.top_skills?.length > 0 && (
          <div className="talent-skill-pills">
            {talent.top_skills.map((s) => (
              <span key={s.skill_id} className="talent-skill-badge">
                {s.name} <span className="talent-skill-pct">{s.level}%</span>
              </span>
            ))}
          </div>
        )}

        {/* Ringkasan kecocokan */}
        <div className="talent-metrics-grid">
          <div>
            <div className="talent-metric-val">{Math.round(talent.skill_coverage)}%</div>
            <div className="talent-metric-lbl">Skill Terpenuhi</div>
          </div>
          <div>
            <div className="talent-metric-val" style={{ color: '#059669' }}>
              {talent.matched_skills.length}
            </div>
            <div className="talent-metric-lbl">Skill Cocok</div>
          </div>
          <div>
            <div className="talent-metric-val" style={{ color: talent.missing_skills.length ? '#b45309' : undefined }}>
              {talent.missing_skills.length}
            </div>
            <div className="talent-metric-lbl">Skill Kurang</div>
          </div>
        </div>

        {/* Detail skill cocok & kurang */}
        {(talent.matched_skills.length > 0 || talent.missing_skills.length > 0) && (
          <div className="talent-skill-pills mb-2">
            {talent.matched_skills.map((s) => (
              <span key={`m-${s.skill_id}`} className="talent-skill-badge">
                ✓ {s.name}
              </span>
            ))}
            {talent.missing_skills.map((s) => (
              <span key={`x-${s.skill_id}`} className="talent-skill-badge text-muted">
                {s.name} (kurang)
              </span>
            ))}
          </div>
        )}

        <div className="talent-card-actions">
          <button
            type="button"
            className="btn-verify-sbt"
            onClick={() => onShortlist(talent.user_id)}
            disabled={isShortlisted || isShortlisting}
          >
            {isShortlisted ? <BookmarkCheck size={15} /> : <BookmarkPlus size={15} />}{' '}
            {isShortlisted ? 'Tersimpan di Shortlist' : isShortlisting ? 'Menyimpan...' : 'Simpan ke Shortlist'}
          </button>
          <Link to={`/profile/${talent.user_id}`} className="btn-view-profile">
            Lihat Profil <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TalentCard;
