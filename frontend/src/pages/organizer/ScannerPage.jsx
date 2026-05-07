import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Tabs, Tab, Modal } from 'react-bootstrap';
import { Camera, Search, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';

const ScannerPage = () => {
    const [manualInput, setManualInput] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [scannedData, setScannedData] = useState(null);

    // Initial QR Scanner setup
    useEffect(() => {
        // Hindari error re-render di React Strict Mode dengan membersihkan DOM terlebih dahulu.
        const scannerId = "qr-reader";
        let scanner = new Html5QrcodeScanner(scannerId, { 
            qrbox: { width: 250, height: 250 }, 
            fps: 5 
        });
        
        scanner.render(
            (result) => {
                console.log("QR Scanned Result: ", result);
                scanner.clear(); // Hentikan scan sementara saat memproses
                handleScanSuccess(result, 'qr');
            },
            (err) => {
                // Jangan log setiap error karena saat iddle akan terus memberi error "no QR found"
                // console.log("Scanning...", err);
            }
        );

        return () => {
            scanner.clear().catch(error => console.error("Failed to clear html5-qrcode scanner", error));
        };
    }, []);

    const EVENT_ID = 1; // Dummy Event ID untuk testing Happy Path

    const handleScanSuccess = async (data, method = 'qr') => {
        try {
            let res;
            if (method === 'qr') {
                res = await axios.post('/api/attendance/scan', { qr_string: data, event_id: EVENT_ID });
            } else {
                // Manual menggunakan ticket_id
                res = await axios.post('/api/attendance/manual', { ticket_id: parseInt(data), event_id: EVENT_ID });
            }

            if (res.data.success) {
                const acquiredTicketId = res.data.ticket_id || (method === 'qr' ? null : parseInt(data));
                setScannedData({ data, method, ticket_id: acquiredTicketId });
                toast.success(res.data.message || 'Validasi berhasil! Tiket orisinil.');
                setShowModal(true); // Memanggil UI Engagement Checkpoint
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Tiket tidak valid atau sudah di-scan!', {
                icon: <AlertCircle className="text-danger" />,
                style: { borderRadius: '10px', background: '#333', color: '#fff' }
            });
        }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!manualInput.trim()) return;
        
        try {
            // Hit backend search
            const res = await axios.get(`/api/ticket/search?q=${manualInput}`);
            if (res.data.data && res.data.data.length > 0) {
                const ticket = res.data.data[0]; // Auto pilih hasil pertama untuk demo
                handleScanSuccess(ticket.id.toString(), 'manual');
            } else {
                toast.error("Tiket atau Nama tidak ditemukan");
            }
        } catch (error) {
            toast.error("Gagal melakukan pencarian manual");
        }
        setManualInput('');
    };

    const handleClaimAttendance = async () => {
        setShowModal(false);
        try {
            // Kita butuh ticket_id. Jika scan QR, kita ambil ticket ID dari endpoint atau asumsikan 1 untuk demo ini
            // Di sistem nyata, backend `scanQr` dapat mereturn `ticket_id` agar frontend bisa meneruskan ke klaim poin.
            const targetTicketId = scannedData?.ticket_id || 1; 

            const res = await axios.post('/api/engagement/claim', {
                ticket_id: targetTicketId,
                event_id: EVENT_ID
            });

            toast.success(res.data.message || "Poin Kehadiran berhasil diklaim!", {
                icon: <CheckCircle className="text-success" />,
                style: { borderRadius: '10px', background: '#333', color: '#fff' }
            });
        } catch (error) {
            toast.error(error.response?.data?.message || "Gagal melakukan klaim poin", {
                icon: <AlertCircle className="text-danger" />,
                style: { borderRadius: '10px', background: '#333', color: '#fff' }
            });
        }
        setScannedData(null);
    };

    return (
        <Container className="py-5" style={{ maxWidth: '600px' }}>
            {/* UI Feedback System via react-hot-toast */}
            <Toaster position="top-right" reverseOrder={false} />
            
            <h3 className="mb-4 text-center fw-bold text-primary">Event Scanner Panel</h3>
            
            <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
                <Card.Body className="p-0">
                    <Tabs defaultActiveKey="qr" id="scanner-tabs" className="nav-justified border-bottom-0" fill>
                        
                        {/* TAB: QR Scanner Core Layout */}
                        <Tab eventKey="qr" title={<span className="py-2 d-inline-block"><Camera size={18} className="me-2 mb-1"/> SCAN QR</span>}>
                            <div className="text-center p-4 bg-light">
                                <div id="qr-reader" className="mx-auto rounded-3 border-0 bg-white shadow-sm overflow-hidden" style={{ maxWidth: '100%' }}></div>
                                <p className="text-muted mt-4 small mb-0">Arahkan kamera ke QR Code tiket peserta</p>
                            </div>
                        </Tab>

                        {/* TAB: Manual Override Layout */}
                        <Tab eventKey="manual" title={<span className="py-2 d-inline-block"><Search size={18} className="me-2 mb-1"/> INPUT MANUAL</span>}>
                            <div className="p-4 bg-light min-vh-50">
                                <Form onSubmit={handleManualSubmit} className="bg-white p-4 rounded-4 shadow-sm">
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-muted fw-semibold small">PENCARIAN DATA</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            size="lg"
                                            placeholder="Masukkan NIM, Nama, atau ID Tiket..." 
                                            value={manualInput}
                                            onChange={(e) => setManualInput(e.target.value)}
                                            style={{ borderRadius: '10px' }}
                                        />
                                    </Form.Group>
                                    <Button type="submit" variant="primary" size="lg" className="w-100 rounded-pill fw-semibold shadow-sm">
                                        Cek Validitas Tiket
                                    </Button>
                                </Form>
                            </div>
                        </Tab>

                    </Tabs>
                </Card.Body>
            </Card>

            {/* UI Engagement Checkpoint (Modal Pop-up) */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static" contentClassName="border-0 rounded-4 shadow-lg">
                <Modal.Header closeButton className="border-0 pb-0"></Modal.Header>
                <Modal.Body className="text-center px-4 pb-5 pt-0">
                    <div className="mb-4">
                        <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-4 shadow-sm">
                            <UserCheck size={56} className="text-success" />
                        </div>
                    </div>
                    <h4 className="fw-bold mb-2">Identitas Ditemukan</h4>
                    <div className="bg-light rounded-3 p-3 my-4 text-start border">
                        <p className="mb-1 text-muted small">ID / Referensi Token:</p>
                        <p className="mb-2 fw-semibold">{scannedData?.data}</p>
                        
                        <p className="mb-1 text-muted small mt-2">Metode Entri:</p>
                        <p className="mb-0 text-uppercase badge bg-secondary">{scannedData?.method}</p>
                    </div>
                    
                    <Button variant="success" size="lg" className="w-100 rounded-pill fw-bold py-3 shadow" onClick={handleClaimAttendance}>
                        <CheckCircle size={20} className="me-2 mb-1" />
                        Klaim Kehadiran
                    </Button>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default ScannerPage;
