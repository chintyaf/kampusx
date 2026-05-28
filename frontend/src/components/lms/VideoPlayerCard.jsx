import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { PlayCircle, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

const VideoPlayerCard = ({ material, onMarkAsCompleted, isCompleted }) => {
    if (!material) return null;

    // Helper to get clean embedded video link if it is YouTube or standard video
    const getVideoSrc = (url) => {
        if (!url) return "";
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
            // Convert standard youtube link to embed link
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            if (match && match[2].length === 11) {
                return `https://www.youtube.com/embed/${match[2]}`;
            }
        }
        return url;
    };

    const videoSrc = getVideoSrc(material.url);
    const isEmbeddable = videoSrc.startsWith("http");

    return (
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            {/* Responsive 16:9 Video Container */}
            <div className="ratio ratio-16x9 bg-dark">
                {isEmbeddable ? (
                    <iframe
                        src={videoSrc}
                        title={material.title}
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        className="border-0"
                    ></iframe>
                ) : (
                    <div className="d-flex flex-column align-items-center justify-content-center text-white p-5">
                        <PlayCircle size={64} className="text-danger mb-3 opacity-75" />
                        <h5 className="fw-bold">Media Video</h5>
                        <p className="text-muted small">Pemutaran media langsung tidak tersedia secara inline.</p>
                        <Button
                            variant="danger"
                            href={material.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-pill px-4"
                        >
                            Tonton di Tab Baru
                        </Button>
                    </div>
                )}
            </div>

            <Card.Body className="p-4" style={{ backgroundColor: 'var(--color-bg, #ffffff)' }}>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                    <div>
                        <h4 className="fw-bold mb-1" style={{ color: 'var(--color-text, #1e293b)' }}>
                            {material.title}
                        </h4>
                        <span className="text-secondary small">Durasi Materi: 10-15 Menit</span>
                    </div>

                    <Button
                        variant={isCompleted ? "success" : "primary"}
                        onClick={() => onMarkAsCompleted(material.id)}
                        disabled={isCompleted}
                        className="rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm transition-all"
                        style={{
                            backgroundColor: isCompleted ? '#10b981' : 'var(--color-primary, #1A365D)',
                            borderColor: isCompleted ? '#10b981' : 'var(--color-primary, #1A365D)'
                        }}
                    >
                        {isCompleted ? (
                            <>
                                <CheckCircle2 size={18} /> Selesai Dipelajari
                            </>
                        ) : (
                            <>
                                Tandai Selesai <ArrowRight size={16} />
                            </>
                        )}
                    </Button>
                </div>

                {material.description && (
                    <div className="mt-3 pt-3 border-top">
                        <h6 className="fw-bold text-dark mb-2">Deskripsi Materi:</h6>
                        <p className="text-muted mb-0" style={{ lineHeight: '1.6' }}>
                            {material.description}
                        </p>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default VideoPlayerCard;
