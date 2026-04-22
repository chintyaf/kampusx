import React, { useState } from 'react';
import { Card, Button, Form, Tabs, Tab, Alert, Row, Col } from 'react-bootstrap';
import { UploadCloud, Video, FileText, CheckCircle, Info } from 'lucide-react';
import FormHeading from '../../../../components/dashboard/FormHeading';

const PostEventContentUploadPage = () => {
    const [key, setKey] = useState('video');

    return (
        <div className="bg-light">
            <FormHeading 
                heading="After-Event Content Manager" 
                subheading="Kelola dan distribusikan materi rekaman serta slide presentasi kepada peserta secara otomatis setelah acara selesai."
            />

            <Row className="justify-content-center">
                <Col lg={10}>
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                        <Card.Header className="bg-white border-0 pt-4 pb-0 px-4">
                            <Tabs
                                id="content-upload-tabs"
                                activeKey={key}
                                onSelect={(k) => setKey(k)}
                                className="nav-tabs-custom"
                            >
                                <Tab eventKey="video" title={<span><Video size={16} className="me-2"/>Video Replay</span>} />
                                <Tab eventKey="slide" title={<span><FileText size={16} className="me-2"/>Materi Slide / PDF</span>} />
                            </Tabs>
                        </Card.Header>

                        <Card.Body className="p-4 bg-white">
                            {key === 'video' && (
                                <div className="animate__animated animate__fadeIn">
                                    <Alert variant="info" className="border-0 bg-info bg-opacity-10 text-info d-flex align-items-center gap-3 rounded-3 mb-4">
                                        <Info size={24} />
                                        <div>
                                            <p className="mb-0 fw-semibold">Distribusi Video Rekaman</p>
                                            <span className="small opacity-75">Tautkan link YouTube/Vimeo/G-Drive yang berisi siaran ulang untuk para partisipan yang ketinggalan sesi.</span>
                                        </div>
                                    </Alert>

                                    <Form>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-semibold">Judul Sesi / Rekaman</Form.Label>
                                            <Form.Control type="text" placeholder="Contoh: Rekaman Sesi 1 - UI/UX Basic" className="py-2" />
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-semibold">Link Video (URL)</Form.Label>
                                            <Form.Control type="url" placeholder="https://youtube.com/..." className="py-2" />
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-semibold">Hak Akses Distribusi</Form.Label>
                                            <Form.Select className="py-2">
                                                <option value="all">Semua Pemegang Tiket (Hadir & Tidak Hadir)</option>
                                                <option value="attended">EksklusifHanya Peserta yang Check-in (Hadir)</option>
                                                <option value="unlocked">Hanya yang sudah mengisi Survey / Feedback</option>
                                            </Form.Select>
                                        </Form.Group>

                                        <div className="d-flex justify-content-end mt-4">
                                            <Button variant="primary" className="fw-bold px-4 py-2 rounded-pill d-flex align-items-center gap-2">
                                                <CheckCircle size={18} /> Simpan & Distribusikan Video
                                            </Button>
                                        </div>
                                    </Form>
                                </div>
                            )}

                            {key === 'slide' && (
                                <div className="animate__animated animate__fadeIn">
                                    <Alert variant="warning" className="border-0 bg-warning bg-opacity-10 text-warning d-flex align-items-center gap-3 rounded-3 mb-4">
                                        <Info size={24} />
                                        <div>
                                            <p className="mb-0 fw-semibold">Distribusi File Materi</p>
                                            <span className="small opacity-75">Unggah dokumen persentasi (.PDF, .PPTX) untuk dapat diunduh (Download) oleh partisipan melalui dompet mereka.</span>
                                        </div>
                                    </Alert>

                                    <Form>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-semibold">Nama File</Form.Label>
                                            <Form.Control type="text" placeholder="Contoh: Slide Deck - Pemrograman Dasar" className="py-2" />
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-semibold text-muted d-block">Upload Dokumen</Form.Label>
                                            <div className="border border-2 border-dashed rounded-4 p-5 text-center bg-light cursor-pointer">
                                                <UploadCloud size={48} className="text-secondary mb-3 mx-auto" />
                                                <h6 className="fw-bold text-dark mb-1">Drag & Drop file ke sini</h6>
                                                <p className="text-muted small mb-3">Atau klik untuk memilih file dari komputer</p>
                                                <Button variant="outline-secondary" size="sm" className="rounded-pill px-4">Browse File</Button>
                                                <p className="small text-muted mt-3 mb-0">Maksimum ukuran file: 25MB (.PDF, .PPTX)</p>
                                            </div>
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Check 
                                                type="switch"
                                                id="require-survey-switch"
                                                label="Kunci file ini? Peserta wajb mengisi survei (feedback) penyelenggaraan sebelum mendownload dokumen."
                                                className="fw-semibold"
                                                defaultChecked
                                            />
                                        </Form.Group>

                                        <div className="d-flex justify-content-end mt-4">
                                            <Button variant="primary" className="fw-bold px-4 py-2 rounded-pill d-flex align-items-center gap-2">
                                                <CheckCircle size={18} /> Unggah & Bagikan
                                            </Button>
                                        </div>
                                    </Form>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default PostEventContentUploadPage;
