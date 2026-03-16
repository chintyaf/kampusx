import React from "react";
import { Video, MapPin, SquareCode, CheckCircle2 } from "lucide-react";
import { Form, Row, Col, Card, Badge } from "react-bootstrap";
import { Map, Info } from "lucide-react";

const OfflineForm = () => {
    return (
        <>
            {/* Baris 1: Nama Gedung & Nama Ruangan */}
            <Row className="mb-3">
                <Form.Group as={Col} md={6} controlId="formVenueName">
                    <Form.Label className="small fw-bold text-muted">
                        Nama Gedung / Venue *
                    </Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="e.g. Gedung Serbaguna UKM"
                    />
                </Form.Group>

                <Form.Group as={Col} md={6} controlId="formRoomName">
                    <Form.Label className="small fw-bold text-muted">
                        Nama Ruangan *
                    </Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="e.g. Aula Lantai 3"
                    />
                </Form.Group>
            </Row>

            {/* Baris 2: Lantai, Kode, Kapasitas */}
            <Row className="mb-4">
                <Form.Group as={Col} md={4} controlId="formFloor">
                    <Form.Label className="small fw-bold text-muted">
                        Lantai
                    </Form.Label>
                    <Form.Control type="text" placeholder="e.g. 3" />
                </Form.Group>

                <Form.Group as={Col} md={4} controlId="formRoomCode">
                    <Form.Label className="small fw-bold text-muted d-flex align-items-center">
                        Kode Ruangan
                        <span
                            className="ms-2 badge bg-light text-dark border fw-normal"
                            style={{ fontSize: "0.7rem" }}
                        >
                            Optional
                        </span>
                    </Form.Label>
                    <Form.Control type="text" placeholder="e.g. R-301" />
                </Form.Group>

                <Form.Group as={Col} md={4} controlId="formCapacity">
                    <Form.Label className="small fw-bold text-muted">
                        Kapasitas Ruangan
                    </Form.Label>
                    <Form.Select className="text-muted">
                        <option>Pilih range...</option>
                        <option value="1">1 - 50 orang</option>
                        <option value="2">51 - 100 orang</option>
                        <option value="3">100+ orang</option>
                    </Form.Select>
                </Form.Group>
            </Row>

            {/* URL Google Maps */}
            <Form.Group className="mb-4" controlId="formMaps">
                <Form.Label className="small fw-bold text-muted">
                    URL Google Maps{" "}
                    <span className="text-secondary fw-normal">
                        (Titik Koordinat)
                    </span>
                </Form.Label>
                <div className="border rounded-3 overflow-hidden">
                    <Form.Control
                        type="text"
                        placeholder="https://maps.google.com/..."
                        className="border-0 border-bottom rounded-0 py-2"
                    />
                    {/* Map Preview Placeholder */}
                    <div
                        className="bg-light d-flex flex-column align-items-center justify-content-center py-5 text-muted shadow-sm"
                        style={{ backgroundColor: "#f8f9fa" }}
                    >
                        <Map
                            size={40}
                            strokeWidth={1}
                            className="mb-2 opacity-50"
                        />
                        <p className="small mb-0">
                            Map preview akan tampil setelah URL diisi
                        </p>
                        <div className="d-flex gap-2 mt-2">
                            <div
                                className="bg-secondary opacity-10 rounded-pill"
                                style={{ width: "40px", height: "12px" }}
                            ></div>
                            <div
                                className="bg-secondary opacity-10 rounded-pill"
                                style={{ width: "60px", height: "12px" }}
                            ></div>
                        </div>
                    </div>
                </div>
                <Form.Text className="text-muted small">
                    Paste URL dari Google Maps → Share → Copy Link
                </Form.Text>
            </Form.Group>

            {/* Instruksi Akses */}
            <Form.Group className="mb-3" controlId="formAccessInstruction">
                <Form.Label className="small fw-bold text-muted">
                    Instruksi Akses
                </Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="e.g. Masuk lewat pintu utara, parkir di basement B2, bawa KTM sebagai identitas..."
                />
            </Form.Group>
        </>
    );
};

export default OfflineForm;
