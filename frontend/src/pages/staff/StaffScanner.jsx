import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Badge, Spinner } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../api/axios';
import { Html5Qrcode } from 'html5-qrcode';

const StaffScanner = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const scanMode = searchParams.get('mode') || 'in';

    const [qrInput, setQrInput] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanLock, setScanLock] = useState(false);
    
    const html5QrCodeRef = useRef(null);
    const scanLockRef = useRef(scanLock);

    const [station] = useState(JSON.parse(localStorage.getItem('staff_selected_pos') || 'null'));
    const [pin] = useState(localStorage.getItem('staff_pin'));

    useEffect(() => { scanLockRef.current = scanLock; }, [scanLock]);

    useEffect(() => {
        if (!station || !pin) {
            navigate('/staff/login');
            return;
        }

        const timer = setTimeout(() => {
            const scanner = new Html5Qrcode("reader");
            html5QrCodeRef.current = scanner;

            scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: (width, height) => ({ width: Math.min(width, height) * 0.7, height: Math.min(width, height) * 0.7 }) },
                (decodedText) => {
                    if (scanLockRef.current) return;
                    processQrCode(decodedText);
                },
                () => {} 
            ).catch(err => {
                navigate('/staff/scan-result', { state: { feedback: { type: 'error', message: 'Gagal akses kamera.' } }});
            });
        }, 100);

        return () => {
            clearTimeout(timer);
            if (html5QrCodeRef.current?.isScanning) {
                html5QrCodeRef.current.stop().catch(() => {});
            }
        };
        // eslint-disable-next-line
    }, []);

    const processQrCode = async (qrString) => {
        if (!qrString.trim() || scanLockRef.current) return;
        setScanLock(true);
        setIsScanning(true);

        try {
            const response = await api.post('/v1/staff/scan', {
                qr_string: qrString.trim(),
                post_id: station.id,
                pos_pin: pin,
                scan_type: scanMode
            });
            
            navigate('/staff/scan-result', { state: { feedback: { 
                type: 'success', 
                message: response.data.message, 
                attendee: response.data.attendee 
            }}});
        } catch (err) {
            navigate('/staff/scan-result', { state: { feedback: { 
                type: 'error', 
                message: err.response?.data?.message || 'Kode QR tidak valid.' 
            }}});
        }
    };

    return (
        <div style={{ height: '100vh', backgroundColor: '#000', display: 'flex', flexDirection: 'column' }}>
            <div className="p-3 d-flex justify-content-between text-white position-absolute w-100" style={{ zIndex: 10, background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
                <Button variant="link" className="text-white p-0" onClick={() => navigate('/staff/dashboard')}><ArrowLeft size={28} /></Button>
                <Badge bg={scanMode === 'in' ? 'primary' : 'danger'} className="px-4 py-2 fs-6 rounded-pill text-uppercase">MODE: {scanMode}</Badge>
                <div style={{ width: 28 }}></div>
            </div>

            <div className="flex-grow-1 position-relative d-flex align-items-center justify-content-center bg-dark">
                <div id="reader" className="w-100" style={{ maxWidth: 600 }}></div>
                {scanLock && (
                    <div className="position-absolute top-0 bottom-0 w-100 d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-75 z-3">
                        <Spinner animation="border" variant="primary" className="mb-3" />
                        <h5 className="fw-bold">Memproses QR...</h5>
                    </div>
                )}
            </div>

            <div className="p-4 bg-white rounded-top-4 shadow-lg position-relative" style={{ marginTop: -20, zIndex: 10 }}>
                <Form onSubmit={(e) => { e.preventDefault(); processQrCode(qrInput); }} className="d-flex gap-2">
                    <Form.Control type="text" placeholder="Input manual..." value={qrInput} onChange={(e) => setQrInput(e.target.value)} disabled={isScanning} className="py-3 px-4 rounded-pill bg-light border-0" />
                    <Button type="submit" disabled={isScanning || !qrInput.trim()} className="px-4 border-0 rounded-pill fw-bold" style={{ backgroundColor: '#1A365D' }}>Cek</Button>
                </Form>
            </div>
        </div>
    );
};
export default StaffScanner;