import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { Keyboard, Camera, CameraOff } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

const KioskScanner = ({ brandColor, isAttendance, isScanning, scanLock, onScan }) => {
    const [manualInput, setManualInput] = useState('');
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const html5QrCodeRef = useRef(null);
    const scannerOperationsRef = useRef(Promise.resolve());
    const scanLockRef = useRef(scanLock);
    
    // Store onScan in a ref to avoid triggering camera restarts on function reference changes
    const onScanRef = useRef(onScan);
    useEffect(() => {
        onScanRef.current = onScan;
    }, [onScan]);

    useEffect(() => {
        scanLockRef.current = scanLock;
    }, [scanLock]);

    // Track responsive layout resize
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Helper to queue async operations sequentially
    const queueOperation = (opFn) => {
        scannerOperationsRef.current = scannerOperationsRef.current
            .then(opFn)
            .catch(err => {
                console.error("Scanner operation failed:", err);
            });
    };

    // Instantiate once on mount
    useEffect(() => {
        try {
            const scanner = new Html5Qrcode("kiosk-reader");
            html5QrCodeRef.current = scanner;
        } catch (e) {
            console.error("Gagal menginisialisasi Html5Qrcode:", e);
        }

        return () => {
            // Stop scanner on unmount
            queueOperation(() => {
                const scanner = html5QrCodeRef.current;
                if (scanner && scanner.isScanning) {
                    return scanner.stop().then(() => {
                        html5QrCodeRef.current = null;
                    });
                }
            });
        };
    }, []);

    // Handle camera toggle (start/stop)
    useEffect(() => {
        if (isCameraOn) {
            queueOperation(() => {
                const scanner = html5QrCodeRef.current;
                if (!scanner || scanner.isScanning) return;
                
                // Add a small delay (150ms) to ensure the DOM node is fully layouted and visible
                return new Promise((resolve) => setTimeout(resolve, 150))
                    .then(() => {
                        const activeScanner = html5QrCodeRef.current;
                        if (!activeScanner || activeScanner.isScanning) return;
                        
                        return activeScanner.start(
                            { facingMode: "environment" },
                            { 
                                fps: 10,
                                qrbox: isMobile ? { width: 200, height: 200 } : { width: 250, height: 250 },
                                aspectRatio: isMobile ? undefined : 1.0
                            },
                            (decodedText) => {
                                if (scanLockRef.current) return;
                                scanLockRef.current = true; // Synchronously lock immediately to prevent double scans
                                onScanRef.current(decodedText);
                            },
                            () => {} 
                        ).then(() => {
                            console.log("Scanner started successfully");
                        }).catch(err => {
                            console.error("Gagal memulai kamera:", err);
                        });
                    });
            });
        } else {
            queueOperation(() => {
                const scanner = html5QrCodeRef.current;
                if (!scanner || !scanner.isScanning) return;

                return scanner.stop().then(() => {
                    console.log("Scanner stopped successfully");
                }).catch(err => {
                    console.error("Gagal menghentikan kamera:", err);
                });
            });
        }
        // eslint-disable-next-line
    }, [isCameraOn]);

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!manualInput.trim()) return;
        onScan(manualInput.trim());
        setManualInput('');
    };

    return (
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '20px', border: '1px solid var(--color-border, #cbd5e1)' }}>
            <Card.Body className="p-3 p-md-4 d-flex flex-column align-items-center justify-content-center">
                <div 
                    className="position-relative overflow-hidden bg-black shadow-sm"
                    style={{ 
                        borderRadius: '20px', 
                        aspectRatio: isMobile ? 'auto' : '1',
                        height: isMobile ? '50vh' : '320px',
                        maxHeight: isMobile ? '450px' : '320px',
                        minHeight: isMobile ? '320px' : '320px',
                        width: '100%',
                        maxWidth: isMobile ? 'none' : '320px',
                        border: `4px solid ${brandColor}`
                    }}
                >
                    {/* QR Scanner Container */}
                    <div 
                        id="kiosk-reader" 
                        className="w-100 h-100" 
                    ></div>

                    {/* Camera Off Placeholder Overlay */}
                    {!isCameraOn && (
                        <div 
                            className="position-absolute w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white bg-dark p-4 animate-fade-in" 
                            style={{ zIndex: 5, borderRadius: '16px' }}
                        >
                            <CameraOff size={48} className="text-secondary mb-3" style={{ opacity: 0.6 }} />
                            <span className="mb-3 text-secondary fw-bold" style={{ fontSize: '0.95rem' }}>Kamera Dinonaktifkan</span>
                            <Button 
                                variant="light" 
                                size="sm" 
                                className="fw-bold px-3 py-2 border-0 d-flex align-items-center gap-2" 
                                onClick={() => setIsCameraOn(true)}
                                style={{ borderRadius: '10px', fontSize: '0.85rem', color: brandColor, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                            >
                                <Camera size={16} />
                                <span>Aktifkan Kamera</span>
                            </Button>
                        </div>
                    )}

                    {/* Scanner Laser Guiding Border */}
                    {/* {isCameraOn && (
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
                                opacity: 0.6,
                                zIndex: 2
                            }}
                        />
                    )} */}

                    {/* Scanning Laser Animation line */}
                    {isCameraOn && (
                        <div 
                            className="position-absolute w-100" 
                            style={{ 
                                height: '3px', 
                                background: 'linear-gradient(to right, transparent, var(--color-primary, #00699e), transparent)',
                                boxShadow: '0 0 8px var(--color-primary, #00699e)',
                                animation: 'scan-anim 2.2s infinite ease-in-out',
                                top: 0,
                                zIndex: 3
                            }}
                        />
                    )}
                </div>

                {isCameraOn && (
                    <Button 
                        variant="outline-danger" 
                        size="sm" 
                        className="mt-3 fw-bold px-3 border-0 bg-transparent text-danger d-flex align-items-center gap-1.5"
                        style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', fontSize: '0.8rem', borderRadius: '10px' }}
                        onClick={() => setIsCameraOn(false)}
                    >
                        <CameraOff size={14} />
                        <span>Matikan Kamera</span>
                    </Button>
                )}

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

            <style>{`
                #kiosk-reader video {
                    width: 100% !important;
                    /* Hapus height: 100% dan object-fit: cover */
                    border-radius: 16px !important;
                }
                #kiosk-reader {
                    border: none !important;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden;
                }
                .animate-fade-in {
                    animation: fadeIn 0.2s ease-out;
                }
            `}</style>
        </Card>
    );
};

export default KioskScanner;
