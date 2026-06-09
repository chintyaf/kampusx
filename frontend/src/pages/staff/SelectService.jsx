import React, { useState, useEffect } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Users, Sparkles, KeyRound, ArrowRight, LogOut, MapPin } from 'lucide-react';

const SelectService = () => {
    const [event, setEvent] = useState(null);
    const [station, setStation] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedPin = localStorage.getItem('staff_pin');
        const storedEvent = localStorage.getItem('staff_event');
        const storedPos = localStorage.getItem('staff_selected_pos');

        if (!storedPin || !storedEvent) {
            localStorage.clear();
            navigate('/staff/login');
            return;
        }

        if (!storedPos) {
            navigate('/staff/select-post');
            return;
        }

        try {
            setEvent(JSON.parse(storedEvent));
            setStation(JSON.parse(storedPos));
        } catch (e) {
            console.error('Failed to parse staff localStorage data:', e);
        }
    }, [navigate]);

    const handleSelectMode = (mode) => {
        localStorage.setItem('staff_mode', mode);
        navigate('/staff/dashboard');
    };

    const handleBackToPostSelection = () => {
        localStorage.removeItem('staff_selected_pos');
        localStorage.removeItem('staff_mode');
        navigate('/staff/select-post');
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/staff/login');
    };

    return (
        <div style={{ 
            backgroundColor: 'var(--color-bg, #f4f5f7)', 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            padding: '40px 16px' 
        }}>
            <Container style={{ maxWidth: '640px' }}>
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
                    <h2 className="fw-extrabold mb-1 text-dark" style={{ tracking: '-0.04em', fontSize: '1.75rem' }}>Pilih Layanan Staff</h2>
                    {event && station && (
                        <p className="text-muted small mb-0" style={{ fontSize: '0.88rem' }}>
                            POS: <strong style={{ color: 'var(--color-primary, #00699e)' }}>{station.name}</strong> ({event.title})
                        </p>
                    )}
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

                <div className="text-center mt-5 d-flex gap-3 justify-content-center">
                    <Button 
                        variant="link" 
                        className="text-muted small text-decoration-none fw-semibold"
                        onClick={handleBackToPostSelection}
                    >
                        Ganti POS
                    </Button>
                    <div style={{ width: '1px', backgroundColor: '#cbd5e1', alignSelf: 'stretch' }} />
                    <Button 
                        variant="link" 
                        className="text-danger small text-decoration-none fw-semibold"
                        onClick={handleLogout}
                    >
                        Keluar
                    </Button>
                </div>
            </Container>
        </div>
    );
};

export default SelectService;
