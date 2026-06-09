import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { QrCode, LogOut, Users, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../api/axios';
import AttendanceKiosk from './components/AttendanceKiosk';
import PointsKiosk from './components/PointsKiosk';

const StaffDashboard = () => {
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [station, setStation] = useState(null);
    const [pin, setPin] = useState('');
    
    // Kiosk Mode States
    // currentMode can be: null (Mode Selection), 'attendance' (Check-in), 'points' (Activity Points)
    const [currentMode, setCurrentMode] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanLock, setScanLock] = useState(false);
    const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

    // Attendance Mode States (Same as previous dashboard)
    const [stats, setStats] = useState({ total_quota: 0, checked_in: 0, remaining: 0 });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [checkInLogs, setCheckInLogs] = useState([]);
    const searchTimeoutRef = useRef(null);

    // Points Mode States (Same as previous kiosk)
    const [participantsDb, setParticipantsDb] = useState([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [recentLogs, setRecentLogs] = useState([]);

    const scanLockRef = useRef(scanLock);

    useEffect(() => {
        scanLockRef.current = scanLock;
    }, [scanLock]);

    // Authentication and initialization check
    useEffect(() => {
        const storedPin = localStorage.getItem('staff_pin');
        const storedEvent = JSON.parse(localStorage.getItem('staff_event') || 'null');
        const storedPos = JSON.parse(localStorage.getItem('staff_selected_pos') || 'null');
        const staffMode = localStorage.getItem('staff_mode');

        if (!storedPin || !storedEvent) {
            localStorage.clear();
            navigate('/staff/login');
            return;
        }

        if (!storedPos) {
            navigate('/staff/select-post');
            return;
        }

        if (!staffMode) {
            navigate('/staff/select-service');
            return;
        }

        setPin(storedPin);
        setEvent(storedEvent);
        setStation(storedPos);
        setCurrentMode(staffMode);
    }, [navigate]);

    // Fetch initial data based on mode
    useEffect(() => {
        if (event?.id && pin) {
            if (currentMode === 'attendance') {
                fetchStats();
                handleSearch('');
            } else if (currentMode === 'points') {
                loadParticipants();
            }
        }
        // eslint-disable-next-line
    }, [event?.id, pin, currentMode]);

    // Fetch Attendance Stats
    const fetchStats = async () => {
        if (!event?.id || !pin) return;
        try {
            const res = await api.get('/v1/staff/search-tickets', {
                params: { event_id: event.id, pos_pin: pin, q: '' }
            });
            if (res.data.stats) {
                setStats(res.data.stats);
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    // Handle Attendance Search query change
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => handleSearch(val), 500);
    };

    // Fetch Attendance Search Results
    const handleSearch = async (query) => {
        if (!event || !pin) return;
        setIsSearching(true);
        try {
            const response = await api.get('/v1/staff/search-tickets', {
                params: { q: query, event_id: event.id, pos_pin: pin }
            });
            setSearchResults(response.data.data || []);
        } catch (err) {
            console.error('Ticket search error:', err);
        } finally {
            setIsSearching(false);
        }
    };

    // Handle manual check-in / check-out from list
    const handleManualCheckIn = async (ticketId, overrideMode) => {
        if (scanLock) return;
        setScanLock(true);
        setFeedback(null);

        try {
            const response = await api.post('/v1/staff/manual-checkin', {
                ticket_id: ticketId,
                post_id: station?.id,
                pos_pin: pin,
                scan_type: overrideMode
            });
            if (response.data.success) {
                const { attendee, stats: newStats } = response.data;
                setFeedback({
                    type: 'success',
                    message: `Check-${overrideMode === 'in' ? 'in' : 'out'} Manual Berhasil: ${attendee.name}`
                });
                
                if (newStats) setStats(newStats);
                
                const newLog = {
                    name: attendee.name,
                    code: attendee.code,
                    time: attendee.time || new Date().toLocaleTimeString('id-ID')
                };
                setCheckInLogs(prev => [newLog, ...prev.slice(0, 4)]);
                
                fetchStats();
                handleSearch(searchQuery);
            }
        } catch (err) {
            console.error('Manual checkin error:', err);
            setFeedback({
                type: 'error',
                message: err.response?.data?.message || 'Gagal memproses check-in manual.'
            });
        } finally {
            setTimeout(() => {
                setFeedback(null);
                setScanLock(false);
            }, 2500);
        }
    };

    // Fetch points participant database for simulation
    const loadParticipants = () => {
        if (!event?.id || !pin) return;
        setLoadingParticipants(true);
        api.get(`/v1/staff/search-tickets?event_id=${event.id}&pos_pin=${pin}`)
            .then(res => {
                if (res.data.success) {
                    const mapped = res.data.data.map(ticket => {
                        const pointsList = ticket.participant?.local_points || ticket.participant?.localPoints || [];
                        const pointsRecord = pointsList.find(lp => lp.event_id === parseInt(event.id));
                        return {
                            ticket_code: ticket.ticket_code,
                            name: ticket.attendee_name,
                            email: ticket.attendee_email,
                            balance: pointsRecord ? pointsRecord.points_balance : 0
                        };
                    });
                    setParticipantsDb(mapped);
                }
            })
            .catch(err => {
                console.error("Gagal memuat peserta:", err);
            })
            .finally(() => {
                setLoadingParticipants(false);
            });
    };

    // Main QR scan processor
    const processScan = async (qrString, pointsActivitySlug = 'booth_visit') => {
        if (!qrString.trim() || scanLockRef.current) return;

        setScanLock(true);
        setIsScanning(true);
        setFeedback(null);

        try {
            if (currentMode === 'attendance') {
                const response = await api.post('/v1/staff/scan', {
                    qr_string: qrString.trim(),
                    post_id: station.id,
                    pos_pin: pin,
                    scan_type: 'in'
                });
                
                const attendeeName = response.data.attendee?.name || 'Peserta';
                setFeedback({
                    type: 'success',
                    message: `Kehadiran Dikonfirmasi: ${attendeeName}`
                });

                // Update Stats and local check-in log
                if (response.data.stats) setStats(response.data.stats);
                const newLog = {
                    name: attendeeName,
                    code: response.data.attendee?.code || qrString,
                    time: response.data.attendee?.time || new Date().toLocaleTimeString('id-ID')
                };
                setCheckInLogs(prev => [newLog, ...prev.slice(0, 4)]);
                fetchStats();
                handleSearch(searchQuery);

            } else if (currentMode === 'points') {
                const cleanCode = qrString.split('.')[0].trim().toUpperCase();
                const response = await api.post('/v1/staff/kiosk-scan', {
                    ticket_code: cleanCode,
                    activity_slug: pointsActivitySlug,
                    description: station?.name || 'Kiosk Poin',
                    pos_pin: pin
                });
                
                const participantName = response.data.data?.participant_name || 'Peserta';
                setFeedback({
                    type: 'success',
                    message: `Poin Berhasil Ditambahkan: ${participantName}`
                });

                // Update local simulation points balance and recent logs list
                const newBalance = response.data.data?.new_balance;
                if (newBalance !== undefined) {
                    setParticipantsDb(prev => prev.map(p => 
                        p.ticket_code === cleanCode ? { ...p, balance: newBalance } : p
                    ));
                }

                const newLog = {
                    id: Date.now(),
                    time: new Date().toLocaleTimeString('id-ID'),
                    ticket_code: cleanCode,
                    name: participantName,
                    activity: response.data.data?.activity_name || 'Kunjungan Booth',
                    points: response.data.data?.points_rewarded || 15
                };
                setRecentLogs(prev => [newLog, ...prev]);
            }
        } catch (err) {
            console.error('Scan Error:', err);
            const errMsg = err.response?.data?.message || '';
            
            let displayMsg = 'Tiket Tidak Valid';
            if (errMsg.toLowerCase().includes('sudah digunakan') || 
                errMsg.toLowerCase().includes('sudah memindai') || 
                errMsg.toLowerCase().includes('sudah melakukan') ||
                errMsg.toLowerCase().includes('sudah check-in')) {
                displayMsg = 'Poin Sudah Diambil!';
            } else if (errMsg) {
                displayMsg = errMsg;
            }

            setFeedback({
                type: 'error',
                message: displayMsg
            });
        } finally {
            setIsScanning(false);
            
            // Auto-Reset feedback loop
            setTimeout(() => {
                setFeedback(null);
                setScanLock(false);
            }, 2500);
        }
    };

    const handleExitPost = () => {
        localStorage.removeItem('staff_selected_pos');
        localStorage.removeItem('staff_mode');
        navigate('/staff/select-post');
    };

    const handleGoBackToServiceSelection = () => {
        localStorage.removeItem('staff_mode');
        navigate('/staff/select-service');
    };

    // Render Mode Selection (Layar dashboard pilihan fungsi)
    const renderModeSelection = () => {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 mode-selection-container">
                <div className="text-center mb-5 mode-selection-header">
                    <h3 className="fw-extrabold text-dark mb-2 mode-selection-title">Pilih Fungsi Stasiun</h3>
                    <p className="text-muted small mode-selection-subtitle">Silakan pilih salah satu layanan kiosk di bawah untuk memulai scanner.</p>
                </div>

                <div className="d-flex flex-column flex-md-row w-100 justify-content-center align-items-stretch" style={{ maxWidth: '720px', gap: '20px' }}>
                    {/* Tombol 1: Konfirmasi Kehadiran */}
                    <div 
                        className="flex-grow-1 d-flex flex-column align-items-center justify-content-center p-5 text-center cursor-pointer mode-card"
                        style={{
                            borderRadius: '20px',
                            backgroundColor: '#ffffff',
                            border: '3px solid var(--color-primary, #00699e)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            minHeight: '240px'
                        }}
                        onClick={() => setCurrentMode('attendance')}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 105, 158, 0.15)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.03)';
                        }}
                    >
                        <div className="mode-card-icon" style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            backgroundColor: 'var(--primary-light, #dff3ff)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-primary, #00699e)',
                            marginBottom: '16px',
                            border: '1.5px solid var(--primary-border, #b9e7fe)'
                        }}>
                            <Users size={32} />
                        </div>
                        <h4 className="fw-bold text-dark mb-2">Konfirmasi Kehadiran</h4>
                        <p className="text-muted small mb-0 px-2">Mencatat kedatangan peserta event secara langsung (Check-in).</p>
                    </div>

                    {/* Tombol 2: Beri Poin Aktivitas */}
                    <div 
                        className="flex-grow-1 d-flex flex-column align-items-center justify-content-center p-5 text-center cursor-pointer mode-card"
                        style={{
                            borderRadius: '20px',
                            backgroundColor: '#ffffff',
                            border: '3px solid var(--color-primary, #00699e)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            minHeight: '240px'
                        }}
                        onClick={() => setCurrentMode('points')}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 105, 158, 0.15)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.03)';
                        }}
                    >
                        <div className="mode-card-icon" style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            backgroundColor: 'var(--primary-light, #dff3ff)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-primary, #00699e)',
                            marginBottom: '16px',
                            border: '1.5px solid var(--primary-border, #b9e7fe)'
                        }}>
                            <Sparkles size={32} />
                        </div>
                        <h4 className="fw-bold text-dark mb-2">Beri Poin Aktivitas</h4>
                        <p className="text-muted small mb-0 px-2">Memberikan poin bonus atas kehadiran kunjungan booth / stan peserta.</p>
                    </div>
                </div>

                <div className="mt-5 d-flex gap-3 mode-selection-footer">
                    <Button 
                        variant="link" 
                        onClick={() => navigate('/staff/attendees')}
                        className="text-secondary fw-semibold text-decoration-none px-4 py-2 hover-dark"
                        style={{ transition: 'color 0.2s', color: 'var(--color-secondary, #64748b)' }}
                        onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-text, #0f172a)'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-secondary, #64748b)'}
                    >
                        Daftar Peserta
                    </Button>
                    <div style={{ width: '1px', backgroundColor: '#cbd5e1' }} />
                    <Button 
                        variant="link" 
                        onClick={handleExitPost}
                        className="text-danger fw-semibold text-decoration-none px-4 py-2"
                    >
                        Ganti POS
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div style={{ 
            backgroundColor: 'var(--color-bg, #f4f5f7)', 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column' 
        }}>
            
            {/* Top Navigation Bar */}
            <div className="border-bottom py-3 px-4" style={{ backgroundColor: '#ffffff', borderColor: 'var(--color-border, #e2e8f0)' }}>
                <Container className="d-flex justify-content-between align-items-center max-w-7xl">
                    <div className="d-flex align-items-center gap-3">
                        <div style={{ 
                            width: '38px', 
                            height: '38px', 
                            borderRadius: '10px', 
                            backgroundColor: 'var(--color-primary, #00699e)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            border: '1px solid rgba(0,0,0,0.05)'
                        }}>
                            <QrCode size={18} color="#fff" />
                        </div>
                        <div>
                            <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '14px' }}>
                                {station?.name || 'Loading...'}
                            </h5>
                            <span className="text-muted small d-block text-truncate" style={{ maxWidth: '280px', fontSize: '11px' }}>
                                {event?.title}
                            </span>
                        </div>
                    </div>
                    <Button 
                        variant="outline-danger" 
                        className="rounded-circle p-2 border-0 bg-transparent" 
                        onClick={handleExitPost}
                        style={{ color: '#ef4444' }}
                    >
                        <LogOut size={18} />
                    </Button>
                </Container>
            </div>

            {/* Main Content Area */}
            <Container className="d-flex flex-column flex-grow-1 py-4 justify-content-center">
                {currentMode === null ? renderModeSelection() : 
                  currentMode === 'attendance' ? (
                    <AttendanceKiosk 
                        stats={stats}
                        searchQuery={searchQuery}
                        searchResults={searchResults}
                        isSearching={isSearching}
                        checkInLogs={checkInLogs}
                        feedback={feedback}
                        isScanning={isScanning}
                        scanLock={scanLock}
                        processScan={processScan}
                        handleSearchChange={handleSearchChange}
                        handleManualCheckIn={handleManualCheckIn}
                        onBack={handleGoBackToServiceSelection}
                    />
                 ) : (
                    <PointsKiosk 
                        station={station}
                        setStation={setStation}
                        participantsDb={participantsDb}
                        loadingParticipants={loadingParticipants}
                        recentLogs={recentLogs}
                        feedback={feedback}
                        isScanning={isScanning}
                        scanLock={scanLock}
                        processScan={processScan}
                        onBack={handleGoBackToServiceSelection}
                    />
                 )}
            </Container>

            {/* Feedback Modal Overlay */}
            <Modal
                show={feedback !== null}
                onHide={() => setFeedback(null)}
                centered
                backdrop="static"
                contentClassName="border-0 shadow-lg"
                style={{ zIndex: 1060 }}
            >
                <Modal.Body className="p-4 text-center">
                    <div className="d-flex flex-column align-items-center gap-3">
                        {feedback?.type === 'success' ? (
                            <div 
                                className="d-flex align-items-center justify-content-center animate-fade-in"
                                style={{
                                    width: '72px',
                                    height: '72px',
                                    borderRadius: '50%',
                                    backgroundColor: '#d1fae5',
                                    color: '#10b981',
                                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)'
                                }}
                            >
                                <CheckCircle2 size={40} />
                            </div>
                        ) : (
                            <div 
                                className="d-flex align-items-center justify-content-center animate-fade-in"
                                style={{
                                    width: '72px',
                                    height: '72px',
                                    borderRadius: '50%',
                                    backgroundColor: '#fee2e2',
                                    color: '#ef4444',
                                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.2)'
                                }}
                            >
                                <XCircle size={40} />
                            </div>
                        )}

                        <div>
                            <h4 className="fw-extrabold text-dark mb-2">
                                {feedback?.type === 'success' ? 'Berhasil!' : 'Gagal!'}
                            </h4>
                            <p className="text-secondary mb-0 fw-semibold" style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                                {feedback?.message}
                            </p>
                        </div>

                        <Button
                            variant={feedback?.type === 'success' ? 'success' : 'danger'}
                            className="w-100 rounded-pill py-2 fw-bold border-0 mt-2 text-white"
                            style={{
                                backgroundColor: feedback?.type === 'success' ? '#10b981' : '#ef4444',
                                boxShadow: feedback?.type === 'success' ? '0 4px 12px rgba(16, 185, 129, 0.15)' : '0 4px 12px rgba(239, 68, 68, 0.15)'
                            }}
                            onClick={() => setFeedback(null)}
                        >
                            Tutup
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Responsive design styling overrides */}
            <style>{`
                @keyframes scan-anim {
                    0% { top: 5%; }
                    50% { top: 92%; }
                    100% { top: 5%; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @media (max-width: 767px) {
                    .mode-selection-container {
                        min-height: auto !important;
                        padding-top: 20px;
                        padding-bottom: 20px;
                    }
                    .mode-selection-header {
                        margin-bottom: 24px !important;
                    }
                    .mode-selection-title {
                        font-size: 1.5rem !important;
                    }
                    .mode-selection-subtitle {
                        font-size: 0.8rem !important;
                    }
                    .mode-card {
                        min-height: 140px !important;
                        padding: 1.5rem !important;
                    }
                    .mode-card-icon {
                        width: 48px !important;
                        height: 48px !important;
                        margin-bottom: 12px !important;
                    }
                    .mode-card-icon svg {
                        width: 24px !important;
                        height: 24px !important;
                    }
                    .mode-card h4 {
                        font-size: 1.1rem !important;
                        margin-bottom: 6px !important;
                    }
                    .mode-card p {
                        font-size: 0.78rem !important;
                    }
                    .mode-selection-footer {
                        margin-top: 32px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default StaffDashboard;