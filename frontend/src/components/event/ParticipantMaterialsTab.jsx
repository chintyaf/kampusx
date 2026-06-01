import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, Button, Badge, Row, Col } from 'react-bootstrap';
import { Download, ExternalLink, FileText, Code, Palette, LinkIcon, FileQuestion, Users } from 'lucide-react';
import api from '../../api/axios';
import { STORAGE_URL } from '../../api/storage';

const ParticipantMaterialsTab = ({ eventId }) => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        const fetchMaterials = async () => {
            setLoading(true);
            setErrorMsg(null);
            try {
                const res = await api.get(`/events/${eventId}/materials`);
                if (res.data?.success) {
                    setMaterials(res.data.data || []);
                }
            } catch (err) {
                console.error("Gagal memuat materi:", err);
                if (err.response?.status === 403) {
                    setErrorMsg("Akses ditolak. Anda tidak terdaftar sebagai peserta atau sesi Anda telah berakhir.");
                } else {
                    setErrorMsg("Gagal mengambil data materi event space.");
                }
            } finally {
                setLoading(false);
            }
        };

        if (eventId) {
            fetchMaterials();
        }
    }, [eventId]);

    // Grouping materials by session_name
    const getGroupedMaterials = () => {
        return materials.reduce((acc, mat) => {
            const groupKey = mat.session_name || 'Materi Umum';
            if (!acc[groupKey]) {
                acc[groupKey] = [];
            }
            acc[groupKey].push(mat);
            return acc;
        }, {});
    };

    const getTypeIcon = (t) => {
        switch (t) {
            case 'document':
                return <FileText className="text-primary" size={20} />;
            case 'code_repo':
                return <Code className="text-dark" size={20} />;
            case 'design_interactive':
                return <Palette className="text-danger" size={20} />;
            case 'media_form':
                return <LinkIcon className="text-info" size={20} />;
            default:
                return <FileQuestion className="text-secondary" size={20} />;
        }
    };

    const getTypeLabel = (t) => {
        switch (t) {
            case 'document': return 'Bahan Bacaan / Slide';
            case 'code_repo': return 'Repository Kode';
            case 'design_interactive': return 'Berkas Desain';
            case 'media_form': return 'Form Media / Survei';
            default: return 'Tautan Sumber';
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" style={{ width: '2.5rem', height: '2.5rem' }} />
                <p className="text-muted mt-3 small fw-medium">Mengambil berkas materi privat...</p>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <Alert variant="danger" className="border-0 shadow-sm rounded-4 p-4 d-flex align-items-center gap-3">
                <div className="bg-danger bg-opacity-10 text-danger rounded-circle p-2.5 d-inline-flex">
                    <FileText size={24} />
                </div>
                <div>
                    <h6 className="fw-bold text-dark mb-1">Materi Privat Terkunci</h6>
                    <p className="mb-0 text-muted small">{errorMsg}</p>
                </div>
            </Alert>
        );
    }

    if (materials.length === 0) {
        return (
            <div className="text-center py-5 bg-white rounded-4 border border-dashed shadow-sm">
                <FileText size={48} className="opacity-25 mb-3 text-secondary mx-auto" />
                <h5 className="fw-bold text-dark mb-1">Belum Ada Materi Diterbitkan</h5>
                <p className="small text-muted mb-0 mx-auto" style={{ maxWidth: '350px' }}>
                    Penyelenggara belum merilis materi atau slide pembelajaran untuk event space ini.
                </p>
            </div>
        );
    }

    const grouped = getGroupedMaterials();

    return (
        <div className="participant-materials-container fade-in">
            <div className="mb-4">
                <h5 className="fw-bold mb-1" style={{ color: 'var(--color-primary, #1A365D)' }}>Pusat Sumber Daya (Resource Center)</h5>
                <p className="text-muted small mb-0">Akses berkas, repositori kode, form interaktif, dan materi presentasi eksklusif seminar.</p>
            </div>

            <div className="d-flex flex-column gap-4">
                {Object.keys(grouped).map((session, sIdx) => (
                    <div key={sIdx} className="session-group-block">
                        {/* Session Header */}
                        <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-light">
                            <div className="bg-primary bg-opacity-10 text-white rounded-pill px-3 py-1 fw-bold small">
                                {session}
                            </div>
                        </div>

                        {/* Materials Cards under Session */}
                        <Row className="g-3">
                            {grouped[session].map((mat) => (
                                <Col key={mat.id} xs={12} md={6}>
                                    <Card className="border shadow-sm rounded-4 h-100 transition-all hover-shadow bg-white">
                                        <Card.Body className="p-4 d-flex flex-column justify-content-between">
                                            <div>
                                                <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                                                    <div className="bg-light p-2 rounded-3 d-inline-flex border">
                                                        {getTypeIcon(mat.type)}
                                                    </div>
                                                    <Badge bg="light" text="dark" className="border px-2.5 py-1.5 small font-normal text-muted" style={{ fontWeight: 'normal', fontSize: '10.5px' }}>
                                                        {getTypeLabel(mat.type)}
                                                    </Badge>
                                                </div>

                                                <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '14.5px', lineHeight: '1.4' }}>
                                                    {mat.title}
                                                </h6>

                                                {mat.speaker_name && (
                                                    <div className="text-secondary small mb-2 d-flex align-items-center gap-1" style={{ fontSize: '12px' }}>
                                                        <span>🎤 {mat.speaker_name}</span>
                                                    </div>
                                                )}

                                                {mat.description && (
                                                    <p className="text-muted small mb-0 mt-2" style={{ fontSize: '12px', lineHeight: '1.5' }}>
                                                        {mat.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="mt-4 pt-3 border-top border-light d-flex justify-content-end">
                                                {mat.file_path ? (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        href={mat.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="rounded-pill px-3.5 py-2 small fw-semibold shadow-sm d-flex align-items-center gap-1.5"
                                                        style={{
                                                            backgroundColor: 'var(--color-primary, #1A365D)',
                                                            borderColor: 'var(--color-primary, #1A365D)',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        <Download size={14} /> Unduh File
                                                    </Button>
                                                ) : mat.content_url ? (
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        href={mat.content_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="rounded-pill px-3.5 py-2 small fw-semibold d-flex align-items-center gap-1.5"
                                                        style={{ fontSize: '12px' }}
                                                    >
                                                        <ExternalLink size={14} /> Kunjungi Tautan
                                                    </Button>
                                                ) : (
                                                    <span className="text-muted small">Tidak ada tautan</span>
                                                )}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ParticipantMaterialsTab;
