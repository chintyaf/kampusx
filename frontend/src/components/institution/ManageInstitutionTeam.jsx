import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Table, Badge, Spinner } from 'react-bootstrap';
import { Users, MailPlus, Trash2, KeyRound } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const ManageInstitutionTeam = ({ institutionId }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('admin'); // owner (hanya awal), admin, member

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/institutions/${institutionId}/members`);
            setMembers(res.data.data || []);
        } catch (error) {
            toast.error("Gagal mengambil data tim pengurus");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (institutionId) fetchMembers();
    }, [institutionId]);

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`/api/institutions/${institutionId}/members`, {
                email, role
            });
            toast.success(res.data.message || "Staf berhasil ditambahkan!");
            setEmail('');
            fetchMembers();
        } catch (error) {
            toast.error(error.response?.data?.message || "Gagal menambah staf");
        }
    };

    const handleRemove = async (userId) => {
        if (!window.confirm("Cabut hak akses perwakilan ini? Mereka tidak akan bisa membuat acara atas nama institusi lagi.")) return;
        try {
            const res = await axios.delete(`/api/institutions/${institutionId}/members/${userId}`);
            toast.success(res.data.message || "Akses staf dicabut.");
            fetchMembers();
        } catch (error) {
            toast.error(error.response?.data?.message || "Gagal mencabut akses.");
        }
    };

    const getRoleBadge = (r) => {
        if (r === 'owner') return <Badge bg="danger"><KeyRound size={12} className="me-1"/> Ketua / Owner</Badge>;
        if (r === 'admin') return <Badge bg="primary">Event Creator</Badge>;
        return <Badge bg="secondary">Staf / Member</Badge>;
    };

    return (
        <div className="mt-4">
            <Toaster />
            <h5 className="mb-3 d-flex align-items-center fw-bold">
                <Users className="me-2 text-primary" size={24} />
                Manajemen Tim Organizer
            </h5>
            
            <Card className="mb-4 border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                    <h6 className="mb-2 fw-bold">Tunjuk Perwakilan Acara (Delegation)</h6>
                    <p className="text-muted small mb-4">Tambahkan panitia atau staf yang berhak membuat atau mengatur acara mengatasnamakan perusahaan/institusi Anda.</p>
                    
                    <Form onSubmit={handleInvite} className="d-flex align-items-end gap-3 flex-wrap">
                        <Form.Group className="flex-grow-1" style={{ minWidth: '250px' }}>
                            <Form.Label className="small fw-semibold">Email Pengguna (User Terdaftar)</Form.Label>
                            <div className="input-group">
                                <span className="input-group-text"><MailPlus size={16} /></span>
                                <Form.Control required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email.staff@example.com" />
                            </div>
                        </Form.Group>
                        
                        <Form.Group style={{ width: '200px' }}>
                            <Form.Label className="small fw-semibold">Tugas (Peran)</Form.Label>
                            <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
                                <option value="admin">Event Creator (Bisa bikin acara)</option>
                                <option value="member">Staff Biasa (Read only)</option>
                            </Form.Select>
                        </Form.Group>
                        
                        <Button type="submit" variant="primary" className="px-4">Berikan Akses</Button>
                    </Form>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                    <h6 className="mb-3 fw-bold">Daftar Panitia Inti Institusi</h6>
                    {loading ? <Spinner animation="border" size="sm" /> : (
                        <Table responsive hover className="align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Nama Perwakilan</th>
                                    <th>Email</th>
                                    <th>Wewenang</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.length === 0 ? (
                                    <tr><td colSpan="4" className="text-center text-muted">Belum ada staf yang diangkat.</td></tr>
                                ) : members.map(m => (
                                    <tr key={m.id}>
                                        <td className="fw-semibold">{m.name}</td>
                                        <td className="text-muted">{m.email}</td>
                                        <td>{getRoleBadge(m.pivot?.role)}</td>
                                        <td>
                                            {m.pivot?.role !== 'owner' && (
                                                <Button variant="outline-danger" size="sm" onClick={() => handleRemove(m.id)}>
                                                    <Trash2 size={16} /> Cabut Akses
                                                </Button>
                                            )}
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

export default ManageInstitutionTeam;
