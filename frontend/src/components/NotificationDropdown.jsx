import React, { useState, useRef, useEffect } from "react";
import {
    Bell,
    CheckCircle2,
    AlertTriangle,
    Info,
    AlertCircle,
    Check,
    X,
    ChevronRight,
    Inbox,
} from "lucide-react";

const NOTIF_CONFIG = {
    success: {
        icon: CheckCircle2,
        color: "#16a34a",
        bg: "#f0fdf4",
        border: "#86efac",
        dot: "#22c55e",
        headerFrom: "#14532d",
        headerTo: "#166534",
        label: "Sukses",
    },
    warning: {
        icon: AlertTriangle,
        color: "#d97706",
        bg: "#fffbeb",
        border: "#fde68a",
        dot: "#f59e0b",
        headerFrom: "#78350f",
        headerTo: "#92400e",
        label: "Peringatan",
    },
    info: {
        icon: Info,
        color: "#00699e",
        bg: "#f0f9ff",
        border: "#7bd6fe",
        dot: "#0aabed",
        headerFrom: "#07304a",
        headerTo: "#055c87",
        label: "Info",
    },
    error: {
        icon: AlertCircle,
        color: "#dc2626",
        bg: "#fff5f5",
        border: "#fecaca",
        dot: "#ef4444",
        headerFrom: "#7f1d1d",
        headerTo: "#991b1b",
        label: "Error",
    },
};

