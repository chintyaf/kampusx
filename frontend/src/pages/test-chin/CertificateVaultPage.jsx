import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Row, Col, Container } from 'react-bootstrap';
import { Award, QrCode, Calendar, ExternalLink, Building, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import QRCode from 'react-qr-code';

const dummyCertificates = [
    {
        id: 'CERT-10293',
        eventName: 'Tech Startup Conference 2026',
        date: '30 Apr 2026',
        organizer: 'Organizer KampusX',
        status: 'unlocked', // bebas akses (sudah isi survey)
        image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'CERT-99482',
        eventName: 'Workshop UI/UX Figma',
        date: '23 Apr 2026',
        organizer: 'KampusX Design Team',
        status: 'locked', // pending survey
        image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
];

const CertificateVaultPage = () => {
    const [showQrModal, setShowQrModal] = useState(false);
    const [selectedCert, setSelectedCert] = useState(null);

    const handleShowQR = (cert) => {
        setSelectedCert(cert);
        setShowQrModal(true);
    };

    return (
        <div className="bg-light min-vh-100 py-5">
            <Container>
                <div className="mb-5">
                    <h2 className="fw-bold d-flex align-items-center gap-3">
                        <Award size={32} className="text-primary" /> E-Sertifikat Vault
                    </h2>
                    <p className="text-muted">Dompet digital tempat menyimpan seluruh sertifikat apresiasi dan kelulusan Anda dari berbagai acara.</p>
                </div>

                <Row className="g-4">
                    {dummyCertificates.map(cert => (
                        <Col md={6} lg={4} key={cert.id}>
                            <Card className="border-0 shadow-sm h-100 overflow-hidden" style={{ borderRadius: '16px' }}>
                                <div className="position-relative" style={{ height: '180px', background: '#e9ecef', overflow: 'hidden' }}>
                                    <div 
                                        style={{
                                            backgroundImage: `url(${cert.image})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            width: '100%',
                                            height: '100%',
                                            filter: cert.status === 'locked' ? 'blur(4px) grayscale(50%)' : 'none',
                                            transition: 'all 0.3s ease'
                                        }}
                                    />
                                    {cert.status === 'locked' && (
                                        <div className="position-absolute top-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center bg-dark bg-opacity-50 text-white">
                                            <Lock size={32} className="mb-2" />
                                            <span className="fw-semibold">Survey Dibutuhkan</span>
                                        </div>
                                    )}
                                </div>
                                <Card.Body className="d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <Badge bg={cert.status === 'unlocked' ? 'success' : 'warning'} className="px-3 py-2 rounded-pill">
                                            {cert.status === 'unlocked' ? 'Verified' : 'Pending Action'}
                                        </Badge>
                                        <span className="text-muted small fw-mono">{cert.id}</span>
                                    </div>
                                    <Card.Title className="fw-bold mt-2">{cert.eventName}</Card.Title>
                                    
                                    <div className="text-muted small mb-4 mt-auto">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <Building size={14} /> {cert.organizer}
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <Calendar size={14} /> {cert.date}
                                        </div>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <Link to={`/test-chin/sertifikat/${cert.id}`} className="btn btn-primary flex-grow-1 px-0 fw-semibold">
                                            {cert.status === 'locked' ? 'Klaim Sekarang' : 'Lihat Detail'}
                                        </Link>
                                        
                                        {cert.status === 'unlocked' && (
                                            <Button variant="outline-dark" onClick={() => handleShowQR(cert)} title="Link Verifikasi QR">
                                                <QrCode size={18} />
                                            </Button>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>

            {/* QR Verification Modal */}
            <Modal show={showQrModal} onHide={() => setShowQrModal(false)} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Verifikasi Sertifikat</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-4">
                    {selectedCert && (
                        <>
                            <div className="bg-white p-3 rounded-4 d-inline-block border mb-4">
                                <QRCode value={`https://kampusx.id/verify/${selectedCert.id}`} size={180} />
                            </div>
                            <h5 className="fw-bold mb-1">{selectedCert.eventName}</h5>
                            <p className="text-muted small mb-4">{selectedCert.organizer} • {selectedCert.date}</p>
                            
                            <div className="bg-light p-3 rounded-3 text-start mb-3" style={{ border: '1px dashed #ccc' }}>
                                <div className="small text-muted mb-1 d-flex justify-content-between">
                                    <span>Tautan Verifikasi Publik:</span>
                                    <ExternalLink size={12} />
                                </div>
                                <div className="fw-mono fs-6 user-select-all" style={{ wordBreak: 'break-all' }}>
                                    https://kampusx.id/verify/{selectedCert.id}
                                </div>
                            </div>
                            <Button variant="primary" className="w-100 rounded-pill" onClick={() => {
                                navigator.clipboard.writeText(`https://kampusx.id/verify/${selectedCert.id}`);
                                alert("Tautan berhasil direkam (copied)!");
                            }}>
                                Salin Tautan
                            </Button>
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default CertificateVaultPage;
