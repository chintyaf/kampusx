import React, { useState } from 'react';
import { Form, Button, Badge, Spinner } from 'react-bootstrap';
import { ArrowRight, Plus, Sparkles, RefreshCw } from 'lucide-react';

const PRESET_SKILLS = [
  'Laravel',
  'React',
  'MySQL',
  'Python',
  'Machine Learning',
  'Docker',
  'TypeScript',
  'Solidity',
  'Node.js',
  'Data Analysis',
];

/**
 * Komponen JobCriteriaForm
 * Form input kualifikasi lowongan kerja & pemicu kalkulasi Cosine Similarity
 */
const JobCriteriaForm = ({
  jobTitle,
  onJobTitleChange,
  requiredSkills = [],
  onAddSkill,
  onRemoveSkill,
  onSelectPreset,
  onResetSkills,
  onRunMatch,
  matching = false,
}) => {
  const [skillInput, setSkillInput] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !requiredSkills.includes(skillInput.trim())) {
      onAddSkill(skillInput.trim());
      setSkillInput('');
    }
  };

  return (
    <div className="job-criteria-box mb-4">
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div>
          <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-1-5">
            <Sparkles size={16} className="text-primary" /> Kriteria Lowongan & Job Matching Engine
          </h6>
          <span className="text-muted small" style={{ fontSize: '12px' }}>
            Masukkan keahlian yang dibutuhkan untuk memeringkat kandidat menggunakan Cosine Similarity.
          </span>
        </div>
        {requiredSkills.length > 0 && (
          <button
            type="button"
            className="btn btn-link btn-sm text-decoration-none text-muted p-0"
            style={{ fontSize: '11.5px' }}
            onClick={onResetSkills}
          >
            Reset Kriteria
          </button>
        )}
      </div>

      {/* Job Title Input */}
      <div className="mb-3">
        <Form.Label className="small fw-semibold text-dark mb-1">
          Posisi / Judul Pekerjaan (Opsional):
        </Form.Label>
        <Form.Control
          type="text"
          placeholder="Misal: Fullstack Engineer, Data Scientist, UI/UX Designer..."
          value={jobTitle}
          onChange={(e) => onJobTitleChange(e.target.value)}
          className="rounded-pill"
          style={{ fontSize: '13px' }}
        />
      </div>

      {/* Selected Required Skills */}
      <div className="mb-2">
        <Form.Label className="small fw-semibold text-dark mb-1">
          Keahlian Yang Dibutuhkan ({requiredSkills.length}):
        </Form.Label>
        <div className="d-flex flex-wrap gap-1-5 mb-2">
          {requiredSkills.length === 0 ? (
            <span className="text-muted small fst-italic">
              Pilih skill preset di bawah atau ketik skill baru.
            </span>
          ) : (
            requiredSkills.map((skill, idx) => (
              <Badge
                key={idx}
                bg="primary"
                className="px-2-5 py-1-5 rounded-pill d-inline-flex align-items-center gap-1 fs-6 fw-semibold"
                style={{ fontSize: '12px' }}
              >
                <span>{skill}</span>
                <span
                  role="button"
                  tabIndex={0}
                  className="ms-1 cursor-pointer fw-bold opacity-75"
                  onClick={() => onRemoveSkill(skill)}
                  onKeyDown={(e) => e.key === 'Enter' && onRemoveSkill(skill)}
                >
                  ×
                </span>
              </Badge>
            ))
          )}
        </div>
      </div>

      {/* Add Skill Input */}
      <Form onSubmit={handleFormSubmit} className="d-flex gap-2 mb-3">
        <Form.Control
          type="text"
          placeholder="Tambah skill lain (tekan Enter)..."
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          className="rounded-pill"
          style={{ fontSize: '13px' }}
        />
        <Button
          type="submit"
          variant="light"
          className="border rounded-pill px-3 d-inline-flex align-items-center gap-1"
          style={{ fontSize: '12.5px' }}
          disabled={!skillInput.trim()}
        >
          <Plus size={14} /> Tambah
        </Button>
      </Form>

      {/* Preset Skills */}
      <div className="mb-3">
        <div className="small text-muted mb-1-5" style={{ fontSize: '11px', fontWeight: 600 }}>
          REKOMENDASI SKILL POPULER:
        </div>
        <div className="d-flex flex-wrap gap-1">
          {PRESET_SKILLS.map((preset) => {
            const isSelected = requiredSkills.includes(preset);
            return (
              <button
                key={preset}
                type="button"
                className={`preset-skill-chip ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectPreset(preset)}
              >
                {isSelected ? '✓ ' : '+ '}
                {preset}
              </button>
            );
          })}
        </div>
      </div>

      {/* Trigger Matching Button */}
      <Button
        variant="primary"
        className="w-100 rounded-pill py-2 fw-bold d-inline-flex align-items-center justify-content-center gap-2 shadow-sm"
        style={{ fontSize: '13.5px' }}
        onClick={onRunMatch}
        disabled={matching || requiredSkills.length === 0}
      >
        {matching ? (
          <>
            <Spinner animation="border" size="sm" />
            <span>Menghitung Vektor Kecocokan...</span>
          </>
        ) : (
          <>
            <ArrowRight size={15} />
            <span>Peringkat Kandidat dengan Cosine Similarity</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default JobCriteriaForm;
