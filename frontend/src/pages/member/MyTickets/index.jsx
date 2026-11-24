import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Button, Alert } from 'react-bootstrap';
import { Calendar, MapPin, QrCode, ArrowRight, Ticket, History, MoreHorizontal, Award, Clock, Users, Sparkles, XCircle, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import api from '@/api/axios'; 
import { formatDate } from '@/utils/dateUtils';

const TicketCard = ({ ticket, isActive }) => {
    const event = ticket.order_item?.order?.event;
    if (!event) return null;

    const locationDetail = event.location_detail || event.locationDetail;
    const locationText = locationDetail
        ? locationDetail.type === 'online'
            ? `Online (${locationDetail.platform || 'Platform'})`
            : locationDetail.location_name || locationDetail.city || 'Offline Venue'
        : 'TBA';

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
                <div className="d-flex flex-wrap gap-3 gap-md-4 text-muted mt-3" style={{ fontSize: '14px' }}>
                    <div className="d-flex align-items-center gap-2">
                        <Calendar size={16} className="text-primary" />
                        <span>{event.start_date ? formatDate(event.start_date) : 'TBA'}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <MapPin size={16} className="text-primary" />
                        <span>{locationText}</span>
                    </div>
                    {ticket.local_points !== undefined && ticket.local_points > 0 && (
                        <div className="d-flex align-items-center gap-1.5 px-2.5 py-1 rounded shadow-sm" style={{ fontSize: '13px', backgroundColor: '#f0fdfa', border: '1px solid rgba(13,148,136,0.15)' }}>
                            <Award size={14} style={{ color: '#0d9488' }} />
                            <span className="fw-semibold" style={{ color: '#0f766e' }}>{ticket.local_points} Poin Lokal</span>
                        </div>
                    )}
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
                            <Link to={`/event-space/${event.slug || event.id}`}>
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
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [waitlists, setWaitlists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("aktif");
    const [actionLoadingId, setActionLoadingId] = useState(null);

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
        }
    };

    const fetchMyWaitlists = async () => {
        try {
            const response = await api.get('/my-waitlists');
            if (response.data?.success && response.data?.data) {
                setWaitlists(response.data.data);
            }
        } catch (error) {
            console.warn("Gagal mengambil data waiting list:", error);
        }
    };

    useEffect(() => {
        const loadAll = async () => {
            setIsLoading(true);
            await Promise.all([fetchMyTickets(), fetchMyWaitlists()]);
            setIsLoading(false);
        };
        loadAll();
    }, []);

    // Action: Klaim penawaran dari halaman MyTickets
    const handleClaimOffer = async (offerToken) => {
        setActionLoadingId(offerToken);
        try {
            const res = await api.post(`/waitlist/offer/${offerToken}/accept`);
            if (res.data?.success && res.data?.data) {
                navigate(res.data.data.checkout_url);
            }
        } catch (err) {
            alert(err?.response?.data?.message || 'Batas waktu klaim penawaran telah habis.');
            fetchMyWaitlists();
        } finally {
            setActionLoadingId(null);
        }
    };

    // Action: Batalkan antrean dari MyTickets
    const handleCancelWaitlist = async (eventId) => {
        if (!window.confirm('Yakin ingin keluar dari antrean ini?')) return;
        try {
            await api.post(`/events/${eventId}/waitlist/cancel`);
            fetchMyWaitlists();
        } catch (err) {
            alert(err?.response?.data?.message || 'Gagal membatalkan antrean.');
        }
    }; 

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
                            activeTab === "waiting_list"
                                ? "text-primary border-bottom border-primary border-3 rounded-0"
                                : "text-muted"
                        }`}
                        onClick={() => setActiveTab("waiting_list")}
                        style={{ fontSize: "16px" }}
                    >
                        <Clock size={18} className="me-2 mb-1" />
                        Waiting List ({waitlists.filter(w => w.status === 'WAITING' || w.status === 'OFFERED').length})
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

                        {!error && activeTab === "waiting_list" && (
                            <div className="d-flex flex-column gap-3">
                                {waitlists.length === 0 ? (
                                    <div className="text-center py-5 text-muted">
                                        <Clock size={48} className="mb-3 opacity-50" />
                                        <h5>Belum ada antrean waiting list.</h5>
                                        <p>Ketika tiket event penuh, Anda dapat mengantre untuk mendapatkan penawaran eksklusif.</p>
                                        <Link to="/explore-events">
                                            <Button variant="outline-primary" className="rounded-pill mt-2">Eksplor Event</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    waitlists.map((item) => (
                                        <Card key={item.id} className={`shadow-sm border-0 rounded-4 overflow-hidden mb-3 ${item.status === 'OFFERED' ? 'border border-2 border-warning bg-warning bg-opacity-10' : ''}`}>
                                            <Card.Header className="bg-light border-bottom-0 py-2.5 text-muted d-flex justify-content-between align-items-center" style={{ fontSize: "13px" }}>
                                                <span className="d-flex align-items-center gap-1.5 font-monospace">
                                                    <Users size={14} className="text-primary" /> No. Antrean #{item.queue_number}
                                                </span>
                                                <Badge
                                                    bg={
                                                        item.status === 'OFFERED' ? 'warning' :
                                                        item.status === 'WAITING' ? 'primary' :
                                                        item.status === 'CLAIMED' ? 'success' :
                                                        item.status === 'EXPIRED' ? 'secondary' : 'danger'
                                                    }
                                                    text={item.status === 'OFFERED' ? 'dark' : 'white'}
                                                    className="px-3 py-1.5 rounded-pill fw-semibold"
                                                >
                                                    {item.status === 'OFFERED' ? 'TIKET TERSEDIA (OFFER)' :
                                                     item.status === 'WAITING' ? `POSISI #${item.position}` : item.status}
                                                </Badge>
                                            </Card.Header>
                                            <Card.Body className="py-3">
                                                <h5 className="fw-bold mb-1 text-dark">
                                                    {item.event_title}
                                                </h5>
                                                <div className="text-muted small d-flex flex-wrap gap-3 mt-2">
                                                    {item.ticket_name && <span>Tipe: <strong className="text-dark">{item.ticket_name}</strong></span>}
                                                    {item.seat_number && <span>Kursi: <strong className="text-primary">{item.seat_number}</strong></span>}
                                                    <span>Terdaftar: {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                </div>

                                                {item.status === 'OFFERED' && (
                                                    <div className="mt-3 p-3 bg-white rounded-3 border border-warning shadow-sm">
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <span className="small text-danger fw-bold d-flex align-items-center gap-1">
                                                                <Sparkles size={16} /> Penawaran Eksklusif Aktif (Batas 3 Menit)
                                                            </span>
                                                        </div>
                                                        <p className="small text-muted mb-3" style={{ fontSize: '13px' }}>
                                                            Klaim penawaran sekarang untuk mengamankan kursi Anda sebelum dialihkan ke peserta berikutnya!
                                                        </p>
                                                        <div className="d-flex gap-2">
                                                            <Button
                                                                variant="success"
                                                                className="rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2"
                                                                onClick={() => handleClaimOffer(item.offer_token)}
                                                                disabled={actionLoadingId === item.offer_token}
                                                                style={{ fontSize: '13.5px' }}
                                                            >
                                                                {actionLoadingId === item.offer_token ? <Spinner animation="border" size="sm" /> : <ShieldCheck size={16} />}
                                                                Klaim Kursi Sekarang
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </Card.Body>
                                            <Card.Footer className="bg-white py-2.5 border-top-0 d-flex justify-content-between align-items-center">
                                                <Link to={`/event/${item.event_slug || item.event_id}`} className="text-decoration-none small text-primary fw-medium d-flex align-items-center gap-1">
                                                    Lihat Detail Event <ArrowRight size={14} />
                                                </Link>
                                                {item.status === 'WAITING' && (
                                                    <Button
                                                        variant="link"
                                                        className="text-danger text-decoration-none p-0 small fw-medium"
                                                        onClick={() => handleCancelWaitlist(item.event_id)}
                                                    >
                                                        Keluar Antrean
                                                    </Button>
                                                )}
                                            </Card.Footer>
                                        </Card>
                                    ))
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