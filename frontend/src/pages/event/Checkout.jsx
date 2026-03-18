import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { ArrowLeft, CheckCircle, QrCode, Calendar, MapPin, User, Mail, Phone, Download } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const Checkout = () => {
    const { id } = useParams();
    
    // --- STATE MANAGEMENT ---
    const [step, setStep] = useState(1); // 1 = Checkout Form, 2 = Loading, 3 = Ticket Success
    const [formData, setFormData] = useState({
        name: 'Budi Santoso',
        email: 'budi.santoso@email.com',
        phone: '081234567890'
    });

    // --- MOCK DATA EVENT ---
    const eventDetails = {
        title: "UI/UX Design Masterclass",
        date: "June 12, 2026",
        time: "09:00 AM - 04:00 PM WIB",
        location: "Bandung, ID",
        venue: "Sabuga Convention Center",
        price: 250000,
        adminFee: 5000,
    };

    const totalPayment = eventDetails.price + eventDetails.adminFee;

    // --- HANDLERS ---
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckout = (e) => {
        e.preventDefault();
        setStep(2); // Set ke loading
        
        // Simulasi proses pembayaran selama 2 detik
        setTimeout(() => {
            setStep(3); // Pindah ke halaman tiket
        }, 2000);
    };

    // --- RENDER: STEP 3 (TIKET DIGITAL) ---
    if (step === 3) {
        return (
            <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', padding: '50px 0' }}>
                <Container className="d-flex flex-column align-items-center">
                    <CheckCircle size={64} color="var(--bahama-blue-500)" className="mb-3" />
                    <h2 className="fw-bold mb-2" style={{ color: 'var(--color-text)' }}>Pembayaran Berhasil!</h2>
                    <p className="text-muted mb-5 text-center">Terima kasih, tiket Anda telah dikirim ke {formData.email}</p>

                    {/* TIKET DIGITAL CARD */}
                    <Card className="border-0 shadow-lg w-100" style={{ maxWidth: '800px', borderRadius: '16px', overflow: 'hidden' }}>
                        <Row className="g-0">
                            {/* BAGIAN KIRI: INFO EVENT */}
                            <Col md={8} className="p-4 p-md-5 d-flex flex-column justify-content-center" style={{ backgroundColor: 'var(--color-white)' }}>
                                <div className="mb-4">
                                    <span className="badge bg-success mb-2 px-3 py-2 rounded-pill">E-TICKET AKTIF</span>
                                    <h3 className="fw-bold" style={{ color: 'var(--color-text)' }}>{eventDetails.title}</h3>
                                </div>
                                
                                <div className="d-flex flex-column gap-3 mb-4 text-muted">
                                    <div className="d-flex align-items-center gap-3">
                                        <Calendar size={20} className="flex-shrink-0 text-primary" />
                                        <div>
                                            <div className="fw-medium text-dark">{eventDetails.date}</div>
                                            <div style={{ fontSize: '14px' }}>{eventDetails.time}</div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <MapPin size={20} className="flex-shrink-0 text-primary" />
                                        <div>
                                            <div className="fw-medium text-dark">{eventDetails.venue}</div>
                                            <div style={{ fontSize: '14px' }}>{eventDetails.location}</div>
                                        </div>
                                    </div>
                                </div>

                                <hr className="mb-4" />

                                <Row className="g-3">
                                    <Col xs={6}>
                                        <div className="text-muted mb-1" style={{ fontSize: '12px' }}>Nama Peserta</div>
                                        <div className="fw-bold text-dark">{formData.name}</div>
                                    </Col>
                                    <Col xs={6}>
                                        <div className="text-muted mb-1" style={{ fontSize: '12px' }}>Tipe Tiket</div>
                                        <div className="fw-bold text-dark">Regular Pass</div>
                                    </Col>
                                    <Col xs={6}>
                                        <div className="text-muted mb-1" style={{ fontSize: '12px' }}>Order ID</div>
                                        <div className="fw-bold text-dark">#EVT-987654321</div>
                                    </Col>
                                </Row>
                            </Col>

                            {/* BAGIAN KANAN: QR CODE */}
                            <Col md={4} className="p-4 d-flex flex-column align-items-center justify-content-center text-center" style={{ backgroundColor: 'var(--bahama-blue-50)', borderLeft: '2px dashed var(--color-border)' }}>
                                <div className="bg-white p-3 rounded-4 shadow-sm mb-3">
                                    <QrCode size={120} color="var(--color-text)" />
                                </div>
                                <p className="text-muted mb-0" style={{ fontSize: '12px' }}>Tunjukkan QR Code ini pada saat registrasi ulang di lokasi event.</p>
                            </Col>
                        </Row>
                    </Card>

                    <div className="mt-5 d-flex gap-3">
                        <Button variant="outline-primary" className="fw-medium py-2 px-4 rounded-pill d-flex align-items-center">
                            <Download size={18} className="me-2" /> Unduh Tiket (PDF)
                        </Button>
                        <Link to="/explore-events" className="text-decoration-none">
                            <Button className="fw-medium py-2 px-4 rounded-pill text-white border-0" style={{ backgroundColor: 'var(--color-primary)' }}>
                                Cari Event Lain
                            </Button>
                        </Link>
                    </div>
                </Container>
            </div>
        );
    }

    // --- RENDER: STEP 1 & 2 (CHECKOUT FORM) ---
    return (
        <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '50px' }}>
            <div className="py-4 bg-white border-bottom mb-4 shadow-sm">
                <Container>
                    <Link to="/event/1" className="text-decoration-none d-inline-flex align-items-center text-muted hover-primary mb-2">
                        <ArrowLeft size={16} className="me-2" /> Kembali ke Detail Event
                    </Link>
                    <h2 className="fw-bold mb-0" style={{ color: 'var(--color-text)' }}>Checkout</h2>
                </Container>
            </div>

            <Container>
                <Form onSubmit={handleCheckout}>
                    <Row className="g-4">
                        {/* KOLOM KIRI: FORM DATA DIRI */}
                        <Col lg={8}>
                            <Card className="border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '12px' }}>
                                <h5 className="fw-bold mb-4" style={{ color: 'var(--color-text)' }}>Informasi Pemesan</h5>
                                
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-medium text-muted">Nama Lengkap</Form.Label>
                                    <div className="position-relative">
                                        <User size={18} className="position-absolute text-muted" style={{ top: '12px', left: '14px' }} />
                                        <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Masukkan nama lengkap Anda" style={{ paddingLeft: '40px', py: '10px' }} disabled={step === 2} />
                                    </div>
                                </Form.Group>

                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-medium text-muted">Email</Form.Label>
                                            <div className="position-relative">
                                                <Mail size={18} className="position-absolute text-muted" style={{ top: '12px', left: '14px' }} />
                                                <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="contoh@email.com" style={{ paddingLeft: '40px' }} disabled={step === 2} />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-medium text-muted">Nomor WhatsApp</Form.Label>
                                            <div className="position-relative">
                                                <Phone size={18} className="position-absolute text-muted" style={{ top: '12px', left: '14px' }} />
                                                <Form.Control type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="0812xxxxxx" style={{ paddingLeft: '40px' }} disabled={step === 2} />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>

                        {/* KOLOM KANAN: ORDER SUMMARY */}
                        <Col lg={4}>
                            <Card className="border-0 shadow-sm p-4 sticky-top" style={{ top: '90px', borderRadius: '12px' }}>
                                <h5 className="fw-bold mb-4" style={{ color: 'var(--color-text)' }}>Ringkasan Pesanan</h5>
                                
                                <div className="mb-4">
                                    <h6 className="fw-bold mb-1">{eventDetails.title}</h6>
                                    <p className="text-muted mb-0" style={{ fontSize: '14px' }}>{eventDetails.date} • {eventDetails.location}</p>
                                </div>

                                <hr className="text-muted" />

                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">1x Tiket Regular</span>
                                    <span className="fw-medium">Rp {eventDetails.price.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-3">
                                    <span className="text-muted">Biaya Admin</span>
                                    <span className="fw-medium">Rp {eventDetails.adminFee.toLocaleString('id-ID')}</span>
                                </div>

                                <hr className="text-muted" />

                                <div className="d-flex justify-content-between mb-4 align-items-center">
                                    <span className="fw-bold fs-5">Total Pembayaran</span>
                                    <span className="fw-bold fs-5" style={{ color: 'var(--color-primary)' }}>Rp {totalPayment.toLocaleString('id-ID')}</span>
                                </div>

                                <Button 
                                    type="submit" 
                                    disabled={step === 2}
                                    className="w-100 fw-bold border-0 py-3 rounded-3 d-flex justify-content-center align-items-center" 
                                    style={{ backgroundColor: 'var(--color-primary)', fontSize: '16px' }}
                                >
                                    {step === 2 ? (
                                        <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" /> Memproses...</>
                                    ) : (
                                        'Bayar Sekarang'
                                    )}
                                </Button>
                                <p className="text-center text-muted mt-3 mb-0" style={{ fontSize: '12px' }}>
                                    Pembayaran aman dan terenkripsi.
                                </p>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </Container>
        </div>
    );
};

export default Checkout;