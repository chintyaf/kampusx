import React from 'react';
import { Badge, Button } from 'react-bootstrap';
import { ShieldCheck, ExternalLink, Award } from 'lucide-react';
import LogoIcon from '@/assets/images/logo/icon.svg';

/**
 * Komponen CredentialCard
 * Menampilkan item kredensial Soulbound Token (ERC-5192) milik kandidat
 */
const CredentialCard = ({ certificate, onVerify }) => {
  if (!certificate) return null;

  const publicVerifyUrl = certificate.ticket_code
    ? `/certificate/verify/${certificate.ticket_code}`
    : `/public/credentials/${certificate.token_id}/verify`;

  const isKampusXIssuer = !certificate.issuer || certificate.issuer.toLowerCase().includes('kampusx');

  return (
    <div className="p-3 bg-white rounded-3 border shadow-sm mb-3">
      <div className="d-flex justify-content-between align-items-start gap-2">
        <div className="d-flex align-items-start gap-2-5">
          <div className="p-2 bg-success-subtle text-success rounded-3 mt-1">
            <Award size={20} />
          </div>
          <div>
            <div className="fw-bold text-dark">{certificate.title}</div>
            <div className="text-muted small d-flex align-items-center gap-1">
              <span>Penerbit:</span>
              {isKampusXIssuer && (
                <img
                  src={LogoIcon}
                  alt="KampusX"
                  style={{ width: '13px', height: '13px', flexShrink: 0 }}
                />
              )}
              <span className="fw-medium text-dark">{certificate.issuer || 'KampusX Verified Academy'}</span>
            </div>
            <div className="text-muted mt-1" style={{ fontSize: '11.5px' }}>
              Token ID: <span className="chain-mono text-primary fw-bold">{certificate.token_id || certificate.tokenId}</span>
              {certificate.minted_at_formatted && ` • ${certificate.minted_at_formatted}`}
            </div>
          </div>
        </div>

        <Badge bg="success-subtle" className="text-success border border-success-subtle px-2-5 py-1 d-inline-flex align-items-center gap-1 rounded-pill">
          <ShieldCheck size={13} /> Non-Transferable (ERC-5192)
        </Badge>
      </div>

      <div className="mt-3 pt-2 border-top d-flex justify-content-end gap-2 flex-wrap">
        <Button
          variant="outline-success"
          size="sm"
          className="rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1"
          style={{ fontSize: '12px' }}
          onClick={() => onVerify && onVerify(certificate)}
        >
          <ShieldCheck size={13} /> Audit On-Chain
        </Button>

        <a
          href={publicVerifyUrl}
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1"
          style={{ fontSize: '12px' }}
        >
          <ExternalLink size={13} /> Public Verifier
        </a>

        {certificate.polygonscan_url && (
          <a
            href={certificate.polygonscan_url}
            target="_blank"
            rel="noreferrer"
            className="btn btn-light btn-sm border rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1 text-muted"
            style={{ fontSize: '12px' }}
          >
            <ExternalLink size={13} /> PolygonScan
          </a>
        )}
      </div>
    </div>
  );
};

export default CredentialCard;
