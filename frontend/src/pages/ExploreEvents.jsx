import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Spinner, Alert, InputGroup } from 'react-bootstrap';
import {
    Search,
    SlidersHorizontal,
    X,
    RotateCcw,
    Heart,
    Sparkles,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EventCard from '../components/event/EventCard';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

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
const FilterSidebar = ({ filters, onChange, onReset, dbCategories = [], dbEventTypes = [] }) => (
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
                {/* Tipe Lokasi -> Format Event */}
                <Form.Group style={{ marginBottom: 24 }}>
                    <Form.Label style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 12 }}>Format Event</Form.Label>
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
                <Form.Group style={{ marginBottom: 24 }}>
                    <Form.Label style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 12 }}>Kategori</Form.Label>
                    <div style={{ maxHeight: '160px', overflowY: 'auto', paddingRight: '4px', border: '1px solid var(--color-border-soft, #e2e8f0)', borderRadius: 8, padding: '8px 12px', background: '#f8fafc' }}>
                        {dbCategories.length === 0 ? (
                            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-secondary)' }}>Memuat kategori...</div>
                        ) : (
                            dbCategories.map((cat) => (
                                <Form.Check
                                    key={cat.id}
                                    type="checkbox"
                                    id={`cat-${cat.id}`}
                                    label={cat.name}
                                    checked={filters.category.includes(cat.name)}
                                    onChange={(e) => {
                                        const next = e.target.checked
                                            ? [...filters.category, cat.name]
                                            : filters.category.filter((c) => c !== cat.name);
                                        onChange('category', next);
                                    }}
                                    style={{ fontSize: 'var(--font-xs)', marginBottom: 8, color: 'var(--color-text)' }}
                                />
                            ))
                        )}
                    </div>
                </Form.Group>

                {/* Tipe Event */}
                <Form.Group style={{ marginBottom: 24 }}>
                    <Form.Label style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 12 }}>Tipe Event</Form.Label>
                    <div style={{ maxHeight: '160px', overflowY: 'auto', paddingRight: '4px', border: '1px solid var(--color-border-soft, #e2e8f0)', borderRadius: 8, padding: '8px 12px', background: '#f8fafc' }}>
                        {dbEventTypes.length === 0 ? (
                            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-secondary)' }}>Memuat tipe event...</div>
                        ) : (
                            dbEventTypes.map((type) => (
                                <Form.Check
                                    key={type.id}
                                    type="checkbox"
                                    id={`type-${type.id}`}
                                    label={type.name}
                                    checked={filters.eventType.includes(type.name)}
                                    onChange={(e) => {
                                        const next = e.target.checked
                                            ? [...filters.eventType, type.name]
                                            : filters.eventType.filter((t) => t !== type.name);
                                        onChange('eventType', next);
                                    }}
                                    style={{ fontSize: 'var(--font-xs)', marginBottom: 8, color: 'var(--color-text)' }}
                                />
                            ))
                        )}
                    </div>
                </Form.Group>

                {/* Rentang Tanggal Event */}
                <Form.Group style={{ marginBottom: 8 }}>
                    <Form.Label style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 12 }}>Tanggal Event</Form.Label>
                    <Row className="g-2">
                        <Col xs={6}>
                            <Form.Control
                                type="date"
                                value={filters.dateStart}
                                onChange={(e) => onChange('dateStart', e.target.value)}
                                style={{ fontSize: '11px', borderRadius: 8, padding: '8px' }}
                            />
                            <div style={{ fontSize: '10px', color: 'var(--color-secondary)', marginTop: 4, textAlign: 'center' }}>Dari</div>
                        </Col>
                        <Col xs={6}>
                            <Form.Control
                                type="date"
                                value={filters.dateEnd}
                                min={filters.dateStart} // Mencegah user memilih tgl akhir yang mendahului tgl awal
                                onChange={(e) => onChange('dateEnd', e.target.value)}
                                style={{ fontSize: '11px', borderRadius: 8, padding: '8px' }}
                            />
                            <div style={{ fontSize: '10px', color: 'var(--color-secondary)', marginTop: 4, textAlign: 'center' }}>Sampai</div>
                        </Col>
                    </Row>
                </Form.Group>
            </Form>
        </div>
    </Card>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const ExploreEvents = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // States
    const [filtered, setFiltered] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const [dbCategories, setDbCategories] = useState([]);
    const [dbEventTypes, setDbEventTypes] = useState([]);
    const [personalizedEvents, setPersonalizedEvents] = useState([]);

    const sanitizeQueryParam = (val, fallback = '') => {
        if (!val || val.toLowerCase() === 'on' || val.toLowerCase() === 'undefined') {
            return fallback;
        }
        return val;
    };

    const getInitialCategory = () => {
        const catParam = sanitizeQueryParam(searchParams.get('category'), '');
        return catParam ? [catParam] : [];
    };

    const getInitialEventType = () => {
        const typeParam = sanitizeQueryParam(searchParams.get('eventType'), '');
        return typeParam ? [typeParam] : [];
    };

    const defaultFilters = {
        search: sanitizeQueryParam(searchParams.get('search'), ''),
        locationType: [],
        price: sanitizeQueryParam(searchParams.get('price'), 'Semua'),
        category: getInitialCategory(),
        eventType: getInitialEventType(),
        dateStart: sanitizeQueryParam(searchParams.get('dateStart'), ''),
        dateEnd: sanitizeQueryParam(searchParams.get('dateEnd'), ''),
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

    // Sync URL searchParams to state when URL changes
    useEffect(() => {
        const searchVal = sanitizeQueryParam(searchParams.get('search'), '');
        const categoryVal = sanitizeQueryParam(searchParams.get('category'), '');
        const eventTypeVal = sanitizeQueryParam(searchParams.get('eventType'), '');
        const priceVal = sanitizeQueryParam(searchParams.get('price'), 'Semua');
        const dateStartVal = sanitizeQueryParam(searchParams.get('dateStart'), '');
        const dateEndVal = sanitizeQueryParam(searchParams.get('dateEnd'), '');
        
        const nextCategoryArr = categoryVal ? [categoryVal] : [];
        const nextEventTypeArr = eventTypeVal ? [eventTypeVal] : [];

        setFilters((prev) => {
            const prevCategoryStr = prev.category.join(',');
            const nextCategoryStr = nextCategoryArr.join(',');
            const prevEventTypeStr = prev.eventType.join(',');
            const nextEventTypeStr = nextEventTypeArr.join(',');

            if (
                prev.search === searchVal &&
                prevCategoryStr === nextCategoryStr &&
                prevEventTypeStr === nextEventTypeStr &&
                prev.price === priceVal &&
                prev.dateStart === dateStartVal &&
                prev.dateEnd === dateEndVal
            ) {
                return prev;
            }
            return {
                ...prev,
                search: searchVal,
                category: nextCategoryArr,
                eventType: nextEventTypeArr,
                price: priceVal,
                dateStart: dateStartVal,
                dateEnd: dateEndVal,
            };
        });
    }, [searchParams]);


    // Fetch API setiap kali filters (selain search ketikan aktif) berubah
    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            try {
                const params = {};
                if (debouncedSearch.trim()) params.search = debouncedSearch;
                if (filters.price !== 'Semua') params.price = filters.price.toLowerCase();

                const [eventsRes, categoriesRes, eventTypesRes, personalizedRes] = await Promise.all([
                    api.get('/events', { params }),
                    api.get('/categories'),
                    api.get('/event-types'),
                    isAuthenticated
                        ? api.get('/events/personalized').catch((err) => {
                            console.error('Gagal memuat event personalisasi:', err);
                            return { data: { data: [] } };
                          })
                        : Promise.resolve({ data: { data: [] } })
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

                // TAMBAHAN: Client-side filtering untuk Harga
                if (filters.price === 'Gratis') {
                    resultData = resultData.filter((ev) => Number(ev.price) === 0);
                } else if (filters.price === 'Berbayar') {
                    resultData = resultData.filter((ev) => Number(ev.price) > 0);
                }

                // Client-side filtering untuk Kategori (bisa pilih lebih dari satu)
                if (filters.category && filters.category.length > 0) {
                    resultData = resultData.filter((ev) => {
                        if (!ev.categories || ev.categories.length === 0) return false;
                        return ev.categories.some((cat) => filters.category.includes(cat.name));
                    });
                }

                // Client-side filtering untuk Tipe Event (bisa pilih lebih dari satu)
                if (filters.eventType && filters.eventType.length > 0) {
                    resultData = resultData.filter((ev) => {
                        const types = ev.event_types || ev.eventTypes;
                        if (!types || types.length === 0) return false;
                        return types.some((t) => filters.eventType.includes(t.name));
                    });
                }

				// Client-side filtering untuk Rentang Tanggal
                if (filters.dateStart || filters.dateEnd) {
                    resultData = resultData.filter((ev) => {
                        if (!ev.start_date) return false;
                        
                        // Potong string dari DB ("2026-06-25 17:24:13") 
                        // Ambil 10 karakter pertamanya saja menjadi "2026-06-25"
                        const eventDateString = ev.start_date.substring(0, 10); 

                        let isAfterStart = true;
                        let isBeforeEnd = true;

                        // Perbandingan string "YYYY-MM-DD" sangat aman di Javascript
                        if (filters.dateStart) {
                            isAfterStart = eventDateString >= filters.dateStart;
                        }
                        if (filters.dateEnd) {
                            isBeforeEnd = eventDateString <= filters.dateEnd;
                        }

                        return isAfterStart && isBeforeEnd; 
                    });
                }

                setFiltered(resultData);
                setDbCategories(categoriesRes.data?.data ?? categoriesRes.data ?? []);
                setDbEventTypes(eventTypesRes.data?.data ?? eventTypesRes.data ?? []);
                setPersonalizedEvents(personalizedRes.data?.data ?? personalizedRes.data ?? []);
            } catch (err) {
                console.error(err);
                setError('Gagal memuat data event.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, [debouncedSearch, filters.category, filters.eventType, filters.price, filters.locationType, filters.dateStart, filters.dateEnd]);

    const handleChange = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }));
    const resetFilters = () => setFilters({ search: '', locationType: [], price: 'Semua', category: [], eventType: [], dateStart: '', dateEnd: '' });

    // Hitung filter aktif (di luar search)
    const activeCount = filters.locationType.length + (filters.price !== 'Semua' ? 1 : 0) + filters.category.length + filters.eventType.length + (filters.dateStart || filters.dateEnd ? 1 : 0);

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
                                    placeholder="Cari event atau organizer..."
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
                            <FilterSidebar filters={filters} onChange={handleChange} onReset={resetFilters} dbCategories={dbCategories} dbEventTypes={dbEventTypes} />
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
                    <Col lg={3} className="d-none d-lg-block" style={{ position: 'sticky', top: '24px', alignSelf: 'start', height: 'fit-content', zIndex: 10 }}>
                        <FilterSidebar filters={filters} onChange={handleChange} onReset={resetFilters} dbCategories={dbCategories} dbEventTypes={dbEventTypes} />
                    </Col>

                    {/* ── Content Area ────────────────────────────────────────────── */}
                    <Col lg={9}>
                        {/* Section 1: Personalized Events */}
                        {!isLoading && isAuthenticated && activeCount === 0 && !filters.search && personalizedEvents.length > 0 && (
                            <div style={{ marginBottom: 40 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                                    {/* <Sparkles size={18} color="var(--color-primary)" /> */}
                                    <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-text)', margin: 0 }}>
                                        Rekomendasi Untuk Kamu
                                    </h3>
                                </div>
                                <Row className="g-4">
                                    {personalizedEvents.map((ev) => (
                                        <Col xs={12} md={6} xl={4} key={`pers-${ev.id}`}>
                                            <EventCard ev={ev} onClick={() => navigate(`/event/${ev.slug || ev.id}`)} />
                                        </Col>
                                    ))}
                                </Row>
                                <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '32px 0 24px' }} />
                            </div>
                        )}

                        {/* Section 2: All / Filtered Events */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                            <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-text)', margin: 0 }}>
                                {(activeCount > 0 || filters.search) ? 'Hasil Pencarian' : 'Semua Event'}
                            </h3>
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
                                {filters.category.map((cat) => (
                                    <span key={cat} style={chipStyle}>{cat} <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleChange('category', filters.category.filter((x) => x !== cat))} /></span>
                                ))}
                                {filters.eventType.map((type) => (
                                    <span key={type} style={chipStyle}>{type} <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleChange('eventType', filters.eventType.filter((x) => x !== type))} /></span>
                                ))}
								{/* Chip Rentang Tanggal */}
                                {(filters.dateStart || filters.dateEnd) && (
                                    <span style={chipStyle}>
                                        {filters.dateStart ? new Date(filters.dateStart).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Awal'} 
                                        {' - '}
                                        {filters.dateEnd ? new Date(filters.dateEnd).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Akhir'}
                                        <X size={12} style={{ cursor: 'pointer', marginLeft: 4 }} onClick={() => setFilters(prev => ({ ...prev, dateStart: '', dateEnd: '' }))} />
                                    </span>
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
                                        <EventCard ev={ev} onClick={() => navigate(`/event/${ev.slug || ev.id}`)} />
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