const styles = `
  .notif-wrap {
    position: relative;
    display: inline-block;
  }

  /* Bell trigger */
  .notif-trigger {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: 1.5px solid var(--color-border-mid, #c7cdd8);
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    transition: all 0.15s ease;
    color: var(--color-secondary, #64748b);
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  .notif-trigger:hover {
    border-color: var(--bahama-blue-400, #34c2fc);
    color: var(--bahama-blue-700, #00699e);
    box-shadow: 0 0 0 3px rgba(0,105,158,0.10), 0 2px 6px rgba(0,0,0,0.08);
  }
  .notif-trigger.open {
    border-color: var(--bahama-blue-600, #0089cb);
    color: var(--bahama-blue-700, #00699e);
    background: var(--bahama-blue-50, #f0f9ff);
    box-shadow: 0 0 0 3px rgba(0,105,158,0.13);
  }

  .notif-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #ef4444;
    border: 2px solid #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-weight: 700;
    color: #fff;
    line-height: 1;
    box-shadow: 0 1px 4px rgba(239,68,68,0.40);
  }
  .notif-badge-pulse {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: rgba(239,68,68,0.3);
    animation: pulse 2s ease infinite;
  }
  @keyframes pulse {
    0%   { transform: scale(1);   opacity: 0.7; }
    50%  { transform: scale(1.8); opacity: 0; }
    100% { transform: scale(1);   opacity: 0; }
  }

  /* Panel */
  .notif-panel {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 360px;
    background: #fff;
    border-radius: 14px;
    border: 1.5px solid var(--color-border-mid, #c7cdd8);
    box-shadow:
      0 0 0 1px rgba(0,105,158,0.06),
      0 20px 40px -8px rgba(7,48,74,0.18),
      0 4px 10px -2px rgba(0,0,0,0.08);
    overflow: hidden;
    z-index: 1050;
    animation: dropIn 0.16s ease;
  }
  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-8px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Panel header */
  .notif-panel-header {
    background: #fff;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--color-border, rgba(88,101,122,0.18));
  }
  .notif-panel-header-left {
    display: flex;
    align-items: center;
    gap: 9px;
  }
  .notif-header-icon-wrap {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    background: var(--bahama-blue-50, #f0f9ff);
    border: 1.5px solid var(--bahama-blue-200, #b9e7fe);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .notif-panel-title {
    font-size: var(--font-sm, 14px);
    font-weight: 700;
    color: var(--color-text, #0f172a);
    letter-spacing: -0.2px;
  }
  .notif-panel-subtitle {
    font-size: 10px;
    color: var(--color-text-muted, #94a3b8);
    margin-top: 1px;
  }
  .notif-count-badge {
    background: #ef4444;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 999px;
    letter-spacing: 0.3px;
  }
  .notif-mark-all {
    font-size: 11px;
    color: var(--bahama-blue-700, #00699e);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border-radius: 7px;
    border: 1.5px solid var(--bahama-blue-200, #b9e7fe);
    background: var(--bahama-blue-50, #f0f9ff);
    transition: all 0.15s ease;
    white-space: nowrap;
    font-weight: 600;
  }
  .notif-mark-all:hover {
    background: var(--bahama-blue-100, #dff3ff);
    border-color: var(--bahama-blue-400, #34c2fc);
  }

  /* List */
  .notif-list {
    max-height: 320px;
    overflow-y: auto;
    background: var(--color-bg, #f8fafc);
  }
  .notif-list::-webkit-scrollbar { width: 4px; }
  .notif-list::-webkit-scrollbar-track { background: transparent; }
  .notif-list::-webkit-scrollbar-thumb {
    background: var(--color-border-mid, #c7cdd8);
    border-radius: 4px;
  }

  .notif-item {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--color-border, rgba(88,101,122,0.13));
    cursor: pointer;
    transition: background 0.12s ease;
    position: relative;
    text-decoration: none;
  }
  .notif-item:last-child { border-bottom: none; }
  .notif-item:hover { background: #fff; }
  .notif-item.unread { background: #fff; }
  .notif-item.unread::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--item-dot, #0aabed);
    border-radius: 0 3px 3px 0;
  }

  .notif-item-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 1.5px solid var(--item-border);
    background: var(--item-bg);
  }

  .notif-item-content { flex: 1; min-width: 0; }
  .notif-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 3px;
  }
  .notif-item-title {
    font-size: var(--font-sm, 14px);
    font-weight: 600;
    color: var(--color-text, #0f172a);
    line-height: 1.25;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .notif-item-time {
    font-size: 10px;
    color: var(--color-text-muted, #94a3b8);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .notif-item-message {
    font-size: var(--font-xs, 12px);
    color: var(--color-secondary, #64748b);
    line-height: 1.45;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .notif-type-tag {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    font-weight: 600;
    padding: 1px 6px;
    border-radius: 5px;
    margin-top: 5px;
    border: 1px solid var(--item-border);
    background: var(--item-bg);
    color: var(--item-color);
  }

  /* Empty state */
  .notif-empty {
    padding: 36px 20px;
    text-align: center;
    color: var(--color-text-muted, #64748b);
  }
  .notif-empty-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: var(--bahama-blue-50, #f0f9ff);
    border: 1.5px solid var(--bahama-blue-200, #b9e7fe);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
  }
  .notif-empty-title {
    font-size: var(--font-sm, 14px);
    font-weight: 600;
    color: var(--color-text, #0f172a);
    margin-bottom: 4px;
  }
  .notif-empty-desc {
    font-size: var(--font-xs, 12px);
    color: var(--color-text-muted, #94a3b8);
  }

  /* Footer */
  .notif-panel-footer {
    padding: 11px 16px;
    background: #fff;
    border-top: 1px solid var(--color-border, rgba(88,101,122,0.18));
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .notif-footer-link {
    font-size: var(--font-xs, 12px);
    font-weight: 600;
    color: var(--bahama-blue-700, #00699e);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: gap 0.15s ease;
    text-decoration: none;
  }
  .notif-footer-link:hover { gap: 7px; color: var(--bahama-blue-600, #0089cb); }
`;

