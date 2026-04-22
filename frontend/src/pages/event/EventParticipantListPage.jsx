import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import { toast, Toaster } from "react-hot-toast";
import {
    Table,
    Badge,
    Button,
    InputGroup,
    Form,
    Dropdown,
    Card,
    Spinner,
    Pagination
} from "react-bootstrap";
import {
    Search,
    Filter,
    MoreVertical,
    UserCheck,
    Eye,
    EyeOff,
    School,
    MessageCircle,
    ShieldCheck,
    Users,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import FormHeading from "../../components/dashboard/FormHeading";
import "../../assets/css/participant-list.css";

// ─── Utility: masking helpers ────────────────────────────────────────────────
const maskEmail = (email) => {
    if (!email) return "-";
    const [user, domain] = email.split("@");
    if (!domain) return email;
    const visible = user.slice(0, Math.min(3, user.length));
    return `${visible}***@${domain}`;
};

const maskPhone = (phone) => {
    if (!phone) return "-";
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 6) return "***";
    return digits.slice(0, 3) + " **** " + digits.slice(-3);
};

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    active: {
        label: "Aktif",
        className: "participant-badge participant-badge--success",
        icon: <CheckCircle2 size={11} />,
    },
    checked_in: {
        label: "Hadir",
        className: "participant-badge participant-badge--primary",
        icon: <UserCheck size={11} />,
    },
    cancelled: {
        label: "Batal",
        className: "participant-badge participant-badge--danger",
        icon: <XCircle size={11} />,
    },
    default: {
        label: "Tidak diketahui",
        className: "participant-badge participant-badge--neutral",
        icon: null,
    },
};

const getStatusConfig = (status) => STATUS_CONFIG[status] ?? STATUS_CONFIG.default;

// ─── Avatar initials ──────────────────────────────────────────────────────────
const getInitials = (name = "") =>
    name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

// ─── Color pool for avatars (deterministic by name) ──────────────────────────
const AVATAR_COLORS = [
    { bg: "#dff3ff", text: "#00699e" },
    { bg: "#dcfce7", text: "#166534" },
    { bg: "#fef3c7", text: "#92400e" },
    { bg: "#fce7f3", text: "#9d174d" },
    { bg: "#ede9fe", text: "#4c1d95" },
    { bg: "#fee2e2", text: "#991b1b" },
];
const getAvatarColor = (name = "") => {
    const code = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return AVATAR_COLORS[code % AVATAR_COLORS.length];
};

