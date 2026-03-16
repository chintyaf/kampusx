import React, { useState } from "react";
import EventLayout from "../../EventLayout";
import { Form, InputGroup, Row, Col, Card } from "react-bootstrap";
import { Video, MapPin, SquareCode, CheckCircle2 } from "lucide-react";

const SelectionCard = ({ type, isSelected, onClick }) => {};

const Step1_TypeSelection = ({ onSelectType }) => {
    const [selectedType, setSelectedType] = useState(null);

    const handleChange = (type) => {
        setSelectedType(type);
        if (onSelectType) {
            onSelectType(type);
        }
    };

    const attendanceTypes = [
        {
            id: "online",
            title: "Online",
            subtitle: "Full Remote",
            desc: "Zoom • Google Meet • YouTube Live",
            icon: <Video size={22} color="#0d6efd" />,
            bgIconColor: "#d4e5fd",
            bgColor: "#e7f1ff",
            borderColor: "#0d6efd",
        },
        {
            id: "offline",
            title: "Offline",
            subtitle: "On-site",
            desc: "Gedung • Ruangan • Koordinat",
            icon: <MapPin size={22} color="#fd7e14" />,
            bgIconColor: "#ffe7d3",
            bgColor: "#fff4eb",
            borderColor: "#fd7e14",
        },
        {
            id: "hybrid",
            title: "Hybrid",
            subtitle: "Campuran",
            desc: "Online + Offline bersamaan",
            icon: <SquareCode size={22} color="#6f42c1" />,
            bgIconColor: "#e3d0ff",
            bgColor: "#f3ebff",
            borderColor: "#6f42c1",
        },
    ];

    const locationPlaceholder = {
        online: "Contoh: Link Zoom, Google Meet, YouTube Live",
        offline: "Contoh: Nama Gedung, Ruangan, atau Alamat Lengkap",
        hybrid: "Contoh: Link Online & Alamat Lokasi Fisik",
    };

    return (
        <>
            <Form>
                {/* Header Bagian */}
                <div className="mb-4 d-flex align-items-start">
                    <div className="me-2 mt-1 text-success">
                        <CheckCircle2
                            size={24}
                            fill="currentColor"
                            color="white"
                        />
                    </div>
                    <div>
                        <h5
                            className="fw-bold mb-1"
                            style={{ fontSize: "1.1rem" }}
                        >
                            Level 1 — Tipe Kehadiran
                        </h5>
                        <p className="text-muted small mb-0">
                            Pilih mode kehadiran. Ini menentukan field yang
                            perlu diisi.
                        </p>
                    </div>
                </div>

                {/* Pilihan Tipe Kehadiran */}
                <Row className="g-3 mb-4">
                    {attendanceTypes.map((type) => (
                        <Col md={4} key={type.id}>
                            <Card
                                onClick={() => {
                                    handleChange(type.id);
                                }}
                                style={{
                                    cursor: "pointer",
                                    border: `2px ${selectedType === type.id ? type.borderColor : "#dee2e6"} solid`,
                                    borderRadius: "12px",
                                    transition: "0.2s ease-in-out",
                                    backgroundColor: `${selectedType === type.id ? type.bgColor : "white"}`,
                                }}
                                className="h-100"
                            >
                                <Card.Body className="p-3">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div
                                            className="p-2 rounded-3 d-flex align-items-center justify-content-center"
                                            style={{
                                                backgroundColor:
                                                    type.bgIconColor,
                                            }}
                                        >
                                            {type.icon}
                                        </div>
                                        <Form.Check
                                            type="radio"
                                            name="attendanceType"
                                            checked={selectedType === type.id}
                                            onChange={() =>
                                                handleChange(type.id)
                                            }
                                            style={{ cursor: "pointer" }}
                                        />
                                    </div>

                                    <h6
                                        className="fw-bold mb-0"
                                        style={{ fontSize: "1rem" }}
                                    >
                                        {type.title}
                                    </h6>
                                    <p
                                        className="text-muted small mb-2"
                                        style={{ fontSize: "0.85rem" }}
                                    >
                                        {type.subtitle}
                                    </p>
                                    <p
                                        className="text-secondary mb-0"
                                        style={{
                                            fontSize: "0.75rem",
                                            lineHeight: "1.4",
                                        }}
                                    >
                                        {type.desc}
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formGridEmail">
                        <Form.Label>Zona Waktu</Form.Label>
                        <Form.Select aria-label="Pilih Zona Waktu Indonesia">
                            <option>Pilih Zona Waktu</option>
                            <option value="WIB">
                                WIB - Waktu Indonesia Barat (UTC+7)
                            </option>
                            <option value="WITA">
                                WITA - Waktu Indonesia Tengah (UTC+8)
                            </option>
                            <option value="WIT">
                                WIT - Waktu Indonesia Timur (UTC+9)
                            </option>
                        </Form.Select>
                        <Form.Text className="text-muted">
                            Penting jika peserta berasal dari berbagai zona
                            waktu.
                        </Form.Text>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridPassword">
                        <Form.Label>Informasi Lokasi Umum</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder={`${locationPlaceholder[selectedType] || "Masukkan informasi lokasi"}`}
                        />
                        <Form.Text className="text-muted">
                            Ditampilkan di halaman event publik
                        </Form.Text>
                    </Form.Group>
                </Row>
            </Form>
        </>
    );
};

export default Step1_TypeSelection;
