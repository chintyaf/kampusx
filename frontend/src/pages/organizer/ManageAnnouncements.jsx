import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner, Modal } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { Megaphone, Plus, Trash2, Calendar, FileText, ExternalLink, Image, AlertCircle, CheckCircle, Badge } from 'lucide-react';
import api from '../../api/axios';

const ManageAnnouncements = () => {
    const { eventId } = useParams();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form fields
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [attachment, setAttachment] = useState(null);
    
    // UI alerts
    const [statusMsg, setStatusMsg] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    const fetchAnnouncements = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const res = await api.get(`/organizer/events/${eventId}/announcements`);
            setAnnouncements(res.data.data || []);
        } catch (err) {
            console.error('Failed to load organizer announcements:', err);
            setErrorMsg('Gagal memuat daftar pengumuman. Harap muat ulang halaman.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (eventId) {
            fetchAnnouncements();
        }
    }, [eventId]);

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setAttachment(e.target.files[0]);
        } else {
            setAttachment(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title.trim() || !content.trim()) {
            setErrorMsg('Judul dan konten pengumuman tidak boleh kosong.');
            return;
        }

        setSubmitting(true);
        setStatusMsg(null);
        setErrorMsg(null);

        try {
            // Karena mendukung upload file lampiran, kita gunakan FormData
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            if (attachment) {
                formData.append('attachment', attachment);
            }

            const res = await api.post(`/organizer/events/${eventId}/announcements`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.success) {
                setStatusMsg(res.data.message || 'Pengumuman baru berhasil diterbitkan!');
                // Reset form fields
                setTitle('');
                setContent('');
                setAttachment(null);
                // Reset input file element
                const fileInput = document.getElementById('announcement-attachment-input');
                if (fileInput) fileInput.value = '';

                // Muat ulang daftar pengumuman
                fetchAnnouncements();
            }
        } catch (err) {
            console.error('Failed to create announcement:', err);
            setErrorMsg(err.response?.data?.message || 'Gagal menerbitkan pengumuman baru.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus pengumuman ini secara permanen?')) return;

        setErrorMsg(null);
        setStatusMsg(null);
        try {
            const res = await api.delete(`/organizer/events/${eventId}/announcements/${id}`);
            if (res.data.success) {
                setStatusMsg('Pengumuman berhasil dihapus secara permanen!');
                fetchAnnouncements();
            }
        } catch (err) {
            console.error('Failed to delete announcement:', err);
            setErrorMsg('Gagal menghapus pengumuman.');
        }
    };

    if (loading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: '50vh' }}>
                <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                <p className="text-muted mt-3 fw-medium">Memuat Pengumuman Event...</p>
            </div>
        );
    }

    return (
        <div className="fade-in py-3">
            <div className="mb-4">
                <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                    <Megaphone className="text-primary" size={24} /> Pengumuman & Broadcast Event
                </h4>
                <p className="text-muted small mb-0">
                    Kirimkan pengumuman penting, perubahan jadwal, atau berkas tambahan langsung ke dasbor ruang belajar (Event Space) seluruh peserta Anda.
                </p>
            </div>

            {statusMsg && (
                <Alert variant="success" className="border-0 shadow-sm rounded-4 mb-4 d-flex align-items-center gap-2.5">
                    <CheckCircle className="text-success flex-shrink-0" size={20} />
                    <span className="small fw-semibold">{statusMsg}</span>
                </Alert>
            )}

            {errorMsg && (
                <Alert variant="danger" className="border-0 shadow-sm rounded-4 mb-4 d-flex align-items-center gap-2.5">
                    <AlertCircle className="text-danger flex-shrink-0" size={20} />
                    <span className="small fw-semibold">{errorMsg}</span>
                </Alert>
            )}

            <Row className="g-4">
                {/* KIRI: BUAT PENGUMUMAN BARU */}
                <Col lg={5} md={12}>
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                        <Card.Header className="bg-white border-0 py-3 px-4 border-bottom">
                            <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                                <Plus size={18} className="text-primary" /> Buat Pengumuman Baru
                            </h6>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold text-muted small mb-1.5">Judul Pengumuman</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Ketikkan judul pengumuman..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="rounded-3 border"
                                        style={{ fontSize: '13.5px' }}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold text-muted small mb-1.5">Isi / Detail Pengumuman</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        placeholder="Ketikkan isi informasi penting di sini secara detail..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="rounded-3 border"
                                        style={{ fontSize: '13.5px', resize: 'none' }}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold text-muted small mb-1.5">File Lampiran (Opsional)</Form.Label>
                                    <Form.Control
                                        type="file"
                                        id="announcement-attachment-input"
                                        accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                                        onChange={handleFileChange}
                                        className="rounded-3 border"
                                        style={{ fontSize: '13px' }}
                                    />
                                    <Form.Text className="text-muted small mt-1.5 d-block">
                                        Mendukung Gambar (PNG/JPG) atau PDF. Maksimal ukuran file 4MB.
                                    </Form.Text>
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded-pill w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                                    style={{
                                        backgroundColor: 'var(--color-primary, #1A365D)',
                                        borderColor: 'var(--color-primary, #1A365D)'
                                    }}
                                >
                                    {submitting ? (
                                        <>
                                            <Spinner animation="border" size="sm" /> Menerbitkan...
                                        </>
                                    ) : (
                                        <>
                                            <Megaphone size={16} /> Terbitkan & Kirim Notifikasi
                                        </>
                                    )}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* KANAN: RIWAYAT PENGUMUMAN DITERBITKAN */}
                <Col lg={7} md={12}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Header className="bg-white border-0 py-3.5 px-4 d-flex align-items-center justify-content-between border-bottom">
                            <h6 className="fw-bold mb-0 text-dark">Riwayat Pengumuman Acara</h6>
                            <Badge bg="light" className="text-dark border rounded-pill px-2.5 py-1.5 fw-bold">
                                {announcements.length} Pengumuman
                            </Badge>
                        </Card.Header>
                        <Card.Body className="p-4">
                            {announcements.length === 0 ? (
                                <div className="text-center py-5 text-muted my-auto">
                                    <Megaphone size={44} className="opacity-20 mb-3 mx-auto" />
                                    <h6 className="fw-bold text-dark mb-1">Belum Ada Pengumuman</h6>
                                    <p className="small mb-0 text-muted">Mulai isi formulir di samping kiri untuk menyiarkan informasi terhangat bagi seluruh peserta Anda.</p>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-3.5">
                                    {announcements.map((ann) => (
                                        <Card key={ann.id} className="border border-light rounded-4 shadow-sm p-3.5">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div className="text-muted small d-flex align-items-center gap-1.5" style={{ fontSize: '11px' }}>
                                                    <Calendar size={13} className="text-primary" />
                                                    <span>
                                                        {new Date(ann.created_at).toLocaleDateString('id-ID', {
                                                            day: '2-digit',
                                                            month: 'long',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    className="border-0 p-1.5 rounded-circle d-flex"
                                                    onClick={() => handleDelete(ann.id)}
                                                    title="Hapus Pengumuman"
                                                >
                                                    <Trash2 size={15} />
                                                </Button>
                                            </div>

                                            <h6 className="fw-extrabold text-dark mb-1.5">{ann.title}</h6>
                                            <p className="text-muted small mb-3" style={{ fontSize: '12.5px', lineHeight: '1.6', wordBreak: 'break-word', whiteSpace: 'pre-line' }}>
                                                {ann.content}
                                            </p>

                                            {/* Attachment indicator if exists */}
                                            {ann.attachment_path && (
                                                <div className="p-2.5 rounded-3 bg-light border d-inline-flex align-items-center justify-content-between gap-3" style={{ maxWidth: '300px' }}>
                                                    <div className="d-flex align-items-center gap-2 text-dark small" style={{ fontSize: '11.5px' }}>
                                                        {ann.attachment_type === 'pdf' ? (
                                                            <FileText size={16} className="text-danger flex-shrink-0" />
                                                        ) : (
                                                            <Image size={16} className="text-primary flex-shrink-0" />
                                                        )}
                                                        <span className="text-truncate fw-medium" style={{ maxWidth: '180px' }}>
                                                            {ann.attachment_path.split('/').pop()}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        variant="link"
                                                        href={ann.attachment_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-0 text-primary small d-flex align-items-center gap-1 text-decoration-none fw-bold"
                                                        style={{ fontSize: '11px' }}
                                                    >
                                                        Lihat <ExternalLink size={12} />
                                                    </Button>
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ManageAnnouncements;
