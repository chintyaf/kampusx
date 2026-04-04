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

const styles = `
  .status-dropdown-wrap {
    position: relative;
    display: inline-block;
  }

  .status-trigger {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 12px 7px 10px;
    border-radius: 10px;
    border: 1.5px solid var(--trigger-border);
    background: var(--trigger-bg);
    cursor: pointer;
    transition: all 0.15s ease;
    user-select: none;
    font-size: 13px;
    font-weight: 600;
    color: var(--trigger-color);
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    white-space: nowrap;
  }
  .status-trigger:hover {
    filter: brightness(0.96);
    box-shadow: 0 2px 6px rgba(0,0,0,0.10);
  }
  .status-trigger.open {
    box-shadow: 0 0 0 3px rgba(0,105,158,0.13), 0 2px 8px rgba(0,0,0,0.10);
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 0 0 2px rgba(255,255,255,0.9), 0 0 0 3.5px var(--dot-color);
    background: var(--dot-color);
  }

  .status-chevron {
    transition: transform 0.2s ease;
    opacity: 0.55;
    margin-left: 2px;
  }
  .status-trigger.open .status-chevron {
    transform: rotate(180deg);
    opacity: 0.8;
  }

  /* Dropdown panel */
  .status-panel {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    min-width: 220px;
    background: #fff;
    border-radius: 12px;
    border: 1.5px solid var(--color-border-mid, #c7cdd8);
    box-shadow:
      0 0 0 1px rgba(0,105,158,0.06),
      0 16px 32px -8px rgba(7,48,74,0.18),
      0 4px 10px -2px rgba(0,0,0,0.08);
    overflow: hidden;
    z-index: 1050;
    animation: dropIn 0.15s ease;
  }
  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-6px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .status-panel-header {
    padding: 10px 14px 8px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.7px;
    text-transform: uppercase;
    color: var(--color-text-muted, #64748b);
    border-bottom: 1px solid var(--color-border, rgba(88,101,122,0.22));
    background: var(--color-bg, #f8fafc);
  }

  .status-option {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    cursor: pointer;
    transition: background 0.12s ease;
    border-bottom: 1px solid var(--color-border, rgba(88,101,122,0.12));
  }
  .status-option:last-child { border-bottom: none; }
  .status-option:hover { background: var(--color-bg, #f8fafc); }
  .status-option.active { background: var(--bahama-blue-50, #f0f9ff); }

  .status-option-icon-wrap {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 1.5px solid var(--opt-border);
    background: var(--opt-bg);
  }

  .status-option-text { flex: 1; }
  .status-option-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text, #0f172a);
    line-height: 1.2;
  }
  .status-option-desc {
    font-size: 11px;
    color: var(--color-text-muted, #64748b);
    margin-top: 1px;
  }

  .status-check {
    color: var(--bahama-blue-600, #0089cb);
    flex-shrink: 0;
  }
`;

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
            <style>{styles}</style>
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
