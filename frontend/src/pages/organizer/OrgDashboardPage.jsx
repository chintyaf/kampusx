import React from "react";
import { Container, Card, Row, Col, Button } from "react-bootstrap";
import { NavLink } from "react-router-dom";

const OrgDashboardPage = () => {
    return (
        <Container>
            {/* Header Section */}
            <div className="mb-4">
                <h4 className="fw-bold mb-2">
                    🎉 Siap Jangkau Lebih Banyak Mahasiswa, Chintya?
                </h4>
                <p className="text-muted" style={{ fontSize: "1.05rem" }}>
                    Atur tiket, targetkan kampus yang tepat, dan kelola presensi
                    dalam satu langkah mudah.
                </p>
            </div>

            {/* Main Empty State Card */}
            <Card
                className="rounded-4 border shadow-sm"
                style={{ borderColor: "#e2e8f0" }}
            >
                <Card.Body className="p-4 p-md-5">
                    <Row className="g-4 align-items-stretch">
                        {/* Left Side: Media Placeholder */}
                        <Col md={6}>
                            <div
                                className="w-100 h-100 rounded-2"
                                style={{
                                    backgroundColor: "#d9d9d9",
                                    minHeight: "320px",
                                    border: "1px solid #767676",
                                }}
                            >
                                {/* Anda bisa mengganti div ini dengan elemen <video> atau <img> nantinya */}
                            </div>
                        </Col>

                        {/* Right Side: Steps & Action */}
                        <Col
                            md={6}
                            className="d-flex flex-column justify-content-center"
                        >
                            <h6
                                className="fw-bold mb-4"
                                style={{ fontSize: "1.1rem", color: "#212529" }}
                            >
                                Yuk mulai! Siapkan acara pertamamu di KampusX...
                            </h6>

                            <div className="steps-container mb-4">
                                {/* Step 1 - Active */}
                                <div className="d-flex mb-3 align-items-center">
                                    <div className="me-3">
                                        <div
                                            className="rounded-circle"
                                            style={{
                                                width: "22px",
                                                height: "22px",
                                                backgroundColor: "#d9d9d9",
                                            }}
                                        ></div>
                                    </div>
                                    <Card
                                        className="flex-grow-1 shadow-none rounded-3"
                                        style={{ border: "1px solid #ced4da" }}
                                    >
                                        <Card.Body className="p-3">
                                            <h6
                                                className="mb-1 fw-bold"
                                                style={{
                                                    color: "#343a40",
                                                    fontSize: "0.95rem",
                                                }}
                                            >
                                                1. Rancang Fondasi Acara
                                            </h6>
                                            <p
                                                className="mb-0 text-muted"
                                                style={{ fontSize: "0.85rem" }}
                                            >
                                                Buat kesan pertama yang kuat
                                                agar menarik minat peserta!
                                            </p>
                                        </Card.Body>
                                    </Card>
                                </div>

                                {/* Step 2 - Inactive */}
                                <div className="d-flex mb-3 align-items-center">
                                    <div className="me-3">
                                        <div
                                            className="rounded-circle"
                                            style={{
                                                width: "22px",
                                                height: "22px",
                                                backgroundColor: "#b0b0b0",
                                            }}
                                        ></div>
                                    </div>
                                    <Card
                                        className="flex-grow-1 shadow-none rounded-3"
                                        style={{ border: "1px solid #e9ecef" }}
                                    >
                                        <Card.Body className="p-3">
                                            <h6
                                                className="mb-1 fw-bold"
                                                style={{
                                                    color: "#adb5bd",
                                                    fontSize: "0.95rem",
                                                }}
                                            >
                                                2. Atur Tiket & Peserta
                                            </h6>
                                            <p
                                                className="mb-0"
                                                style={{
                                                    color: "#ced4da",
                                                    fontSize: "0.85rem",
                                                }}
                                            >
                                                Siapkan kategori tiket dan
                                                formulir pendaftaran peserta.
                                            </p>
                                        </Card.Body>
                                    </Card>
                                </div>

                                {/* Step 3 - Inactive */}
                                <div className="d-flex align-items-center">
                                    <div className="me-3">
                                        <div
                                            className="rounded-circle"
                                            style={{
                                                width: "22px",
                                                height: "22px",
                                                backgroundColor: "#b0b0b0",
                                            }}
                                        ></div>
                                    </div>
                                    <Card
                                        className="flex-grow-1 shadow-none rounded-3"
                                        style={{ border: "1px solid #e9ecef" }}
                                    >
                                        <Card.Body className="p-3">
                                            <h6
                                                className="mb-1 fw-bold"
                                                style={{
                                                    color: "#adb5bd",
                                                    fontSize: "0.95rem",
                                                }}
                                            >
                                                3. Review & Publikasikan
                                            </h6>
                                            <p
                                                className="mb-0"
                                                style={{
                                                    color: "#ced4da",
                                                    fontSize: "0.85rem",
                                                }}
                                            >
                                                Cek kembali semua detail, lalu
                                                luncurkan acara kamu!
                                            </p>
                                        </Card.Body>
                                    </Card>
                                </div>
                            </div>

                            {/* Call to Action Button */}
                            <div>
                                <NavLink
                                    to="/organizer/buat-acara"
                                    className="text-decoration-none"
                                >
                                    <Button variant="primary">
                                        Buat Event +
                                    </Button>
                                </NavLink>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default OrgDashboardPage;
