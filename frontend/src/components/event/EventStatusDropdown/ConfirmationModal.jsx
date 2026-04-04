import React from "react";
import {
    SquarePen,
    Rocket,
    Archive,
    AlertTriangle,
    X,
    Check,
} from "lucide-react";

const STATUS_CONFIG = {
    Draft: {
        icon: SquarePen,
        color: "#64748b",
        bg: "#f1f5f9",
        border: "#cbd5e1",
        headerFrom: "#334155",
        headerTo: "#475569",
        btnBg: "linear-gradient(135deg, #475569 0%, #334155 100%)",
        btnShadow: "rgba(51,65,85,0.30)",
    },
    Published: {
        icon: Rocket,
        color: "#00699e",
        bg: "#f0f9ff",
        border: "#7bd6fe",
        headerFrom: "#07304a",
        headerTo: "#055c87",
        btnBg: "linear-gradient(135deg, #0089cb 0%, #00699e 100%)",
        btnShadow: "rgba(0,105,158,0.30)",
    },
    Archived: {
        icon: Archive,
        color: "#92400e",
        bg: "#fffbeb",
        border: "#fde68a",
        headerFrom: "#78350f",
        headerTo: "#92400e",
        btnBg: "linear-gradient(135deg, #d97706 0%, #92400e 100%)",
        btnShadow: "rgba(146,64,14,0.28)",
    },
};

const styles = `
  .confirm-modal .modal-content {
    border: none;
    border-radius: 16px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(0,105,158,0.08),
      0 24px 48px -12px rgba(7,48,74,0.22),
      0 8px 16px -4px rgba(0,105,158,0.10);
  }

  .confirm-modal .modal-header {
    padding: 20px 24px;
    border: none;
  }

  .confirm-modal .modal-icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .confirm-modal .modal-title {
    font-size: var(--font-lg, 20px);
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.3px;
    margin: 0;
  }
  .confirm-modal .modal-subtitle {
    font-size: var(--font-xs, 12px);
    color: rgba(255,255,255,0.55);
    margin-top: 2px;
  }

  .confirm-modal .btn-close-custom {
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
  .confirm-modal .btn-close-custom:hover {
    background: rgba(255,255,255,0.18);
    color: #fff;
  }

  .confirm-modal .modal-body {
    padding: 24px;
    background: var(--color-bg, #f8fafc);
  }

  .confirm-modal .confirm-card {
    border-radius: 10px;
    border: 1.5px solid var(--card-border);
    background: var(--card-bg);
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .confirm-modal .confirm-card-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: rgba(255,255,255,0.7);
    border: 1.5px solid var(--card-border);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .confirm-modal .confirm-card-label {
    font-size: var(--font-xs, 12px);
    color: var(--color-text-muted, #64748b);
    margin-bottom: 2px;
  }
  .confirm-modal .confirm-card-value {
    font-size: var(--font-sm, 14px);
    font-weight: 700;
    color: var(--card-color);
  }

  .confirm-modal .confirm-warning {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 8px;
    background: #fffbeb;
    border: 1px solid #fde68a;
    margin-top: 12px;
    font-size: var(--font-xs, 12px);
    color: #92400e;
  }

  .confirm-modal .modal-footer {
    padding: 16px 24px;
    background: #fff;
    border-top: 1px solid var(--color-border, rgba(88,101,122,0.22));
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .confirm-modal .btn-cancel {
    padding: 9px 18px;
    border-radius: 9px;
    border: 1.5px solid var(--color-border-mid, #c7cdd8);
    background: #fff;
    color: var(--color-secondary, #64748b);
    font-size: var(--font-sm, 14px);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .confirm-modal .btn-cancel:hover {
    background: var(--color-bg, #f8fafc);
    border-color: #94a3b8;
    color: var(--color-text, #0f172a);
  }

  .confirm-modal .btn-confirm {
    padding: 9px 20px;
    border-radius: 9px;
    border: none;
    color: #fff;
    font-size: var(--font-sm, 14px);
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 7px;
    transition: all 0.18s ease;
    letter-spacing: -0.1px;
  }
  .confirm-modal .btn-confirm:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
  }
  .confirm-modal .btn-confirm:active {
    transform: translateY(0);
  }
`;

const ConfirmationModal = ({ show, onClose, onConfirm, pendingStatus }) => {
    if (!show) return null;

    const cfg = STATUS_CONFIG[pendingStatus] || STATUS_CONFIG.Draft;
    const Icon = cfg.icon;

    return (
        <>
            <style>{styles}</style>
            <div
                className="modal fade show d-block confirm-modal"
                tabIndex="-1"
                style={{
                    backgroundColor: "rgba(7,48,74,0.45)",
                    backdropFilter: "blur(2px)",
                }}
            >
                <div className="modal-dialog modal-dialog-centered modal-sm">
                    <div className="modal-content">
                        {/* HEADER */}
                        <div
                            className="modal-header"
                            style={{
                                background: `linear-gradient(135deg, ${cfg.headerFrom} 0%, ${cfg.headerTo} 100%)`,
                            }}
                        >
                            <div className="d-flex align-items-start justify-content-between w-100 gap-3">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="modal-icon-wrap">
                                        <Icon
                                            size={17}
                                            color="#fff"
                                            strokeWidth={2}
                                        />
                                    </div>
                                    <div>
                                        <div className="modal-title">
                                            Konfirmasi Status
                                        </div>
                                        <div className="modal-subtitle">
                                            Perubahan akan langsung diterapkan
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="btn-close-custom"
                                    onClick={onClose}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {/* BODY */}
                        <div className="modal-body">
                            <div
                                className="confirm-card"
                                style={{
                                    "--card-bg": cfg.bg,
                                    "--card-border": cfg.border,
                                    "--card-color": cfg.color,
                                }}
                            >
                                <div className="confirm-card-icon">
                                    <Icon
                                        size={18}
                                        color={cfg.color}
                                        strokeWidth={2}
                                    />
                                </div>
                                <div>
                                    <div className="confirm-card-label">
                                        Status baru
                                    </div>
                                    <div className="confirm-card-value">
                                        {pendingStatus}
                                    </div>
                                </div>
                            </div>

                            <div className="confirm-warning">
                                <AlertTriangle
                                    size={13}
                                    color="#d97706"
                                    style={{ flexShrink: 0, marginTop: 1 }}
                                />
                                Yakin ingin mengubah status event ke{" "}
                                <strong>&nbsp;{pendingStatus}</strong>?
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={onClose}>
                                Batal
                            </button>
                            <button
                                className="btn-confirm"
                                style={{
                                    background: cfg.btnBg,
                                    boxShadow: `0 2px 8px ${cfg.btnShadow}`,
                                }}
                                onClick={onConfirm}
                            >
                                <Check size={14} strokeWidth={2.5} />
                                Ya, Ubah Status
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ConfirmationModal;
