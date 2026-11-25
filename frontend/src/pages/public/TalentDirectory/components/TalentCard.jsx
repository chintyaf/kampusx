import React from 'react';
import { Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Mail,
  Award,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { checkCandidateHasSkillSbt } from '../utils/cosineSimilarity';

const TalentCard = ({
  talent,
  activeSkills = [],
  onOpenVerifyModal,
  onOpenContactModal
}) => {
  // Cek apakah ada SBT yang cocok dengan skill yang sedang dicari
  const matchingSbt = activeSkills.length > 0
    ? activeSkills.map((s) => checkCandidateHasSkillSbt(talent, s)).find(Boolean)
    : talent.latestSbt;

  return (
    <div className="talent-card">
      <div className="talent-card-banner" />
      <div className="talent-card-body">
        {/* Avatar & Match Score */}
        <div className="talent-avatar-row">
          <div
            className="talent-card-avatar"
            style={{
              backgroundColor: talent.avatarBg,
              color: talent.avatarColor
            }}
          >
            {talent.initials}
          </div>

          <div className="d-flex align-items-center gap-2">
            {talent.matchScore !== null && talent.matchScore > 0 ? (
              <div className="match-score-pill">
                <Sparkles size={12} /> {talent.matchScore}% Match
              </div>
            ) : (
              <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: '11px' }}>
                {talent.tier} Tier
              </span>
            )}

            {matchingSbt && (
              <Badge bg="success-subtle" className="text-success border border-success-subtle px-2 py-1 d-flex align-items-center gap-1" style={{ fontSize: '11px' }}>
                <ShieldCheck size={13} /> SBT Verified
              </Badge>
            )}
          </div>
        </div>

        {/* Name & Headline */}
        <Link to={`/profile/${talent.id}`} className="talent-name-link">
          {talent.name}
        </Link>
        <div className="talent-campus-major">
          {talent.campus} • {talent.major}
        </div>
        <p className="talent-bio-text">{talent.bio}</p>

        {/* Highlighted SBT Credential Badge if matched */}
        {matchingSbt && (
          <div className="p-2 mb-3 rounded-3 bg-success-subtle border border-success-subtle d-flex align-items-center justify-content-between gap-2">
            <div className="d-flex align-items-center gap-2 overflow-hidden">
              <Award size={16} className="text-success flex-shrink-0" />
              <span className="small text-success fw-bold text-truncate" style={{ fontSize: '12px' }}>
                {matchingSbt.title}
              </span>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-link text-success p-0 fw-bold text-decoration-none flex-shrink-0"
              style={{ fontSize: '11px' }}
              onClick={() => onOpenVerifyModal(talent)}
            >
              Cek On-Chain <ExternalLink size={11} className="ms-0.5" />
            </button>
          </div>
        )}

        {/* Skills Matrix with highlighting for queried skills */}
        <div className="talent-skill-pills">
          {talent.skills.map((s, idx) => {
            const isQueried = activeSkills.some(
              (q) => q.toLowerCase() === s.name.toLowerCase()
            );
            const hasSbtForThisSkill = checkCandidateHasSkillSbt(talent, s.name);

            return (
              <span
                key={idx}
                className={`talent-skill-badge ${isQueried ? 'border-primary text-primary fw-bold bg-primary-subtle' : ''}`}
                style={isQueried ? { borderColor: '#4f46e5' } : {}}
              >
                {hasSbtForThisSkill && isQueried && (
                  <CheckCircle2 size={12} className="text-success me-1" />
                )}
                {s.name} <span className="talent-skill-pct">{s.level}%</span>
              </span>
            );
          })}
        </div>

        {/* Metrics Grid */}
        <div className="talent-metrics-grid">
          <div>
            <div className="talent-metric-val">{talent.modulesCompleted}</div>
            <div className="talent-metric-lbl">Modul SRL</div>
          </div>
          <div>
            <div className="talent-metric-val">{talent.eventsAttended}</div>
            <div className="talent-metric-lbl">Event Dihadiri</div>
          </div>
          <div>
            <div className="talent-metric-val" style={{ color: '#059669' }}>
              {talent.sbtCount} SBT
            </div>
            <div className="talent-metric-lbl">Polygon Ledger</div>
          </div>
        </div>

        {/* Actions */}
        <div className="talent-card-actions">
          <button
            type="button"
            className="btn-verify-sbt"
            onClick={() => onOpenVerifyModal(talent)}
            title="Verifikasi kredensial on-chain di Polygon Amoy"
          >
            <ShieldCheck size={15} /> Verify SBT On-Chain
          </button>

          <button
            type="button"
            className="btn btn-outline-primary btn-sm rounded-pill fw-semibold d-flex align-items-center justify-content-center gap-1 py-2 px-3"
            style={{ fontSize: '12.5px' }}
            onClick={() => onOpenContactModal(talent)}
            title="Kirim undangan wawancara atau tawaran kerja resmi ke email mahasiswa"
          >
            <Mail size={14} /> Hubungi / Tawari
          </button>

          <Link to={`/profile/${talent.id}`} className="btn-view-profile">
            Lihat Profil <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TalentCard;
