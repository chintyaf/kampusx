import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Nav, ProgressBar, Badge, Accordion, Modal, Spinner, Alert } from 'react-bootstrap';
import { ArrowLeft, Layout, BookOpen, PlayCircle, MessageCircle, QrCode, Download, CheckCircle, FileText, Award, Lock, Sparkles, Star } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';

const EventSpace = () => {
    const { id } = useParams(); // Mengambil ID event dari URL
    const [activeTab, setActiveTab] = useState('overview');
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null);

    // Dynamic states from backend
    const [event, setEvent] = useState(null);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [ticketCode, setTicketCode] = useState('TKT-ACTIVE-001');
    const [participantName, setParticipantName] = useState('');

    // Fallback static materials data if none is set
    const fallbackMateri = [
        {
            id: 1,
            chapter: "1. Pendahuluan & Pengenalan Kelas",
            lessons: [
                { id: 101, title: "Pengenalan Topik & Silabus", type: "video", duration: "10:00", isCompleted: true },
                { id: 102, title: "Prinsip Dasar & Konsep Utama", type: "video", duration: "15:30", isCompleted: true },
            ]
        },
        {
            id: 2,
            chapter: "2. Praktik & Implementasi Lapangan",
            lessons: [
                { id: 201, title: "Panduan Instalasi & Workspace", type: "video", duration: "20:00", isCompleted: true },
                { id: 202, title: "Modul Lengkap Modul Latihan (PDF)", type: "document", duration: "12 Halaman", isCompleted: false },
            ]
        }
    ];

    useEffect(() => {
        const fetchEventDetails = async () => {
            setIsLoading(true);
            setApiError(null);
            try {
                const response = await api.get(`/events/${id}/survey`);
                if (response.data.success) {
                    const data = response.data.data;
                    setEvent(data.event);
                    setAlreadySubmitted(data.already_submitted);
                    setTicketCode(data.ticket_code);
                    setParticipantName(data.participant_name);
                }
            } catch (err) {
                console.error("Gagal mengambil info event:", err);
                setApiError(err.response?.data?.message || "Gagal memuat beberapa data event.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchEventDetails();
    }, [id]);

    if (isLoading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
                <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                <p className="text-muted mt-3 fw-medium">Memuat Dashboard Event Space...</p>
            </div>
        );
    }

    // Merging fallback title and backend dynamic data
    const title = event?.title || "Workshop & Kelas Pembelajaran Unggulan";
    const organizer = event?.institution?.name || event?.organizer?.name || "Penyelenggara KampusX";
    const progress = alreadySubmitted ? 100 : 75; // Completing survey gives 100% completion

    // --- RENDER AREA KONTEN BERDASARKAN TAB ---
    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="fade-in">
                        {/* Certificate Claim Banner */}
                        {!alreadySubmitted ? (
                            <Alert variant="warning" className="border-0 shadow-sm rounded-4 p-4 mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-warning bg-opacity-20 rounded-circle p-2.5 text-warning d-flex">
                                        <Award size={26} className="animate-bounce" />
                                    </div>
                                    <div>
                                        <h6 className="fw-bold text-dark mb-1">E-Sertifikat Kelulusan Tersedia!</h6>
                                        <p className="mb-0 text-muted small">Anda telah menyelesaikan sesi pembelajaran. Berikan ulasan singkat Anda untuk klaim sertifikat.</p>
                                    </div>
                                </div>
                                <Link to={`/event-space/${id}/survey`} className="text-decoration-none">
                                    <Button variant="warning" size="md" className="rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2">
                                        <Sparkles size={16} /> Isi Ulasan & Klaim
                                    </Button>
                                </Link>
                            </Alert>
                        ) : (
                            <Alert variant="success" className="border-0 shadow-sm rounded-4 p-4 mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-success bg-opacity-20 rounded-circle p-2.5 text-success d-flex">
                                        <CheckCircle size={26} />
                                    </div>
                                    <div>
                                        <h6 className="fw-bold text-dark mb-1">E-Sertifikat Kelulusan Telah Aktif!</h6>
                                        <p className="mb-0 text-muted small">Terima kasih atas partisipasi dan ulasan berharga Anda. Sertifikat Anda sudah siap diunduh.</p>
                                    </div>
                                </div>
                                <Link to={`/event-space/${id}/survey`} className="text-decoration-none">
                                    <Button variant="success" size="md" className="rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2">
                                        <Download size={16} /> Lihat & Unduh PDF
                                    </Button>
                                </Link>
                            </Alert>
                        )}

                        <h4 className="fw-bold mb-3">Tentang Event Ini</h4>
                        <p className="text-muted" style={{ lineHeight: '1.7' }}>
                            {event?.description || "Selamat datang di program event unggulan KampusX. Di sini Anda akan belajar secara langsung mengenai praktik lapangan terbaik, dipandu oleh mentor dan pemateri berpengalaman untuk membekali karir masa depan Anda."}
                        </p>
                        <Card className="border-0 bg-light rounded-4 p-4 mt-4">
                            <h6 className="fw-bold mb-3">Detail & Ketentuan Klaim Sertifikat:</h6>
                            <ul className="text-muted mb-0" style={{ lineHeight: '1.8' }}>
                                <li>Pastikan status tiket Anda telah terverifikasi check-in di tempat acara.</li>
                                <li>Ikuti seluruh rangkaian pemaparan materi dari awal hingga akhir.</li>
                                <li>Isi kuesioner ulasan / feedback singkat mengenai performa pembicara dan kualitas materi.</li>
                                <li>Setelah ulasan dikirim, dokumen e-sertifikat PDF dengan kode QR verifikasi unik akan langsung terbuka.</li>
                            </ul>
                        </Card>
                    </div>
                );
            case 'materi':
                return (
                    <div className="fade-in">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fw-bold mb-0">Materi Pembelajaran</h4>
                            <span className="text-muted small">{progress}% Selesai</span>
                        </div>
                        <ProgressBar now={progress} variant={progress === 100 ? "success" : "primary"} className="mb-4" style={{ height: '8px' }} />

                        <Accordion defaultActiveKey="0" className="custom-accordion">
                            {fallbackMateri.map((bab, index) => (
                                <Accordion.Item eventKey={index.toString()} key={bab.id} className="mb-3 border-0 rounded-4 shadow-sm overflow-hidden">
                                    <Accordion.Header className="fw-bold bg-white">
                                        {bab.chapter}
                                    </Accordion.Header>
                                    <Accordion.Body className="p-0 bg-light">
                                        {bab.lessons.map(lesson => (
                                            <div key={lesson.id} className="d-flex align-items-center justify-content-between p-3 border-bottom cursor-pointer hover-bg-white transition-all">
                                                <div className="d-flex align-items-center gap-3">
                                                    {lesson.isCompleted ? (
                                                        <CheckCircle size={20} className="text-success" />
                                                    ) : (
                                                        lesson.type === 'video' ? <PlayCircle size={20} className="text-primary opacity-50" /> : <FileText size={20} className="text-primary opacity-50" />
                                                    )}
                                                    <div>
                                                        <div className={`fw-medium ${lesson.isCompleted ? 'text-muted' : 'text-dark'}`}>
                                                            {lesson.title}
                                                        </div>
                                                        <div className="text-muted" style={{ fontSize: '12px' }}>
                                                            {lesson.type === 'video' ? 'Video' : 'Modul'} • {lesson.duration}
                                                        </div>
                                                    </div>
                                                </div>
                                                {!lesson.isCompleted && <Button variant="outline-primary" size="sm" className="rounded-pill px-3">Mulai</Button>}
                                            </div>
                                        ))}
                                    </Accordion.Body>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                    </div>
                );
            case 'diskusi':
                return (
                    <div className="fade-in text-center py-5">
                        <MessageCircle size={48} className="text-muted mb-3 opacity-50" />
                        <h5 className="fw-bold text-muted">Forum Diskusi</h5>
                        <p className="text-muted small">Ruang diskusi untuk event ini akan segera dibuka oleh penyelenggara.</p>
                    </div>
                );
            case 'sertifikat':
                return (
                    <div className="fade-in text-center py-4">
                        {!alreadySubmitted ? (
                            <Card className="border-0 shadow-sm rounded-4 d-inline-block text-start" style={{ maxWidth: '500px', width: '100%' }}>
                                <Card.Body className="p-5 d-flex flex-column align-items-center text-center">
                                    <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-inline-flex p-3.5 mb-4 border border-warning border-opacity-25">
                                        <Lock size={40} className="animate-pulse" />
                                    </div>
                                    <h4 className="fw-bold mb-2">Sertifikat Belum Terbuka</h4>
                                    <p className="text-muted small mb-4">
                                        Sertifikat apresiasi kelulusan Anda saat ini masih terkunci. Mohon berikan feedback/penilaian evaluasi singkat Anda mengenai pelaksanaan event ini untuk membuka sertifikat.
                                    </p>
                                    <Link to={`/event-space/${id}/survey`} className="w-100 text-decoration-none">
                                        <Button variant="primary" className="w-100 rounded-pill py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow">
                                            <Sparkles size={18} /> Mulai Isi Survei Feedback
                                        </Button>
                                    </Link>
                                </Card.Body>
                            </Card>
                        ) : (
                            <Card className="border-0 shadow-sm rounded-4 d-inline-block text-start" style={{ maxWidth: '550px', width: '100%' }}>
                                <Card.Body className="p-5 d-flex flex-column align-items-center text-center">
                                    <div className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex p-3.5 mb-4 border border-success border-opacity-25">
                                        <Award size={44} className="text-warning" />
                                    </div>
                                    <h4 className="fw-bold mb-2">Sertifikat Anda Telah Siap!</h4>
                                    <p className="text-muted small mb-4">
                                        Terima kasih telah berpartisipasi dan mengirimkan ulasan evaluasi. Anda dapat melihat preview sertifikat digital Anda secara instan dan mengunduhnya dalam format PDF berkualitas tinggi.
                                    </p>
                                    <div className="bg-light p-3.5 rounded-4 w-100 mb-4 border border-dashed text-start">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted small">Status Klaim</span>
                                            <Badge bg="success" className="px-2.5 py-1.5 rounded-pill fw-semibold">AKTIF & TERVERIFIKASI</Badge>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="text-muted small">Nama Penerima</span>
                                            <span className="fw-bold text-dark text-truncate" style={{ maxWidth: '220px' }}>{participantName || 'Peserta Kelas'}</span>
                                        </div>
                                    </div>
                                    <Link to={`/event-space/${id}/survey`} className="w-100 text-decoration-none">
                                        <Button variant="success" className="w-100 rounded-pill py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow">
                                            <Download size={18} /> Lihat & Unduh Sertifikat (PDF)
                                        </Button>
                                    </Link>
                                </Card.Body>
                            </Card>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-light min-vh-100 pb-5">
            {/* HEADER MICRO LMS */}
            <div className="bg-white border-bottom shadow-sm sticky-top" style={{ zIndex: 1020 }}>
                <Container className="py-3">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                            <Link to="/my-tickets">
                                <Button variant="light" className="rounded-circle p-2 d-flex border">
                                    <ArrowLeft size={20} className="text-dark" />
                                </Button>
                            </Link>
                            <div>
                                <h5 className="fw-bold mb-0 text-truncate" style={{ maxWidth: '600px', color: 'var(--color-primary, #1A365D)' }}>
                                    {title}
                                </h5>
                                <span className="text-muted small">Penyelenggara: {organizer}</span>
                            </div>
                        </div>

                        {/* TOMBOL CEPAT QR CODE DI HEADER */}
                        <Button 
                            variant="dark" 
                            className="rounded-pill px-4 py-2 d-flex align-items-center shadow-sm fw-medium"
                            onClick={() => setShowTicketModal(true)}
                        >
                            <QrCode size={18} className="me-2" /> E-Tiket QR
                        </Button>
                    </div>
                </Container>
            </div>

            <Container className="mt-4">
                {apiError && <Alert variant="warning" className="rounded-4 border-0 shadow-sm mb-4">{apiError}</Alert>}

                <Row className="g-4">
                    {/* SIDEBAR NAVIGASI */}
                    <Col lg={3} md={4}>
                        <Card className="border-0 shadow-sm rounded-4 position-sticky" style={{ top: '100px' }}>
                            <Card.Body className="p-3">
                                <Nav className="flex-column gap-2 custom-pills">
                                    <Nav.Link 
                                        className={`d-flex align-items-center px-3 py-2.5 rounded-3 fw-medium ${activeTab === 'overview' ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
                                        onClick={() => setActiveTab('overview')}
                                    >
                                        <Layout size={18} className="me-3" /> Overview
                                    </Nav.Link>
                                    <Nav.Link 
                                        className={`d-flex align-items-center px-3 py-2.5 rounded-3 fw-medium ${activeTab === 'materi' ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
                                        onClick={() => setActiveTab('materi')}
                                    >
                                        <BookOpen size={18} className="me-3" /> Materi Pembelajaran
                                    </Nav.Link>
                                    <Nav.Link 
                                        className={`d-flex align-items-center px-3 py-2.5 rounded-3 fw-medium ${activeTab === 'diskusi' ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
                                        onClick={() => setActiveTab('diskusi')}
                                    >
                                        <MessageCircle size={18} className="me-3" /> Forum Diskusi
                                    </Nav.Link>
                                    
                                    <hr className="my-2.5 opacity-25" />
                                    
                                    {/* MENU SERTIFIKAT & ULASAN DI SIDEBAR */}
                                    <Nav.Link 
                                        className={`d-flex align-items-center px-3 py-2.5 rounded-3 fw-medium ${activeTab === 'sertifikat' ? 'bg-success text-white shadow-sm' : 'text-success hover-bg-success-subtle'}`}
                                        onClick={() => setActiveTab('sertifikat')}
                                        style={{ transition: 'all 0.2s ease' }}
                                    >
                                        <Award size={18} className="me-3" /> Sertifikat & Ulasan
                                        {alreadySubmitted ? (
                                            <Badge bg="success-subtle" text="success" className="ms-auto rounded-pill border border-success border-opacity-10 small">Aktif</Badge>
                                        ) : (
                                            <Badge bg="warning-subtle" text="warning" className="ms-auto rounded-pill border border-warning border-opacity-10 small">Klaim</Badge>
                                        )}
                                    </Nav.Link>
                                </Nav>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* MAIN CONTENT AREA */}
                    <Col lg={9} md={8}>
                        <Card className="border-0 shadow-sm rounded-4" style={{ minHeight: '450px' }}>
                            <Card.Body className="p-4 p-md-5">
                                {renderContent()}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* MODAL POP-UP QR TIKET (Saat diklik dari Header) */}
            <Modal show={showTicketModal} onHide={() => setShowTicketModal(false)} centered>
                <Modal.Header closeButton className="border-0 pb-0"></Modal.Header>
                <Modal.Body className="text-center pb-5 pt-0">
                    <h5 className="fw-bold mb-4">E-Tiket Anda</h5>
                    <div className="bg-light p-4 rounded-4 d-inline-block border border-dashed mb-3">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${ticketCode}`} alt="QR Code" className="mix-blend-multiply" style={{ width: '180px', height: '180px' }} />
                    </div>
                    <div className="fw-bold fs-5 text-dark mb-1">{ticketCode}</div>
                    <Badge bg="success" className="px-3 py-2 rounded-pill fw-medium border border-success border-opacity-25 text-success bg-success-subtle">
                        VALID UNTUK EVENT INI
                    </Badge>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default EventSpace;