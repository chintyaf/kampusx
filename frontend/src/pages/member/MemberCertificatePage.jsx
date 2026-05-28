import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { Award, QrCode, Calendar, ExternalLink, Building, Lock, Download, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import html2pdf from 'html2pdf.js';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/api/axios';

export default function MemberCertificatePage() {
    const [certificates, setCertificates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showQrModal, setShowQrModal] = useState(false);
    const [selectedCert, setSelectedCert] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const previewContainerRef = useRef(null);
    const [previewWidth, setPreviewWidth] = useState(720);

    useEffect(() => {
        if (!showPreviewModal || !previewContainerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const width = entry.contentRect.width;
                if (width > 0) setPreviewWidth(width);
            }
        });

        observer.observe(previewContainerRef.current);
        return () => observer.disconnect();
    }, [showPreviewModal, selectedCert]);

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get('/my-certificates');
            if (response.data.success) {
                setCertificates(response.data.data);
            } else {
                setError('Gagal memuat sertifikat Anda.');
            }
        } catch (err) {
            console.error('Failed to load certificates:', err);
            setError(err.response?.data?.message || 'Gagal terhubung ke server.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleShowPreview = (cert) => {
        setSelectedCert(cert);
        setShowPreviewModal(true);
    };

    const handleShowQR = (cert) => {
        setSelectedCert(cert);
        setShowQrModal(true);
    };

    const handleDownloadPDF = (cert) => {
        const element = document.getElementById('member-certificate-preview-area');
        if (!element) {
            toast.error('Gagal mendeteksi area sertifikat.');
            return;
        }

        const width = element.offsetWidth;
        const height = element.offsetHeight;

        // Convert pixels to points (1 px = 0.75 pt)
        const pdfWidth = Math.round(width * 0.75);
        const pdfHeight = Math.round(height * 0.75) + 2; // Add 2pt safety buffer to prevent overflow second page breaks

        const opt = {
            margin: 0,
            filename: `Sertifikat_${cert.event.title.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { 
                scale: 3, // 3x scale for ultra high resolution
                useCORS: true, 
                allowTaint: true,
                logging: false 
            },
            jsPDF: { 
                unit: 'pt', 
                format: [pdfWidth, pdfHeight], 
                orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait' 
            },
            pagebreak: { mode: 'avoid-all' }
        };

        toast.promise(
            html2pdf().from(element).set(opt).save(),
            {
                loading: 'Sedang memproses unduhan sertifikat...',
                success: 'Sertifikat PDF berhasil diunduh!',
                error: 'Gagal mengunduh sertifikat.',
            }
        );
    };

    return (
        <div className="bg-light min-vh-100 py-5">
            <Toaster position="top-right" />
            <Container>
                {/* Header Section */}
                <div className="d-flex align-items-center justify-content-between mb-5 flex-wrap gap-3">
                    <div>
                        <h2 className="fw-bold text-dark d-flex align-items-center gap-3 mb-1">
                            <div className="bg-primary bg-opacity-10 text-primary p-2.5 rounded-4 d-inline-flex border border-primary border-opacity-10 shadow-sm animate-pulse">
                                <Award size={30} />
                            </div>
                            Pusat Sertifikat Anda
                        </h2>
                        <p className="text-muted mb-0">Eksplor, klaim, dan unduh sertifikat resmi atas partisipasi aktif Anda di berbagai event KampusX.</p>
                    </div>
                </div>

                {error && (
                    <Alert variant="danger" className="border-0 shadow-sm rounded-4 p-4 mb-4">
                        <div className="d-flex gap-3 align-items-center">
                            <AlertCircle size={24} className="text-danger flex-shrink-0" />
                            <div>
                                <h6 className="fw-bold mb-1">Terjadi Kesalahan</h6>
                                <p className="mb-0 small">{error}</p>
                            </div>
                        </div>
                    </Alert>
                )}

                {/* Loading State */}
                {isLoading ? (
                    <div className="d-flex flex-column align-items-center justify-content-center py-5 my-5">
                        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                        <p className="text-muted mt-3 fw-medium">Menghubungkan ke Pusat Sertifikat...</p>
                    </div>
                ) : certificates.length === 0 ? (
                    /* Empty State */
                    <Card className="border-0 shadow-sm rounded-4 text-center p-5 my-4">
                        <Card.Body className="py-5">
                            <div className="bg-light text-secondary rounded-circle p-4 d-inline-flex mb-4 border border-2 border-dashed">
                                <Award size={48} className="opacity-75" />
                            </div>
                            <h4 className="fw-bold text-dark mb-2">Belum Ada Sertifikat</h4>
                            <p className="text-muted mx-auto mb-4 small" style={{ maxWidth: '420px' }}>
                                Sertifikat akan muncul di sini setelah Anda check-in / menghadiri acara dan menyelesaikan survei kepuasan pelanggan.
                            </p>
                            <Link to="/explore-events">
                                <Button variant="primary" className="rounded-pill px-4 fw-bold shadow">Eksplor Event KampusX</Button>
                            </Link>
                        </Card.Body>
                    </Card>
                ) : (
                    /* Certificates List */
                    <Row className="g-4">
                        {certificates.map((cert) => {
                            const certId = `CERT-${cert.event.id}-${cert.survey_response?.id || '00000'}`;
                            return (
                                <Col md={6} lg={4} key={cert.ticket_code}>
                                    <Card className="border-0 shadow-sm h-100 overflow-hidden rounded-4 transition-all hover-translate-y border border-secondary border-opacity-10 d-flex flex-column">
                                        {/* Certificate Image Header */}
                                        <div className="position-relative bg-secondary bg-opacity-25" style={{ height: '170px', overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    backgroundImage: cert.certificate_template?.background_url
                                                        ? `url(${cert.certificate_template.background_url})`
                                                        : `url(https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    width: '100%',
                                                    height: '100%',
                                                    filter: cert.is_unlocked ? 'none' : 'blur(5px) grayscale(50%)',
                                                    transition: 'all 0.4s ease'
                                                }}
                                            />
                                            {!cert.is_unlocked && (
                                                <div
                                                    className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center text-white"
                                                    style={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(2px)' }}
                                                >
                                                    <div className="bg-warning bg-opacity-20 text-warning p-2 rounded-circle border border-warning border-opacity-25 mb-2">
                                                        <Lock size={20} className="animate-bounce" />
                                                    </div>
                                                    <span className="fw-bold small letter-spacing-1">Sertifikat Terkunci</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Certificate Content Body */}
                                        <Card.Body className="p-4 d-flex flex-column flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <Badge
                                                    bg={cert.is_unlocked ? 'success-subtle' : 'warning-subtle'}
                                                    className={`px-3 py-1.5 rounded-pill fw-semibold ${cert.is_unlocked ? 'text-success border border-success border-opacity-10' : 'text-warning border border-warning border-opacity-10'}`}
                                                >
                                                    {cert.is_unlocked ? '✓ Terbuka' : '⚡ Klaim'}
                                                </Badge>
                                                <span className="text-muted small fw-mono">{certId}</span>
                                            </div>

                                            <Card.Title className="fw-bold text-dark mb-3 text-truncate" style={{ fontSize: '1.1rem' }} title={cert.event.title}>
                                                {cert.event.title}
                                            </Card.Title>

                                            <div className="text-muted small mb-4 mt-auto">
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    <Building size={14} className="text-secondary" />
                                                    <span className="text-truncate" style={{ maxWidth: '240px' }}>{cert.event.organizer_name}</span>
                                                </div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <Calendar size={14} className="text-secondary" /> {cert.event.date}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="d-flex gap-2 w-100">
                                                {cert.is_unlocked ? (
                                                    <>
                                                        <Button
                                                            variant="primary"
                                                            onClick={() => handleShowPreview(cert)}
                                                            className="flex-grow-1 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                                                        >
                                                            <Sparkles size={16} /> Preview & Unduh
                                                        </Button>
                                                        <Button
                                                            variant="outline-dark"
                                                            onClick={() => handleShowQR(cert)}
                                                            className="rounded-circle p-2.5 d-flex align-items-center justify-content-center shadow-sm"
                                                            title="Tampilkan QR Code Verifikasi"
                                                        >
                                                            <QrCode size={18} />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Link to={`/event-space/${cert.event.id}/survey`} className="w-100 text-decoration-none">
                                                        <Button
                                                            variant="warning"
                                                            className="w-100 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                                                        >
                                                            Isi Survei & Klaim <ArrowRight size={16} />
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                )}
            </Container>

            {/* QR Code Verification Modal */}
            <Modal show={showQrModal} onHide={() => setShowQrModal(false)} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Verifikasi Publik E-Sertifikat</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-4">
                    {selectedCert && (
                        <>
                            <div className="bg-white p-3.5 rounded-4 d-inline-block border mb-4 shadow-sm">
                                <QRCode value={`${window.location.origin}/certificate/verify/CERT-${selectedCert.event.id}-${selectedCert.survey_response?.id || '00000'}`} size={180} />
                            </div>
                            <h5 className="fw-bold text-dark mb-1">{selectedCert.event.title}</h5>
                            <p className="text-muted small mb-4">{selectedCert.event.organizer_name} • {selectedCert.event.date}</p>

                            <div className="bg-light p-3.5 rounded-4 text-start mb-4 border" style={{ borderStyle: 'dashed' }}>
                                <div className="small text-muted mb-1.5 d-flex justify-content-between align-items-center">
                                    <span>Tautan Verifikasi Keaslian:</span>
                                    <ExternalLink size={13} className="text-secondary" />
                                </div>
                                <div className="fw-mono fs-6 text-dark user-select-all font-semibold" style={{ wordBreak: 'break-all', fontSize: '13px' }}>
                                    {window.location.origin}/certificate/verify/CERT-{selectedCert.event.id}-{selectedCert.survey_response?.id || '00000'}
                                </div>
                            </div>
                            <Button
                                variant="primary"
                                className="w-100 rounded-pill py-2 fw-bold shadow-sm"
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/certificate/verify/CERT-${selectedCert.event.id}-${selectedCert.survey_response?.id || '00000'}`);
                                    toast.success("Tautan berhasil disalin!");
                                }}
                            >
                                Salin Tautan Verifikasi
                            </Button>
                        </>
                    )}
                </Modal.Body>
            </Modal>

            {/* Live Certificate Preview Modal */}
            <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} size="lg" centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Preview E-Sertifikat</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-4">
                    {selectedCert && selectedCert.certificate_template ? (
                        (() => {
                            const template = selectedCert.certificate_template;
                            const certId = `CERT-${selectedCert.event.id}-${selectedCert.survey_response?.id || '00000'}`;
                            const attendeeName = selectedCert.attendee_name || selectedCert.survey_response?.user?.name || selectedCert.event.organizer_name || 'Peserta Kelas';
                            
                            return (
                                <div className="d-flex flex-column align-items-center">
                                    {/* Beautiful outer wrapper containing border, border radius, shadow, and margin */}
                                    <div
                                        className="bg-white overflow-hidden border rounded-4 shadow-sm w-100 mb-4"
                                        style={{ maxWidth: '720px' }}
                                    >
                                        {/* Pure target container for PDF screenshot with ZERO margins, borders, paddings, or shadow */}
                                        <div 
                                            id="member-certificate-preview-area"
                                            ref={previewContainerRef}
                                            className="position-relative w-100 overflow-hidden" 
                                            style={{ 
                                                aspectRatio: `${template.canvas_width || 1920}/${template.canvas_height || 1080}`
                                            }}
                                        >
                                            <img 
                                                src={template.background_url} 
                                                alt="Certificate Background" 
                                                className="w-100 h-100"
                                                crossOrigin="anonymous"
                                                style={{ display: 'block', objectFit: 'cover' }}
                                            />
                                            
                                            {/* Render Elements Dynamically inside the live preview */}
                                            {template.elements.map((el) => {
                                                const xPct = el.position_x;
                                                const yPct = el.position_y;
                                                
                                                if (el.element_type === 'qr_code') {
                                                    const qrSize = ((el.font_size || 80) / (template.canvas_width || 1920)) * previewWidth;
                                                    const qrPadding = (4 / (template.canvas_width || 1920)) * previewWidth;
                                                    
                                                    return (
                                                        <div 
                                                            key={el.id}
                                                            className="position-absolute bg-white"
                                                            style={{
                                                                left: `${xPct}%`,
                                                                top: `${yPct}%`,
                                                                transform: 'translate(-50%, -50%)',
                                                                borderRadius: `${qrPadding}px`,
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                                width: `${qrSize}px`,
                                                                height: `${qrSize}px`,
                                                                padding: `${qrPadding}px`,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                        >
                                                            <QRCode 
                                                                value={`${window.location.origin}/certificate/verify/${certId}`}
                                                                size={Math.max(16, Math.round(qrSize) - 8)}
                                                                fgColor={el.font_color === '#ffffff' ? '#000000' : el.font_color}
                                                                bgColor="#ffffff"
                                                                style={{ height: '100%', width: '100%' }}
                                                            />
                                                        </div>
                                                    );
                                                } else {
                                                    const content = el.element_type === 'nama_peserta'
                                                        ? attendeeName
                                                        : el.element_type === 'id_sertifikat'
                                                            ? certId
                                                            : el.element_type === 'nama_event'
                                                                ? selectedCert.event.title
                                                                : el.element_type === 'tanggal'
                                                                    ? selectedCert.event.date
                                                                    : el.element_type === 'instansi'
                                                                        ? selectedCert.event.organizer_name
                                                                        : el.custom_value || '';
                                                    
                                                    const isBold = el.font_family?.includes('|bold') || el.element_type === 'nama_peserta';
                                                    const fontFamily = el.font_family?.replace('|bold', '') || 'Georgia, serif';
                                                    const scaledFontSize = (el.font_size / (template.canvas_width || 1920)) * previewWidth;
                                                    
                                                    return (
                                                        <div 
                                                            key={el.id}
                                                            className="position-absolute text-nowrap lh-1 text-center"
                                                            style={{
                                                                left: `${xPct}%`,
                                                                top: `${yPct}%`,
                                                                transform: 'translate(-50%, -50%)',
                                                                fontSize: `${scaledFontSize}px`,
                                                                color: el.font_color || '#000',
                                                                fontFamily: fontFamily,
                                                                fontWeight: isBold ? 'bold' : 'normal',
                                                            }}
                                                        >
                                                            {content}
                                                        </div>
                                                    );
                                                }
                                            })}
                                        </div>
                                    </div>
                                    
                                    <div className="d-flex gap-2 w-100 justify-content-center">
                                        <Button
                                            variant="success"
                                            onClick={() => {
                                                handleDownloadPDF(selectedCert);
                                                setShowPreviewModal(false);
                                            }}
                                            className="rounded-pill py-2.5 px-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                                        >
                                            <Download size={18} /> Unduh PDF Resmi
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => setShowPreviewModal(false)}
                                            className="rounded-pill px-4 fw-semibold"
                                        >
                                            Tutup
                                        </Button>
                                    </div>
                                </div>
                            );
                        })()
                    ) : selectedCert ? (
                        /* Fallback Layout Preview if no template */
                        <div className="d-flex flex-column align-items-center">
                            {/* Outer wrapper to handle margin, border-radius, and shadow */}
                            <div
                                className="bg-white overflow-hidden border rounded-4 shadow-sm w-100 mb-4"
                                style={{ maxWidth: '720px' }}
                            >
                                {/* Pure target container for PDF screenshot with ZERO margins, borders, paddings, or shadow */}
                                <div 
                                    id="member-certificate-preview-area"
                                    className="position-relative w-100 p-5 text-center animate-fade-in" 
                                    style={{ 
                                        aspectRatio: '1120/792',
                                        border: '15px double #d4af37',
                                        fontFamily: 'Georgia, serif',
                                        boxSizing: 'border-box',
                                        backgroundColor: '#ffffff'
                                    }}
                                >
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111', letterSpacing: '2px', marginBottom: '5px' }}>SERTIFIKAT APRESIASI</div>
                                    <div style={{ fontSize: '10px', color: '#777', letterSpacing: '1px', marginBottom: '25px' }}>NOMOR: CERT-{selectedCert.event.id}-00000</div>
                                    <div style={{ fontSize: '12px', color: '#555', fontStyle: 'italic', marginBottom: '8px' }}>Dengan bangga diberikan kepada:</div>
                                    <div style={{ fontSize: '26px', fontWeight: 'bold', textDecoration: 'underline', color: '#1A365D', textTransform: 'uppercase', marginBottom: '15px' }}>
                                        {selectedCert.attendee_name || 'Peserta Kelas'}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#444', lineHeight: '1.6', marginBottom: '10px' }}>
                                        Atas keberhasilan menyelesaikan seluruh rangkaian pembelajaran dan evaluasi dengan predikat Kelulusan Resmi pada event bertajuk:
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', marginBottom: '30px' }}>"{selectedCert.event.title}"</div>
                                    
                                    <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top" style={{ fontSize: '10px' }}>
                                        <div className="text-start">
                                            <div className="text-muted">Penyelenggara:</div>
                                            <div className="fw-bold">{selectedCert.event.organizer_name}</div>
                                        </div>
                                        <div>
                                            <QRCode value={`${window.location.origin}/certificate/verify/CERT-${selectedCert.event.id}-00000`} size={48} />
                                        </div>
                                        <div className="text-end">
                                            <div className="text-muted">Diterbitkan:</div>
                                            <div className="fw-bold">{selectedCert.event.date}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="d-flex gap-2 w-100 justify-content-center">
                                <Button
                                    variant="success"
                                    onClick={() => {
                                        handleDownloadPDF(selectedCert);
                                        setShowPreviewModal(false);
                                    }}
                                    className="rounded-pill py-2.5 px-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                                >
                                    <Download size={18} /> Unduh PDF Resmi
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => setShowPreviewModal(false)}
                                    className="rounded-pill px-4 fw-semibold"
                                >
                                    Tutup
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </Modal.Body>
            </Modal>
        </div>
    );
}
