import React from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import { Brain, CheckCircle2, Clock, Sparkles, TrendingUp, Award } from 'lucide-react';

const SkillMatrixView = ({ skills = [], srlModules = [] }) => {
  return (
    <div>
      {/* SECTION 1: VEKTOR MATRIKS KEAHLIAN */}
      <div className="bg-white border rounded-4 p-4 mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
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
          {skills.map((skill, idx) => (
            <Col md={6} key={idx}>
              <div className="skill-bar-container">
                <div className="skill-bar-header">
                  <span className="text-dark">{skill.name}</span>
                  <span className="text-primary">{skill.level}% Mahir</span>
                </div>
                <div className="skill-track">
                  <div className="skill-fill" style={{ width: `${skill.level}%` }} />
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* SECTION 2: RIWAYAT KELULUSAN MODUL MICROLEARNING SRL (CHINTYA'S MODULE INTEGRATION) */}
      <div className="bg-white border rounded-4 p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <Sparkles size={20} className="text-warning" /> Riwayat Microlearning (Self-Regulated Learning)
            </h5>
            <p className="text-muted small mb-0">
              Modul terstruktur 3-Fase SRL (Forethought, Performance, Self-Reflection) dengan kuis refleksi otomatis Gen-AI.
            </p>
          </div>
          <span className="badge bg-light text-dark border">
            {srlModules.length} Modul Lulus
          </span>
        </div>

        <div>
          {srlModules.map((mod) => (
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
        </div>
      </div>
    </div>
  );
};

export default SkillMatrixView;
