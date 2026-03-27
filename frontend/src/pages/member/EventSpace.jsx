import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Nav, ProgressBar, Badge, Accordion, Modal } from 'react-bootstrap';
import { ArrowLeft, Layout, BookOpen, PlayCircle, MessageCircle, QrCode, Download, CheckCircle, FileText } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const EventSpace = () => {
    const { id } = useParams(); // Mengambil ID event dari URL
    const [activeTab, setActiveTab] = useState('overview');
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // DUMMY DATA (Nanti bisa diganti dengan fetch API dari Laravel)
    const eventData = {
        id: id,
        title: "Workshop UI/UX Design: Creating Accessible Interfaces",
        organizer: "Design Club ID",
        progress: 35, // Persentase selesai
        ticketCode: "TKT-ACTIVE-001",
        materi: [
            {
                id: 1,
                chapter: "1. Pendahuluan UI/UX",
                lessons: [
                    { id: 101, title: "Apa itu UI/UX?", type: "video", duration: "10:00", isCompleted: true },
                    { id: 102, title: "Prinsip Dasar Aksesibilitas", type: "video", duration: "15:30", isCompleted: true },
                ]
            },
            {
                id: 2,
                chapter: "2. Praktik Figma & Wireframing",
                lessons: [
                    { id: 201, title: "Setup Workspace Figma", type: "video", duration: "20:00", isCompleted: false },
                    { id: 202, title: "Modul Grid System (PDF)", type: "document", duration: "5 Halaman", isCompleted: false },
                ]
            }
        ]
    };

    useEffect(() => {
        // Simulasi loading fetch data
        setTimeout(() => setIsLoading(false), 800);
    }, [id]);

    if (isLoading) {
        return <div className="text-center py-5 mt-5">Memuat Dashboard Event...</div>;
    }

    // --- RENDER AREA KONTEN BERDASARKAN TAB ---
    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="fade-in">
                        <h4 className="fw-bold mb-3">Tentang Event Ini</h4>
                        <p className="text-muted">
                            Selamat datang di workshop UI/UX Design. Di sini kamu akan belajar bagaimana membuat antarmuka yang tidak hanya indah secara visual, tetapi juga dapat diakses (accessible) oleh semua orang, termasuk pengguna dengan disabilitas.
                        </p>
                        <Card className="border-0 bg-light rounded-4 p-4 mt-4">
                            <h6 className="fw-bold mb-3">Target Pembelajaran:</h6>
                            <ul className="text-muted mb-0" style={{ lineHeight: '1.8' }}>
                                <li>Memahami perbedaan fundamental UI dan UX.</li>
                                <li>Menerapkan prinsip Web Content Accessibility Guidelines (WCAG).</li>
                                <li>Membuat wireframe dan prototype interaktif menggunakan Figma.</li>
                            </ul>
                        </Card>
                    </div>
                );
            case 'materi':
                return (
                    <div className="fade-in">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fw-bold mb-0">Materi Pembelajaran</h4>
                            <span className="text-muted small">{eventData.progress}% Selesai</span>
                        </div>
                        <ProgressBar now={eventData.progress} className="mb-4" style={{ height: '8px' }} />

                        <Accordion defaultActiveKey="0" className="custom-accordion">
                            {eventData.materi.map((bab, index) => (
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
                        <p className="text-muted small">Ruang diskusi untuk event ini akan segera dibuka.</p>
                    </div>
                );
            case 'tiket':
                return (
                    <div className="fade-in text-center py-4">
                        <Card className="border-0 shadow-sm rounded-4 d-inline-block text-start" style={{ maxWidth: '400px', width: '100%' }}>
                            <Card.Body className="p-4 d-flex flex-column align-items-center">
                                <h5 className="fw-bold mb-1">E-Tiket Kamu</h5>
                                <p className="text-muted small mb-4">Tunjukkan QR ini kepada panitia saat registrasi ulang</p>
                                
                                <div className="bg-light p-3 rounded-4 mb-4 border border-dashed text-center w-100">
                                    {/* Placeholder QR Code */}
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${eventData.ticketCode}`} alt="QR Code" className="img-fluid mix-blend-multiply" />
                                </div>
                                
                                <div className="w-100 bg-light rounded p-3 mb-4">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted small">Kode Peserta</span>
                                        <span className="fw-bold">{eventData.ticketCode}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted small">Status</span>
                                        <Badge bg="success">AKTIF / VALID</Badge>
                                    </div>
                                </div>

                                <Button variant="outline-dark" className="w-100 rounded-pill d-flex align-items-center justify-content-center">
                                    <Download size={18} className="me-2" /> Unduh Tiket (PDF)
                                </Button>
                            </Card.Body>
                        </Card>
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
                            <Link to="/">
                                <Button variant="light" className="rounded-circle p-2 d-flex">
                                    <ArrowLeft size={20} className="text-dark" />
                                </Button>
                            </Link>
                            <div className="d-none d-md-block">
                                <h5 className="fw-bold mb-0 text-truncate" style={{ maxWidth: '600px' }}>
                                    {eventData.title}
                                </h5>
                                <span className="text-muted small">Oleh: {eventData.organizer}</span>
                            </div>
                        </div>

                        {/* TOMBOL CEPAT QR CODE DI HEADER */}
                        <Button 
                            variant="dark" 
                            className="rounded-pill px-3 py-2 d-flex align-items-center shadow-sm"
                            onClick={() => setShowTicketModal(true)}
                        >
                            <QrCode size={18} className="me-2 d-none d-sm-block" /> Tampilkan QR
                        </Button>
                    </div>
                </Container>
            </div>

            <Container className="mt-4">
                <Row className="g-4">
                    {/* SIDEBAR NAVIGASI */}
                    <Col md={3}>
                        <Card className="border-0 shadow-sm rounded-4 position-sticky" style={{ top: '100px' }}>
                            <Card.Body className="p-3">
                                <Nav className="flex-column gap-2 custom-pills">
                                    <Nav.Link 
                                        className={`d-flex align-items-center px-3 py-2 rounded-3 ${activeTab === 'overview' ? 'bg-primary text-white' : 'text-dark hover-bg-light'}`}
                                        onClick={() => setActiveTab('overview')}
                                    >
                                        <Layout size={18} className="me-3" /> Overview
                                    </Nav.Link>
                                    <Nav.Link 
                                        className={`d-flex align-items-center px-3 py-2 rounded-3 ${activeTab === 'materi' ? 'bg-primary text-white' : 'text-dark hover-bg-light'}`}
                                        onClick={() => setActiveTab('materi')}
                                    >
                                        <BookOpen size={18} className="me-3" /> Materi Pembelajaran
                                    </Nav.Link>
                                    <Nav.Link 
                                        className={`d-flex align-items-center px-3 py-2 rounded-3 ${activeTab === 'diskusi' ? 'bg-primary text-white' : 'text-dark hover-bg-light'}`}
                                        onClick={() => setActiveTab('diskusi')}
                                    >
                                        <MessageCircle size={18} className="me-3" /> Forum Diskusi
                                    </Nav.Link>
                                    
                                    <hr className="my-2 opacity-25" />
                                    
                                    {/* MENU TIKET DI SIDEBAR */}
                                    <Nav.Link 
                                        className={`d-flex align-items-center px-3 py-2 rounded-3 ${activeTab === 'tiket' ? 'bg-dark text-white' : 'text-dark hover-bg-light'}`}
                                        onClick={() => setActiveTab('tiket')}
                                    >
                                        <QrCode size={18} className="me-3" /> Akses Tiket
                                    </Nav.Link>
                                </Nav>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* MAIN CONTENT AREA */}
                    <Col md={9}>
                        <Card className="border-0 shadow-sm rounded-4 min-vh-50">
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
                    <h5 className="fw-bold mb-4">E-Tiket Kamu</h5>
                    <div className="bg-light p-3 rounded-4 d-inline-block border border-dashed mb-3">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${eventData.ticketCode}`} alt="QR Code" className="mix-blend-multiply" />
                    </div>
                    <div className="fw-bold fs-5 text-dark mb-1">{eventData.ticketCode}</div>
                    <Badge bg="success" className="px-3 py-2 rounded-pill">Valid untuk Event Ini</Badge>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default EventSpace;