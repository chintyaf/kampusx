import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, LogOut } from 'lucide-react';

const SelectPost = () => {
    const [event, setEvent] = useState(null);
    const [stations, setStations] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedPin = localStorage.getItem('staff_pin');
        const storedEvent = localStorage.getItem('staff_event');
        const storedStations = localStorage.getItem('staff_stations');

        if (!storedPin || !storedEvent || !storedStations) {
            localStorage.clear();
            navigate('/staff/login');
            return;
        }

        try {
            setEvent(JSON.parse(storedEvent));
            setStations(JSON.parse(storedStations));
        } catch (e) {
            console.error('Failed to parse staff localStorage data:', e);
            localStorage.clear();
            navigate('/staff/login');
        }
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

                {stations.length === 0 ? (
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
                                                justifyContent: 'center'
                                            }}>
                                                <MapPin size={24} />
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
