import React, { useState } from 'react';
import { Form, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { Sparkles, Plus, AlertCircle, RefreshCw, X } from 'lucide-react';

const PRESET_SKILLS = [
  'Laravel',
  'React',
  'MySQL',
  'Python',
  'Machine Learning',
  'Docker',
  'TypeScript',
  'Node.js',
];

/**
 * Komponen JobMatchingPanel
 * Panel input kriteria lowongan kerja yang ringkas, bersih, dan tidak panjang secara default
 */
const JobMatchingPanel = ({
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
  isMatchingActive = false,
  onClose,
}) => {
  const [skillInput, setSkillInput] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (skillInput.trim()) {
      onAddSkill(skillInput.trim());
      setSkillInput('');
    }
  };

  return (
    <div className="job-matching-panel">
      {/* Header Panel */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <div className="p-1.5 bg-primary-subtle text-primary rounded-circle">
            <Sparkles size={16} />
          </div>
          <div>
            <h6 className="fw-bold text-dark mb-0">Job Matching & Kriteria Kualifikasi</h6>
            <span className="text-muted small" style={{ fontSize: '11.5px' }}>
              Tentukan posisi dan keahlian untuk memeringkat kandidat berdasarkan relevansi portofolio.
            </span>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            className="btn btn-sm btn-link text-muted p-0"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Warning jika kriteria berubah setelah matching dijalankan */}
      {isCriteriaDirty && (
        <Alert variant="warning" className="py-2 px-3 small d-flex align-items-center gap-2 mb-3">
          <AlertCircle size={15} className="flex-shrink-0" />
          <span>Kriteria telah diubah. Klik <strong>"Hitung Ulang Kecocokan"</strong> untuk memperbarui ranking kandidat.</span>
        </Alert>
      )}

      {/* Error Message */}
      {matchError && (
        <Alert variant="danger" className="py-2 px-3 small mb-3">
          {matchError}
        </Alert>
      )}

      {/* Position / Job Title Input (Empty by default, with clean placeholder) */}
      <div className="mb-3">
        <Form.Label className="small fw-semibold text-dark mb-1">
          Posisi Pekerjaan (Opsional):
        </Form.Label>
        <Form.Control
          type="text"
          placeholder="Misal: Software Engineer, Data Analyst, UI Designer..."
          value={jobTitle}
          onChange={(e) => onJobTitleChange(e.target.value)}
          className="rounded-pill"
          style={{ fontSize: '13px' }}
        />
      </div>

      {/* Required Skills Badges */}
      <div className="mb-2">
        <div className="d-flex align-items-center justify-content-between mb-1">
          <Form.Label className="small fw-semibold text-dark mb-0">
            Keahlian yang Dibutuhkan ({requiredSkills.length}):
          </Form.Label>
          {requiredSkills.length > 0 && (
            <button
              type="button"
              className="btn btn-link btn-sm text-decoration-none text-muted p-0"
              style={{ fontSize: '11.5px' }}
              onClick={onResetSkills}
            >
              Hapus Semua
            </button>
          )}
        </div>

        <div className="d-flex flex-wrap gap-1.5 mb-2" style={{ minHeight: '32px' }}>
          {requiredSkills.length === 0 ? (
            <span className="text-muted small fst-italic py-1" style={{ fontSize: '12px' }}>
              Belum ada keahlian yang ditambahkan. Ketik di bawah atau pilih rekomendasi.
            </span>
          ) : (
            requiredSkills.map((skill, idx) => (
              <Badge
                key={idx}
                bg="primary"
                className="px-2.5 py-1.5 rounded-pill d-inline-flex align-items-center gap-1 fw-semibold"
                style={{ fontSize: '12px' }}
              >
                <span>{skill}</span>
                <span
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer fw-bold ms-1"
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

      {/* Add Skill Input Form */}
      <Form onSubmit={handleFormSubmit} className="d-flex gap-2 mb-3">
        <Form.Control
          type="text"
          placeholder="Ketik keahlian lalu tekan Enter..."
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          className="rounded-pill"
          style={{ fontSize: '12.5px' }}
        />
        <Button
          type="submit"
          variant="light"
          className="border rounded-pill px-3 fw-semibold flex-shrink-0"
          style={{ fontSize: '12px' }}
          disabled={!skillInput.trim()}
        >
          <Plus size={13} className="me-1" /> Tambah
        </Button>
      </Form>

      {/* Preset Skills Chips */}
      <div className="mb-3">
        <div className="small text-muted mb-1.5" style={{ fontSize: '11px', fontWeight: 600 }}>
          PILIHAN KEAHLIAN CEPAT:
        </div>
        <div className="d-flex flex-wrap gap-1">
          {PRESET_SKILLS.map((preset) => {
            const isSelected = requiredSkills.includes(preset);
            return (
              <button
                key={preset}
                type="button"
                className={`preset-chip-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectPreset(preset)}
              >
                {isSelected ? '✓ ' : '+ '}
                {preset}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      <div className="d-flex gap-2">
        <Button
          variant="primary"
          className="w-100 rounded-pill py-2 fw-bold d-inline-flex align-items-center justify-content-center gap-2 shadow-sm"
          style={{ fontSize: '13px' }}
          onClick={onRunMatch}
          disabled={matching || requiredSkills.length === 0}
        >
          {matching ? (
            <>
              <Spinner animation="border" size="sm" />
              <span>Memproses Algoritma Matching...</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>{isCriteriaDirty ? 'Hitung Ulang Kecocokan' : 'Hitung Skor Kecocokan Kandidat'}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default JobMatchingPanel;
