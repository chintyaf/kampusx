import React, { useState } from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import {
  Award,
  ShieldCheck,
  Lock,
  ExternalLink,
  Calendar,
  CheckCircle2,
  LogIn,
  FileText,
  Eye,
  Grid,
  Layers,
  Sparkles
} from 'lucide-react';

const SbtCertificatesView = ({
  sbtCertificates = [],
  onVerifySbt,
  onOpenFileModal = () => {},
  studentName = 'Peserta KampusX',
  isGuest = false,
  promptLoginRequired = () => {}
}) => {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' (SBT Web3 info) atau 'gallery' (Visual diploma preview)

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
      {/* ==================== SUB-HEADER & VIEW MODE TOGGLE ==================== */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4 bg-white p-3 rounded-4 border shadow-sm">
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="fw-bold text-dark small">
              Kredensial Soulbound Token (SBT) & Dokumen E-Sertifikat
            </div>
            <div className="text-muted" style={{ fontSize: '11px' }}>
              Terverifikasi on-chain di Polygon Amoy / Mainnet (Standar ERC-5192)
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="d-flex align-items-center bg-light p-1 rounded-pill border">
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 fw-bold d-flex align-items-center gap-1 ${
              viewMode === 'cards' ? 'btn-white bg-white shadow-sm text-dark' : 'text-muted border-0'
            }`}
            style={{ fontSize: '12px' }}
            onClick={() => setViewMode('cards')}
          >
            <Layers size={13} /> Kredensial On-Chain
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 fw-bold d-flex align-items-center gap-1 ${
              viewMode === 'gallery' ? 'btn-white bg-white shadow-sm text-dark' : 'text-muted border-0'
            }`}
            style={{ fontSize: '12px' }}
            onClick={() => setViewMode('gallery')}
          >
            <FileText size={13} /> Dokumen Sertifikat
          </button>
        </div>
      </div>

      {/* ==================== VIEW MODE 1: KREDENSIAL SBT CARDS ==================== */}
      {viewMode === 'cards' && (
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
                      <span className="text-muted">Nomor Sertifikat:</span>
                      <span className="fw-semibold text-dark">{cert.ticketCode || cert.tokenId?.replace('#', '') || 'CERT-2026-0041'}</span>
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

                  {/* Actions: LIHAT FILE SERTIFIKAT & VERIFIKASI ON-CHAIN */}
                  <div className="mt-3 d-flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm flex-fill rounded-pill fw-bold d-flex align-items-center justify-content-center gap-1.5 py-2 shadow-2xs"
                      onClick={() => onOpenFileModal(cert)}
                      title="Lihat dokumen file e-sertifikat resmi dan unduh PDF"
                    >
                      <FileText size={15} /> Lihat File Sertifikat
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-success btn-sm flex-fill rounded-pill fw-bold d-flex align-items-center justify-content-center gap-1.5 py-2"
                      onClick={() => onVerifySbt(cert)}
                      title="Periksa integritas kriptografi smart contract Polygon"
                    >
                      <ShieldCheck size={15} /> Verifikasi On-Chain
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
                        'Buka Semua Kredensial & File Sertifikat',
                        'Masuk untuk mengakses seluruh sertifikat Soulbound Token (SBT), file PDF sertifikat resmi, dan riwayat validasi blockchain mahasiswa ini.'
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
      )}

      {/* ==================== VIEW MODE 2: VISUAL CERTIFICATE GALLERY ==================== */}
      {viewMode === 'gallery' && (
        <Row className="g-4">
          {displayedCerts.map((cert) => (
            <Col md={6} key={cert.id || cert.tokenId}>
              <div
                className="certificate-visual-card p-3 bg-white rounded-4 border shadow-sm h-100 d-flex flex-column"
                style={{
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => onOpenFileModal(cert)}
              >
                {/* Visual Certificate Frame Preview */}
                <div
                  className="position-relative rounded-3 overflow-hidden mb-3 border d-flex flex-column align-items-center justify-content-center text-center p-3"
                  style={{
                    backgroundColor: '#0f172a',
                    backgroundImage: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
                    border: '4px double #d4af37',
                    minHeight: '170px',
                    color: '#ffffff'
                  }}
                >
                  <div className="badge bg-warning text-dark fw-bold px-2 py-1 mb-2" style={{ fontSize: '9px', letterSpacing: '1px' }}>
                    OFFICIAL CERTIFICATE
                  </div>
                  <h6 className="fw-bold mb-1 text-white text-truncate px-2" style={{ maxWidth: '90%', fontSize: '14px' }}>
                    {cert.title}
                  </h6>
                  <div className="text-warning-emphasis small fw-semibold mb-2" style={{ fontSize: '11px' }}>
                    {studentName}
                  </div>
                  <div className="text-white-50" style={{ fontSize: '10px' }}>
                    {cert.issuer} • {cert.date}
                  </div>

                  {/* Corner Gold Triangles */}
                  <div style={{ position: 'absolute', top: 6, right: 6, color: '#d4af37', fontSize: '10px' }}>
                    <Sparkles size={12} />
                  </div>
                </div>

                {/* Card Info & Action Button */}
                <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top">
                  <div>
                    <div className="fw-bold text-dark small">{cert.tokenId}</div>
                    <div className="text-muted" style={{ fontSize: '11px' }}>Klik untuk melihat dokumen utuh</div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenFileModal(cert);
                    }}
                  >
                    <Eye size={13} /> Buka Dokumen
                  </button>
                </div>
              </div>
            </Col>
          ))}

          {/* Locked Teaser for Gallery in Guest Mode */}
          {isGuest && (
            <Col md={6}>
              <div
                className="p-4 rounded-4 border text-center h-100 d-flex flex-column align-items-center justify-content-center"
                style={{
                  backgroundColor: '#f8fafc',
                  borderStyle: 'dashed'
                }}
              >
                <div className="locked-icon-bubble mb-2">
                  <Lock size={20} />
                </div>
                <h6 className="fw-bold text-dark mb-1">+{lockedCount} File Dokumen Terkunci</h6>
                <p className="text-muted small mb-3" style={{ fontSize: '12px' }}>
                  Masuk ke akun KampusX untuk membuka dan mengunduh seluruh dokumen e-sertifikat berformat PDF resmi.
                </p>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold"
                  onClick={() =>
                    promptLoginRequired(
                      'Buka Semua File Sertifikat',
                      'Masuk untuk membuka seluruh dokumen sertifikat kompetensi mahasiswa ini.'
                    )
                  }
                >
                  <LogIn size={13} className="me-1" /> Masuk Sekarang
                </button>
              </div>
            </Col>
          )}
        </Row>
      )}
    </div>
  );
};

export default SbtCertificatesView;
