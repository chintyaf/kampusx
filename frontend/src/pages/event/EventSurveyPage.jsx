import React, { useState } from 'react';
import { Container, Card, Row, Col, Button, Form, Badge, ProgressBar } from 'react-bootstrap';
import { ClipboardList, Plus, Trash2, Edit2, BarChart2, Star, MessageSquare, Send, CheckCircle } from 'lucide-react';

const EventSurveyPage = () => {
    const [isSurveyActive, setIsSurveyActive] = useState(true);

    const surveyQuestions = [
        { id: 1, type: 'rating', question: 'Seberapa puas Anda dengan materi acara ini?', required: true },
        { id: 2, type: 'rating', question: 'Bagaimana penilaian Anda terhadap pembicara?', required: true },
        { id: 3, type: 'text', question: 'Apa saran dan masukan Anda untuk acara selanjutnya?', required: false },
    ];

    return (
        <Container fluid className="p-0">
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                        <ClipboardList className="text-primary" size={28} />
                        Survei Pasca-Acara
                    </h3>
                    <p className="text-muted mb-0">Kelola kuesioner dan lihat umpan balik partisipan terkait acara Anda.</p>
                </div>
                <div className="d-flex gap-3 align-items-center bg-white px-4 py-2 rounded-pill shadow-sm border">
                    <span className="fw-medium text-muted">Status Survei:</span>
                    <Form.Check 
                        type="switch"
                        id="survey-status-switch"
                        label={isSurveyActive ? 'Aktif' : 'Nonaktif'}
                        checked={isSurveyActive}
                        onChange={(e) => setIsSurveyActive(e.target.checked)}
                        className={`fw-bold text-${isSurveyActive ? 'success' : 'secondary'} fs-6 m-0`}
                    />
                </div>
            </div>

            <Row className="g-4 mb-4">
                {/* Statistics Cards */}
                <Col md={4}>
                    <Card className="border-0 shadow-sm rounded-4 h-100 bg-gradient text-white position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d6efd, #0b5ed7)' }}>
                        <Card.Body className="p-4 z-1">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <p className="text-white-50 mb-1 fw-medium">Total Responden</p>
                                    <h2 className="fw-bold mb-0">128</h2>
                                </div>
                                <div className="p-2 bg-white bg-opacity-25 rounded-3">
                                    <MessageSquare size={24} className="text-white" />
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-2 text-white-50 small">
                                <CheckCircle size={14} className="text-success" />
                                <span>85% dari total peserta yang hadir</span>
                            </div>
                        </Card.Body>
                        <div className="position-absolute opacity-25" style={{ right: '-10%', bottom: '-20%' }}>
                            <BarChart2 size={120} />
                        </div>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
                        <Card.Body className="p-4 d-flex flex-column justify-content-center">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <p className="text-muted mb-1 fw-medium">Rata-rata Kepuasan</p>
                                    <h2 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                                        4.8 <span className="fs-5 text-warning"><Star fill="currentColor" /></span>
                                    </h2>
                                </div>
                            </div>
                            <ProgressBar now={96} variant="warning" className="rounded-pill" style={{ height: '8px' }} />
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="border-0 shadow-sm rounded-4 h-100 bg-white d-flex align-items-center justify-content-center">
                        <Card.Body className="p-4 w-100 text-center">
                            <Button 
                                variant={isSurveyActive ? 'outline-primary' : 'secondary'} 
                                className="w-100 fw-bold py-3 rounded-3 d-flex flex-column align-items-center gap-2"
                                disabled={!isSurveyActive}
                            >
                                <Send size={24} />
                                Broadcast Pengingat Survei
                            </Button>
                            <p className="text-muted small mt-2 mb-0">Kirim ulang notifikasi ke peserta yang belum mengisi.</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Questions Management */}
            <Card className="border-0 shadow-sm rounded-4 mb-4">
                <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 px-4 d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0">Daftar Pertanyaan</h5>
                    <Button variant="primary" size="sm" className="rounded-pill px-3 d-flex align-items-center gap-1">
                        <Plus size={16} /> Tambah Pertanyaan
                    </Button>
                </Card.Header>
                <Card.Body className="p-4">
                    <div className="d-flex flex-column gap-3">
                        {surveyQuestions.map((q, idx) => (
                            <div key={q.id} className="p-4 rounded-3 border bg-light d-flex justify-content-between align-items-center hover-shadow transition">
                                <div>
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <Badge bg={q.type === 'rating' ? 'warning' : 'info'} className="rounded-pill text-dark">
                                            {q.type === 'rating' ? 'Rating Bintang' : 'Teks Bebas'}
                                        </Badge>
                                        {q.required && <Badge bg="danger" className="rounded-pill">Wajib Mengisi</Badge>}
                                    </div>
                                    <p className="fw-medium text-dark mb-0 fs-6">
                                        <span className="text-primary me-2">{idx + 1}.</span>
                                        {q.question}
                                    </p>
                                </div>
                                <div className="d-flex gap-2">
                                    <Button variant="outline-secondary" size="sm" className="rounded-circle p-2">
                                        <Edit2 size={16} />
                                    </Button>
                                    <Button variant="outline-danger" size="sm" className="rounded-circle p-2">
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card.Body>
            </Card>

            <style>{`
                .hover-shadow { transition: box-shadow 0.2s ease; }
                .hover-shadow:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.05); background-color: #fff !important; border-color: #dee2e6; }
            `}</style>
        </Container>
    );
};

export default EventSurveyPage;
