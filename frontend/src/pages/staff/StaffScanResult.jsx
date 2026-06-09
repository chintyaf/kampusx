import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, AlertCircle, UserCheck } from 'lucide-react';

const StaffScanResult = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Menerima data dari halaman Scanner
    const feedback = location.state?.feedback;

    if (!feedback) {
        // Jika diakses langsung tanpa scan, kembalikan ke dashboard
        navigate('/staff/dashboard');
        return null;
    }

    const isSuccess = feedback.type === 'success';

    return (
        <div style={{ minHeight: '100vh', backgroundColor: isSuccess ? '#f0fdf4' : '#fef2f2', display: 'flex', flexDirection: 'column' }}>
            <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center p-4 text-center">
                {isSuccess ? <CheckCircle2 size={100} className="text-success mb-4" /> : <AlertCircle size={100} className="text-danger mb-4" />}
                
                <h2 className="fw-bold text-dark mb-2">{isSuccess ? 'Scan Berhasil!' : 'Ditolak / Gagal'}</h2>
                <p className="text-muted mb-4 fs-5">{feedback.message}</p>

                {feedback.attendee && (
                    <Card className="border-0 shadow-sm rounded-4 w-100" style={{ maxWidth: 400 }}>
                        <Card.Body className="p-4 text-start">
                            <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <UserCheck size={24} className="text-secondary" />
                                </div>
                                <div className="overflow-hidden">
                                    <h5 className="fw-bold mb-1 text-truncate">{feedback.attendee.name}</h5>
                                    <span className="text-muted small text-truncate d-block">{feedback.attendee.email}</span>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted small fw-semibold">Kode Tiket:</span>
                                <Badge bg="light" text="dark" className="border px-3 py-2 fs-6">{feedback.attendee.code}</Badge>
                            </div>
                        </Card.Body>
                    </Card>
                )}
            </div>

            <div className="p-4 bg-white border-top shadow-lg">
                <Button variant="dark" size="lg" className="w-100 rounded-pill fw-bold py-3" onClick={() => navigate('/staff/dashboard')}>
                    Kembali ke Dashboard
                </Button>
            </div>
        </div>
    );
};
export default StaffScanResult;