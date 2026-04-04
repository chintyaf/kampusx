import React, { useEffect, useState } from "react";
import { Modal, Badge } from "react-bootstrap";
import {
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Globe,
    Link2,
    ChevronRight,
    X,
} from "lucide-react";

/*
  CSS variables assumed to be available globally:
  --color-primary / --bahama-blue-700: #00699e
  --bahama-blue-*: full palette
  --font-xs/sm/md/lg/xl
  --color-text, --color-text-muted, --color-border, --color-bg
*/

const PublishModal = ({
    show,
    onClose,
    onConfirm,
    slug,
    setSlug,
    sessions = [],
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (show) setTimeout(() => setMounted(true), 10);
        else setMounted(false);
    }, [show]);

    if (!show) return null;

    const invalidSessions = sessions.filter(
        (s) => !s.speaker || String(s.speaker).trim() === "",
    );

    const hasSlugError = !slug || slug.trim() === "";
    const hasSessionError = invalidSessions.length > 0;
    const isDisabled = hasSlugError || hasSessionError;
    const errorCount = invalidSessions.length + (hasSlugError ? 1 : 0);

    return (
        <>
            <div
                className="modal fade show d-block publish-modal"
                tabIndex="-1"
                style={{
                    backgroundColor: "rgba(7,48,74,0.45)",
                    backdropFilter: "blur(2px)",
                }}
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        {/* HEADER */}
                        <div className="modal-header">
                            <div className="d-flex align-items-start justify-content-between w-100 gap-3">
                                <div className="modal-title-area">
                                    <div className="modal-icon-wrap">
                                        <Globe
                                            size={18}
                                            color="#fff"
                                            strokeWidth={2}
                                        />
                                    </div>
                                    <div>
                                        <div className="modal-title">
                                            Publish Event
                                        </div>
                                        <div className="modal-subtitle">
                                            Pastikan semua data sudah benar
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="btn-close-custom"
                                    onClick={onClose}
                                >
                                    <X size={15} />
                                </button>
                            </div>
                        </div>

                        {/* BODY */}
                        <div className="modal-body">
                            {/* Warning banner */}
                            <div className="info-banner">
                                <AlertTriangle
                                    size={16}
                                    className="info-banner-icon"
                                />
                                <div>
                                    <div className="info-banner-title">
                                        Sebelum publish
                                    </div>
                                    <p className="info-banner-desc">
                                        Lengkapi semua data yang diperlukan.
                                        Event yang sudah dipublish akan langsung
                                        terlihat publik.
                                    </p>
                                </div>
                            </div>

                            {/* Error summary */}
                            {isDisabled && (
                                <div className="error-box">
                                    <div className="error-box-header">
                                        <div className="error-box-title">
                                            <XCircle size={15} />
                                            Tidak bisa publish
                                        </div>
                                        <span className="error-badge">
                                            {errorCount} error
                                        </span>
                                    </div>
                                    <ul className="error-list">
                                        {hasSlugError && (
                                            <li className="error-item">
                                                <ChevronRight size={12} />
                                                Slug / URL event belum diisi
                                            </li>
                                        )}
                                        {invalidSessions.map((s, i) => (
                                            <li key={i} className="error-item">
                                                <ChevronRight size={12} />
                                                Session{" "}
                                                <strong>"{s.name}"</strong>
                                                &nbsp;belum ada speaker
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Slug field */}
                            <div>
                                <label className="field-label">
                                    <Link2
                                        size={14}
                                        color="var(--bahama-blue-700)"
                                    />
                                    Event Slug / URL
                                </label>
                                <div
                                    className={`slug-wrap ${hasSlugError ? "is-invalid" : ""}`}
                                >
                                    <span className="slug-prefix">
                                        <Globe size={11} />
                                        domain.com/event/
                                    </span>
                                    <input
                                        type="text"
                                        className="slug-input"
                                        placeholder="nama-event-kamu"
                                        value={slug}
                                        onChange={(e) =>
                                            setSlug(
                                                e.target.value
                                                    .toLowerCase()
                                                    .replace(/\s+/g, "-"),
                                            )
                                        }
                                    />
                                </div>
                                {hasSlugError ? (
                                    <div className="field-error">
                                        <XCircle size={12} /> Slug wajib diisi
                                    </div>
                                ) : (
                                    <div className="field-hint">
                                        <CheckCircle2
                                            size={12}
                                            color="var(--bahama-blue-600)"
                                        />
                                        URL publik event kamu
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={onClose}>
                                Batal
                            </button>
                            <button
                                className="btn-publish"
                                onClick={!isDisabled ? onConfirm : undefined}
                                disabled={isDisabled}
                            >
                                {isDisabled ? (
                                    <>
                                        <XCircle size={15} />
                                        Lengkapi Data Dulu
                                    </>
                                ) : (
                                    <>
                                        <Globe size={15} />
                                        Ya, Publish Sekarang
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PublishModal;
