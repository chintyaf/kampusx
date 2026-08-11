import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Button, Alert } from 'react-bootstrap';
import { 
    Bell, 
    CheckCheck, 
    Check,
    CheckCircle2, 
    AlertTriangle, 
    Info, 
    AlertCircle, 
    ChevronRight,
    Inbox,
    Trash2,
    Sparkles,
    Clock,
    XCircle,
    Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';

const NotificationsPage = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterTab, setFilterTab] = useState("all"); // all, unread, read

    const fetchNotifications = async () => {
        try {
            const response = await api.get("notifications");
            if (response.data && response.data.success) {
                setNotifications(response.data.data);
                setUnreadCount(response.data.unread_count);
            } else {
                setError("Gagal memuat notifikasi.");
            }
        } catch (err) {
            console.error("Gagal mengambil notifikasi:", err);
            setError("Terjadi kesalahan koneksi saat memuat notifikasi.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (e, id, eventId, type, eventSlug = null) => {
        // Mencegah trigger click parent jika user klik tombol centang kecil saja
        if (e) e.stopPropagation();

        try {
            await api.post(`notifications/${id}/read`);
            
            // Perbarui state secara lokal
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));

            // Jika dipanggil dari click card utama (e == null), lakukan pengalihan/redireksi
            if (!e) {
                if (type === 'organizer_approved') {
                    navigate('/organizer/dashboard');
                } else if (type === 'organizer_rejected') {
                    navigate('/apply-organizer', { state: { autoResubmit: true } });
                } else if (type === 'event_recommendation') {
                    navigate(`/event/${eventSlug || eventId}`);
                } else if (eventId) {
                    const isOrganizerPath = window.location.pathname.startsWith('/organizer');
                    if (isOrganizerPath) {
                        navigate(`/organizer/${eventId}/event-dashboard`);
                    } else {
                        navigate(`/event-space/${eventId}`);
                    }
                }
            }
        } catch (err) {
            console.error("Gagal menandai dibaca:", err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.post("notifications/read-all");
            setNotifications(prev => 
                prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch (err) {
            console.error("Gagal menandai semua dibaca:", err);
        }
    };

    const timeAgo = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return "Baru saja";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} menit yang lalu`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} jam yang lalu`;
        const days = Math.floor(hours / 24);
        if (days === 1) return "Kemarin";
        return `${days} hari yang lalu`;
    };

    const getNotificationStyle = (type) => {
        switch (type) {
            case "H-24":
                return {
                    icon: <Info size={20} className="text-primary" />,
                    bg: "bg-primary-subtle",
                    iconColor: "var(--color-primary, #00699e)"
                };
            case "H-1":
                return {
                    icon: <AlertTriangle size={20} className="text-warning" />,
                    bg: "bg-warning-subtle",
                    iconColor: "var(--warning-text, #a16207)"
                };
            case "M-15":
                return {
                    icon: <AlertCircle size={20} className="text-danger" />,
                    bg: "bg-danger-subtle",
                    iconColor: "var(--error-text, #dc2626)"
                };
            case "organizer_approved":
                return {
                    icon: <CheckCircle2 size={20} className="text-success" />,
                    bg: "bg-success-subtle",
                    iconColor: "var(--success-text, #166534)"
                };
            case "event_updated":
                return {
                    icon: <Info size={20} className="text-info" />,
                    bg: "bg-info-subtle",
                    iconColor: "#0ea5e9"
                };
            case "organizer_rejected":
            case "account_suspended":
                return {
                    icon: <AlertTriangle size={20} className="text-warning" />,
                    bg: "bg-warning-subtle",
                    iconColor: "var(--warning-text, #a16207)"
                };
            case "account_banned":
                return {
                    icon: <AlertCircle size={20} className="text-danger" />,
                    bg: "bg-danger-subtle",
                    iconColor: "var(--error-text, #dc2626)"
                };
            case "event_recommendation":
                return {
                    icon: <Sparkles size={20} className="text-warning" />,
                    bg: "bg-warning-subtle",
                    iconColor: "var(--warning-text, #a16207)"
                };
            case "payment_success":
                return {
                    icon: <CheckCircle2 size={20} className="text-success" />,
                    bg: "bg-success-subtle",
                    iconColor: "var(--success-text, #166534)"
                };
            case "payment_pending":
                return {
                    icon: <Clock size={20} className="text-warning" />,
                    bg: "bg-warning-subtle",
                    iconColor: "var(--warning-text, #a16207)"
                };
            case "payment_failed":
                return {
                    icon: <XCircle size={20} className="text-danger" />,
                    bg: "bg-danger-subtle",
                    iconColor: "var(--error-text, #dc2626)"
                };
            case "certificate_available":
                return {
                    icon: <Award size={20} className="text-primary" />,
                    bg: "bg-primary-subtle",
                    iconColor: "var(--color-primary, #00699e)"
                };
            default:
                return {
                    icon: <Info size={20} className="text-secondary" />,
                    bg: "bg-light",
                    iconColor: "#64748b"
                };
        }
    };

    // Filter Notifikasi berdasarkan tab terpilih
    const filteredNotifications = notifications.filter(notif => {
        if (filterTab === "unread") return !notif.read_at;
        if (filterTab === "read") return !!notif.read_at;
        return true;
    });

    if (isLoading) {
        return (
            <div className="text-center py-5 mt-5">
                <Spinner animation="border" variant="primary" />
                <p className="text-muted mt-3" style={{ fontSize: '15px' }}>Memuat seluruh notifikasi Anda...</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: 'calc(100vh - 65px)', backgroundColor: '#F8FAFC' }}>
            <Container className="py-5" style={{ maxWidth: '850px' }}>
                
                {/* Header */}
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <h2 className="fw-bold m-0" style={{ color: "var(--color-primary, #00699e)", letterSpacing: '-0.5px' }}>
                                Pusat Notifikasi
                            </h2>
                            {unreadCount > 0 && (
                                <Badge bg="danger" className="rounded-pill px-2.5 py-1 fw-bold fs-xs align-middle">
                                    {unreadCount} Baru
                                </Badge>
                            )}
                        </div>
                        <p className="text-muted m-0" style={{ fontSize: '14px' }}>
                            Kelola seluruh informasi acara, akun, dan status pengajuan Anda.
                        </p>
                    </div>

                    {unreadCount > 0 && (
                        <Button 
                            variant="outline-primary" 
                            className="rounded-pill px-4 py-2 d-inline-flex align-items-center gap-2 fw-semibold"
                            style={{ fontSize: "14px", transition: 'all 0.2s' }}
                            onClick={handleMarkAllAsRead}
                        >
                            <CheckCheck size={16} />
                            Tandai Semua Dibaca
                        </Button>
                    )}
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                {/* Filter Tabs */}
                <div className="d-flex gap-4 border-bottom mb-4 pb-2" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                    <button
                        className={`btn btn-link text-decoration-none p-0 pb-2 fw-semibold position-relative ${
                            filterTab === "all"
                                ? "text-primary border-bottom border-primary border-3 rounded-0"
                                : "text-muted"
                        }`}
                        onClick={() => setFilterTab("all")}
                        style={{ fontSize: "15px" }}
                    >
                        Semua ({notifications.length})
                    </button>
                    <button
                        className={`btn btn-link text-decoration-none p-0 pb-2 fw-semibold position-relative ${
                            filterTab === "unread"
                                ? "text-primary border-bottom border-primary border-3 rounded-0"
                                : "text-muted"
                        }`}
                        onClick={() => setFilterTab("unread")}
                        style={{ fontSize: "15px" }}
                    >
                        Belum Dibaca ({notifications.filter(n => !n.read_at).length})
                    </button>
                    <button
                        className={`btn btn-link text-decoration-none p-0 pb-2 fw-semibold position-relative ${
                            filterTab === "read"
                                ? "text-primary border-bottom border-primary border-3 rounded-0"
                                : "text-muted"
                        }`}
                        onClick={() => setFilterTab("read")}
                        style={{ fontSize: "15px" }}
                    >
                        Sudah Dibaca ({notifications.filter(n => !!n.read_at).length})
                    </button>
                </div>

                {/* List Notifikasi */}
                <Row>
                    <Col>
                        {filteredNotifications.length === 0 ? (
                            <Card className="text-center py-5 border-0 rounded-4 shadow-sm bg-white">
                                <Card.Body className="d-flex flex-column align-items-center">
                                    <div className="p-4 rounded-circle bg-light mb-3 text-muted">
                                        <Inbox size={48} className="opacity-50" />
                                    </div>
                                    <h5 className="fw-bold mb-1" style={{ color: "#334155" }}>Kotak Masuk Kosong</h5>
                                    <p className="text-muted mb-0" style={{ fontSize: '14px', maxWidth: '360px' }}>
                                        {filterTab === "unread" 
                                            ? "Hebat! Anda telah membaca semua notifikasi." 
                                            : filterTab === "read"
                                            ? "Belum ada riwayat notifikasi yang dibaca."
                                            : "Belum ada notifikasi masuk saat ini."}
                                    </p>
                                </Card.Body>
                            </Card>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {filteredNotifications.map((notif) => {
                                    const data = typeof notif.data === "string" ? JSON.parse(notif.data) : (notif.data || {});
                                    const isUnread = !notif.read_at;
                                    const { icon, bg, iconColor } = getNotificationStyle(data.type);

                                    return (
                                        <Card 
                                            key={notif.id}
                                            onClick={() => markAsRead(null, notif.id, data.event_id, data.type, data.event_slug)}
                                            className="border-0 rounded-4 shadow-sm overflow-hidden"
                                            style={{
                                                cursor: "pointer",
                                                backgroundColor: isUnread ? "#FCFEFF" : "#FFFFFF",
                                                borderLeft: isUnread ? "4px solid var(--color-primary, #00699e)" : "4px solid transparent",
                                                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                                transform: "translateY(0)"
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = "translateY(-2px)";
                                                e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = "translateY(0)";
                                                e.currentTarget.style.boxShadow = "none";
                                            }}
                                        >
                                            <Card.Body className="p-4 d-flex align-items-start gap-3">
                                                {/* Icon Wrapper */}
                                                <div 
                                                    className={`rounded-3 d-flex align-items-center justify-content-center p-2.5 flex-shrink-0 ${bg}`}
                                                    style={{ 
                                                        width: "44px", 
                                                        height: "44px", 
                                                        color: iconColor,
                                                        backgroundColor: isUnread ? "" : "#F1F5F9"
                                                    }}
                                                >
                                                    {icon}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                                    <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                                                        <h5 
                                                            className="m-0 fw-bold text-truncate"
                                                            style={{ 
                                                                fontSize: "15px", 
                                                                color: isUnread ? "#0F172A" : "#64748B",
                                                                lineHeight: '1.4'
                                                            }}
                                                        >
                                                            {data.title || "Pengingat Acara"}
                                                        </h5>
                                                        <span className="text-muted flex-shrink-0" style={{ fontSize: "11px", fontWeight: "500" }}>
                                                            {timeAgo(notif.created_at)}
                                                        </span>
                                                    </div>

                                                    <p 
                                                        className="m-0 text-secondary mb-2"
                                                        style={{ 
                                                            fontSize: "13px", 
                                                            lineHeight: "1.5",
                                                            fontWeight: isUnread ? "500" : "normal",
                                                            color: isUnread ? "#334155" : "#64748B"
                                                        }}
                                                    >
                                                        {data.message}
                                                    </p>

                                                    <div className="d-flex align-items-center gap-2">
                                                        <Badge 
                                                            bg="light" 
                                                            text="dark" 
                                                            className="border text-capitalize px-2 py-1"
                                                            style={{ fontSize: '10px', color: '#475569' }}
                                                        >
                                                            {data.type?.replace("_", " ")}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="d-flex flex-column align-items-end justify-content-between h-100 flex-shrink-0">
                                                    {isUnread ? (
                                                        <Button 
                                                            variant="light"
                                                            className="rounded-circle p-1.5 border d-flex align-items-center justify-content-center hover-bg-success text-success"
                                                            style={{ width: "28px", height: "28px", backgroundColor: '#FFFFFF' }}
                                                            onClick={(e) => markAsRead(e, notif.id, data.event_id, data.type, data.event_slug)}
                                                            title="Tandai telah dibaca"
                                                        >
                                                            <Check size={14} strokeWidth={3} />
                                                        </Button>
                                                    ) : (
                                                        <span className="text-success p-1 d-flex align-items-center justify-content-center">
                                                            <CheckCheck size={16} strokeWidth={2} />
                                                        </span>
                                                    )}
                                                    
                                                    {(data.event_id || data.type === 'organizer_approved' || data.type === 'organizer_rejected') && (
                                                        <ChevronRight size={16} className="text-muted mt-2" />
                                                    )}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default NotificationsPage;