// ─── Component ────────────────────────────────────────────────────────────────
const EventParticipantListPage = () => {
    const { eventId } = useParams();

    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);
    // Per-row reveal state: { [ticketId]: { email: bool, phone: bool } }
    const [revealed, setRevealed] = useState({});
    const [pageInfo, setPageInfo] = useState({ current_page: 1, last_page: 1, total: 0 });

    const fetchParticipants = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get(`/event-dashboard/${eventId}/daftar-peserta`, {
                params: { all: showAll, page },
            });
            const data = response.data.data;
            if (showAll) {
                setParticipants(data);
                setPageInfo({ total: data.length });
            } else {
                setParticipants(data.data);
                setPageInfo({
                    current_page: data.current_page,
                    last_page: data.last_page,
                    total: data.total,
                });
            }
        } catch {
            toast.error("Tidak dapat memuat daftar peserta.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (eventId) fetchParticipants();
    }, [eventId, showAll]);

    const toggleReveal = (ticketId, field) => {
        setRevealed((prev) => ({
            ...prev,
            [ticketId]: { ...prev[ticketId], [field]: !prev[ticketId]?.[field] },
        }));
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > pageInfo.last_page) return;
        fetchParticipants(page);
    };

    // ── Stats ─────────────────────────────────────────────────────────────────
    const total = pageInfo.total || 0;
    const checkedIn = participants.filter((t) => t.status === "checked_in").length;
    const active = participants.filter((t) => t.status === "active").length;
    const cancelled = participants.filter((t) => t.status === "cancelled").length;

    // ── Pagination ────────────────────────────────────────────────────────────
    const renderPagination = () => {
        if (showAll || pageInfo.last_page <= 1) return null;

        const buildItems = () => {
            const items = [];
            const { current_page, last_page } = pageInfo;
            const delta = 1;
            const range = [];

            for (let i = Math.max(2, current_page - delta); i <= Math.min(last_page - 1, current_page + delta); i++) {
                range.push(i);
            }

            const pages = [1, ...range, last_page].filter((v, i, arr) => arr.indexOf(v) === i);

            pages.forEach((page, idx) => {
                if (idx > 0 && page - pages[idx - 1] > 1) {
                    items.push(<span key={`ellipsis-${idx}`} className="pagination-ellipsis">…</span>);
                }
                items.push(
                    <button
                        key={page}
                        className={`pagination-btn${page === current_page ? " active" : ""}`}
                        onClick={() => handlePageChange(page)}
                    >
                        {page}
                    </button>
                );
            });
            return items;
        };

        return (
            <div className="participant-pagination">
                <span className="pagination-info">
                    Halaman {pageInfo.current_page} dari {pageInfo.last_page}
                </span>
                <div className="pagination-controls">
                    <button
                        className="pagination-btn pagination-nav"
                        onClick={() => handlePageChange(pageInfo.current_page - 1)}
                        disabled={pageInfo.current_page === 1}
                    >
                        <ChevronLeft size={14} />
                    </button>
                    {buildItems()}
                    <button
                        className="pagination-btn pagination-nav"
                        onClick={() => handlePageChange(pageInfo.current_page + 1)}
                        disabled={pageInfo.current_page === pageInfo.last_page}
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="participant-page">
            <Toaster position="top-right" />
            <FormHeading
                heading="Daftar Peserta Event"
                subheading={`Total: ${total} tiket peserta sah`}
            />

            {/* ── Privacy notice banner ─────────────────────────────────── */}
            <div className="privacy-notice">
                <ShieldCheck size={15} className="privacy-notice__icon" />
                <span>
                    Data pribadi peserta (email & telepon) disamarkan secara default.
                    Klik ikon <Eye size={12} style={{ display: "inline", verticalAlign: "middle" }} /> untuk melihat data lengkap.
                    Setiap akses dapat dicatat sebagai Audit Log.
                </span>
            </div>

            {/* ── Stats row ─────────────────────────────────────────────── */}
            <div className="participant-stats">
                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--blue">
                        <Users size={16} />
                    </div>
                    <div>
                        <p className="stat-card__label">Total Peserta</p>
                        <p className="stat-card__value">{total}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--green">
                        <UserCheck size={16} />
                    </div>
                    <div>
                        <p className="stat-card__label">Hadir</p>
                        <p className="stat-card__value">{checkedIn}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--yellow">
                        <Clock size={16} />
                    </div>
                    <div>
                        <p className="stat-card__label">Belum Hadir</p>
                        <p className="stat-card__value">{active}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--red">
                        <XCircle size={16} />
                    </div>
                    <div>
                        <p className="stat-card__label">Dibatalkan</p>
                        <p className="stat-card__value">{cancelled}</p>
                    </div>
                </div>
            </div>

            {/* ── Main card ─────────────────────────────────────────────── */}
            <div className="participant-card">
                {/* Toolbar */}
                <div className="participant-toolbar">
                    <div className="d-flex gap-2">
                        <div className="participant-search">
                            <Search size={16} className="participant-search__icon" />
                            <input
                                type="text"
                                placeholder="Cari peserta… (segera hadir)"
                                className="participant-search__input"
                                disabled
                            />
                        </div>
                        <Button variant="outline-secondary" size="sm" className="d-flex align-items-center gap-2">
                            <Filter size={15} /> Filter
                        </Button>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        <label className="show-all-toggle">
                            <div className={`toggle-track${showAll ? " toggle-track--on" : ""}`}
                                onClick={() => setShowAll((v) => !v)}>
                                <div className="toggle-thumb" />
                            </div>
                            <span className="toggle-label">Tampilkan semua data</span>
                        </label>
                    </div>
                </div>

                {/* Table area */}
                <div className="table-responsive">
                    {loading ? (
                        <div className="participant-empty">
                            <Spinner animation="border" variant="primary" style={{ width: 28, height: 28 }} />
                            <span className="ms-2 text-muted fs-sm">Memuat data…</span>
                        </div>
                    ) : participants.length === 0 ? (
                        <div className="participant-empty">
                            <Users size={36} strokeWidth={1.2} style={{ color: "var(--color-text-muted)" }} />
                            <p className="text-muted mt-2 fs-sm">Tidak ada peserta untuk ditampilkan.</p>
                        </div>
                    ) : (
                        <table className="participant-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 40 }}>#</th>
                                    <th>Peserta</th>
                                    <th>Institusi</th>
                                    <th>Email</th>
                                    <th>Telepon</th>
                                    <th className="text-center">Status</th>
                                    <th style={{ width: 48 }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.map((ticket, idx) => {
                                    const name =
                                        ticket.attendee_name ||
                                        ticket.participant?.name ||
                                        "Tidak diketahui";
                                    const email =
                                        ticket.attendee_email ||
                                        ticket.participant?.email ||
                                        null;
                                    const phone = ticket.participant?.phone || null;
                                    const university =
                                        ticket.participant?.university?.name || null;
                                    const status = getStatusConfig(ticket.status);
                                    const avatarColor = getAvatarColor(name);
                                    const isEmailRevealed = revealed[ticket.id]?.email;
                                    const isPhoneRevealed = revealed[ticket.id]?.phone;
                                    const rowNum = showAll
                                        ? idx + 1
                                        : (pageInfo.current_page - 1) * 15 + idx + 1;

                                    return (
                                        <tr key={ticket.id} className="participant-row">
                                            {/* No. */}
                                            <td>
                                                <span className="row-number">{rowNum}</span>
                                            </td>

                                            {/* Nama */}
                                            <td>
                                                <div className="participant-identity">
                                                    <div
                                                        className="participant-avatar"
                                                        style={{
                                                            background: avatarColor.bg,
                                                            color: avatarColor.text,
                                                        }}
                                                    >
                                                        {getInitials(name)}
                                                    </div>
                                                    <div>
                                                        <p className="participant-name">{name}</p>
                                                        <p className="participant-time">
                                                            Reg #{ticket.id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Institusi */}
                                            <td>
                                                {university ? (
                                                    <div className="institution-cell">
                                                        <School size={13} />
                                                        <span>{university}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted fs-xs">Umum / tidak terdata</span>
                                                )}
                                            </td>

                                            {/* Email — masked by default */}
                                            <td>
                                                <div className="masked-field">
                                                    <span className={`masked-value${!isEmailRevealed ? " masked-value--hidden" : ""}`}>
                                                        {isEmailRevealed ? (email || "-") : maskEmail(email)}
                                                    </span>
                                                    {email && (
                                                        <button
                                                            className="reveal-btn"
                                                            onClick={() => toggleReveal(ticket.id, "email")}
                                                            title={isEmailRevealed ? "Sembunyikan" : "Tampilkan email"}
                                                        >
                                                            {isEmailRevealed ? <EyeOff size={12} /> : <Eye size={12} />}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Telepon — masked by default */}
                                            <td>
                                                <div className="masked-field">
                                                    <span className={`masked-value${!isPhoneRevealed ? " masked-value--hidden" : ""}`}>
                                                        {isPhoneRevealed ? (phone || "-") : maskPhone(phone)}
                                                    </span>
                                                    {phone && (
                                                        <button
                                                            className="reveal-btn"
                                                            onClick={() => toggleReveal(ticket.id, "phone")}
                                                            title={isPhoneRevealed ? "Sembunyikan" : "Tampilkan nomor"}
                                                        >
                                                            {isPhoneRevealed ? <EyeOff size={12} /> : <Eye size={12} />}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="text-center">
                                                <span className={status.className}>
                                                    {status.icon}
                                                    {status.label}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td>
                                                <Dropdown align="end">
                                                    <Dropdown.Toggle
                                                        variant="link"
                                                        className="action-toggle"
                                                    >
                                                        <MoreVertical size={16} />
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu className="shadow-sm">
                                                        {phone && (
                                                            <Dropdown.Item
                                                                href={`https://wa.me/${(phone || "").replace(/\D/g, "")}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="d-flex align-items-center gap-2 fs-sm"
                                                            >
                                                                <MessageCircle size={14} className="text-success" />
                                                                Hubungi via WhatsApp
                                                            </Dropdown.Item>
                                                        )}
                                                        <Dropdown.Item className="d-flex align-items-center gap-2 fs-sm">
                                                            <UserCheck size={14} className="text-primary" />
                                                            Tandai Hadir Manual
                                                        </Dropdown.Item>
                                                        <Dropdown.Divider />
                                                        <Dropdown.Item className="d-flex align-items-center gap-2 fs-sm text-muted">
                                                            <Eye size={14} />
                                                            Lihat Detail Peserta
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {!loading && renderPagination()}
            </div>
        </div>
    );
};

export default EventParticipantListPage;