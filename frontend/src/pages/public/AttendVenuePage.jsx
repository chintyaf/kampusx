import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, Spinner, Button } from 'react-bootstrap';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext';

export default function AttendVenuePage() {
    const [status, setStatus] = useState('loading'); // loading, success, error, unauthenticated
    const [message, setMessage] = useState('Memproses kehadiran Anda...');
    const [pageType, setPageType] = useState('in'); // 'in' or 'out'
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        // Parse URL params
        const params = new URLSearchParams(location.search);
        const eventId = params.get('event_id');
        const signature = params.get('signature');
        const type = params.get('type') || 'in';
        setPageType(type);

        if (!eventId || !signature) {
            setStatus('error');
            setMessage('Tautan tidak valid atau tidak lengkap.');
            return;
        }

        if (!isAuthenticated) {
            setStatus('unauthenticated');
            setMessage('Silakan login ke akun Anda untuk mencatat kehadiran.');
            return;
        }

        const processScan = async () => {
            try {
                const prefix = type === 'in' ? `venue_in_${eventId}` : `venue_out_${eventId}`;
                const response = await api.post('/attendance/venue-scan', {
                    event_id: eventId,
                    qr_string: `${prefix}.${signature}`
                });

                if (response.data?.success) {
                    setStatus('success');
                    setMessage(response.data.message || (type === 'out' ? 'Check-out berhasil dicatat. Terima kasih!' : 'Kehadiran berhasil dicatat! Selamat mengikuti acara.'));
                }
            } catch (err) {
                setStatus('error');
                if (err.response?.status === 409) {
                    setMessage('Anda sudah pernah melakukan check-in untuk acara ini.');
                } else if (err.response?.status === 403) {
                    setMessage(err.response?.data?.message || 'Waktu presensi belum dibuka atau sudah ditutup.');
                } else if (err.response?.status === 404) {
                    setMessage('Tiket tidak ditemukan atau belum lunas.');
                } else {
                    setMessage(err.response?.data?.message || 'Terjadi kesalahan saat memproses data.');
                }
            }
        };

        processScan();
    }, [location.search, isAuthenticated]);

    const handleLogin = () => {
        // Simpan URL saat ini untuk redirect setelah login
        const returnUrl = encodeURIComponent(location.pathname + location.search);
        navigate(`/login?return_to=${returnUrl}`);
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Card className="text-center shadow-lg border-0" style={{ maxWidth: '400px', width: '100%', borderRadius: '1rem' }}>
                <Card.Body className="p-5">
                    {status === 'loading' && (
                        <>
                            <Spinner animation="border" variant="primary" style={{ width: '4rem', height: '4rem' }} className="mb-4" />
                            <h4 className="fw-bold text-dark">Memproses Scan</h4>
                            <p className="text-muted">{message}</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="text-success mb-4 d-flex justify-content-center">
                                <CheckCircle size={80} strokeWidth={1.5} />
                            </div>
                            <h4 className="fw-bold text-dark">{pageType === 'out' ? 'Check-out Berhasil!' : 'Check-in Berhasil!'}</h4>
                            <p className="text-muted mb-4">{message}</p>
                            <Button variant="primary" className="w-100 rounded-pill px-4" onClick={() => navigate('/my-tickets')}>
                                Lihat Tiket Saya
                            </Button>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="text-danger mb-4 d-flex justify-content-center">
                                <XCircle size={80} strokeWidth={1.5} />
                            </div>
                            <h4 className="fw-bold text-dark">Gagal {pageType === 'out' ? 'Check-out' : 'Check-in'}</h4>
                            <p className="text-muted mb-4">{message}</p>
                            <Button variant="outline-secondary" className="w-100 rounded-pill px-4" onClick={() => navigate('/events')}>
                                Kembali ke Beranda
                            </Button>
                        </>
                    )}

                    {status === 'unauthenticated' && (
                        <>
                            <div className="text-info mb-4 d-flex justify-content-center">
                                <Info size={80} strokeWidth={1.5} />
                            </div>
                            <h4 className="fw-bold text-dark">Login Diperlukan</h4>
                            <p className="text-muted mb-4">{message}</p>
                            <Button variant="primary" className="w-100 rounded-pill px-4" onClick={handleLogin}>
                                Login / Daftar
                            </Button>
                        </>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}
