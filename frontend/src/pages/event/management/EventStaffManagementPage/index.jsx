import React, { useState } from "react";
import { Button, Table, Card, Row, Col } from "react-bootstrap";
import {
    UserPlus,
    ShieldCheck,
    Trash2,
    Users,
    Clock,
    Mail,
    CheckCircle2,
} from "lucide-react";
import EventLayout from "../../../../layouts/EventLayout";
import FormHeading from "../../../../components/dashboard/FormHeading";

/* ── Avatar ─────────────────────────────────────────────────── */
const AVATAR_PALETTE = [
    { bg: "var(--bahama-blue-100)", color: "var(--bahama-blue-800)" },
    { bg: "var(--bahama-blue-200)", color: "var(--bahama-blue-950)" },
    { bg: "var(--bahama-blue-50)", color: "var(--bahama-blue-700)" },
];

const Avatar = ({ name }) => {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    const { bg, color } =
        AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];
    return (
        <div
            style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: bg,
                color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "var(--font-xs)",
                flexShrink: 0,
                border: "2px solid var(--color-white)",
                boxShadow: "0 0 0 2px var(--bahama-blue-200)",
            }}
        >
            {initials}
        </div>
    );
};

/* ── Stat Card ───────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, accent }) => (
    <Card
        className="border-0 h-100"
        style={{
            borderRadius: 16,
            background: "var(--color-white)",
            boxShadow: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
            overflow: "hidden",
        }}
    >
        <div
            style={{
                height: 4,
                width: "100%",
                background: accent,
                borderRadius: "16px 16px 0 0",
            }}
        />
        <Card.Body className="d-flex align-items-center gap-3 px-4 py-3">
            <div
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: "var(--bahama-blue-50)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <Icon size={22} style={{ color: "var(--color-primary)" }} />
            </div>
            <div>
                <div
                    style={{
                        fontSize: "var(--font-xs)",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        color: "var(--color-text-muted)",
                        marginBottom: 2,
                    }}
                >
                    {label}
                </div>
                <div
                    style={{
                        fontSize: "var(--font-xl)",
                        fontWeight: 700,
                        color: "var(--color-text)",
                        lineHeight: 1.1,
                    }}
                >
                    {value}
                </div>
            </div>
        </Card.Body>
    </Card>
);

/* ── Role Badge ──────────────────────────────────────────────── */
const ROLE_STYLE = {
    Koordinator: { bg: "var(--bahama-blue-700)", color: "#fff" },
    Administrasi: {
        bg: "var(--bahama-blue-100)",
        color: "var(--bahama-blue-800)",
    },
    Dokumentasi: {
        bg: "var(--bahama-blue-50)",
        color: "var(--bahama-blue-700)",
    },
    Keamanan: { bg: "var(--bahama-blue-950)", color: "#fff" },
};

const RoleBadge = ({ role }) => {
    const s = ROLE_STYLE[role] ?? {
        bg: "var(--bahama-blue-100)",
        color: "var(--bahama-blue-900)",
    };
    return (
        <span
            style={{
                backgroundColor: s.bg,
                color: s.color,
                fontSize: "var(--font-xs)",
                padding: "5px 12px",
                borderRadius: 8,
                fontWeight: 600,
                display: "inline-block",
            }}
        >
            {role}
        </span>
    );
};

