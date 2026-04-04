import React from "react";
import { Form, Row, Col } from "react-bootstrap";
import OptionalBadge from "../../../../../components/form/OptionalBadge";
import OfflineLocationInput from "../../../../../components/event/OfflineLocationInput";

const OfflineForm = ({ data, onChange, errors }) => {
    // 1. Buat fungsi untuk menangkap data dari peta
    const handleMapLocationChange = (mapDataObj) => {
        // Simulasikan event object seperti input biasa
        onChange({
            target: {
                name: "mapCoordinates", // Kamu bisa ganti nama field ini sesuai kebutuhan schema backend-mu
                value: mapDataObj,
            },
        });
    };

    return (
        <>
            {/* Ringkasan Lokasi (Publik) */}
            <Form.Group controlId="formGridLocation" className="mb-4">
                <Form.Label>Ringkasan Lokasi</Form.Label>
                <Form.Control
                    type="text"
                    name="location"
                    value={data.location}
                    onChange={onChange}
                    placeholder="Contoh: Kampus Utama, Gedung Rektorat, atau Area Parkir Bawah"
                />
                <Form.Text className="text-muted d-block">
                    Nama lokasi singkat yang muncul di kartu event halaman
                    publik.
                </Form.Text>
            </Form.Group>

            {/* 2. Panggil komponen petanya dan lempar props onLocationChange */}
            <OfflineLocationInput onLocationChange={handleMapLocationChange} />

            {/* Detail Lokasi Spesifik (Pengganti Lantai & Ruangan) */}
            <Form.Group controlId="formLocationDetail" className="mb-4">
                <Form.Label className="d-flex align-items-center">
                    Detail Lokasi Spesifik
                    <OptionalBadge />
                </Form.Label>
                <Form.Control
                    as="textarea"
                    name="locationDetail"
                    value={data.locationDetail}
                    rows={2}
                    onChange={onChange}
                    placeholder="Sebutkan detail seperti: Lantai 3A, Ruang R-301, dll."
                    style={{ resize: "none" }}
                />
                <Form.Text className="text-muted">
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
                    name="accessInstruction"
                    value={data.accessInstruction}
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
                            name="offlineQuota"
                            type="number"
                            value={data.offlineQuota || ""}
                            onChange={onChange}
                            disabled={data.is_offllineQuoataUnlimited}
                            placeholder="0"
                            min="1"
                        />
                    </Col>
                    <Col xs={4} sm={3}>
                        <Form.Check
                            type="checkbox"
                            id="is_offllineQuoataUnlimited"
                            name="is_offllineQuoataUnlimited"
                            checked={data.is_offllineQuoataUnlimited || false}
                            onChange={(e) => {
                                onChange({
                                    target: {
                                        name: "is_offllineQuoataUnlimited",
                                        value: e.target.checked,
                                    },
                                });
                                if (e.target.checked) {
                                    onChange({
                                        target: {
                                            name: "offlineQuota",
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
