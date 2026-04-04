import React from "react";
import { Row, Col, Badge, Button, Card } from "react-bootstrap";
import { User, Link as LinkIcon, Pin, Globe } from "lucide-react";

const SpeakerCard = ({ data, onEdit, onDelete }) => {
    // Destructuring data agar lebih mudah dibaca
    const { name, role, expertise, social_link, sessions } = data;

    // Helper untuk menangani tampilan social links (karena sekarang bentuknya Array of Objects)
    const renderSocialLinks = () => {
        if (
            !social_link ||
            !Array.isArray(social_link) ||
            social_link.length === 0
        ) {
            return (
                <span className="text-muted fst-italic small">
                    Media sosial belum ada
                </span>
            );
        }

        return (
            <div className="d-flex flex-wrap gap-2">
                {social_link.map((link, index) => (
                    <a
                        key={index}
                        href={
                            link.url.startsWith("http")
                                ? link.url
                                : `https://${link.url}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-decoration-none d-flex align-items-center text-primary fw-medium"
                        style={{ fontSize: "0.85rem" }}
                    >
                        {link.platform === "LinkedIn" ? (
                            <LinkIcon size={14} className="me-1" />
                        ) : (
                            <Globe size={14} className="me-1" />
                        )}
                        {link.platform}
                    </a>
                ))}
            </div>
        );
    };

    // Helper untuk menggabungkan nama-nama sesi
    const getSessionText = () => {
        if (!sessions || sessions.length === 0) return "Belum ada data";

        return sessions
            .map((s) => s.name || s.title || s.label || `Sesi ${s.id || s}`)
            .join(", ");
    };

    return (
        <Card className="border rounded-4 p-3 mb-3  bg-white">
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
                                className="text-secondary opacity-50"
                            />
                        </div>
                    </Col>

                    {/* Info Utama */}
                    <Col className="flex-grow-1">
                        <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                            <h5 className="mb-0 fw-bold text-dark">
                                {name || (
                                    <span className="text-muted fw-normal fst-italic">
                                        Belum ada data
                                    </span>
                                )}
                            </h5>
                            <div className="d-flex gap-1 flex-wrap">
                                {expertise && expertise.length > 0 ? (
                                    expertise.map((tag, index) => (
                                        <Badge
                                            key={index}
                                            pill
                                            className="bg-primary bg-opacity-10 text-primary px-3 py-1 border-0"
                                        >
                                            {tag}
                                        </Badge>
                                    ))
                                ) : (
                                    <Badge
                                        pill
                                        className="bg-secondary bg-opacity-10 text-secondary px-3 py-1 border-0 fst-italic"
                                    >
                                        Belum ada data
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <p className="text-muted mb-2 small">
                            {role || (
                                <span className="fst-italic">
                                    Belum ada data
                                </span>
                            )}
                        </p>

                        {/* Render Social Links */}
                        {renderSocialLinks()}
                    </Col>

                    {/* Sesi & Aksi */}
                    <Col
                        xs={12}
                        md={4}
                        lg={3}
                        className="d-flex flex-column align-items-md-end justify-content-between h-100"
                    >
                        <div
                            className="px-3 py-2 rounded-3 border bg-light text-dark d-flex align-items-start mb-4 w-100 "
                            style={{ fontSize: "0.85rem", fontWeight: "600" }}
                        >
                            <Pin
                                size={16}
                                className="text-danger me-2 flex-shrink-0 mt-1"
                                fill="currentColor"
                            />
                            <span
                                className={
                                    !sessions || sessions.length === 0
                                        ? "text-muted fst-italic fw-normal"
                                        : "text-break"
                                }
                            >
                                {getSessionText()}
                            </span>
                        </div>

                        <div className="d-flex gap-3 justify-content-end w-100">
                            <Button
                                variant="link"
                                onClick={onEdit}
                                className="p-0 text-decoration-none text-primary fw-bold small"
                            >
                                Edit
                            </Button>
                            <Button
                                variant="link"
                                onClick={onDelete}
                                className="p-0 text-decoration-none text-danger fw-bold small"
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
