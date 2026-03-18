import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Users, Wifi, Calendar, Ticket, MapPin, User, Filter, RotateCcw, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const ExploreEvents = () => {
    // --- MOCK DATA EVENT (Sesuai dengan properti card Anda) ---
    const popularEvents = [
        {
            id: 1, title: "International Conference on Management 2026", 
            isInPerson: true, isOnline: false, isFeatured: true,
            image: "https://placehold.co/600x300/e2e8f0/64748b?text=Event+1", date: "March 26, 2026", 
            price: "Free", location: "Bandung, ID", org: "KampusX"
        },
        {
            id: 2, title: "Web Development Bootcamp", 
            isInPerson: true, isOnline: true, isFeatured: false,
            image: "https://placehold.co/600x300/e2e8f0/64748b?text=Event+2", date: "April 10, 2026", 
            price: "Rp 150.000", location: "Jakarta, ID", org: "Tech Indo"
        },
        {
            id: 3, title: "Digital Marketing Online Workshop", 
            isInPerson: false, isOnline: true, isFeatured: true,
            image: "https://placehold.co/600x300/e2e8f0/64748b?text=Event+3", date: "May 05, 2026", 
            price: "Rp 50.000", location: "Online", org: "Marketing Hub"
        },
        {
            id: 4, title: "UI/UX Design Masterclass", 
            isInPerson: true, isOnline: false, isFeatured: true,
            image: "https://placehold.co/600x300/e2e8f0/64748b?text=Event+4", date: "June 12, 2026", 
            price: "Rp 250.000", location: "Bandung, ID", org: "KampusX"
        },
        {
            id: 5, title: "Data Science for Beginners", 
            isInPerson: true, isOnline: true, isFeatured: false,
            image: "https://placehold.co/600x300/e2e8f0/64748b?text=Event+5", date: "July 20, 2026", 
            price: "Rp 100.000", location: "Surabaya, ID", org: "Tech Indo"
        },
        {
            id: 6, title: "Startup Pitching Session", 
            isInPerson: false, isOnline: true, isFeatured: true,
            image: "https://placehold.co/600x300/e2e8f0/64748b?text=Event+6", date: "August 15, 2026", 
            price: "Free", location: "Online", org: "Marketing Hub"
        },
        {
            id: 7, title: "AI & Machine Learning Expo", 
            isInPerson: true, isOnline: false, isFeatured: true,
            image: "https://placehold.co/600x300/e2e8f0/64748b?text=Event+7", date: "September 10, 2026", 
            price: "Rp 300.000", location: "Bali, ID", org: "KampusX"
        },
        {
            id: 8, title: "Mobile App Development", 
            isInPerson: true, isOnline: true, isFeatured: false,
            image: "https://placehold.co/600x300/e2e8f0/64748b?text=Event+8", date: "October 05, 2026", 
            price: "Rp 200.000", location: "Yogyakarta, ID", org: "Tech Indo"
        },
        {
            id: 9, title: "Content Creator Summit", 
            isInPerson: false, isOnline: true, isFeatured: true,
            image: "https://placehold.co/600x300/e2e8f0/64748b?text=Event+9", date: "November 22, 2026", 
            price: "Rp 75.000", location: "Online", org: "Marketing Hub"
        },
    ];

    // Daftar sebagian negara (Anda bisa tambahkan sisanya di array ini)
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
                    {/* ========================================== */}
                    {/* KOLOM KIRI: SIDEBAR FILTER (25% di layar besar) */}
                    {/* ========================================== */}
                    <Col lg={3}>
                        <Card className="border-0 shadow-sm sticky-top" style={{ top: '90px', borderRadius: '12px' }}>
                            <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center" style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                                <span className="fw-bold" style={{ color: 'var(--color-text)' }}>Filters</span>
                                <Button variant="link" className="text-decoration-none p-0 d-flex align-items-center" style={{ fontSize: 'var(--font-xs)', color: 'var(--color-secondary)' }}>
                                    <RotateCcw size={14} className="me-1"/> Reset Filters
                                </Button>
                            </Card.Header>
                            
                            <Card.Body className="p-4" style={{ maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }}>
                                <Form>
                                    {/* Event Title */}
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold" style={{ fontSize: 'var(--font-sm)' }}>Event Title</Form.Label>
                                        <div className="position-relative">
                                            <Search size={16} className="position-absolute" style={{ top: '12px', left: '12px', color: 'var(--color-secondary)' }} />
                                            <Form.Control type="text" placeholder="Search title..." style={{ paddingLeft: '35px', fontSize: 'var(--font-sm)' }} />
                                        </div>
                                    </Form.Group>

                                    {/* Event Type */}
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold" style={{ fontSize: 'var(--font-sm)' }}>Event Type</Form.Label>
                                        <Form.Check type="checkbox" label="Conference" id="type-conf" style={{ fontSize: 'var(--font-sm)' }} />
                                        <Form.Check type="checkbox" label="Workshop" id="type-work" style={{ fontSize: 'var(--font-sm)' }} />
                                    </Form.Group>

                                    {/* Online Type */}
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold" style={{ fontSize: 'var(--font-sm)' }}>Online Type</Form.Label>
                                        <Form.Check type="checkbox" label="Online" id="online-1" style={{ fontSize: 'var(--font-sm)' }} />
                                        <Form.Check type="checkbox" label="In-Person" id="online-2" style={{ fontSize: 'var(--font-sm)' }} />
                                    </Form.Group>

                                    {/* Categories */}
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold" style={{ fontSize: 'var(--font-sm)' }}>Categories</Form.Label>
                                        <Form.Select style={{ fontSize: 'var(--font-sm)' }}>
                                            <option>All Categories</option>
                                            <option>Business and Economics</option>
                                            <option>Engineering & Technology</option>
                                            <option>Health and Medicine</option>
                                        </Form.Select>
                                    </Form.Group>

                                    {/* Date Range */}
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold" style={{ fontSize: 'var(--font-sm)' }}>Start Date</Form.Label>
                                        <Form.Control type="date" style={{ fontSize: 'var(--font-sm)' }} />
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold" style={{ fontSize: 'var(--font-sm)' }}>End Date</Form.Label>
                                        <Form.Control type="date" style={{ fontSize: 'var(--font-sm)' }} />
                                    </Form.Group>

                                    {/* Location Details */}
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold" style={{ fontSize: 'var(--font-sm)' }}>Country</Form.Label>
                                        <Form.Select style={{ fontSize: 'var(--font-sm)' }}>
                                            <option>-- Choose Country --</option>
                                            <option>Online</option>
                                            {countries.map((c, i) => <option key={i}>{c}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold" style={{ fontSize: 'var(--font-sm)' }}>City</Form.Label>
                                        <Form.Control type="text" placeholder="e.g. Bandung" style={{ fontSize: 'var(--font-sm)' }} />
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold" style={{ fontSize: 'var(--font-sm)' }}>Venue</Form.Label>
                                        <Form.Control type="text" placeholder="e.g. Sabuga" style={{ fontSize: 'var(--font-sm)' }} />
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold" style={{ fontSize: 'var(--font-sm)' }}>Tags</Form.Label>
                                        <Form.Control type="text" placeholder="e.g. #tech, #business" style={{ fontSize: 'var(--font-sm)' }} />
                                    </Form.Group>

                                    <Button className="w-100 fw-bold border-0 py-2 mt-2" style={{ backgroundColor: 'var(--color-primary)' }}>
                                        <Filter size={16} className="me-2"/> Terapkan Filter
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* ========================================== */}
                    {/* KOLOM KANAN: DAFTAR EVENT (75% di layar besar) */}
                    {/* ========================================== */}
                    <Col lg={9}>
                        {/* Menampilkan jumlah event yang ditemukan */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <span className="fw-medium text-muted">Menampilkan {popularEvents.length} Event</span>
                        </div>

                        {/* MENGGUNAKAN KODE CARD DARI ANDA */}
                        <Row className="g-4">
                            {popularEvents.map((ev) => (
                                /* Note: Diubah md={4} menjadi md={6} xl={4} karena ruangnya sudah diambil sidebar */
                                <Col xs={12} md={6} xl={4} key={ev.id}>
                                    <Link to={`/event/${ev.id}`} className="text-decoration-none text-dark">
                                        <Card className="h-100 shadow-sm p-3 border-0 hover-lift" style={{ borderRadius: '12px', backgroundColor: 'var(--color-white)' }}>
                                            
                                            {/* --- BADGES ATAS --- */}
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <div className="d-flex gap-2">
                                                    {ev.isInPerson && (
                                                        <div className="rounded-pill px-3 py-1 d-flex align-items-center fw-medium bg-white" 
                                                            style={{ fontSize: 'var(--font-xs)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}>
                                                            <Users size={14} className="me-2" /> In-Person
                                                        </div>
                                                    )}
                                                    {ev.isOnline && (
                                                        <div className="rounded-pill px-3 py-1 d-flex align-items-center fw-medium bg-white" 
                                                            style={{ fontSize: 'var(--font-xs)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}>
                                                            <Wifi size={14} className="me-2" /> Online
                                                        </div>
                                                    )}
                                                </div>
                                                {ev.isFeatured && (
                                                    <div className="rounded-pill px-3 py-1 fw-medium" 
                                                        style={{ fontSize: 'var(--font-xs)', backgroundColor: 'var(--bahama-blue-500)', color: 'var(--color-white)' }}>
                                                        Featured
                                                    </div>
                                                )}
                                            </div>

                                            {/* --- GAMBAR EVENT --- */}
                                            <img 
                                                src={ev.image} 
                                                alt={ev.title} 
                                                className="w-100 object-fit-cover rounded mb-3" 
                                                style={{ height: '180px' }} 
                                            />

                                            <Card.Body className="p-0 d-flex flex-column">
                                                {/* --- INFO TANGGAL & HARGA --- */}
                                                <div className="d-flex justify-content-between mb-3 fw-medium" style={{ color: 'var(--color-primary)', fontSize: 'var(--font-sm)' }}>
                                                    <div className="d-flex align-items-center">
                                                        <Calendar size={18} className="me-2" /> {ev.date}
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        <Ticket size={18} className="me-2" /> {ev.price}
                                                    </div>
                                                </div>

                                                {/* --- JUDUL EVENT --- */}
                                                <Card.Title className="fw-bold mb-auto" style={{ color: 'var(--color-text)', fontSize: 'var(--font-lg)', lineHeight: '1.4' }}>
                                                    {ev.title}
                                                </Card.Title>

                                                {/* --- GARIS PEMISAH --- */}
                                                <hr className="opacity-100 my-3" style={{ color: 'var(--color-border)' }} />

                                                {/* --- INFO LOKASI & PENYELENGGARA --- */}
                                                <div className="d-flex justify-content-between fw-medium" style={{ color: 'var(--color-primary)', fontSize: 'var(--font-sm)' }}>
                                                    <div className="d-flex align-items-center text-truncate" style={{ maxWidth: '60%' }}>
                                                        <MapPin size={18} className="me-2 flex-shrink-0" /> <span className="text-truncate">{ev.location}</span>
                                                    </div>
                                                    <div className="d-flex align-items-center text-truncate ms-2" style={{ maxWidth: '40%' }}>
                                                        <User size={18} className="me-2 flex-shrink-0" /> <span className="text-truncate">{ev.org}</span>
                                                    </div>
                                                </div>
                                            </Card.Body>
                                            
                                        </Card>
                                    
                                    </Link>
                                </Col>
                            ))}
                        </Row>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ExploreEvents;