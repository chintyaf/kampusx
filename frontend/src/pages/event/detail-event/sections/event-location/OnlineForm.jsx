import React from "react";
import { Form, Row, Col } from "react-bootstrap";
import OptionalBadge from "../../../../../components/form/OptionalBadge";

const OnlineForm = ({ data, onChange, errors }) => {
    return (
        <>
            {/* Lokasi Umum */}
            <Form.Group controlId="formGridLocation" className="mb-4">
                <Form.Label>Platform</Form.Label>
                <Form.Control
                    name="platform"
                    type="text"
                    value={data.platform}
                    onChange={onChange}
                    placeholder={"Contoh: Link Zoom, Google Meet, YouTube Live"}
                />
                <Form.Text className="text-muted d-block">
                    Nama lokasi ini akan muncul pada kartu event di halaman
                    publik.
                </Form.Text>
            </Form.Group>

            {/* Tautan Pertemuan */}
            <Form.Group controlId="formMeetingLink" className="mb-4">
                <Form.Label>Tautan Pertemuan (Link)</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={2}
                    value={data.meeting_link}
                    name="meeting_link"
                    placeholder="https://zoom.us/j/..."
                    onChange={onChange}
                    isInvalid={!!errors.meeting_link}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.meeting_link
                        ? errors.meeting_link[0]
                        : "Format harus berupa URL (contoh: https://...)"}
                </Form.Control.Feedback>
            </Form.Group>

            {/* Instruksi Online */}
            <Form.Group className="mb-4" controlId="formInstructions">
                <Form.Label className="d-flex align-items-center fw-bold">
                    Instruksi & Detail Akses <OptionalBadge />
                </Form.Label>
                <Form.Control
                    name="online_instruction"
                    value={data.online_instruction}
                    as="textarea"
                    onChange={onChange}
                    rows={5}
                    placeholder={`Contoh:\n• Passcode Zoom: 123456\n• Gunakan Virtual Background di link...\n• Mohon hadir 15 menit sebelum mulai.`}
                />
                <Form.Text className="text-muted">
                    Informasi rahasia (seperti password link) aman di sini.
                    Hanya akan tampil di email/dashboard peserta setelah
                    mendaftar.
                </Form.Text>
            </Form.Group>

            {/* Batas Kuota */}
            <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Batas Kuota</Form.Label>

                <Row className="align-items-center g-3">
                    <Col xs={8} sm={9}>
                        <Form.Control
                            name="online_quota" // Diperbaiki: online_quota
                            type="number"
                            value={
                                data.online_quota !== null &&
                                data.online_quota !== undefined
                                    ? data.online_quota
                                    : ""
                            }
                            onChange={(e) => {
                                const val = e.target.value;
                                onChange({
                                    target: {
                                        name: "online_quota", // Diperbaiki: online_quota
                                        value: val === "" ? null : Number(val),
                                    },
                                });
                            }}
                            disabled={data.is_online_quota_unlimited} // Diperbaiki
                            placeholder="0"
                            min="0"
                        />
                    </Col>

                    <Col xs={4} sm={3}>
                        <Form.Check
                            type="checkbox"
                            id="is_online_quota_unlimited" // Diperbaiki
                            name="is_online_quota_unlimited" // Diperbaiki
                            checked={data.is_online_quota_unlimited || false} // Diperbaiki
                            onChange={(e) => {
                                const isChecked = e.target.checked;

                                // 1. Update status checkbox
                                onChange({
                                    target: {
                                        name: "is_online_quota_unlimited", // Diperbaiki
                                        value: isChecked,
                                    },
                                });

                                // 2. Sesuaikan value dari online_quota
                                onChange({
                                    target: {
                                        name: "online_quota", // Diperbaiki
                                        value: isChecked ? null : 0,
                                    },
                                });
                            }}
                            label="Unlimited"
                            className="mb-0"
                        />
                    </Col>
                </Row>
            </Form.Group>
        </>
    );
};

export default OnlineForm;
