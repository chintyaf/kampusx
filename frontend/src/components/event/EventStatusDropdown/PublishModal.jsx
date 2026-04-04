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

const styles = `
  .publish-modal .modal-content {
    border: none;
    border-radius: 16px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(0,105,158,0.08),
      0 24px 48px -12px rgba(7,48,74,0.22),
      0 8px 16px -4px rgba(0,105,158,0.12);
    background: #fff;
  }

  .publish-modal .modal-header {
    background: linear-gradient(135deg, var(--bahama-blue-950) 0%, var(--bahama-blue-800) 100%);
    padding: 20px 24px 20px;
    border: none;
    position: relative;
  }

  .publish-modal .modal-title-area {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .publish-modal .modal-icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(255,255,255,0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,0.18);
    backdrop-filter: blur(4px);
  }

  .publish-modal .modal-title {
    font-size: var(--font-lg);
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.3px;
    margin: 0;
  }

  .publish-modal .modal-subtitle {
    font-size: var(--font-xs);
    color: rgba(255,255,255,0.55);
    margin-top: 2px;
    letter-spacing: 0.3px;
  }

  .publish-modal .btn-close-custom {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.18);
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }
  .publish-modal .btn-close-custom:hover {
    background: rgba(255,255,255,0.18);
    color: #fff;
  }

  .publish-modal .modal-body {
    padding: 24px;
    background: var(--color-bg, #f8fafc);
  }

  /* Warning banner */
  .publish-modal .info-banner {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 10px;
    background: #fffbeb;
    border: 1px solid #fde68a;
    margin-bottom: 16px;
  }
  .publish-modal .info-banner-icon {
    color: #d97706;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .publish-modal .info-banner-title {
    font-size: var(--font-sm);
    font-weight: 600;
    color: #92400e;
    margin-bottom: 2px;
  }
  .publish-modal .info-banner-desc {
    font-size: var(--font-xs);
    color: #a16207;
    margin: 0;
  }

  /* Error box */
  .publish-modal .error-box {
    border-radius: 10px;
    background: #fff5f5;
    border: 1px solid #fecaca;
    padding: 14px;
    margin-bottom: 16px;
    animation: slideIn 0.2s ease;
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .publish-modal .error-box-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .publish-modal .error-box-title {
    font-size: var(--font-sm);
    font-weight: 700;
    color: #b91c1c;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .publish-modal .error-badge {
    background: #ef4444;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 999px;
    letter-spacing: 0.4px;
  }
  .publish-modal .error-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .publish-modal .error-item {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: var(--font-xs);
    color: #dc2626;
    padding: 5px 8px;
    background: rgba(239,68,68,0.06);
    border-radius: 6px;
  }

  /* Slug field */
  .publish-modal .field-label {
    font-size: var(--font-sm);
    font-weight: 600;
    color: var(--color-text, #0f172a);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .publish-modal .slug-wrap {
    display: flex;
    border-radius: 10px;
    border: 1.5px solid var(--color-border-mid, #c7cdd8);
    overflow: hidden;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    background: #fff;
  }
  .publish-modal .slug-wrap:focus-within {
    border-color: var(--bahama-blue-600, #0089cb);
    box-shadow: 0 0 0 3px rgba(0,137,203,0.12);
  }
  .publish-modal .slug-wrap.is-invalid {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239,68,68,0.10);
  }
  .publish-modal .slug-prefix {
    padding: 9px 12px;
    background: var(--bahama-blue-50, #f0f9ff);
    color: var(--bahama-blue-700, #00699e);
    font-size: var(--font-xs);
    font-weight: 500;
    border-right: 1.5px solid var(--color-border-mid, #c7cdd8);
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .publish-modal .slug-input {
    flex: 1;
    border: none;
    outline: none;
    padding: 9px 12px;
    font-size: var(--font-sm);
    color: var(--color-text, #0f172a);
    background: transparent;
    font-family: 'Fira Code', 'Courier New', monospace;
    letter-spacing: -0.2px;
  }
  .publish-modal .slug-input::placeholder { color: #94a3b8; }
  .publish-modal .field-hint {
    font-size: var(--font-xs);
    color: var(--color-text-muted);
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .publish-modal .field-error {
    font-size: var(--font-xs);
    color: #ef4444;
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  /* Footer */
  .publish-modal .modal-footer {
    padding: 16px 24px;
    background: #fff;
    border-top: 1px solid var(--color-border, rgba(88,101,122,0.22));
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .publish-modal .btn-cancel {
    padding: 9px 18px;
    border-radius: 9px;
    border: 1.5px solid var(--color-border-mid, #c7cdd8);
    background: #fff;
    color: var(--color-secondary, #64748b);
    font-size: var(--font-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .publish-modal .btn-cancel:hover {
    background: var(--color-bg, #f8fafc);
    border-color: #94a3b8;
    color: var(--color-text);
  }

  .publish-modal .btn-publish {
    padding: 9px 20px;
    border-radius: 9px;
    border: none;
    background: linear-gradient(135deg, var(--bahama-blue-600) 0%, var(--bahama-blue-800) 100%);
    color: #fff;
    font-size: var(--font-sm);
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 7px;
    transition: all 0.18s ease;
    box-shadow: 0 2px 8px rgba(0,105,158,0.30);
    letter-spacing: -0.1px;
  }
  .publish-modal .btn-publish:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--bahama-blue-500) 0%, var(--bahama-blue-700) 100%);
    box-shadow: 0 4px 14px rgba(0,105,158,0.38);
    transform: translateY(-1px);
  }
  .publish-modal .btn-publish:disabled {
    background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
    box-shadow: none;
    cursor: not-allowed;
    opacity: 0.75;
  }
  .publish-modal .btn-publish:active:not(:disabled) {
    transform: translateY(0);
  }
`;

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
            <style>{styles}</style>
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
