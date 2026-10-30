import React from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import { CheckCircle2, ExternalLink, ShieldCheck, Lock } from 'lucide-react';
import { formatAddress, formatTxHash } from '../utils/cosineSimilarity';

const TalentZeroTrustModal = ({ show, onHide, talent }) => {
  if (!talent) return null;

  const sbt = talent.latestSbt || (talent.sbtList && talent.sbtList[0]) || {
    tokenId: '#SBT-2026-0041',
    title: 'Soulbound Academic Credential',
    contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
    txHash: '0x94f1c8a73b22e185c899d214c718b90a61849f2b87e91402ba815349e5d4cb3c',
    block: '58,219,044',
    date: '28 Sep 2026'
  };

  const handleOpenPolygonExplorer = () => {
    const tx = sbt.txHash || '0x94f1c8a73b22e185c899d214c718b90a61849f2b87e91402ba815349e5d4cb3c';
    window.open(`/blockchain/explorer/tx/${tx}`, '_blank');
  };

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
            <span className="fw-bold text-dark">{talent.name}</span>
          </div>
          <div className="chain-info-row">
            <span className="chain-info-label">Kredensial:</span>
            <span className="fw-bold text-primary">{sbt.title}</span>
          </div>
          <div className="chain-info-row">
            <span className="chain-info-label">Standar Token:</span>
            <span className="badge bg-success-subtle text-success border border-success-subtle">
              ERC-5192 (Soulbound / Non-Transferable)
            </span>
          </div>
          <div className="chain-info-row">
            <span className="chain-info-label">Token ID:</span>
            <span className="chain-info-val fw-bold">{sbt.tokenId}</span>
          </div>
          <div className="chain-info-row">
            <span className="chain-info-label">Smart Contract:</span>
            <span className="chain-info-val text-truncate mono" style={{ maxWidth: '210px', fontSize: '11.5px' }}>
              {sbt.contractAddress}
            </span>
          </div>
          <div className="chain-info-row">
            <span className="chain-info-label">Wallet Pemilik:</span>
            <span className="chain-info-val mono" style={{ fontSize: '11.5px' }}>
              {formatAddress(talent.walletAddress)}
            </span>
          </div>
          <div className="chain-info-row">
            <span className="chain-info-label">Transaction Hash:</span>
            <span className="chain-info-val text-truncate mono" style={{ maxWidth: '210px', fontSize: '11.5px' }}>
              {sbt.txHash}
            </span>
          </div>
          <div className="chain-info-row">
            <span className="chain-info-label">Block Ledger:</span>
            <span className="chain-info-val">Polygon Amoy #{sbt.block || '58,219,044'}</span>
          </div>
        </div>

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
            onClick={handleOpenPolygonExplorer}
          >
            Cek di Polygonscan <ExternalLink size={14} />
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default TalentZeroTrustModal;
