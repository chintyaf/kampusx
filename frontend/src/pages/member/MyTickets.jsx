import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Button, Alert } from 'react-bootstrap';
import { Calendar, MapPin, QrCode, ArrowRight, Ticket, History, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

import api from '../../api/axios'; 

const TicketCard = ({ ticket, isActive }) => {
    const event = ticket.order_item?.order?.event;
    if (!event) return null;

    return (
        <Card className="shadow-sm border-0 rounded-3 mb-4">
            <Card.Header className="bg-light border-bottom-0 py-2 text-muted d-flex justify-content-between" style={{ fontSize: "14px" }}>
                <span>Booking ID / Kode Tiket</span>
                <span className="fw-medium text-dark">{ticket.ticket_code}</span>
            </Card.Header>

            <Card.Body className="py-3">
                <Card.Title className="fs-5 fw-semibold mb-2" style={{ color: "var(--color-primary, #1A365D)" }}>
                    {event.title}
                </Card.Title>
                <div className="d-flex gap-4 text-muted mt-3" style={{ fontSize: '14px' }}>
                    <div className="d-flex align-items-center gap-2">
                        <Calendar size={16} className="text-primary" />
                        <span>{event.start_date || 'TBA'}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <MapPin size={16} className="text-primary" />
                        <span>{event.location}</span>
                    </div>
                </div>
            </Card.Body>

            <Card.Footer className="bg-white py-3 border-top-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <Badge
                    bg={isActive ? "success-subtle" : "secondary"}
                    text={isActive ? "success" : "light"}
                    className={`px-3 py-2 rounded-pill fw-medium ${isActive ? "border border-success border-opacity-25" : ""}`}
                >
                    {isActive ? "Purchase Successful" : ticket.status.toUpperCase()}
                </Badge>

                <div className="d-flex align-items-center gap-2">
                    {isActive ? (
                        <>
                            <Link to={`/ticket/${ticket.ticket_code}`}>
                                <Button variant="outline-dark" className="rounded-circle p-2 d-flex align-items-center justify-content-center border-0 bg-light" title="Tampilkan QR">
                                    <QrCode size={20} />
                                </Button>
                            </Link>
                            <Link to={`/event-space/${event.id}`}>
                                <Button variant="primary" className="rounded-pill px-4 py-2 fw-medium d-flex align-items-center" style={{ fontSize: "14px" }}>
                                    Masuk Dashboard Event <ArrowRight size={16} className="ms-2" />
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <Link to={`/ticket/${ticket.ticket_code}`} className="text-decoration-none text-muted d-flex align-items-center gap-2 hover-primary">
                            <span style={{ fontSize: "14px", fontWeight: "500" }}>Lihat Detail Tiket</span>
                            <MoreHorizontal size={18} />
                        </Link>
                    )}
                </div>
            </Card.Footer>
        </Card>
    );
};

const MyTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("aktif");

    useEffect(() => {
        const fetchMyTickets = async () => {
            try {
                const response = await api.get('my-tickets');
                
                const result = response.data;
                
                if (result.status === "success" || result.data) {
                    setTickets(result.data || result);
                } else {
                     setTickets(result);
                }

            } catch (error) {
                console.error("Gagal mengambil tiket:", error);
                setError("Gagal memuat tiket Anda. Silakan coba beberapa saat lagi.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchMyTickets();
    }, []); 

    if (isLoading) {
        return (
            <div className="text-center py-5 mt-5">
                <Spinner animation="border" variant="primary" />
                <p className="text-muted mt-3">Memuat tiket Anda...</p>
            </div>
        );
    }

    const activeTickets = tickets.filter(t => t.status === 'active');
    const historyTickets = tickets.filter(t => t.status === 'used' || t.status === 'cancelled');

    return (
        <div>
            <Container className="py-5" style={{ maxWidth: '900px' }}>
                <h2 className="fw-bold mb-4" style={{ color: "var(--color-primary, #1A365D)" }}>
                    Tiket Saya
                </h2>

                {error && <Alert variant="danger">{error}</Alert>}

                <div className="d-flex gap-4 border-bottom mb-4 pb-2">
                    <button
                        className={`btn btn-link text-decoration-none p-0 pb-2 fw-semibold ${
                            activeTab === "aktif"
                                ? "text-primary border-bottom border-primary border-3 rounded-0"
                                : "text-muted"
                        }`}
                        onClick={() => setActiveTab("aktif")}
                        style={{ fontSize: "16px" }}
                    >
                        <Ticket size={18} className="me-2 mb-1" />
                        E-tiket Aktif ({activeTickets.length})
                    </button>
                    <button
                        className={`btn btn-link text-decoration-none p-0 pb-2 fw-semibold ${
                            activeTab === "riwayat"
                                ? "text-primary border-bottom border-primary border-3 rounded-0"
                                : "text-muted"
                        }`}
                        onClick={() => setActiveTab("riwayat")}
                        style={{ fontSize: "16px" }}
                    >
                        <History size={18} className="me-2 mb-1" />
                        Riwayat Pembelian
                    </button>
                </div>

                <Row>
                    <Col>
                        {!error && activeTab === "aktif" && (
                            <div className="d-flex flex-column">
                                {activeTickets.length === 0 ? (
                                    <div className="text-center py-5 text-muted">
                                        <Ticket size={48} className="mb-3 opacity-50" />
                                        <h5>Belum ada tiket aktif.</h5>
                                        <p>Yuk eksplor dan cari event menarik!</p>
                                        <Link to="/explore-events">
                                            <Button variant="outline-primary" className="rounded-pill mt-2">Cari Event</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    activeTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} isActive={true} />)
                                )}
                            </div>
                        )}

                        {!error && activeTab === "riwayat" && (
                            <div className="d-flex flex-column">
                                {historyTickets.length === 0 ? (
                                    <div className="text-center py-5 text-muted">
                                        <History size={48} className="mb-3 opacity-50" />
                                        <h5>Belum ada riwayat tiket.</h5>
                                    </div>
                                ) : (
                                    historyTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} isActive={false} />)
                                )}
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default MyTickets;