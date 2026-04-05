import React from "react";
import {
    Form,
    Row,
    Col,
    FloatingLabel,
    OverlayTrigger,
    InputGroup,
    Tooltip,
} from "react-bootstrap";
import OptionalBadge from "../../../../../components/form/OptionalBadge";
import OfflineLocationInput from "../../../../../components/event/OfflineLocationInput";
import { HelpCircle } from "lucide-react";

const OfflineForm = ({ data, onChange, errors }) => {
    const handleMapLocationChange = (mapDataObj) => {
        onChange({
            target: {
                name: "mapCoordinates", // Kamu bisa ganti nama field ini sesuai kebutuhan schema backend-mu
                value: mapDataObj,
            },
        });
    };

    return (
        <>
            <Form.Group className="mb-4" controlId="formGridLocation">
                <Form.Label>Ringkasan Lokasi</Form.Label>
                <InputGroup className="custom-input-group">
                    <Form.Control
                        type="text"
                        name="location_name"
                        value={data.location_name}
                        onChange={onChange}
                        placeholder="Contoh: Gedung Rektorat..."
                        // Hilangkan border kanan agar menyatu dengan ikon
                        className="border-end-0"
                    />
                    <OverlayTrigger
                        placement="top"
                        overlay={
                            <Tooltip>
                                Nama lokasi singkat yang muncul di kartu event
                                halaman publik.
                            </Tooltip>
                        }
                    >
                        <InputGroup.Text
                            className="border-start-0 text-muted px-3"
                            style={{
                                borderColor: "var(--color-border)", // Sesuaikan dengan warna border form
                                // backgroundColor: "rgb(241, 245, 249)", // Abu-abu muda (Bootstrap light)
                                cursor: "help",
                                transition: "background-color 0.2s",
                            }}
                        >
                            <HelpCircle
                                size={16}
                                color="rgb(100, 116, 139)" /* Warna garis luar (Stroke) */
                                fill="none" /* Warna isi di dalam lingkaran (Fill) */
                                strokeWidth={2.5} // Sedikit lebih tebal agar lebih jelas dibaca
                                style={{ backgroundColor: "transparent" }}
                            />
                        </InputGroup.Text>
                    </OverlayTrigger>
                </InputGroup>
            </Form.Group>

            {/* 2. Panggil komponen petanya dan lempar props onLocationChange */}
            <OfflineLocationInput
                onLocationChange={handleMapLocationChange}
                data={data}
            />

            {/* Detail Lokasi Spesifik (Pengganti Lantai & Ruangan) */}
            <Form.Group controlId="formLocationDetail" className="mb-4">
                <Form.Label className="d-flex align-items-center">
                    Detail Lokasi Spesifik
                    <OptionalBadge />
                </Form.Label>
                <Form.Control
                    as="textarea"
                    name="location_detail"
                    value={data.location_detail}
                    rows={2}
                    onChange={onChange}
                    placeholder="Sebutkan detail seperti: Lantai 3A, Ruang R-301, dll."
                    style={{ resize: "none" }}
                />
                <Form.Text>
                    Gunakan ini untuk menjelaskan letak ruangan/lantai secara
                    mendalam.
                </Form.Text>
            </Form.Group>

            {/* Instruksi Akses */}
            <Form.Group className="mb-4" controlId="formAccessInstruction">
                <Form.Label>
                    Instruksi Akses & Parkir <OptionalBadge />
                </Form.Label>
                <Form.Control
                    as="textarea"
                    name="offline_instruction"
                    value={data.offline_instruction}
                    rows={3}
                    onChange={onChange}
                    placeholder="Contoh: Parkir di Basement P2. Masuk via Lobby Selatan..."
                />
            </Form.Group>

            {/* Batas Kuota */}
            <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Batas Kuota</Form.Label>
                <Row className="align-items-center g-3">
                    <Col xs={8} sm={9}>
                        <Form.Control
                            name="offline_quota"
                            type="number"
                            value={data.offline_quota || ""}
                            onChange={onChange}
                            disabled={data.is_offline_quota_unlimited}
                            placeholder="0"
                            min="1"
                        />
                    </Col>
                    <Col xs={4} sm={3}>
                        <Form.Check
                            type="checkbox"
                            id="is_offline_quota_unlimited"
                            name="is_offline_quota_unlimited"
                            checked={data.is_offline_quota_unlimited || false}
                            onChange={(e) => {
                                onChange({
                                    target: {
                                        name: "is_offline_quota_unlimited",
                                        value: e.target.checked,
                                    },
                                });
                                if (e.target.checked) {
                                    onChange({
                                        target: {
                                            name: "offline_quota",
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

export default OfflineForm;
