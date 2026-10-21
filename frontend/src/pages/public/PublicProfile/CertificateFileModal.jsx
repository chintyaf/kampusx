import React, { useState, useRef } from 'react';
import { Modal, Button, Badge, Spinner } from 'react-bootstrap';
import {
  Download,
  Share2,
  ExternalLink,
  ShieldCheck,
  Award,
  CheckCircle2,
  Printer,
  X,
  FileText,
  Calendar,
  Check
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { Link } from 'react-router-dom';
import html2pdf from 'html2pdf.js';

const CertificateFileModal = ({
  show,
  onHide,
  certData,
  studentName = 'Peserta KampusX',
  onVerifyOnChain
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const certificateRef = useRef(null);

  if (!certData) return null;

  const ticketCode = certData.ticketCode || certData.tokenId?.replace('#', '') || 'CERT-2026-0041';
  const verificationUrl = `${window.location.origin}/certificate/verify/${ticketCode}`;
  const publicCertificateUrl = `/certificate/${ticketCode}`;

  const handleDownloadPDF = () => {
    const element = document.getElementById('certificate-print-document');
    if (!element) {
      alert('Gagal mendeteksi dokumen sertifikat.');
      return;
    }

    setIsDownloading(true);
    const cleanTitle = (certData.title || 'Sertifikat').replace(/[^a-zA-Z0-9]/g, '_');
    const cleanName = studentName.replace(/[^a-zA-Z0-9]/g, '_');

    const opt = {
      margin: 0,
      filename: `Sertifikat_${cleanTitle}_${cleanName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .then(() => {
        setIsDownloading(false);
      })
      .catch((err) => {
        console.error('Error generating PDF:', err);
        setIsDownloading(false);
        alert('Gagal mengunduh PDF sertifikat. Silakan gunakan fungsi cetak browser.');
      });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      contentClassName="border-0 shadow-2xl rounded-4 overflow-hidden"
    >
      {/* Modal Top Bar */}
      <Modal.Header closeButton className="bg-white border-bottom px-4 py-3">
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              color: '#00699e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FileText size={18} />
          </div>
          <div>
            <h6 className="fw-bold text-dark mb-0">Dokumen File E-Sertifikat Resmi</h6>
            <div className="text-muted" style={{ fontSize: '11.5px' }}>
              Nomor: <strong className="text-dark">{ticketCode}</strong> • Token ID: {certData.tokenId}
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-3 p-md-4 bg-light">
        {/* Quick Action Buttons on Top of Canvas */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 px-1">
          <div className="d-flex align-items-center gap-2">
            <Badge bg="success-subtle" className="text-success border border-success-subtle px-2.5 py-1.5 fw-semibold d-flex align-items-center gap-1">
              <CheckCircle2 size={13} /> Terverifikasi On-Chain Polygon
            </Badge>
            <Badge bg="primary-subtle" className="text-primary border border-primary-subtle px-2.5 py-1.5 fw-semibold">
              ERC-5192 Soulbound
            </Badge>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              className="rounded-pill px-3 fw-semibold d-flex align-items-center gap-1"
              onClick={handleShare}
            >
              {copiedLink ? <Check size={14} className="text-success" /> : <Share2 size={14} />}
              <span>{copiedLink ? 'Tersalin!' : 'Salin Tautan'}</span>
            </Button>

            <Link
              to={publicCertificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-semibold d-flex align-items-center gap-1"
            >
              <ExternalLink size={14} />
              <span>Buka Halaman Penuh</span>
            </Link>

            <Button
              variant="primary"
              size="sm"
              className="rounded-pill px-3 fw-bold d-flex align-items-center gap-1.5 shadow-sm"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Spinner animation="border" size="sm" style={{ width: 13, height: 13 }} />
                  <span>Mencetak...</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Unduh File PDF</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* ==================== CERTIFICATE VISUAL CANVAS ==================== */}
        <div className="d-flex justify-content-center overflow-auto py-2">
          <div
            id="certificate-print-document"
            ref={certificateRef}
            className="certificate-paper-document shadow-sm"
            style={{
              width: '100%',
              maxWidth: '880px',
              minHeight: '560px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              position: 'relative',
              overflow: 'hidden',
              border: '12px solid #0f172a',
              outline: '2px solid #d4af37',
              outlineOffset: '-7px',
              padding: '40px 48px',
              fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
              color: '#0f172a',
              boxSizing: 'border-box'
            }}
          >
            {/* Background Watermark Pattern */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'radial-gradient(circle at center, rgba(0, 105, 158, 0.03) 0%, rgba(255,255,255,0) 70%)',
                pointerEvents: 'none',
                zIndex: 1
              }}
            />

            {/* Corner Ornamental Accents */}
            <div
              style={{
                position: 'absolute',
                top: '14px',
                left: '14px',
                width: '36px',
                height: '36px',
                borderTop: '3px solid #d4af37',
                borderLeft: '3px solid #d4af37',
                pointerEvents: 'none'
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                width: '36px',
                height: '36px',
                borderTop: '3px solid #d4af37',
                borderRight: '3px solid #d4af37',
                pointerEvents: 'none'
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '14px',
                left: '14px',
                width: '36px',
                height: '36px',
                borderBottom: '3px solid #d4af37',
                borderLeft: '3px solid #d4af37',
                pointerEvents: 'none'
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '14px',
                right: '14px',
                width: '36px',
                height: '36px',
                borderBottom: '3px solid #d4af37',
                borderRight: '3px solid #d4af37',
                pointerEvents: 'none'
              }}
            />

            {/* Content Container */}
            <div style={{ position: 'relative', zIndex: 2 }} className="text-center">
              {/* KampusX Official Logo & Badge */}
              <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#00699e',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '18px'
                  }}
                >
                  K
                </div>
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    letterSpacing: '3px',
                    color: '#00699e',
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}
                >
                  KAMPUSX
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    letterSpacing: '1.5px',
                    color: '#64748b',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700
                  }}
                >
                  • VERIFIED CREDENTIALS
                </span>
              </div>

              {/* Certificate Main Title */}
              <h2
                style={{
                  fontSize: '28px',
                  fontWeight: 900,
                  letterSpacing: '2px',
                  color: '#0f172a',
                  margin: '14px 0 6px',
                  textTransform: 'uppercase'
                }}
              >
                Sertifikat Kelulusan & Keahlian
              </h2>

              <p
                style={{
                  fontSize: '12px',
                  letterSpacing: '2px',
                  color: '#64748b',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  marginBottom: '20px'
                }}
              >
                Certificate of Academic & Practical Achievement
              </p>

              {/* Recipient Statement */}
              <div
                style={{
                  fontSize: '13px',
                  fontStyle: 'italic',
                  color: '#475569',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  marginBottom: '8px'
                }}
              >
                Dengan bangga dipersembahkan kepada:
              </div>

              {/* Recipient Name */}
              <h1
                style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#00699e',
                  marginBottom: '14px',
                  letterSpacing: '0.5px'
                }}
              >
                {studentName}
              </h1>

              {/* Award Description */}
              <p
                style={{
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: '#334155',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  maxWidth: '680px',
                  margin: '0 auto 16px'
                }}
              >
                Telah berhasil menyelesaikan rangkaian evaluasi kompetensi kognitif <strong>Self-Regulated Learning (SRL)</strong>, praktikum terstandarisasi, dan dinyatakan lulus dengan predikat memuaskan pada program:
              </p>

              {/* Program / Credential Title */}
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '10px 24px',
                  marginBottom: '28px'
                }}
              >
                <h4
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#0f172a',
                    margin: 0,
                    letterSpacing: '0.5px'
                  }}
                >
                  {certData.title}
                </h4>
              </div>

              {/* Footer Section: Issuer, Signatures, QR Code & Blockchain Seal */}
              <div className="d-flex align-items-end justify-content-between pt-3 border-top border-secondary border-opacity-10 mt-2 text-start">
                {/* Left: Verification QR Code & Token Meta */}
                <div className="d-flex align-items-center gap-3">
                  <div
                    style={{
                      background: '#ffffff',
                      padding: '5px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                    }}
                  >
                    <QRCode
                      value={verificationUrl}
                      size={70}
                      style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                    />
                  </div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '11px', color: '#64748b' }}>
                    <div className="fw-bold text-dark" style={{ fontSize: '11.5px' }}>
                      Pindai untuk Verifikasi
                    </div>
                    <div>Kode: <strong className="text-dark">{ticketCode}</strong></div>
                    <div>Token: <span className="text-primary fw-semibold">{certData.tokenId}</span></div>
                    <div style={{ fontSize: '10px', color: '#059669' }}>✓ Polygon EVM Ledger</div>
                  </div>
                </div>

                {/* Center: Gold Soulbound Seal Badge */}
                <div className="text-center d-none d-md-block">
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #fef08a 0%, #ca8a04 100%)',
                      border: '3px double #ffffff',
                      boxShadow: '0 4px 12px rgba(202, 138, 4, 0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#78350f',
                      fontWeight: 900,
                      fontSize: '9px',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      margin: '0 auto 4px'
                    }}
                  >
                    <Award size={18} />
                    <span>SOULBOUND</span>
                  </div>
                  <span
                    style={{
                      fontSize: '9.5px',
                      letterSpacing: '0.8px',
                      fontWeight: 700,
                      color: '#854d0e',
                      fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}
                  >
                    PERMANENT SBT
                  </span>
                </div>

                {/* Right: Authority & Date */}
                <div className="text-end" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '24px' }}>
                    Diterbitkan pada {certData.date}
                  </div>
                  <div
                    style={{
                      borderBottom: '1.5px solid #0f172a',
                      paddingBottom: '2px',
                      fontWeight: 800,
                      fontSize: '13px',
                      color: '#0f172a'
                    }}
                  >
                    {certData.issuer || 'KampusX Verified Authority'}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                    Dewan Kurikulum & Sertifikasi Kompetensi
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="bg-white px-4 py-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          {onVerifyOnChain && (
            <Button
              variant="outline-success"
              size="sm"
              className="rounded-pill px-3 fw-bold d-flex align-items-center gap-1.5"
              onClick={() => {
                onHide();
                onVerifyOnChain(certData);
              }}
            >
              <ShieldCheck size={15} /> Verifikasi di Smart Contract
            </Button>
          )}
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="rounded-pill px-4 fw-semibold"
          onClick={onHide}
        >
          Tutup
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CertificateFileModal;
