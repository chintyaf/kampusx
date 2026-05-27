import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Tabs, Tab, Placeholder, Button } from 'react-bootstrap';
import { Share2, Building, Calendar, MapPin, ExternalLink } from 'lucide-react';
import api from '../../api/axios'; // Pastikan path ini benar sesuai struktur folder
import { Link } from 'react-router-dom';

const PublicProfile = () => {
    const { id } = useParams();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get(`/profile/${id}`);
                if (response.data.success) {
                    setProfileData(response.data.data);
                } else {
                    setError('Gagal memuat profil.');
                }
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Terjadi kesalahan saat mengambil profil. Pastikan user tersedia.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Helper component for Event Card
    const EventCard = ({ event }) => {
        // Tentukan path gambar, fallback jika tidak ada
        const imageSrc = event.image_path 
            ? `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}/storage/${event.image_path}` 
            : 'https://placehold.co/600x400?text=No+Image';

        return (
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ height: '160px', overflow: 'hidden' }}>
                    <Card.Img 
                        variant="top" 
                        src={imageSrc} 
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        alt={event.title}
                        onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Error+Loading+Image' }}
                    />
                </div>
                <Card.Body className="d-flex flex-column">
                    <Card.Title className="fs-6 fw-bold mb-2 line-clamp-2">{event.title}</Card.Title>
                    <div className="text-muted small mb-3 mt-auto">
                        <div className="d-flex align-items-center mb-1">
                            <Calendar size={14} className="me-2 text-primary" />
                            {new Date(event.start_date).toLocaleDateString('id-ID', { 
                                day: 'numeric', month: 'short', year: 'numeric' 
                            })}
                        </div>
                    </div>
                    <Link to={`/events/${event.id}`} className="btn btn-outline-primary btn-sm w-100 rounded-pill">
                        Lihat Event <ExternalLink size={14} className="ms-1" />
                    </Link>
                </Card.Body>
            </Card>
        );
    };

    if (error) {
        return (
            <Container className="py-5 text-center mt-5">
                <Card className="border-0 shadow-sm p-5 mx-auto" style={{ maxWidth: '500px', borderRadius: '16px' }}>
                    <h4 className="text-danger">Oops!</h4>
                    <p className="text-muted">{error}</p>
                    <Button variant="primary" as={Link} to="/" className="rounded-pill mt-3 px-4">Kembali ke Beranda</Button>
                </Card>
            </Container>
        );
    }

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '40px' }}>
            {/* Header / Cover Area */}
            <div 
                style={{ 
                    height: '200px', 
                    background: 'linear-gradient(135deg, var(--bs-primary) 0%, #6610f2 100%)',
                    marginBottom: '80px'
                }}
            ></div>

            <Container>
                <Row className="justify-content-center">
                    <Col lg={8} md={10}>
                        {/* Profile Info Card */}
                        <Card className="border-0 shadow-sm mb-4 text-center px-3 pb-4" style={{ marginTop: '-120px', borderRadius: '16px' }}>
                            <div className="d-flex justify-content-center position-relative">
                                {loading ? (
                                    <Placeholder animation="glow" className="rounded-circle border border-4 border-white shadow-sm" style={{ width: '130px', height: '130px', marginTop: '-65px', backgroundColor: '#e9ecef' }} />
                                ) : (
                                    <img 
                                        src={profileData?.profile?.avatar} 
                                        alt="Avatar" 
                                        className="rounded-circle border border-4 border-white shadow-sm"
                                        style={{ width: '130px', height: '130px', objectFit: 'cover', marginTop: '-65px', backgroundColor: '#fff' }}
                                    />
                                )}
                            </div>
                            
                            <Card.Body className="pt-3">
                                {loading ? (
                                    <Placeholder as={Card.Title} animation="glow">
                                        <Placeholder xs={6} className="mb-2" />
                                    </Placeholder>
                                ) : (
                                    <Card.Title className="fs-3 fw-bold mb-1">{profileData?.profile?.name}</Card.Title>
                                )}

                                {loading ? (
                                    <Placeholder as="p" animation="glow" className="mb-3">
                                        <Placeholder xs={4} />
                                    </Placeholder>
                                ) : (
                                    <p className="text-muted mb-3 d-flex align-items-center justify-content-center">
                                        <Building size={16} className="me-2" /> 
                                        {profileData?.profile?.institution}
                                    </p>
                                )}

                                {/* Interests Section */}
                                <div className="mb-4">
                                    {loading ? (
                                        <Placeholder animation="glow">
                                            <Placeholder xs={2} className="me-2 rounded-pill" />
                                            <Placeholder xs={3} className="me-2 rounded-pill" />
                                            <Placeholder xs={2} className="rounded-pill" />
                                        </Placeholder>
                                    ) : (
                                        <div className="d-flex flex-wrap justify-content-center gap-2">
                                            {profileData?.interests?.map((interest) => (
                                                <Badge bg="light" text="dark" key={interest.id} className="px-3 py-2 border rounded-pill fw-normal shadow-sm">
                                                    #{interest.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Share Button */}
                                <div>
                                    <Button 
                                        variant={copied ? "success" : "outline-primary"} 
                                        className="rounded-pill px-4 d-inline-flex align-items-center transition"
                                        onClick={handleShare}
                                        disabled={loading}
                                    >
                                        <Share2 size={16} className="me-2" />
                                        {copied ? 'Link Tersalin!' : 'Share Profil'}
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* History Events Section */}
                        <Card className="border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                            <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 px-4">
                                <h5 className="fw-bold mb-3">Histori Event</h5>
                            </Card.Header>
                            <Card.Body className="px-4 pb-4">
                                {loading ? (
                                    <div>
                                        <Placeholder animation="glow" className="mb-4">
                                            <Placeholder xs={3} className="me-3" />
                                            <Placeholder xs={3} />
                                        </Placeholder>
                                        <Row className="g-3">
                                            {[1, 2].map((i) => (
                                                <Col md={6} key={i}>
                                                    <Card className="border-0 shadow-sm">
                                                        <Placeholder animation="glow" style={{ height: '160px', backgroundColor: '#e9ecef' }} />
                                                        <Card.Body>
                                                            <Placeholder as={Card.Title} animation="glow"><Placeholder xs={8} /></Placeholder>
                                                            <Placeholder as={Card.Text} animation="glow"><Placeholder xs={5} /></Placeholder>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    </div>
                                ) : (
                                    <Tabs defaultActiveKey="mendatang" id="event-history-tabs" className="mb-4 custom-tabs">
                                        <Tab 
                                            eventKey="mendatang" 
                                            title={`Event Mendatang (${profileData?.history?.upcoming?.length || 0})`}
                                        >
                                            {profileData?.history?.upcoming?.length > 0 ? (
                                                <Row className="g-4">
                                                    {profileData.history.upcoming.map((event) => (
                                                        <Col md={6} key={event.id}>
                                                            <EventCard event={event} />
                                                        </Col>
                                                    ))}
                                                </Row>
                                            ) : (
                                                <div className="text-center py-5 text-muted">
                                                    <Calendar size={48} className="mb-3 opacity-50" />
                                                    <p>Belum ada event mendatang yang akan diikuti.</p>
                                                </div>
                                            )}
                                        </Tab>
                                        <Tab 
                                            eventKey="selesai" 
                                            title={`Event Selesai (${profileData?.history?.past?.length || 0})`}
                                        >
                                            {profileData?.history?.past?.length > 0 ? (
                                                <Row className="g-4">
                                                    {profileData.history.past.map((event) => (
                                                        <Col md={6} key={event.id}>
                                                            <EventCard event={event} />
                                                        </Col>
                                                    ))}
                                                </Row>
                                            ) : (
                                                <div className="text-center py-5 text-muted">
                                                    <Calendar size={48} className="mb-3 opacity-50" />
                                                    <p>Belum ada histori event yang pernah diselesaikan.</p>
                                                </div>
                                            )}
                                        </Tab>
                                    </Tabs>
                                )}
                            </Card.Body>
                        </Card>

                    </Col>
                </Row>
            </Container>

            {/* Tambahkan style CSS secara inline untuk mempercantik nav-tabs */}
            <style>{`
                .custom-tabs {
                    border-bottom: 2px solid #e9ecef;
                }
                .custom-tabs .nav-link {
                    color: #6c757d;
                    border: none;
                    border-bottom: 2px solid transparent;
                    font-weight: 500;
                    padding-bottom: 12px;
                    margin-bottom: -2px;
                }
                .custom-tabs .nav-link:hover {
                    color: var(--bs-primary);
                    border-color: transparent;
                }
                .custom-tabs .nav-link.active {
                    color: var(--bs-primary);
                    background: transparent;
                    border-bottom: 2px solid var(--bs-primary);
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default PublicProfile;
