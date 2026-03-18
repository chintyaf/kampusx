import React, { useState } from "react";
import EventLayout from "../EventLayout";
import { Form, Row, Col, Badge, Button, Card, Collapse } from "react-bootstrap";
import Select from "react-select";
import { User, Link as LinkIcon, Pin, Pencil, Trash2 } from "lucide-react";

const SpeakerForm = ({ onCancel, initialData }) => {
    const isEdit = !!initialData; // Cek apakah sedang mode edit
    const kategori_options = [
        { value: "1", label: "Satu" },
        { value: "2", label: "Dua" },
        { value: "3", label: "Tiga" },
    ];

    return (
        <Form className="border rounded-4 p-4 bg-white mb-4 shadow-sm">
            <h6 className="fw-bold mb-4">
                {isEdit ? "Edit Speaker" : "Tambah Speaker Baru"}
            </h6>
            <Row>
                <Col className="col-1 d-none d-md-block text-center text-muted">
                    <div
                        className="bg-light d-flex align-items-center justify-content-center rounded-circle border"
                        style={{ width: "70px", height: "70px" }}
                    >
                        <User
                            size={35}
                            strokeWidth={1.5}
                            className="text-secondary opacity-50"
                        />
                    </div>
                </Col>
                <Col>
                    <Row className="mb-3">
                        <Form.Group as={Col} md={6} controlId="formSpeakerName">
                            <Form.Label className="small fw-bold">
                                Nama Lengkap *
                            </Form.Label>
                            <Form.Control
                                type="text"
                                defaultValue={initialData?.name || ""}
                                placeholder="Contoh: Budi Santoso, S.Kom"
                            />
                        </Form.Group>
                        <Form.Group as={Col} md={6} controlId="formTitle">
                            <Form.Label className="small fw-bold">
                                Jabatan / Keahlian *
                            </Form.Label>
                            <Form.Control
                                type="text"
                                defaultValue={initialData?.role || ""}
                                placeholder="Contoh: Senior AI Developer"
                            />
                        </Form.Group>
                    </Row>

                    <Row>
                        <Form.Group as={Col} md={6} controlId="formSpeakerName">
                            <Form.Label className="small fw-bold">
                                LinkedIn URL
                            </Form.Label>
                            <Form.Control
                                type="text"
                                defaultValue={initialData?.name || ""}
                                placeholder="Contoh: Budi Santoso, S.Kom"
                            />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3">
                            <Form.Label>Expertise Tags</Form.Label>
                            <Select
                                isMulti
                                placeholder="Pilih Tag Keahlian..."
                                options={kategori_options}
                                className="basic-multi-select"
                                classNamePrefix="select form-select"
                            />
                        </Form.Group>
                    </Row>

                    <Form.Group>
                        <Form.Label>Assign to Session</Form.Label>
                        <Select
                            isMulti
                            options={kategori_options}
                            placeholder="Pilih Sesi..."
                            className="basic-multi-select"
                            classNamePrefix="select form-select"
                        />
                    </Form.Group>

                    {/* ... (Bio dan LinkedIn gunakan pattern defaultValue serupa) ... */}
                </Col>
            </Row>
            <div className="d-flex gap-2 justify-content-end mt-3">
                <Button variant="light" onClick={onCancel} className="px-4">
                    Batal
                </Button>
                <Button variant="primary" className="px-4">
                    {isEdit ? "Simpan Perubahan" : "Simpan Speaker"}
                </Button>
            </div>
        </Form>
    );
};

const SpeakerCard = ({
    name,
    role,
    tags,
    linkedin,
    session,
    onEdit,
    onDelete,
}) => {
    return (
        <Card
            className="shadow-sm border-0 rounded-4 p-3 mb-3"
            style={{ backgroundColor: "#fff" }}
        >
            <Card.Body className="p-0">
                <Row className="align-items-start g-3">
                    {/* Avatar Section */}
                    <Col xs="auto">
                        <div
                            className="bg-light d-flex align-items-center justify-content-center rounded-circle border"
                            style={{ width: "70px", height: "70px" }}
                        >
                            <User
                                size={35}
                                strokeWidth={1.5}
                                className="text-secondary opacity-50"
                            />
                        </div>
                    </Col>

                    {/* Info Section */}
                    <Col className="flex-grow-1">
                        <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                            <h5
                                className="mb-0 fw-bold text-dark"
                                style={{ letterSpacing: "-0.3px" }}
                            >
                                {name}
                            </h5>
                            <div className="d-flex gap-1">
                                {tags &&
                                    tags.map((tag, index) => (
                                        <Badge
                                            key={index}
                                            pill
                                            className="bg-primary bg-opacity-10 text-primary fw-medium px-3 py-1 border-0"
                                            style={{ fontSize: "0.75rem" }}
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                            </div>
                        </div>

                        <p
                            className="text-muted mb-2"
                            style={{ fontSize: "0.9rem" }}
                        >
                            {role}
                        </p>

                        <a
                            href={`https://${linkedin}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-decoration-none d-flex align-items-center text-primary fw-medium"
                            style={{ fontSize: "0.85rem" }}
                        >
                            <LinkIcon size={14} className="me-1" />
                            {linkedin}
                        </a>
                    </Col>

                    {/* Action & Session Section */}
                    <Col
                        xs={12}
                        md="auto"
                        className="d-flex flex-column align-items-md-end justify-content-between h-100"
                    >
                        <div
                            className="px-3 py-1 rounded-3 border bg-light text-dark d-flex align-items-center mb-4"
                            style={{ fontSize: "0.8rem", fontWeight: "500" }}
                        >
                            <Pin
                                size={14}
                                className="text-danger me-2"
                                fill="currentColor"
                            />
                            {session}
                        </div>

                        <div className="d-flex gap-3 mt-auto">
                            <Button
                                variant="link"
                                onClick={onEdit}
                                className="p-0 text-decoration-none text-primary fw-bold d-flex align-items-center gap-1"
                                style={{ fontSize: "0.9rem" }}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="link"
                                onClick={onDelete}
                                className="p-0 text-decoration-none text-danger fw-bold d-flex align-items-center gap-1"
                                style={{ fontSize: "0.9rem" }}
                            >
                                Hapus
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

const EventSpeakerList = () => {
    const [showForm, setShowForm] = useState(false);

    return (
        <EventLayout title="Tambah Pembicara">
            <Form>
                <h1></h1>
                <SpeakerCard
                    name="Dr. Andi Pratama"
                    role="AI Researcher"
                    tags={["AI", "Machine Learning"]}
                    linkedin="linkedin.com/in/drandipratama"
                    session="Session 2 — Workshop AI"
                    onDelete={() => console.log("Dihapus!")}
                />

                <SpeakerCard
                    name="Dr. Andi Pratama"
                    role="AI Researcher"
                    tags={["AI", "Machine Learning"]}
                    linkedin="linkedin.com/in/drandipratama"
                    session="Session 2 — Workshop AI"
                    onDelete={() => console.log("Dihapus!")}
                />

                {showForm ? (
                    <Collapse in={showForm}>
                        <div>
                            <SpeakerForm onCancel={() => setShowForm(false)} />
                        </div>
                    </Collapse>
                ) : (
                    <Button
                        variant="outline-primary"
                        className="w-100 py-3 border-dashed"
                        onClick={() => setShowForm(true)}
                    >
                        + Tambah Speaker
                    </Button>
                )}
            </Form>
        </EventLayout>
    );
};

export default EventSpeakerList;
