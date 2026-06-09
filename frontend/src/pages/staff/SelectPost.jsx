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
        navigate('/staff/dashboard');
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/staff/login');
    };

    return (
        <div style={{ backgroundColor: 'var(--color-bg, #f8fafc)', minHeight: '100vh', padding: '40px 16px' }}>
            <Container style={{ maxWidth: '640px' }}>
                
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h4 className="fw-bold mb-0 text-dark">Pilih POS Kehadiran</h4>
                        {event && (
                            <span className="text-primary small fw-semibold" style={{ color: '#1A365D' }}>
                                Event: {event.title}
                            </span>
                        )}
                    </div>
                    <Button 
                        variant="outline-danger" 
                        className="rounded-pill px-3 py-1.5 small border-0 bg-transparent text-danger d-flex align-items-center gap-1.5"
                        onClick={handleLogout}
                    >
                        <LogOut size={16} />
                        <span>Keluar</span>
                    </Button>
                </div>

                {error && <Alert variant="warning" className="rounded-3 mb-4 small py-2">{error}</Alert>}

                {isLoading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="text-muted mt-3 small">Memuat daftar POS aktif...</p>
                    </div>
                ) : stations.length === 0 ? (
                    <Alert variant="warning" className="rounded-3 shadow-sm py-4 text-center">
                        <MapPin size={32} className="text-warning mb-2" />
                        <h5>Tidak Ada POS Aktif</h5>
                        <p className="text-muted small mb-0">Event ini belum memiliki POS / Station check-in aktif. Silakan hubungi Organizer untuk menambahkan POS terlebih dahulu.</p>
                    </Alert>
                ) : (
                    <Row className="g-3">
                        {stations.map((station) => (
                            <Col xs={12} key={station.id}>
                                <Card 
                                    className="border-0 shadow-sm rounded-4 cursor-pointer hover-card" 
                                    onClick={() => handleSelectStation(station)}
                                    style={{
                                        borderRadius: '16px',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.06)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                                    }}
                                >
                                    <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center gap-3">
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '12px',
                                                backgroundColor: '#e6fffa',
                                                color: '#0d9488',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden',
                                                flexShrink: 0
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
                                                <h5 className="fw-bold mb-0 text-dark">{station.name}</h5>
                                                <span className="text-muted small">{station.description || 'Tidak ada deskripsi'}</span>
                                            </div>
                                        </div>
                                        <ArrowRight size={18} className="text-secondary" />
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}

            </Container>
        </div>
    );
};

export default SelectPost;
