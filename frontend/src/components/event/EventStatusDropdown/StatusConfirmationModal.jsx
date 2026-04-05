import React from "react";
import { Modal, Button } from "react-bootstrap";
import { Globe, X, Archive, SquarePen } from "lucide-react";
import PublishForm from "./PublishForm";

// ─── Config (Draft & Archived) ─────────────────────────────────────────────────

const SIMPLE_CONFIG = {
    Draft: {
        icon: SquarePen,
        iconColor: "#64748b",
        iconBg: "#f1f5f9",
        iconBorder: "#cbd5e1",
        btnVariant: "secondary",
        title: "Kembali ke Draft",
        desc: "Event akan disembunyikan dari publik dan kembali ke status Draft.",
    },
    Archived: {
        icon: Archive,
        iconColor: "#92400e",
        iconBg: "#fffbeb",
        iconBorder: "#fde68a",
        btnVariant: "warning",
        title: "Arsipkan Event",
        desc: "Event akan disembunyikan dari publik dan dipindahkan ke arsip.",
    },
};

// ─── StatusConfirmationModal ───────────────────────────────────────────────────

const StatusConfirmationModal = ({
    show,
    onHide,
    pendingStatus,
    onConfirm,
    validationErrors = [],
}) => {
    if (!pendingStatus) return null;

    // ── Published — delegasikan seluruh konten ke PublishForm ───────────────
    if (pendingStatus === "Published") {
        return (
            <Modal
                show={show}
                onHide={onHide}
                centered
                contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
            >
                <Modal.Header
                    className="d-flex border border-bottom align-items-start justify-content-between gap-3 border-0 px-4 py-3"
                    style={{
                        // background:
                        //     "linear-gradient(135deg, #07304a 0%, #00699e 100%)",
                    }}
                >
                    <div className="d-flex align-items-center gap-2">
                        <div
                            className="d-flex align-items-center justify-content-center rounded flex-shrink-0 bg-opacity-10"
                            style={{ width: 36, height: 36 }}
                        >
                            <Globe size={18} color="#000" strokeWidth={2} />
                        </div>
                        <div>
                            <div
                                className="fw-bold m-0"
                                style={{
                                    fontSize: 15,
                                    letterSpacing: "-0.3px",
                                }}
                            >
                                Publish Event
                            </div>
                            <div
                                className="text-secondary text-opacity-75"
                                style={{ fontSize: 11, letterSpacing: "0.3px" }}
                            >
                                Pastikan semua data sudah benar
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onHide}
                        className="btn btn-sm d-flex align-items-center justify-content-center rounded border border-white border-opacity-25 bg-white bg-opacity-10 flex-shrink-0"
                        style={{ width: 32, height: 32 }}
                    >
                        <X size={15} />
                    </button>
                </Modal.Header>

                {/* PublishForm mengisi body + footer sekaligus */}
                <Modal.Body
                    className="p-4"
                    // style={{ backgroundColor: "#f8fafc" }}
                >
                    <PublishForm
                        show={show}
                        validationErrors={validationErrors}
                        onCancel={onHide}
                        onConfirm={onConfirm}
                    />
                </Modal.Body>
            </Modal>
        );
    }

    // ── Draft / Archived — simple modal ─────────────────────────────────────
    const cfg = SIMPLE_CONFIG[pendingStatus];
    if (!cfg) return null;

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
        >
            <Modal.Body className="text-center p-5 pb-4">
                <div
                    className="d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        border: `1.5px solid ${cfg.iconBorder}`,
                        backgroundColor: cfg.iconBg,
                    }}
                >
                    <cfg.icon size={22} color={cfg.iconColor} strokeWidth={2} />
                </div>
                <h5 className="fw-bold text-dark mb-2" style={{ fontSize: 15 }}>
                    {cfg.title}
                </h5>
                <p className="text-secondary m-0" style={{ fontSize: 13 }}>
                    {cfg.desc}
                </p>
            </Modal.Body>

            <Modal.Footer className="border-0 justify-content-center gap-2 pb-4">
                <Button
                    variant="light"
                    className="border px-4"
                    style={{ borderRadius: 9, fontSize: 13 }}
                    onClick={onHide}
                >
                    Batal
                </Button>
                <Button
                    variant={cfg.btnVariant}
                    className="px-4 fw-semibold"
                    style={{ borderRadius: 9, fontSize: 13 }}
                    onClick={onConfirm}
                >
                    Konfirmasi
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default StatusConfirmationModal;
