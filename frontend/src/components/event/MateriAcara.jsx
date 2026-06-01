import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Form, Button, Table, Badge, Spinner, Modal, Row, Col, InputGroup } from 'react-bootstrap';
import { 
    Plus, Trash2, Edit2, Eye, EyeOff, FileText, Code, Palette, LinkIcon, 
    FileQuestion, Inbox, Upload, X, Search, AlertCircle, Sparkles, Check 
} from 'lucide-react';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';

const MateriAcara = () => {
    const { eventId } = useParams(); // Ambil eventId dari parameter URL

    // State Management
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal & Form State
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null); // null if adding, id if editing
    
    const [formData, setFormData] = useState({
        title: '',
        session_name: '',
        speaker_name: '',
        type: 'document', // document, code_repo, design_interactive, media_form
        description: '',
        status: 'published', // draft, published
        content_url: '',
    });
    
    const [selectedFiles, setSelectedFiles] = useState(null);
    const fileInputRef = useRef(null);

    // Fetch Materials from API Backend
    const fetchMaterials = async () => {
        setIsLoading(true);
        try {
            const res = await api.get(`/organizer/events/${eventId}/materials`);
            if (res.data?.success) {
                setMaterials(res.data.data || []);
            }
        } catch (error) {
            console.error('Fetch materials error:', error);
            toast.error('Gagal memuat daftar materi acara.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (eventId) {
            fetchMaterials();
        }
    }, [eventId]);

    // Handle Form Input Change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const MAX_SIZE = 50 * 1024 * 1024; // Limit 50MB

        let validFiles = [];
        let hasError = false;

        files.forEach(file => {
            if (file.size > MAX_SIZE) {
                toast.error(`Berkas ${file.name} terlalu besar! Maksimal 50MB.`);
                hasError = true;
            } else {
                validFiles.push(file);
            }
        });

        if (validFiles.length > 0) {
            setSelectedFiles(validFiles);
        } else if (hasError) {
            if (fileInputRef.current) fileInputRef.current.value = null;
            setSelectedFiles([]);
        }
    };

    // Open Modal for Add
    const openAddModal = () => {
        setEditingId(null);
        setFormData({
            title: '',
            session_name: '',
            speaker_name: '',
            type: 'document',
            description: '',
            status: 'published',
            content_url: '',
        });
        setSelectedFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = null;
        setShowModal(true);
    };

    // Open Modal for Edit (Loads existing material)
    const openEditModal = (material) => {
        setEditingId(material.id);
        setFormData({
            title: material.title || '',
            session_name: material.session_name || '',
            speaker_name: material.speaker_name || '',
            type: material.type || 'document',
            description: material.description || '',
            status: material.status || 'published',
            content_url: material.content_url || '',
        });
        setSelectedFiles([]);
        setShowModal(true);
    };

    // Handle Create Materi
    const handleCreate = async (submitData) => {
        setSubmitLoading(true);
        try {
            await api.post(`/organizer/events/${eventId}/materials`, submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Materi baru berhasil diterbitkan!');
            setShowModal(false);
            fetchMaterials();
        } catch (error) {
            console.error('Create material error:', error);
            const msg = error.response?.data?.message || 'Gagal menambahkan materi baru.';
            toast.error(msg);
        } finally {
            setSubmitLoading(false);
        }
    };

    // Handle Update Materi
    const handleUpdate = async (id, submitData) => {
        setSubmitLoading(true);
        try {
            // Laravel PUT request workaround for multipart/form-data
            submitData.append('_method', 'PUT');
            await api.post(`/organizer/events/${eventId}/materials/${id}`, submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Materi berhasil diperbarui!');
            setShowModal(false);
            fetchMaterials();
        } catch (error) {
            console.error('Update material error:', error);
            const msg = error.response?.data?.message || 'Gagal memperbarui materi.';
            toast.error(msg);
        } finally {
            setSubmitLoading(false);
        }
    };

    // Submit Handler (Validates & Prepares FormData)
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error('Judul materi wajib diisi!');
            return;
        }

        if (formData.type !== 'document' && !formData.content_url.trim()) {
            toast.error('Tautan URL sumber wajib diisi untuk tipe ini!');
            return;
        }

        const submitData = new FormData();
        submitData.append('title', formData.title.trim());
        submitData.append('session_name', formData.session_name.trim());
        submitData.append('speaker_name', formData.speaker_name.trim());
        submitData.append('type', formData.type);
        submitData.append('description', formData.description.trim());
        submitData.append('status', formData.status);

       if (formData.type === 'document') {
            if (selectedFiles.length > 0) {
                // Append multiple files menggunakan bracket array
                selectedFiles.forEach((file) => {
                    submitData.append('files[]', file); 
                });
            } else if (formData.content_url.trim()) {
                submitData.append('content_url', formData.content_url.trim());
            }
        } else {
            submitData.append('content_url', formData.content_url.trim());
        }

        if (editingId) {
            handleUpdate(editingId, submitData);
        } else {
            handleCreate(submitData);
        }
    };

    // Handle Delete Materi
    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus materi ini secara permanen?')) return;
        
        try {
            await api.delete(`/organizer/events/${eventId}/materials/${id}`);
            toast.success('Materi berhasil dihapus!');
            fetchMaterials();
        } catch (error) {
            console.error('Delete material error:', error);
            toast.error('Gagal menghapus materi.');
        }
    };

    // Toggle Status (Publish / Unpublish)
    const toggleStatus = async (material) => {
        const newStatus = material.status === 'published' ? 'draft' : 'published';
        
        try {
            const submitData = new FormData();
            submitData.append('title', material.title);
            submitData.append('type', material.type);
            submitData.append('status', newStatus);
            submitData.append('_method', 'PUT');

            await api.post(`/organizer/events/${eventId}/materials/${material.id}`, submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            toast.success(newStatus === 'published' ? 'Materi berhasil diterbitkan!' : 'Materi ditarik menjadi draft!');
            fetchMaterials();
        } catch (error) {
            console.error('Toggle status error:', error);
            toast.error('Gagal mengubah status materi.');
        }
    };

    // Get Badge & Icon configurations for rendering types
    const getTypeConfig = (t) => {
        switch (t) {
            case 'document':
                return { label: 'Dokumen', bg: 'primary', icon: <FileText size={14} className="me-1" /> };
            case 'code_repo':
                return { label: 'Repo Kode', bg: 'dark', icon: <Code size={14} className="me-1" /> };
            case 'design_interactive':
                return { label: 'Desain Berkas', bg: 'danger', icon: <Palette size={14} className="me-1" /> };
            case 'media_form':
                return { label: 'Media Form', bg: 'info', icon: <LinkIcon size={14} className="me-1" /> };
            default:
                return { label: 'Tautan', bg: 'secondary', icon: <FileQuestion size={14} className="me-1" /> };
        }
    };

    // Mengumpulkan opsi unik dari data saat ini untuk datalist autocomplete (Creatable Select)
    const existingSessions = [...new Set(materials.map(m => m.session_name).filter(Boolean))];
    const existingSpeakers = [...new Set(materials.map(m => m.speaker_name).filter(Boolean))];

    // Filter materials based on search query
    const filteredMaterials = materials.filter(mat => {
        const query = searchQuery.toLowerCase();
        return (
            (mat.title || '').toLowerCase().includes(query) ||
            (mat.description || '').toLowerCase().includes(query) ||
            (mat.session_name || '').toLowerCase().includes(query) ||
            (mat.speaker_name || '').toLowerCase().includes(query)
        );
    });

    return (
        <div className="container-fluid p-4" style={{ minHeight: '80vh' }}>
            <Toaster position="top-right" />

            {/* HEADER SECTION */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
                <div>
                    <h3 className="fw-bold mb-1 text-dark" style={{ letterSpacing: '-0.5px' }}>Manajemen Materi Acara</h3>
                    <p className="text-secondary small mb-0">Kelola slide presentasi, dokumen, berkas UI/UX, dan repositori latihan bagi para peserta.</p>
                </div>
                <Button 
                    variant="primary" 
                    onClick={openAddModal}
                    className="rounded-pill px-4 py-2.5 fw-bold shadow-sm d-flex align-items-center gap-2 transition-all hover-scale"
                >
                    <Plus size={18} />
                    <span>Tambah Materi</span>
                </Button>
            </div>

            {isLoading ? (
                <div className="d-flex flex-column align-items-center justify-content-center py-5">
                    <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                    <p className="text-muted mt-3 small fw-semibold">Memuat data Resource Center...</p>
                </div>
            ) : materials.length === 0 ? (
                /* EMPTY STATE */
                <Card className="border-0 shadow-sm rounded-4 py-5 text-center bg-white transition-all">
                    <Card.Body className="p-5 d-flex flex-column align-items-center">
                        <div className="bg-light p-4 rounded-circle mb-4 border border-dashed d-inline-flex text-muted">
                            <Inbox size={48} className="opacity-75" />
                        </div>
                        <h4 className="fw-bold text-dark mb-2">Belum Ada Materi untuk Acara Ini</h4>
                        <p className="text-muted small mx-auto mb-4" style={{ maxWidth: '400px' }}>
                            Organizer belum menerbitkan berkas atau link pembelajaran. Materi yang ditambahkan akan tampil privat di EventSpace peserta yang valid.
                        </p>
                        <Button 
                            variant="primary" 
                            onClick={openAddModal}
                            className="rounded-pill px-4 py-2.5 fw-bold shadow-sm d-flex align-items-center gap-2"
                        >
                            <Plus size={18} />
                            <span>Mulai Tambah Materi</span>
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                /* TABLE / LIST DATA */
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                    <Card.Header className="bg-white border-0 pt-4 px-4 pb-2">
                        <Row className="g-3 align-items-center justify-content-between">
                            <Col xs={12} md={4}>
                                <InputGroup className="border rounded-pill overflow-hidden bg-light">
                                    <InputGroup.Text className="bg-transparent border-0 text-muted ps-3 py-2">
                                        <Search size={18} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Cari judul, pembicara, atau sesi..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-transparent border-0 py-2 shadow-none small"
                                        style={{ fontSize: '13px' }}
                                    />
                                </InputGroup>
                            </Col>
                            <Col xs="auto">
                                <Badge bg="light" text="dark" className="border px-3 py-2 rounded-pill font-medium small">
                                    Total: {materials.length} berkas
                                </Badge>
                            </Col>
                        </Row>
                    </Card.Header>
                    <Card.Body className="p-0">
                        {filteredMaterials.length === 0 ? (
                            <div className="text-center py-5 text-muted small">
                                Tidak ada materi yang cocok dengan pencarian Anda.
                            </div>
                        ) : (
                            <Table responsive hover className="align-middle mb-0 text-dark border-light">
                                <thead className="bg-light table-light small text-secondary fw-semibold">
                                    <tr style={{ borderBottomWidth: '2px' }}>
                                        <th className="ps-4 py-3">Detail Materi</th>
                                        <th className="py-3">Hari / Sesi</th>
                                        <th className="py-3">Pembicara</th>
                                        <th className="py-3">Tipe</th>
                                        <th className="py-3">Status</th>
                                        <th className="pe-4 py-3 text-end">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMaterials.map((mat) => {
                                        const typeConfig = getTypeConfig(mat.type);
                                        return (
                                            <tr key={mat.id} className="transition-all">
                                                <td className="ps-4 py-3.5">
                                                    <div className="fw-bold text-dark mb-0.5" style={{ fontSize: '13.5px' }}>{mat.title}</div>
                                                    {mat.description ? (
                                                        <div className="text-muted small text-truncate" style={{ maxWidth: '280px', fontSize: '11.5px' }}>
                                                            {mat.description}
                                                        </div>
                                                    ) : (
                                                        <div className="text-secondary opacity-50 italic small" style={{ fontSize: '11px' }}>Tidak ada deskripsi.</div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 fw-medium text-secondary" style={{ fontSize: '12.5px' }}>
                                                    {mat.session_name ? mat.session_name : <span className="text-muted italic opacity-50 small">-</span>}
                                                </td>
                                                <td className="py-3.5 text-dark fw-medium" style={{ fontSize: '12.5px' }}>
                                                    {mat.speaker_name ? `🎤 ${mat.speaker_name}` : <span className="text-muted opacity-50">-</span>}
                                                </td>
                                                <td className="py-3.5">
                                                    <Badge bg={`${typeConfig.bg}-subtle`} className={`text-${typeConfig.bg} border border-${typeConfig.bg} border-opacity-10 rounded-pill px-2.5 py-1.5 small fw-semibold d-inline-flex align-items-center`}>
                                                        {typeConfig.icon}
                                                        <span>{typeConfig.label}</span>
                                                    </Badge>
                                                </td>
                                                <td className="py-3.5">
                                                    {mat.status === 'published' ? (
                                                        <Badge bg="success-subtle" className="text-success border border-success border-opacity-10 rounded px-2.5 py-1.5 small fw-semibold">
                                                            Published
                                                        </Badge>
                                                    ) : (
                                                        <Badge bg="secondary-subtle" className="text-secondary border border-secondary border-opacity-10 rounded px-2.5 py-1.5 small fw-semibold">
                                                            Draft
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="pe-4 py-3.5 text-end">
                                                    <div className="d-inline-flex gap-1.5">
                                                        {/* Toggle Publish / Unpublish */}
                                                        <Button
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            onClick={() => toggleStatus(mat)}
                                                            title={mat.status === 'published' ? 'Tarik jadi Draft' : 'Terbitkan Sekarang'}
                                                            className="rounded-circle p-1.5 d-flex border"
                                                        >
                                                            {mat.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                                                        </Button>
                                                        {/* Edit button */}
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => openEditModal(mat)}
                                                            title="Edit Materi"
                                                            className="rounded-circle p-1.5 d-flex border"
                                                        >
                                                            <Edit2 size={14} />
                                                        </Button>
                                                        {/* Delete button */}
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleDelete(mat.id)}
                                                            title="Hapus Permanen"
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
            )}

            {/* FORM MODAL (ADD / EDIT) */}
            <Modal 
                show={showModal} 
                onHide={() => !submitLoading && setShowModal(false)}
                centered
                size="lg"
                className="custom-modal"
            >
                <Modal.Header closeButton={!submitLoading} className="border-0 pt-4 px-4 pb-0">
                    <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                        {/* <Sparkles size={20} className="text-warning animate-pulse" /> */}
                        <span>{editingId ? 'Edit Materi Acara' : 'Terbitkan Materi Baru'}</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 py-3">
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3">
                            <Col md={12}>
                                <Form.Group className="mb-2">
                                    <Form.Label className="fw-semibold small">Judul Materi <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        required
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Misal: Slide Pemrograman Lanjut Hari ke-1"
                                        className="rounded-3"
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label className="fw-semibold small">Sesi / Hari (Contoh: Day 1 - Sesi Pagi)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="session_name"
                                        value={formData.session_name}
                                        onChange={handleInputChange}
                                        placeholder="Misal: Day 1 - Sesi Pagi"
                                        className="rounded-3"
                                        list="session-options"
                                        autoComplete="off"
                                    />
                                    <datalist id="session-options">
                                        {existingSessions.map((session, idx) => (
                                            <option key={idx} value={session} />
                                        ))}
                                    </datalist>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label className="fw-semibold small">Nama Pembicara (Speaker)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="speaker_name"
                                        value={formData.speaker_name}
                                        onChange={handleInputChange}
                                        placeholder="Misal: Jane Doe, M.Sc."
                                        className="rounded-3"
                                        list="speaker-options"
                                        autoComplete="off"
                                    />
                                    <datalist id="speaker-options">
                                        {existingSpeakers.map((speaker, idx) => (
                                            <option key={idx} value={speaker} />
                                        ))}
                                    </datalist>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label className="fw-semibold small">Tipe Materi</Form.Label>
                                    <Form.Select
                                        name="type"
                                        value={formData.type}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            setSelectedFiles([]);
                                            if (fileInputRef.current) fileInputRef.current.value = null;
                                        }}
                                        className="rounded-3"
                                    >
                                        <option value="document">Dokumen / PDF / Slide (document)</option>
                                        <option value="code_repo">Repository Code GitHub (code_repo)</option>
                                        <option value="design_interactive">Desain Figma / Prototype (design_interactive)</option>
                                        <option value="media_form">Media Form Google Form (media_form)</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label className="fw-semibold small">Status Publikasi</Form.Label>
                                    <div className="d-flex align-items-center gap-4 mt-2">
                                        <Form.Check
                                            type="radio"
                                            id="status-published"
                                            label="Published"
                                            name="status"
                                            value="published"
                                            checked={formData.status === 'published'}
                                            onChange={handleInputChange}
                                            className="fw-medium text-success"
                                        />
                                        <Form.Check
                                            type="radio"
                                            id="status-draft"
                                            label="Draft"
                                            name="status"
                                            value="draft"
                                            checked={formData.status === 'draft'}
                                            onChange={handleInputChange}
                                            className="fw-medium text-secondary"
                                        />
                                    </div>
                                </Form.Group>
                            </Col>

                            {/* DYNAMIC CONDITIONAL RENDERING INPUTS */}
                            <Col md={12}>
                                {formData.type === 'document' ? (
                                    <Form.Group className="mb-2 bg-light p-3 rounded-4 border border-dashed">
                                        <Form.Label className="fw-bold small d-flex justify-content-between">
                                            <span>Unggah Dokumen (PDF, PPT, DOCX, ZIP)</span>
                                            <span className="text-secondary fw-normal">Ukuran Maksimal: 5MB</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="file"
                                            multiple
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
                                            className="rounded-3"
                                        />
                                        {selectedFiles?.length > 0 && (
                                            <div className="mt-2 p-2 bg-white rounded border small">
                                                <span className="fw-bold text-dark d-block mb-1">File Terpilih:</span>
                                                <ul className="mb-0 ps-3 text-primary">
                                                    {selectedFiles.map((file, idx) => (
                                                        <li key={idx}>
                                                            {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        <Form.Text className="text-muted mt-1 small d-block" style={{ fontSize: '11px' }}>
                                            Unggah file langsung ke server aman kami. File akan terproteksi dan hanya bisa diunduh oleh peserta valid.
                                        </Form.Text>
                                        
                                        <div className="text-center my-2 text-secondary small fw-bold">ATAU</div>

                                        <Form.Label className="fw-semibold small mt-1">Gunakan Tautan Berkas Eksternal (GDrive / Dropbox / OneDrive)</Form.Label>
                                        <Form.Control
                                            type="url"
                                            name="content_url"
                                            value={formData.content_url}
                                            onChange={handleInputChange}
                                            placeholder="https://drive.google.com/..."
                                            disabled={selectedFiles?.length > 0}
                                            className="rounded-3"
                                        />
                                    </Form.Group>
                                ) : (
                                    <Form.Group className="mb-2">
                                        <Form.Label className="fw-semibold small">Tautan / URL Berkas Eksternal <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            required
                                            type="url"
                                            name="content_url"
                                            value={formData.content_url}
                                            onChange={handleInputChange}
                                            placeholder="https://..."
                                            className="rounded-3"
                                        />
                                        <Form.Text className="text-muted small mt-1 d-block" style={{ fontSize: '11px' }}>
                                            Masukkan tautan eksternal yang sah (misal link GitHub, proto Figma, atau link GForm).
                                        </Form.Text>
                                    </Form.Group>
                                )}
                            </Col>

                            <Col md={12}>
                                <Form.Group className="mb-2">
                                    <Form.Label className="fw-semibold small">Deskripsi Ringkas (Opsional)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        name="description"
                                        rows={2}
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Ringkasan singkat, petunjuk belajar, atau password zip berkas jika diperlukan..."
                                        className="rounded-3"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top border-light">
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => setShowModal(false)}
                                disabled={submitLoading}
                                className="rounded-pill px-4"
                            >
                                Batal
                            </Button>
                            <Button 
                                type="submit" 
                                variant="primary"
                                disabled={submitLoading}
                                className="rounded-pill px-4 shadow-sm fw-semibold d-flex align-items-center gap-1.5"
                            >
                                {submitLoading ? (
                                    <>
                                        <Spinner size="sm" animation="border" /> Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Check size={16} /> {editingId ? 'Simpan Perubahan' : 'Terbitkan Konten'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default MateriAcara;
