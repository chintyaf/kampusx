import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { QrCode, Search, UserCheck, Users, RefreshCw, LogOut, Clock, List } from 'lucide-react';
import api from '../../api/axios';

const StaffDashboard = () => {
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [station, setStation] = useState(null);
    const [pin, setPin] = useState('');
    const [stats, setStats] = useState({ total_quota: 0, checked_in: 0, remaining: 0 });
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [actionMessage, setActionMessage] = useState(null);
    const [checkInLogs, setCheckInLogs] = useState([]);
    const searchTimeoutRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 992);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const storedPin = localStorage.getItem('staff_pin');
        const storedEvent = JSON.parse(localStorage.getItem('staff_event') || 'null');
        const storedPos = JSON.parse(localStorage.getItem('staff_selected_pos') || 'null');

        if (!storedPin || !storedEvent || !storedPos) {
            localStorage.clear();
            navigate('/staff/login');
            return;
        }
        setPin(storedPin);
        setEvent(storedEvent);
        setStation(storedPos);
    }, [navigate]);

    useEffect(() => {
        if (event?.id && station?.id && pin) {
            fetchStats();
            handleSearch('');
        }
        // eslint-disable-next-line
    }, [event?.id, station?.id, pin]);

    const fetchStats = async () => {
        try {
            const res = await api.get('/v1/staff/search-tickets', {
                params: { event_id: event.id, pos_pin: pin, q: '' }
            });
            
            if (res.data.event) setEvent(res.data.event);
            
            // Simpan semua tiket untuk daftar (jika di halaman attendees)
            if (typeof setAllTickets === 'function') {
                setAllTickets(res.data.data);
            }
            
            // PERBAIKAN: Gunakan stats asli dari Backend
            if (res.data.stats) {
                setStats(res.data.stats);
            }
            
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    const handleSearch = async (query) => {
        if (!event || !pin) return;
        setIsSearching(true);
        try {
            const response = await api.get('/v1/staff/search-tickets', {
                params: { q: query, event_id: event.id, pos_pin: pin }
            });
            setSearchResults(response.data.data);
        } catch (err) {
            console.error('Ticket search error:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => handleSearch(val), 500);
    };

    const handleManualCheckIn = async (ticketId, overrideMode) => {
        setActionMessage(null);
        try {
            const response = await api.post('/v1/staff/manual-checkin', {
                ticket_id: ticketId,
                post_id: station.id,
                pos_pin: pin,
                scan_type: overrideMode
            });
            if (response.data.success) {
                const { attendee, stats: newStats } = response.data;
                setActionMessage({ type: 'success', message: response.data.message });
                if (newStats) setStats(newStats);
                setCheckInLogs(prev => [attendee, ...prev.slice(0, 4)]);
                fetchStats();
                handleSearch(searchQuery);
            }
        } catch (err) {
            setActionMessage({ type: 'danger', message: err.response?.data?.message || 'Gagal check-in.' });
        }
    };

    const handleExit = () => {
        localStorage.removeItem('staff_selected_pos');
        navigate('/staff/select-post');
    };

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '90px' }}>
            <div className="bg-white border-bottom shadow-sm py-3 mb-4 sticky-top">
                <Container className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                        <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#1A365D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <QrCode size={20} color="#fff" />
                        </div>
                        <div>
                            <h5 className="fw-bold mb-0" style={{ fontSize: 15 }}>{station?.name || 'Loading...'}</h5>
                            <span className="text-muted small d-block text-truncate" style={{ maxWidth: 200 }}>{event?.title}</span>
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <Button variant="light" className="rounded-circle p-2 border" onClick={fetchStats}><RefreshCw size={16} /></Button>
                        <Button variant="outline-danger" className="rounded-circle p-2" onClick={handleExit}><LogOut size={16} /></Button>
                    </div>
                </Container>
            </div>

            <Container>
                <div className="d-flex justify-content-end mb-3">
                    <Button variant="light" className="rounded-pill fw-bold border px-3 py-2 d-flex gap-2 shadow-sm bg-white" style={{ color: '#1A365D', fontSize: 13 }} onClick={() => navigate('/staff/attendees')}>
                        <List size={16} /> Daftar Peserta
                    </Button>
                </div>

                <Row className="g-2 g-sm-3 mb-4">
                    {[
                        { label: 'Total', value: stats.total_quota, color: '#1A365D', icon: <Users size={18} /> },
                        { label: 'Hadir', value: stats.checked_in, color: '#10b981', icon: <UserCheck size={18} /> },
                        { label: 'Sisa', value: stats.remaining, color: '#f59e0b', icon: <Clock size={18} /> }
                    ].map((s, idx) => (
                        <Col xs={4} key={idx}>
                            <Card className="border-0 shadow-sm rounded-4 h-100">
                                <Card.Body className="p-2 p-sm-3 text-center d-flex flex-column align-items-center">
                                    <div style={{ color: s.color, marginBottom: 4 }}>{s.icon}</div>
                                    <h4 className="fw-extrabold mb-0">{s.value}</h4>
                                    <span className="text-secondary fw-semibold" style={{ fontSize: 10, textTransform: 'uppercase' }}>{s.label}</span>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {!isMobile && (
                    <Card className="border-0 shadow-sm rounded-4 mb-4">
                        <Card.Body className="p-4 d-flex gap-3">
                            <Button onClick={() => navigate('/staff/scanner?mode=in')} className="flex-grow-1 fw-bold py-3 border-0 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#1A365D' }}>SCAN MASUK</Button>
                            <Button onClick={() => navigate('/staff/scanner?mode=out')} variant="danger" className="flex-grow-1 fw-bold py-3 d-flex align-items-center justify-content-center">SCAN KELUAR</Button>
                        </Card.Body>
                    </Card>
                )}

                <Row className="g-4">
                    <Col lg={7}>
                        <Card className="border-0 shadow-sm rounded-4 h-100">
                            <Card.Body className="p-3 p-sm-4">
                                <h6 className="fw-bold mb-3 d-flex gap-2"><Search size={18} /> Cari & Override</h6>
                                {actionMessage && <Alert variant={actionMessage.type} onClose={() => setActionMessage(null)} dismissible className="small py-2">{actionMessage.message}</Alert>}
                                <Form.Control type="text" placeholder="Nama / Tiket..." value={searchQuery} onChange={handleSearchChange} className="py-2.5 px-3 rounded-pill bg-light border-0 mb-3" />
                                
                                {isSearching ? <div className="text-center py-4"><Spinner size="sm" variant="primary" /></div> : 
                                searchResults.length === 0 ? <p className="text-center text-muted small py-4">Data tidak ditemukan.</p> : (
                                    <div style={{ maxHeight: 350, overflowY: 'auto' }} className="d-flex flex-column gap-2 pe-1">
                                        {searchResults.map(t => (
                                            <div key={t.id} className="d-flex justify-content-between align-items-center border rounded-3 p-3 bg-white">
                                                <div className="overflow-hidden">
                                                    <h6 className="fw-bold mb-0 text-truncate" style={{ fontSize: 14 }}>{t.attendee_name}</h6>
                                                    <span className="text-muted small text-truncate d-block">{t.ticket_code}</span>
                                                </div>
                                                <div className="d-flex gap-2 ms-2">
                                                    <Button variant="outline-primary" size="sm" onClick={() => handleManualCheckIn(t.id, 'in')}>MASUK</Button>
                                                    <Button variant="outline-danger" size="sm" onClick={() => handleManualCheckIn(t.id, 'out')}>KELUAR</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={5}>
                        <Card className="border-0 shadow-sm rounded-4 h-100">
                            <Card.Body className="p-3 p-sm-4">
                                <h6 className="fw-bold mb-3 d-flex gap-2"><Clock size={18} /> Log Terkini</h6>
                                {checkInLogs.length === 0 ? <p className="text-muted small py-2">Belum ada aktivitas.</p> : (
                                    <div className="d-flex flex-column gap-2">
                                        {checkInLogs.map((log, i) => (
                                            <div key={i} className="d-flex justify-content-between align-items-center bg-light p-3 rounded-3">
                                                <div className="d-flex gap-3">
                                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#d1fae5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserCheck size={16} /></div>
                                                    <div>
                                                        <span className="fw-bold d-block text-truncate" style={{ fontSize: 13 }}>{log.name}</span>
                                                        <span className="text-muted small">{log.code}</span>
                                                    </div>
                                                </div>
                                                <span className="text-success small fw-semibold">Berhasil</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {isMobile && (
                <div className="position-fixed bottom-0 start-0 end-0 bg-white border-top shadow-lg p-3" style={{ zIndex: 1000 }}>
                    <Container className="d-flex gap-2 p-0">
                        <Button onClick={() => navigate('/staff/scanner?mode=in')} className="flex-grow-1 fw-bold py-3 d-flex justify-content-center gap-2 rounded-4 border-0" style={{ backgroundColor: '#1A365D' }}><QrCode size={20} /> SCAN MASUK</Button>
                        <Button onClick={() => navigate('/staff/scanner?mode=out')} variant="danger" className="fw-bold px-4 py-3 rounded-4">SCAN KELUAR</Button>
                    </Container>
                </div>
            )}
        </div>
    );
};
export default StaffDashboard;