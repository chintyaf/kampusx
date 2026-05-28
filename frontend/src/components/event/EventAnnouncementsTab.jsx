import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Megaphone, FileText, Download, ExternalLink, RefreshCw } from 'lucide-react';
import api from '../../api/axios';

const EventAnnouncementsTab = ({ eventId }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAnnouncements = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);
        setError(null);
        try {
            const res = await api.get(`/events/${eventId}/announcements`);
            setAnnouncements(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch announcements:', err);
            setError('Gagal memuat pengumuman event.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (eventId) {
            fetchAnnouncements();
        }
    }, [eventId]);

    // Helper untuk memformat rentang waktu lampau (time ago)
    const formatTimeAgo = (dateString) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60000);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 1) return 'Baru saja';
            if (diffMins < 60) return `${diffMins} menit yang lalu`;
            if (diffHours < 24) return `${diffHours} jam yang lalu`;
            if (diffDays < 7) return `${diffDays} hari yang lalu`;

            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (e) {
            return 'Baru saja';
        }
    };

    if (loading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center py-5">
                <Spinner animation="border" variant="primary" style={{ width: '2.5rem', height: '2.5rem' }} />
                <p className="text-muted mt-3 small fw-medium">Memuat Pengumuman Terbaru...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="warning" className="border-0 shadow-sm rounded-4 p-4 d-flex justify-content-between align-items-center">
                <div>
                    <h6 className="fw-bold mb-1">Gagal Memuat Data</h6>
                    <p className="mb-0 text-muted small">{error}</p>
                </div>
                <Button variant="outline-warning" size="sm" className="rounded-pill px-3" onClick={() => fetchAnnouncements()}>
                    Coba Lagi
                </Button>
            </Alert>
        );
    }

    return (
        <div className="event-announcements-tab fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <div>
                    <h5 className="fw-extrabold text-dark mb-1 d-flex align-items-center gap-2">
                        <Megaphone className="text-primary animate-pulse" size={20} /> Pengumuman Event Space
                    </h5>
                    <p className="text-secondary small mb-0">Informasi terhangat dan berkas materi pelengkap dari panitia.</p>
                </div>
                
                <Button 
                    variant="light" 
                    size="sm"
                    className="rounded-pill px-3 border fw-semibold text-muted d-flex align-items-center gap-1.5 shadow-sm"
                    onClick={() => fetchAnnouncements(true)}
                    disabled={refreshing}
                >
                    <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                    {refreshing ? 'Memperbarui...' : 'Refresh'}
                </Button>
            </div>

            {announcements.length === 0 ? (
                <div className="text-center py-5 text-muted bg-light rounded-4 border border-dashed">
                    <Megaphone size={40} className="opacity-25 mb-2 mx-auto" />
                    <h6 className="fw-bold text-dark mb-1">Belum Ada Pengumuman</h6>
                    <p className="small mb-0">Penyelenggara saat ini belum membagikan pengumuman atau siaran baru.</p>
                </div>
            ) : (
                <div className="d-flex flex-column gap-4">
                    {announcements.map((ann) => (
                        <Card 
                            key={ann.id} 
                            className="border-0 shadow-sm rounded-4 overflow-hidden hover-shadow transition-all bg-white" 
                            style={{ borderLeft: '4px solid var(--color-primary, #1A365D)' }}
                        >
                            {/* BUNGKUS TEKS DENGAN PADDING (p-4) */}
                            <div className="p-4 pb-3">
                                {/* Metadata */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span className="badge bg-primary bg-opacity-10 border border-primary border-opacity-10 rounded px-2.5 py-1.5 small fw-bold" style={{ fontSize: '10px' }}>
                                        UPDATE INFORMASI
                                    </span>
                                    <span className="text-muted small" style={{ fontSize: '11px' }}>
                                        {formatTimeAgo(ann.created_at)}
                                    </span>
                                </div>

                                {/* Title & Body */}
                                <h5 className="fw-extrabold text-dark mb-2">{ann.title}</h5>
                                <p className="text-muted small mb-0" style={{ fontSize: '13.5px', lineHeight: '1.75', wordBreak: 'break-word', whiteSpace: 'pre-line' }}>
                                    {ann.content}
                                </p>
                            </div>

                            {/* TAMPILAN LAMPIRAN */}
                            {ann.attachment_path && (
                                <div>
                                    {/* Jika lampiran adalah PDF (Tetap di dalam area padding bawah) */}
                                    {ann.attachment_type !== 'image' && (
                                        <div className="px-4 pb-4 pt-2">
                                            <div className="p-3.5 rounded-4 bg-light border d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3" style={{ maxWidth: '500px' }}>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-danger bg-opacity-10 text-danger rounded-circle p-2.5 border border-danger border-opacity-10 d-flex flex-shrink-0">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div className="text-start overflow-hidden">
                                                        <h6 className="fw-bold text-dark mb-1 text-truncate" style={{ fontSize: '13px', maxWidth: '240px' }}>
                                                            {ann.attachment_path.split('/').pop()}
                                                        </h6>
                                                        <span className="text-muted small" style={{ fontSize: '11px' }}>Dokumen Lampiran Resmi</span>
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="primary"
                                                    href={ann.attachment_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="rounded-pill px-4 py-2 fw-bold d-flex align-items-center justify-content-center gap-1.5 shadow-sm"
                                                    style={{
                                                        backgroundColor: 'var(--color-primary, #1A365D)',
                                                        borderColor: 'var(--color-primary, #1A365D)',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    <Download size={14} /> Unduh PDF
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Jika lampiran adalah GAMBAR (Full Width, tidak kena padding p-4) */}
                                    {ann.attachment_type === 'image' && (
                                        <div className="mt-2 position-relative border-top">
                                            <img 
                                                src={ann.attachment_url} 
                                                alt="Lampiran Pengumuman"
                                                className="w-100 cursor-pointer"
                                                style={{ maxHeight: '400px', objectFit: 'cover', display: 'block' }}
                                                onClick={() => window.open(ann.attachment_url, '_blank')}
                                            />
                                            <div className="bg-light p-2 text-center border-top">
                                                <Button
                                                    variant="link"
                                                    href={ann.attachment_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-0 text-primary fw-bold text-decoration-none d-inline-flex align-items-center gap-1.5"
                                                    style={{ fontSize: '12px' }}
                                                >
                                                    Buka Gambar Penuh <ExternalLink size={13} />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventAnnouncementsTab;