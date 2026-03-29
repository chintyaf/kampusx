import React, { useState, useEffect } from "react";
import { Form, Row, Col, Card } from "react-bootstrap";
import { Video, MapPin, SquareCode } from "lucide-react";

const TypeCard = ({ selectedType, onSelectType }) => {
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

    return (
        <Row className="g-3 mb-4">
            {attendanceTypes.map((type) => (
                <Col md={4} key={type.id}>
                    <Card
                        onClick={() => onSelectType(type.id)}
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
                                        backgroundColor: type.bgIconColor,
                                    }}
                                >
                                    {type.icon}
                                </div>
                                <Form.Check
                                    type="radio"
                                    name="attendanceType"
                                    checked={selectedType === type.id}
                                    onChange={() => onSelectType(type.id)} // Sinkronkan radio button
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
    );
};

const Step1_TypeSelection = ({ onSelectType, selectedType }) => {
    const [localSelectedType, setLocalSelectedType] = useState(
        selectedType || "",
    );

    const handleTypeSelection = (type) => {
        setLocalSelectedType(type);
        if (onSelectType) {
            onSelectType(type);
        }
    };

    useEffect(() => {
        if (selectedType) {
            setLocalSelectedType(selectedType);
            handleTypeSelection(selectedType);
        }
    }, [selectedType]);

    return (
        <Form>
            {/* Header Bagian */}
            <div className="mb-4 d-flex align-items-start">
                <div>
                    <h5 className="fw-bold mb-1" style={{ fontSize: "1.1rem" }}>
                        Tipe Kehadiran
                    </h5>
                    <p className="text-muted small mb-0">
                        Pilih mode kehadiran. Ini menentukan field yang perlu
                        diisi.
                    </p>
                </div>
            </div>

            {/* Pilihan Tipe Kehadiran */}
            <TypeCard
                selectedType={localSelectedType}
                onSelectType={handleTypeSelection}
            />
        </Form>
    );
};

export default Step1_TypeSelection;
