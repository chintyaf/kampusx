import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const Personalization = () => {
    const [categories, setCategories] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                // Asumsi responsenya berupa array of categories atau { data: [...] }
                setCategories(response.data.data || response.data || []);
            } catch (err) {
                console.error(err);
                setError('Gagal memuat daftar minat.');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const toggleInterest = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleSubmit = async () => {
        if (selectedIds.length < 3) {
            setError('Silakan pilih minimal 3 minat.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await api.post('/user/personalization', { category_ids: selectedIds });
            // Redirect ke halaman Beranda/Dashboard setelah sukses
            navigate('/');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Gagal menyimpan personalisasi.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', padding: '20px' }}>
            <Card className="border-0 shadow-lg p-4 p-md-5 w-100" style={{ maxWidth: '600px', borderRadius: '20px' }}>
                <div className="text-center mb-4">
                    <h3 className="fw-bold" style={{ color: 'var(--bs-primary)' }}>Pilih Minat Anda</h3>
                    <p className="text-muted">Bantu kami menyesuaikan rekomendasi event dengan memilih minimal 3 topik yang Anda sukai.</p>
                </div>

                {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}

                <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
                    {loading ? (
                        <div className="text-center w-100 py-4">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : categories.length > 0 ? (
                        categories.map((category) => {
                            const isSelected = selectedIds.includes(category.id);
                            return (
                                <Badge 
                                    key={category.id}
                                    bg={isSelected ? "primary" : "light"}
                                    text={isSelected ? "white" : "dark"}
                                    onClick={() => toggleInterest(category.id)}
                                    style={{ 
                                        cursor: 'pointer', 
                                        fontSize: '1rem',
                                        padding: '10px 20px',
                                        border: isSelected ? '1px solid var(--bs-primary)' : '1px solid #dee2e6',
                                        transition: 'all 0.2s ease-in-out'
                                    }}
                                    className="rounded-pill fw-normal shadow-sm user-select-none"
                                >
                                    {category.name}
                                </Badge>
                            );
                        })
                    ) : (
                        <p className="text-muted">Tidak ada kategori tersedia.</p>
                    )}
                </div>

                <div className="d-grid">
                    <Button 
                        variant="primary" 
                        size="lg" 
                        className="rounded-pill fw-bold"
                        onClick={handleSubmit}
                        disabled={selectedIds.length < 3 || submitting}
                    >
                        {submitting ? 'Menyimpan...' : `Lanjutkan (${selectedIds.length} dipilih)`}
                    </Button>
                </div>
                
                <div className="text-center mt-3">
                    <small className="text-muted">Anda bisa mengubahnya nanti di pengaturan profil.</small>
                </div>
            </Card>
        </Container>
    );
};

export default Personalization;
