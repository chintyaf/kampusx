import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Spinner, Alert, InputGroup } from 'react-bootstrap';
import {
    Search,
    SlidersHorizontal,
    X,
    RotateCcw,
	Heart,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EventCard from '../components/event/EventCard';
import api from '../api/axios';

// ── Shared chip style ─────────────────────────────────────────────────────────
const chipStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: 'var(--bahama-blue-50, #E6F3F9)', // Fallback color
    color: 'var(--color-primary, #00699E)',
    border: '1px solid var(--color-border-blue, #B3D8E8)',
    borderRadius: 99,
    padding: '4px 12px',
    fontSize: 12,
    fontWeight: 600,
};

// ── FilterSidebar (Tanpa Search Bar & Tombol Apply) ───────────────────────────
const FilterSidebar = ({ filters, onChange, onReset, dbCategories = [] }) => (
    <Card style={{ borderRadius: 12, border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
            <span style={{ fontWeight: 700, fontSize: 'var(--font-sm)', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <SlidersHorizontal size={15} color="var(--color-primary)" /> Filter
            </span>
            <button onClick={onReset} style={{ background: 'none', border: 'none', padding: 0, fontSize: 'var(--font-xs)', color: 'var(--color-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                <RotateCcw size={12} /> Reset
            </button>
        </div>

        <div style={{ padding: '20px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
            <Form>
                {/* Tipe Lokasi */}
                <Form.Group style={{ marginBottom: 24 }}>
                    <Form.Label style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 12 }}>Tipe Lokasi</Form.Label>
                    {['Online', 'In-Person'].map((type) => (
                        <Form.Check
                            key={type}
                            type="checkbox"
                            id={`loc-${type}`}
                            label={type}
                            checked={filters.locationType.includes(type)}
                            onChange={(e) => {
                                const next = e.target.checked
                                    ? [...filters.locationType, type]
                                    : filters.locationType.filter((t) => t !== type);
                                onChange('locationType', next);
                            }}
                            style={{ fontSize: 'var(--font-sm)', marginBottom: 8 }}
                        />
                    ))}
                </Form.Group>

                {/* Harga */}
                <Form.Group style={{ marginBottom: 24 }}>
                    <Form.Label style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 12 }}>Harga</Form.Label>
                    {['Semua', 'Gratis', 'Berbayar'].map((p) => (
                        <Form.Check
                            key={p}
                            type="radio"
                            id={`price-${p}`}
                            label={p}
                            name="price"
                            checked={filters.price === p}
                            onChange={() => onChange('price', p)}
                            style={{ fontSize: 'var(--font-sm)', marginBottom: 8 }}
                        />
                    ))}
                </Form.Group>

                {/* Kategori */}
                <Form.Group style={{ marginBottom: 8 }}>
                    <Form.Label style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 12 }}>Kategori</Form.Label>
                    <Form.Select
                        value={filters.category}
                        onChange={(e) => onChange('category', e.target.value)}
                        style={{ fontSize: 'var(--font-sm)', borderRadius: 8, padding: '10px' }}>
                        <option value="">Semua Kategori</option>
                        {dbCategories.map((cat) => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </Form.Select>
                </Form.Group>
            </Form>
        </div>
    </Card>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const ExploreEvents = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // States
    const [filtered, setFiltered] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const [dbCategories, setDbCategories] = useState([]);

    const sanitizeQueryParam = (val, fallback = '') => {
        if (!val || val.toLowerCase() === 'on' || val.toLowerCase() === 'undefined') {
            return fallback;
        }
        return val;
    };

    const defaultFilters = {
        search: sanitizeQueryParam(searchParams.get('search'), ''),
        locationType: [],
        price: sanitizeQueryParam(searchParams.get('price'), 'Semua'),
        category: sanitizeQueryParam(searchParams.get('category'), '')
    };
    
    // Single source of truth untuk filter (agar real-time)
    const [filters, setFilters] = useState(defaultFilters);
    const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

    // Debounce khusus untuk input search agar tidak spam API saat mengetik
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.search);
        }, 500); // delay 500ms
        return () => clearTimeout(timer);
    }, [filters.search]);

    // Fetch API setiap kali filters (selain search ketikan aktif) berubah
    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            try {
                const params = {};
                if (debouncedSearch.trim()) params.search = debouncedSearch;
                if (filters.category) params.category = filters.category;
                if (filters.price !== 'Semua') params.price = filters.price.toLowerCase();

                const [eventsRes, categoriesRes] = await Promise.all([
                    api.get('/events', { params }),
                    api.get('/categories')
                ]);

                const result = eventsRes.data;
                const raw = result?.data?.data ?? result?.data ?? result;
                let resultData = raw;

                // Client-side filtering untuk Location Type
                if (filters.locationType.includes('Online') && !filters.locationType.includes('In-Person')) {
                    resultData = raw.filter((ev) => ev.is_online || ev.location_type === 'online');
                } else if (filters.locationType.includes('In-Person') && !filters.locationType.includes('Online')) {
                    resultData = raw.filter((ev) => ev.is_in_person || ev.location_type === 'offline' || ev.location_type === 'hybrid');
                }

                setFiltered(resultData);
                setDbCategories(categoriesRes.data?.data ?? categoriesRes.data ?? []);
            } catch (err) {
                console.error(err);
                setError('Gagal memuat data event.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, [debouncedSearch, filters.category, filters.price, filters.locationType]);

    const handleChange = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }));
    const resetFilters = () => setFilters({ search: '', locationType: [], price: 'Semua', category: '' });

    // Hitung filter aktif (di luar search)
    const activeCount = filters.locationType.length + (filters.price !== 'Semua' ? 1 : 0) + (filters.category ? 1 : 0);

    return (
        <div style={{ background: 'var(--color-bg, #F8FAFC)', minHeight: '100vh', paddingBottom: 56 }}>
            {/* ── Header & Search Bar ──────────────────────────────────────────────── */}
            <div style={{ background: '#fff', borderBottom: '1px solid var(--color-border)', padding: '24px 0', marginBottom: 32 }}>
                <Container>
                    <Row className="align-items-end">
                        <Col lg={6} className="mb-3 mb-lg-0">
                            <h2 style={{ fontWeight: 800, color: 'var(--color-text)', fontSize: '1.75rem', margin: '0 0 4px' }}>Eksplor Event</h2>
                            <p style={{ color: 'var(--color-secondary)', fontSize: 'var(--font-sm)', margin: 0 }}>Temukan event terbaik dari seluruh kampus Indonesia</p>
                        </Col>
                        <Col lg={6}>
                            <InputGroup style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.05)', borderRadius: 8 }}>
                                <InputGroup.Text style={{ background: '#fff', borderRight: 'none', borderColor: 'var(--color-border)' }}>
                                    <Search size={18} color="var(--color-secondary)" />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Cari event, topik, atau pembicara..."
                                    value={filters.search}
                                    onChange={(e) => handleChange('search', e.target.value)}
                                    style={{ borderLeft: 'none', borderColor: 'var(--color-border)', padding: '12px 0' }}
                                />
                                {filters.search && (
                                    <InputGroup.Text onClick={() => handleChange('search', '')} style={{ background: '#fff', borderLeft: 'none', borderColor: 'var(--color-border)', cursor: 'pointer' }}>
                                        <X size={18} color="var(--color-secondary)" />
                                    </InputGroup.Text>
                                )}
                            </InputGroup>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* ── Mobile Filter Overlay ────────────────────────────────────────────── */}
            {showMobileFilter && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1050, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowMobileFilter(false)}>
                    <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text)' }}>Filter Event</span>
                            <button onClick={() => setShowMobileFilter(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} color="var(--color-secondary)" />
                            </button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                            <FilterSidebar filters={filters} onChange={handleChange} onReset={resetFilters} dbCategories={dbCategories} />
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', background: '#fff' }}>
                            <button onClick={() => setShowMobileFilter(false)} style={{ width: '100%', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontWeight: 600 }}>Tampilkan {filtered.length} Event</button>
                        </div>
                    </div>
                </div>
            )}

            <Container>
                <Row className="g-4">
                    {/* ── Sidebar (Desktop) ───────────────────────────────────────── */}
                    <Col lg={3} className="d-none d-lg-block">
                        <FilterSidebar filters={filters} onChange={handleChange} onReset={resetFilters} dbCategories={dbCategories} />
                    </Col>

                    {/* ── Content Area ────────────────────────────────────────────── */}
                    <Col lg={9}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-secondary)', fontWeight: 500 }}>
                                {isLoading ? 'Memuat data...' : `Menampilkan ${filtered.length} event`}
                            </span>

                            {/* Tombol Mobile Filter */}
                            <button className="d-lg-none" onClick={() => setShowMobileFilter(true)} style={{ background: '#fff', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '8px 16px', fontSize: 'var(--font-sm)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <SlidersHorizontal size={14} /> Filter {activeCount > 0 && <span style={{ background: 'var(--color-primary)', color: '#fff', padding: '2px 6px', borderRadius: 99, fontSize: 10 }}>{activeCount}</span>}
                            </button>
                        </div>

                        {/* Active Filter Chips */}
                        {activeCount > 0 && (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                                {filters.locationType.map((t) => (
                                    <span key={t} style={chipStyle}>{t} <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleChange('locationType', filters.locationType.filter((x) => x !== t))} /></span>
                                ))}
                                {filters.price !== 'Semua' && (
                                    <span style={chipStyle}>{filters.price} <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleChange('price', 'Semua')} /></span>
                                )}
                                {filters.category && (
                                    <span style={chipStyle}>{filters.category} <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleChange('category', '')} /></span>
                                )}
                                <button onClick={resetFilters} style={{ background: 'none', border: 'none', fontSize: 'var(--font-xs)', color: 'var(--color-secondary)', cursor: 'pointer', fontWeight: 600, paddingLeft: 8 }}>Hapus semua</button>
                            </div>
                        )}

                        {/* States: Loading, Error, Empty, Grid */}
                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: '80px 0' }}>
                                <Spinner animation="border" style={{ color: 'var(--color-primary)' }} />
                            </div>
                        ) : error ? (
                            <Alert variant="danger">{error}</Alert>
                        ) : filtered.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-secondary)' }}>
                                <Search size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                                <h5 style={{ color: 'var(--color-text)', fontWeight: 700 }}>Tidak ada event ditemukan</h5>
                                <p>Coba sesuaikan kata kunci atau hapus beberapa filter.</p>
                                <button onClick={resetFilters} style={{ marginTop: 12, background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 24px', fontWeight: 600 }}>Reset Semua</button>
                            </div>
                        ) : (
                            <Row className="g-4">
                                {filtered.map((ev) => (
                                    <Col xs={12} md={6} xl={4} key={ev.id}>
                                        <EventCard ev={ev} onClick={() => navigate(`/event/${ev.id}`)} />
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ExploreEvents;