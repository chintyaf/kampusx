import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import QRCode from 'react-qr-code';
import { Maximize, X } from 'lucide-react';
import api from '@/api/axios';
import { notify } from '@/utils/notify';

export default function VenueQrModal({ show, onHide, eventId, eventTitle }) {
    const [qrData, setQrData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fullScreen, setFullScreen] = useState(false);
    const [linkType, setLinkType] = useState('in');

    useEffect(() => {
        if (show && eventId) {
            fetchVenueQr();
        } else {
            setQrData(null);
            setFullScreen(false);
            setLinkType('in');
        }
    }, [show, eventId, linkType]);

    const fetchVenueQr = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/event-dashboard/${eventId}/venue-qr?type=${linkType}`);
            if (res.data?.success) {
                // Buat URL lengkap yang mengarah ke /attend-venue
                const { event_id, signature, type } = res.data.data;
                const url = `${window.location.origin}/attend-venue?event_id=${event_id}&type=${type}&signature=${signature}`;
                setQrData(url);
            }
        } catch (err) {
            console.error('Failed to fetch Venue QR:', err);
            notify('error', 'Gagal', 'Gagal mengambil data QR Venue.');
            onHide();
        } finally {
            setLoading(false);
        }
    };

    const handleFullScreen = () => {
        setFullScreen(!fullScreen);
        // Optional: you can use document.documentElement.requestFullscreen() 
        // to actually go fullscreen in the browser if desired.
    };

    return (
        <Modal 
            show={show} 
            onHide={onHide} 
            size={fullScreen ? "xl" : "lg"} 
            centered 
            fullscreen={fullScreen}
            contentClassName={fullScreen ? "bg-dark text-white" : ""}
        >
            <Modal.Header closeButton={!fullScreen} className={fullScreen ? "border-0" : ""}>
                {!fullScreen && (
                    <Modal.Title className="fw-bold">
                        QR Kehadiran Onsite: {eventTitle}
                    </Modal.Title>
                )}
            </Modal.Header>
            <Modal.Body className="d-flex flex-column align-items-center justify-content-center text-center p-5">
                {loading ? (
                    <div className="py-5">
                        <Spinner animation="border" variant={fullScreen ? "light" : "primary"} />
                        <p className="mt-3">Menghasilkan QR Code...</p>
                    </div>
                ) : qrData ? (
                    <>
                        <div className="mb-4">
                            <h2 className={fullScreen ? "text-white mb-2" : "text-dark mb-2 fw-bold"}>
                                Scan untuk {linkType === 'in' ? 'Hadir' : 'Selesai (Check-out)'}
                            </h2>
                            <p className={fullScreen ? "text-light fs-4" : "text-muted"}>
                                Gunakan kamera HP Anda untuk scan QR Code di bawah ini.
                            </p>
                            
                            {!fullScreen && (
                                <ToggleButtonGroup type="radio" name="qrLinkType" value={linkType} onChange={(val) => setLinkType(val)} className="mt-2 shadow-sm">
                                    <ToggleButton id="qr-tbg-btn-1" value="in" variant={linkType === 'in' ? 'primary' : 'outline-primary'} className="fw-semibold px-3">
                                        Check-in
                                    </ToggleButton>
                                    <ToggleButton id="qr-tbg-btn-2" value="out" variant={linkType === 'out' ? 'primary' : 'outline-primary'} className="fw-semibold px-3">
                                        Check-out
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            )}
                        </div>
                        
                        <div className="bg-white p-4 rounded-4 shadow-sm" style={{ display: 'inline-block' }}>
                            <QRCode
                                value={qrData}
                                size={fullScreen ? 500 : 350}
                                level="H"
                            />
                        </div>

                        {fullScreen && (
                            <Button 
                                variant="outline-light" 
                                size="lg" 
                                className="mt-5 rounded-pill px-4"
                                onClick={handleFullScreen}
                            >
                                <X size={20} className="me-2" /> Tutup Layar Penuh
                            </Button>
                        )}
                    </>
                ) : (
                    <p className="text-danger">Gagal memuat QR Code.</p>
                )}
            </Modal.Body>
            {!fullScreen && (
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Tutup
                    </Button>
                    <Button variant="primary" onClick={handleFullScreen} disabled={loading}>
                        <Maximize size={18} className="me-2" />
                        Tampilkan Layar Penuh
                    </Button>
                </Modal.Footer>
            )}
        </Modal>
    );
}
