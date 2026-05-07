import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Table, Badge, Spinner } from 'react-bootstrap';
import { Trash2, Link as LinkIcon, Video, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const OrganizerMaterialsManage = ({ eventId }) => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [title, setTitle] = useState('');
    const [type, setType] = useState('link');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [requireAttendance, setRequireAttendance] = useState(false);

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/organizer/events/${eventId}/materials`);
            setMaterials(res.data.data || []);
        } catch (error) {
            toast.error("Gagal mengambil data materi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (eventId) fetchMaterials();
    }, [eventId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/api/organizer/events/${eventId}/materials`, {
                title, type, url, description, require_attendance: requireAttendance
            });
            toast.success("Materi berhasil ditambahkan!");
            // Reset form
            setTitle(''); setType('link'); setUrl(''); setDescription(''); setRequireAttendance(false);
            fetchMaterials();
        } catch (error) {
            toast.error(error.response?.data?.message || "Gagal menambahkan materi");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Yakin ingin menghapus materi ini?")) return;
        try {
            await axios.delete(`/api/organizer/events/${eventId}/materials/${id}`);
            toast.success("Materi dihapus!");
            fetchMaterials();
        } catch (error) {
            toast.error("Gagal menghapus materi");
        }
    };

    const TypeIcon = ({ t }) => {
        if (t === 'video') return <Video size={16} className="text-danger" />;
        if (t === 'document') return <FileText size={16} className="text-primary" />;
        return <LinkIcon size={16} className="text-info" />;
    };

    return (
        <div className="mt-4">
            <Toaster />
            <h5 className="mb-3">Kelola Akses Konten Pasca-Acara</h5>
            
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <div className="row">
                            <Form.Group className="col-md-6 mb-3">
                                <Form.Label>Judul Materi/Replay</Form.Label>
                                <Form.Control required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Rekaman Zoom Hari 1" />
                            </Form.Group>
                            
                            <Form.Group className="col-md-6 mb-3">
                                <Form.Label>Tipe Konten</Form.Label>
                                <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
                                    <option value="link">Tautan Umum</option>
                                    <option value="video">Video (Replay)</option>
                                    <option value="document">Dokumen / Slide</option>
                                </Form.Select>
                            </Form.Group>
                            
                            <Form.Group className="col-12 mb-3">
                                <Form.Label>URL (Link GDrive / YouTube)</Form.Label>
                                <Form.Control required type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
                            </Form.Group>
                            
                            <Form.Group className="col-12 mb-3">
                                <Form.Label>Catatan Tambahan (Opsional)</Form.Label>
                                <Form.Control as="textarea" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
                            </Form.Group>
                            
                            <Form.Group className="col-12 mb-3">
                                <Form.Check 
                                    type="switch"
                                    id="require-attendance-switch"
                                    label="Terbatas HANYA bagi peserta yang terverifikasi hadir (Check-in)"
                                    checked={requireAttendance}
                                    onChange={(e) => setRequireAttendance(e.target.checked)}
                                />
                            </Form.Group>
                        </div>
                        <Button type="submit" variant="primary">Tambahkan Konten</Button>
                    </Form>
                </Card.Body>
            </Card>

            <Card className="shadow-sm">
                <Card.Body>
                    <h6 className="mb-3">Daftar Materi Acara</h6>
                    {loading ? <Spinner animation="border" size="sm" /> : (
                        <Table responsive hover className="align-middle">
                            <thead>
                                <tr>
                                    <th>Konten</th>
                                    <th>Tautan</th>
                                    <th>Restriksi Akses</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materials.length === 0 ? (
                                    <tr><td colSpan="4" className="text-center text-muted">Belum ada konten yang diatur.</td></tr>
                                ) : materials.map(mat => (
                                    <tr key={mat.id}>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <TypeIcon t={mat.type} />
                                                <div>
                                                    <div className="fw-semibold">{mat.title}</div>
                                                    <small className="text-muted">{mat.type}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <a href={mat.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-light">Buka Tautan</a>
                                        </td>
                                        <td>
                                            {mat.require_attendance ? 
                                                <Badge bg="warning" text="dark"><CheckCircle size={12} className="me-1"/> Wajib Hadir</Badge> : 
                                                <Badge bg="success"><AlertCircle size={12} className="me-1"/> Semua Pemilik Tiket</Badge>
                                            }
                                        </td>
                                        <td>
                                            <Button variant="danger" size="sm" onClick={() => handleDelete(mat.id)}>
                                                <Trash2 size={16} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default OrganizerMaterialsManage;
