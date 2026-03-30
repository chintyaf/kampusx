import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Spinner, Button } from 'react-bootstrap';
import { CheckCircle, Calendar, MapPin, Download } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'react-qr-code'; // <-- Pakai library yang baru diinstall
import { useAuth } from '../context/AuthContext';

const TicketDetail = () => {
    const { ticketCode } = useParams(); // Ambil kode tiket dari URL
    const { token } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                // Ambil data tiket dari backend
                const response = await axios.get(`http://localhost:8000/api/tickets/${ticketCode}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTicket(response.data.data);
                setIsLoading(false);
            } catch (err) {
                console.error(err);
                alert("Gagal memuat tiket.");
                setIsLoading(false);
            }
        };
        fetchTicket();
    }, [ticketCode, token]);

    if (isLoading) {
        return <div className="text-center py-5"><Spinner animation="border" /></div>;
    }

    if (!ticket) {
        return <div className="text-center py-5">Tiket tidak ditemukan.</div>;
    }

    // Ambil detail event dari relasi yang dikirim backend
    const event = ticket.order_item.order.event;

    return (
        <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', padding: '50px 0' }}>
            <Container className="d-flex flex-column align-items-center">
                <CheckCircle size={64} className="mb-3 text-success" />
                <h2 className="fw-bold mb-2">Pemesanan Berhasil!</h2>
                {/* <p className="text-muted mb-5 text-center">Tiket digital ini juga telah dikirim ke email kamu.</p> */}

                <Card className="border-0 shadow-lg w-100" style={{ maxWidth: '800px', borderRadius: '16px', overflow: 'hidden' }}>
                    <Row className="g-0">
                        {/* BAGIAN KIRI: INFO EVENT */}
                        <Col md={8} className="p-4 p-md-5 bg-white">
                            <span className="badge bg-success mb-2 px-3 py-2 rounded-pill">E-TICKET AKTIF</span>
                            <h3 className="fw-bold">{event.title}</h3>
                            
                            <div className="d-flex flex-column gap-3 my-4 text-muted">
                                <div className="d-flex align-items-center gap-3">
                                    <Calendar size={20} className="text-primary" />
                                    <div className="fw-medium text-dark">{event.start_date || 'Tanggal Event'}</div>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <MapPin size={20} className="text-primary" />
                                    <div className="fw-medium text-dark">{event.location}</div>
                                </div>
                            </div>

                            <hr className="mb-4" />

                            <Row className="g-3">
                                <Col xs={6}>
                                    <div className="text-muted mb-1" style={{ fontSize: '12px' }}>Nama Peserta</div>
                                    <div className="fw-bold text-dark">{ticket.attendee_name}</div>
                                </Col>
                                <Col xs={6}>
                                    <div className="text-muted mb-1" style={{ fontSize: '12px' }}>Kode Tiket</div>
                                    <div className="fw-bold text-dark">{ticket.ticket_code}</div>
                                </Col>
                            </Row>
                        </Col>

                        {/* BAGIAN KANAN: QR CODE ASLI */}
                        <Col md={4} className="p-4 d-flex flex-column align-items-center justify-content-center text-center bg-light border-start border-2 border-dashed">
                            <div className="bg-white p-3 rounded-4 shadow-sm mb-3">
                                {/* Generate QR Code dari qr_token milik tiket */}
                                <QRCode value={ticket.qr_token} size={150} />
                            </div>
                            <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
                                Tunjukkan QR Code ini kepada panitia saat registrasi di lokasi.
                            </p>
                        </Col>
                    </Row>
                </Card>

                <div className="mt-5 d-flex gap-3">
                    <Button variant="outline-primary" className="fw-medium py-2 px-4 rounded-pill">
                        <Download size={18} className="me-2" /> Unduh PDF
                    </Button>
                    <Link to="/explore-events">
                        <Button variant="primary" className="fw-medium py-2 px-4 rounded-pill">
                            Cari Event Lain
                        </Button>
                    </Link>
                </div>
            </Container>
        </div>
    );
};

export default TicketDetail;