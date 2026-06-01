import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Megaphone, FileText, Download, ExternalLink, RefreshCw, Calendar, Image } from 'lucide-react';
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
            // Fetch official announcements
            const res = await api.get(`/events/${eventId}/announcements`);
            const fetchedAnnouncements = res.data.data || [];

            // Fetch notifications
            let filteredNotifications = [];
            try {
                const resNotif = await api.get('/notifications');
                if (resNotif.data?.success) {
                    const allNotifs = resNotif.data.data || [];
                    filteredNotifications = allNotifs.filter(notif => {
                        const notifData = typeof notif.data === 'string'
                            ? JSON.parse(notif.data)
                            : (notif.data || {});

                        const notifEventId = notifData.event_id;
                        const matchesEvent = String(notifEventId) === String(eventId);

                        const relevantTypes = ['event_updated', 'H-24', 'H-1', 'M-15'];
                        const matchesType = relevantTypes.includes(notifData.type);

                        return matchesEvent && matchesType;
                    });
                }
            } catch (err) {
                console.error("Gagal mengambil notifikasi:", err);
            }

            // Format and merge them
            const mappedAnnouncements = fetchedAnnouncements.map(ann => ({
                id: `ann-${ann.id}`,
                title: ann.title,
                content: ann.content,
                date: ann.created_at,
                type: 'announcement',
                isPinned: true,
                raw: ann
            }));

            const mappedNotifications = filteredNotifications.map(notif => {
                const notifData = typeof notif.data === 'string'
                    ? JSON.parse(notif.data)
                    : (notif.data || {});

                return {
                    id: `notif-${notif.id}`,
                    title: notifData.title || 'Update Acara',
                    content: notifData.message,
                    date: notif.created_at,
                    type: notifData.type,
                    isPinned: ['H-1', 'M-15'].includes(notifData.type)
                };
            });

            // Sort chronologically (latest first)
            const combined = [...mappedAnnouncements, ...mappedNotifications].sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });

            setAnnouncements(combined);
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
						<Card key={ann.id} className="border border-light rounded-4 shadow-sm p-3.5 mb-3">
							<div className="d-flex justify-content-between align-items-start mb-2">
								<div className="text-muted small d-flex align-items-center gap-1.5" style={{ fontSize: '11px' }}>
									<Calendar size={13} className="text-primary" />
									<span>
										{new Date(ann.date).toLocaleDateString('id-ID', {
											day: '2-digit',
											month: 'long',
											year: 'numeric',
											hour: '2-digit',
											minute: '2-digit'
										})}
									</span>
								</div>
							</div>

							<h6 className="fw-extrabold text-dark mb-1.5">{ann.title}</h6>
							<p className="text-muted small mb-3" style={{ fontSize: '12.5px', lineHeight: '1.6', wordBreak: 'break-word', whiteSpace: 'pre-line' }}>
								{ann.content}
							</p>

							{/* Attachment indicator if exists */}
							{ann.raw && ann.raw.attachment_path && (
								<div className="p-2.5 rounded-3 bg-light border d-inline-flex align-items-center justify-content-between gap-3" style={{ maxWidth: '300px' }}>
									<div className="d-flex align-items-center gap-2 text-dark small" style={{ fontSize: '11.5px' }}>
										{ann.raw.attachment_type === 'pdf' ? (
											<FileText size={16} className="text-danger flex-shrink-0" />
										) : (
											<Image size={16} className="text-primary flex-shrink-0" />
										)}
										<span className="text-truncate fw-medium" style={{ maxWidth: '180px' }}>
											{ann.raw.attachment_path.split('/').pop()}
										</span>
									</div>
									<Button
										variant="link"
										href={ann.raw.attachment_url}
										target="_blank"
										rel="noopener noreferrer"
										className="p-0 text-primary small d-flex align-items-center gap-1 text-decoration-none fw-bold"
										style={{ fontSize: '11px' }}
									>
										Lihat <ExternalLink size={12} />
									</Button>
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