import React, { useState } from 'react';
import { Check } from 'lucide-react';

const STORAGE_KEY = 'kx_recruiter';

const loadSavedRecruiter = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      recruiter_name: saved.recruiter_name || '',
      recruiter_email: saved.recruiter_email || '',
      company_name: saved.company_name || ''
    };
  } catch {
    return { recruiter_name: '', recruiter_email: '', company_name: '' };
  }
};

/**
 * Form pencarian recruiter (guest): identitas + judul posisi + pilihan skill.
 * State skill yang dipilih dimiliki oleh parent.
 */
const TalentSearchPanel = ({
  skills,
  loadingSkills,
  skillsError,
  selectedSkillIds,
  onToggleSkill,
  onReset,
  onSearch,
  searching,
  error
}) => {
  const [form, setForm] = useState({ ...loadSavedRecruiter(), title: '' });

  const setField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simpan identitas agar tidak perlu mengisi ulang pada pencarian berikutnya
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          recruiter_name: form.recruiter_name,
          recruiter_email: form.recruiter_email,
          company_name: form.company_name
        })
      );
    } catch {
      /* localStorage tidak tersedia: abaikan */
    }

    onSearch(form);
  };

  return (
    <form className="match-simulator-box" onSubmit={handleSubmit}>
      <div className="match-simulator-header">
        <div>
          <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: '14px' }}>
            ⚡ Job-Skill Match
          </h6>
          <p className="small text-muted mb-0">
            Pilih skill yang dibutuhkan, sistem menghitung kecocokan setiap talent secara otomatis.
          </p>
        </div>
        {selectedSkillIds.length > 0 && (
          <button
            type="button"
            className="btn btn-sm btn-link text-decoration-none text-muted p-0"
            style={{ fontSize: '12px' }}
            onClick={onReset}
          >
            Reset Pilihan
          </button>
        )}
      </div>

      {/* Identitas recruiter */}
      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Nama Anda"
            value={form.recruiter_name}
            onChange={setField('recruiter_name')}
            maxLength={150}
            required
          />
        </div>
        <div className="col-md-6">
          <input
            type="email"
            className="form-control form-control-sm"
            placeholder="Email"
            value={form.recruiter_email}
            onChange={setField('recruiter_email')}
            maxLength={150}
            required
          />
        </div>
        <div className="col-md-6">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Perusahaan (opsional)"
            value={form.company_name}
            onChange={setField('company_name')}
            maxLength={200}
          />
        </div>
        <div className="col-md-6">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Posisi yang dicari, mis. Backend Developer Intern"
            value={form.title}
            onChange={setField('title')}
            maxLength={200}
            required
          />
        </div>
      </div>

      {/* Pilihan skill */}
      <div className="mb-3">
        {loadingSkills && <span className="small text-muted">Memuat daftar skill...</span>}
        {skillsError && <span className="small text-danger">{skillsError}</span>}
        {!loadingSkills && !skillsError && skills.length === 0 && (
          <span className="small text-muted">Belum ada skill pada kategori ini.</span>
        )}
        {skills.map((skill) => {
          const isSelected = selectedSkillIds.includes(skill.id);
          return (
            <button
              key={skill.id}
              type="button"
              className={`match-skill-tag-btn ${isSelected ? 'selected' : ''}`}
              onClick={() => onToggleSkill(skill.id)}
            >
              {isSelected && <Check size={12} />} {skill.name}
            </button>
          );
        })}
      </div>

      {error && <div className="small text-danger mb-2">{error}</div>}

      <div className="d-flex align-items-center justify-content-between">
        <span className="small text-muted">{selectedSkillIds.length} skill dipilih</span>
        <button
          type="submit"
          className="btn btn-primary btn-sm rounded-pill px-4 fw-bold"
          disabled={searching || selectedSkillIds.length === 0}
        >
          {searching ? 'Mencari...' : 'Cari Talent'}
        </button>
      </div>
    </form>
  );
};

export default TalentSearchPanel;
