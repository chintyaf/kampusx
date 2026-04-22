import React from "react";
import { Container, Card, Button, Form } from "react-bootstrap";
import { Upload, FileText, Eye, EyeOff, Download, Trash2 } from "lucide-react";

const EventMaterialDistributionPage = () => {
    return (
        <Container className="">
            {/* Header */}
            <div className="mb-4">
                <h2 className="fw-bold mb-1">Distribusi Materi</h2>
                <p className="text-muted" style={{ fontSize: "1.1rem" }}>
                    Kelola materi, presentasi, dan dokumentasi
                </p>
            </div>

            {/* Upload Section */}
            <Card
                className="mb-4 rounded-3 shadow-sm border-0"
                style={{ border: "1px solid #eaeaea" }}
            >
                <Card.Body className="p-4">
                    <div className="d-flex align-items-center mb-4">
                        <Upload className="me-2" size={20} />
                        <h5 className="mb-0 fw-semibold">Unggah Materi Baru</h5>
                    </div>

                    <div
                        className="text-center p-5 rounded-3"
                        style={{
                            border: "2px dashed #d3d3d3",
                            backgroundColor: "#fefefe",
                        }}
                    >
                        <Upload size={36} className="text-secondary mb-3" />
                        <h5 className="fw-semibold">
                            Klik untuk mengunggah atau seret dan lepas
                        </h5>
                        <p className="text-muted mb-4">
                            File PDF, PPT, DOC, atau Video (Maks. 100MB)
                        </p>
                        <Button variant="dark" className="px-4 py-2 rounded-2">
                            Pilih File
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {/* Tab Navigasi Pilihan */}
            <div className="d-inline-flex bg-light rounded-pill p-1 mb-4">
                <Button
                    variant="light"
                    className="rounded-pill px-4 py-2 fw-semibold bg-white shadow-sm border-0"
                >
                    Materi Pra-Acara (2)
                </Button>
                <Button
                    variant="light"
                    className="rounded-pill px-4 py-2 text-muted border-0 bg-transparent fw-semibold"
                >
                    Materi Pasca-Acara (3)
                </Button>
            </div>

            {/* Pre-Event Materials List */}
            <Card
                className="mb-4 rounded-3 shadow-sm border-0"
                style={{ border: "1px solid #eaeaea" }}
            >
                <Card.Body className="p-4">
                    <h5 className="fw-semibold mb-2">Materi Pra-Acara</h5>
                    <p className="text-muted mb-4">
                        Materi yang tersedia sebelum acara dimulai (misal:
                        panduan, modul)
                    </p>

                    {/* List Item 1 */}
                    <Card className="mb-3 rounded-3 shadow-none border">
                        <Card.Body className="d-flex justify-content-between align-items-center p-3">
                            <div className="d-flex align-items-center">
                                <FileText
                                    size={22}
                                    className="text-primary me-3"
                                />
                                <div>
                                    <h6 className="mb-1 fw-semibold">
                                        Panduan Peserta ITCB 2026
                                    </h6>
                                    <small
                                        className="text-muted text-uppercase"
                                        style={{ fontSize: "0.8rem" }}
                                    >
                                        <span className="me-1">📅</span> 10 Mar
                                        2026, 10.00
                                    </small>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <span
                                    className="text-muted"
                                    style={{ fontSize: "0.9rem" }}
                                >
                                    Ditampilkan
                                </span>
                                <Form.Check
                                    type="switch"
                                    id="switch-visible-1"
                                    defaultChecked
                                    className="fs-5 m-0"
                                />
                                <Eye
                                    className="text-success"
                                    size={18}
                                    style={{ cursor: "pointer" }}
                                />
                                <Download
                                    className="text-dark"
                                    size={18}
                                    style={{ cursor: "pointer" }}
                                />
                                <Trash2
                                    className="text-danger"
                                    size={18}
                                    style={{ cursor: "pointer" }}
                                />
                            </div>
                        </Card.Body>
                    </Card>

                    {/* List Item 2 */}
                    <Card className="mb-0 rounded-3 shadow-none border">
                        <Card.Body className="d-flex justify-content-between align-items-center p-3">
                            <div className="d-flex align-items-center">
                                <FileText
                                    size={22}
                                    className="text-primary me-3"
                                />
                                <div>
                                    <h6 className="mb-1 fw-semibold">
                                        Modul Prasyarat - Logic 101
                                    </h6>
                                    <small
                                        className="text-muted text-uppercase"
                                        style={{ fontSize: "0.8rem" }}
                                    >
                                        <span className="me-1">📅</span> 12 Mar
                                        2026, 14.00
                                    </small>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <span
                                    className="text-muted"
                                    style={{ fontSize: "0.9rem" }}
                                >
                                    Ditampilkan
                                </span>
                                <Form.Check
                                    type="switch"
                                    id="switch-visible-2"
                                    defaultChecked
                                    className="fs-5 m-0"
                                />
                                <Eye
                                    className="text-success"
                                    size={18}
                                    style={{ cursor: "pointer" }}
                                />
                                <Download
                                    className="text-dark"
                                    size={18}
                                    style={{ cursor: "pointer" }}
                                />
                                <Trash2
                                    className="text-danger"
                                    size={18}
                                    style={{ cursor: "pointer" }}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Card.Body>
            </Card>

            {/* Visibility Settings Legend */}
            <Card
                className="rounded-3 shadow-sm border-0 mb-5"
                style={{ border: "1px solid #eaeaea" }}
            >
                <Card.Body className="p-4">
                    <h5 className="fw-semibold mb-4">Pengaturan Visibilitas</h5>

                    <div className="mb-3 d-flex align-items-start">
                        <Eye className="text-success me-3 mt-1" size={20} />
                        <div>
                            <span className="fw-bold me-1">Tampil:</span>
                            <span>
                                Materi dapat dilihat dan diunduh oleh peserta
                            </span>
                        </div>
                    </div>

                    <div className="mb-4 d-flex align-items-start">
                        <EyeOff
                            className="text-secondary me-3 mt-1"
                            size={20}
                        />
                        <div>
                            <span className="fw-bold me-1">Tersembunyi:</span>
                            <span>
                                Materi telah diunggah tetapi belum dapat diakses
                                oleh peserta
                            </span>
                        </div>
                    </div>

                    <p
                        className="text-muted mb-0"
                        style={{ fontSize: "0.95rem", lineHeight: "1.5" }}
                    >
                        Gunakan tombol sakelar (toggle) untuk mengatur kapan
                        materi tersedia bagi peserta. Fitur ini berguna jika
                        Anda ingin merilis materi secara bertahap atau setelah
                        sesi tertentu selesai.
                    </p>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default EventMaterialDistributionPage;
