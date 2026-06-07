import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Table } from 'react-bootstrap';
import { ArrowLeft, Sparkles, List, CheckCircle, ShieldCheck, MapPin } from 'lucide-react';
import KioskScanner from './KioskScanner';

const ACTIVITIES = [
    { slug: 'check_in', name: 'Check-in Kehadiran', points: 50, desc: 'Aktivitas berpoin lokal event' },
    { slug: 'ask_question', name: 'Tanya Jawab (Ask Question)', points: 10, desc: 'Aktivitas berpoin lokal event' },
    { slug: 'booth_visit', name: 'Kunjungan Booth (Booth Visit)', points: 15, desc: 'Aktivitas berpoin lokal event' }
];

const PointsKiosk = ({
    station,
    participantsDb,
    loadingParticipants,
    recentLogs,
    feedback,
    isScanning,
    scanLock,
    processScan,
    onBack
}) => {
    const brandColor = 'var(--color-primary, #00699e)';
    
    // Mobile responsiveness states
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
    const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'dashboard'

    // Configuration / Activity States
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [tempActivitySlug, setTempActivitySlug] = useState('booth_visit');
    const [isConfigured, setIsConfigured] = useState(false);

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

    // Wrapper to pass the selected activity slug when scanning
    const handleScanWithActivity = (qrString) => {
        if (!selectedActivity) return;
        processScan(qrString, selectedActivity.slug);
    };

    // Render configuration screen (Layar pilih aktivitas)
    if (!isConfigured) {
        const currentTempObj = ACTIVITIES.find(a => a.slug === tempActivitySlug);
        return (
            <div className="d-flex align-items-center justify-content-center py-4 flex-grow-1 fade-in">
                <Card className="border shadow-none p-4 p-md-5" style={{ maxWidth: '500px', width: '100%', borderRadius: '24px', borderColor: 'var(--color-border, #cbd5e1)' }}>
                    <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                            <h5 className="fw-extrabold text-dark mb-1 d-flex align-items-center gap-2" style={{ fontSize: '1.25rem' }}>
                                <ShieldCheck className="text-primary" size={24} style={{ color: brandColor }} />
                                <span>Konfigurasi Kiosk Stasiun</span>
                            </h5>
                            <p className="text-muted mb-0 small">
                                Pilih stasiun operasional dan jenis aktivitas untuk device Kios ini.
                            </p>
                        </div>
                        <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className="rounded-pill px-3 border-0 bg-light text-secondary"
                            onClick={onBack}
                            style={{ fontSize: '0.8rem' }}
                        >
                            Kembali
                        </Button>
                    </div>

                    <div className="mb-4">
                        <label className="fw-bold small text-secondary mb-2 uppercase" style={{ letterSpacing: '0.05em' }}>Stasiun / Booth Kiosk</label>
                        <Card className="border bg-light" style={{ borderRadius: '12px', borderColor: 'var(--color-border, #cbd5e1)' }}>
                            <Card.Body className="py-2.5 px-3 d-flex align-items-center gap-2 text-dark fw-bold" style={{ fontSize: '0.92rem' }}>
                                <MapPin size={16} className="text-secondary" />
                                <span>{station?.name || 'Stasiun POS'}</span>
                            </Card.Body>
                        </Card>
                    </div>

                    <div className="mb-4">
                        <label className="fw-bold small text-secondary mb-2.5 uppercase" style={{ letterSpacing: '0.05em' }}>Aktivitas Point yang Diberikan</label>
                        <div className="d-flex flex-column gap-2.5">
                            {ACTIVITIES.map(a => (
                                <div 
                                    key={a.slug}
                                    className="p-3 border cursor-pointer transition-all d-flex justify-content-between align-items-center"
                                    style={{
                                        borderRadius: '16px',
                                        borderColor: tempActivitySlug === a.slug ? brandColor : 'var(--color-border, #cbd5e1)',
                                        backgroundColor: tempActivitySlug === a.slug ? 'var(--primary-light, #dff3ff)' : '#ffffff',
                                        borderWidth: tempActivitySlug === a.slug ? '2.5px' : '1px',
                                        transition: 'all 0.15s ease'
                                    }}
                                    onClick={() => setTempActivitySlug(a.slug)}
                                >
                                    <div className="pe-2" style={{ textAlign: 'left' }}>
                                        <span className="fw-extrabold text-dark small d-block" style={{ fontSize: '0.9rem', lineHeight: '1.25' }}>{a.name}</span>
                                        <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                                            {a.desc}
                                        </span>
                                    </div>
                                    <span 
                                        style={{ 
                                            backgroundColor: tempActivitySlug === a.slug ? brandColor : '#f1f5f9',
                                            color: tempActivitySlug === a.slug ? '#ffffff' : 'var(--color-secondary, #64748b)',
                                            fontWeight: 'bold',
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.78rem',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        +{a.points} Pts
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button 
                        size="lg" 
                        className="w-100 rounded-pill fw-bold border-0 d-flex align-items-center justify-content-center gap-2 py-2.5 text-white"
                        style={{ 
                            backgroundColor: brandColor,
                            fontSize: '0.95rem',
                            boxShadow: '0 4px 12px rgba(0, 105, 158, 0.15)' 
                        }}
                        onClick={() => {
                            setSelectedActivity(currentTempObj);
                            setIsConfigured(true);
                        }}
                    >
                        <span>Mulai Operasi Kiosk</span>
                        <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="fade-in">
            {/* Header Sub-Menu */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Button 
                    variant="link" 
                    onClick={() => {
                        setIsConfigured(false);
                        setSelectedActivity(null);
                    }} 
                    className="text-secondary p-0 d-flex align-items-center gap-2 text-decoration-none"
                    style={{ color: 'var(--color-secondary, #64748b)' }}
                >
                    <ArrowLeft size={18} />
                    <span className="fw-bold">Ganti Tugas</span>
                </Button>

                <Badge 
                    className="px-4 py-2.5 fs-6 font-extrabold text-uppercase rounded-3 text-white"
                    style={{ 
                        backgroundColor: brandColor,
                        letterSpacing: '0.05em'
                    }}
                >
                    Mode: Kiosk Poin
                </Badge>
            </div>

            {/* Mobile Tab Switcher */}
            {isMobile && (
                <div className="d-flex gap-2 mb-4 bg-light p-1.5 rounded-3 border" style={{ borderColor: 'var(--color-border, #cbd5e1)', padding: '6px' }}>
                    <Button 
                        className="flex-grow-1 rounded-pill fw-bold py-2 border-0" 
                        style={{ 
                            fontSize: '0.85rem',
                            backgroundColor: activeTab === 'scan' ? brandColor : 'transparent',
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
                            backgroundColor: activeTab === 'dashboard' ? brandColor : 'transparent',
                            color: activeTab === 'dashboard' ? '#ffffff' : 'var(--color-secondary, #64748b)',
                            boxShadow: activeTab === 'dashboard' ? '0 2px 8px rgba(0,105,158,0.15)' : 'none'
                        }}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Simulasi & Log
                    </Button>
                </div>
            )}

            {/* Info bar stasiun */}
            <div className="alert border-0 rounded-4 p-3 mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3 shadow-sm" style={{ backgroundColor: 'var(--primary-light, #dff3ff)', border: '1px solid var(--primary-border, #b9e7fe)' }}>
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary text-white rounded-circle p-2 d-flex" style={{ backgroundColor: brandColor }}>
                        <Sparkles size={18} />
                    </div>
                    <div className="overflow-hidden" style={{ maxWidth: '240px' }}>
                        <h6 className="fw-bold mb-0.5 text-truncate" style={{ fontSize: '0.85rem', color: 'var(--color-primary, #00699e)' }}>
                            Stasiun : {station?.name}
                        </h6>
                        <p className="mb-0 text-truncate" style={{ fontSize: '0.72rem', color: 'var(--color-text, #0f172a)' }}>
                            Melayani: <span className="fw-extrabold" style={{ color: 'var(--bahama-blue-800, #075985)' }}>{selectedActivity?.name} (+{selectedActivity?.points} Pts)</span>
                        </p>
                    </div>
                </div>
                <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="rounded-pill px-3 py-1 bg-transparent"
                    style={{ fontSize: '0.75rem', borderColor: brandColor, color: brandColor }}
                    onClick={() => {
                        setIsConfigured(false);
                        setSelectedActivity(null);
                    }}
                >
                    Ganti Tugas
                </Button>
            </div>

            {/* Layout Columns */}
            <Row className="g-4">
                {/* Column 1: Scanner */}
                {(!isMobile || activeTab === 'scan') && (
                    <Col xs={12} lg={5} className="fade-in-quick">
                        <KioskScanner 
                            brandColor={brandColor}
                            isAttendance={false}
                            feedback={feedback}
                            isScanning={isScanning}
                            scanLock={scanLock}
                            onScan={handleScanWithActivity}
                        />

                        {/* Simulasi Satu-Klik untuk Testing */}
                        <Card className="border-0 shadow-sm" style={{ borderRadius: '20px', border: '1px solid var(--color-border, #cbd5e1)' }}>
                            <Card.Header className="bg-white border-bottom py-3 px-4" style={{ borderColor: 'var(--color-border, #cbd5e1)' }}>
                                <h6 className="fw-bold text-dark mb-0 align-items-center d-flex gap-2" style={{ fontSize: '0.95rem' }}>
                                    <Sparkles size={16} className="text-primary" style={{ color: brandColor }} />
                                    <span>Simulasi Satu-Klik (Testing)</span>
                                </h6>
                            </Card.Header>
                            <Card.Body className="p-3">
                                <p className="text-muted small mb-3">Klik tombol "Simulasikan Scan" untuk memicu scan secara instan.</p>
                                <div className="d-flex flex-column gap-2" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                                    {loadingParticipants ? (
                                        <div className="text-center py-4 text-muted small">Memuat daftar peserta...</div>
                                    ) : participantsDb.length === 0 ? (
                                        <div className="text-center py-4 text-muted small">Belum ada peserta terdaftar.</div>
                                    ) : (
                                        participantsDb.map(p => (
                                            <div key={p.ticket_code} className="d-flex justify-content-between align-items-center p-2.5 border rounded-3 hover-bg-light bg-light bg-opacity-20" style={{ borderColor: 'var(--color-border, #cbd5e1)', padding: '10px' }}>
                                                <div className="overflow-hidden" style={{ maxWidth: '140px' }}>
                                                    <span className="fw-bold text-dark small d-block text-truncate" style={{ fontSize: '12px' }}>{p.name}</span>
                                                    <span className="text-secondary small" style={{ fontSize: '10px' }}>
                                                        Saldo: <strong>{p.balance} Pts</strong>
                                                    </span>
                                                </div>
                                                <Button 
                                                    variant="outline-primary" 
                                                    size="sm" 
                                                    className="rounded-pill px-3 py-1 font-semibold border"
                                                    style={{ fontSize: '10px', borderColor: 'var(--color-border, #cbd5e1)', color: 'var(--color-primary, #00699e)' }}
                                                    onClick={() => handleScanWithActivity(p.ticket_code)}
                                                    disabled={isScanning || scanLock}
                                                >
                                                    Simulasikan
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                )}

                {/* Column 2: Logs Table */}
                {(!isMobile || activeTab === 'dashboard') && (
                    <Col xs={12} lg={7} className="fade-in-quick">
                        {/* Real-time Session logs */}
                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '20px', border: '1px solid var(--color-border, #cbd5e1)', minHeight: '350px' }}>
                            <Card.Header className="bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--color-border, #cbd5e1)' }}>
                                <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2" style={{ fontSize: '0.95rem' }}>
                                    <List size={16} className="text-secondary" />
                                    <span>Aktivitas Scan Sesi Ini</span>
                                </h6>
                                <Badge bg="light" className="text-secondary border" style={{ borderColor: 'var(--color-border, #cbd5e1)' }}>
                                    {recentLogs.length} Aktivitas Baru
                                </Badge>
                            </Card.Header>
                            <div className="table-responsive" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                                <Table hover className="align-middle mb-0 custom-table">
                                    <thead className="bg-light sticky-top">
                                        <tr className="text-secondary" style={{ fontSize: '0.78rem', borderBottom: '1px solid var(--color-border, #cbd5e1)' }}>
                                            <th className="px-3 py-2.5">Waktu</th>
                                            <th className="py-2.5">Peserta</th>
                                            <th className="py-2.5">Aktivitas</th>
                                            <th className="px-3 py-2.5 text-end">Poin</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="text-center py-5 text-muted small">
                                                    <Sparkles size={28} className="opacity-20 mb-2 mx-auto" />
                                                    <p className="mb-0 fw-semibold" style={{ fontSize: '12px' }}>Belum Ada Aktivitas Terdaftar</p>
                                                    <p className="text-xxs text-muted mb-0" style={{ fontSize: '10px' }}>Scan tiket peserta untuk melihat log realtime disini.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            recentLogs.map((log) => (
                                                <tr key={log.id} style={{ fontSize: '0.8rem', borderBottom: '1px solid var(--color-border, #cbd5e1)' }}>
                                                    <td className="px-3 py-2.5 text-secondary">{log.time}</td>
                                                    <td className="py-2.5">
                                                        <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '100px', fontSize: '12px' }}>{log.name}</div>
                                                        <div className="text-muted text-xxs" style={{ fontSize: '9px' }}>{log.ticket_code}</div>
                                                    </td>
                                                    <td className="py-2.5">
                                                        <Badge bg="light" className="text-secondary border text-xxs font-normal" style={{ fontSize: '9px', borderColor: 'var(--color-border, #cbd5e1)' }}>
                                                            {log.activity}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-end fw-bold text-success" style={{ fontSize: '12px' }}>
                                                        +{log.points}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </div>
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

export default PointsKiosk;
