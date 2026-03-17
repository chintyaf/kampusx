import React from 'react';
import { Carousel, Container, Row, Col, Card, Button, InputGroup, Form } from 'react-bootstrap';
// 1. IMPORT IKON DARI LUCIDE REACT
import { 
    Megaphone, Laptop, Music, Trophy, GraduationCap, Globe, 
    Building2, ShieldCheck, Wallet, FileText, Users, 
    Search, CreditCard, Ticket,
    Calendar, MapPin, User, Wifi
} from 'lucide-react';

const LandingPage = () => {

    // === DATA HARDCODE ===
    
    const banners = [
        { id: 1, title: "Konser Musik Tahunan", image: "https://placehold.co/1200x500/e2e8f0/64748b?text=Banner+Konser+Musik" },
        { id: 2, title: "Seminar Nasional Teknologi", image: "https://placehold.co/1200x500/e2e8f0/64748b?text=Banner+Seminar+Nasional" },
        { id: 3, title: "Workshop Persiapan Karir", image: "https://placehold.co/1200x500/e2e8f0/64748b?text=Banner+Workshop+Karir" }
    ];

    // 2. MASUKKAN KOMPONEN IKON KE DALAM DATA
    const categories = [
        { id: 1, name: "Seminar", Icon: Megaphone },
        { id: 2, name: "Workshop", Icon: Laptop },
        { id: 3, name: "Konser", Icon: Music },
        { id: 4, name: "Kompetisi", Icon: Trophy },
        { id: 5, name: "Beasiswa", Icon: GraduationCap },
        { id: 6, name: "Webinar", Icon: Globe },
    ];

    const popularEvents = [
        { 
            id: 1, 
            title: "8th International Conference on New Trends in Management, Business and Economics", 
            org: "Logan Grubber", 
            image: "https://placehold.co/600x300/e2e8f0/64748b?text=Event+1",
            date: "March 26, 2026",
            price: "Rp 150.000",
            location: "Czech Republic",
            isOnline: true,
            isInPerson: true,
            isFeatured: true
        },
        { 
            id: 2, 
            title: "Workshop UI/UX Design: Creating Accessible Interfaces for Everyone", 
            org: "Design Club ID", 
            image: "https://placehold.co/600x300/e2e8f0/64748b?text=Event+2",
            date: "April 10, 2026",
            price: "Gratis",
            location: "Bandung, ID",
            isOnline: false,
            isInPerson: true,
            isFeatured: false
        },
        { 
            id: 3, 
            title: "Tech Startup Conference 2026: Future of AI in Education", 
            org: "HIMA TI KampusX", 
            image: "https://placehold.co/600x300/e2e8f0/64748b?text=Event+3",
            date: "May 15, 2026",
            price: "Rp 75.000",
            location: "Zoom Meeting",
            isOnline: true,
            isInPerson: false,
            isFeatured: true
        },
    ];

    const features = [
        { id: 1, title: "Event Terverifikasi", desc: "Semua event dijamin resmi dari instansi terpercaya.", Icon: ShieldCheck },
        { id: 2, title: "Pembayaran Aman", desc: "Transaksi tiket dijamin aman dan mudah.", Icon: Wallet },
        { id: 3, title: "E-Sertifikat", desc: "Dapatkan e-sertifikat langsung setelah event.", Icon: FileText },
        { id: 4, title: "Jaringan Luas", desc: "Perluas relasi profesionalmu di sini.", Icon: Users },
    ];

    const steps = [
        { id: 1, title: "Cari Event", desc: "Temukan event sesuai minatmu.", Icon: Search },
        { id: 2, title: "Daftar & Bayar", desc: "Registrasi cepat dan bayar tiket.", Icon: CreditCard },
        { id: 3, title: "Hadir & Nikmati", desc: "Ikuti event secara langsung/online.", Icon: Ticket },
    ];

    const partners = [
        { id: 1, name: "Kampus A", logo: "https://placehold.co/150x60/ffffff/000000?text=Logo+Kampus+A" },
        { id: 2, name: "Kampus B", logo: "https://placehold.co/150x60/ffffff/000000?text=Logo+Kampus+B" },
        { id: 3, name: "Kampus C", logo: "https://placehold.co/150x60/ffffff/000000?text=Logo+Kampus+C" },
        { id: 4, name: "Kampus D", logo: "https://placehold.co/150x60/ffffff/000000?text=Logo+Kampus+D" },
    ];

    return (
        <div className="bg-white">
            
            {/* 1. HERO SECTION */}
            <section className="bg-light pb-5 border-bottom">
                <Carousel interval={3000} pause="hover" className="w-100 mb-5 custom-carousel">
                    {banners.map((banner) => (
                        <Carousel.Item key={banner.id}>
                            <img 
                                src={banner.image} 
                                alt={banner.title} 
                                className="d-block w-100 object-fit-cover" 
                                style={{ height: '500px' }} 
                            />
                        </Carousel.Item>
                    ))}
                </Carousel>

                <Container className="text-center">
                    <h1 className="display-4 fw-bold mb-3">Pusat Event Kampus Terbesar di Indonesia</h1>
                    <p className="lead text-muted mb-4 mx-auto" style={{ maxWidth: '700px' }}>
                        Temukan ribuan event seru mulai dari seminar, workshop, hingga konser musik langsung dari kampus-kampus terbaik di seluruh Nusantara.
                    </p>
                    <Button variant="dark" size="lg" className="px-5 rounded-pill shadow-sm">
                        Cari Event Sekarang
                    </Button>
                </Container>
            </section>

            {/* 2. KATEGORI EVENT */}
            <Container className="py-5 text-center">
                <h2 className="fw-bold mb-5">Kategori Event</h2>
                <Row className="g-4 mb-4 justify-content-center">
                    {categories.map((cat) => (
                        <Col xs={4} md={2} key={cat.id} className="d-flex flex-column align-items-center">
                            <div className="bg-white border border-secondary rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '80px', height: '80px', transition: '0.3s' }}>
                                {/* 3. CARA RENDER IKON LUCIDE */}
                                <cat.Icon size={32} strokeWidth={1.5} className="text-dark" />
                            </div>
                            <span className="fw-semibold text-secondary">{cat.name}</span>
                        </Col>
                    ))}
                </Row>
                <Button variant="outline-dark" className="px-4 mt-3">Lihat Semua Kategori</Button>
            </Container>

            {/* 3. EVENT TERPOPULER */}
            <section className="py-5" style={{ backgroundColor: 'var(--color-bg)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
                <Container>
                    <h2 className="fw-bold mb-5 text-center" style={{ color: 'var(--color-text)' }}>Event Terpopuler</h2>
                    <Row className="g-4">
                        {popularEvents.map((ev) => (
                            <Col xs={12} md={4} key={ev.id}>
                                <Card className="h-100 shadow-sm p-3" style={{ borderRadius: '12px', backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)' }}>
                                    
                                    {/* --- BADGES ATAS (In-Person, Online, Featured) --- */}
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="d-flex gap-2">
                                            {ev.isInPerson && (
                                                <div className="rounded-pill px-3 py-1 d-flex align-items-center fw-medium" 
                                                     style={{ fontSize: 'var(--font-xs)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}>
                                                    <Users size={14} className="me-2" /> In-Person
                                                </div>
                                            )}
                                            {ev.isOnline && (
                                                <div className="rounded-pill px-3 py-1 d-flex align-items-center fw-medium" 
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
                                            <div className="d-flex align-items-center">
                                                <MapPin size={18} className="me-2" /> {ev.location}
                                            </div>
                                            <div className="d-flex align-items-center text-truncate ms-3">
                                                <User size={18} className="me-2" /> {ev.org}
                                            </div>
                                        </div>
                                    </Card.Body>
                                    
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* 4. MENGAPA MEMILIH KAMPUSX? */}
            <Container className="py-5">
                <h2 className="fw-bold mb-5 text-center">Mengapa memilih KampusX?</h2>
                <Row className="g-4">
                    {features.map((feat) => (
                        <Col xs={12} md={3} key={feat.id}>
                            <Card className="h-100 shadow-sm border-light p-4 text-center">
                                <div className="mb-3 d-flex justify-content-center" style={{ color: 'var(--color-primary)', fontSize: 'var(--font-sm)' }}>
                                    <feat.Icon size={48} strokeWidth={1.5} className="me-2" />
                                </div>
                                <h5 className="fw-bold">{feat.title}</h5>
                                <p className="text-muted small mb-0">{feat.desc}</p>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>

            {/* 5. CARA KERJA */}
            <section className="bg-light border-top border-bottom py-5">
                <Container className="text-center py-4">
                    <h2 className="fw-bold mb-5">Cara Kerja</h2>
                    <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-5" >
                        {steps.map((step) => (
                            <div key={step.id} className="d-flex flex-column align-items-center" style={{ maxWidth: '200px' }}>
                                <div className="bg-white border border-secondary border-dashed rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '100px', height: '100px', color: 'var(--color-primary)', fontSize: 'var(--font-sm)'}}>
                                    <step.Icon size={40} strokeWidth={1.5} className="me-2" />
                                </div>
                                <h5 className="fw-bold">{step.title}</h5>
                                <p className="text-muted small">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* 6. PARTNER & 7. CTA (Tetap sama seperti sebelumnya) */}
            <Container className="py-5 text-center">
                <h2 className="fw-bold mb-5">Kampus / Partner Kreator Terpopuler</h2>
                <Row className="g-4 justify-content-center">
                    {partners.map((partner) => (
                        <Col xs={6} md={3} key={partner.id}>
                            <div className="border rounded p-3 bg-white shadow-sm d-flex align-items-center justify-content-center" style={{ height: '90px' }}>
                                <img src={partner.logo} alt={partner.name} className="img-fluid" style={{ maxHeight: '100%' }} />
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>

            <section className="bg-dark py-5 text-white text-center">
                <Container className="py-4">
                    <h2 className="fw-bold mb-4">Siap menjadi mahasiswa Xtra?</h2>
                    <Row className="justify-content-center">
                        <Col xs={12} md={6}>
                            <InputGroup size="lg" className="shadow">
                                <Form.Control placeholder="Alamat Email Anda" className="border-0" />
                                <Button variant="primary" className="px-4 fw-bold">
                                    Mulai &gt;
                                </Button>
                            </InputGroup>
                        </Col>
                    </Row>
                </Container>
            </section>
            
        </div>
    );
};

export default LandingPage;