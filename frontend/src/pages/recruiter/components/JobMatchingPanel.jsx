import React, { useState, useMemo } from 'react';
import { Form, Badge, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { Sparkles, Search, X, Check } from 'lucide-react';

const SelectedSkillBadges = ({ skills, onRemove }) => {
  if (skills.length === 0) {
    return (
      <span className="text-muted fst-italic" style={{ fontSize: '11.5px' }}>
        Pilih skill di bawah untuk auto-matching.
      </span>
    );
  }

  return skills.map((skill) => (
    <Badge
      key={skill.id}
      bg="primary"
      className="px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1 fw-semibold"
      style={{ fontSize: '11px' }}
    >
      <span>{skill.name}</span>
      <span
        role="button"
        tabIndex={0}
        className="cursor-pointer fw-bold ms-0.5"
        onClick={() => onRemove(skill.id)}
        onKeyDown={(e) => e.key === 'Enter' && onRemove(skill.id)}
      >
        ×
      </span>
    </Badge>
  ));
};

const SkillSelectorList = ({ skills, selectedIds, loading, onToggle }) => {
  if (loading) {
    return (
      <div className="text-muted small py-3 text-center border rounded-3">
        <Spinner animation="border" size="sm" className="me-2" />
        Memuat skill...
      </div>
    );
  }

  return (
    <div
      className="border rounded-3 p-1.5 d-flex flex-column gap-1"
      style={{ maxHeight: '220px', overflowY: 'auto', backgroundColor: '#f8fafc' }}
    >
      {skills.map((skill) => {
        const isSelected = selectedIds.has(Number(skill.id));
        const matchCount = skill.matched_candidates_count ?? 0;

        return (
          <button
            key={skill.id}
            type="button"
            onClick={() => onToggle && onToggle(skill)}
            title={skill.category ? `Kategori: ${skill.category}` : skill.name}
            className="w-100 border-0 rounded-2 px-2 py-1.5 d-flex align-items-center justify-content-between gap-2 text-start"
            style={{
              backgroundColor: isSelected ? '#e0f2fe' : '#ffffff',
              color: isSelected ? '#0369a1' : '#334155',
              fontSize: '12px',
              fontWeight: isSelected ? 600 : 500,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            <span className="d-flex align-items-center gap-2 text-truncate">
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-1 flex-shrink-0"
                style={{
                  width: '15px',
                  height: '15px',
                  backgroundColor: isSelected ? '#00699e' : '#ffffff',
                  border: isSelected ? '1px solid #00699e' : '1px solid #cbd5e1',
                  color: '#ffffff',
                }}
              >
                {isSelected && <Check size={11} strokeWidth={3} />}
              </span>
              <span className="text-truncate">{skill.name}</span>
            </span>

            <span
              className="flex-shrink-0 rounded-pill px-1.5 py-0.5"
              style={{
                fontSize: '10.5px',
                fontWeight: 600,
                backgroundColor: isSelected ? '#bae6fd' : '#f1f5f9',
                color: isSelected ? '#0369a1' : '#64748b',
              }}
            >
              {matchCount} cocok
            </span>
          </button>
        );
      })}

      {skills.length === 0 && (
        <span className="text-muted small p-2 w-100 text-center" style={{ fontSize: '11.5px' }}>
          Skill tidak ditemukan.
        </span>
      )}
    </div>
  );
};

/**
 * Komponen JobMatchingPanel
 * Sidebar input kriteria lowongan kerja yang auto-update saat skill berubah (/public/skills)
 */
const JobMatchingPanel = ({
  jobTitle = '',
  onJobTitleChange,
  availableSkills = [],
  loadingSkills = false,
  skillsError = null,
  requiredSkills = [],
  onToggleSkill,
  onRemoveSkill,
  onResetSkills,
  matching = false,
  matchError = null,
  isMatchingActive = false,
  matchCount = 0,
}) => {
  const [searchSkill, setSearchSkill] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = useMemo(() => {
    const set = new Set();
    availableSkills.forEach((skill) => {
      if (skill.category && skill.category.trim()) {
        set.add(skill.category.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [availableSkills]);

  const filteredSkills = useMemo(() => {
    const query = searchSkill.trim().toLowerCase();
    return availableSkills
      .filter((skill) => {
        const matchesQuery = !query || skill.name?.toLowerCase().includes(query);
        const matchesCategory =
          selectedCategory === 'ALL' ||
          (skill.category && skill.category.trim() === selectedCategory);
        return matchesQuery && matchesCategory;
      })
      .sort((a, b) => {
        const diff = (b.matched_candidates_count ?? 0) - (a.matched_candidates_count ?? 0);
        if (diff !== 0) return diff;
        return (a.name || '').localeCompare(b.name || '');
      });
  }, [availableSkills, searchSkill, selectedCategory]);

  const selectedIds = useMemo(
    () => new Set(requiredSkills.map((s) => Number(s.id))),
    [requiredSkills]
  );

  return (
    <div className="clean-card p-3 mb-3">
      {/* Header Sidebar */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span
          className="fw-bold text-dark small text-uppercase d-inline-flex align-items-center gap-1"
          style={{ fontSize: '11px', letterSpacing: '0.04em' }}
        >
          <Sparkles size={13} className="text-primary" />
          Job Matching
        </span>
        {requiredSkills.length > 0 && (
          <button
            type="button"
            className="btn btn-link btn-sm text-decoration-none text-danger p-0"
            style={{ fontSize: '11.5px' }}
            onClick={onResetSkills}
          >
            Reset Skill
          </button>
        )}
      </div>

      {/* Error Message */}
      {(matchError || skillsError) && (
        <Alert variant="danger" className="py-2 px-2.5 small mb-2.5" style={{ fontSize: '11.5px' }}>
          {matchError || skillsError}
        </Alert>
      )}

      {/* Position / Job Title Input */}
      <div className="mb-2.5">
        <Form.Label className="text-muted small mb-1" style={{ fontSize: '11.5px' }}>
          Posisi Pekerjaan (Opsional):
        </Form.Label>
        <Form.Control
          size="sm"
          type="text"
          placeholder="Misal: Software Engineer..."
          value={jobTitle}
          onChange={(e) => onJobTitleChange(e.target.value)}
          className="rounded-3"
          style={{ fontSize: '12px' }}
        />
      </div>

      {/* Selected Skills Badges */}
      <div className="mb-2.5">
        <div className="text-muted small mb-1" style={{ fontSize: '11.5px' }}>
          Skill Dipilih ({requiredSkills.length}):
        </div>

        <div className="d-flex flex-wrap gap-1" style={{ minHeight: '24px' }}>
          <SelectedSkillBadges skills={requiredSkills} onRemove={onRemoveSkill} />
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="mb-2">
          <Form.Label className="text-muted small mb-1" style={{ fontSize: '11.5px' }}>
            Kategori Skill:
          </Form.Label>
          <Form.Select
            size="sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-3"
            style={{ fontSize: '12px' }}
          >
            <option value="ALL">Semua Kategori ({availableSkills.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Form.Select>
        </div>
      )}

      {/* Search Skill Input */}
      <div className="mb-2">
        <InputGroup size="sm">
          <InputGroup.Text className="bg-white border-end-0 text-muted ps-2.5">
            <Search size={13} />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Cari nama skill..."
            value={searchSkill}
            onChange={(e) => setSearchSkill(e.target.value)}
            className="border-start-0 border-end-0 ps-1"
            style={{ fontSize: '12px' }}
          />
          {searchSkill ? (
            <InputGroup.Text
              className="bg-white border-start-0 cursor-pointer text-muted pe-2.5"
              onClick={() => setSearchSkill('')}
            >
              <X size={13} />
            </InputGroup.Text>
          ) : (
            <InputGroup.Text className="bg-white border-start-0 pe-2.5 text-muted" />
          )}
        </InputGroup>
      </div>

      {/* Available Skills Row List */}
      <div className="mb-2.5">
        <div className="d-flex align-items-center justify-content-between mb-1">
          <span className="text-muted" style={{ fontSize: '11px' }}>
            Daftar Skill ({filteredSkills.length})
          </span>
        </div>

        <SkillSelectorList
          skills={filteredSkills}
          selectedIds={selectedIds}
          loading={loadingSkills}
          onToggle={onToggleSkill}
        />
      </div>

      {/* Live Auto-Match Status */}
      <div
        className="rounded-3 px-2.5 py-2 d-flex align-items-center justify-content-between"
        style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', fontSize: '11.5px' }}
      >
        {matching ? (
          <span className="text-primary fw-semibold d-inline-flex align-items-center gap-1.5">
            <Spinner animation="border" size="sm" />
            Memperbarui kandidat cocok...
          </span>
        ) : isMatchingActive ? (
          <>
            <span className="text-dark fw-medium">Total kandidat cocok</span>
            <Badge bg="primary" className="rounded-pill px-2 py-1">
              {matchCount} Kandidat
            </Badge>
          </>
        ) : (
          <span className="text-muted">Auto-update aktif saat skill dipilih</span>
        )}
      </div>
    </div>
  );
};

export default JobMatchingPanel;
