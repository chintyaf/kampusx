import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Table, Badge, Spinner, Row, Col } from 'react-bootstrap';
import { Trash2, Edit, Link as LinkIcon, FileText, Code, Palette, FileQuestion, Plus, X, Download, Eye, Upload } from 'lucide-react';
import api from '../../api/axios';
import { STORAGE_URL } from '../../api/storage';
import toast, { Toaster } from 'react-hot-toast';

const MaterialManager = ({ eventId }) => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    
    // Form States
    const [editingId, setEditingId] = useState(null);
    const [title, setTitle] = useState('');
    const [sessionName, setSessionName] = useState('');
    const [speakerName, setSpeakerName] = useState('');
    const [type, setType] = useState('document');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('published');
    const [contentUrl, setContentUrl] = useState('');
    const [file, setFile] = useState(null);
    const [existingFilePath, setExistingFilePath] = useState('');
    
    const fileInputRef = useRef(null);
    const formRef = useRef(null);

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/organizer/events/${eventId}/materials`);
            setMaterials(res.data.data || []);
        } catch (error) {
            toast.error("Gagal mengambil data materi");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (eventId) {
            fetchMaterials();
        }
    }, [eventId]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) {
                toast.error("Ukuran file melebihi 5MB!");
                e.target.value = null;
                setFile(null);
                return;
            }
            setFile(selectedFile);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setTitle('');
        setSessionName('');
        setSpeakerName('');
        setType('document');
        setDescription('');
        setStatus('published');
        setContentUrl('');
        setFile(null);
        setExistingFilePath('');
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title.trim()) {
            toast.error("Judul materi wajib diisi!");
            return;
        }

        setSubmitLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('session_name', sessionName);
            formData.append('speaker_name', speakerName);
            formData.append('type', type);
            formData.append('description', description);
            formData.append('status', status);

            if (type === 'document') {
                if (file) {
                    formData.append('file', file);
                } else if (contentUrl) {
                    formData.append('content_url', contentUrl);
                }
            } else {
                formData.append('content_url', contentUrl);
            }

            if (editingId) {
                // Laravel PUT request workaround for multipart/form-data
                formData.append('_method', 'PUT');
                await api.post(`/organizer/events/${eventId}/materials/${editingId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Materi berhasil diperbarui!");
            } else {
                await api.post(`/organizer/events/${eventId}/materials`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Materi berhasil ditambahkan!");
            }

            resetForm();
            fetchMaterials();
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Gagal menyimpan materi";
            toast.error(errorMsg);
            console.error(error);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEdit = (mat) => {
        setEditingId(mat.id);
        setTitle(mat.title || '');
        setSessionName(mat.session_name || '');
        setSpeakerName(mat.speaker_name || '');
        setType(mat.type || 'document');
        setDescription(mat.description || '');
        setStatus(mat.status || 'published');
        setContentUrl(mat.content_url || '');
        setFile(null);
        setExistingFilePath(mat.file_path || '');
        
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }

        // Scroll to form nicely
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus materi ini?")) return;
        
        try {
            await api.delete(`/organizer/events/${eventId}/materials/${id}`);
            toast.success("Materi berhasil dihapus!");
            fetchMaterials();
            if (editingId === id) {
                resetForm();
            }
        } catch (error) {
            toast.error("Gagal menghapus materi");
            console.error(error);
        }
    };

    const getTypeDetails = (t) => {
        switch (t) {
            case 'document':
                return { label: 'Dokumen', color: 'primary', icon: <FileText size={16} /> };
            case 'code_repo':
                return { label: 'Repo Kode', color: 'dark', icon: <Code size={16} /> };
            case 'design_interactive':
                return { label: 'Desain Berkas', color: 'pink', icon: <Palette size={16} /> };
            case 'media_form':
                return { label: 'Media Form', color: 'info', icon: <LinkIcon size={16} /> };
            default:
                return { label: 'Tautan', color: 'secondary', icon: <FileQuestion size={16} /> };
        }
    };

    return (
        <div className="mt-2" ref={formRef}>
            <Toaster position="top-right" />
            
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-1" style={{ color: 'var(--color-primary, #1A365D)' }}>Resource Center</h4>
                    <p className="text-muted small mb-0">Kelola dan unggah materi khusus yang dapat diakses oleh peserta valid pada EventSpace.</p>
                </div>
            </div>

            {/* FORM CARD */}
            <Card className="border-0 shadow-sm rounded-4 mb-4">
                <Card.Header className="bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                    <h5 className="fw-extrabold text-dark mb-0 d-flex align-items-center gap-2">
                        <Plus size={20} className="text-primary" />
                        <span>{editingId ? 'Edit Materi Acara' : 'Tambah Materi Baru'}</span>
                    </h5>
                    {editingId && (
                        <Button variant="light" size="sm" onClick={resetForm} className="rounded-circle border">
                            <X size={16} />
                        </Button>
                    )}
                </Card.Header>
                <Card.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold small">Judul Materi *</Form.Label>
                                    <Form.Control 
                                        required 
                                        type="text" 
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)} 
                                        placeholder="Contoh: Slide Presentasi Pitching Bisnis" 
                                        className="rounded-3"
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold small">Hari / Sesi (Opsional)</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={sessionName} 
                                        onChange={(e) => setSessionName(e.target.value)} 
                                        placeholder="Contoh: Day 1 - Sesi Pagi" 
                                        className="rounded-3"
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold small">Pembicara / Speaker (Opsional)</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={speakerName} 
                                        onChange={(e) => setSpeakerName(e.target.value)} 
                                        placeholder="Contoh: Dr. Budi Santoso" 
                                        className="rounded-3"
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold small">Tipe Materi</Form.Label>
                                    <Form.Select 
                                        value={type} 
                                        onChange={(e) => {
                                            setType(e.target.value);
                                            // Reset inputs related to dynamic fields
                                            setFile(null);
                                            if (fileInputRef.current) fileInputRef.current.value = null;
                                        }}
                                        className="rounded-3"
                                    >
                                        <option value="document">Dokumen / PDF / Slide</option>
                                        <option value="code_repo">Repository Code (GitHub/GitLab)</option>
                                        <option value="design_interactive">Interactive Design (Figma/Adobe)</option>
                                        <option value="media_form">Media Form (Google Form/Typeform)</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold small">Status Rilis</Form.Label>
                                    <Form.Select 
                                        value={status} 
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="rounded-3"
                                    >
                                        <option value="published">🚀 Published (Langsung diakses)</option>
                                        <option value="draft">📁 Draft (Disimpan internal)</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            {/* DYNAMIC FORM LOGIC */}
                            <Col md={4}>
                                {type === 'document' ? (
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold small d-flex justify-content-between align-items-center">
                                            <span>Unggah Berkas Fisik (Max 5MB)</span>
                                            {existingFilePath && <span className="badge bg-success-subtle text-success border border-success border-opacity-10 small py-0.5">Tersimpan</span>}
                                        </Form.Label>
                                        <Form.Control 
                                            type="file" 
                                            ref={fileInputRef}
                                            onChange={handleFileChange} 
                                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
                                            className="rounded-3"
                                        />
                                        <Form.Text className="text-muted" style={{ fontSize: '11px' }}>
                                            {existingFilePath ? (
                                                <span className="text-success fw-medium">File saat ini: {existingFilePath.split('/').pop()}</span>
                                            ) : (
                                                'Format didukung: PDF, PPT, Word, Excel, ZIP (Max 5MB)'
                                            )}
                                        </Form.Text>
                                    </Form.Group>
                                ) : (
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold small">Tautan Tautan / URL Sumber *</Form.Label>
                                        <Form.Control 
                                            required
                                            type="url" 
                                            value={contentUrl} 
                                            onChange={(e) => setContentUrl(e.target.value)} 
                                            placeholder="https://..." 
                                            className="rounded-3"
                                        />
                                    </Form.Group>
                                )}
                            </Col>

                            {/* Optional External URL for document type in case they want a backup URL */}
                            {type === 'document' && (
                                <Col md={12} className="mt-0">
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold small">Atau Menggunakan Tautan Eksternal (GDrive/Dropbox) jika file lebih dari 5MB</Form.Label>
                                        <Form.Control 
                                            type="url" 
                                            value={contentUrl} 
                                            onChange={(e) => setContentUrl(e.target.value)} 
                                            placeholder="https://..." 
                                            disabled={!!file}
                                            className="rounded-3"
                                        />
                                        <Form.Text className="text-muted" style={{ fontSize: '11px' }}>
                                            Isi kolom ini jika Anda memilih mengarahkan peserta ke link luar dibanding mengunggah file langsung.
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            )}

                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold small">Deskripsi Singkat / Catatan (Opsional)</Form.Label>
                                    <Form.Control 
                                        as="textarea" 
                                        rows={2} 
                                        value={description} 
                                        onChange={(e) => setDescription(e.target.value)} 
                                        placeholder="Tulis ringkasan singkat materi atau catatan khusus untuk peserta..."
                                        className="rounded-3"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end gap-2 mt-2">
                            {editingId && (
                                <Button variant="outline-secondary" onClick={resetForm} className="rounded-pill px-4" disabled={submitLoading}>
                                    Batal
                                </Button>
                            )}
                            <Button type="submit" variant="primary" className="rounded-pill px-4 shadow-sm fw-semibold d-flex align-items-center gap-1.5" disabled={submitLoading}>
                                {submitLoading ? (
                                    <>
                                        <Spinner size="sm" animation="border" /> Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={16} /> {editingId ? 'Simpan Perubahan' : 'Terbitkan Konten'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {/* LIST MATERIALS CARD */}
            <Card className="border-0 shadow-sm rounded-4">
                <Card.Header className="bg-white border-0 pt-4 px-4 pb-2">
                    <h5 className="fw-extrabold text-dark mb-0">Daftar Materi Event</h5>
                    <small className="text-secondary">Daftar seluruh materi yang diatur untuk event space ini</small>
                </Card.Header>
                <Card.Body className="p-4">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="text-muted mt-2 small">Memuat daftar materi...</p>
                        </div>
                    ) : materials.length === 0 ? (
                        <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                            <FileText size={40} className="opacity-25 mb-2 mx-auto text-secondary" />
                            <h6 className="fw-bold text-dark mb-1">Belum Ada Materi Acara</h6>
                            <p className="small text-muted mb-0">Materi yang Anda unggah di sini akan langsung terdistribusi secara private ke peserta.</p>
                        </div>
                    ) : (
                        <Table responsive hover className="align-middle border-light">
                            <thead>
                                <tr className="text-secondary small fw-semibold" style={{ borderBottomWidth: '2px' }}>
                                    <th>Detail Materi</th>
                                    <th>Hari / Sesi</th>
                                    <th>Pemateri</th>
                                    <th>Tipe</th>
                                    <th>Status</th>
                                    <th>Sumber</th>
                                    <th className="text-end">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materials.map((mat) => {
                                    const typeDetails = getTypeDetails(mat.type);
                                    return (
                                        <tr key={mat.id}>
                                            <td>
                                                <div className="fw-bold text-dark" style={{ fontSize: '13.5px' }}>{mat.title}</div>
                                                {mat.description && <div className="text-muted small text-truncate" style={{ maxWidth: '280px', fontSize: '11px' }}>{mat.description}</div>}
                                            </td>
                                            <td>
                                                {mat.session_name ? (
                                                    <span className="fw-medium text-secondary" style={{ fontSize: '12px' }}>{mat.session_name}</span>
                                                ) : (
                                                    <span className="text-muted small italic" style={{ fontSize: '11px' }}>Umum</span>
                                                )}
                                            </td>
                                            <td>
                                                {mat.speaker_name ? (
                                                    <span className="fw-medium text-dark" style={{ fontSize: '12px' }}>🎤 {mat.speaker_name}</span>
                                                ) : (
                                                    <span className="text-muted small" style={{ fontSize: '11px' }}>-</span>
                                                )}
                                            </td>
                                            <td>
                                                <Badge bg={`${typeDetails.color}-subtle`} className={`text-${typeDetails.color} border border-${typeDetails.color} border-opacity-10 rounded-pill px-2.5 py-1.5 small fw-semibold d-inline-flex align-items-center gap-1`}>
                                                    {typeDetails.icon}
                                                    <span>{typeDetails.label}</span>
                                                </Badge>
                                            </td>
                                            <td>
                                                {mat.status === 'published' ? (
                                                    <Badge bg="success-subtle" className="text-success border border-success border-opacity-10 rounded px-2 py-1 small fw-semibold">
                                                        🚀 Published
                                                    </Badge>
                                                ) : (
                                                    <Badge bg="secondary-subtle" className="text-secondary border border-secondary border-opacity-10 rounded px-2 py-1 small fw-semibold">
                                                        📁 Draft
                                                    </Badge>
                                                )}
                                            </td>
                                            <td>
                                                {mat.file_path ? (
                                                    <Button 
                                                        variant="link" 
                                                        href={mat.file_url} 
                                                        target="_blank" 
                                                        rel="noreferrer" 
                                                        className="p-0 text-primary small d-flex align-items-center gap-1"
                                                    >
                                                        <Download size={14} /> Berkas Fisik
                                                    </Button>
                                                ) : mat.content_url ? (
                                                    <Button 
                                                        variant="link" 
                                                        href={mat.content_url} 
                                                        target="_blank" 
                                                        rel="noreferrer" 
                                                        className="p-0 text-primary small d-flex align-items-center gap-1"
                                                    >
                                                        <LinkIcon size={14} /> Tautan Luar
                                                    </Button>
                                                ) : (
                                                    <span className="text-muted small">-</span>
                                                )}
                                            </td>
                                            <td className="text-end">
                                                <div className="d-inline-flex gap-1.5">
                                                    <Button 
                                                        variant="outline-primary" 
                                                        size="sm" 
                                                        onClick={() => handleEdit(mat)} 
                                                        className="rounded-circle p-1.5 d-flex border"
                                                    >
                                                        <Edit size={14} />
                                                    </Button>
                                                    <Button 
                                                        variant="outline-danger" 
                                                        size="sm" 
                                                        onClick={() => handleDelete(mat.id)} 
                                                        className="rounded-circle p-1.5 d-flex border"
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default MaterialManager;
