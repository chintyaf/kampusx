import React from 'react';
import { Card, ProgressBar } from 'react-bootstrap';
import { PlayCircle, FileText, CheckCircle2, Lock, Flame, Award, BookOpen, AlertCircle } from 'lucide-react';

const ContentSidebar = ({ materials, activeId, onSelectMaterial, completedIds, isAttended }) => {
    // Calculate total materials and completed count
    const totalMaterials = materials.length;
    const completedCount = completedIds.length;
    const progressPercent = totalMaterials > 0 ? Math.round((completedCount / totalMaterials) * 100) : 0;

    // Helper to render type icons
    const TypeIcon = ({ type, isActive }) => {
        const iconSize = 18;
        const baseClass = isActive ? "text-primary" : "text-muted opacity-75";
        
        if (type === 'video') return <PlayCircle size={iconSize} className={baseClass} />;
        if (type === 'document') return <FileText size={iconSize} className={baseClass} />;
        if (type === 'quiz') return <Award size={iconSize} className={baseClass} />;
        return <BookOpen size={iconSize} className={baseClass} />;
    };

    return (
        <div className="d-flex flex-column gap-3.5">
            {/* Gamifikasi: Learning Streak & Progress Summary Card */}
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--color-primary, #1A365D) 0%, #1e40af 100%)' }}>
                <Card.Body className="p-3.5 text-white">
                    <div className="d-flex justify-content-between align-items-center mb-2.5">
                        <div className="d-flex align-items-center gap-1.5 bg-white bg-opacity-20 px-2.5 py-1 rounded-pill small">
                            <Flame size={14} className="text-warning animate-pulse" />
                            <span className="fw-bold text-warning" style={{ fontSize: '11px' }}>LEARNING STREAK ACTIVE</span>
                        </div>
                        <span className="small fw-medium opacity-90" style={{ fontSize: '12px' }}>{completedCount}/{totalMaterials} Materi Selesai</span>
                    </div>

                    <h6 className="fw-bold mb-2.5">Progres Belajar Anda</h6>
                    <ProgressBar 
                        now={progressPercent} 
                        variant="warning"
                        className="rounded-pill mb-2 bg-white bg-opacity-20" 
                        style={{ height: '7px' }} 
                    />
                    
                    <div className="d-flex justify-content-between align-items-center pt-1">
                        <span className="small text-white-50" style={{ fontSize: '11px' }}>Klaim Sertifikat:</span>
                        <span className="small fw-bold text-white bg-white bg-opacity-20 px-2 py-0.5 rounded" style={{ fontSize: '10px' }}>
                            {progressPercent === 100 ? "Siap Diklaim! 🎉" : "Selesaikan Semua"}
                        </span>
                    </div>
                </Card.Body>
            </Card>

            {/* Riwayat Belajar & Daftar Urutan Materi */}
            <Card className="border-0 shadow-sm rounded-4">
                <Card.Header className="bg-white border-0 pt-4 px-4 pb-2">
                    <h6 className="fw-extrabold text-dark mb-0 d-flex align-items-center gap-2">
                        <BookOpen size={18} className="text-primary" />
                        <span>Progress Tracker</span>
                    </h6>
                    <small className="text-secondary">Daftar List Modul & Assessment</small>
                </Card.Header>

                <Card.Body className="p-3">
                    <div className="d-flex flex-column gap-2" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                        {materials.map((mat, index) => {
                            const isActive = mat.id === activeId;
                            const isCompleted = completedIds.includes(mat.id);
                            
                            // Check lock condition: lock later materials unless the participant has completed the preceding lesson.
                            // However, we allow full access if they already checked in, or we locked strictly.
                            // To be helpful, a material is unlocked if it's the first item, or if the previous item is completed.
                            const isLocked = index > 0 && !completedIds.includes(materials[index - 1].id) && !isCompleted && !isActive;

                            let itemClass = "d-flex align-items-center justify-content-between p-3 rounded-3 border transition-all cursor-pointer";
                            let borderStyle = {};
                            
                            if (isActive) {
                                itemClass += " bg-primary bg-opacity-10 border-primary fw-bold";
                                borderStyle = { borderColor: 'var(--color-primary, #1A365D)' };
                            } else if (isLocked) {
                                itemClass += " bg-light border-light opacity-60 pointer-events-none";
                            } else if (isCompleted) {
                                itemClass += " bg-light border-light hover-bg-light";
                            } else {
                                itemClass += " bg-white border-light hover-bg-light";
                            }

                            return (
                                <div 
                                    key={mat.id} 
                                    className={itemClass}
                                    style={borderStyle}
                                    onClick={() => !isLocked && onSelectMaterial(mat.id)}
                                >
                                    <div className="d-flex align-items-start gap-2.5" style={{ maxWidth: '85%' }}>
                                        <div className="mt-1 flex-shrink-0">
                                            <TypeIcon type={mat.type} isActive={isActive} />
                                        </div>
                                        <div className="text-truncate">
                                            <div 
                                                className="text-truncate small"
                                                style={{ 
                                                    fontWeight: isActive ? '700' : '500',
                                                    color: isActive ? 'var(--color-primary, #1A365D)' : 'var(--color-text, #1e293b)'
                                                }}
                                            >
                                                {index + 1}. {mat.title}
                                            </div>
                                            <span className="text-muted" style={{ fontSize: '10px' }}>
                                                {mat.type === 'video' ? 'Video Pendek' : mat.type === 'quiz' ? 'Assessment' : 'Dokumen PDF'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0">
                                        {isCompleted ? (
                                            <CheckCircle2 size={18} className="text-success" />
                                        ) : isLocked ? (
                                            <Lock size={16} className="text-secondary opacity-50" />
                                        ) : (
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary, #1A365D)' }} className="opacity-50"></div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {!isAttended && (
                        <div className="mt-3.5 p-3 rounded-4 bg-warning bg-opacity-10 border-0 d-flex gap-2">
                            <AlertCircle size={16} className="text-warning flex-shrink-0 mt-0.5" />
                            <span className="text-warning" style={{ fontSize: '10px', lineHeight: '1.4' }}>
                                Beberapa konten mungkin terkunci jika Anda belum melakukan check-in kehadiran di venue.
                            </span>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default ContentSidebar;
