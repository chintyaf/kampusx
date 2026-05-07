import React, { useState } from 'react';
import { Container, Card, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { Lock, Download, Star, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const CertificateDetailPage = () => {
    const { id } = useParams();
    
    // Default locked state for demonstration
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [surveySubmitted, setSurveySubmitted] = useState(false);
    const [rating, setRating] = useState(0);

    const handleSubmitSurvey = (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Silakan pilih rating bintang terlebih dahulu!');
            return;
        }
        // Simulasi submit loading
        setSurveySubmitted(true);
        setTimeout(() => {
            setIsUnlocked(true);
        }, 1500);
    };

    return (
        <div className="bg-light min-vh-100 py-4">
            <Container>
                <Link to="/test-chin/sertifikat" className="text-decoration-none text-secondary d-flex align-items-center gap-2 mb-4">
                    <ArrowLeft size={18} /> Kembali ke Vault
                </Link>

                <Row className="justify-content-center">
                    <Col lg={10}>
                        <div className="d-flex justify-content-between align-items-end mb-4">
                            <div>
                                <h3 className="fw-bold mb-1">Detail E-Sertifikat</h3>
                                <p className="text-muted mb-0">ID: {id || 'CERT-99482'} • KampusX Design Team</p>
                            </div>
                            {isUnlocked && (
                                <Button variant="success" className="d-flex align-items-center gap-2 rounded-pill px-4 shadow-sm">
                                    <Download size={18} /> Download PDF
                                </Button>
                            )}
                        </div>

                        <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '16px' }}>
                            <div className="position-relative bg-dark" style={{ minHeight: '600px', display: 'flex' }}>
                                {/* Simulated Document (Certificate) */}
                                <div className="m-auto bg-white p-5 text-center shadow" style={{ 
                                    width: '80%', height: '80%', borderRadius: '8px',
                                    filter: isUnlocked ? 'none' : 'blur(8px) grayscale(60%)',
                                    transition: 'all 0.8s ease',
                                    display: 'flex', flexDirection: 'column', justifyContent: 'center'
                                }}>
                                    <h1 className="fw-bold text-primary mb-4" style={{ fontFamily: 'serif' }}>Certificate of Completion</h1>
                                    <h5 className="text-muted mb-5">This is to certify that</h5>
                                    <h2 className="fw-bold fs-1 mb-5" style={{ textDecoration: 'underline' }}>Alex Participant</h2>
                                    <h5 className="text-muted mb-4">Has successfully completed the</h5>
                                    <h3 className="fw-bold">Workshop UI/UX Figma Advanced Level</h3>
                                    <p className="mt-5">Given on 23 Apr 2026</p>
                                </div>

                                {/* Locked Area Overlay (Survey) */}
                                {!isUnlocked && (
                                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-75" style={{ backdropFilter: 'blur(2px)' }}>
                                        {!surveySubmitted ? (
                                            <Card className="border-0 shadow-lg" style={{ width: '100%', maxWidth: '450px', borderRadius: '16px' }}>
                                                <Card.Body className="p-5 text-center">
                                                    <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-inline-flex p-3 mb-3">
                                                        <Lock size={32} />
                                                    </div>
                                                    <h4 className="fw-bold mb-2">Sertifikat Terkunci</h4>
                                                    <p className="text-muted small mb-4">Untuk mengunduh sertifikat dan materi pasca-acara, silakan berikan feedback/ulasan Anda terkait acara ini.</p>
                                                    
                                                    <Form onSubmit={handleSubmitSurvey}>
                                                        <div className="d-flex justify-content-center gap-2 mb-4">
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <Star 
                                                                    key={star} 
                                                                    size={32} 
                                                                    className="cursor-pointer"
                                                                    onClick={() => setRating(star)}
                                                                    fill={rating >= star ? '#ffc107' : 'none'}
                                                                    color={rating >= star ? '#ffc107' : '#ced4da'}
                                                                    style={{ cursor: 'pointer' }}
                                                                />
                                                            ))}
                                                        </div>
                                                        <Form.Group className="mb-4 text-start">
                                                            <Form.Label className="small fw-semibold">Ulasan Singkat (Opsional)</Form.Label>
                                                            <Form.Control as="textarea" rows={3} placeholder="Bagaimana menurut Anda acara ini?" />
                                                        </Form.Group>
                                                        <Button type="submit" variant="primary" className="w-100 rounded-pill py-2 fw-semibold">
                                                            Kirim & Buka Sertifikat
                                                        </Button>
                                                    </Form>
                                                </Card.Body>
                                            </Card>
                                        ) : (
                                            <div className="text-center bg-white p-5 rounded-4 shadow-lg">
                                                <div className="text-success mb-3">
                                                    <CheckCircle size={64} className="mx-auto" />
                                                </div>
                                                <h4 className="fw-bold mb-2">Membuka Vault...</h4>
                                                <p className="text-muted">Terima kasih atas ulasan Anda!</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default CertificateDetailPage;
