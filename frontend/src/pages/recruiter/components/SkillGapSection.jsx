import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Komponen SkillGapSection
 * Menampilkan rincian keahlian yang cocok (Matched) vs keahlian yang belum terpenuhi (Gap)
 */
const SkillGapSection = ({ matchedSkills = [], unmetSkills = [] }) => {
  if (matchedSkills.length === 0 && unmetSkills.length === 0) {
    return null;
  }

  return (
    <Card className="border rounded-4 bg-light p-3 mb-4">
      <div className="fw-bold text-dark small text-uppercase mb-2">
        Analisis Kecocokan Kualifikasi & Skill Gap
      </div>
      <div className="row g-3">
        {/* Matched Skills */}
        <div className="col-md-6">
          <div className="d-flex align-items-center gap-1-5 text-success small fw-semibold mb-2">
            <CheckCircle2 size={15} /> Keahlian Terpenuhi ({matchedSkills.length})
          </div>
          {matchedSkills.length > 0 ? (
            <div className="d-flex flex-wrap gap-1-5">
              {matchedSkills.map((item, idx) => (
                <Badge
                  key={idx}
                  bg="success-subtle"
                  className="text-success border border-success-subtle px-2-5 py-1-5 rounded-pill d-inline-flex align-items-center gap-1"
                  style={{ fontSize: '11.5px' }}
                >
                  <CheckCircle2 size={12} />
                  <span>{item.skill || item}</span>
                  {item.proficiency && (
                    <span className="opacity-75">({item.proficiency}/5.0)</span>
                  )}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted small">Belum ada keahlian yang sesuai.</span>
          )}
        </div>

        {/* Unmet Skills / Gap */}
        <div className="col-md-6">
          <div className="d-flex align-items-center gap-1-5 text-danger small fw-semibold mb-2">
            <AlertCircle size={15} /> Kebutuhan Belum Terpenuhi ({unmetSkills.length})
          </div>
          {unmetSkills.length > 0 ? (
            <div className="d-flex flex-wrap gap-1-5">
              {unmetSkills.map((skill, idx) => (
                <Badge
                  key={idx}
                  bg="danger-subtle"
                  className="text-danger border border-danger-subtle px-2-5 py-1-5 rounded-pill"
                  style={{ fontSize: '11.5px' }}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted small">Semua kualifikasi keahlian terpenuhi!</span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default SkillGapSection;
