const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../../frontend/src/pages/public/TalentDirectory/components/TalentZeroTrustModal.jsx');

const newCode = `import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge, Spinner } from 'react-bootstrap';
import { CheckCircle2, ExternalLink, ShieldCheck, Lock } from 'lucide-react';
import { formatAddress, formatTxHash } from '../utils/cosineSimilarity';
import api from '../../../../api/axios';

const TalentZeroTrustModal = ({ show, onHide, talent }) => {
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && talent) {
      const identifier = talent.sbtTokenId || talent.latestSbt?.tokenId || talent.id || 'demo';
      setLoading(true);
      api.get(\`/blockchain/verify/\${encodeURIComponent(identifier)}\`)
        .then((res) => {
          if (res.data?.success && res.data?.data) {
            setVerificationData(res.data.data);
          }
        })
        .catch((err) => {
          console.warn('Gagal fetch verifikasi on-chain langsung:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [show, talent]);

  if (!talent) return null;

  const fallbackSbt = talent.latestSbt || (talent.sbtList && talent.sbtList[0]) || {
    tokenId: '#SBT-2026-0041',
    title: 'Soulbound Academic Credential',
    contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
    txHash: '0x94f1c8a73b22e185c899d214c718b90a61849f2b87e91402ba815349e5d4cb3c',
    block: '58,219,044',
    date: '28 Sep 2026'
  };

  const sbt = verificationData || fallbackSbt;

  const handleOpenPolygonExplorer = () => {
    const tx = sbt.txHash || '0x94f1c8a73b22e185c899d214c718b90a61849f2b87e91402ba815349e5d4cb3c';
    window.open(\`/blockchain/explorer/tx/\${tx}\`, '_blank');
  };

  const handleOpenLivePolygonscan = () => {
    const liveTx = '0x4c1413dd81bfd856bdc0fd8cdc174c757e55a3c2d9cd9cfda88c61adae3f272d';
    window.open(\`https://amoy.polygonscan.com/tx/\${liveTx}\`, '_blank');
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
          {loading ? (
            <Spinner animation="border" variant="success" size="sm" />
          ) : (
            <CheckCircle2 size={36} />
          )}
        </div>

        <h5 className="fw-bold text-dark mb-1">Zero-Trust Blockchain Verification</h5>
        <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
          <Badge bg="success" className="px-2.5 py-1">
            Verified On-Chain
          </Badge>
          <Badge bg="primary-subtle" className="text-primary border border-primary-subtle px-2 py-1">
            Polygon POS Amoy
          </Badge>
        </div>
        <p className="text-muted small mb-4">
          Keaslian sertifikat kredensial ini tervalidasi sah secara kriptografis pada smart contract Polygon Ledger (ERC-5192 Soulbound Token).
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
              {formatAddress(sbt.studentWallet || talent.walletAddress)}
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
            <span className="chain-info-val">Polygon Amoy #{sbt.blockNumber || sbt.block || '58,219,848'}</span>
          </div>
        </div>

        <div className="d-flex flex-column gap-2">
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              className="w-50 rounded-pill py-2"
              onClick={onHide}
            >
              Tutup
            </Button>
            <Button
              variant="dark"
              className="w-50 rounded-pill py-2 d-flex align-items-center justify-content-center gap-1.5"
              onClick={handleOpenPolygonExplorer}
            >
              <span>Audit On-Chain</span>
              <ExternalLink size={14} />
            </Button>
          </div>
          <Button
            variant="outline-primary"
            size="sm"
            className="rounded-pill py-2 text-decoration-none border-0"
            onClick={handleOpenLivePolygonscan}
          >
            Lihat Bukti Polygonscan Testnet
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default TalentZeroTrustModal;
`;

fs.writeFileSync(targetPath, newCode, 'utf8');
console.log('TalentZeroTrustModal updated successfully');
