import React, { useState, useEffect } from "react";
import {
    Container,
    Card,
    Row,
    Col,
    Button,
    Spinner,
    Form,
    InputGroup,
    Badge,
} from "react-bootstrap";
import { NavLink } from "react-router-dom";
import {
    Plus,
    Search,
    Calendar,
    MapPin,
    Users,
    Edit,
    Trash2,
} from "lucide-react";
import api from "../../api/axios";

// Komponen NoEvent (Tetap sama seperti yang Anda buat)
const NoEvent = () => {
    return (
        <>
            <div className="mb-4">
                <h4 className="fw-bold mb-2">
                    🎉 Siap Jangkau Lebih Banyak Mahasiswa, Chintya?
                </h4>
                <p className="text-muted" style={{ fontSize: "1.05rem" }}>
                    Atur tiket, targetkan kampus yang tepat, dan kelola presensi
                    dalam satu langkah mudah.
                </p>
            </div>

            <Card
                className="rounded-4 border shadow-sm"
                style={{ borderColor: "#e2e8f0" }}
            >
                <Card.Body className="p-4 p-md-5">
                    <Row className="g-4 align-items-stretch">
                        <Col md={6}>
                            <div
                                className="w-100 h-100 rounded-2"
                                style={{
                                    backgroundColor: "#d9d9d9",
                                    minHeight: "320px",
                                    border: "1px solid #767676",
                                }}
                            ></div>
                        </Col>

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
                            {/* ... (Kode step-step Anda sebelumnya) ... */}
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
            try {
                const response = await api.get("/organizer/events-list");
                const result = response.data;

                if (result.status === "success" && Array.isArray(result.data)) {
                    setEvents(result.data);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Error fetching events:", error);
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    return (
        <div className="py-2 container">
            {/* Header Section Selalu Muncul */}
            <div className="mb-4">
                <h4 className="fw-bold mb-2">
                    🎉 Siap Jangkau Lebih Banyak Mahasiswa, Chintya?
                </h4>
                <p className="text-muted" style={{ fontSize: "1.05rem" }}>
                    Atur tiket, targetkan kampus yang tepat, dan kelola presensi
                    dalam satu langkah mudah.
                </p>
            </div>

            {isLoading ? (
                <div className="text-center mt-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">Memuat data acara...</p>
                </div>
            ) : events.length === 0 ? (
                <NoEvent />
            ) : (
                /* Main Container My Events */
                <Card
                    className="rounded-4 border"
                    style={{ borderColor: "#e2e8f0" }}
                >
                    <Card.Body className="p-4 p-md-5">
                        {/* Title & Create Button */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h3
                                    className="fw-bold mb-1"
                                    style={{ color: "#111827" }}
                                >
                                    My Events
                                </h3>
                                <p className="text-muted mb-0">
                                    Manage and organize your events
                                </p>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <InputGroup
                            className="mb-4"
                            style={{ maxWidth: "450px" }}
                        >
                            <InputGroup.Text className="bg-white border-end-0 text-muted ps-3">
                                <Search size={18} />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Search events, speakers, attendees..."
                                className="border-start-0 ps-0 bg-white"
                                style={{
                                    boxShadow: "none",
                                    backgroundColor: "#f9fafb",
                                }}
                            />
                        </InputGroup>

                        {/* Event Cards Grid */}
                        <Row className="g-4">
                            {events.map((event) => (
                                <Col lg={4} md={6} key={event.id}>
                                    <Card
                                        className="h-100 rounded-4 shadow-none"
                                        style={{ border: "1px solid #e5e7eb" }}
                                    >
                                        <Card.Body className="p-4 d-flex flex-column">
                                            <Card.Title
                                                className="fw-bold fs-5 mb-3"
                                                style={{ color: "#111827" }}
                                            >
                                                {event.title}
                                            </Card.Title>

                                            <div className="mb-4">
                                                <Badge
                                                    bg={
                                                        event.status ===
                                                        "active"
                                                            ? "dark"
                                                            : "light"
                                                    }
                                                    text={
                                                        event.status ===
                                                        "active"
                                                            ? "light"
                                                            : "dark"
                                                    }
                                                    className={`rounded-pill px-3 py-2 fw-normal ${event.status !== "active" ? "border" : ""}`}
                                                >
                                                    {event.status}
                                                </Badge>
                                            </div>

                                            <div
                                                className="text-muted flex-grow-1"
                                                style={{ fontSize: "0.95rem" }}
                                            >
                                                <div className="d-flex align-items-center mb-3">
                                                    <Calendar
                                                        size={18}
                                                        className="me-3 text-secondary"
                                                    />
                                                    {event.date || "TBD"}
                                                </div>
                                                <div className="d-flex align-items-center mb-3">
                                                    <MapPin
                                                        size={18}
                                                        className="me-3 text-secondary"
                                                    />
                                                    {event.location || "TBD"}
                                                </div>
                                                <div className="d-flex align-items-center mb-4">
                                                    <Users
                                                        size={18}
                                                        className="me-3 text-secondary"
                                                    />
                                                    {event.attendees || "0"}{" "}
                                                    attendees
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="d-flex gap-3 mt-auto">
                                                <NavLink
                                                    to={`/organizer/${events.id}/event-dashboard`} // Route menuju form edit/dashboard event
                                                    className="flex-grow-1 text-decoration-none"
                                                >
                                                    <Button
                                                        variant="outline-secondary"
                                                        className="flex-grow-1 d-flex justify-content-center align-items-center rounded-3 border"
                                                        style={{
                                                            color: "#374151",
                                                            borderColor:
                                                                "#e5e7eb",
                                                        }}
                                                    >
                                                        <Edit
                                                            size={16}
                                                            className="me-2"
                                                        />{" "}
                                                        Edit
                                                    </Button>
                                                </NavLink>
                                                <Button
                                                    variant="outline-danger"
                                                    className="flex-grow-1 d-flex justify-content-center align-items-center rounded-3 border"
                                                    style={{
                                                        borderColor: "#fee2e2",
                                                        color: "#ef4444",
                                                    }}
                                                >
                                                    <Trash2
                                                        size={16}
                                                        className="me-2"
                                                    />{" "}
                                                    Delete
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
};

export default OrgDashboardPage;
