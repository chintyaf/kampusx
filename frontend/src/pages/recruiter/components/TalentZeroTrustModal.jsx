import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge, Spinner } from 'react-bootstrap';
import { CheckCircle2, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import LogoKampusX from '@/assets/images/logo/Logo_KampusX.svg';
import LogoKampusXNoText from '@/assets/images/logo/Logo_KampusX_NoText.svg';
import recruiterApi from '../services/recruiterApi';

/**
 * Komponen TalentZeroTrustModal
 * Modal audit zero-trust kredensial on-chain Polygon Amoy (ERC-5192)
 * Menggunakan data riil dari backend tanpa data transaksi dummy/palsu
 */
const TalentZeroTrustModal = ({ show, onHide, candidate, certificate }) => {
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show && (certificate || candidate)) {
      const identifier = certificate?.token_id || certificate?.tokenId || candidate?.id;
      if (identifier) {
        setLoading(true);
        setError(null);
        recruiterApi.verifySbt(identifier)
          .then((res) => {
            if (res.success && res.data) {
              setVerificationData(res.data);
            }
          })
          .catch((err) => {
            console.warn('Gagal memuat verifikasi on-chain:', err);
            setError('Bukti on-chain saat ini belum tersinkronisasi.');
          })
          .finally(() => setLoading(false));
      }
    } else {
      setVerificationData(null);
      setError(null);
    }
  }, [show, candidate, certificate]);

  if (!show) return null;

  const candidateName = candidate?.name || 'Mahasiswa Terverifikasi';
  const certTitle = certificate?.title || verificationData?.title || 'Kredensial Akademik Mahasiswa';
  const tokenId = certificate?.token_id || certificate?.tokenId || verificationData?.token_id || '-';
  const contractAddress = certificate?.contract_address || verificationData?.contract_address || 'Smart Contract ERC-5192 (KampusX)';
  const txHash = certificate?.transaction_hash || verificationData?.transaction_hash || null;
  const block = certificate?.block_number || verificationData?.block_number || null;
  const isMinted = Boolean(certificate?.minted_at_formatted || verificationData?.minted_at);

  const handleOpenExplorer = () => {
    if (txHash) {
      window.open(`/blockchain/explorer/tx/${txHash}`, '_blank');
    }
  };

  const handleOpenLivePolygonscan = () => {
    if (certificate?.polygonscan_url) {
      window.open(certificate.polygonscan_url, '_blank');
    } else if (txHash) {
      window.open(`https://amoy.polygonscan.com/tx/${txHash}`, '_blank');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="border-0 shadow-lg rounded-4">
      <Modal.Body className="p-4 text-center">
        {/* Official KampusX Branding Header */}
        <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
          <img
            src={LogoKampusX}
            alt="KampusX"
            style={{ height: '24px', width: 'auto', objectFit: 'contain' }}
          />
          <Badge bg="success-subtle" className="text-success border border-success-subtle px-2.5 py-0.5 rounded-pill" style={{ fontSize: '11px' }}>
            Official SBT Verifier
          </Badge>
        </div>

        <div className="modal-trust-icon">
          {loading ? (
            <Spinner animation="border" variant="success" size="sm" />
          ) : (
            <CheckCircle2 size={32} />
          )}
        </div>

        <h5 className="fw-bold text-dark mb-1">Verifikasi Kredensial Soulbound Token</h5>
        <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
          <Badge bg="success" className="px-2.5 py-1 rounded-pill">
            {isMinted ? 'Terverifikasi On-Chain' : 'Tervalidasi Sistem'}
          </Badge>
          <Badge bg="primary-subtle" className="text-primary border border-primary-subtle px-2.5 py-1 rounded-pill">
            Standar ERC-5192
          </Badge>
        </div>
        <p className="text-muted small mb-3" style={{ fontSize: '12.5px' }}>
          Integritas kredensial ini terikat secara permanen pada profil mahasiswa dan tidak dapat dipindahtangankan.
        </p>

        {error && (
          <div className="alert alert-warning py-2 px-3 small d-flex align-items-center gap-2 mb-3 text-start">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="text-start bg-light rounded-3 p-3 mb-4">
          <div className="chain-info-row">
            <span className="chain-info-label">Nama Mahasiswa:</span>
            <span className="chain-info-val">{candidateName}</span>
          </div>
          <div className="chain-info-row">
            <span className="chain-info-label">Nama Kredensial:</span>
            <span className="chain-info-val text-primary">{certTitle}</span>
          </div>
          <div className="chain-info-row">
            <span className="chain-info-label">Penerbit Kredensial:</span>
            <span className="chain-info-val d-inline-flex align-items-center gap-1.5">
              {(!certificate?.issuer || certificate.issuer.toLowerCase().includes('kampusx')) && (
                <img src={LogoKampusXNoText} alt="" style={{ width: '14px', height: '14px' }} />
              )}
              {certificate?.issuer || 'KampusX Verified Academy'}
            </span>
          </div>
          <div className="chain-info-row">
            <span className="chain-info-label">Tipe Token:</span>
            <span className="badge bg-success-subtle text-success border border-success-subtle">
              ERC-5192 (Soulbound Token)
            </span>
          </div>
          <div className="chain-info-row">
            <span className="chain-info-label">Token ID:</span>
            <span className="chain-info-val chain-mono text-dark">{tokenId}</span>
          </div>
          <div className="chain-info-row">
            <span className="chain-info-label">Smart Contract:</span>
            <span className="chain-info-val chain-mono text-truncate" style={{ maxWidth: '210px', fontSize: '11.5px' }}>
              {contractAddress}
            </span>
          </div>
          {txHash && (
            <div className="chain-info-row">
              <span className="chain-info-label">Transaction Hash:</span>
              <span className="chain-info-val chain-mono text-truncate" style={{ maxWidth: '210px', fontSize: '11.5px' }}>
                {txHash}
              </span>
            </div>
          )}
          {block && (
            <div className="chain-info-row">
              <span className="chain-info-label">Block Ledger:</span>
              <span className="chain-info-val">Polygon Amoy #{block}</span>
            </div>
          )}
        </div>

        <div className="d-flex gap-2">
          <Button variant="outline-secondary" className="w-50 rounded-pill py-2" onClick={onHide}>
            Tutup
          </Button>
          {txHash ? (
            <Button
              variant="dark"
              className="w-50 rounded-pill py-2 d-flex align-items-center justify-content-center gap-1.5"
              onClick={handleOpenExplorer}
            >
              <span>Audit On-Chain</span>
              <ExternalLink size={14} />
            </Button>
          ) : (
            <Button
              variant="primary"
              className="w-50 rounded-pill py-2"
              onClick={onHide}
            >
              Selesai
            </Button>
          )}
        </div>

        {certificate?.polygonscan_url && (
          <div className="text-center mt-2">
            <button
              type="button"
              className="btn btn-link btn-sm text-decoration-none text-muted"
              style={{ fontSize: '11.5px' }}
              onClick={handleOpenLivePolygonscan}
            >
              Lihat di PolygonScan Testnet <ExternalLink size={11} className="ms-0.5" />
            </button>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default TalentZeroTrustModal;
