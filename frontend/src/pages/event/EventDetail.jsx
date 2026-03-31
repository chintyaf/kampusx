import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Accordion, Spinner, Alert } from 'react-bootstrap';
import { Calendar, MapPin, Clock, Share2, Heart, User, Info, Wifi, Users, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';


const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const [eventDetails, setEventDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState('day1');

    useEffect(() => {
        const fetchSingleEvent = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`http://localhost:8000/api/events/${id}`);                
                const data = response.data.data || response.data;
                setEventDetails(data);
                setIsLoading(false);
            } catch (err) {
                console.error("Gagal memuat detail event:", err);
                setError("Data event tidak ditemukan atau terjadi kesalahan server.");
                setIsLoading(false);
            }
        };

        if (id) {
            fetchSingleEvent();
        }
    }, [id]);

    const handleLanjutPembayaran = (e) => {
        e.preventDefault();
        console.log("Tombol diklik! ID event:", id);
        
        if (!user) {
            console.log("User belum login, redirect ke Sign In");
            alert("Silakan Sign In terlebih dahulu untuk melanjutkan pembayaran.");
            navigate('/signin', { state: { from: location.pathname } }); 
            return;
        }

        navigate(`/checkout/${id}`); 
        console.log("Navigasi ke halaman checkout dengan ID event:", id);
    };

    if (isLoading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <Spinner animation="border" style={{ color: 'var(--color-primary)' }} />
                <p className="mt-3 text-muted">Memuat detail event...</p>
            </div>
        );
    }

    if (error || !eventDetails) {
        return (
            <Container className="py-5 text-center">
                <Alert variant="danger" className="mb-4">{error}</Alert>
                <Button variant="outline-primary" onClick={() => navigate(-1)}>Kembali ke Eksplor</Button>
            </Container>
        );
    }

    return (
        <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '80px' }}>
            
            {/* --- HEADER BANNER --- */}
            <div className="bg-white border-bottom pt-4 pb-4 mb-4 shadow-sm">
                <Container>
                    <Button variant="link" className="text-decoration-none p-0 d-flex align-items-center mb-3 text-muted" onClick={() => navigate(-1)}>
                        <ArrowLeft size={16} className="me-2" /> Kembali
                    </Button>
                    <div className="d-flex gap-2 mb-3">
                        {/* Render tipe event (Online/Onsite) */}
                        {eventDetails.is_in_person ? <Badge bg="light" text="dark" className="border px-3 py-2 d-flex align-items-center"><Users size={14} className="me-1"/> Onsite</Badge> : null}
                        {eventDetails.is_online ? <Badge bg="light" text="primary" className="border border-primary px-3 py-2 d-flex align-items-center"><Wifi size={14} className="me-1"/> Online</Badge> : null}
                        {/* Kategori Event (Jika ada) */}
                        {eventDetails.category ? <Badge bg="light" text="dark" className="border px-3 py-2">{eventDetails.category}</Badge> : null}
                    </div>
                    
                    <h1 className="fw-bold mb-3" style={{ color: 'var(--color-text)', fontSize: '2.5rem' }}>
                        {eventDetails.title}
                    </h1>
                    
                    <p className="text-muted fs-5 mb-0" style={{ maxWidth: '800px' }}>
                        {/* Menampilkan deskripsi singkat (jika ada field short_description), atau potong deskripsi panjang */}
                        {eventDetails.short_description || "Bergabunglah dalam event luar biasa ini dan tingkatkan portofolio serta kemampuan profesional Anda bersama KampusX."}
                    </p>
                </Container>
            </div>

            <Container>
                <Row className="g-4">
                    {/* ========================================== */}
                    {/* KOLOM KIRI: KONTEN UTAMA */}
                    {/* ========================================== */}
                    <Col lg={8}>
                        {/* Gambar Utama Event */}
                        <div className="mb-4">
                            <img 
                                src={eventDetails.image_url || `https://placehold.co/1200x600/e2e8f0/64748b?text=${encodeURIComponent(eventDetails.title)}`} 
                                alt={eventDetails.title} 
                                className="w-100 rounded-4 object-fit-cover shadow-sm"
                                style={{ height: '400px' }}
                            />
                        </div>

                        {/* Deskripsi Event */}
                        <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
                            <h4 className="fw-bold mb-3" style={{ color: 'var(--color-text)' }}>Tentang Event Ini</h4>
                            
                            {/* Jika dari Laravel Anda mengirim format HTML (misal dari CKEditor), gunakan dangerouslySetInnerHTML */}
                            <div 
                                style={{ lineHeight: '1.8', color: 'var(--color-secondary)' }}
                                dangerouslySetInnerHTML={{ __html: eventDetails.description || '<p>Deskripsi tidak tersedia.</p>' }}
                            />
                        </div>

                        {/* Jadwal & Sesi (Bisa disesuaikan jika data session dikirim dari backend) */}
                        <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
                            <h4 className="fw-bold mb-4" style={{ color: 'var(--color-text)' }}>Jadwal & Agenda</h4>
                            
                            <Accordion defaultActiveKey="0">
                                <Accordion.Item eventKey="0" className="mb-3 border rounded">
                                    <Accordion.Header>
                                        <div className="fw-bold">Hari 1: Sesi Utama</div>
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        <ul className="list-unstyled m-0">
                                            <li className="d-flex mb-3">
                                                <div className="fw-bold me-3" style={{ minWidth: '80px', color: 'var(--color-primary)' }}>09:00 AM</div>
                                                <div>
                                                    <div className="fw-semibold text-dark">Registrasi & Pembukaan</div>
                                                    <div className="text-muted small">Panitia KampusX</div>
                                                </div>
                                            </li>
                                        </ul>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </div>
                    </Col>

                    {/* ========================================== */}
                    {/* KOLOM KANAN: STICKY TICKET CARD */}
                    {/* ========================================== */}
                    <Col lg={4}>
                        <div className="" style={{ top: '90px' }}>
                            
                            {/* Card Pembelian Tiket */}
                            <Card className="border shadow-sm rounded-4 mb-4">
                                <Card.Body className="p-4">
                                    <h4 className="fw-bold mb-1" style={{ color: 'var(--color-text)' }}>Beli Tiket</h4>
                                    <p className="text-muted small mb-4">Pilih jenis tiket atau sesi yang ingin Anda ikuti.</p>

                                    <Form onSubmit={handleLanjutPembayaran}>
                                        <div 
                                            className={`border rounded-3 p-3 mb-4 cursor-pointer ${selectedTicket === 'day1' ? 'border-primary bg-light' : ''}`}
                                            onClick={() => setSelectedTicket('day1')}
                                        >
                                            <Form.Check 
                                                type="radio" id="ticket-day1" label={<span className="fw-bold">General Admission</span>}
                                                checked={selectedTicket === 'day1'} onChange={() => setSelectedTicket('day1')}
                                            />
                                            <div className="ms-4 mt-1 d-flex justify-content-between align-items-center">
                                                <span className="small text-muted">Akses ke semua materi</span>
                                                <span className="fw-bold" style={{ color: 'var(--color-primary)' }}>
                                                    {eventDetails.price === 0 || eventDetails.price === 'Free' ? 'Gratis' : `Rp ${eventDetails.price}`}
                                                </span>
                                            </div>
                                        </div>

                                        <Button 
                                            type="submit" 
                                            className="w-100 py-3 fw-bold rounded-3 border-0 mb-3" 
                                            style={{ backgroundColor: 'var(--color-primary)' }}
                                            disabled={eventDetails.quota <= 0} // Disable jika kuota habis
                                        >
                                            {eventDetails.quota <= 0 ? 'Kouta Habis' : 'Lanjutkan ke Pembayaran'}
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
                                            <div className="fw-semibold text-dark" style={{ fontSize: 'var(--font-sm)' }}>
                                                {eventDetails.date || eventDetails.start_date}
                                            </div>
                                            <div className="text-muted" style={{ fontSize: 'var(--font-xs)' }}>Sesuai Jadwal</div>
                                        </div>
                                    </div>

                                    <div className="d-flex mb-3">
                                        <div className="bg-light p-2 rounded me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                            <MapPin size={20} style={{ color: 'var(--color-primary)' }} />
                                        </div>
                                        <div>
                                            <div className="fw-semibold text-dark" style={{ fontSize: 'var(--font-sm)' }}>
                                                {eventDetails.location_name || 'Lokasi Event'}
                                            </div>
                                            <div className="text-muted" style={{ fontSize: 'var(--font-xs)' }}>
                                                {eventDetails.location || eventDetails.address}
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Card Organizer */}
                            <Card className="border shadow-sm rounded-4">
                                <Card.Body className="p-4 text-center">
                                    <h6 className="fw-bold mb-3 text-start">Penyelenggara</h6>
                                    <div className="bg-light rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                        <User size={30} className="text-secondary" />
                                    </div>
                                    <h6 className="fw-bold mb-1">{eventDetails.organizer_name || eventDetails.org || 'Panitia KampusX'}</h6>
                                    <Button variant="outline-dark" size="sm" className="w-100 rounded-pill mt-3">Follow Organizer</Button>
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