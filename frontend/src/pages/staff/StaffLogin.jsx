import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, KeyRound } from 'lucide-react';
import api from '../../api/axios';

const StaffLogin = () => {
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Redirect if already logged in as staff
    useEffect(() => {
        const storedPin = localStorage.getItem('staff_pin');
        const storedPos = localStorage.getItem('staff_selected_pos');
        if (storedPin) {
            if (storedPos) {
                navigate('/staff/dashboard');
            } else {
                navigate('/staff/select-post');
            }
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!pin.trim()) {
            setError('Silakan masukkan PIN akses terlebih dahulu.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post('/v1/staff/verify-pin', { pin });
            if (response.data.success) {
                localStorage.setItem('staff_pin', pin);
                localStorage.setItem('staff_event', JSON.stringify(response.data.event));
                localStorage.setItem('staff_stations', JSON.stringify(response.data.stations));
                navigate('/staff/select-post');
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

    return (
        <div style={{ backgroundColor: 'var(--color-bg, #f8fafc)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <Container style={{ maxWidth: '420px' }}>
                <div className="text-center mb-4">
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '16px',
                        backgroundColor: '#1A365D',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px auto',
                        boxShadow: '0 4px 12px rgba(26, 54, 93, 0.2)'
                    }}>
                        <KeyRound size={28} color="#ffffff" />
                    </div>
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--color-text, #0f172a)' }}>KampusX Staff</h2>
                    <p className="text-muted small">Masukkan PIN Akses POS yang digenerate oleh Organizer.</p>
                </div>

                <Card className="border-0 shadow-sm rounded-4" style={{ borderRadius: '16px' }}>
                    <Card.Body className="p-4">
                        {error && (
                            <Alert variant="danger" className="d-flex align-items-center gap-2 small py-2.5 mb-4">
                                <ShieldAlert size={16} className="flex-shrink-0" />
                                <span>{error}</span>
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-semibold small text-secondary">PIN Akses POS</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Masukkan PIN Event"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    maxLength={10}
                                    className="py-3 px-3 border rounded-3 text-center fw-bold fs-4"
                                    style={{
                                        letterSpacing: '4px',
                                        borderColor: 'var(--color-border, #e2e8f0)',
                                        color: '#1A365D'
                                    }}
                                    autoFocus
                                    disabled={isLoading}
                                />
                            </Form.Group>

                            <Button
                                type="submit"
                                className="w-100 py-3 fw-bold rounded-3 border-0"
                                style={{ backgroundColor: '#1A365D', color: '#ffffff' }}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Memverifikasi...
                                    </>
                                ) : (
                                    'Masuk Sistem Staff'
                                )}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>

                <div className="text-center mt-4">
                    <span className="text-muted small">Kembali ke </span>
                    <a href="/" className="fw-semibold text-decoration-none" style={{ color: '#1A365D' }}>Halaman Utama</a>
                </div>
            </Container>
        </div>
    );
};

export default StaffLogin;
