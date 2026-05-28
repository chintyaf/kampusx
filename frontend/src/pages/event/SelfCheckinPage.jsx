import React, { useState } from 'react';
import { Container, Card, Button, Spinner } from 'react-bootstrap';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, MapPin } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext';

const SelfCheckinPage = () => {
    const [searchParams] = useSearchParams();
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const token = searchParams.get('token');
    const type = searchParams.get('type') || 'check-in';
    
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    const handleCheckin = async () => {
        if (!token) {
            toast.error("Token QR tidak valid atau tidak ditemukan.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await api.post('/attendance/self-checkin', {
                token: token,
                type: type
            });
            
            if (res.data.success) {
                setIsSuccess(true);
                toast.success(res.data.message || 'Kehadiran berhasil dicatat!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal memverifikasi tiket atau kehadiran Anda.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <Toaster position="top-right" reverseOrder={false} />
            
            <Card className="shadow-sm border-0 rounded-4 w-100" style={{ maxWidth: '500px' }}>
                <Card.Body className="p-5 text-center">
                    {!isSuccess ? (
                        <>
                            <div className="mb-4">
                                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-4 shadow-sm">
                                    <MapPin size={56} className="text-primary" />
                                </div>
                            </div>
                            <h4 className="fw-bold mb-3">Presensi Mandiri</h4>
                            <p className="text-muted mb-4">
                                Anda akan melakukan <strong>{type === 'check-in' ? 'Check-in' : 'Check-out'}</strong> untuk kehadiran event ini. 
                                Pastikan Anda berada di lokasi yang tepat.
                            </p>
                            
                            <div className="bg-light rounded-3 p-3 my-4 text-start border">
                                <p className="mb-1 text-muted small">Status Akun:</p>
                                <p className="mb-2 fw-semibold d-flex align-items-center gap-2">
                                    <CheckCircle size={16} className="text-success" />
                                    Terkoneksi sebagai {user?.name || 'Peserta'}
                                </p>
                            </div>

                            <Button 
                                variant="primary" 
                                size="lg" 
                                className="w-100 rounded-pill fw-bold py-3 shadow"
                                onClick={handleCheckin}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner size="sm" className="me-2" /> Memproses...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={20} className="me-2 mb-1" />
                                        Konfirmasi Kehadiran
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="mb-4">
                                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-4 shadow-sm">
                                    <CheckCircle size={56} className="text-success" />
                                </div>
                            </div>
                            <h4 className="fw-bold mb-3">Presensi Berhasil!</h4>
                            <p className="text-muted mb-4">
                                Kehadiran Anda telah tersimpan di sistem.
                            </p>
                            <Button 
                                variant="outline-primary" 
                                className="w-100 rounded-pill fw-semibold mt-3"
                                onClick={() => navigate('/my-tickets')}
                            >
                                Lihat Tiket Saya
                            </Button>
                        </>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default SelfCheckinPage;
