import React, { useState, useEffect } from 'react';
// 1. TAMBAHKAN Alert DI SINI
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { Users, Wifi, Calendar, Ticket, MapPin, User, Filter, RotateCcw, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
// import axios from 'axios';
import api from '../api/axios';

const ExploreEvents = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // 2. GUNAKAN API.GET DENGAN RELATIVE PATH
                // Karena baseURL biasanya sudah disetting di instance 'api'
                const response = await api.get('/events'); 
                
                const result = response.data;

                // 3. SESUAIKAN DENGAN STRUKTUR PENGAMBILAN DATA
                // Cek status success dan ambil isinya
                if (result.status === "success" || result.data) {
                    // Terkadang Laravel paginator membungkus data lagi di dalam 'data'
                    // Jadi kita gunakan fallback agar aman
                    const eventData = result.data.data || result.data; 
                    setEvents(eventData);
                } else {
                    // Fallback jika API langsung mengembalikan array tanpa wrapper
                    setEvents(result); 
                }
                
                setIsLoading(false);
            } catch (err) {
                console.error("Gagal mengambil data event:", err);
                setError("Terjadi kesalahan saat memuat data event. Pastikan server menyala.");
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // 2. HELPER UNTUK FORMAT HARGA
    const formatPrice = (price) => {
        if (!price || price === 0 || price === "0") return "Free";
        // Jika dari API sudah berbentuk string "Rp xxx"
        if (typeof price === 'string' && price.toLowerCase().includes('rp')) return price;
        
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    // 3. HELPER UNTUK FORMAT TANGGAL
    const formatDate = (dateString) => {
        if (!dateString) return "TBA";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const countries = [
        "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", 
        "Brazil", "Canada", "China", "France", "Germany", "India", 
        "Indonesia", "Japan", "Malaysia", "Singapore", "United Kingdom", "United States"
    ];

    return (
        <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '50px' }}>
            {/* --- HEADER TITLE --- */}
            <div className="py-5 bg-white border-bottom mb-4 shadow-sm">
                <Container>
                    <h2 className="fw-bold mb-2" style={{ color: 'var(--color-text)' }}>Eksplor Event</h2>
                    <p className="text-muted m-0">Temukan event konferensi dan workshop terbaik dari seluruh dunia.</p>
                </Container>
            </div>

            <Container>
                <Row className="g-4">
                    {/* KOLOM KIRI: SIDEBAR FILTER */}
                    <Col lg={3}>
                        <Card className="border-0 shadow-sm" style={{ borderRadius: '10px' }}>
                            <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center" style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                                <span className="fw-bold" style={{ color: 'var(--color-text)' }}>Filters</span>
                                <Button variant="link" className="text-decoration-none p-0 d-flex align-items-center" style={{ fontSize: 'var(--font-xs)', color: 'var(--color-secondary)' }}>
                                    <RotateCcw size={14} className="me-1"/> Reset Filters
                                </Button>
                            </Card.Header>
                            
                            <Card.Body className="p-4" style={{ maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }}>
                                <Form>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold" style={{ fontSize: 'var(--font-sm)' }}>Event Title</Form.Label>
                                        <div className="position-relative">
                                            <Search size={16} className="position-absolute" style={{ top: '12px', left: '12px', color: 'var(--color-secondary)' }} />
                                            <Form.Control type="text" placeholder="Search title..." style={{ paddingLeft: '35px', fontSize: 'var(--font-sm)' }} />
                                        </div>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold" style={{ fontSize: 'var(--font-sm)' }}>Event Type</Form.Label>
                                        <Form.Check type="checkbox" label="Conference" id="type-conf" style={{ fontSize: 'var(--font-sm)' }} />
                                        <Form.Check type="checkbox" label="Workshop" id="type-work" style={{ fontSize: 'var(--font-sm)' }} />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold" style={{ fontSize: 'var(--font-sm)' }}>Location Type</Form.Label>
                                        <Form.Check type="checkbox" label="Online" id="online-1" style={{ fontSize: 'var(--font-sm)' }} />
                                        <Form.Check type="checkbox" label="In-Person" id="online-2" style={{ fontSize: 'var(--font-sm)' }} />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold" style={{ fontSize: 'var(--font-sm)' }}>Categories</Form.Label>
                                        <Form.Select style={{ fontSize: 'var(--font-sm)' }}>
                                            <option>All Categories</option>
                                            <option>Business and Economics</option>
                                            <option>Engineering & Technology</option>
                                            <option>Health and Medicine</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Button className="w-100 fw-bold border-0 py-2 mt-2" style={{ backgroundColor: 'var(--color-primary)' }}>
                                        <Filter size={16} className="me-2"/> Terapkan Filter
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* KOLOM KANAN: DAFTAR EVENT */}
                    <Col lg={9}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <span className="fw-medium text-muted">Menampilkan {events.length} Event</span>
                        </div>

                        {isLoading && (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-3 text-muted">Memuat data event...</p>
                            </div>
                        )}

                        {error && (
                            <Alert variant="danger">
                                {error}
                            </Alert>
                        )}

                        {!isLoading && !error && events.length === 0 && (
                            <div className="text-center py-5 text-muted">
                                Belum ada event yang tersedia.
                            </div>
                        )}
                        
                        {!isLoading && !error && events.length > 0 && (
                            <Row className="g-4">
                                {events.map((ev) => (
                                    <Col xs={12} md={6} xl={4} key={ev.id}>
                                        <Link to={`/event/${ev.id}`} className="text-decoration-none text-dark">
                                            <Card className="p-2 h-100 shadow-sm border-0 hover-lift overflow-hidden" style={{ borderRadius: '12px', backgroundColor: 'var(--color-white)' }}>
                                                
                                                <div className="d-flex justify-content-between align-items-center mb-3" style={{ minHeight: '28px' }}>
                                                    <div className="d-flex px-2 py-1 gap-2" style={{ fontSize: 'var(--font-xs)' }}>
                                                        {ev.is_in_person ? (
                                                            <div className="rounded-pill px-2 py-1 d-flex align-items-center fw-medium bg-white" 
                                                                style={{ fontSize: 'var(--font-xs)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}>
                                                                <Users size={14} className="me-2" /> In-Person
                                                            </div>
                                                        ) : null}
                                                        {ev.is_online ? (
                                                            <div className="rounded-pill px-2 py-1 d-flex align-items-center fw-medium bg-white" 
                                                                style={{ fontSize: 'var(--font-xs)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}>
                                                                <Wifi size={14} className="me-2" /> Online
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                    {ev.is_featured ? (
                                                        <div className="rounded-pill px-2 py-1 fw-medium" 
                                                            style={{ fontSize: 'var(--font-xs)', backgroundColor: 'var(--bahama-blue-500)', color: 'var(--color-white)' }}>
                                                            Featured
                                                        </div>
                                                    ) : null}
                                                </div>

                                                <img 
                                                    // Jika API mu mereturn null untuk image, gunakan placehold.co sebagai default
                                                    src={ev.image || `https://placehold.co/600x300/e2e8f0/64748b?text=Event+${ev.id}`} 
                                                    alt={ev.title} 
                                                    className="w-100 object-fit-cover rounded mb-3" 
                                                    style={{ height: '180px' }} 
                                                />

                                                <Card.Body className="p-0 d-flex flex-column">
                                                    <div className="d-flex justify-content-between mb-3 fw-medium" style={{ color: 'var(--color-primary)', fontSize: 'var(--font-sm)' }}>
                                                        <div className="d-flex align-items-center">
                                                            {/* Gunakan helper formatDate */}
                                                            <Calendar size={18} className="me-2" /> {formatDate(ev.date || ev.start_date)}
                                                        </div>
                                                        <div className="d-flex align-items-center">
                                                            {/* Gunakan helper formatPrice */}
                                                            <Ticket size={18} className="me-2" /> {formatPrice(ev.price)}
                                                        </div>
                                                    </div>

                                                    <Card.Title className="fw-bold mb-auto" style={{ color: 'var(--color-text)', fontSize: 'var(--font-lg)', lineHeight: '1.4' }}>
                                                        {ev.title}
                                                    </Card.Title>

                                                    <hr className="opacity-100 my-3" style={{ color: 'var(--color-border)' }} />

                                                    <div className="d-flex justify-content-between fw-medium" style={{ color: 'var(--color-primary)', fontSize: 'var(--font-sm)' }}>
                                                        <div className="d-flex align-items-center text-truncate" style={{ maxWidth: '60%' }}>
                                                            {/* Fallback ke "TBA" jika location kosong */}
                                                            <MapPin size={18} className="me-2 flex-shrink-0" /> <span className="text-truncate">{ev.location || 'TBA'}</span>
                                                        </div>
                                                        <div className="d-flex align-items-center text-truncate ms-2" style={{ maxWidth: '40%' }}>
                                                            {/* Fallback ke "KampusX" jika org kosong */}
                                                            <User size={18} className="me-2 flex-shrink-0" /> <span className="text-truncate">{ev.org || ev.institution?.name || 'KampusX'}</span>
                                                        </div>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Link>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ExploreEvents;