import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, Badge } from "react-bootstrap";
import {
    Bell,
    CheckCircle2,
    AlertTriangle,
    Info,
    AlertCircle,
} from "lucide-react";
import api from "../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";

const NotificationDropdown = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const response = await api.get("notifications");
            if (response.data && response.data.success) {
                setNotifications(response.data.data);
                setUnreadCount(response.data.unread_count);
            }
        } catch (error) {
            console.error("Gagal memuat notifikasi:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        
        // Polling setiap 30 detik untuk real-time update
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id, eventId, type) => {
        try {
            await api.post(`notifications/${id}/read`);
            
            // Perbarui state lokal
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));

            // Arahkan user ke halaman detail yang sesuai
            if (type === 'organizer_approved') {
                navigate('/organizer/dashboard');
            } else if (eventId) {
                const isOrganizerPath = window.location.pathname.startsWith('/organizer');
                if (isOrganizerPath) {
                    navigate(`/organizer/${eventId}/event-dashboard`);
                } else {
                    navigate(`/event-space/${eventId}`);
                }
            }
        } catch (error) {
            console.error("Gagal menandai dibaca:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post("notifications/read-all");
            setNotifications(prev => 
                prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error("Gagal menandai semua dibaca:", error);
        }
    };

    const timeAgo = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return "Baru saja";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} menit yang lalu`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} jam yang lalu`;
        const days = Math.floor(hours / 24);
        if (days === 1) return "Kemarin";
        return `${days} hari yang lalu`;
    };

    const getNotificationStyle = (type) => {
        switch (type) {
            case "H-24":
                return {
                    icon: <Info size={20} className="text-primary" />,
                    bg: "bg-primary",
                };
            case "H-1":
                return {
                    icon: <AlertTriangle size={20} className="text-warning" />,
                    bg: "bg-warning",
                };
            case "M-15":
                return {
                    icon: <AlertCircle size={20} className="text-danger" />,
                    bg: "bg-danger",
                };
            case "organizer_approved":
                return {
                    icon: <CheckCircle2 size={20} className="text-success" />,
                    bg: "bg-success",
                };
            case "organizer_rejected":
            case "account_suspended":
                return {
                    icon: <AlertTriangle size={20} className="text-warning" />,
                    bg: "bg-warning",
                };
            case "account_banned":
                return {
                    icon: <AlertCircle size={20} className="text-danger" />,
                    bg: "bg-danger",
                };
            default:
                return {
                    icon: <Info size={20} className="text-secondary" />,
                    bg: "bg-secondary",
                };
        }
    };

    return (
        <div className="dropdown">
            {/* 1. Trigger: Ikon Lonceng */}
            <div
                className="d-flex align-items-center position-relative p-2"
                style={{ cursor: "pointer" }}
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                <Bell size={20} strokeWidth={2} className="text-dark" />
                {/* Badge jumlah unread */}
                {unreadCount > 0 && (
                    <span
                        className="position-absolute bg-danger rounded-circle d-flex align-items-center justify-content-center text-white font-bold"
                        style={{
                            top: "0px",
                            right: "0px",
                            width: "18px",
                            height: "18px",
                            fontSize: "10px",
                            fontWeight: "700",
                            border: "2px solid white",
                        }}
                    >
                        {unreadCount}
                    </span>
                )}
            </div>

            {/* 2. Menu Dropdown: Menggunakan class pop-down milikmu */}
            <ul
                className="dropdown-menu dropdown-menu-end border-1 mt-2 p-0 pop-down shadow"
                style={{
                    width: "360px",
                    borderRadius: "10px",
                    overflow: "hidden",
                }}
            >
                {/* Header */}
                <li>
                    <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
                        <h6 className="m-0 fw-semibold text-dark">Notifikasi Acara</h6>
                        {unreadCount > 0 && (
                            <span
                                className="text-primary fw-medium"
                                style={{ fontSize: "12px", cursor: "pointer" }}
                                onClick={markAllAsRead}
                            >
                                Tandai semua dibaca
                            </span>
                        )}
                    </div>
                </li>

                {/* List Notifikasi (Scrollable) */}
                <li>
                    <div style={{ maxHeight: "350px", overflowY: "auto" }}>
                        {loading ? (
                            <div className="text-center py-4 text-muted" style={{ fontSize: "14px" }}>
                                Memuat notifikasi...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-4 text-muted" style={{ fontSize: "14px" }}>
                                Tidak ada notifikasi baru
                            </div>
                        ) : (
                            notifications.map((notif) => {
                                const data = typeof notif.data === "string" ? JSON.parse(notif.data) : (notif.data || {});
                                const isUnread = !notif.read_at;
                                const { icon, bg } = getNotificationStyle(data.type);

                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => markAsRead(notif.id, data.event_id, data.type)}
                                        className="d-flex p-3 border-bottom text-wrap align-items-start notification-item"
                                        style={{ 
                                            whiteSpace: "normal", 
                                            cursor: "pointer",
                                            backgroundColor: isUnread ? "rgba(247, 250, 252, 1)" : "transparent",
                                            transition: "background-color 0.2s"
                                        }}
                                    >
                                        <div
                                            className={`rounded d-flex align-items-center justify-content-center me-3 ${bg} bg-opacity-10`}
                                            style={{
                                                width: "36px",
                                                height: "36px",
                                                flexShrink: 0,
                                            }}
                                        >
                                            {icon}
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <h6
                                                    className="mb-0 fw-semibold"
                                                    style={{
                                                        fontSize: "13px",
                                                        color: isUnread ? "#1a202c" : "#718096",
                                                    }}
                                                >
                                                    {data.title || "Pengingat Acara"}
                                                </h6>
                                                {isUnread && (
                                                    <span 
                                                        className="bg-primary rounded-circle"
                                                        style={{ width: "8px", height: "8px", flexShrink: 0 }}
                                                    />
                                                )}
                                            </div>
                                            <p
                                                className="mb-1 text-muted"
                                                style={{
                                                    fontSize: "12px",
                                                    lineHeight: "1.4",
                                                    fontWeight: isUnread ? "500" : "normal"
                                                }}
                                            >
                                                {data.message}
                                            </p>
                                            <small
                                                className="text-secondary"
                                                style={{ fontSize: "11px" }}
                                            >
                                                {timeAgo(notif.created_at)}
                                            </small>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </li>

                {/* Footer */}
                <li>
                    <div className="pt-2 pb-2 px-2 text-center border-top bg-light">
                        <span
                            className="text-primary text-decoration-none fw-semibold"
                            style={{ fontSize: "13px", cursor: "default" }}
                        >
                            Pusat Notifikasi KampusX
                        </span>
                    </div>
                </li>
            </ul>
        </div>
    );
};

export default NotificationDropdown;
