import React, { useState } from "react";
import { Video, MapPin } from "lucide-react";
import { Form, Row, Col, ButtonGroup, ToggleButton } from "react-bootstrap";

import OnlineForm from "./OnlineForm";
import OfflineForm from "./OfflineForm";
import QuotaCard from "./QuotaCard";

const HybridForm = ({ data, onChange, errors }) => {
    // Tab internal untuk memilih mana yang mau diedit (Online/Offline)
    const [currentType, setCurrentType] = useState("online");

    const typeOptions = [
        {
            name: "Online Detail",
            value: "online",
            icon: <Video size={18} className="me-2" />,
        },
        {
            name: "Offline Detail",
            value: "offline",
            icon: <MapPin size={18} className="me-2" />,
        },
    ];

    return (
        <div className="py-2">
            {/* Tipe Kehadiran Switcher */}
            <div
                className="mb-4 text-center"
                style={{
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: "1px #dee2e6 solid",
                }}
            >
                <ButtonGroup className="w-100">
                    {typeOptions.map((option, idx) => (
                        <ToggleButton
                            key={idx}
                            id={`hybrid-radio-${idx}`}
                            type="radio"
                            variant={
                                currentType === option.value
                                    ? "primary"
                                    : "outline-primary"
                            }
                            name="hybrid-tab"
                            value={option.value}
                            checked={currentType === option.value}
                            onChange={(e) =>
                                setCurrentType(e.currentTarget.value)
                            }
                            className="py-2 d-flex align-items-center justify-content-center border-0"
                        >
                            {option.icon}
                            {option.name}
                        </ToggleButton>
                    ))}
                </ButtonGroup>
            </div>

            {/* Form Konten Berdasarkan Tab yang Dipilih */}
            <div className="p-3 border rounded bg-light mb-4">
                {currentType === "online" ? (
                    <OnlineForm
                        data={data}
                        onChange={onChange}
                        errors={errors}
                        isHybrid
                    />
                ) : (
                    <OfflineForm
                        data={data}
                        onChange={onChange}
                        errors={errors}
                        isHybrid
                    />
                )}
            </div>

            <hr className="my-4" />

            {/* Pengaturan Kuota Gabungan */}
            <h5 className="mb-3 text-dark font-semibold">
                Pengaturan Kapasitas (Hybrid)
            </h5>
            <Row className="mb-3">
                <Form.Group as={Col} md={6}>
                    <Form.Label className="small fw-bold text-muted">
                        Kuota Peserta Online
                    </Form.Label>
                    <Form.Control
                        type="number"
                        name="online_quota" // Sesuaikan dengan snake_case formData
                        placeholder="0"
                        value={data.online_quota}
                        onChange={onChange}
                        isInvalid={!!errors.online_quota}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.online_quota}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group as={Col} md={6}>
                    <Form.Label className="small fw-bold text-muted">
                        Kuota Peserta Offline
                    </Form.Label>
                    <Form.Control
                        type="number"
                        name="offline_quota" // Sesuaikan dengan snake_case formData
                        placeholder="0"
                        value={data.offline_quota}
                        onChange={onChange}
                        isInvalid={!!errors.offline_quota}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.offline_quota}
                    </Form.Control.Feedback>
                </Form.Group>
            </Row>

            {/* Visualisasi Kuota */}
            <QuotaCard
                onlineQuota={data.online_quota}
                offlineQuota={data.offline_quota}
            />
        </div>
    );
};

export default HybridForm;
