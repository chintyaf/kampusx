import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, LogOut } from 'lucide-react';
import api from '../../api/axios';
import { STORAGE_URL } from '@/api/storage';

const SelectPost = () => {
    const [event, setEvent] = useState(null);
    const [stations, setStations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedPin = localStorage.getItem('staff_pin');
        const storedEvent = localStorage.getItem('staff_event');

        if (!storedPin || !storedEvent) {
            localStorage.clear();
            navigate('/staff/login');
            return;
        }

        try {
            setEvent(JSON.parse(storedEvent));
        } catch (e) {
            console.error('Failed to parse staff localStorage data:', e);
        }

        const fetchFreshStations = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.post('/v1/staff/verify-pin', { pin: storedPin });
                if (response.data.success) {
                    const activeStations = response.data.stations || [];
                    setStations(activeStations);
                    localStorage.setItem('staff_stations', JSON.stringify(activeStations));
                } else {
                    setError(response.data.message || 'Gagal memuat POS.');
                }
            } catch (err) {
                console.error('Failed to fetch fresh stations:', err);
                setError('Gagal memperbarui daftar POS. Menampilkan data offline.');
                
                // Fallback to local storage
                const storedStations = localStorage.getItem('staff_stations');
                if (storedStations) {
                    try {
                        setStations(JSON.parse(storedStations));
                    } catch (e) {
                        console.error('Failed to parse fallback stations:', e);
                    }
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchFreshStations();
    }, [navigate]);

    const handleSelectStation = (station) => {
        localStorage.setItem('staff_selected_pos', JSON.stringify(station));
        navigate('/staff/select-service');
    };

    const handleBackToModeSelection = () => {
        localStorage.clear();
        navigate('/staff/login');
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/staff/login');
    };

    return (
        <div style={{ 
            backgroundColor: 'var(--color-bg, #f4f5f7)', 
            minHeight: '100vh', 
            padding: '40px 16px',
            color: 'var(--color-text, #0f172a)'
        }}>
            <Container style={{ maxWidth: '640px' }}>
                
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3" style={{ borderBottom: '1px solid var(--color-border, #e2e8f0)' }}>
                    <div>
                        <h4 className="fw-extrabold mb-1 text-dark" style={{ tracking: '-0.03em' }}>Pilih Stasiun / POS</h4>
                        {event && (
                            <span className="text-muted small fw-semibold">
                                Event: <strong style={{ color: 'var(--color-primary, #00699e)' }}>{event.title}</strong>
                            </span>
                        )}
                    </div>
                    <div className="d-flex gap-2">
                        <Button 
                            variant="outline-secondary" 
                            className="rounded-pill px-3 py-1.5 small border-0 bg-transparent text-secondary d-flex align-items-center gap-1.5 fw-bold"
                            style={{ backgroundColor: 'rgba(100, 116, 139, 0.05)', fontSize: '0.85rem' }}
                            onClick={handleBackToModeSelection}
                        >
                            <span>Kembali</span>
                        </Button>
                        <Button 
                            variant="outline-danger" 
                            className="rounded-pill px-3 py-1.5 small border-0 bg-transparent text-danger d-flex align-items-center gap-1.5 fw-bold"
                            style={{ backgroundColor: 'rgba(220, 38, 38, 0.05)', fontSize: '0.85rem' }}
                            onClick={handleLogout}
                        >
                            <LogOut size={15} />
                            <span>Keluar</span>
                        </Button>
                    </div>
                </div>

                {error && <Alert variant="warning" className="rounded-3 mb-4 small border-0 text-warning bg-warning bg-opacity-10 py-2.5">{error}</Alert>}

                {isLoading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" style={{ color: 'var(--color-primary, #00699e)' }} />
                        <p className="text-muted mt-3 small">Memuat daftar POS aktif...</p>
                    </div>
                ) : stations.length === 0 ? (
                    <Alert variant="warning" className="rounded-3 py-4 text-center border-0 bg-warning bg-opacity-5">
                        <MapPin size={40} className="text-warning mb-2 opacity-75" />
                        <h5 className="fw-bold mb-1">Tidak Ada POS Aktif</h5>
                        <p className="text-muted small mb-0">Event ini belum memiliki POS / Station check-in aktif.</p>
                    </Alert>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {stations.map((station) => (
                            <div key={station.id}>
                                <Card 
                                    className="border-0 shadow-sm cursor-pointer" 
                                    onClick={() => handleSelectStation(station)}
                                    style={{
                                        borderRadius: '16px',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid var(--color-border, #cbd5e1)',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.borderColor = 'var(--color-primary, #00699e)';
                                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.05)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.borderColor = 'var(--color-border, #cbd5e1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center gap-3">
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '12px',
                                                backgroundColor: 'var(--color-bg-2, #f1f5f9)',
                                                color: 'var(--color-primary, #00699e)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden',
                                                flexShrink: 0,
                                                border: '1px solid var(--color-border, #cbd5e1)'
                                            }}>
                                                {station.photo_path ? (
                                                    <img 
                                                        src={`${STORAGE_URL}/${station.photo_path}`} 
                                                        alt={station.name} 
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <MapPin size={24} />
                                                )}
                                            </div>
                                            <div>
                                                <h5 className="fw-bold mb-1 text-dark" style={{ fontSize: '1.05rem' }}>{station.name}</h5>
                                                <span className="text-muted small" style={{ fontSize: '0.82rem' }}>{station.description || 'Stasiun operasional event'}</span>
                                            </div>
                                        </div>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            backgroundColor: 'var(--color-bg, #f8fafc)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--color-secondary, #64748b)',
                                            border: '1px solid var(--color-border, #cbd5e1)'
                                        }}>
                                            <ArrowRight size={16} />
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}

            </Container>
        </div>
    );
};

export default SelectPost;
