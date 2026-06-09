import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Card, Spinner, Button, Badge, Row, Col } from 'react-bootstrap';
import { Share2, Download, CheckCircle, Award, Calendar, MapPin, Building, Check, ArrowLeft, ShieldCheck } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import html2pdf from 'html2pdf.js';
import QRCode from 'react-qr-code';
import { formatDate } from '@/utils/dateUtils';

const CertificatePublicView = () => {
    const { ticketCode } = useParams(); // Mengambil kode dari URL /certificate/CERT-123
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [certData, setCertData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);

    useEffect(() => {
        const fetchCertificate = async () => {
            setIsLoading(true); // Pastikan loading menyala di awal
            
            try {
                // 1. Coba panggil API Render
                const res = await api.get(`/certificate/render/${ticketCode}`);
                if (res.data.success) {
                    setCertData(res.data.data);
                }
            } catch (err) {
                console.error("Gagal memuat render data sertifikat, mencoba fallback...", err);
                
                try {
                    // 2. Jika gagal, tunggu API Fallback selesai
                    const fallbackRes = await api.get(`/certificate/verify/${ticketCode}`);
                    if (fallbackRes.data.success) {
                        setCertData(fallbackRes.data.data);
                    }
                } catch (fallbackErr) {
                    console.error("Fallback verify API juga gagal", fallbackErr);
                }
            } finally {
                // 3. Matikan loading HANYA ketika semua percobaan di atas sudah selesai
                setIsLoading(false);
            }
        };

        fetchCertificate();
    }, [ticketCode]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
    };

    const handleDownloadPDF = () => {
        const element = document.getElementById('certificate-print-area');
        if (!element) {
            alert('Gagal mendeteksi area sertifikat.');
            return;
        }

        setIsDownloading(true);
        const canvasWidth = template.canvas_width || 1120;
        const canvasHeight = template.canvas_height || 792;
        
        const opt = {
            margin: 0,
            filename: `Sertifikat_${eventTitle.replace(/\s+/g, '_') || 'Event'}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'px', format: [canvasWidth, canvasHeight], orientation: 'landscape' },
        };

        const toast = document.createElement('div');
        toast.className = 'position-fixed bottom-0 end-0 m-4 p-3 bg-dark text-white rounded-3 shadow-lg';
        toast.style.zIndex = '9999';
        toast.innerHTML = '⚡ Sedang memproses PDF...';
        document.body.appendChild(toast);

        html2pdf()
            .from(element)
            .set(opt)
            .save()
            .then(() => {
                toast.innerHTML = '🎉 Sertifikat berhasil diunduh!';
                setTimeout(() => toast.remove(), 3000);
            })
            .catch((err) => {
                console.error(err);
                toast.className = toast.className.replace('bg-dark', 'bg-danger');
                toast.innerHTML = '❌ Gagal mengunduh sertifikat.';
                setTimeout(() => toast.remove(), 4000);
            })
            .finally(() => {
                setIsDownloading(false);
            });
    };

    if (isLoading) {
        return (
            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light">
                <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                <p className="text-muted mt-3 fw-medium">Memverifikasi Sertifikat...</p>
            </div>
        );
    }

    if (!certData) {
        return (
            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light text-center px-3">
                <div className="bg-white p-5 rounded-4 shadow-sm border" style={{ maxWidth: '500px' }}>
                    <Award size={64} className="text-muted mb-3 opacity-50" />
                    <h4 className="fw-bold text-dark">Sertifikat Tidak Ditemukan</h4>
                    <p className="text-muted">Sertifikat dengan kode <strong>{ticketCode}</strong> tidak terdaftar atau tidak valid.</p>
                    <Link to="/" className="btn btn-primary rounded-pill px-4 py-2 mt-2">Kembali ke Beranda</Link>
                </div>
            </div>
        );
    }

    // Mapping properti data agar kompatibel dengan single-level verify API dan nested render API
    const attendeeName = certData.ticket?.attendee_name || certData.attendee_name || 'Peserta KampusX';
    const eventTitle = certData.event?.title || certData.event_title || 'Event KampusX';
    const eventDate = certData.event?.start_date ? formatDate(certData.event.start_date) : (certData.event_date || 'Tanggal Event');
    const organizerName = certData.event?.organizer_name || certData.organizer_name || 'KampusX Organizer';
    const certificateNumber = certData.ticket?.ticket_code || certData.certificate_number || ticketCode;
    const template = certData.template || {};

    return (
        <div className="bg-light min-vh-100 pb-5">
            {/* Sticky Header */}
            <div
                className="bg-white border-bottom shadow-sm sticky-top mb-4"
                style={{ zIndex: 1020 }}
            >
                <Container className="py-3">
                    <div className="d-flex align-items-center gap-3">
                        {isAuthenticated && (
                            <Button
                                variant="light"
                                className="rounded-circle p-2 d-flex border"
                                onClick={() => navigate(-1)}
                            >
                                <ArrowLeft size={20} className="text-dark" />
                            </Button>
                        )}
                        <div>
                            <h5 className="fw-bold mb-0">Sertifikat</h5>
                            <span className="text-muted small">{eventTitle}</span>
                        </div>
                    </div>
                </Container>
            </div>

            <Container>
                <Row className="justify-content-center">
                    <Col lg={12}>
                        <Card className="border-0 shadow-lg rounded-4 overflow-hidden mb-4">
                            <Card.Body className="p-4 p-md-5">
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                                    <div>
                                        <h4 className="fw-bold text-dark d-flex align-items-center gap-2">
                                            <Award size={28} className="text-warning" />{' '}
                                            {attendeeName}
                                        </h4>
                                        
                                        <p className="text-muted mb-0 small">
                                            Sertifikat kelulusan resmi diterbitkan oleh <strong>{organizerName}</strong>.
                                        </p>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="success"
                                            className="rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow"
                                            onClick={handleDownloadPDF}
                                            disabled={isDownloading}
                                        >
                                            {isDownloading ? (
                                                <>
                                                    <Spinner animation="border" size="sm" style={{ width: '14px', height: '14px' }} />
                                                    <span>Memproses...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Download size={18} />
                                                    <span>Unduh PDF</span>
                                                </>
                                            )}
                                        </Button>
                                        <Button 
                                            variant="outline-secondary" 
                                            className="rounded-pill px-3 d-flex align-items-center justify-content-center border"
                                            title="Bagikan Tautan"
                                            onClick={handleShare}
                                        >
                                            {shareCopied ? <Check size={18} className="text-success" /> : <Share2 size={18} />}
                                        </Button>
                                    </div>
                                </div>

                                <div
                                    className="bg-dark rounded-4 p-3 d-flex align-items-center justify-content-center overflow-auto"
                                    style={{ minHeight: '400px' }}
                                >
                                    <div className="w-100" style={{ maxWidth: '900px' }}>
                                        {template.background_url ? (
                                            <div
                                                id="certificate-print-area"
                                                style={{
                                                    position: 'relative',
                                                    width: '100%',
                                                    aspectRatio: `${template.canvas_width || 1120}/${template.canvas_height || 792}`,
                                                    backgroundImage: `url(${template.background_url})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    overflow: 'hidden',
                                                    backgroundColor: '#fff',
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                {template.elements && template.elements.map((el) => {
                                                    const xPct = (el.x / (template.canvas_width || 1120)) * 100;
                                                    const yPct = (el.y / (template.canvas_height || 792)) * 100;

                                                    if (el.elementType === 'qr_code') {
                                                        return (
                                                            <div
                                                                key={el.id}
                                                                style={{
                                                                    position: 'absolute',
                                                                    left: `${xPct}%`,
                                                                    top: `${yPct}%`,
                                                                    transform: 'translate(-50%,-50%)',
                                                                    background: 'white',
                                                                    padding: '4px',
                                                                    borderRadius: '4px',
                                                                }}
                                                            >
                                                                    <QRCode
                                                                        value={el.label || `${window.location.origin}/certificate/verify/${certificateNumber}`}
                                                                        size={50}
                                                                    />
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <div
                                                            key={el.id}
                                                            style={{
                                                                position: 'absolute',
                                                                left: `${xPct}%`,
                                                                top: `${yPct}%`,
                                                                transform: `translate(${el.textAlign === 'center' ? '-50%' : el.textAlign === 'right' ? '-100%' : '0%'}, -50%)`,
                                                                textAlign: el.textAlign || 'center',
                                                                fontSize: `calc(${el.fontSize || 24}px * (1vw / 12))`,
                                                                color: el.color || '#000',
                                                                fontFamily: el.fontFamily || 'Georgia, serif',
                                                                fontWeight: el.bold ? 'bold' : 'normal',
                                                                pointerEvents: 'none',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            {el.label}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <FallbackCertificate
                                                participantName={attendeeName}
                                                certId={certificateNumber}
                                                event={{ title: eventTitle, organizer: { name: organizerName } }}
                                                dateStr={eventDate}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 bg-light rounded-4 p-4 d-flex align-items-center gap-3 border">
                                    <ShieldCheck
                                        size={32}
                                        className="text-success flex-shrink-0"
                                    />
                                    <div>
                                        <h6 className="fw-bold mb-1">
                                            Keaslian Sertifikat Terjamin
                                        </h6>
                                        <p className="mb-0 text-muted small">
                                            Sertifikat ini dilengkapi dengan ID unik {certificateNumber} dan kode QR verifikasi publik resmi dari KampusX.
                                        </p>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

function FallbackCertificate({ participantName, certId, event, dateStr }) {
	return (
		<div
			id="certificate-print-area"
			className="bg-white text-center position-relative overflow-hidden"
			style={{
				width: '100%',
				aspectRatio: '1120/792',
				border: '5px solid #d4af37',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				padding: '60px 80px',
                borderRadius: '4px'
			}}
		>
			<div
				style={{
					position: 'absolute',
					border: '1px solid rgba(212,175,55,0.3)',
					inset: '20px',
					pointerEvents: 'none',
				}}
			/>
			<Award size={56} className="text-warning mb-3" />
			<h1
				style={{
					fontFamily: 'Georgia, serif',
					letterSpacing: '4px',
					fontSize: '26px',
					fontWeight: 'bold',
					marginBottom: '4px',
				}}
			>
				SERTIFIKAT KELULUSAN
			</h1>
			<p
				style={{
					letterSpacing: '2px',
					fontSize: '11px',
					color: '#888',
					marginBottom: '20px',
				}}
			>
				NOMOR: {certId}
			</p>
			<p
				style={{
					fontSize: '13px',
					color: '#666',
					fontStyle: 'italic',
					marginBottom: '8px',
				}}
			>
				Diberikan kepada:
			</p>
			<h2
				style={{
					fontFamily: 'Georgia, serif',
					fontSize: '24px',
					fontWeight: 'bold',
					textDecoration: 'underline',
					textUnderlineOffset: '6px',
					marginBottom: '16px',
					textTransform: 'uppercase',
				}}
			>
				{participantName}
			</h2>
			<p
				style={{
					fontSize: '12px',
					color: '#555',
					maxWidth: '480px',
					lineHeight: '1.6',
					marginBottom: '10px',
				}}
			>
				Atas keberhasilan menyelesaikan seluruh rangkaian pembelajaran pada event bertajuk:
			</p>
			<h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '28px' }}>
				"{event?.title}"
			</h4>
			<div
				style={{
					width: '100%',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'flex-end',
				}}
			>
				<div style={{ textAlign: 'left' }}>
					<p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Penyelenggara:</p>
					<p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>
						{event?.institution?.name || event?.organizer?.name || 'KampusX Academy'}
					</p>
				</div>
				<div
					style={{
						background: 'white',
						padding: '4px',
						border: '1px solid #eee',
						borderRadius: '4px',
					}}
				>
					<QRCode value={`${window.location.origin}/certificate/verify/${certId}`} size={48} />
				</div>
				<div style={{ textAlign: 'right' }}>
					<p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Diterbitkan:</p>
					<p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>
						{dateStr}
					</p>
					<span style={{ color: '#22c55e', fontSize: '11px', fontWeight: '600' }}>
						✓ VALID
					</span>
				</div>
			</div>
		</div>
	);
}

export default CertificatePublicView;