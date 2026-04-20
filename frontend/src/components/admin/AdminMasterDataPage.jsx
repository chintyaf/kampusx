import React, { useState, useEffect } from 'react';
import { Tab, Tabs, Card, Form, Button, Table, Spinner, Badge } from 'react-bootstrap';
import { Layers, Bookmark, Building, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import AdminInstitutionsManage from '../institution/AdminInstitutionsManage';

const GenericMasterDataCRUD = ({ title, endpoint, itemName }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [name, setName] = useState('');
    const [editingId, setEditingId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Kita pakai endpoint master public GET jika ada, atau admin endpoint jika butuh
            // Anggap GET bisa diakses dari public (seperti yang sudah exist)
            const res = await axios.get(endpoint.get);
            setData(res.data.data || []);
        } catch (error) {
            toast.error(`Gagal mengambil data ${itemName}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`${endpoint.admin}/${editingId}`, { name });
                toast.success(`${itemName} berhasil diperbarui`);
            } else {
                await axios.post(endpoint.admin, { name });
                toast.success(`${itemName} berhasil ditambahkan`);
            }
            setName('');
            setEditingId(null);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || `Gagal memproses ${itemName}`);
        }
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setName(item.name);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`Yakin ingin menghapus ${itemName} ini? Data yang terkait dengan Event tidak bisa dihapus.`)) return;
        try {
            await axios.delete(`${endpoint.admin}/${id}`);
            toast.success(`${itemName} berhasil dihapus`);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Gagal menghapus data. Kemungkinan data sedang dipakai oleh suatu acara.");
        }
    };

    const handleCancelEdit = () => {
        setName('');
        setEditingId(null);
    };

    return (
        <div>
            <Card className="mb-4 border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                    <h6 className="fw-bold mb-3">{editingId ? `Edit ${itemName}` : `Tambah ${itemName} Baru`}</h6>
                    <Form onSubmit={handleSubmit} className="d-flex align-items-end gap-3 flex-wrap">
                        <Form.Group className="flex-grow-1">
                            <Form.Label className="small fw-semibold text-muted">Nama {itemName}</Form.Label>
                            <Form.Control required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={`Contoh: ${itemName === 'Kategori' ? 'Teknologi' : 'Seminar'}`} />
                        </Form.Group>
                        <Button type="submit" variant={editingId ? "warning" : "primary"} className="px-4">
                            {editingId ? "Simpan Perubahaan" : "Tambahkan"}
                        </Button>
                        {editingId && (
                            <Button variant="light" onClick={handleCancelEdit}>Batal</Button>
                        )}
                    </Form>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                    <h6 className="fw-bold mb-3">Daftar {title} Aktif</h6>
                    {loading ? <Spinner animation="border" size="sm" /> : (
                        <Table responsive hover className="align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Nama {itemName}</th>
                                    <th className="text-end">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length === 0 ? (
                                    <tr><td colSpan="3" className="text-center text-muted">Kosong</td></tr>
                                ) : data.map(item => (
                                    <tr key={item.id}>
                                        <td className="text-muted">#{item.id}</td>
                                        <td className="fw-semibold">{item.name}</td>
                                        <td className="text-end">
                                            <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => handleEdit(item)}>
                                                <Edit size={14} />
                                            </Button>
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(item.id)}>
                                                <Trash2 size={14} />
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

const AdminMasterDataPage = () => {
    return (
        <div className="container mt-4">
            <Toaster />
            <h4 className="mb-4 d-flex align-items-center fw-bold">
                <Layers className="me-2 text-primary" size={28} />
                Master Data Control Panel
            </h4>
            
            <Tabs defaultActiveKey="institutions" className="mb-4 custom-tabs">
                <Tab eventKey="institutions" title={<><Building size={16} className="me-1"/> Institusi Induk</>}>
                    {/* Menggunakan komponen Institusi Manajer yang lama dengan fitur CRUD tambahan di dalam file itu jika diperlukan. Atau biarkan struktur utamanya. */}
                    <AdminInstitutionsManage />
                </Tab>
                <Tab eventKey="categories" title={<><Bookmark size={16} className="me-1"/> Kategori Acara</>}>
                    <GenericMasterDataCRUD 
                        title="Kategori Acara" 
                        itemName="Kategori"
                        endpoint={{ get: '/api/categories', admin: '/api/admin/categories' }}
                    />
                </Tab>
                <Tab eventKey="eventTypes" title={<><Bookmark size={16} className="me-1"/> Tipe Acara</>}>
                    <GenericMasterDataCRUD 
                        title="Tipe Acara" 
                        itemName="Tipe Event"
                        endpoint={{ get: '/api/event-types', admin: '/api/admin/event-types' }}
                    />
                </Tab>
            </Tabs>
            
            <style>{`
                .custom-tabs .nav-link { color: #6c757d; font-weight: 500; border-radius: 8px 8px 0 0; }
                .custom-tabs .nav-link.active { background-color: white; border-bottom: 3px solid #0d6efd; color: #0d6efd; }
            `}</style>
        </div>
    );
};

export default AdminMasterDataPage;