/* ── Status Badge ────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
    const isActive = status === "Aktif";
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: "var(--font-xs)",
                padding: "5px 12px",
                borderRadius: 8,
                fontWeight: 600,
                backgroundColor: isActive ? "#ecfdf5" : "#fefce8",
                color: isActive ? "#065f46" : "#854d0e",
                border: `1px solid ${isActive ? "#a7f3d0" : "#fde68a"}`,
            }}
        >
            <span
                style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: isActive ? "#10b981" : "#f59e0b",
                    flexShrink: 0,
                }}
            />
            {status}
        </span>
    );
};

/* ── Main ────────────────────────────────────────────────────── */
const EventStaffManagementPage = () => {
    const [staffList, setStaffList] = useState([
        {
            id: 1,
            name: "Reverie Vale",
            email: "reverie@univ.ac.id",
            role: "Koordinator",
            status: "Aktif",
        },
        {
            id: 2,
            name: "Galen Gale",
            email: "galen@univ.ac.id",
            role: "Administrasi",
            status: "Pending",
        },
        {
            id: 3,
            name: "Sinta Dewi",
            email: "sinta@univ.ac.id",
            role: "Dokumentasi",
            status: "Aktif",
        },
    ]);

    const pendingCount = staffList.filter((s) => s.status === "Pending").length;
    const activeCount = staffList.filter((s) => s.status === "Aktif").length;

    const handleDelete = (id) =>
        setStaffList((prev) => prev.filter((s) => s.id !== id));

    return (
        <EventLayout>
            {/* ── Header ── */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <FormHeading
                    heading="Manajemen Staf Administrasi"
                    subheading="Kelola akses dan peran tim panitia Anda di sini."
                />
                <Button
                    className="d-flex align-items-center gap-2 flex-shrink-0 border-0"
                    style={{
                        borderRadius: 12,
                        padding: "10px 20px",
                        backgroundColor: "var(--color-primary)",
                        fontSize: "var(--font-sm)",
                        fontWeight: 600,
                        boxShadow: "0 4px 14px rgba(0,105,158,.35)",
                    }}
                >
                    <UserPlus size={16} />
                    <span className="d-none d-sm-inline">Tambah Staff</span>
                </Button>
            </div>

            {/* ── Stat Cards ── */}
            <Row className="g-3 mb-4">
                <Col xs={12} sm={4}>
                    <StatCard
                        icon={Users}
                        label="Total Staf"
                        value={`${staffList.length} Orang`}
                        accent="linear-gradient(90deg, var(--bahama-blue-500), var(--bahama-blue-300))"
                    />
                </Col>
                <Col xs={12} sm={4}>
                    <StatCard
                        icon={CheckCircle2}
                        label="Staf Aktif"
                        value={`${activeCount} Orang`}
                        accent="linear-gradient(90deg, #10b981, #6ee7b7)"
                    />
                </Col>
                <Col xs={12} sm={4}>
                    <StatCard
                        icon={Clock}
                        label="Undangan Pending"
                        value={`${pendingCount} Orang`}
                        accent="linear-gradient(90deg, #f59e0b, #fcd34d)"
                    />
                </Col>
            </Row>

            {/* ── Table Card ── */}
            <Card
                className="border-0"
                style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow:
                        "0 1px 3px rgba(0,0,0,.07), 0 1px 2px rgba(0,0,0,.05)",
                }}
            >
                {/* Card Header */}
                <Card.Header
                    className="d-flex align-items-center justify-content-between py-3 px-4 border-0"
                    style={{ backgroundColor: "var(--color-white)" }}
                >
                    <div>
                        <span
                            style={{
                                fontWeight: 700,
                                fontSize: "var(--font-md)",
                                color: "var(--color-text)",
                            }}
                        >
                            Daftar Staf
                        </span>
                        <span
                            style={{
                                marginLeft: 10,
                                fontSize: "var(--font-xs)",
                                color: "var(--color-text-muted)",
                            }}
                        >
                            {staffList.length} anggota terdaftar
                        </span>
                    </div>
                    <span
                        style={{
                            backgroundColor: "var(--bahama-blue-50)",
                            color: "var(--bahama-blue-700)",
                            fontSize: "var(--font-xs)",
                            fontWeight: 600,
                            padding: "4px 12px",
                            borderRadius: 20,
                            border: "1px solid var(--bahama-blue-200)",
                        }}
                    >
                        {staffList.length} total
                    </span>
                </Card.Header>

                {/* Divider */}
                <div
                    style={{
                        height: 1,
                        backgroundColor: "var(--color-border)",
                    }}
                />

                {/* Table */}
                <Card.Body
                    className="p-0"
                    style={{ backgroundColor: "var(--color-white)" }}
                >
                    <Table
                        responsive
                        className="mb-0 align-middle"
                        style={{
                            "--bs-table-hover-bg": "var(--bahama-blue-50)",
                        }}
                    >
                        <thead>
                            <tr
                                style={{ backgroundColor: "var(--color-bg-2)" }}
                            >
                                {[
                                    { label: "Nama Staff", cls: "px-4" },
                                    { label: "Email" },
                                    { label: "Role" },
                                    { label: "Status" },
                                    { label: "Aksi", center: true, w: 110 },
                                ].map(({ label, cls = "", center, w }) => (
                                    <th
                                        key={label}
                                        className={`py-3 border-0 ${cls} ${center ? "text-center" : ""}`}
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: "var(--color-text-muted)",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.07em",
                                            ...(w ? { width: w } : {}),
                                        }}
                                    >
                                        {label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {staffList.map((staff, idx) => (
                                <tr
                                    key={staff.id}
                                    style={{
                                        borderTop:
                                            idx === 0
                                                ? "none"
                                                : "1px solid var(--color-border)",
                                        transition: "background .15s",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                            "var(--bahama-blue-50)")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                            "transparent")
                                    }
                                >
                                    {/* Nama */}
                                    <td className="px-4 py-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <Avatar name={staff.name} />
                                            <div>
                                                <div
                                                    style={{
                                                        fontWeight: 700,
                                                        fontSize:
                                                            "var(--font-sm)",
                                                        color: "var(--color-text)",
                                                    }}
                                                >
                                                    {staff.name}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        color: "var(--color-text-muted)",
                                                    }}
                                                >
                                                    {staff.role}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Email */}
                                    <td className="py-3">
                                        <div
                                            className="d-flex align-items-center gap-2"
                                            style={{
                                                fontSize: "var(--font-sm)",
                                                color: "var(--color-text-muted)",
                                            }}
                                        >
                                            <Mail
                                                size={13}
                                                style={{
                                                    flexShrink: 0,
                                                    color: "var(--bahama-blue-400)",
                                                }}
                                            />
                                            {staff.email}
                                        </div>
                                    </td>

                                    {/* Role */}
                                    <td className="py-3">
                                        <RoleBadge role={staff.role} />
                                    </td>

                                    {/* Status */}
                                    <td className="py-3">
                                        <StatusBadge status={staff.status} />
                                    </td>

                                    {/* Aksi */}
                                    <td className="py-3 text-center">
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="d-inline-flex align-items-center gap-1"
                                            style={{
                                                borderRadius: 8,
                                                fontSize: "var(--font-xs)",
                                                fontWeight: 500,
                                                padding: "5px 12px",
                                            }}
                                            onClick={() =>
                                                handleDelete(staff.id)
                                            }
                                        >
                                            <Trash2 size={13} />
                                            <span className="d-none d-md-inline">
                                                Hapus
                                            </span>
                                        </Button>
                                    </td>
                                </tr>
                            ))}

                            {/* Empty state */}
                            {staffList.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="text-center py-5"
                                    >
                                        <div
                                            style={{
                                                width: 56,
                                                height: 56,
                                                borderRadius: "50%",
                                                backgroundColor:
                                                    "var(--bahama-blue-50)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                margin: "0 auto 12px",
                                            }}
                                        >
                                            <Users
                                                size={26}
                                                style={{
                                                    color: "var(--bahama-blue-300)",
                                                }}
                                            />
                                        </div>
                                        <div
                                            style={{
                                                fontWeight: 600,
                                                color: "var(--color-text)",
                                                marginBottom: 4,
                                            }}
                                        >
                                            Belum ada staf
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "var(--font-sm)",
                                                color: "var(--color-text-muted)",
                                            }}
                                        >
                                            Tambahkan staf pertama untuk
                                            memulai.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* ── Security Note ── */}
            <div
                className="mt-4 d-flex gap-3 align-items-start p-3"
                style={{
                    borderRadius: 12,
                    fontSize: "var(--font-xs)",
                    backgroundColor: "var(--bahama-blue-50)",
                    border: "1px solid var(--bahama-blue-200)",
                    color: "var(--bahama-blue-900)",
                }}
            >
                <div
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        flexShrink: 0,
                        backgroundColor: "var(--bahama-blue-100)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <ShieldCheck
                        size={16}
                        style={{ color: "var(--color-primary)" }}
                    />
                </div>
                <div style={{ paddingTop: 6, lineHeight: 1.6 }}>
                    <strong>Catatan Keamanan:</strong> Staf yang baru
                    ditambahkan akan menerima email instruksi aktivasi akun.
                    Pastikan role yang diberikan sesuai dengan tanggung
                    jawabnya.
                </div>
            </div>
        </EventLayout>
    );
};

export default EventStaffManagementPage;
