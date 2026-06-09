import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldAlert, KeyRound, ArrowRight, Users, Sparkles } from 'lucide-react';
import api from '../../api/axios';

const StaffLogin = () => {
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loginSuccessData, setLoginSuccessData] = useState(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Initialize PIN from query params if exists
    useEffect(() => {
        const pinFromUrl = searchParams.get('pin');
        if (pinFromUrl) {
            setPin(pinFromUrl.toUpperCase());
        }
    }, [searchParams]);

    // Redirect if already logged in as staff
    useEffect(() => {
        const storedPin = localStorage.getItem('staff_pin');
        const storedPos = localStorage.getItem('staff_selected_pos');
        const storedMode = localStorage.getItem('staff_mode');
        const storedEvent = localStorage.getItem('staff_event');
        const storedStations = localStorage.getItem('staff_stations');

        if (storedPin) {
            if (!storedMode) {
                try {
                    setLoginSuccessData({
                        pin: storedPin,
                        event: JSON.parse(storedEvent || 'null'),
                        stations: JSON.parse(storedStations || '[]')
                    });
                } catch (e) {
                    console.error(e);
                }
            } else if (storedMode === 'points') {
                navigate('/staff/dashboard');
            } else if (storedPos) {
                navigate('/staff/dashboard');
            } else {
                navigate('/staff/select-post');
            }
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        const cleanPin = pin.trim().toUpperCase();
        if (!cleanPin) {
            setError('Silakan masukkan PIN akses terlebih dahulu.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post('/v1/staff/verify-pin', { pin: cleanPin });
            if (response.data.success) {
                const stations = response.data.stations || [];
                setLoginSuccessData({
                    pin: cleanPin,
                    event: response.data.event,
                    stations: stations
                });
            } else {
                setError(response.data.message || 'Gagal memverifikasi PIN.');
            }
        } catch (err) {
            console.error('Login PIN Error:', err);
            setError(
                err.response?.data?.message || 
                'PIN tidak terdaftar atau terjadi gangguan koneksi server.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectMode = (mode) => {
        if (!loginSuccessData) return;
        const { pin: cleanPin, event, stations } = loginSuccessData;
        localStorage.setItem('staff_pin', cleanPin);
        localStorage.setItem('staff_event', JSON.stringify(event));
        localStorage.setItem('staff_stations', JSON.stringify(stations));
        localStorage.setItem('staff_mode', mode);

        if (mode === 'attendance') {
            // Behind the scenes: auto-select if there is only one station
            if (stations.length === 1) {
                localStorage.setItem('staff_selected_pos', JSON.stringify(stations[0]));
                navigate('/staff/dashboard');
            } else {
                navigate('/staff/select-post');
            }
        } else {
            // Points mode goes directly to points dashboard
            localStorage.removeItem('staff_selected_pos');
            navigate('/staff/dashboard');
        }
    };

    if (loginSuccessData) {
        return (
            <div style={{ 
                backgroundColor: 'var(--color-bg, #f4f5f7)', 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '24px' 
            }}>
                <Container style={{ maxWidth: '600px' }}>
                    <div className="text-center mb-5">
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '18px',
                            backgroundColor: 'var(--color-primary, #00699e)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px auto',
                            boxShadow: '0 4px 12px rgba(0, 105, 158, 0.15)'
                        }}>
                            <KeyRound size={28} color="#ffffff" />
                        </div>
                        <h2 className="fw-extrabold mb-1" style={{ tracking: '-0.04em', color: 'var(--color-text, #0f172a)', fontSize: '1.75rem' }}>Pilih Layanan Staff</h2>
                        <p className="text-muted small" style={{ fontSize: '0.88rem' }}>Silakan pilih opsi operasi stasiun yang ingin Anda lakukan.</p>
                    </div>

                    <div className="d-flex flex-column flex-md-row gap-4 justify-content-center align-items-stretch">
                        {/* Attendance Mode */}
                        <div 
                            className="flex-grow-1 d-flex flex-column align-items-center justify-content-center p-5 text-center"
                            style={{
                                borderRadius: '24px',
                                backgroundColor: '#ffffff',
                                border: '2.5px solid var(--color-border, #e2e8f0)',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                minHeight: '220px'
                            }}
                            onClick={() => handleSelectMode('attendance')}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.borderColor = 'var(--color-primary, #00699e)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 105, 158, 0.12)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'var(--color-border, #e2e8f0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.02)';
                            }}
                        >
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                backgroundColor: 'var(--primary-light, #dff3ff)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--color-primary, #00699e)',
                                marginBottom: '16px',
                                border: '1.5px solid var(--primary-border, #b9e7fe)'
                            }}>
                                <Users size={28} />
                            </div>
                            <h4 className="fw-bold text-dark mb-2" style={{ fontSize: '1.2rem' }}>Absensi & Kehadiran</h4>
                            <p className="text-muted small mb-0 px-2" style={{ fontSize: '0.8rem' }}>Mencatat kedatangan/kehadiran peserta event secara langsung (Check-in).</p>
                        </div>

                        {/* Points Mode */}
                        <div 
                            className="flex-grow-1 d-flex flex-column align-items-center justify-content-center p-5 text-center"
                            style={{
                                borderRadius: '24px',
                                backgroundColor: '#ffffff',
                                border: '2.5px solid var(--color-border, #e2e8f0)',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                minHeight: '220px'
                            }}
                            onClick={() => handleSelectMode('points')}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.borderColor = 'var(--color-primary, #00699e)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 105, 158, 0.12)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'var(--color-border, #e2e8f0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.02)';
                            }}
                        >
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                backgroundColor: 'var(--primary-light, #dff3ff)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--color-primary, #00699e)',
                                marginBottom: '16px',
                                border: '1.5px solid var(--primary-border, #b9e7fe)'
                            }}>
                                <Sparkles size={28} />
                            </div>
                            <h4 className="fw-bold text-dark mb-2" style={{ fontSize: '1.2rem' }}>Masukkan Poin</h4>
                            <p className="text-muted small mb-0 px-2" style={{ fontSize: '0.8rem' }}>Memberikan poin bonus untuk peserta (kunjungan booth/stan atau tanya jawab).</p>
                        </div>
                    </div>

                    <div className="text-center mt-5">
                        <Button 
                            variant="link" 
                            className="text-muted small text-decoration-none fw-semibold"
                            onClick={() => setLoginSuccessData(null)}
                        >
                            Kembali ke Halaman PIN
                        </Button>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div style={{ 
            backgroundColor: 'var(--color-bg, #f4f5f7)', 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '24px' 
        }}>
            <Container style={{ maxWidth: '420px' }}>
                <div className="text-center mb-4">
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '18px',
                        backgroundColor: 'var(--color-primary, #00699e)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px auto',
                        boxShadow: '0 4px 12px rgba(0, 105, 158, 0.15)'
                    }}>
                        <KeyRound size={28} color="#ffffff" />
                    </div>
                    <h2 className="fw-extrabold mb-1" style={{ tracking: '-0.04em', color: 'var(--color-text, #0f172a)', fontSize: '1.75rem' }}>KampusX Staff</h2>
                    <p className="text-muted small" style={{ fontSize: '0.88rem' }}>Masukkan PIN Akses POS Event untuk memulai Kios.</p>
                </div>

                <Card className="border-0 shadow-sm" style={{ borderRadius: '20px', backgroundColor: '#ffffff', border: '1px solid var(--color-border, #e2e8f0)' }}>
                    <Card.Body className="p-4 p-md-5">
                        {error && (
                            <Alert variant="danger" className="d-flex align-items-center gap-2 small border-0 text-danger bg-danger bg-opacity-10 py-3 mb-4 rounded-3">
                                <ShieldAlert size={18} className="flex-shrink-0" />
                                <span className="fw-semibold">{error}</span>
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold small text-secondary mb-2 uppercase" style={{ letterSpacing: '0.05em' }}>PIN Akses POS</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="CONTOH: A7B9Q0"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.toUpperCase())}
                                    maxLength={10}
                                    className="py-3 px-3 text-center fw-extrabold fs-4"
                                    style={{
                                        letterSpacing: '5px',
                                        backgroundColor: 'var(--color-bg-2, #f1f5f9)',
                                        borderColor: '#cbd5e1',
                                        color: 'var(--color-primary, #00699e)',
                                        borderRadius: '12px'
                                    }}
                                    autoFocus
                                    disabled={isLoading}
                                />
                            </Form.Group>

                            <Button
                                type="submit"
                                className="w-100 py-3 fw-bold rounded-3 border-0 d-flex align-items-center justify-content-center gap-2"
                                style={{ 
                                    backgroundColor: 'var(--color-primary, #00699e)', 
                                    color: '#ffffff',
                                    fontSize: '0.95rem',
                                    boxShadow: '0 4px 12px rgba(0, 105, 158, 0.15)',
                                    transition: 'all 0.2s'
                                }}
                                disabled={isLoading || !pin.trim()}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bahama-blue-800, #075985)'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary, #00699e)'}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner animation="border" size="sm" />
                                        <span>Memverifikasi...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Masuk Sistem Staff</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>

                <div className="text-center mt-4">
                    <span className="text-muted small">Kembali ke </span>
                    <a href="/" className="fw-bold text-decoration-none" style={{ color: 'var(--color-primary, #00699e)' }}>Halaman Utama</a>
                </div>
            </Container>
        </div>
    );
};

export default StaffLogin;
