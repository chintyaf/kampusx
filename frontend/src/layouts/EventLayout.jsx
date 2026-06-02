import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle } from 'lucide-react';
import '../assets/css/form.css';

const EventLayout = ({
    title,
    description,
    heading,
    subheading,
    children,
    sidebar,
    nextPath,
    prevPath,
    onSave,
    isFormDirty = false,
    formDirtyMessage = 'Mohon simpan atau batalkan perubahan yang sedang Anda lakukan sebelum pindah halaman.',
    eventStatus = 'draft',
    hasParticipants = false,
    isCurrentStepCompleted = false,
    isSaveDisabled = false,
}) => {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null); // 'continue' | 'save'

    const isPublished = ['published', 'ongoing'].includes(eventStatus);
    const needsConfirmation = isPublished && hasParticipants;

    const executeSave = async (shouldNotify, action) => {
        if (isSaving) return;
        setIsSaving(true);
        setShowNotifyModal(false);

        try {
            if (onSave) await onSave(shouldNotify);

            // Notify Sidebar/other components to refetch status
            window.dispatchEvent(new Event('event-status-updated'));

            if (action === 'continue' && nextPath) {
                navigate(`../${nextPath}`);
            }
        } catch (error) {
            console.error('Navigation/save error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAndContinue = async () => {
        if (isFormDirty) {
            alert(formDirtyMessage);
            return;
        }
        if (needsConfirmation) {
            setPendingAction('continue');
            setShowNotifyModal(true);
            return;
        }
        await executeSave(false, 'continue');
    };

    const handleSave = async () => {
        if (isSaving) return;
        if (needsConfirmation) {
            setPendingAction('save');
            setShowNotifyModal(true);
            return;
        }
        await executeSave(false, 'save');
    };

    return (
        <>
            {/* ── MODAL KONFIRMASI NOTIFIKASI ── */}
            <Modal
                show={showNotifyModal}
                onHide={() => setShowNotifyModal(false)}
                centered
                backdrop="static"
                size="md"
            >
                <Modal.Body style={styles.modalBody}>
                    <div style={styles.iconContainer}>
                        <AlertTriangle size={26} color="#e67e22" />
                    </div>

                    <h5 style={styles.modalTitle}>
                        Event Ini Sudah Dipublikasikan
                    </h5>

                    <p style={styles.modalText}>
                        Perubahan yang Anda simpan akan langsung terlihat di halaman event. Apakah
                        Anda ingin <strong>mengumumkan perubahan ini</strong> kepada peserta yang
                        sudah mendaftar?
                    </p>

                    <div style={styles.buttonContainer}>
                        {/* Opsi 1: Beritahu peserta */}
                        <button
                            onClick={() => executeSave(true, pendingAction)}
                            disabled={isSaving}
                            style={styles.notifyBtn(isSaving)}
                        >
                            <div style={styles.bellIconContainer}>
                                <Bell size={18} />
                            </div>
                            <div>
                                <div>Ya, Beritahu Peserta</div>
                                <div style={styles.subtext}>
                                    Kirim notifikasi perubahan ke semua peserta terdaftar
                                </div>
                            </div>
                        </button>

                        {/* Batal */}
                        <button
                            onClick={() => setShowNotifyModal(false)}
                            disabled={isSaving}
                            style={styles.cancelBtn}
                        >
                            Batal, kembali edit
                        </button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* ── LAYOUT UTAMA ── */}
            <div className="d-flex align-items-start gap-4">

                {/* KOLOM KIRI: Konten Utama */}
                <div className="flex-grow-1 position-relative" style={{ minWidth: 0 }}>

                    {/* Header Section */}
                    {(heading || title) && (
                        <div className="mb-4 d-flex align-items-start">
                            <div>
                                <h5 className="fw-bold mb-1" style={{ fontSize: '1.1rem' }}>
                                    {heading || title}
                                </h5>
                                {(subheading || description) && (
                                    <p className="text-muted small mb-0">
                                        {subheading || description}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Children Form Content */}
                    <div className="position-relative">
                        <div
                            className="d-flex flex-column gap-4"
                            style={styles.contentWrapper(isSaving)}
                        >
                            {children}
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    {onSave && (
                        <div className="w-100 d-flex justify-content-end mt-3 pt-3 border-top gap-1">
                            {prevPath && (
                                <Button
                                    variant="outline-secondary"
                                    disabled={isSaving}
                                    onClick={() => {
                                        if (isFormDirty) {
                                            alert(formDirtyMessage);
                                            return;
                                        }
                                        navigate(`../${prevPath}`);
                                    }}
                                >
                                    Back
                                </Button>
                            )}

                            {nextPath && isCurrentStepCompleted ? (
                                <Button
                                    variant="primary"
                                    onClick={handleSaveAndContinue}
                                    disabled={isSaving || isSaveDisabled}
                                >
                                    {isSaving ? 'Saving...' : 'Simpan & Lanjutkan'}
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    onClick={handleSave}
                                    disabled={isSaving || isSaveDisabled}
                                >
                                    {isSaving ? 'Saving...' : 'Simpan'}
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* KOLOM KANAN: Sidebar Opsional */}
                {sidebar && (
                    <div style={styles.sidebar}>
                        {sidebar}
                    </div>
                )}
            </div>
        </>
    );
};

// ── EXTRACTED INLINE STYLES ──
const styles = {
    modalBody: {
        padding: '32px 28px'
    },
    iconContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
        margin: '0 auto 20px auto',
        border: '2px solid #ffc107',
    },
    modalTitle: {
        textAlign: 'center',
        fontWeight: 700,
        fontSize: '1.05rem',
        color: '#1e293b',
        marginBottom: 8,
    },
    modalText: {
        textAlign: 'center',
        color: '#64748b',
        fontSize: '0.9rem',
        lineHeight: 1.6,
        marginBottom: 28,
    },
    buttonContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
    },
    notifyBtn: (isSaving) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        color: 'white',
        border: 'none',
        borderRadius: 10,
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: 600,
        textAlign: 'left',
        transition: 'opacity 0.2s',
        opacity: isSaving ? 0.7 : 1,
    }),
    bellIconContainer: {
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    subtext: {
        fontSize: '0.78rem',
        fontWeight: 400,
        opacity: 0.85
    },
    cancelBtn: {
        padding: '8px 16px',
        background: 'transparent',
        color: '#94a3b8',
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: '0.85rem',
        textAlign: 'center',
        marginTop: 4,
    },
    contentWrapper: (isSaving) => ({
        opacity: isSaving ? 0.5 : 1,
        pointerEvents: isSaving ? 'none' : 'auto',
    }),
    sidebar: {
        position: 'sticky',
        top: '0px',
        flexShrink: 0,
        height: '80vh',
    }
};

export default EventLayout;