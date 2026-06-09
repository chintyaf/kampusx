import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { CheckCircle2, AlertTriangle, Keyboard } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

const KioskScanner = ({ brandColor, isAttendance, feedback, isScanning, scanLock, onScan }) => {
    const [manualInput, setManualInput] = useState('');
    const html5QrCodeRef = useRef(null);
    const scanLockRef = useRef(scanLock);

    useEffect(() => {
        scanLockRef.current = scanLock;
    }, [scanLock]);

    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                const scanner = new Html5Qrcode("kiosk-reader");
                html5QrCodeRef.current = scanner;

                scanner.start(
                    { facingMode: "environment" },
                    { 
                        fps: 10, 
                        qrbox: (width, height) => {
                            const size = Math.min(width, height) * 0.75;
                            return { width: size, height: size };
                        } 
                    },
                    (decodedText) => {
                        if (scanLockRef.current) return;
                        onScan(decodedText);
                    },
                    () => {} 
                ).catch(err => {
                    console.error("Gagal memulai kamera scanner:", err);
                });
            } catch (e) {
                console.error("Inisialisasi Html5Qrcode gagal:", e);
            }
        }, 300);

        return () => {
            clearTimeout(timer);
            if (html5QrCodeRef.current?.isScanning) {
                html5QrCodeRef.current.stop().catch(err => console.error("Gagal menghentikan kamera:", err));
            }
        };
        // eslint-disable-next-line
    }, [onScan]);

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!manualInput.trim()) return;
        onScan(manualInput.trim());
        setManualInput('');
    };

    return (
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '20px', border: '1px solid var(--color-border, #cbd5e1)' }}>
            <Card.Body className="p-4 d-flex flex-column align-items-center justify-content-center">
                <div 
                    className="position-relative overflow-hidden w-100 d-flex align-items-center justify-content-center bg-black shadow-sm"
                    style={{ 
                        borderRadius: '20px', 
                        aspectRatio: '1',
                        maxHeight: '320px',
                        maxWidth: '320px',
                        border: `4px solid ${brandColor}`
                    }}
                >
                    {/* QR Scanner Container */}
                    <div id="kiosk-reader" className="w-100 h-100"></div>

                    {/* Scanner Laser Guiding Border */}
                    <div 
                        className="position-absolute"
                        style={{
                            top: '15%',
                            left: '15%',
                            right: '15%',
                            bottom: '15%',
                            border: '3px dashed var(--color-primary, #00699e)',
                            borderRadius: '16px',
                            pointerEvents: 'none',
                            opacity: 0.6
                        }}
                    />

                    {/* Scanning Laser Animation line */}
                    {!feedback && (
                        <div 
                            className="position-absolute w-100" 
                            style={{ 
                                height: '3px', 
                                background: 'linear-gradient(to right, transparent, var(--color-primary, #00699e), transparent)',
                                boxShadow: '0 0 8px var(--color-primary, #00699e)',
                                animation: 'scan-anim 2.2s infinite ease-in-out',
                                top: 0
                            }}
                        />
                    )}

                    {/* Flat Feedback Card Overlay */}
                    {feedback && (
                        <div 
                            className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center p-3"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                zIndex: 10,
                                animation: 'fadeIn 0.2s ease-out'
                            }}
                        >
                            <div 
                                className="p-3 w-100 text-center"
                                style={{
                                    borderRadius: '16px',
                                    backgroundColor: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
                                    border: `2.5px solid ${feedback.type === 'success' ? '#10b981' : '#ef4444'}`,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                }}
                            >
                                <div className="d-flex justify-content-center mb-2">
                                    {feedback.type === 'success' ? (
                                        <CheckCircle2 size={38} className="text-success" />
                                    ) : (
                                        <AlertTriangle size={38} className="text-danger" />
                                    )}
                                </div>
                                <h5 className="fw-extrabold mb-1" style={{ color: feedback.type === 'success' ? '#065f46' : '#991b1b', tracking: '-0.02em', fontSize: '1.1rem' }}>
                                    {feedback.type === 'success' ? 'Berhasil' : 'Gagal'}
                                </h5>
                                <p className="fw-bold mb-0" style={{ color: feedback.type === 'success' ? '#166534' : '#991b1b', fontSize: '0.85rem', lineHeight: '1.4' }}>
                                    {feedback.message}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                <p className="text-muted small mt-3 mb-3 text-center">
                    Arahkan tiket QR Code milik peserta ke arah kamera.
                </p>

                {/* Manual Fallback Input Form */}
                <div className="w-100 pt-2" style={{ borderTop: '1px solid #f1f5f9' }}>
                    <Form onSubmit={handleManualSubmit} className="d-flex gap-2">
                        <Form.Control 
                            type="text" 
                            placeholder="Input Kode Tiket..." 
                            value={manualInput} 
                            onChange={(e) => setManualInput(e.target.value.toUpperCase())} 
                            disabled={isScanning} 
                            className="py-2 px-3 bg-light text-dark border" 
                            style={{
                                borderColor: '#cbd5e1',
                                borderRadius: '8px',
                                fontSize: '0.85rem'
                            }}
                        />
                        <Button 
                            type="submit" 
                            disabled={isScanning || !manualInput.trim()} 
                            className="px-3 fw-bold border-0 text-white d-flex align-items-center gap-1" 
                            style={{ 
                                backgroundColor: brandColor,
                                borderRadius: '8px',
                                fontSize: '0.85rem'
                            }}
                        >
                            <Keyboard size={14} />
                            <span>Cek</span>
                        </Button>
                    </Form>
                </div>
            </Card.Body>
        </Card>
    );
};

export default KioskScanner;
