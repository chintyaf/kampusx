import React from 'react';
import { Card, Badge, Spinner } from 'react-bootstrap';
import { Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import ProfileHeader from '../components/ProfileHeader';
import SkillGapSection from '../components/SkillGapSection';
import CredentialCard from '../components/CredentialCard';

/**
 * View CandidateProfileView
 * Tampilan detail portofolio talenta mahasiswa (Read-only untuk recruiter)
 */
const CandidateProfileView = ({
  candidate,
  loading = false,
  onBack,
  onVerifySbt,
  matchData = null,
}) => {
  if (loading) {
    return (
      <div className="clean-card p-5 text-center">
        <Spinner animation="border" variant="primary" />
        <div className="text-muted small mt-2">Memuat profil lengkap kandidat...</div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="clean-card p-5 text-center">
        <h6 className="fw-bold text-dark mb-1">Profil Tidak Ditemukan</h6>
        <p className="text-muted small mb-3">Data kandidat mahasiswa tidak dapat dimuat atau telah dihapus.</p>
        <button type="button" className="btn btn-outline-primary btn-sm rounded-pill px-3" onClick={onBack}>
          Kembali ke Direktori
        </button>
      </div>
    );
  }

  const sbtList = candidate.sbt_certificates || [];

  return (
    <div className="candidate-profile-view">
      {/* Profile Header */}
      <ProfileHeader candidate={candidate} onBack={onBack} />

      {/* Match Score & Skill Gap (if available from matching) */}
      {matchData && (
        <SkillGapSection
          matchedSkills={matchData.matched_skills || []}
          unmetSkills={matchData.unmet_skills || []}
        />
      )}

      {/* About & Bio Card */}
      <div className="clean-card p-4 mb-4">
        <h6 className="fw-bold text-dark mb-2 text-uppercase small" style={{ fontSize: '11.5px', letterSpacing: '0.03em' }}>
          Tentang & Ringkasan Kompetensi
        </h6>
        <p className="text-dark small mb-0" style={{ lineHeight: '1.6' }}>
          {candidate.bio || 'Mahasiswa aktif dengan dedikasi tinggi pada pembelajaran mandiri dan penerapan teknologi modern.'}
        </p>
      </div>

      {/* Skills Matrix */}
      <div className="clean-card p-4 mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="fw-bold text-dark mb-0 text-uppercase small" style={{ fontSize: '11.5px', letterSpacing: '0.03em' }}>
            Matriks Keahlian & Skor Penguasaan
          </h6>
          <span className="text-muted small" style={{ fontSize: '11px' }}>
            Skala evaluasi: 1.0 – 5.0
          </span>
        </div>

        {candidate.skills && typeof candidate.skills === 'object' ? (
          <div className="row g-2">
            {Object.entries(candidate.skills).map(([skillName, score]) => (
              <div key={skillName} className="col-sm-6 col-md-4">
                <div className="p-2-5 bg-light rounded-3 border d-flex justify-content-between align-items-center">
                  <span className="small text-dark fw-medium">{skillName}</span>
                  <Badge bg="primary-subtle" className="text-primary border border-primary-subtle px-2 py-1 rounded-pill" style={{ fontSize: '11.5px' }}>
                    {typeof score === 'number' ? score.toFixed(1) : score} / 5.0
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted small mb-0">Belum ada rincian matriks keahlian.</p>
        )}
      </div>

      {/* Soulbound Token Certificates */}
      <div className="clean-card p-4 mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h6 className="fw-bold text-dark mb-0 text-uppercase small" style={{ fontSize: '11.5px', letterSpacing: '0.03em' }}>
              Portofolio Sertifikat Soulbound Token (ERC-5192)
            </h6>
            <span className="text-muted small">
              Kredensial terverifikasi on-chain yang tidak dapat dipindahtangankan
            </span>
          </div>
          <Badge bg="success" className="px-2-5 py-1 rounded-pill">
            {sbtList.length} SBT
          </Badge>
        </div>

        {sbtList.length > 0 ? (
          <div>
            {sbtList.map((cert, idx) => (
              <CredentialCard
                key={cert.id || idx}
                certificate={cert}
                onVerify={() => onVerifySbt && onVerifySbt(candidate, cert)}
              />
            ))}
          </div>
        ) : (
          <div className="p-4 bg-light rounded-3 text-center text-muted small">
            Mahasiswa ini belum memiliki sertifikat kredensial on-chain.
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateProfileView;
