// ManualLocationForm.jsx
import React from "react";
import { Form, Card, Alert, Row, Col } from "react-bootstrap";
import { MapPin } from "lucide-react";

const ManualLocationForm = ({ locationData, setLocationData }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocationData((prev) => ({ ...prev, [name]: value }));
    };

    const formFields = [
        // {
        //     label: "Negara",
        //     name: "country",
        //     placeholder: "Cth: Indonesia",
        //     type: "text",
        // },
        {
            label: "Nama Lokasi",
            name: "location_name",
            placeholder: "Cth: Gedung Utama",
            type: "text",
        },
        {
            label: "Kecamatan",
            name: "district",
            placeholder: "Cth: Sukajadi",
            type: "text",
        },
        {
            label: "Kota / Kabupaten",
            name: "city",
            placeholder: "Cth: Kota Bandung",
            type: "text",
        },
        {
            label: "Provinsi",
            name: "province",
            placeholder: "Cth: Jawa Barat",
            type: "text",
        },
        {
            label: "Detail Alamat (Jalan/No)",
            name: "address_detail",
            placeholder: "Cth: Jl. Surya Sumantri No. 65",
            type: "text",
        },

        {
            label: "Latitude (Lintang)",
            name: "latitude",
            placeholder: "Cth: -6.8863",
            type: "number",
        },
        {
            label: "Longitude (Bujur)",
            name: "longitude",
            placeholder: "Cth: 107.5762",
            type: "number",
        },
    ];

    return (
        <Card
            className="mb-3"
            style={{
                backgroundColor: "#ffffff",
                border: `2px solid var(--color-border)`,
            }}
        >
            <Card.Body className="p-3">
                <Alert
                    className="py-2 px-3 d-flex align-items-center gap-2 mb-3"
                    style={{
                        backgroundColor: "var(--bahama-blue-50)",
                        border: `1px solid var(--bahama-blue-200)`,
                        color: "var(--bahama-blue-900)",
                        fontSize: "var(--font-sm)",
                    }}
                >
                    <MapPin
                        size={16}
                        style={{ color: "var(--bahama-blue-600)" }}
                        className="flex-shrink-0"
                    />
                    <span>
                        Klik sembarang tempat di peta, geser pin merah, atau{" "}
                        <strong>ketik kordinat secara manual</strong> di bawah
                        untuk mengatur lokasi.
                    </span>
                </Alert>
                <Row className="g-3">
                    {formFields.map((field, idx) => (
                        <Col md={6} key={idx}>
                            <Form.Group>
                                <Form.Label
                                    style={{
                                        fontSize: "var(--font-xs)",
                                        color: "var(--color-secondary)",
                                        fontWeight: "600",
                                    }}
                                    className="mb-1"
                                >
                                    {field.label}
                                </Form.Label>
                                <Form.Control
                                    size="sm"
                                    type={field.type}
                                    step={
                                        field.type === "number"
                                            ? "any"
                                            : undefined
                                    }
                                    name={field.name}
                                    placeholder={field.placeholder}
                                    value={
                                        locationData[field.name] === null
                                            ? ""
                                            : locationData[field.name]
                                    }
                                    onChange={handleChange}
                                    style={{
                                        fontSize: "var(--font-sm)",
                                        color: "var(--color-text)",
                                        borderColor: "var(--color-border-mid)",
                                    }}
                                />
                            </Form.Group>
                        </Col>
                    ))}
                </Row>
            </Card.Body>
        </Card>
    );
};

export default ManualLocationForm;
