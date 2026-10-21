import React from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import { Award, ShieldCheck, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';

const SbtCertificatesView = ({ sbtCertificates = [], onVerifySbt }) => {
  if (sbtCertificates.length === 0) {
    return (
      <div className="text-center py-5 bg-white rounded-4 border">
        <Award size={36} className="text-muted mb-2" />
        <h6 className="fw-bold text-dark">Belum Ada Kredensial On-Chain</h6>
        <p className="text-muted small mb-0">Mahasiswa ini belum menerbitkan sertifikat Soulbound Token.</p>
      </div>
    );
  }

  return (
    <Row className="g-4">
      {sbtCertificates.map((cert) => (
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
    </Row>
  );
};

export default SbtCertificatesView;
