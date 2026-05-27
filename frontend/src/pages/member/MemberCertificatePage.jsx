import React, { useState, useEffect } from 'react';
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

    const handleShowQR = (cert) => {
        setSelectedCert(cert);
        setShowQrModal(true);
    };

    const handleDownloadPDF = (cert) => {
        // Create a temporary hidden DOM container to render the PDF properly
        const certContainer = document.createElement('div');
        certContainer.style.position = 'fixed';
        certContainer.style.left = '-9999px';
        certContainer.style.top = '-9999px';
        certContainer.style.width = '1120px';
        certContainer.style.height = '792px';
        certContainer.style.background = '#fff';
        document.body.appendChild(certContainer);

        const template = cert.certificate_template;
        const certId = `CERT-${cert.event.id}-${cert.survey_response?.id || '00000'}`;
        const attendeeName = cert.survey_response?.user?.name || cert.event.organizer_name || 'Peserta Kelas';

        if (template) {
            // Render beautiful coordinated certificate template
            certContainer.innerHTML = `
                <div id="certificate-print-render" style="position: relative; width: 1120px; height: 792px; background-image: url('${template.background_url}'); background-size: cover; background-position: center; overflow: hidden; background-color: #fff;">
                </div>
            `;
            const innerDiv = certContainer.querySelector('#certificate-print-render');

            template.elements.forEach((el) => {
                const xPct = (el.position_x / template.canvas_width) * 100;
                const yPct = (el.position_y / template.canvas_height) * 100;

                if (el.element_type === 'qr_code') {
                    const qrWrap = document.createElement('div');
                    qrWrap.style.position = 'absolute';
                    qrWrap.style.left = `${xPct}%`;
                    qrWrap.style.top = `${yPct}%`;
                    qrWrap.style.transform = 'translate(-50%, -50%)';
                    qrWrap.style.background = 'white';
                    qrWrap.style.padding = '4px';
                    qrWrap.style.borderRadius = '4px';

                    // Standard QR code placeholder (html2pdf captures standard img better or inline SVG)
                    qrWrap.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${window.location.origin}/certificate/verify/${certId}" style="width: 50px; height: 50px; display: block;" />`;
                    innerDiv.appendChild(qrWrap);
                } else {
                    const content = el.element_type === 'nama_peserta'
                        ? attendeeName
                        : el.element_type === 'id_sertifikat'
                            ? certId
                            : el.custom_value || '';

                    const textEl = document.createElement('div');
                    textEl.style.position = 'absolute';
                    textEl.style.left = `${xPct}%`;
                    textEl.style.top = `${yPct}%`;
                    textEl.style.transform = `translate(${el.text_align === 'center' ? '-50%' : el.text_align === 'right' ? '-100%' : '0%'}, -50%)`;
                    textEl.style.textAlign = el.text_align || 'center';
                    textEl.style.fontSize = `${el.font_size}px`;
                    textEl.style.color = el.font_color || '#000';
                    textEl.style.fontFamily = el.font_family || 'Georgia, serif';
                    textEl.style.fontWeight = el.element_type === 'nama_peserta' ? 'bold' : 'normal';
                    textEl.style.whiteSpace = 'nowrap';
                    textEl.innerText = content;
                    innerDiv.appendChild(textEl);
                }
            });
        } else {
            // Render beautiful premium fallback layout
            certContainer.innerHTML = `
                <div id="certificate-print-render" style="width: 1120px; height: 792px; border: 15px double #d4af37; padding: 60px 80px; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #ffffff; position: relative; font-family: 'Georgia', serif; text-align: center; box-sizing: border-box; background-color: #fff;">
                    <div style="position: absolute; border: 1px solid rgba(212,175,55,0.3); inset: 20px; pointer-events: none;"></div>
                    <div style="font-size: 32px; font-weight: bold; color: #111; letter-spacing: 4px; margin-bottom: 5px;">SERTIFIKAT APRESIASI</div>
                    <div style="font-size: 13px; color: #777; letter-spacing: 2px; margin-bottom: 40px; font-family: sans-serif;">NOMOR: ${certId}</div>
                    <div style="font-size: 16px; color: #555; font-style: italic; margin-bottom: 12px;">Dengan bangga diberikan kepada:</div>
                    <div style="font-size: 34px; font-weight: bold; text-decoration: underline; color: #1A365D; text-transform: uppercase; margin-bottom: 25px;">${attendeeName}</div>
                    <div style="font-size: 15px; color: #444; max-width: 680px; line-height: 1.8; margin-bottom: 15px; font-family: sans-serif;">
                        Atas keberhasilan menyelesaikan seluruh rangkaian pembelajaran dan evaluasi dengan predikat Kelulusan Resmi pada event bertajuk:
                    </div>
                    <div style="font-size: 22px; font-weight: bold; color: #111; margin-bottom: 50px;">"${cert.event.title}"</div>
                    
                    <table style="width: 100%; margin-top: auto; border: none; font-family: sans-serif;">
                        <tr>
                            <td style="text-align: left; width: 33%;">
                                <div style="font-size: 12px; color: #888; margin-bottom: 4px;">Penyelenggara:</div>
                                <div style="font-size: 14px; font-weight: bold; color: #222;">${cert.event.organizer_name}</div>
                            </td>
                            <td style="text-align: center; width: 34%;">
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${window.location.origin}/certificate/verify/${certId}" style="width: 64px; height: 64px; border: 1px solid #eee; padding: 4px; background: white; margin: 0 auto; display: block;" />
                            </td>
                            <td style="text-align: right; width: 33%;">
                                <div style="font-size: 12px; color: #888; margin-bottom: 4px;">Diterbitkan:</div>
                                <div style="font-size: 14px; font-weight: bold; color: #222;">${new Date(cert.survey_response?.created_at || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                <span style="color: #22c55e; font-size: 12px; font-weight: 600; display: inline-block; margin-top: 4px;">✓ VALID</span>
                            </td>
                        </tr>
                    </table>
                </div>
            `;
        }

        const opt = {
            margin: 0,
            filename: `Sertifikat_${cert.event.title.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'px', format: [1120, 792], orientation: 'landscape' }
        };

        toast.promise(
            html2pdf().from(certContainer).set(opt).save().then(() => {
                document.body.removeChild(certContainer);
            }).catch((err) => {
                document.body.removeChild(certContainer);
                throw err;
            }),
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
                                                            variant="success"
                                                            onClick={() => handleDownloadPDF(cert)}
                                                            className="flex-grow-1 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                                                        >
                                                            <Download size={16} /> Unduh PDF
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
        </div>
    );
}
