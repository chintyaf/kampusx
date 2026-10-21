import React from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import { Award, ShieldCheck, Lock, ExternalLink, Calendar, CheckCircle2, LogIn } from 'lucide-react';

const SbtCertificatesView = ({
  sbtCertificates = [],
  onVerifySbt,
  isGuest = false,
  promptLoginRequired = () => {}
}) => {
  if (sbtCertificates.length === 0) {
    return (
      <div className="text-center py-5 bg-white rounded-4 border">
        <Award size={36} className="text-muted mb-2" />
        <h6 className="fw-bold text-dark">Belum Ada Kredensial On-Chain</h6>
        <p className="text-muted small mb-0">Mahasiswa ini belum menerbitkan sertifikat Soulbound Token.</p>
      </div>
    );
  }

  // Jika guest, tampilkan sertifikat pertama secara terbuka, sisanya di-gate LinkedIn-style
  const displayedCerts = isGuest ? sbtCertificates.slice(0, 1) : sbtCertificates;
  const lockedCount = isGuest ? Math.max(sbtCertificates.length - 1, 1) : 0;

  return (
    <div>
      <Row className="g-4">
        {displayedCerts.map((cert) => (
          <Col md={6} key={cert.id || cert.tokenId}>
            <div className="sbt-cert-card">
              {/* Header Badge */}
              <div className="sbt-card-header">
                <div className="d-flex align-items-center gap-2">
                  <ShieldCheck size={18} className="text-success" />
                  <span className="fw-bold text-dark small">SOULBOUND TOKEN (SBT)</span>
                </div>
                <Badge bg="success-subtle" className="text-success border border-success-subtle">
                  ERC-5192
                </Badge>
              </div>

              {/* Body */}
              <div className="sbt-card-body">
                <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '16px' }}>
                  {cert.title}
                </h5>
                <p className="text-muted small mb-3">
                  Diterbitkan oleh <strong className="text-dark">{cert.issuer || 'KampusX Verified Authority'}</strong>
                </p>

                {/* Token Meta Information */}
                <div className="sbt-token-meta">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Token ID:</span>
                    <span className="fw-bold text-dark">{cert.tokenId}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Ledger:</span>
                    <span className="fw-bold text-primary">Polygon Amoy / Mainnet</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Tanggal Mint:</span>
                    <span className="text-dark">{cert.date}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Status:</span>
                    <span className="text-success fw-bold">Permanent & Non-Transferable</span>
                  </div>
                </div>

                {/* Action */}
                <div className="mt-3 d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm w-100 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
                    onClick={() => onVerifySbt(cert)}
                  >
                    <ShieldCheck size={15} /> Verifikasi di Smart Contract
                  </button>
                </div>
              </div>
            </div>
          </Col>
        ))}

        {/* LinkedIn-style Gated Lock Card untuk Pengunjung (Guest) */}
        {isGuest && (
          <Col md={6}>
            <div className="sbt-cert-card sbt-card-locked position-relative overflow-hidden">
              {/* Blurred Dummy Content in Background */}
              <div className="sbt-card-blurred-bg p-4 opacity-25" style={{ filter: 'blur(3px)', userSelect: 'none' }}>
                <div className="d-flex justify-content-between mb-3">
                  <span className="fw-bold">SOULBOUND TOKEN (SBT)</span>
                  <Badge bg="secondary">ERC-5192</Badge>
                </div>
                <h5 className="fw-bold mb-2">Advanced Industry Practicum & Certification</h5>
                <p className="small mb-3">Diterbitkan oleh KampusX Verified Enterprise Partner</p>
                <div className="bg-light p-2 rounded small">
                  <div>Token ID: #SBT-2026-XXXX</div>
                  <div>Ledger: Polygon Mainnet Verified</div>
                </div>
              </div>

              {/* Lock Overlay */}
              <div className="locked-card-overlay d-flex flex-column align-items-center justify-content-center text-center p-4">
                <div className="locked-icon-bubble mb-2">
                  <Lock size={22} />
                </div>
                <Badge bg="warning-subtle" className="text-warning-emphasis border border-warning-subtle mb-2 px-2 py-1">
                  Akses Terbatas Publik
                </Badge>
                <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '15px' }}>
                  +{lockedCount} Kredensial On-Chain Terkunci
                </h6>
                <p className="text-muted small mb-3" style={{ maxWidth: '280px', fontSize: '12px' }}>
                  Mahasiswa ini memiliki sertifikat SBT on-chain lainnya yang tercatat di smart contract Polygon.
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm rounded-pill px-3 py-1-5 fw-bold d-flex align-items-center gap-1"
                  style={{ fontSize: '12px' }}
                  onClick={() =>
                    promptLoginRequired(
                      'Buka Semua Kredensial On-Chain',
                      'Masuk untuk mengakses seluruh sertifikat Soulbound Token (SBT), nomor smart contract, dan riwayat validasi blockchain mahasiswa ini.'
                    )
                  }
                >
                  <LogIn size={13} /> Masuk untuk Melihat Semua
                </button>
              </div>
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default SbtCertificatesView;
