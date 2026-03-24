import React from "react";
import { Dropdown, Badge } from "react-bootstrap";
import {
    Bell,
    CheckCircle2,
    AlertTriangle,
    Info,
    AlertCircle,
} from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";

const NotificationDropdown = () => {
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
            time: "2 jam yang lalu",
        },
        {
            id: 3,
            type: "info",
            title: "Draft Disimpan",
            message: "Draft event 'Webinar Tahunan' berhasil diperbarui.",
            time: "5 jam yang lalu",
        },
        {
            id: 4,
            type: "error",
            title: "Peringatan Kapasitas",
            message:
                "Pendaftaran untuk 'Seminar UI/UX' sudah melebihi kuota ruangan.",
            time: "1 hari yang lalu",
        },
    ];

    const getNotificationStyle = (type) => {
        switch (type) {
            case "success":
                return {
                    icon: <CheckCircle2 size={20} className="text-success" />,
                    bg: "bg-success",
                };
            case "warning":
                return {
                    icon: <AlertTriangle size={20} className="text-warning" />,
                    bg: "bg-warning",
                };
            case "info":
                return {
                    icon: <Info size={20} className="text-primary" />,
                    bg: "bg-primary",
                };
            case "error":
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
                {/* Titik merah penanda */}
                <span
                    className="position-absolute bg-danger rounded-circle"
                    style={{
                        top: "8px",
                        right: "8px",
                        width: "10px",
                        height: "10px",
                        border: "2px solid white",
                    }}
                >
                    <span className="visually-hidden">Notifikasi baru</span>
                </span>
            </div>

            {/* 2. Menu Dropdown: Menggunakan class pop-down milikmu */}
            <ul
                className="dropdown-menu dropdown-menu-end border-1 mt-2 p-0 pop-down"
                style={{
                    width: "350px",
                    borderRadius: "7px",
                    overflow: "hidden",
                }}
            >
                {/* Header */}
                <li>
                    <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                        <h6 className="m-0 fw-semibold">Notifikasi Event</h6>
                        <span
                            className="text-primary"
                            style={{ fontSize: "12px", cursor: "pointer" }}
                        >
                            Tandai semua dibaca
                        </span>
                    </div>
                </li>

                {/* List Notifikasi (Scrollable) */}
                <li>
                    <div style={{ maxHeight: "350px", overflowY: "auto" }}>
                        {notifications.map((notif) => {
                            const { icon, bg } = getNotificationStyle(
                                notif.type,
                            );

                            return (
                                <a
                                    key={notif.id}
                                    href="#"
                                    className="dropdown-item d-flex p-3 border-bottom text-wrap align-items-start"
                                    style={{ whiteSpace: "normal" }}
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
                                    <div>
                                        <h6
                                            className="mb-1 fw-semibold"
                                            style={{
                                                fontSize: "14px",
                                                color: "#2d3748",
                                            }}
                                        >
                                            {notif.title}
                                        </h6>
                                        <p
                                            className="mb-1 text-muted"
                                            style={{
                                                fontSize: "13px",
                                                lineHeight: "1.4",
                                            }}
                                        >
                                            {notif.message}
                                        </p>
                                        <small
                                            className="text-secondary"
                                            style={{ fontSize: "11px" }}
                                        >
                                            {notif.time}
                                        </small>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                </li>

                {/* Footer */}
                <li>
                    <div className="pt-1 pb-2 px-2 text-center border-top">
                        <a
                            href="#"
                            className="text-primary text-decoration-none"
                            style={{ fontSize: "13px", fontWeight: "500" }}
                        >
                            Lihat semua notifikasi
                        </a>
                    </div>
                </li>
            </ul>
        </div>
    );
};

export default NotificationDropdown;
