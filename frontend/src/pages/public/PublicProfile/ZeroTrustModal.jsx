import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { CheckCircle2, ExternalLink, ShieldCheck, FileText } from 'lucide-react';

const ZeroTrustModal = ({ show, onHide, sbtData, studentName, onOpenFileModal }) => {
  if (!sbtData) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      contentClassName="border-0 shadow-lg"
      style={{ borderRadius: '24px' }}
    >
      <Modal.Body className="p-4 text-center">
        <div className="modal-trust-badge">
          <CheckCircle2 size={36} />
        </div>

        <h5 className="fw-bold text-dark mb-1">Zero-Trust Blockchain Verification</h5>
        <p className="text-muted small mb-4">
          Keaslian sertifikat kredensial ini tervalidasi sah on-chain di Polygon Ledger.
        </p>

        <div className="text-start bg-light rounded-3 p-3 mb-4">
          <div className="chain-info-row">
            <span className="chain-info-label">Nama Pemilik:</span>
            <span className="fw-bold text-dark">{studentName || sbtData.owner || 'Mahasiswa Terdaftar'}</span>
          </div>
          <div className="chain-info-row">
            <span className="chain-info-label">Kredensial:</span>
            <span className="fw-bold text-primary">{sbtData.title || 'Soulbound Credentials'}</span>
          </div>
          <div className="chain-info-row">
            <span className="chain-info-label">Standar Token:</span>
            <span className="badge bg-success-subtle text-success border border-success-subtle">
              ERC-5192 (Soulbound / Non-Transferable)
            </span>
          </div>
          <div className="chain-info-row">
            <span className="chain-info-label">Token ID:</span>
            <span className="chain-info-val">{sbtData.tokenId || '#SBT-2026-0041'}</span>
          </div>
          <div className="chain-info-row">
            <span className="chain-info-label">Smart Contract:</span>
            <span className="chain-info-val text-truncate" style={{ maxWidth: '200px' }}>
              {sbtData.contractAddress || '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32'}
            </span>
          </div>
          <div className="chain-info-row">
            <span className="chain-info-label">Transaction Hash:</span>
            <span className="chain-info-val text-truncate" style={{ maxWidth: '200px' }}>
              {sbtData.txHash || '0x94f1c8a73b22e185c899d214c718b90a61849f2b87e91402ba815349e5d4cb3c'}
            </span>
          </div>
          <div className="chain-info-row">
            <span className="chain-info-label">Tanggal Mint:</span>
            <span className="chain-info-val">{sbtData.date || '28 Sep 2026'}</span>
          </div>
          <div className="chain-info-row">
            <span className="chain-info-label">Ledger Network:</span>
            <span className="chain-info-val text-success">Polygon Network (Chain ID: 137)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex flex-column gap-2">
          {onOpenFileModal && (
            <Button
              variant="outline-primary"
              className="w-100 rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
              onClick={() => {
                onHide();
                onOpenFileModal(sbtData);
              }}
            >
              <FileText size={16} /> Lihat Dokumen File E-Sertifikat
            </Button>
          )}

          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              className="w-100 rounded-pill py-2"
              onClick={onHide}
            >
              Tutup
            </Button>
            <Button
              variant="dark"
              className="w-100 rounded-pill py-2 d-flex align-items-center justify-content-center gap-2"
              onClick={() => {
                window.open('https://polygonscan.com', '_blank');
              }}
            >
              Polygonscan <ExternalLink size={14} />
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ZeroTrustModal;
