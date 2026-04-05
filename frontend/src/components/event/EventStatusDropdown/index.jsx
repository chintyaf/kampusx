import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { SquarePen, Rocket, Archive, ChevronDown, Check } from "lucide-react";
import StatusConfirmationModal from "./StatusConfirmationModal";

// ─── Config ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    Draft: {
        icon: SquarePen,
        label: "Draft",
        desc: "Belum dipublish",
        color: "#64748b",
        bg: "#f1f5f9",
        border: "#cbd5e1",
        dot: "#94a3b8",
    },
    Published: {
        icon: Rocket,
        label: "Published",
        desc: "Terlihat oleh publik",
        color: "#00699e",
        bg: "#f0f9ff",
        border: "#7bd6fe",
        dot: "#0aabed",
    },
    Archived: {
        icon: Archive,
        label: "Archived",
        desc: "Disembunyikan dari publik",
        color: "#92400e",
        bg: "#fffbeb",
        border: "#fde68a",
        dot: "#d97706",
    },
};

const ALL_STATUSES = ["Draft", "Published", "Archived"];

const DUMMY_VALIDATION_ERRORS = [
    "Deskripsi event belum diisi",
    "Tanggal & waktu event belum dipilih",
    "Sesi Keynote Opening belum memiliki speaker",
];

// ─── Custom Toggle (Mencegah style bawaan tombol & panah default) ────────────
const CustomToggle = React.forwardRef(({ children, onClick, style }, ref) => (
    <div
        ref={ref}
        onClick={(e) => {
            e.preventDefault();
            onClick(e);
        }}
        className="d-inline-flex align-items-center gap-2 rounded-3 shadow-sm fw-semibold"
        style={{
            cursor: "pointer",
            userSelect: "none",
            padding: "7px 12px 7px 10px",
            fontSize: 13,
            border: "1.5px solid",
            transition: "all 0.15s ease",
            ...style,
        }}
    >
        {children}
    </div>
));

// ─── EventStatusDropdown ───────────────────────────────────────────────────────

const EventStatusDropdown = ({ eventId, isInsideEvent }) => {
    const [status, setStatus] = useState("Draft");
    const [showModal, setShowModal] = useState(false);
    const [pendingStatus, setPending] = useState("");

    if (!isInsideEvent) return null;

    const current = STATUS_CONFIG[status];

    const handleSelectStatus = (newStatus) => {
        if (newStatus === status) return;
        setPending(newStatus);
        setShowModal(true);
    };

    const handleConfirm = () => {
        setStatus(pendingStatus);
        setShowModal(false);
    };

    const handleClose = () => setShowModal(false);

    return (
        <>
            {/* ── Dropdown ──
                Tambahkan drop="down" agar menu dipaksa selalu terbuka ke bawah,
                menyelesaikan isu menu pop-up berada di atas.
            */}
            <Dropdown drop="down">
                <Dropdown.Toggle
                    as={CustomToggle}
                    style={{
                        boxShadow: "none",
                        backgroundColor: current.bg,
                        borderColor: current.border,
                        color: current.color,
                    }}
                >
                    <span
                        className="rounded-circle flex-shrink-0"
                        style={{
                            width: 7,
                            height: 7,
                            backgroundColor: current.dot,
                            boxShadow: `0 0 0 2px rgba(255,255,255,0.9), 0 0 0 3.5px ${current.dot}`,
                        }}
                    />
                    <current.icon size={13} strokeWidth={2.2} />
                    {current.label}
                    <ChevronDown size={13} className="opacity-50 ms-1" />
                </Dropdown.Toggle>

                <Dropdown.Menu
                    className="p-0 border-0 mt-2"
                    style={{ borderRadius: 12, shadowColor: "none" }}
                >
                    <div
                        className="border pop-down"
                        style={{ borderRadius: 12, overflow: "hidden" }}
                    >
                        <div
                            className="px-3 py-2 text-uppercase fw-bold text-secondary border-bottom bg-light"
                            style={{ fontSize: 10, letterSpacing: "0.7px" }}
                        >
                            Ubah Status
                        </div>

                        {ALL_STATUSES.map((s) => {
                            const cfg = STATUS_CONFIG[s];
                            const isActive = s === status;

                            return (
                                <Dropdown.Item
                                    key={s}
                                    onClick={() => handleSelectStatus(s)}
                                    className="d-flex align-items-center gap-2 px-3 py-2 border-bottom"
                                    style={{
                                        backgroundColor: isActive
                                            ? "#f0f9ff"
                                            : "transparent",
                                        transition: "background 0.12s ease",
                                    }}
                                >
                                    <div
                                        className="d-flex align-items-center justify-content-center flex-shrink-0 rounded"
                                        style={{
                                            width: 32,
                                            height: 32,
                                            border: `1.5px solid ${cfg.border}`,
                                            backgroundColor: cfg.bg,
                                        }}
                                    >
                                        <cfg.icon
                                            size={15}
                                            color={cfg.color}
                                            strokeWidth={2}
                                        />
                                    </div>
                                    <div className="flex-grow-1 ms-1">
                                        <div
                                            className="fw-semibold text-dark"
                                            style={{
                                                fontSize: 13,
                                                lineHeight: 1.2,
                                            }}
                                        >
                                            {cfg.label}
                                        </div>
                                        <div
                                            className="text-secondary mt-1"
                                            style={{ fontSize: 11 }}
                                        >
                                            {cfg.desc}
                                        </div>
                                    </div>
                                    {isActive && (
                                        <Check
                                            size={14}
                                            color="#0089cb"
                                            strokeWidth={2.5}
                                            className="flex-shrink-0 ms-2"
                                        />
                                    )}
                                </Dropdown.Item>
                            );
                        })}
                    </div>
                </Dropdown.Menu>
            </Dropdown>

            {/* ── Modal ──────────────────────────────────────────────── */}
            <StatusConfirmationModal
                eventId={eventId}
                show={showModal}
                onHide={handleClose}
                pendingStatus={pendingStatus}
                onConfirm={handleConfirm}
                validationErrors={
                    pendingStatus === "Published" ? DUMMY_VALIDATION_ERRORS : []
                }
            />
        </>
    );
};

export default EventStatusDropdown;
