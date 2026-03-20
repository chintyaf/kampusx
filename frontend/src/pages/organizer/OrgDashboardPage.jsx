import React, { useState, useEffect } from "react";
import { Container, Card, Row, Col, Button, Spinner } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import api from "../../api/axios";

const NoEvent = () => {
    return (
        <>
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
        </>
    );
};

const OrgDashboardPage = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            // 1. Cek apakah data sudah ada di session storage
            const cachedEvents = sessionStorage.getItem("organizer_events");

            if (cachedEvents) {
                // 2. Kalau ada, ubah kembali dari string ke array (JSON.parse)
                // lalu langsung set ke state TANPA memanggil API Axios
                setEvents(JSON.parse(cachedEvents));
                setIsLoading(false);
                return; // Stop fungsi di sini agar ke bawahnya tidak dieksekusi
            }

            // 3. Kalau tidak ada di session (baru pertama kali buka tab), tembak API
            try {
                const response = await api.get("/organizer/events-list");
                setEvents(response.data);

                // 4. Simpan data dari Laravel ke session storage
                // Harus diubah jadi string dulu pakai JSON.stringify
                sessionStorage.setItem(
                    "organizer_events",
                    JSON.stringify(response.data),
                );
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <Container className="py-5">
            {/* 3. Conditional Rendering Logic */}
            {isLoading ? (
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">Memuat data acara...</p>
                </div>
            ) : events.length === 0 ? (
                // If there are no events, call your awesome empty state component!
                <NoEvent />
            ) : (
                // If there are events, map through them and show them here
                <div>
                    <h4 className="fw-bold mb-4">Acara Kamu</h4>
                    <Row>
                        {events.map((event) => (
                            <Col md={4} key={event.id} className="mb-4">
                                {/* NavLink menggunakan slug dan kita hilangkan garis bawah link-nya */}
                                <NavLink
                                    to={`/organizer/event-dashboard/${event.slug}`}
                                    className="text-decoration-none text-dark"
                                >
                                    <Card
                                        className="h-100 shadow-sm"
                                        style={{ transition: "transform 0.2s" }}
                                    >
                                        <Card.Body>
                                            <Card.Title className="fw-bold">
                                                {event.title}
                                            </Card.Title>
                                            <Card.Text className="text-muted text-truncate">
                                                {event.description}
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </NavLink>
                            </Col>
                        ))}
                    </Row>
                </div>
            )}
        </Container>
    );
};

export default OrgDashboardPage;
