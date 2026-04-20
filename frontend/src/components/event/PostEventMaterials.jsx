import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert } from 'react-bootstrap';
import { ExternalLink, Video, FileText, Lock } from 'lucide-react';
import axios from 'axios';

const PostEventMaterials = ({ eventId }) => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const [isAttended, setIsAttended] = useState(false);

    useEffect(() => {
        if (!eventId) return;
        
        const fetchMaterials = async () => {
            try {
                const res = await axios.get(`/api/events/${eventId}/materials`);
                setMaterials(res.data.data || []);
                setIsAttended(res.data.attended || false);
            } catch (err) {
                if (err.response?.status === 403) {
                    setErrorMsg("Akses ditolak. Anda belum terdaftar di event ini atau tiket kedaluwarsa.");
                } else {
                    setErrorMsg("Gagal memuat materi post-event.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchMaterials();
    }, [eventId]);

    if (loading) return <div className="text-center p-4"><Spinner animation="border" variant="primary" /></div>;

    if (errorMsg) {
        return (
            <Alert variant="danger" className="d-flex align-items-center mt-3 shadow-sm rounded-4 border-0">
                <Lock className="me-3" size={24} />
                <div>
                    <strong>Konten Terkunci</strong><br/>
                    {errorMsg}
                </div>
            </Alert>
        );
    }

    if (materials.length === 0) {
        return (
            <div className="text-center py-5 text-muted bg-light rounded-4 mt-3">
                <FileText size={48} className="mb-2 opacity-50" />
                <p>Belum ada rekaman atau materi yang dibagikan panitia.</p>
            </div>
        );
    }

    const TypeIcon = ({ t }) => {
        if (t === 'video') return <Video size={24} className="text-danger" />;
        if (t === 'document') return <FileText size={24} className="text-primary" />;
        return <ExternalLink size={24} className="text-info" />;
    };

    return (
        <div className="mt-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center justify-content-between">
                <span>Konten Eksklusif Acara</span>
                {isAttended && <span className="badge bg-success small fw-normal">Status: Telah Hadir</span>}
            </h5>
            <div className="row g-3">
                {materials.map(mat => (
                    <div className="col-12 col-md-6" key={mat.id}>
                        <Card className="border-0 shadow-sm rounded-4 h-100 hover-lift">
                            <Card.Body className="d-flex align-items-center p-3">
                                <div className="bg-light p-3 rounded-circle me-3">
                                    <TypeIcon t={mat.type} />
                                </div>
                                <div className="flex-grow-1">
                                    <h6 className="mb-1 fw-bold">{mat.title}</h6>
                                    {mat.description && <p className="text-muted small mb-0 mb-2">{mat.description}</p>}
                                    <Button 
                                        variant={mat.type === 'video' ? 'outline-danger' : 'outline-primary'} 
                                        size="sm" 
                                        className="rounded-pill px-3"
                                        href={mat.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Buka Tautan
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                ))}
            </div>
            
            {!isAttended && (
                <Alert variant="warning" className="mt-4 border-0 rounded-4 d-flex align-items-start shadow-sm">
                    <Lock size={20} className="me-2 mt-1 flex-shrink-0" />
                    <small>
                        Jika ada materi tertentu yang tidak muncul, kemungkinan materi tersebut hanya diizinkan bagi peserta yang telah melakukan <i>Check-in / Scan Kehadiran</i> lewat panitia.
                    </small>
                </Alert>
            )}
        </div>
    );
};

export default PostEventMaterials;
