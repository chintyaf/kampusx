import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Button, Tabs, Tab } from 'react-bootstrap';
import { Calendar, MapPin, QrCode, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const MyTickets = () => {
    const { token } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMyTickets = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/my-tickets', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTickets(response.data.data);
                setIsLoading(false);
            } catch (error) {
                console.error("Gagal mengambil tiket:", error);
                setIsLoading(false);
            }
        };
        fetchMyTickets();
    }, [token]);

    if (isLoading) {
        return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
    }

    // Pisahkan tiket aktif dan riwayat (berdasarkan status di database)
    const activeTickets = tickets.filter(t => t.status === 'active');
    const historyTickets = tickets.filter(t => t.status === 'used' || t.status === 'cancelled');

    // Komponen untuk me-render Card Tiket biar kodenya nggak berulang
    const TicketCard = ({ ticket, isActive }) => {
        const event = ticket.order_item?.order?.event;
        if (!event) return null;

        return (
            <Card className="border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
                <Row className="g-0">
                    <Col md={3} className="bg-light d-none d-md-flex align-items-center justify-content-center border-end">
                        {/* Placeholder gambar event. Kalau kamu punya image event, pasang di sini */}
                        <div className="text-muted fw-bold">EVENT IMAGE</div>
                    </Col>
                    <Col md={9}>
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <Badge bg={isActive ? "success" : "secondary"} className="mb-2 px-3 py-2 rounded-pill">
                                        {isActive ? "AKTIF" : ticket.status.toUpperCase()}
                                    </Badge>
                                    <h4 className="fw-bold mb-1">{event.title}</h4>
                                    <div className="text-muted" style={{ fontSize: '14px' }}>Kode: {ticket.ticket_code}</div>
                                </div>
                                
                                {/* Tombol cepat lihat QR (Hanya jika aktif) */}
                                {isActive && (
                                    <Link to={`/ticket/${ticket.ticket_code}`}>
                                        <Button variant="outline-dark" className="rounded-circle p-2 d-flex align-items-center justify-content-center" title="Tampilkan QR">
                                            <QrCode size={20} />
                                        </Button>
                                    </Link>
                                )}
                            </div>

                            <div className="d-flex gap-4 mt-3 text-muted" style={{ fontSize: '15px' }}>
                                <div className="d-flex align-items-center gap-2">
                                    <Calendar size={18} className="text-primary" />
                                    <span>{event.start_date || 'TBA'}</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <MapPin size={18} className="text-primary" />
                                    <span>{event.location}</span>
                                </div>
                            </div>

                            <hr className="my-3" />

                            <div className="d-flex justify-content-end">
                                {isActive ? (
                                    // Tombol masuk ke Micro LMS
                                    <Link to={`/event-space/${event.id}`}>
                                        <Button variant="primary" className="rounded-pill px-4 fw-medium d-flex align-items-center">
                                            Masuk Dashboard Event <ArrowRight size={18} className="ms-2" />
                                        </Button>
                                    </Link>
                                ) : (
                                    <Link to={`/ticket/${ticket.ticket_code}`}>
                                        <Button variant="outline-secondary" className="rounded-pill px-4">Lihat Detail Tiket</Button>
                                    </Link>
                                )}
                            </div>
                        </Card.Body>
                    </Col>
                </Row>
            </Card>
        );
    };

    return (
        <Container className="py-5" style={{ maxWidth: '900px' }}>
            <h2 className="fw-bold mb-4">Tiket Saya</h2>

            <Tabs defaultActiveKey="aktif" className="mb-4 custom-tabs">
                <Tab eventKey="aktif" title={`Tiket Aktif (${activeTickets.length})`}>
                    {activeTickets.length === 0 ? (
                        <div className="text-center py-5 text-muted">Belum ada tiket aktif. Yuk cari event!</div>
                    ) : (
                        activeTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} isActive={true} />)
                    )}
                </Tab>
                <Tab eventKey="riwayat" title="Riwayat Tiket">
                    {historyTickets.length === 0 ? (
                        <div className="text-center py-5 text-muted">Belum ada riwayat tiket.</div>
                    ) : (
                        historyTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} isActive={false} />)
                    )}
                </Tab>
            </Tabs>
        </Container>
    );
};

export default MyTickets;