import React, { useState, useRef, useEffect } from "react";
import { SquarePen, Rocket, Archive, ChevronDown, Check } from "lucide-react";

const STATUS_CONFIG = {
    Draft: {
        icon: SquarePen,
        label: "Draft",
        desc: "Belum dipublish",
        color: "#64748b",
        bg: "#f1f5f9",
        border: "#cbd5e1",
        dot: "#94a3b8",
        badgeBg: "#f1f5f9",
        badgeColor: "#475569",
    },
    Published: {
        icon: Rocket,
        label: "Published",
        desc: "Terlihat oleh publik",
        color: "#00699e",
        bg: "#f0f9ff",
        border: "#7bd6fe",
        dot: "#0aabed",
        badgeBg: "#dff3ff",
        badgeColor: "#00699e",
    },
    Archived: {
        icon: Archive,
        label: "Archived",
        desc: "Disembunyikan dari publik",
        color: "#92400e",
        bg: "#fffbeb",
        border: "#fde68a",
        dot: "#d97706",
        badgeBg: "#fef3c7",
        badgeColor: "#92400e",
    },
};

const ALL_STATUSES = ["Draft", "Published", "Archived"];

const StatusDropdown = ({ status, handleSelectStatus }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const current = STATUS_CONFIG[status] || STATUS_CONFIG.Draft;
    const Icon = current.icon;

    return (
        <>
            <div className="status-dropdown-wrap" ref={ref}>
                {/* Trigger */}
                <div
                    className={`status-trigger ${open ? "open" : ""}`}
                    style={{
                        "--trigger-bg": current.bg,
                        "--trigger-border": current.border,
                        "--trigger-color": current.color,
                        "--dot-color": current.dot,
                    }}
                    onClick={() => setOpen((v) => !v)}
                >
                    <span
                        className="status-dot"
                        style={{ "--dot-color": current.dot }}
                    />
                    <Icon size={13} strokeWidth={2.2} />
                    {current.label}
                    <ChevronDown size={13} className="status-chevron" />
                </div>

                {/* Panel */}
                {open && (
                    <div className="status-panel">
                        <div className="status-panel-header">Ubah Status</div>
                        {ALL_STATUSES.map((s) => {
                            const cfg = STATUS_CONFIG[s];
                            const OptionIcon = cfg.icon;
                            const isActive = s === status;
                            return (
                                <div
                                    key={s}
                                    className={`status-option ${isActive ? "active" : ""}`}
                                    style={{
                                        "--opt-bg": cfg.bg,
                                        "--opt-border": cfg.border,
                                    }}
                                    onClick={() => {
                                        setOpen(false);
                                        if (s !== status) handleSelectStatus(s);
                                    }}
                                >
                                    <div
                                        className="status-option-icon-wrap"
                                        style={{
                                            "--opt-bg": cfg.bg,
                                            "--opt-border": cfg.border,
                                        }}
                                    >
                                        <OptionIcon
                                            size={15}
                                            color={cfg.color}
                                            strokeWidth={2}
                                        />
                                    </div>
                                    <div className="status-option-text">
                                        <div className="status-option-label">
                                            {cfg.label}
                                        </div>
                                        <div className="status-option-desc">
                                            {cfg.desc}
                                        </div>
                                    </div>
                                    {isActive && (
                                        <Check
                                            size={14}
                                            className="status-check"
                                            strokeWidth={2.5}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
};

export default StatusDropdown;
