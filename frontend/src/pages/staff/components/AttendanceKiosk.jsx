import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Spinner, Badge } from 'react-bootstrap';
import { ArrowLeft, Users, UserCheck, Clock, Search } from 'lucide-react';
import KioskScanner from './KioskScanner';

const AttendanceKiosk = ({
    stats,
    searchQuery,
    searchResults,
    isSearching,
    checkInLogs,
    feedback,
    isScanning,
    scanLock,
    processScan,
    handleSearchChange,
    handleManualCheckIn,
    onBack
}) => {
    const brandColor = 'var(--color-primary, #00699e)';
    
    // Mobile responsiveness states
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
    const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'dashboard'

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 992;
            setIsMobile(mobile);
            if (!mobile) {
                setActiveTab('scan');
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="fade-in">
            {/* Header Sub-Menu */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Button 
                    variant="link" 
                    onClick={onBack} 
                    className="text-secondary p-0 d-flex align-items-center gap-2 text-decoration-none"
                    style={{ color: 'var(--color-secondary, #64748b)' }}
                >
                    <ArrowLeft size={18} />
                    <span className="fw-bold">Pilihan Mode</span>
                </Button>

                <Badge 
                    className="px-4 py-2.5 fs-6 font-extrabold text-uppercase rounded-3 text-white"
                    style={{ 
                        backgroundColor: 'var(--color-primary, #00699e)',
                        letterSpacing: '0.05em'
                    }}
                >
                    Mode: Kehadiran
                </Badge>
            </div>

            {/* Mobile Tab Switcher */}
            {isMobile && (
                <div className="d-flex gap-2 mb-4 bg-light p-1.5 rounded-3 border" style={{ borderColor: 'var(--color-border, #cbd5e1)', padding: '6px' }}>
                    <Button 
                        className="flex-grow-1 rounded-pill fw-bold py-2 border-0" 
                        style={{ 
                            fontSize: '0.85rem',
                            backgroundColor: activeTab === 'scan' ? 'var(--color-primary, #00699e)' : 'transparent',
                            color: activeTab === 'scan' ? '#ffffff' : 'var(--color-secondary, #64748b)',
                            boxShadow: activeTab === 'scan' ? '0 2px 8px rgba(0,105,158,0.15)' : 'none'
                        }}
                        onClick={() => setActiveTab('scan')}
                    >
                        Kamera Scanner
                    </Button>
                    <Button 
                        className="flex-grow-1 rounded-pill fw-bold py-2 border-0" 
                        style={{ 
                            fontSize: '0.85rem',
                            backgroundColor: activeTab === 'dashboard' ? 'var(--color-primary, #00699e)' : 'transparent',
                            color: activeTab === 'dashboard' ? '#ffffff' : 'var(--color-secondary, #64748b)',
                            boxShadow: activeTab === 'dashboard' ? '0 2px 8px rgba(0,105,158,0.15)' : 'none'
                        }}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Daftar & Stats
                    </Button>
                </div>
            )}

            {/* Layout Columns */}
            <Row className="g-4">
                {/* Column 1: Scanner */}
                {(!isMobile || activeTab === 'scan') && (
                    <Col xs={12} lg={5} className="fade-in-quick">
                        <KioskScanner 
                            brandColor={brandColor}
                            isAttendance={true}
                            feedback={feedback}
                            isScanning={isScanning}
                            scanLock={scanLock}
                            onScan={processScan}
                        />
                    </Col>
                )}

                {/* Column 2: Dashboard Stats, Search, Logs */}
                {(!isMobile || activeTab === 'dashboard') && (
                    <Col xs={12} lg={7} className="fade-in-quick">
                        {/* Dashboard Stats */}
                        <Row className="g-3 mb-4">
                            {[
                                { label: 'Total Kuota', value: stats.total_quota, color: 'var(--color-primary, #00699e)', icon: <Users size={16} /> },
                                { label: 'Hadir', value: stats.checked_in, color: '#10b981', icon: <UserCheck size={16} /> },
                                { label: 'Sisa Kuota', value: stats.remaining, color: '#f59e0b', icon: <Clock size={16} /> }
                            ].map((s, idx) => (
                                <Col xs={4} key={idx}>
                                    <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', border: '1px solid var(--color-border, #cbd5e1)' }}>
                                        <Card.Body className="p-2.5 text-center d-flex flex-column align-items-center">
                                            <div style={{ color: s.color, marginBottom: 2 }}>{s.icon}</div>
                                            <h5 className="fw-extrabold mb-0 text-dark" style={{ tracking: '-0.02em', fontSize: '1.15rem' }}>{s.value}</h5>
                                            <span className="text-secondary fw-semibold uppercase" style={{ fontSize: '8px', letterSpacing: '0.05em' }}>{s.label}</span>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        {/* Cari & Override */}
                        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '20px', border: '1px solid var(--color-border, #cbd5e1)' }}>
                            <Card.Body className="p-3 p-md-4">
                                <h6 className="fw-bold mb-3 d-flex gap-2 text-dark align-items-center" style={{ fontSize: '0.95rem' }}>
                                    <Search size={16} /> 
                                    <span>Cari & Override Manual</span>
                                </h6>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Cari nama, email, atau tiket..." 
                                    value={searchQuery} 
                                    onChange={handleSearchChange} 
                                    className="py-2.5 px-3 rounded-pill bg-light border-0 mb-3" 
                                    style={{ fontSize: '0.85rem' }}
                                />
                                
                                {isSearching ? (
                                    <div className="text-center py-4"><Spinner size="sm" style={{ color: 'var(--color-primary, #00699e)' }} /></div>
                                ) : searchResults.length === 0 ? (
                                    <p className="text-center text-muted small py-4">Data tidak ditemukan.</p>
                                ) : (
                                    <div style={{ maxHeight: 200, overflowY: 'auto' }} className="d-flex flex-column gap-2 pe-1">
                                        {searchResults.map(t => (
                                            <div key={t.id} className="d-flex justify-content-between align-items-center border rounded-3 p-3 bg-white" style={{ borderColor: 'var(--color-border, #cbd5e1)', padding: '12px' }}>
                                                <div className="overflow-hidden">
                                                    <h6 className="fw-bold mb-0 text-truncate text-dark" style={{ fontSize: '12px' }}>{t.attendee_name}</h6>
                                                    <span className="text-muted small text-truncate d-block" style={{ fontSize: '10px' }}>{t.ticket_code}</span>
                                                </div>
                                                <div className="d-flex gap-2 ms-2">
                                                    {t.status === 'used' ? (
                                                        <Button variant="outline-danger" size="sm" className="rounded-pill px-2.5 py-1 fw-bold" style={{ fontSize: '10px' }} onClick={() => handleManualCheckIn(t.id, 'out')}>KELUAR</Button>
                                                    ) : (
                                                        <Button variant="primary" size="sm" className="rounded-pill px-2.5 py-1 fw-bold border-0 text-white" style={{ backgroundColor: 'var(--color-primary, #00699e)', fontSize: '10px' }} onClick={() => handleManualCheckIn(t.id, 'in')}>MASUK</Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        {/* Log Terkini */}
                        <Card className="border-0 shadow-sm" style={{ borderRadius: '20px', border: '1px solid var(--color-border, #cbd5e1)' }}>
                            <Card.Body className="p-3 p-md-4">
                                <h6 className="fw-bold mb-3 d-flex gap-2 text-dark align-items-center" style={{ fontSize: '0.95rem' }}>
                                    <Clock size={16} /> 
                                    <span>Log Kehadiran Terkini</span>
                                </h6>
                                {checkInLogs.length === 0 ? (
                                    <p className="text-muted small py-2">Belum ada aktivitas kehadiran saat ini.</p>
                                ) : (
                                    <div className="d-flex flex-column gap-2">
                                        {checkInLogs.map((log, i) => (
                                            <div key={i} className="d-flex justify-content-between align-items-center bg-light p-3 rounded-3" style={{ padding: '10px 14px' }}>
                                                <div className="d-flex gap-2.5 align-items-center">
                                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#d1fae5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserCheck size={14} /></div>
                                                    <div className="overflow-hidden" style={{ maxWidth: '160px' }}>
                                                        <span className="fw-bold text-dark d-block text-truncate" style={{ fontSize: '12px' }}>{log.name}</span>
                                                        <span className="text-muted small" style={{ fontSize: '10px' }}>{log.code}</span>
                                                    </div>
                                                </div>
                                                <span className="text-success small fw-bold" style={{ fontSize: '11px' }}>{log.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                )}
            </Row>

            {/* Micro-animations CSS */}
            <style>{`
                .fade-in-quick {
                    animation: fadeInQuick 0.2s ease-out forwards;
                }
                @keyframes fadeInQuick {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default AttendanceKiosk;
