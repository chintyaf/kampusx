import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge, Alert, Tabs, Tab, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
    QrCode, Search, UserCheck, Users, RefreshCw, LogOut, MapPin,
    CheckCircle2, AlertCircle, Clock, Trash2
} from 'lucide-react';
import api from '../../api/axios';
import { Html5Qrcode } from 'html5-qrcode';

const StaffDashboard = () => {
    const navigate = useNavigate();

    // Auth States
    const [event, setEvent] = useState(null);
    const [station, setStation] = useState(null);
    const [pin, setPin] = useState('');

    // Attendance Stats
    const [stats, setStats] = useState({
        total_quota: 0,
        checked_in: 0,
        remaining: 0
    });

    // Scanner States
    const [qrInput, setQrInput] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanFeedback, setScanFeedback] = useState(null); // { type: 'success' | 'error', message: '', attendee: null }
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [scanLock, setScanLock] = useState(false);

    // Scanner Refs to prevent closure stale states
    const html5QrCodeRef = useRef(null);
    const scanLockRef = useRef(scanLock);
    const pinRef = useRef(pin);
    const stationRef = useRef(station);

    // Sync refs
    useEffect(() => { scanLockRef.current = scanLock; }, [scanLock]);
    useEffect(() => { pinRef.current = pin; }, [pin]);
    useEffect(() => { stationRef.current = station; }, [station]);

    // Responsive State
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 992);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Manual Override / Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [actionMessage, setActionMessage] = useState(null); // For manual check-in feedback

    // Logs State
    const [checkInLogs, setCheckInLogs] = useState([]);

    // Initialize LocalStorage Data
    useEffect(() => {
        const storedPin = localStorage.getItem('staff_pin');
        const storedEvent = localStorage.getItem('staff_event');
        const storedPos = localStorage.getItem('staff_selected_pos');

        if (!storedPin || !storedEvent || !storedPos) {
            localStorage.clear();
            navigate('/staff/login');
            return;
        }

        try {
            setPin(storedPin);
            setEvent(JSON.parse(storedEvent));
            setStation(JSON.parse(storedPos));
        } catch (e) {
            console.error('Failed to parse staff localStorage data:', e);
            localStorage.clear();
            navigate('/staff/login');
        }
    }, [navigate]);

    // Fetch Stats and Init Search on mount
    useEffect(() => {
        if (event && station && pin) {
            fetchStats();
            handleSearch('');
        }
    }, [event, station, pin]);

    // Fetch Attendance Stats Helper
    const fetchStats = async () => {
        try {
            const res = await api.get('/v1/staff/search-tickets', {
                params: { event_id: event.id, pos_pin: pin, q: '' }
            });
            if (res.data.event) {
                setEvent(res.data.event);
            }

            // Generate dynamic stats based on tickets status
            const tickets = res.data.data;

            // To get accurate attendance stats at this POS, we query stats via search ticket or a dummy query
            // Let's do a dummy scan or manual check-in search to calculate stats dynamically
            const resLogs = await api.get('/v1/staff/search-tickets', {
                params: { event_id: event.id, pos_pin: pin, q: '' }
            });
            // We can also let the controller return stats on search or fetch them.
            // Since we implemented dynamic stats calculation inside scan / manual checkin controller,
            // let's fetch the overall status dynamically!
            const totalTicketsCount = tickets.length;
            const checkedInCount = tickets.filter(t => t.status === 'used').length; // simple proxy

            setStats({
                total_quota: totalTicketsCount,
                checked_in: checkedInCount,
                remaining: Math.max(0, totalTicketsCount - checkedInCount)
            });
        } catch (err) {
            console.error('Failed to fetch attendance stats:', err);
        }
    };

    // General QR check-in processing
    const processQrCode = async (qrString) => {
        if (!qrString || !qrString.trim()) return;
        if (scanLockRef.current) return;

        setIsScanning(true);
        setScanFeedback(null);

        const currentStation = stationRef.current;
        const currentPin = pinRef.current;

        if (!currentStation || !currentPin) {
            setScanFeedback({
                type: 'error',
                message: 'Stasiun POS atau PIN tidak lengkap. Silakan login kembali.'
            });
            setIsScanning(false);
            return;
        }

        try {
            const response = await api.post('/v1/staff/scan', {
                qr_string: qrString.trim(),
                post_id: currentStation.id,
                pos_pin: currentPin
            });

            if (response.data.success) {
                const { attendee, stats: newStats } = response.data;
                setScanFeedback({
                    type: 'success',
                    message: response.data.message || 'Presensi berhasil dicatat!',
                    attendee
                });
                if (newStats) setStats(newStats);

                // Add to recent logs
                setCheckInLogs(prev => [attendee, ...prev.slice(0, 4)]);
                setQrInput('');

                // Kunci scanner selama 2.5 detik untuk cegah spamming read
                setScanLock(true);
                setTimeout(() => {
                    setScanLock(false);
                }, 2500);

                fetchStats(); // update search tables
                handleSearch(searchQuery);
            }
        } catch (err) {
            console.error('QR Scan Error:', err);
            setScanFeedback({
                type: 'error',
                message: err.response?.data?.message || 'Kode QR tidak valid atau terjadi kesalahan server.'
            });
        } finally {
            setIsScanning(false);
        }
    };

    // Handle QR Scan Submit (Manual Text Input fallback)
    const handleQrSubmit = (e) => {
        if (e) e.preventDefault();
        processQrCode(qrInput);
    };

    // Camera scanner lifecycle management
    useEffect(() => {
        if (isCameraActive) {
            const timer = setTimeout(() => {
                const html5QrCode = new Html5Qrcode("reader");
                html5QrCodeRef.current = html5QrCode;

                html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: (width, height) => {
                            const size = Math.min(width, height) * 0.7;
                            return { width: size, height: size };
                        }
                    },
                    (decodedText, decodedResult) => {
                        if (scanLockRef.current) return;
                        processQrCode(decodedText);
                    },
                    (errorMessage) => {
                        // Ignore standard scanning errors
                    }
                ).catch((err) => {
                    console.error("Failed to start QR scanner:", err);
                    setScanFeedback({
                        type: 'error',
                        message: 'Gagal mengakses kamera. Silakan periksa izin kamera pada perangkat.'
                    });
                    setIsCameraActive(false);
                });
            }, 100);

            return () => {
                clearTimeout(timer);
                if (html5QrCodeRef.current) {
                    const scanner = html5QrCodeRef.current;
                    html5QrCodeRef.current = null;
                    if (scanner.isScanning) {
                        scanner.stop().catch(err => console.error("Failed to stop scanner:", err));
                    }
                }
            };
        } else {
            if (html5QrCodeRef.current) {
                const scanner = html5QrCodeRef.current;
                html5QrCodeRef.current = null;
                if (scanner.isScanning) {
                    scanner.stop().catch(err => console.error("Failed to stop scanner:", err));
                }
            }
        }
    }, [isCameraActive]);

    // Real-Time Search Handler
    const handleSearch = async (query) => {
        if (!event || !pin) return;
        setIsSearching(true);
        try {
            const response = await api.get('/v1/staff/search-tickets', {
                params: {
                    q: query,
                    event_id: event.id,
                    pos_pin: pin
                }
            });
            setSearchResults(response.data.data);
        } catch (err) {
            console.error('Ticket search error:', err);
        } finally {
            setIsSearching(false);
        }
    };

    // Search Query Change
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        handleSearch(val);
    };

    // Manual Attendance Checkin (Override)
    const handleManualCheckIn = async (ticketId) => {
        setActionMessage(null);
        try {
            const response = await api.post('/v1/staff/manual-checkin', {
                ticket_id: ticketId,
                post_id: station.id,
                pos_pin: pin
            });

            if (response.data.success) {
                const { attendee, stats: newStats } = response.data;
                setActionMessage({
                    type: 'success',
                    message: response.data.message || 'Kehadiran manual berhasil dicatat.'
                });
                if (newStats) setStats(newStats);

                // Add to recent logs
                setCheckInLogs(prev => [attendee, ...prev.slice(0, 4)]);
                fetchStats();
                handleSearch(searchQuery);
            }
        } catch (err) {
            console.error('Manual Checkin Error:', err);
            setActionMessage({
                type: 'danger',
                message: err.response?.data?.message || 'Gagal melakukan check-in manual.'
            });
        }
    };

    const handleExit = () => {
        localStorage.removeItem('staff_selected_pos');
        navigate('/staff/select-post');
    };

    const renderScannerCard = () => (
        <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body className="p-4">
                <h5 className="fw-bold mb-3">Kamera Scanner QR</h5>

                {/* Scan State Feedback */}
                {scanFeedback && (
                    <Alert
                        variant={scanFeedback.type === 'success' ? 'success' : 'danger'}
                        className="d-flex align-items-center gap-3 rounded-3"
                        onClose={() => setScanFeedback(null)}
                        dismissible
                    >
                        {scanFeedback.type === 'success' ? (
                            <CheckCircle2 size={32} className="text-success flex-shrink-0" />
                        ) : (
                            <AlertCircle size={32} className="text-danger flex-shrink-0" />
                        )}
                        <div>
                            <div className="fw-bold fs-6">{scanFeedback.message}</div>
                            {scanFeedback.attendee && (
                                <div className="small text-muted mt-1">
                                    Peserta: {scanFeedback.attendee.name} ({scanFeedback.attendee.code})
                                </div>
                            )}
                        </div>
                    </Alert>
                )}

                {/* Camera Control / Reader Box */}
                {!isCameraActive ? (
                    <div
                        className="border border-dashed rounded-4 p-4 text-center mb-4 bg-light position-relative"
                        style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <QrCode size={64} className="text-secondary mb-3 opacity-25" />
                        <h6 className="fw-semibold text-dark">Kamera Scanner Nonaktif</h6>
                        <p className="text-muted small mb-3">Klik tombol di bawah untuk mengaktifkan kamera scanner pos.</p>
                        <Button
                            variant="primary"
                            onClick={() => setIsCameraActive(true)}
                            className="px-4 py-2 fw-bold rounded-3"
                        >
                            Buka Kamera Scanner
                        </Button>
                    </div>
                ) : (
                    <div>
                        <div className="position-relative w-100 rounded-4 overflow-hidden mb-3 border bg-dark">
                            <div
                                id="reader"
                                className="w-100"
                                style={{ minHeight: '300px' }}
                            ></div>

                            {scanLock && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 10
                                    }}
                                >
                                    <Spinner animation="grow" variant="success" className="mb-3" />
                                    <h6 className="fw-bold text-success">Scan Berhasil!</h6>
                                    <p className="text-muted small">Menghindari spam, scanner dikunci sementara...</p>
                                </div>
                            )}
                        </div>
                        <div className="text-center mb-4">
                            <Button
                                variant="danger"
                                className="rounded-pill px-4 py-2 small fw-bold"
                                onClick={() => setIsCameraActive(false)}
                            >
                                Matikan Kamera
                            </Button>
                        </div>
                    </div>
                )}

                {/* Scanner input fallback */}
                <Form onSubmit={handleQrSubmit} className="d-flex gap-2">
                    <Form.Control
                        type="text"
                        placeholder="Masukkan Kode Tiket / QR String secara manual"
                        value={qrInput}
                        onChange={(e) => setQrInput(e.target.value)}
                        className="py-2.5 px-3 rounded-3"
                        disabled={isScanning}
                    />
                    <Button
                        type="submit"
                        className="px-4 border-0 fw-bold rounded-3"
                        style={{ backgroundColor: '#1A365D' }}
                        disabled={isScanning}
                    >
                        {isScanning ? <Spinner animation="border" size="sm" /> : 'Verifikasi'}
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );

    // Helper to format date
    const formatDateTime = (dateObjOrStr) => {
        if (!dateObjOrStr) return '-';
        const date = dateObjOrStr instanceof Date 
            ? dateObjOrStr 
            : new Date((dateObjOrStr.includes('T') ? dateObjOrStr : dateObjOrStr.replace(' ', 'T')) + 'Z');
        return date.toLocaleString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };


    return (
        <div style={{ backgroundColor: 'var(--color-bg, #f8fafc)', minHeight: '100vh', paddingBottom: '60px' }}>

            {/* Nav Bar Staff */}
            <div className="bg-white border-bottom shadow-sm py-3 mb-4">
                <Container className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: '#1A365D',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <QrCode size={20} color="#ffffff" />
                        </div>
                        <div>
                            <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '16px' }}>{station?.name || 'Loading POS...'}</h5>
                            <span className="text-muted small">Event: {event?.title || 'Loading Event...'}</span>
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <Button
                            variant="light"
                            className="rounded-pill px-3 py-1.5 small border"
                            onClick={fetchStats}
                            title="Refresh Data"
                        >
                            <RefreshCw size={14} />
                        </Button>
                        <Button
                            variant="outline-danger"
                            className="rounded-pill px-3 py-1.5 small d-flex align-items-center gap-1.5"
                            onClick={handleExit}
                        >
                            <LogOut size={14} />
                            <span className="d-none d-sm-inline">Ganti POS</span>
                        </Button>
                    </div>
                </Container>
            </div>

            <Container>

                {/* Stats Row */}
                <Row className="g-3 mb-4">
                    {[
                        { label: 'Total Kuota POS', value: stats.total_quota, color: '#1A365D', icon: <Users size={16} /> },
                        { label: 'Jumlah Hadir', value: stats.checked_in, color: '#10b981', icon: <UserCheck size={16} /> },
                        { label: 'Belum Hadir', value: stats.remaining, color: '#f59e0b', icon: <Clock size={16} /> }
                    ].map((s, idx) => (
                        <Col xs={4} key={idx}>
                            <Card className="border-0 shadow-sm rounded-3">
                                <Card.Body className="p-3 text-center">
                                    <div style={{ color: s.color, marginBottom: '4px' }}>{s.icon}</div>
                                    <h3 className="fw-extrabold mb-0" style={{ color: 'var(--color-text)', fontSize: '1.6rem' }}>{s.value}</h3>
                                    <span className="text-secondary small" style={{ fontSize: '10px' }}>{s.label}</span>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {isMobile ? (
                    <div className="d-block d-lg-none">
                        <Tabs defaultActiveKey="scan" className="mb-4 custom-tabs">
                            <Tab eventKey="scan" title="📷 SCANNER QR">
                                {renderScannerCard()}
                            </Tab>

                            <Tab eventKey="override" title="✏️ MANUAL OVERRIDE">
                                <Card className="border-0 shadow-sm rounded-4">
                                    <Card.Body className="p-4">
                                        <h5 className="fw-bold mb-3">Pencarian Peserta</h5>

                                        {actionMessage && (
                                            <Alert variant={actionMessage.type} onClose={() => setActionMessage(null)} dismissible className="small py-2.5">
                                                {actionMessage.message}
                                            </Alert>
                                        )}

                                        <div className="d-flex gap-2 mb-4">
                                            <Form.Control
                                                type="text"
                                                placeholder="Cari nama, email, atau kode tiket..."
                                                value={searchQuery}
                                                onChange={handleSearchChange}
                                                className="py-2.5 px-3 rounded-3"
                                            />
                                        </div>

                                        {isSearching ? (
                                            <div className="text-center py-4">
                                                <Spinner animation="border" size="sm" className="text-primary" />
                                            </div>
                                        ) : searchResults.length === 0 ? (
                                            <p className="text-center text-muted small py-4">Tidak ada data peserta ditemukan.</p>
                                        ) : (
                                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                                {searchResults.map((ticket) => (
                                                    <div key={ticket.id} className="d-flex justify-content-between align-items-center border-bottom py-3">
                                                        <div>
                                                            <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '14px' }}>{ticket.attendee_name}</h6>
                                                            <span className="text-muted small" style={{ fontSize: '12px' }}>{ticket.ticket_code} · {ticket.attendee_email}</span>
                                                        </div>
                                                        <Button
                                                            variant={ticket.status === 'used' ? "success" : "outline-primary"}
                                                            size="sm"
                                                            className="rounded-pill px-3"
                                                            onClick={() => handleManualCheckIn(ticket.id)}
                                                            disabled={ticket.status === 'used'}
                                                        >
                                                            {ticket.status === 'used' ? 'Hadir' : 'Hadirkan Paksa'}
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Tab>
                        </Tabs>
                    </div>
                ) : (
                    <div className="d-none d-lg-block">
                        <Row className="g-4">
                            <Col lg={6}>
                                {renderScannerCard()}
                            </Col>

                            <Col lg={6}>
                                <Card className="border-0 shadow-sm rounded-4">
                                    <Card.Body className="p-4">
                                        <h5 className="fw-bold mb-3">Pencarian Peserta & Manual Override</h5>

                                        {actionMessage && (
                                            <Alert variant={actionMessage.type} onClose={() => setActionMessage(null)} dismissible className="small py-2.5">
                                                {actionMessage.message}
                                            </Alert>
                                        )}

                                        <div className="d-flex gap-2 mb-4">
                                            <Form.Control
                                                type="text"
                                                placeholder="Cari nama, email, atau kode tiket..."
                                                value={searchQuery}
                                                onChange={handleSearchChange}
                                                className="py-2.5 px-3 rounded-3"
                                            />
                                        </div>

                                        {isSearching ? (
                                            <div className="text-center py-4">
                                                <Spinner animation="border" size="sm" className="text-primary" />
                                            </div>
                                        ) : searchResults.length === 0 ? (
                                            <p className="text-center text-muted small py-4">Tidak ada data peserta ditemukan.</p>
                                        ) : (
                                            <Table responsive hover className="align-middle">
                                                <thead>
                                                    <tr>
                                                        <th>Nama & Email</th>
                                                        <th>Kode Tiket</th>
                                                        <th className="text-end">Tindakan</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {searchResults.map((ticket) => (
                                                        <tr key={ticket.id}>
                                                            <td>
                                                                <div className="fw-bold">{ticket.attendee_name}</div>
                                                                <span className="text-muted small">{ticket.attendee_email}</span>
                                                            </td>
                                                            <td>
                                                                <Badge bg="light" text="dark" className="border px-2.5 py-1.5">{ticket.ticket_code}</Badge>
                                                            </td>
                                                            <td className="text-end">
                                                                <Button
                                                                    variant={ticket.status === 'used' ? "success" : "outline-primary"}
                                                                    size="sm"
                                                                    className="rounded-pill px-3"
                                                                    onClick={() => handleManualCheckIn(ticket.id)}
                                                                    disabled={ticket.status === 'used'}
                                                                >
                                                                    {ticket.status === 'used' ? 'Hadir' : 'Hadirkan Paksa'}
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                )}

                {/* Check-in Log / Riwayat Scanner Terkini */}
                <Card className="border-0 shadow-sm rounded-4 mt-4">
                    <Card.Body className="p-4">
                        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                            <Clock size={18} className="text-secondary" />
                            <span>Log Kehadiran POS Terkini</span>
                        </h5>

                        {checkInLogs.length === 0 ? (
                            <p className="text-muted small mb-0 py-2">Belum ada aktivitas presensi di sesi POS ini.</p>
                        ) : (
                            <div className="d-flex flex-column gap-2">
                                {checkInLogs.map((log, index) => (
                                    <div key={index} className="d-flex justify-content-between align-items-center bg-light p-3 rounded-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                backgroundColor: '#d1fae5',
                                                color: '#065f46',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <UserCheck size={16} />
                                            </div>
                                            <div>
                                                <span className="fw-bold d-block text-dark" style={{ fontSize: '13px' }}>{log.name}</span>
                                                <span className="text-muted small" style={{ fontSize: '11px' }}>Tiket: {log.code}</span>
                                            </div>
                                        </div>
                                        <span className="text-secondary small fw-semibold" style={{ fontSize: '12px' }}>{log.time}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card.Body>
                </Card>

            </Container>

            {/* Custom keyframes animation style */}
            <style>{`
                @keyframes scan-anim {
                    0% { top: 20%; }
                    50% { top: 80%; }
                    100% { top: 20%; }
                }
                .custom-tabs .nav-link {
                    font-weight: 700;
                    border: none;
                    color: var(--color-secondary, #64748b);
                    padding: 12px 16px;
                }
                .custom-tabs .nav-link.active {
                    color: #1A365D;
                    border-bottom: 3px solid #1A365D;
                    background: transparent;
                }
            `}</style>
        </div>
    );
};

export default StaffDashboard;
