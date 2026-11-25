import React from 'react';
import { Badge } from 'react-bootstrap';
import { Check, Sparkles, X, Filter } from 'lucide-react';
import { AVAILABLE_SKILLS_FOR_MATCH, SKILL_PRESETS } from '../data/talentsData';

const SkillFilterBar = ({
  selectedSkills = [],
  onToggleSkill,
  onResetSkills,
  onSelectPreset,
  totalResults = 0,
  sbtVerifiedCount = 0
}) => {
  return (
    <div className="match-simulator-box mb-4">
      <div className="match-simulator-header d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '14.5px' }}>
              ⚡ Job-Skill Match Simulator & Filter Kualifikasi
            </h6>
            <Badge bg="primary-subtle" className="text-primary border border-primary-subtle px-2 py-0-5" style={{ fontSize: '10.5px' }}>
              Cosine Similarity Engine
            </Badge>
          </div>
          <p className="small text-muted mb-0 mt-1">
            Klik skill (misal: <strong>Python</strong>) untuk memfilter kandidat relevan, menghitung skor kecocokan, dan menyorot lencana kredensial <strong>SBT On-Chain</strong>.
          </p>
        </div>

        {selectedSkills.length > 0 && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 d-flex align-items-center gap-1"
            style={{ fontSize: '11.5px' }}
            onClick={onResetSkills}
          >
            <X size={13} /> Reset Kriteria ({selectedSkills.length})
          </button>
        )}
      </div>

      {/* Preset Role Shortcut Buttons */}
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3 pt-1">
        <span className="text-muted small fw-semibold" style={{ fontSize: '11.5px' }}>
          Preset Cepat:
        </span>
        {SKILL_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className="btn btn-sm btn-light border rounded-pill px-2-5 py-0-5 text-dark"
            style={{ fontSize: '11px' }}
            onClick={() => onSelectPreset(preset.skills)}
          >
            <Sparkles size={11} className="text-primary me-1" />
            {preset.label}
          </button>
        ))}
      </div>

      {/* Available Skill Chips */}
      <div className="d-flex flex-wrap gap-1-5">
        {AVAILABLE_SKILLS_FOR_MATCH.map((skill) => {
          const isSelected = selectedSkills.includes(skill);
          return (
            <button
              key={skill}
              type="button"
              className={`match-skill-tag-btn ${isSelected ? 'selected' : ''}`}
              onClick={() => onToggleSkill(skill)}
            >
              {isSelected && <Check size={12} className="me-1" />}
              {skill}
            </button>
          );
        })}
      </div>

      {/* Dynamic Filter Status Banner */}
      {selectedSkills.length > 0 && (
        <div className="mt-3 pt-2 border-top d-flex flex-wrap align-items-center justify-content-between gap-2" style={{ fontSize: '12px' }}>
          <div className="text-muted">
            Kriteria aktif:{' '}
            {selectedSkills.map((s) => (
              <span key={s} className="badge bg-primary-subtle text-primary border border-primary-subtle me-1">
                {s}
              </span>
            ))}
          </div>
          <div className="fw-semibold text-dark">
            Ditemukan: <span className="text-primary">{totalResults}</span> talenta{' '}
            <span className="text-success">({sbtVerifiedCount} terverifikasi SBT On-Chain)</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillFilterBar;
