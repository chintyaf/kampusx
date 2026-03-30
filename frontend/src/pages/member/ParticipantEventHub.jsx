import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Tab, Nav, Button } from 'react-bootstrap';
import { QrCode, BookOpen, MessageSquare, Video, Download, Info } from 'lucide-react';

const ParticipantEventHub = () => {
    // Dummy Data: Asumsikan data ini didapat setelah user klik tiket dari "Tiket Saya"
    const eventData = {
        title: "Global Tech & Innovation Summit 2026",
        date: "26 March 2026",
        location: "Sabuga ITB, Bandung",
        status: "Berlangsung",
        ticketCode: "KX-98273-AI", // Sesuai ERD tabel tickets
        qrToken: "dummy-qr-token-12345" // Untuk discan panitia
    };

    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '60px' }}>
            
            {/* --- HEADER EVENT HUB --- */}
            <div className="bg-white border-bottom pt-4 pb-3 mb-4 shadow-sm">
                <Container>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <Badge bg="success" className="mb-2 px-3 py-2">🔴 Sedang Berlangsung</Badge>
                        <Badge bg="light" text="dark" className="border">Tiket: {eventData.ticketCode}</Badge>
                    </div>
                    <h2 className="fw-bold" style={{ color: 'var(--color-text)' }}>{eventData.title}</h2>
                    <p className="text-muted mb-0"><Info size={16} className="me-1"/> {eventData.date} | {eventData.location}</p>
                </Container>
            </div>

            <Container>
                <Row>
                    {/* --- NAVIGATION TABS (PWA Style) --- */}
                    <Col lg={3} className="mb-4">
                        <Card className="border-0 shadow-sm rounded-4 sticky-top" style={{ top: '20px' }}>
                            <Card.Body className="p-2">
                                <Nav variant="pills" className="flex-column" onSelect={(selectedKey) => setActiveTab(selectedKey)}>
                                    <Nav.Item>
                                        <Nav.Link eventKey="overview" active={activeTab === 'overview'} className="d-flex align-items-center py-3 fw-medium text-dark rounded-3">
                                            <QrCode size={20} className="me-3" style={{ color: activeTab === 'overview' ? 'var(--color-primary)' : 'var(--color-secondary)' }} /> 
                                            Presensi & Info
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="materi" active={activeTab === 'materi'} className="d-flex align-items-center py-3 fw-medium text-dark rounded-3">
                                            <BookOpen size={20} className="me-3" style={{ color: activeTab === 'materi' ? 'var(--color-primary)' : 'var(--color-secondary)' }} /> 
                                            Materi & Micro-Learning
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="interaksi" active={activeTab === 'interaksi'} className="d-flex align-items-center py-3 fw-medium text-dark rounded-3">
                                            <MessageSquare size={20} className="me-3" style={{ color: activeTab === 'interaksi' ? 'var(--color-primary)' : 'var(--color-secondary)' }} /> 
                                            Q&A & Chat Room
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* --- KONTEN DINAMIS BERDASARKAN TAB --- */}
                    <Col lg={9}>
                        <Tab.Container activeKey={activeTab}>
                            <Tab.Content>
                                
                                {/* TAB 1: PRESENSI & TIKET QR */}
                                <Tab.Pane eventKey="overview">
                                    <Card className="border-0 shadow-sm rounded-4 mb-4 text-center p-4">
                                        <h5 className="fw-bold mb-3">Tunjukkan QR Ini ke Panitia</h5>
                                        <p className="text-muted small mb-4">Pastikan kecerahan layar maksimal agar mudah di-scan oleh scanner panitia.</p>
                                        
                                        <div className="bg-light mx-auto d-flex justify-content-center align-items-center border rounded-4 mb-3" style={{ width: '250px', height: '250px' }}>
                                            {/* Nanti ini diganti dengan library QRCode React beneran */}
                                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${eventData.qrToken}`} alt="QR Presensi" />
                                        </div>
                                        <h4 className="fw-bold text-primary tracking-widest">{eventData.ticketCode}</h4>
                                    </Card>

                                    <Card className="border-0 shadow-sm rounded-4 p-4">
                                        <h5 className="fw-bold mb-3">Rundown Hari Ini</h5>
                                        {/* Hardcode rundown sederhana */}
                                        <div className="border-start border-primary border-3 ps-3 ms-2 mb-3">
                                            <div className="fw-bold">09:00 - 10:00 WIB</div>
                                            <div className="text-dark">Opening & Keynote Speaker</div>
                                        </div>
                                        <div className="border-start border-secondary border-3 ps-3 ms-2 mb-3 opacity-50">
                                            <div className="fw-bold">10:00 - 12:00 WIB</div>
                                            <div className="text-dark">Workshop: AI Implementation</div>
                                        </div>
                                    </Card>
                                </Tab.Pane>

                                {/* TAB 2: MATERI & MICRO LEARNING */}
                                <Tab.Pane eventKey="materi">
                                    <Card className="border-0 shadow-sm rounded-4 p-4 mb-4">
                                        <h5 className="fw-bold mb-4">Video Pembelajaran Singkat</h5>
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <div className="bg-dark text-white rounded-3 d-flex flex-column align-items-center justify-content-center p-4" style={{ height: '150px' }}>
                                                    <Video size={30} className="mb-2"/>
                                                    <span>Play: Pengantar AI (1 Min)</span>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card>

                                    <Card className="border-0 shadow-sm rounded-4 p-4">
                                        <h5 className="fw-bold mb-4">Unduh Dokumen Acara</h5>
                                        <div className="d-flex justify-content-between align-items-center p-3 border rounded-3 mb-2">
                                            <div className="d-flex align-items-center">
                                                <BookOpen className="text-primary me-3" />
                                                <span className="fw-medium">Modul Workshop AI.pdf</span>
                                            </div>
                                            <Button variant="outline-primary" size="sm"><Download size={16}/></Button>
                                        </div>
                                    </Card>
                                </Tab.Pane>

                                {/* TAB 3: Q&A DAN CHAT */}
                                <Tab.Pane eventKey="interaksi">
                                    <Card className="border-0 shadow-sm rounded-4 p-4 text-center" style={{ height: '400px' }}>
                                        <MessageSquare size={50} className="mx-auto text-muted mb-3 opacity-50 mt-5" />
                                        <h5 className="fw-bold text-muted">Event Chat Room</h5>
                                        <p className="text-muted">Chat room akan dibuka 15 menit sebelum acara dimulai.</p>
                                    </Card>
                                </Tab.Pane>

                            </Tab.Content>
                        </Tab.Container>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ParticipantEventHub;