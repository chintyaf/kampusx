import React from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import { Brain, CheckCircle2, Clock, Sparkles, TrendingUp, Award, Lock, LogIn } from 'lucide-react';

const SkillMatrixView = ({
  skills = [],
  srlModules = [],
  isGuest = false,
  promptLoginRequired = () => {}
}) => {
  const displayedSkills = isGuest ? skills.slice(0, 4) : skills;
  const lockedSkillsCount = isGuest ? Math.max(skills.length - 4, 0) : 0;

  const displayedModules = isGuest ? srlModules.slice(0, 1) : srlModules;
  const lockedModulesCount = isGuest ? Math.max(srlModules.length - 1, 1) : 0;

  return (
    <div>
      {/* SECTION 1: VEKTOR MATRIKS KEAHLIAN */}
      <div className="bg-white border rounded-4 p-4 mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <div>
            <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <Brain size={20} className="text-primary" /> Matriks Kompetensi & Kemahiran Keahlian
            </h5>
            <p className="text-muted small mb-0">
              Dihitung berdasarkan hasil evaluasi kuis kognitif SRL dan penyelesaian modul praktikum.
            </p>
          </div>
          <Badge bg="primary-subtle" className="text-primary border border-primary-subtle px-3 py-1-5">
            Vector Skill-Matrix Ready
          </Badge>
        </div>

        <Row className="g-3">
          {displayedSkills.map((skill, idx) => (
            <Col md={6} key={idx}>
              <div className="skill-bar-container">
                <div className="skill-bar-header">
                  <span className="text-dark fw-semibold">{skill.name}</span>
                  <span className="text-primary fw-bold">{skill.level}% Mahir</span>
                </div>
                <div className="skill-track">
                  <div className="skill-fill" style={{ width: `${skill.level}%` }} />
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* Jika ada skill terkunci untuk guest */}
        {isGuest && lockedSkillsCount > 0 && (
          <div className="mt-3 p-3 bg-light rounded-3 border d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <Lock size={15} className="text-secondary" />
              <span className="small text-muted">
                +{lockedSkillsCount} Kompetensi keahlian lainnya disembunyikan dalam pratinjau publik.
              </span>
            </div>
            <button
              type="button"
              className="btn btn-link btn-sm text-primary fw-bold text-decoration-none p-0"
              onClick={() =>
                promptLoginRequired(
                  'Buka Seluruh Matriks Keahlian',
                  'Masuk untuk melihat analisis lengkap distribusi keahlian dan skor kemahiran mahasiswa ini.'
                )
              }
            >
              Buka Semua Keahlian &rarr;
            </button>
          </div>
        )}
      </div>

      {/* SECTION 2: RIWAYAT KELULUSAN MODUL MICROLEARNING SRL (CHINTYA'S MODULE INTEGRATION) */}
      <div className="bg-white border rounded-4 p-4">
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <div>
            <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <Sparkles size={20} className="text-warning" /> Riwayat Microlearning (Self-Regulated Learning)
            </h5>
            <p className="text-muted small mb-0">
              Modul terstruktur 3-Fase SRL (Forethought, Performance, Self-Reflection) dengan kuis refleksi otomatis Gen-AI.
            </p>
          </div>
          <span className="badge bg-light text-dark border">
            {srlModules.length} Modul Terverifikasi
          </span>
        </div>

        <div>
          {displayedModules.map((mod) => (
            <div key={mod.id} className="srl-module-card">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <Badge bg="success-subtle" className="text-success border border-success-subtle" style={{ fontSize: '10px' }}>
                    <CheckCircle2 size={11} className="me-1" /> Lulus Passing Grade
                  </Badge>
                  <span className="text-muted small">
                    <Clock size={12} className="me-1" /> {mod.duration}
                  </span>
                </div>
                <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '14.5px' }}>
                  {mod.title}
                </h6>
                <div className="text-muted small">
                  Diselesaikan pada {mod.date} • Engine: Gen-AI & SRL Framework
                </div>
              </div>

              <div className="text-end">
                <div className="small text-muted mb-1">Skor Kuis</div>
                <div className="fw-bold text-success fs-5">{mod.score}/100</div>
              </div>
            </div>
          ))}

          {/* LinkedIn-style Gated Lock Card untuk Riwayat SRL Tambahan */}
          {isGuest && (
            <div className="srl-locked-gateway-box p-4 rounded-4 mt-3 text-center border">
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#fef3c7',
                  color: '#b45309',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}
              >
                <Lock size={20} />
              </div>
              <h6 className="fw-bold text-dark mb-1">
                Catatan Evaluasi Kognitif SRL Mendalam Terkunci (+{lockedModulesCount} Modul Lainnya)
              </h6>
              <p className="text-muted small mx-auto mb-3" style={{ maxWidth: '480px', fontSize: '12.5px' }}>
                Masuk ke KampusX untuk melihat rincian 3-fase SRL (Forethought Goal Setting, Performance Monitoring, dan Self-Reflection Gen-AI), waktu pengerjaan, dan catatan evaluasi pedagogis lengkap mahasiswa ini.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center gap-2"
                onClick={() =>
                  promptLoginRequired(
                    'Evaluasi Kognitif SRL Penuh',
                    'Daftar atau masuk ke akun KampusX untuk membuka catatan pengerjaan microlearning, evaluasi kognitif 3-fase, dan log skor refleksi Gen-AI.'
                  )
                }
              >
                <LogIn size={14} /> Masuk untuk Melihat Evaluasi Kognitif
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillMatrixView;
