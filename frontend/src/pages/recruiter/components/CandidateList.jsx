import React from 'react';
import { Spinner, Button } from 'react-bootstrap';
import { Users, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import LogoKampusXNoText from '@/assets/images/logo/Logo_KampusX_NoText.svg';
import CandidateCard from './CandidateCard';

/**
 * Komponen CandidateList
 * Menampilkan grid responsif kandidat mahasiswa dengan penanganan loading, error, dan empty state
 */
const CandidateList = ({
  candidates = [],
  loading = false,
  error = null,
  onRetry,
  activeSkills = [],
  onViewProfile,
  isMatchingActive = false,
  onResetMatch,
}) => {
  if (loading) {
    return (
      <div className="clean-card p-5 text-center">
        <Spinner animation="border" variant="primary" size="sm" />
        <div className="text-muted small mt-2 fw-medium">
          Memuat data kandidat mahasiswa...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="clean-card p-4 text-center">
        <AlertTriangle size={32} className="text-danger mx-auto mb-2" />
        <h6 className="fw-bold text-dark mb-1">Gagal Memuat Data</h6>
        <p className="text-muted small mb-3">{error}</p>
        {onRetry && (
          <Button
            variant="outline-primary"
            size="sm"
            className="rounded-pill px-3 py-1-5 d-inline-flex align-items-center gap-1"
            onClick={onRetry}
          >
            <RefreshCw size={13} /> Coba Lagi
          </Button>
        )}
      </div>
    );
  }

  if (!candidates || candidates.length === 0) {
    return (
      <div className="clean-card p-5 text-center">
        <div className="p-3 bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3 text-muted" style={{ width: '64px', height: '64px' }}>
          {isMatchingActive ? (
            <Sparkles size={28} className="text-primary" />
          ) : (
            <img
              src={LogoKampusXNoText}
              alt=""
              style={{ width: '32px', height: '32px', opacity: 0.6 }}
            />
          )}
        </div>
        <h6 className="fw-bold text-dark mb-1">
          {isMatchingActive
            ? 'Tidak Ada Kandidat yang Memenuhi Kriteria'
            : 'Tidak Ada Kandidat Ditemukan'}
        </h6>
        <p className="text-muted small mb-3" style={{ maxWidth: '420px', margin: '0 auto' }}>
          {isMatchingActive
            ? 'Belum ada profil mahasiswa yang sesuai dengan kombinasi keahlian pekerjaan ini. Coba sesuaikan kriteria lowongan atau gunakan keahlian yang lebih umum.'
            : 'Tidak ada profil mahasiswa yang sesuai dengan kata kunci atau filter saat ini.'}
        </p>

        {isMatchingActive && onResetMatch && (
          <Button
            variant="outline-secondary"
            size="sm"
            className="rounded-pill px-3 py-1"
            style={{ fontSize: '12px' }}
            onClick={onResetMatch}
          >
            Kembali ke Semua Kandidat
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="candidate-grid">
      {candidates.map((candidate) => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          activeSkills={activeSkills}
          onViewProfile={onViewProfile}
        />
      ))}
    </div>
  );
};

export default CandidateList;
