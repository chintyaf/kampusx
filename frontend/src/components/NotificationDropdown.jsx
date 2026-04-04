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
            <div className="notif-wrap mx-2" ref={ref}>
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
