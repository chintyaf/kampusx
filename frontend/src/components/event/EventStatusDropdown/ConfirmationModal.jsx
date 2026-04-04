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



const ConfirmationModal = ({ show, onClose, onConfirm, pendingStatus }) => {
    if (!show) return null;

    const cfg = STATUS_CONFIG[pendingStatus] || STATUS_CONFIG.Draft;
    const Icon = cfg.icon;

    return (
        <>
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