const NotificationDropdown = () => {
    const [open, setOpen] = useState(false);
    const [read, setRead] = useState(new Set());
    const ref = useRef(null);

    const notifications = [
        {
            id: 1,
            type: "success",
            title: "Event Berhasil Dibuat",
            message:
                "Acara 'Workshop ReactJS' sudah live dan bisa diakses publik.",
            time: "Baru saja",
        },
        {
            id: 2,
            type: "warning",
            title: "Pengingat Acara",
            message: "Tinggal 3 hari lagi untuk event 'Tech Conference 2026'!",
            time: "2 jam lalu",
        },
        {
            id: 3,
            type: "info",
            title: "Draft Disimpan",
            message: "Draft event 'Webinar Tahunan' berhasil diperbarui.",
            time: "5 jam lalu",
        },
        {
            id: 4,
            type: "error",
            title: "Peringatan Kapasitas",
            message:
                "Pendaftaran untuk 'Seminar UI/UX' sudah melebihi kuota ruangan.",
            time: "1 hari lalu",
        },
    ];

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const unreadCount = notifications.filter((n) => !read.has(n.id)).length;

    const markAllRead = (e) => {
        e.stopPropagation();
        setRead(new Set(notifications.map((n) => n.id)));
    };

    const markRead = (id) => setRead((prev) => new Set([...prev, id]));

    return (
        <>
            <style>{styles}</style>
            <div className="notif-wrap" ref={ref}>
                {/* Trigger */}
                <div
                    className={`notif-trigger ${open ? "open" : ""}`}
                    onClick={() => setOpen((v) => !v)}
                >
                    <Bell size={17} strokeWidth={2} />
                    {unreadCount > 0 && (
                        <>
                            <span className="notif-badge-pulse" />
                            <span className="notif-badge">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        </>
                    )}
                </div>

                {/* Panel */}
                {open && (
                    <div className="notif-panel">
                        {/* Header */}
                        <div className="notif-panel-header">
                            <div className="notif-panel-header-left">
                                <div className="notif-header-icon-wrap">
                                    <Bell
                                        size={15}
                                        color="var(--bahama-blue-700, #00699e)"
                                        strokeWidth={2}
                                    />
                                </div>
                                <div>
                                    <div className="notif-panel-title">
                                        Notifikasi
                                    </div>
                                    <div className="notif-panel-subtitle">
                                        Event & aktivitas terbaru
                                    </div>
                                </div>
                                {unreadCount > 0 && (
                                    <span className="notif-count-badge">
                                        {unreadCount} baru
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    className="notif-mark-all"
                                    onClick={markAllRead}
                                >
                                    <Check size={11} />
                                    Tandai semua
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="notif-list">
                            {notifications.length === 0 ? (
                                <div className="notif-empty">
                                    <div className="notif-empty-icon">
                                        <Inbox
                                            size={22}
                                            color="var(--bahama-blue-500, #0aabed)"
                                            strokeWidth={1.8}
                                        />
                                    </div>
                                    <div className="notif-empty-title">
                                        Tidak ada notifikasi
                                    </div>
                                    <div className="notif-empty-desc">
                                        Semuanya sudah up to date
                                    </div>
                                </div>
                            ) : (
                                notifications.map((notif) => {
                                    const cfg =
                                        NOTIF_CONFIG[notif.type] ||
                                        NOTIF_CONFIG.info;
                                    const Icon = cfg.icon;
                                    const isUnread = !read.has(notif.id);
                                    return (
                                        <div
                                            key={notif.id}
                                            className={`notif-item ${isUnread ? "unread" : ""}`}
                                            style={{
                                                "--item-dot": cfg.dot,
                                                "--item-bg": cfg.bg,
                                                "--item-border": cfg.border,
                                                "--item-color": cfg.color,
                                            }}
                                            onClick={() => markRead(notif.id)}
                                        >
                                            <div className="notif-item-icon">
                                                <Icon
                                                    size={16}
                                                    color={cfg.color}
                                                    strokeWidth={2}
                                                />
                                            </div>
                                            <div className="notif-item-content">
                                                <div className="notif-item-header">
                                                    <span className="notif-item-title">
                                                        {notif.title}
                                                    </span>
                                                    <span className="notif-item-time">
                                                        {notif.time}
                                                    </span>
                                                </div>
                                                <p className="notif-item-message">
                                                    {notif.message}
                                                </p>
                                                <span className="notif-type-tag">
                                                    <Icon
                                                        size={9}
                                                        strokeWidth={2.5}
                                                    />
                                                    {cfg.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="notif-panel-footer">
                            <a href="#" className="notif-footer-link">
                                Lihat semua notifikasi
                                <ChevronRight size={13} strokeWidth={2.5} />
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default NotificationDropdown;
