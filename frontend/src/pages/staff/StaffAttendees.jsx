import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Nav, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import api from '../../api/axios';

const StaffAttendees = () => {
    const navigate = useNavigate();
    
    const [allTickets, setAllTickets] = useState([]);
    const [filter, setFilter] = useState('all'); // 'all', 'used', 'available'

    useEffect(() => {
        const event = JSON.parse(localStorage.getItem('staff_event') || 'null');
        const pin = localStorage.getItem('staff_pin');

        if (!event || !pin) {
            navigate('/staff/login');
            return;
        }

        api.get('/v1/staff/search-tickets', {
            params: { event_id: event.id, pos_pin: pin, q: '' }
        })
        .then(res => setAllTickets(res.data.data || []))
        .catch(err => console.error("Gagal load peserta:", err));
    }, [navigate]);

    const displayedTickets = allTickets.filter(t => {
        if (filter === 'used') return t.status === 'used';
        if (filter === 'available') return t.status !== 'used';
        return true;
    });

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="bg-white border-bottom py-3 sticky-top shadow-sm">
                <Container className="d-flex align-items-center gap-3">
                    <Button variant="light" className="p-2 border-0 bg-transparent text-dark" onClick={() => navigate('/staff/dashboard')}>
                        <ArrowLeft size={24} />
                    </Button>
                    <h5 className="fw-bold mb-0">Daftar Peserta</h5>
                </Container>
            </div>

            <Container className="flex-grow-1 py-4">
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="bg-white border-bottom p-2">
                        <Nav variant="pills" className="d-flex flex-nowrap overflow-x-auto" style={{ gap: 8, WebkitOverflowScrolling: 'touch' }}>
                            {[
                                { id: 'all', label: `Semua (${allTickets.length})`, bg: 'bg-primary text-white' },
                                { id: 'used', label: `Hadir (${allTickets.filter(t => t.status === 'used').length})`, bg: 'bg-success text-white' },
                                { id: 'available', label: `Belum (${allTickets.filter(t => t.status !== 'used').length})`, bg: 'bg-warning text-dark' }
                            ].map(tab => (
                                <Nav.Item key={tab.id}>
                                    <Nav.Link 
                                        active={filter === tab.id} 
                                        onClick={() => setFilter(tab.id)}
                                        className={`rounded-pill fw-bold px-3 py-2 ${filter === tab.id ? tab.bg : 'text-secondary bg-light'}`}
                                    >
                                        {tab.label}
                                    </Nav.Link>
                                </Nav.Item>
                            ))}
                        </Nav>
                    </div>

                    <Card.Body className="p-0">
                        {displayedTickets.length === 0 ? (
                            <div className="text-center text-muted p-5">
                                <Search size={32} className="opacity-25 mb-3" />
                                <p>Tidak ada data di kategori ini.</p>
                            </div>
                        ) : (
                            <div style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
                                {displayedTickets.map((t, i) => (
                                    <div key={t.id} className={`d-flex justify-content-between align-items-center p-3 ${i !== displayedTickets.length - 1 ? 'border-bottom' : ''}`}>
                                        <div className="overflow-hidden pe-2">
                                            <h6 className="fw-bold mb-1 text-truncate" style={{ fontSize: 14 }}>{t.attendee_name}</h6>
                                            <span className="text-muted small text-truncate d-block" style={{ fontSize: 12 }}>{t.ticket_code} · {t.attendee_email}</span>
                                        </div>
                                        <Badge bg={t.status === 'used' ? 'success' : 'secondary'} className="rounded-pill px-3 py-2 flex-shrink-0">
                                            {t.status === 'used' ? 'Hadir' : 'Belum'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};
export default StaffAttendees;