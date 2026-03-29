import React from "react";
import { Row, Col, Badge, Button, Card } from "react-bootstrap";
import { User, Link as LinkIcon, Pin } from "lucide-react"; // Ikon Pin dihapus

const SpeakerCard = ({
    name,
    role,
    tags,
    linkedin,
    session,
    onEdit,
    onDelete,
}) => {
    // Helper untuk memastikan format URL LinkedIn benar
    const formattedLinkedIn = () => {
        if (!linkedin) return null;
        if (linkedin.startsWith("http://") || linkedin.startsWith("https://")) {
            return linkedin;
        }
        return `https://${linkedin}`;
    };

    // Helper untuk memastikan tags selalu berupa array
    let safeTags = [];
    if (Array.isArray(tags)) {
        safeTags = tags;
    } else if (typeof tags === "string") {
        try {
            safeTags = JSON.parse(tags);
        } catch (error) {
            safeTags = [];
        }
    }

    return (
        <Card
            className="border rounded-4 p-3 mb-3 shadow-sm"
            style={{ backgroundColor: "#fff" }}
        >
            <Card.Body className="p-0">
                <Row className="align-items-start g-3">
                    {/* Avatar Profil */}
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

                    {/* Info Utama Speaker */}
                    <Col className="flex-grow-1">
                        <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                            <h5
                                className="mb-0 fw-bold text-dark"
                                style={{ letterSpacing: "-0.3px" }}
                            >
                                {name || "Nama Tidak Diketahui"}
                            </h5>

                            <div className="d-flex gap-1 flex-wrap">
                                {safeTags.map((tag, index) => (
                                    <Badge
                                        key={index}
                                        pill
                                        className="bg-primary bg-opacity-10 text-primary fw-medium px-3 py-1 border-0"
                                        style={{ fontSize: "0.75rem" }}
                                    >
                                        {typeof tag === "object"
                                            ? tag.label || tag.value
                                            : tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <p
                            className="text-muted mb-2"
                            style={{ fontSize: "0.9rem" }}
                        >
                            {role || "Peran/Jabatan belum diatur"}
                        </p>

                        {/* Link LinkedIn */}
                        {linkedin && (
                            <a
                                href={formattedLinkedIn()}
                                target="_blank"
                                rel="noreferrer"
                                className="text-decoration-none d-flex align-items-center text-primary fw-medium"
                                style={{
                                    fontSize: "0.85rem",
                                    width: "fit-content",
                                }}
                            >
                                <LinkIcon size={14} className="me-1" />
                                {linkedin.replace(/^https?:\/\//, "")}
                            </a>
                        )}
                    </Col>

                    {/* Judul Sesi dan Action Buttons */}
                    <Col
                        xs={12}
                        md={4}
                        lg={3}
                        className="d-flex flex-column align-items-md-end justify-content-between h-100"
                    >
                        {/* Info Judul Sesi yang lebih rapi tanpa ikon Pin */}
                        <div
                            className="px-3 py-2 rounded-3 border bg-light text-dark d-flex align-items-start mb-4 w-100"
                            style={{
                                fontSize: "0.85rem",
                                fontWeight: "600",
                                lineHeight: "1.4",
                            }}
                        >
                            <Pin
                                size={16}
                                className="text-danger me-2 flex-shrink-0"
                                style={{ marginTop: "2px" }}
                                fill="currentColor"
                            />
                            <span className="text-break">{session}</span>
                        </div>

                        {/* Tombol Aksi */}
                        <div className="d-flex gap-3 justify-content-end w-100 mt-auto">
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

export default SpeakerCard;
