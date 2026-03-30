import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { ArrowLeft, CheckCircle, QrCode, Calendar, MapPin, User, Mail, Phone, Download } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // Sesuaikan path-nya

const Checkout = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useAuth(); // Ambil data user & token dari context

    // --- STATE MANAGEMENT ---
    const [step, setStep] = useState(1);
    const [eventDetails, setEventDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ticketData, setTicketData] = useState(null); // Menyimpan data tiket dari backend

    // Form data otomatis terisi dari user yang login
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '', 
    });

    // --- FETCH DATA EVENT ---
    useEffect(() => {
        // Kalau belum login, lempar ke SignIn
        if (!user) {
            navigate('/signin', { state: { from: `/checkout/${id}` } });
            return;
        }

        const fetchEvent = async () => {
            try {
                // Mengambil data dari fungsi show() di EventController kamu
                const response = await axios.get(`http://localhost:8000/api/events/${id}`);
                setEventDetails(response.data);
                setIsLoading(false);
            } catch (err) {
                setError("Gagal memuat detail event.");
                setIsLoading(false);
            }
        };

        fetchEvent();
    }, [id, user, navigate]);

    // --- HANDLERS ---
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setStep(2); // Set loading state pada tombol

        try {
            // Asumsi Endpoint Laravel untuk proses checkout
            const response = await axios.post(
                'http://localhost:8000/api/checkout', 
                {
                    event_id: id,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    quantity: 1, // Hardcode 1 tiket dulu untuk sekarang
                    // total_price: eventDetails.price // (Opsional) Sebaiknya harga dihitung di backend agar aman
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Kirim token biar backend tahu siapa yang order
                        'Content-Type': 'application/json'
                    }
                }
            );

            const ticketCode = response.data.ticket.ticket_code;
            navigate(`/ticket/${ticketCode}`, { replace: true });

            // // Simpan data tiket dari response backend (misal tiket_code, dll)
            // setTicketData(response.data.ticket);
            // setStep(3); // Pindah ke halaman sukses

        } catch (err) {
            console.log(err.response?.data); 
            alert(err.response?.data?.message || "Terjadi kesalahan sistem.");
            setStep(1);
        }
    };

    // --- RENDER: LOADING & ERROR STATE ---
    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <Spinner animation="border" style={{ color: 'var(--color-primary)' }} />
            </div>
        );
    }

    if (error || !eventDetails) {
        return (
            <Container className="py-5 text-center">
                <Alert variant="danger">{error}</Alert>
                <Button onClick={() => navigate(-1)}>Kembali</Button>
            </Container>
        );
    }

    // --- RENDER: STEP 3 (TIKET DIGITAL) ---
    // if (step === 3) {
    //     return (
    //         <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', padding: '50px 0' }}>
    //             <Container className="d-flex flex-column align-items-center">
    //                 <CheckCircle size={64} className="mb-3 text-success" />
    //                 <h2 className="fw-bold mb-2">Pembayaran Berhasil!</h2>
    //                 <p className="text-muted mb-5 text-center">Terima kasih, tiket Anda telah dikirim ke {formData.email}</p>

    //                 {/* TIKET DIGITAL CARD */}
    //                 <Card className="border-0 shadow-lg w-100" style={{ maxWidth: '800px', borderRadius: '16px', overflow: 'hidden' }}>
    //                     <Row className="g-0">
    //                         <Col md={8} className="p-4 p-md-5 bg-white">
    //                             <span className="badge bg-success mb-2 px-3 py-2 rounded-pill">E-TICKET AKTIF</span>
    //                             <h3 className="fw-bold">{eventDetails.title}</h3>
                                
    //                             <div className="d-flex flex-column gap-3 my-4 text-muted">
    //                                 <div className="d-flex align-items-center gap-3">
    //                                     <Calendar size={20} className="text-primary" />
    //                                     <div>
    //                                         <div className="fw-medium text-dark">{eventDetails.start_date || eventDetails.date}</div>
    //                                     </div>
    //                                 </div>
    //                                 <div className="d-flex align-items-center gap-3">
    //                                     <MapPin size={20} className="text-primary" />
    //                                     <div>
    //                                         <div className="fw-medium text-dark">{eventDetails.location}</div>
    //                                     </div>
    //                                 </div>
    //                             </div>

    //                             <hr className="mb-4" />

    //                             <Row className="g-3">
    //                                 <Col xs={6}>
    //                                     <div className="text-muted mb-1" style={{ fontSize: '12px' }}>Nama Peserta</div>
    //                                     <div className="fw-bold text-dark">{formData.name}</div>
    //                                 </Col>
    //                                 <Col xs={6}>
    //                                     <div className="text-muted mb-1" style={{ fontSize: '12px' }}>Kode Tiket</div>
    //                                     {/* Ambil kode tiket dari response backend */}
    //                                     <div className="fw-bold text-dark">{ticketData?.ticket_code || '#EVT-PENDING'}</div>
    //                                 </Col>
    //                             </Row>
    //                         </Col>

    //                         <Col md={4} className="p-4 d-flex flex-column align-items-center justify-content-center text-center bg-light border-start border-2 border-dashed">
    //                             <div className="bg-white p-3 rounded-4 shadow-sm mb-3">
    //                                 <QrCode size={120} />
    //                             </div>
    //                             <p className="text-muted mb-0" style={{ fontSize: '12px' }}>Tunjukkan QR Code ini pada saat registrasi ulang.</p>
    //                         </Col>
    //                     </Row>
    //                 </Card>

    //                 <div className="mt-5 d-flex gap-3">
    //                     <Link to="/" className="text-decoration-none">
    //                         <Button variant="primary" className="fw-medium py-2 px-4 rounded-pill">
    //                             Kembali ke Beranda
    //                         </Button>
    //                     </Link>
    //                 </div>
    //             </Container>
    //         </div>
    //     );
    // }

    // Perhitungan harga (Asumsi admin fee statis)
    const eventPrice = parseFloat(eventDetails.price) || 0;
    const adminFee = eventPrice > 0 ? 5000 : 0;
    const totalPayment = eventPrice + adminFee;

    // --- RENDER: STEP 1 & 2 (CHECKOUT FORM) ---
    return (
        <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '50px' }}>
            {/* ... (Header Checkout tetap sama seperti kode kamu) ... */}
            
            <Container className="mt-4">
                <Form onSubmit={handleCheckout}>
                    <Row className="g-4">
                        {/* KOLOM KIRI: FORM DATA DIRI */}
                        <Col lg={8}>
                            <Card className="border-0 shadow-sm p-4 mb-4 rounded-3">
                                <h5 className="fw-bold mb-4">Informasi Pemesan</h5>
                                
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-medium text-muted">Nama Lengkap</Form.Label>
                                    <div className="position-relative">
                                        <User size={18} className="position-absolute text-muted" style={{ top: '12px', left: '14px' }} />
                                        <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ paddingLeft: '40px' }} disabled={step === 2} />
                                    </div>
                                </Form.Group>

                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-medium text-muted">Email</Form.Label>
                                            <div className="position-relative">
                                                <Mail size={18} className="position-absolute text-muted" style={{ top: '12px', left: '14px' }} />
                                                <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} required style={{ paddingLeft: '40px' }} disabled={step === 2} />
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
                            <Card className="border-0 shadow-sm p-4 sticky-top rounded-3" style={{ top: '90px' }}>
                                <h5 className="fw-bold mb-4">Ringkasan Pesanan</h5>
                                
                                <div className="mb-4">
                                    <h6 className="fw-bold mb-1">{eventDetails.title}</h6>
                                    <p className="text-muted mb-0" style={{ fontSize: '14px' }}>{eventDetails.location}</p>
                                </div>

                                <hr className="text-muted" />

                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">1x Tiket</span>
                                    <span className="fw-medium">Rp {eventPrice.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-3">
                                    <span className="text-muted">Biaya Admin</span>
                                    <span className="fw-medium">Rp {adminFee.toLocaleString('id-ID')}</span>
                                </div>

                                <hr className="text-muted" />

                                <div className="d-flex justify-content-between mb-4 align-items-center">
                                    <span className="fw-bold fs-5">Total</span>
                                    <span className="fw-bold fs-5 text-primary">
                                        {totalPayment === 0 ? 'GRATIS' : `Rp ${totalPayment.toLocaleString('id-ID')}`}
                                    </span>
                                </div>

                                <Button type="submit" disabled={step === 2} className="w-100 fw-bold py-3">
                                    {step === 2 ? <><Spinner as="span" animation="border" size="sm" className="me-2" /> Memproses...</> : 'Konfirmasi Pesanan'}
                                </Button>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </Container>
        </div>
    );
};

export default Checkout;