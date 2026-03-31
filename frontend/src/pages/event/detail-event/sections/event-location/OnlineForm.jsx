import { useState } from "react";
import { Form, InputGroup, Row, Col } from "react-bootstrap";
import OptionalBadge from "../../../../../components/form/OptionalBadge";

const OnlineForm = ({ data, onChange }) => {
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

            {/* Platform & Link */}
            {/* <Form.Group controlId="formPlatform" className="mb-4">
                <Form.Label>Platform</Form.Label>
                <Form.Control
                    value={data.platform}
                    placeholder="Pilih Platform"
                    onChange={onChange}
                />
            </Form.Group> */}

            <Form.Group controlId="formLink" className="mb-4">
                <Form.Label>Tautan Pertemuan (Link)</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={2}
                    type="url"
                    value={data.link}
                    name="link"
                    placeholder="https://zoom.us/j/..."
                    onChange={onChange}
                />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formInstructions">
                <Form.Label className="d-flex align-items-center fw-bold">
                    Instruksi & Detail Akses <OptionalBadge />
                </Form.Label>
                <Form.Control
                    name="onlineInstruction" // Pastikan name sesuai dengan state di parent
                    value={data.onlineInstruction}
                    as="textarea"
                    onChange={onChange}
                    rows={5}
                    placeholder={`Contoh:
    • Passcode Zoom: 123456
    • Gunakan Virtual Background di link...
    • Mohon hadir 15 menit sebelum mulai.`}
                    // style={{ resize: "none" }}
                />
                <Form.Text className="text-muted">
                    Informasi rahasia (seperti password link) aman di sini.
                    Hanya akan tampil di email/dashboard peserta setelah
                    mendaftar.
                </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Batas Kuota</Form.Label>

                <Row className="align-items-center g-3">
                    <Col xs={8} sm={9}>
                        <Form.Control
                            name="onlineQuota"
                            type="number"
                            value={data.onlineQuota || ""}
                            onChange={onChange}
                            disabled={data.is_onlineQuotaUnlimited}
                            placeholder="0"
                            min="1"
                        />
                    </Col>

                    <Col xs={4} sm={3}>
                        <Form.Check
                            type="checkbox"
                            id="is_onlineQuotaUnlimited"
                            name="is_onlineQuotaUnlimited"
                            checked={data.is_onlineQuotaUnlimited || false}
                            onChange={(e) => {
                                onChange({
                                    target: {
                                        name: "is_onlineQuotaUnlimited",
                                        value: e.target.checked,
                                    },
                                });

                                // Kosongkan input angka jika checkbox dicentang
                                if (e.target.checked) {
                                    onChange({
                                        target: {
                                            name: "onlineQuota",
                                            value: "",
                                        },
                                    });
                                }
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
