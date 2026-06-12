import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Button, Form, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { Lock, Download, Star, CheckCircle, ArrowLeft, RefreshCw, QrCode as QrIcon } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import html2pdf from 'html2pdf.js';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/api/axios';

const CertificateDetailPage = () => {
    const { id } = useParams();
    const certificateRef = useRef(null);
    const containerRef = useRef(null);
    
    // Core states
    const [loading, setLoading] = useState(true);
    const [isRealCertificate, setIsRealCertificate] = useState(false);
    const [certData, setCertData] = useState(null);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [surveySubmitted, setSurveySubmitted] = useState(false);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [previewWidth, setPreviewWidth] = useState(800);

    // Fetch certificate render data if it's a real ticket code
    const fetchCertificateData = async () => {
        setLoading(true);
        try {
            // Cek apakah ID terlihat seperti kode tiket (misal mengandung "TKT-" atau panjang > 8)
            const looksLikeTicket = id && (id.startsWith('TKT-') || id.length >= 8);
            
            if (looksLikeTicket) {
                const response = await api.get(`/certificate/render/${id}`);
                if (response.data && response.data.success) {
                    setCertData(response.data.data);
                    setIsRealCertificate(true);
                    // Jika tiket digunakan (sudah hadir), otomatis buka. Jika tidak, minta survey dulu
                    if (response.data.data.ticket.status === 'used') {
                        setIsUnlocked(true);
                    } else {
                        setIsUnlocked(false);
                    }
                }
            } else {
                // Gunakan dummy data mockup jika bukan kode tiket riil
                setIsRealCertificate(false);
                setIsUnlocked(false);
            }
        } catch (err) {
            console.error('Failed to load real certificate:', err);
            // Fallback ke dummy mockup agar demo tidak rusak
            setIsRealCertificate(false);
            setIsUnlocked(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCertificateData();
    }, [id]);

    // Handle Resize for perfect responsive font sizes inside absolute canvas
    useEffect(() => {
        if (!isUnlocked || !containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const width = entry.contentRect.width;
                if (width > 0) {
                    setPreviewWidth(width);
                }
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [isUnlocked, certData]);

    const handleSubmitSurvey = (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Silakan pilih rating bintang terlebih dahulu!');
            return;
        }
        setSurveySubmitted(true);
        setTimeout(() => {
            setIsUnlocked(true);
            toast.success('Sertifikat berhasil dibuka!');
        }, 1500);
    };

    const handleDownloadPDF = () => {
        const element = document.getElementById('certificate-render-canvas');
        if (!element) return;

        const width = element.offsetWidth;
        const height = element.offsetHeight;

        const pdfWidth = Math.round(width * 0.75);
        const pdfHeight = Math.round(height * 0.75) + 2;

        const opt = {
            margin: 0,
            filename: `sertifikat_${id || 'download'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2, 
                useCORS: true, 
                logging: false,
            },
            jsPDF: {
                unit: 'pt',
                format: [pdfWidth, pdfHeight],
                orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
            },
            pagebreak: { mode: 'avoid-all' },
        };

        toast.promise(html2pdf().set(opt).from(element).save(), {
            loading: 'Menyiapkan berkas PDF...',
            success: 'E-Sertifikat PDF berhasil diunduh!',
            error: 'Gagal mengunduh berkas PDF.',
        });
    };

    if (loading) {
        return (
            <div className="bg-light min-vh-100 d-flex flex-column align-items-center justify-content-center py-5">
                <Spinner animation="border" variant="primary" className="mb-2" />
                <span className="text-muted">Mempersiapkan e-sertifikat Anda...</span>
            </div>
        );
    }

    return (
        <div className="bg-light min-vh-100 py-4">
            <Toaster position="top-right" />
            <Container>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <Link to="/test-chin/sertifikat" className="text-decoration-none text-secondary d-flex align-items-center gap-2">
                        <ArrowLeft size={18} /> Kembali ke Vault
                    </Link>
                    
                    {isUnlocked && (
                        <Button variant="success" onClick={handleDownloadPDF} className="d-flex align-items-center gap-2 rounded-pill px-4 shadow-sm fw-semibold">
                            <Download size={18} /> Download PDF Resmi
                        </Button>
                    )}
                </div>

                <Row className="justify-content-center">
                    <Col lg={10}>
                        <div className="d-flex justify-content-between align-items-end mb-4">
                            <div>
                                <h3 className="fw-bold mb-1">E-Sertifikat Apresiasi</h3>
                                <p className="text-muted mb-0">
                                    ID: <span className="fw-mono text-primary fw-bold">{id || 'CERT-99482'}</span> • {isRealCertificate ? certData.event.organizer_name : 'KampusX Design Team'}
                                </p>
                            </div>
                        </div>

                        <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '24px' }}>
                            <div className="position-relative bg-dark d-flex" style={{ minHeight: '580px' }}>
                                
                                {/* ── REAL DYNAMIC CERTIFICATE CANVAS ── */}
                                {isRealCertificate && certData ? (
                                    <div 
                                        className="w-100 bg-white" 
                                        ref={containerRef}
                                        style={{ 
                                            filter: isUnlocked ? 'none' : 'blur(8px) grayscale(60%)',
                                            transition: 'all 0.8s ease',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div 
                                            id="certificate-render-canvas"
                                            className="position-relative w-100"
                                            style={{ aspectRatio: `${certData.template.canvas_width}/${certData.template.canvas_height}` }}
                                        >
                                            <img 
                                                src={certData.template.background_url} 
                                                alt="Certificate Template" 
                                                className="w-100 h-100"
                                                style={{ display: 'block', objectFit: 'fill' }}
                                            />

                                            {/* Render Elements Dynamically from coordinates */}
                                            {certData.template.elements.map((el) => {
                                                // Resolve text display value
                                                let displayText = el.custom_value || '';
                                                if (el.element_type === 'nama_peserta') displayText = certData.ticket.attendee_name;
                                                else if (el.element_type === 'id_sertifikat') displayText = certData.ticket.ticket_code;
                                                else if (el.element_type === 'nama_event') displayText = certData.event.title;
                                                else if (el.element_type === 'tanggal') displayText = certData.event.start_date;
                                                else if (el.element_type === 'instansi') displayText = certData.event.organizer_name;

                                                // Parse bold
                                                const isBold = el.font_family?.includes('|bold');
                                                const fontFamily = el.font_family?.replace('|bold', '') || 'Arial';

                                                return (
                                                    <div 
                                                        key={el.id}
                                                        className="position-absolute"
                                                        style={{
                                                            left: `${el.position_x}%`,
                                                            top: `${el.position_y}%`,
                                                            transform: 'translate(-50%, -50%)',
                                                            zIndex: 5,
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {el.element_type === 'qr_code' ? (
                                                            <div
                                                                className="bg-white p-1 shadow-sm d-flex align-items-center justify-content-center"
                                                                style={{
                                                                    width: `${((el.font_size || 80) / 1920) * previewWidth}px`,
                                                                    height: `${((el.font_size || 80) / 1920) * previewWidth}px`,
                                                                    borderRadius: `${(4 / 1920) * previewWidth}px`,
                                                                }}
                                                            >
                                                                <QRCode 
                                                                    value={`${window.location.origin}/certificate/verify/${certData.ticket.ticket_code}`}
                                                                    size={Math.max(16, Math.round(((el.font_size || 80) / 1920) * previewWidth) - 8)}
                                                                    fgColor={el.font_color === '#ffffff' ? '#000000' : el.font_color}
                                                                    bgColor="#ffffff"
                                                                    style={{ height: '100%', width: '100%' }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <p 
                                                                className="m-0 text-center lh-1"
                                                                style={{
                                                                    fontSize: `${(el.font_size / 1920) * previewWidth}px`,
                                                                    fontWeight: isBold ? 700 : 400,
                                                                    color: el.font_color || '#000000',
                                                                    fontFamily: fontFamily
                                                                }}
                                                            >
                                                                {displayText}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    /* ── MOCKUP CERTIFICATE CANVAS (FALLBACK) ── */
                                    <div className="m-auto bg-white p-5 text-center shadow" style={{ 
                                        width: '80%', height: '80%', borderRadius: '8px',
                                        filter: isUnlocked ? 'none' : 'blur(8px) grayscale(60%)',
                                        transition: 'all 0.8s ease',
                                        display: 'flex', flexDirection: 'column', justifyContent: 'center'
                                    }}>
                                        <h1 className="fw-bold text-primary mb-4" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '2px' }}>Certificate of Completion</h1>
                                        <h5 className="text-muted mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>This is to certify that</h5>
                                        <h2 className="fw-bold fs-1 mb-4 text-dark" style={{ fontFamily: 'Playfair Display, serif', textDecoration: 'underline' }}>Alex Participant</h2>
                                        <h5 className="text-muted mb-4">Has successfully completed the</h5>
                                        <h3 className="fw-bold text-secondary">{id === 'CERT-10293' ? 'Tech Startup Conference 2026' : 'Workshop UI/UX Figma Advanced Level'}</h3>
                                        <p className="mt-4 text-muted">Given on {id === 'CERT-10293' ? '30 Apr 2026' : '23 Apr 2026'}</p>

                                        {/* Mock QR Code inside fallback certificate */}
                                        <div className="d-flex justify-content-center mt-4">
                                            <div className="bg-white p-2 border rounded shadow-sm">
                                                <QRCode value={`${window.location.origin}/certificate/verify/${id || 'CERT-99482'}`} size={64} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Locked Area Overlay (Survey) */}
                                {!isUnlocked && (
                                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-75" style={{ backdropFilter: 'blur(2px)', zIndex: 10 }}>
                                        {!surveySubmitted ? (
                                            <Card className="border-0 shadow-lg p-3" style={{ width: '100%', maxWidth: '460px', borderRadius: '24px' }}>
                                                <Card.Body className="p-4 text-center">
                                                    <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-inline-flex p-3 mb-3">
                                                        <Lock size={32} />
                                                    </div>
                                                    <h4 className="fw-bold mb-2">Buka E-Sertifikat Anda</h4>
                                                    <p className="text-muted small mb-4">Silakan berikan sedikit ulasan Anda mengenai acara ini untuk membuka sertifikat kelulusan resmi Anda.</p>
                                                    
                                                    <Form onSubmit={handleSubmitSurvey}>
                                                        <div className="d-flex justify-content-center gap-2 mb-4">
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <Star 
                                                                    key={star} 
                                                                    size={32} 
                                                                    className="cursor-pointer"
                                                                    onClick={() => setRating(star)}
                                                                    fill={rating >= star ? '#ffc107' : 'none'}
                                                                    color={rating >= star ? '#ffc107' : '#ced4da'}
                                                                    style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                                                                />
                                                            ))}
                                                        </div>
                                                        <Form.Group className="mb-4 text-start">
                                                            <Form.Label className="small fw-semibold text-muted">Feedback Anda</Form.Label>
                                                            <Form.Control 
                                                                as="textarea" 
                                                                rows={3} 
                                                                placeholder="Tulis kritik & saran yang membangun tentang acara ini..." 
                                                                value={review}
                                                                onChange={(e) => setReview(e.target.value)}
                                                            />
                                                        </Form.Group>
                                                        <Button type="submit" variant="primary" className="w-100 rounded-pill py-2.5 fw-semibold shadow-sm">
                                                            Kirim Ulasan & Buka E-Sertifikat
                                                        </Button>
                                                    </Form>
                                                </Card.Body>
                                            </Card>
                                        ) : (
                                            <div className="text-center bg-white p-5 rounded-4 shadow-lg">
                                                <div className="text-success mb-3">
                                                    <CheckCircle size={64} className="mx-auto animate-bounce" />
                                                </div>
                                                <h4 className="fw-bold mb-2">Membuka Vault Sertifikat...</h4>
                                                <p className="text-muted mb-0">Ulasan Anda berhasil dikirim!</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default CertificateDetailPage;
