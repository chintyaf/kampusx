import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Table, Badge, Spinner } from 'react-bootstrap';
import { Building, ShieldCheck, Mail } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const AdminInstitutionsManage = () => {
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [name, setName] = useState('');
    const [type, setType] = useState('university');
    const [description, setDescription] = useState('');
    const [ownerEmail, setOwnerEmail] = useState('');

    const fetchInstitutions = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/admin/institutions`);
            setInstitutions(res.data.data || []);
        } catch (error) {
            toast.error("Gagal mengambil data institusi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstitutions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`/api/admin/institutions`, {
                name, type, description, owner_email: ownerEmail
            });
            toast.success(res.data.message || "Institusi berhasil didaftarkan!");
            // Reset form
            setName(''); setType('university'); setDescription(''); setOwnerEmail('');
            fetchInstitutions();
        } catch (error) {
            toast.error(error.response?.data?.message || "Gagal membuat institusi");
        }
    };

    const getTypeBadge = (t) => {
        const types = {
            'university': { bg: 'primary', label: 'Universitas' },
            'company': { bg: 'dark', label: 'Perusahaan' },
            'student_org': { bg: 'info', label: 'BEM / HIMA' },
            'community': { bg: 'success', label: 'Komunitas' },
        };
        const active = types[t] || types['community'];
        return <Badge bg={active.bg}>{active.label}</Badge>;
    };

    return (
        <div className="mt-4">
            <Toaster />
            <h4 className="mb-4 d-flex align-items-center fw-bold">
                <ShieldCheck className="me-2 text-danger" size={28} />
                Registrasi Institusi Induk (Super Admin)
            </h4>
            
            <Card className="mb-4 border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                    <h6 className="mb-3 fw-bold">Buka Pendaftaran Institusi Baru</h6>
                    <Form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <Form.Group className="col-md-6">
                                <Form.Label>Nama Entitas Resmi</Form.Label>
                                <Form.Control required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Universitas Gadjah Mada" />
                            </Form.Group>
                            
                            <Form.Group className="col-md-6">
                                <Form.Label>Kategori/Tipe</Form.Label>
                                <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
                                    <option value="university">Universitas Kampus</option>
                                    <option value="company">Perusahaan Swasta</option>
                                    <option value="student_org">Organisasi Mahasiswa (BEM/DLM)</option>
                                    <option value="community">Komunitas Publik</option>
                                </Form.Select>
                            </Form.Group>
                            
                            <Form.Group className="col-12">
                                <Form.Label>Email Direktur / Ketua (Initial Owner)</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text"><Mail size={16} /></span>
                                    <Form.Control required type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder="email.ketua@kampus.ac.id" />
                                </div>
                                <Form.Text className="text-muted">
                                    User ini akan memegang kekuasaan penuh untuk mengelola staf dan membuat acara atas nama institusi di atas. Pastikan user sudah register di KampusX.
                                </Form.Text>
                            </Form.Group>
                            
                            <Form.Group className="col-12">
                                <Form.Label>Deskripsi Profil</Form.Label>
                                <Form.Control as="textarea" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
                            </Form.Group>
                        </div>
                        <Button type="submit" variant="danger" className="mt-4 px-4 rounded-pill">
                             Daftarkan Entitas
                        </Button>
                    </Form>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                    <h6 className="mb-3 fw-bold">Entitas Organisasi/Kampus di Sistem Saat Ini</h6>
                    {loading ? <Spinner animation="border" size="sm" /> : (
                        <Table responsive hover className="align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Institusi</th>
                                    <th>Tipe</th>
                                    <th>Total Staff / User</th>
                                </tr>
                            </thead>
                            <tbody>
                                {institutions.length === 0 ? (
                                    <tr><td colSpan="3" className="text-center text-muted">Belum ada institusi tercatat.</td></tr>
                                ) : institutions.map(inst => (
                                    <tr key={inst.id}>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <Building size={16} className="text-secondary" />
                                                <div className="fw-semibold">{inst.name}</div>
                                            </div>
                                        </td>
                                        <td>{getTypeBadge(inst.type)}</td>
                                        <td>{inst.users?.length || 0} Pengurus</td>
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

export default AdminInstitutionsManage;
