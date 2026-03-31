import React, { useState } from "react";
// Asumsi library icon yang kamu pakai adalah Lucide
import { SquarePen, ChevronDown, Rocket, Archive } from "lucide-react";

const EventStatusDropdown = ({ isInsideEvent }) => {
    const [status, setStatus] = useState("Draft");

    // State untuk Confirmation Box (Modal)
    const [showModal, setShowModal] = useState(false);
    const [pendingStatus, setPendingStatus] = useState("");
    const [slug, setSlug] = useState("");

    // Map configuration for each status
    const statusConfigs = {
        Draft: {
            label: "Draft",
            icon: <SquarePen size={18} color="#A6784D" />,
            color: "#A6784D", // Brownish
            bg: "#FFF9F2",
        },
        Published: {
            label: "Published",
            icon: <Rocket size={18} color="#10b981" />,
            color: "#10b981", // Emerald Green
            bg: "#ecfdf5",
        },
        Archived: {
            label: "Archived",
            icon: <Archive size={18} color="#ef4444" />,
            color: "#ef4444", // Red
            bg: "#fef2f2",
        },
    };

    const current = statusConfigs[status];

    if (!isInsideEvent) return null;

    // Fungsi untuk membuka modal dan menyimpan status yang dipilih sementara
    const handleSelectStatus = (newStatus) => {
        setPendingStatus(newStatus);
        setShowModal(true);
    };

    // Fungsi untuk mengeksekusi perubahan status setelah konfirmasi
    const handleConfirm = () => {
        // Jika publish, kamu bisa menambahkan validasi API/Slug disini
        if (pendingStatus === "Published" && slug.trim() === "") {
            alert("Slug tidak boleh kosong!");
            return;
        }

        setStatus(pendingStatus);
        setShowModal(false);
        // Reset state jika perlu, atau kirim data ke backend di sini
    };

    return (
        <>
            {/* Status Event Dropdown */}
            <div className="dropdown position-relative">
                <div
                    className="event-status d-flex gap-2 align-items-center p-2 rounded-3 border"
                    style={{
                        cursor: "pointer",
                        backgroundColor: current.bg,
                        borderColor: current.color,
                        color: current.color,
                    }}
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    {current.icon}
                    <p
                        className="fw-semibold mb-0 fs-sm"
                        style={{ color: current.color }}
                    >
                        {status}
                    </p>
                    <ChevronDown className="ms-1" size={16} />
                </div>

                {/* Menu Dropdown */}
                <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2 pop-down">
                    <li>
                        <h6 className="dropdown-header text-uppercase fs-xs fw-semibold opacity-50 mb-1">
                            Change Status
                        </h6>
                    </li>

                    <li>
                        <button
                            className="dropdown-item d-flex align-items-center gap-2 py-2 text-warning"
                            onClick={() => handleSelectStatus("Draft")}
                        >
                            <SquarePen size={16} /> Draft
                        </button>
                    </li>
                    <li>
                        <button
                            className="dropdown-item d-flex align-items-center gap-2 py-2 text-success"
                            onClick={() => handleSelectStatus("Published")}
                        >
                            <Rocket size={16} /> Publish
                        </button>
                    </li>
                    <li>
                        <button
                            className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                            onClick={() => handleSelectStatus("Archived")}
                        >
                            <Archive size={16} /> Archive
                        </button>
                    </li>
                </ul>
            </div>

            {/* Custom Confirmation Modal */}
            {showModal && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }} // Overlay effect
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">
                                    {pendingStatus === "Published"
                                        ? "Publish Event"
                                        : "Konfirmasi Perubahan Status"}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>

                            <div className="modal-body py-4">
                                {pendingStatus === "Published" ? (
                                    <>
                                        {/* Warning Box */}
                                        <div
                                            className="alert alert-warning d-flex gap-2 mb-3"
                                            role="alert"
                                        >
                                            <span>⚠️</span>
                                            <div>
                                                <strong>
                                                    Pengecekan Terakhir:
                                                </strong>{" "}
                                                <br />
                                                Pastikan tidak ada informasi
                                                krusial yang terlewat sebelum
                                                mempublikasikan event ini ke
                                                publik.
                                            </div>
                                        </div>

                                        {/* Slug Form */}
                                        <div className="form-group">
                                            <label className="form-label fw-semibold">
                                                Event Slug / URL
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light text-muted">
                                                    domain.com/event/
                                                </span>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="masukkan-slug-disini"
                                                    value={slug}
                                                    onChange={(e) =>
                                                        setSlug(
                                                            e.target.value
                                                                .toLowerCase()
                                                                .replace(
                                                                    /\s+/g,
                                                                    "-",
                                                                ),
                                                        )
                                                    }
                                                />
                                            </div>
                                            <small className="text-muted mt-1 d-block">
                                                Slug ini akan menjadi link
                                                permanen untuk event Anda.
                                            </small>
                                        </div>
                                    </>
                                ) : (
                                    <p className="mb-0 fs-5 text-center">
                                        Apakah Anda yakin ingin mengubah status
                                        event ini menjadi{" "}
                                        <strong>{pendingStatus}</strong>?
                                    </p>
                                )}
                            </div>

                            <div className="modal-footer border-0 pt-0">
                                <button
                                    type="button"
                                    className="btn btn-light border"
                                    onClick={() => setShowModal(false)}
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${pendingStatus === "Published" ? "btn-success" : pendingStatus === "Archived" ? "btn-danger" : "btn-warning"}`}
                                    onClick={handleConfirm}
                                >
                                    {pendingStatus === "Published"
                                        ? "Ya, Publish Sekarang"
                                        : "Konfirmasi"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EventStatusDropdown;
