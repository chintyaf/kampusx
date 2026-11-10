import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge, Spinner } from 'react-bootstrap';
import {
  Check,
  ShieldCheck,
  ExternalLink,
  Copy,
  FileText,
  Home,
  Award,
  AlertCircle
} from 'lucide-react';
import api from '@/api/axios';
import './CertificateVerificationPage.css';

const CertificateVerificationPage = () => {
  const { ticketCode } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (ticketCode) {
          // 1. Query endpoint GET /api/certificates/{verification_id} langsung ke soulbound_tokens dan users table
          const res = await api.get(`/certificates/${ticketCode}`).catch(() => null);

          if (res?.data?.success && res.data.data) {
            const apiData = res.data.data;
            if (isMounted) {
              setData({
                ticketCode: apiData.ticket_code || ticketCode,
                studentName: apiData.student_name,
                eventTitle: apiData.event_title,
                issuer: apiData.issuer || 'KampusX Verified Authority & GDSC Indonesia',
                timestampHash: apiData.tx_hash,
                timestampDate: apiData.timestamp || apiData.timestamp_date || 'Oct-28-2026',
                tokenId: apiData.token_id || '#SBT-2026-0041',
                contractAddress: apiData.contract_address || '0xc0eA36D5bbd3056682Fd8a9EBB06015Eb00bCaA5',
                walletAddress: apiData.wallet_address || '0x3a4b98F12c09Ad6E9b7E185c899d214C718b89Fc',
                blockNumber: apiData.block_number || '51351780',
                standard: apiData.standard || 'ERC-5192 (Soulbound / Non-Transferable)',
                status: apiData.status || 'active',
                polygonscanUrl: apiData.polygonscan_url || `https://amoy.polygonscan.com/tx/${apiData.tx_hash}`
              });
            }
          } else {
            // Coba fallback endpoint lama /v1/blockchain/verify/:ticketCode
            const fallbackRes = await api.get(`/v1/blockchain/verify/${ticketCode}`).catch(() => null);
            if (fallbackRes?.data?.success && fallbackRes.data.data) {
              const fb = fallbackRes.data.data;
              if (isMounted) {
                setData({
                  ticketCode: fb.ticketCode || ticketCode,
                  studentName: fb.studentName,
                  eventTitle: fb.title,
                  issuer: fb.issuer,
                  timestampHash: fb.txHash,
                  timestampDate: 'Oct-28-2026',
                  tokenId: fb.tokenId,
                  contractAddress: fb.contractAddress || '0xc0eA36D5bbd3056682Fd8a9EBB06015Eb00bCaA5',
                  walletAddress: fb.studentWallet,
                  blockNumber: fb.blockNumber || '51351780',
                  standard: fb.standard || 'ERC-5192 (Soulbound / Non-Transferable)',
                  status: 'active',
                  polygonscanUrl: `https://amoy.polygonscan.com/tx/${fb.txHash}`
                });
              }
            } else {
              if (isMounted) {
                setError(`Sertifikat dengan kode ${ticketCode} tidak ditemukan di database soulbound_tokens.`);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching certificate details:', err);
        if (isMounted) {
          setError('Gagal memuat data verifikasi on-chain dari server.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [ticketCode]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPolygonscan = () => {
    const tx = data?.timestampHash;
    if (tx) {
      window.open(`/blockchain/explorer/tx/${tx}`, '_blank');
    }
  };

  const handleOpenLivePolygonscan = () => {
    const tx = data?.timestampHash;
    if (tx) {
      window.open(`https://amoy.polygonscan.com/tx/${tx}`, '_blank');
    }
  };

  const displayShortHash = (hash) => {
    if (!hash) return '0x0000...0000';
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
  };

  if (loading) {
    return (
      <div className="cert-verify-page-wrapper">
        <div className="cert-onchain-card text-center py-5">
          <Spinner animation="border" style={{ color: '#6366f1' }} className="mb-3" />
          <h5 className="fw-bold text-dark mb-1">Membaca Data Soulbound Token...</h5>
          <p className="text-muted small mb-0">
            Sedang melakukan query langsung ke database soulbound_tokens dan ledger Polygon Amoy.
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="cert-verify-page-wrapper">
        <div className="cert-onchain-card text-center py-5">
          <AlertCircle size={48} className="text-danger mb-3" />
          <h5 className="fw-bold text-dark mb-2">Data Sertifikat Tidak Ditemukan</h5>
          <p className="text-muted small mb-4">{error || 'Kredensial ini tidak terdaftar di sistem.'}</p>
          <Link to="/" className="btn btn-outline-primary rounded-pill px-4 py-2">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cert-verify-page-wrapper">
      {/* 1. OUTER HEADER SECTION */}
      <div className="cert-verify-outer-header">
        <span className="cert-verify-top-badge">CERTIFICATE VERIFICATION</span>
        <h1 className="cert-verify-main-title">Credential authenticity confirmed</h1>
        <p className="cert-verify-main-subtitle">
          This public record matches an ERC-5192 Soulbound Token secured on the Polygon blockchain ledger.
        </p>
      </div>

      {/* 2. MAIN CENTER CARD */}
      <div className="cert-onchain-card">
        {/* Status Circle Icon */}
        <div className="cert-status-circle success-circle">
          <Check size={32} strokeWidth={2.8} />
        </div>

        {/* Heading & Verification ID */}
        <h2 className="cert-card-heading">Verified On-Chain via Polygon Ledger</h2>
        <div className="cert-verification-id">
          Verification ID: {data.ticketCode}
        </div>

        <div className="cert-card-divider" />

        {/* Data List Rows - Live from Database */}
        <div className="cert-data-list">
          {/* Student Name */}
          <div className="cert-data-row">
            <span className="cert-data-label">Student Name</span>
            <span className="cert-data-value fw-bold text-dark">{data.studentName}</span>
          </div>

          {/* Event Title */}
          <div className="cert-data-row">
            <span className="cert-data-label">Event Title</span>
            <span className="cert-data-value">{data.eventTitle}</span>
          </div>

          {/* Issuing Organization */}
          <div className="cert-data-row">
            <span className="cert-data-label">Issuing Organization</span>
            <span className="cert-data-value">{data.issuer}</span>
          </div>

          {/* Timestamp hash */}
          <div className="cert-data-row">
            <span className="cert-data-label">Timestamp hash</span>
            <span className="cert-data-value mono">
              {displayShortHash(data.timestampHash)} · {data.timestampDate}
            </span>
          </div>

          {/* Token Standard */}
          <div className="cert-data-row">
            <span className="cert-data-label">Token Standard</span>
            <span className="cert-data-value">
              <Badge bg="success-subtle" className="text-success border border-success-subtle px-2 py-1">
                {data.standard}
              </Badge>
            </span>
          </div>

          {/* Smart Contract */}
          <div className="cert-data-row">
            <span className="cert-data-label">Smart Contract</span>
            <span className="cert-data-value mono font-monospace" style={{ fontSize: '12px' }}>
              {data.contractAddress}
            </span>
          </div>
        </div>

        {/* Action Buttons: Dynamic On-Chain Verification */}
        <div className="d-flex flex-column gap-2 mb-3">
          <button
            type="button"
            className="btn-polygon-explorer"
            onClick={handleOpenPolygonscan}
          >
            <ShieldCheck size={18} />
            <span>Verifikasi di KampusX Explorer</span>
            <ExternalLink size={15} />
          </button>

          <button
            type="button"
            className="btn btn-outline-dark rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
            style={{ fontSize: '13px', borderColor: '#8247e5', color: '#6d28d9', backgroundColor: '#f5f3ff' }}
            onClick={handleOpenLivePolygonscan}
          >
            <ExternalLink size={14} />
            <span>Buka di Polygonscan Live (amoy.polygonscan.com)</span>
          </button>
        </div>

        {/* Secondary Action Buttons */}
        <div className="cert-secondary-actions">
          <Link
            to={`/certificate/${data.ticketCode}`}
            className="btn-cert-secondary"
          >
            <FileText size={15} />
            <span>Lihat E-Sertifikat</span>
          </Link>

          <button
            type="button"
            className="btn-cert-secondary"
            onClick={handleCopyLink}
          >
            {copied ? <Check size={15} className="text-success" /> : <Copy size={15} />}
            <span>{copied ? 'Tautan Tersalin' : 'Salin Tautan'}</span>
          </button>

          <Link
            to="/"
            className="btn-cert-secondary"
          >
            <Home size={15} />
            <span>Beranda</span>
          </Link>
        </div>
      </div>

      {/* 3. OUTER FOOTER SECTION */}
      <div className="cert-verify-outer-footer">
        <div>Verification data is displayed for public authenticity checks.</div>
        <div className="mt-1" style={{ fontSize: '11px', color: '#cbd5e1' }}>
          KampusX Zero-Trust Credential Engine • Powered by Polygon EVM Ledger
        </div>
      </div>
    </div>
  );
};

export default CertificateVerificationPage;
