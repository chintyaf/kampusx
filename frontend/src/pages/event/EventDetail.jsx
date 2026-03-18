import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Accordion } from 'react-bootstrap';
import { Calendar, MapPin, Clock, Share2, Heart, User, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const EventDetail = () => {
    // State untuk memilih jenis tiket
    const [selectedTicket, setSelectedTicket] = useState('day1');

    const navigate = useNavigate(); // 1. Panggil hook di atas

    // 2. Buat fungsi untuk menangani klik/submit form
    const handleLanjutPembayaran = (e) => {
        e.preventDefault(); // Mencegah halaman ter-refresh otomatis
        
        // Nanti di sini Anda bisa tambahkan validasi form jika ada
        
        // 3. Pindah ke halaman checkout
        // navigate(`/checkout/${eventDetails.id}`); 
        navigate(`/checkout/1`); // Contoh hardcoded ID, nanti ganti dengan dynamic ID dari eventDetails
    };

    return (
        <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '80px' }}>
            
            {/* --- HEADER BANNER --- */}
            <div className="bg-white border-bottom pt-5 pb-4 mb-4 shadow-sm">
                <Container>
                    <div className="d-flex gap-2 mb-3">
                        <Badge bg="light" text="dark" className="border px-3 py-2">Conference</Badge>
                        <Badge bg="light" text="dark" className="border px-3 py-2">Technology</Badge>
                    </div>
                    <h1 className="fw-bold mb-3" style={{ color: 'var(--color-text)', fontSize: '2.5rem' }}>
                        Global Tech & Innovation Summit 2026
                    </h1>
                    <p className="text-muted fs-5 mb-0">
                        Bergabunglah dengan ribuan inovator, developer, dan pemimpin industri untuk membahas masa depan teknologi AI dan Web3.
                    </p>
                </Container>
            </div>

            <Container>
                <Row className="g-4">
                    {/* ========================================== */}
                    {/* KOLOM KIRI: KONTEN UTAMA (Sekitar 7-8 kolom) */}
                    {/* ========================================== */}
                    <Col lg={8}>
                        {/* Gambar Utama Event */}
                        <div className="mb-4">
                            <img 
                                src="https://placehold.co/600x300/e2e8f0/64748b?text=Banner+Event" 
                                alt="Event Banner" 
                                className="w-100 rounded-4 object-fit-cover shadow-sm"
                                style={{ height: '400px' }}
                            />
                        </div>

                        {/* Deskripsi Event */}
                        <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
                            <h4 className="fw-bold mb-3" style={{ color: 'var(--color-text)' }}>Tentang Event Ini</h4>
                            <p style={{ lineHeight: '1.8', color: 'var(--color-secondary)' }}>
                                Global Tech Summit adalah acara tahunan terbesar yang mempertemukan para ahli teknologi. 
                                Tahun ini, kami berfokus pada implementasi Artificial Intelligence dalam kehidupan sehari-hari 
                                dan bagaimana bisnis dapat beradaptasi dengan cepat. Akan ada sesi networking, workshop praktis, 
                                dan pameran teknologi terbaru.
                            </p>
                            <p style={{ lineHeight: '1.8', color: 'var(--color-secondary)' }}>
                                Pastikan Anda membawa laptop untuk sesi workshop interaktif dan siapkan kartu nama Anda untuk networking!
                            </p>
                        </div>

                        {/* Jadwal & Sesi (Multi-day support) */}
                        <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
                            <h4 className="fw-bold mb-4" style={{ color: 'var(--color-text)' }}>Jadwal & Agenda</h4>
                            
                            <Accordion defaultActiveKey="0">
                                {/* Hari 1 */}
                                <Accordion.Item eventKey="0" className="mb-3 border rounded">
                                    <Accordion.Header>
                                        <div className="fw-bold">Day 1: AI Revolution (26 March 2026)</div>
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        <ul className="list-unstyled m-0">
                                            <li className="d-flex mb-3">
                                                <div className="fw-bold me-3" style={{ minWidth: '80px', color: 'var(--color-primary)' }}>09:00 AM</div>
                                                <div>
                                                    <div className="fw-semibold text-dark">Opening Keynote: The Future of AI</div>
                                                    <div className="text-muted small">Oleh John Doe (CEO TechCorp)</div>
                                                </div>
                                            </li>
                                            <li className="d-flex mb-3">
                                                <div className="fw-bold me-3" style={{ minWidth: '80px', color: 'var(--color-primary)' }}>11:00 AM</div>
                                                <div>
                                                    <div className="fw-semibold text-dark">Workshop: Building LLM Apps</div>
                                                    <div className="text-muted small">Ruang Cendrawasih</div>
                                                </div>
                                            </li>
                                        </ul>
                                    </Accordion.Body>
                                </Accordion.Item>

                                {/* Hari 2 */}
                                <Accordion.Item eventKey="1" className="border rounded">
                                    <Accordion.Header>
                                        <div className="fw-bold">Day 2: Web3 & Security (27 March 2026)</div>
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        <ul className="list-unstyled m-0">
                                            <li className="d-flex mb-3">
                                                <div className="fw-bold me-3" style={{ minWidth: '80px', color: 'var(--color-primary)' }}>10:00 AM</div>
                                                <div>
                                                    <div className="fw-semibold text-dark">Panel Discussion: Cybersecurity</div>
                                                    <div className="text-muted small">Main Stage</div>
                                                </div>
                                            </li>
                                        </ul>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </div>
                    </Col>

                    {/* ========================================== */}
                    {/* KOLOM KANAN: STICKY TICKET CARD (4 kolom)  */}
                    {/* ========================================== */}
                    <Col lg={4}>
                        <div className="sticky-top" style={{ top: '90px' }}>
                            
                            {/* Card Pembelian Tiket */}
                            <Card className="border shadow-sm rounded-4 mb-4">
                                <Card.Body className="p-4">
                                    <h4 className="fw-bold mb-1" style={{ color: 'var(--color-text)' }}>Beli Tiket</h4>
                                    <p className="text-muted small mb-4">Pilih jenis tiket atau sesi yang ingin Anda ikuti.</p>

                                    <Form onSubmit={handleLanjutPembayaran}>
                                        {/* Pilihan Tiket */}
                                        <div 
                                            className={`border rounded-3 p-3 mb-3 cursor-pointer ${selectedTicket === 'day1' ? 'border-primary bg-light' : ''}`}
                                            onClick={() => setSelectedTicket('day1')}
                                        >
                                            <Form.Check 
                                                type="radio" id="ticket-day1" label={<span className="fw-bold">Day 1 Pass</span>}
                                                checked={selectedTicket === 'day1'} onChange={() => setSelectedTicket('day1')}
                                            />
                                            <div className="ms-4 mt-1 d-flex justify-content-between align-items-center">
                                                <span className="small text-muted">Akses penuh tanggal 26 Mar</span>
                                                <span className="fw-bold" style={{ color: 'var(--color-primary)' }}>Rp 150.000</span>
                                            </div>
                                        </div>

                                        <div 
                                            className={`border rounded-3 p-3 mb-3 cursor-pointer ${selectedTicket === 'day2' ? 'border-primary bg-light' : ''}`}
                                            onClick={() => setSelectedTicket('day2')}
                                        >
                                            <Form.Check 
                                                type="radio" id="ticket-day2" label={<span className="fw-bold">Day 2 Pass</span>}
                                                checked={selectedTicket === 'day2'} onChange={() => setSelectedTicket('day2')}
                                            />
                                            <div className="ms-4 mt-1 d-flex justify-content-between align-items-center">
                                                <span className="small text-muted">Akses penuh tanggal 27 Mar</span>
                                                <span className="fw-bold" style={{ color: 'var(--color-primary)' }}>Rp 150.000</span>
                                            </div>
                                        </div>

                                        <div 
                                            className={`border rounded-3 p-3 mb-4 cursor-pointer ${selectedTicket === 'full' ? 'border-primary bg-light' : ''}`}
                                            onClick={() => setSelectedTicket('full')}
                                        >
                                            <Form.Check 
                                                type="radio" id="ticket-full" label={<span className="fw-bold">Full 2-Days Pass</span>}
                                                checked={selectedTicket === 'full'} onChange={() => setSelectedTicket('full')}
                                            />
                                            <div className="ms-4 mt-1 d-flex justify-content-between align-items-center">
                                                <span className="small text-success">Hemat 20%</span>
                                                <span className="fw-bold" style={{ color: 'var(--color-primary)' }}>Rp 240.000</span>
                                            </div>
                                        </div>

                                        <Button type="submit" className="w-100 py-3 fw-bold rounded-3 border-0 mb-3" style={{ backgroundColor: 'var(--color-primary)' }}>
                                            Lanjutkan ke Pembayaran
                                        </Button>
                                    </Form>

                                    <div className="d-flex justify-content-center gap-3">
                                        <Button variant="light" className="d-flex align-items-center flex-fill justify-content-center border">
                                            <Share2 size={16} className="me-2" /> Share
                                        </Button>
                                        <Button variant="light" className="d-flex align-items-center flex-fill justify-content-center border">
                                            <Heart size={16} className="me-2 text-danger" /> Simpan
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Card Detail Waktu & Lokasi */}
                            <Card className="border shadow-sm rounded-4 mb-4">
                                <Card.Body className="p-4">
                                    <h6 className="fw-bold mb-3">Waktu & Lokasi</h6>
                                    
                                    <div className="d-flex mb-3">
                                        <div className="bg-light p-2 rounded me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                            <Calendar size={20} style={{ color: 'var(--color-primary)' }} />
                                        </div>
                                        <div>
                                            <div className="fw-semibold text-dark" style={{ fontSize: 'var(--font-sm)' }}>26 - 27 March 2026</div>
                                            <div className="text-muted" style={{ fontSize: 'var(--font-xs)' }}>09:00 AM - 17:00 PM WIB</div>
                                        </div>
                                    </div>

                                    <div className="d-flex mb-3">
                                        <div className="bg-light p-2 rounded me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                            <MapPin size={20} style={{ color: 'var(--color-primary)' }} />
                                        </div>
                                        <div>
                                            <div className="fw-semibold text-dark" style={{ fontSize: 'var(--font-sm)' }}>Sabuga ITB</div>
                                            <div className="text-muted" style={{ fontSize: 'var(--font-xs)' }}>Jl. Tamansari No.73, Lb. Siliwangi, Bandung</div>
                                        </div>
                                    </div>
                                    
                                    <a href="#" className="text-decoration-none fw-medium" style={{ fontSize: 'var(--font-sm)', color: 'var(--color-primary)' }}>
                                        Lihat di Google Maps
                                    </a>
                                </Card.Body>
                            </Card>

                            {/* Card Organizer */}
                            <Card className="border shadow-sm rounded-4">
                                <Card.Body className="p-4 text-center">
                                    <h6 className="fw-bold mb-3 text-start">Penyelenggara</h6>
                                    <div className="bg-light rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                        <User size={30} className="text-secondary" />
                                    </div>
                                    <h6 className="fw-bold mb-1">Tech Indo Nusantara</h6>
                                    <p className="text-muted small mb-3">12 Event telah diselenggarakan</p>
                                    <Button variant="outline-dark" size="sm" className="w-100 rounded-pill">Follow Organizer</Button>
                                </Card.Body>
                            </Card>

                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default EventDetail;