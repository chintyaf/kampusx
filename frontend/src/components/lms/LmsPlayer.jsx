import React, { useState, useEffect } from 'react';
import { Row, Col, Spinner, Alert, Card, Button } from 'react-bootstrap';
import { Lock, FileText, Download, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../../api/axios';
import ContentSidebar from './ContentSidebar';
import VideoPlayerCard from './VideoPlayerCard';
import QuizCard from './QuizCard';

const LmsPlayer = ({ eventId }) => {
    const [materials, setMaterials] = useState([]);
    
    // Load completed IDs from localStorage for persistence
    const [completedIds, setCompletedIds] = useState(() => {
        try {
            const stored = localStorage.getItem(`lms_progress_${eventId}`);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error("Failed to load LMS progress:", e);
            return [];
        }
    });

    const [activeId, setActiveId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const [isAttended, setIsAttended] = useState(false);

    // Save completed IDs to localStorage whenever they change
    useEffect(() => {
        if (eventId) {
            localStorage.setItem(`lms_progress_${eventId}`, JSON.stringify(completedIds));
        }
    }, [completedIds, eventId]);

    useEffect(() => {
        if (!eventId) return;

        const fetchLmsData = async () => {
            setIsLoading(true);
            setErrorMsg(null);
            try {
                // Fetch materials from API database
                const res = await api.get(`/events/${eventId}/materials`);
                const apiMaterials = res.data.data || [];
                const attendedStatus = res.data.attended || false;
                setIsAttended(attendedStatus);

                // Enrich materials list to guarantee the premium UX criteria
                let enriched = apiMaterials.map(item => ({
                    id: item.id,
                    title: item.title,
                    type: item.type || 'video',
                    url: item.url || '',
                    description: item.description || 'Materi pembelajaran Micro-content eksklusif seminar.',
                }));

                // Fallback structured data if API database is completely empty
                if (enriched.length === 0) {
                    enriched = [
                        {
                            id: 101,
                            title: "Micro-learning: Panduan Sukses Karir Digital",
                            type: "video",
                            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Standard YouTube embed
                            description: "Dalam video pendek 10 menit ini, pelajari taktik fundamental dalam mengembangkan karir di industri kreatif modern, termasuk teknik personal branding dan networking."
                        },
                        {
                            id: 102,
                            title: "Infografis & Buku Saku Seminar (Bilingual PDF)",
                            type: "document",
                            url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                            description: "Unduh file rangkuman presentasi pemateri, infografis seminar, dan lembar kerja kelas (Buku Saku) untuk dibaca secara luring di perangkat Anda."
                        }
                    ];
                }

                // Check if a quiz exists in the list. If not, dynamically append the assessment quiz at the end
                const hasQuiz = enriched.some(m => m.type === 'quiz');
                if (!hasQuiz) {
                    enriched.push({
                        id: 999,
                        title: "Post-Event Assessment & Evaluasi Akhir",
                        type: "quiz",
                        url: "",
                        description: "Selesaikan 3 soal pilihan ganda di bawah ini untuk memverifikasi pemahaman Anda terhadap program materi pembelajaran micro-learning."
                    });
                }

                setMaterials(enriched);
                
                // Set first item as active by default
                if (enriched.length > 0) {
                    setActiveId(enriched[0].id);
                }
            } catch (err) {
                console.error("LMS data fetch error:", err);
                if (err.response?.status === 403) {
                    setErrorMsg("Akses ditolak. Anda belum terdaftar di event ini atau sesi tiket Anda kedaluwarsa.");
                } else {
                    setErrorMsg("Gagal memuat materi pembelajaran micro-learning.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchLmsData();
    }, [eventId]);

    // Handle marking a material completed
    const handleMarkAsCompleted = (materialId) => {
        if (!completedIds.includes(materialId)) {
            setCompletedIds(prev => [...prev, materialId]);
        }
    };

    // Helper to find the active material
    const activeMaterial = materials.find(m => m.id === activeId);

    if (isLoading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center py-5">
                <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                <p className="text-muted mt-3 fw-medium">Memuat Player Micro-Learning...</p>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <Alert variant="danger" className="d-flex align-items-center shadow-sm rounded-4 border-0 p-4">
                <Lock className="me-3 flex-shrink-0 text-danger" size={32} />
                <div>
                    <h5 className="fw-bold mb-1">Materi Terkunci</h5>
                    <p className="mb-0 text-muted small">{errorMsg}</p>
                </div>
            </Alert>
        );
    }

    // Render the active material player based on type
    const renderActivePlayer = () => {
        if (!activeMaterial) return null;
        
        const isCompleted = completedIds.includes(activeMaterial.id);

        if (activeMaterial.type === 'video') {
            return (
                <VideoPlayerCard 
                    material={activeMaterial} 
                    onMarkAsCompleted={handleMarkAsCompleted}
                    isCompleted={isCompleted}
                />
            );
        }

        if (activeMaterial.type === 'quiz') {
            return (
                <QuizCard 
                    material={activeMaterial}
                    onMarkAsCompleted={handleMarkAsCompleted}
                    isCompleted={isCompleted}
                />
            );
        }

        // Render Document viewer (PDF / Infographic)
        if (activeMaterial.type === 'document') {
            return (
                <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                    <Card.Body className="p-5 text-center bg-light">
                        <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex p-4 mb-4 border">
                            <FileText size={56} style={{ color: 'var(--color-primary, #1A365D)' }} />
                        </div>
                        
                        <h4 className="fw-bold mb-2">{activeMaterial.title}</h4>
                        <p className="text-muted small mx-auto mb-4" style={{ maxWidth: '500px' }}>
                            {activeMaterial.description || "Modul panduan lengkap, ringkasan materi pemateri, dan infografis berkualitas tinggi siap diunduh dalam format PDF."}
                        </p>

                        <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                            <Button
                                variant="primary"
                                href={activeMaterial.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-pill px-4 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                                style={{
                                    backgroundColor: 'var(--color-primary, #1A365D)',
                                    borderColor: 'var(--color-primary, #1A365D)'
                                }}
                            >
                                <Download size={18} /> Unduh Materi (PDF)
                            </Button>

                            <Button
                                variant={isCompleted ? "success" : "outline-primary"}
                                onClick={() => handleMarkAsCompleted(activeMaterial.id)}
                                disabled={isCompleted}
                                className="rounded-pill px-4 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2"
                            >
                                {isCompleted ? (
                                    <>
                                        <CheckCircle2 size={18} /> Selesai Dipelajari
                                    </>
                                ) : (
                                    <>
                                        Tandai Selesai <ArrowRight size={18} />
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            );
        }

        return null;
    };

    return (
        <div className="lms-player-container fade-in">
            <Row className="g-4">
                {/* LEFT COLUMN: MAIN CONTENT PLAYER */}
                <Col lg={8} md={12}>
                    {renderActivePlayer()}
                </Col>

                {/* RIGHT COLUMN: PROGRESS SIDEBAR */}
                <Col lg={4} md={12}>
                    <ContentSidebar 
                        materials={materials} 
                        activeId={activeId} 
                        onSelectMaterial={(id) => setActiveId(id)}
                        completedIds={completedIds}
                        isAttended={isAttended}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default LmsPlayer;
