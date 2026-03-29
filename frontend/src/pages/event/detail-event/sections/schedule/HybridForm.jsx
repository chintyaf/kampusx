import React, { useState } from "react";
import { Video, MapPin, Users, Globe } from "lucide-react";
import {
    Form,
    Row,
    Col,
    ButtonGroup,
    ToggleButton,
    Card,
} from "react-bootstrap";

import OnlineForm from "./OnlineForm";
import OfflineForm from "./OfflineForm";
import QuotaCard from "./QuotaCard";

const HybridForm = ({ data, onChange }) => {
    const [currentType, setCurrentType] = useState("online");
    const [quota, setQuota] = useState({ online: 0, offline: 0 });

    const typeOptions = [
        {
            name: "Online",
            value: "online",
            icon: <Video size={18} className="me-2" />,
        },
        {
            name: "Offline",
            value: "offline",
            icon: <MapPin size={18} className="me-2" />,
        },
    ];

    return (
        <>
            <div className="py-2">
                {/* Tipe Kehadiran Switcher */}
                <div
                    className="mb-4 text-center"
                    style={{
                        borderRadius: "10px",
                        overflow: "hidden",
                        border: "1px black solid",
                    }}
                >
                    <ButtonGroup
                        className="w-100"
                        style={{ borderRadius: "10px", overflow: "hidden" }}
                    >
                        {typeOptions.map((option, idx) => (
                            <ToggleButton
                                key={idx}
                                id={`radio-${idx}`}
                                type="radio"
                                variant={
                                    currentType === option.value
                                        ? "primary"
                                        : "outline-primary"
                                }
                                name="radio"
                                value={option.value}
                                checked={currentType === option.value}
                                onChange={(e) =>
                                    setCurrentType(e.currentTarget.value)
                                }
                                className="py-2 d-flex align-items-center justify-content-center"
                            >
                                {option.icon}
                                {option.name}
                            </ToggleButton>
                        ))}
                    </ButtonGroup>
                </div>

                {/* Form Berdasarkan Tipe Kehadiran */}
                {currentType === "online" && (
                    <OnlineForm data={data} onChange={onChange} />
                )}
                {currentType === "offline" && (
                    <OfflineForm data={data} onChange={onChange} />
                )}
                <hr />

                <Row className="mb-3">
                    <Form.Group as={Col} md={6} controlId="formVenueName">
                        <Form.Label className="small fw-bold text-muted">
                            Kuota Online
                        </Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g. 100 orang"
                            value={data.onlineQuota}
                            onChange={onChange}
                        />
                    </Form.Group>

                    <Form.Group as={Col} md={6} controlId="formRoomName">
                        <Form.Label className="small fw-bold text-muted">
                            Kuota Offline
                        </Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g. 50 orang"
                            value={data.offlineQuota}
                            onChange={onChange}
                        />
                    </Form.Group>
                </Row>

                <QuotaCard
                    onlineQuota={quota.onlineQuota}
                    offlineQuota={quota.offlineQuota}
                />
            </div>
        </>
    );
};

export default HybridForm;
