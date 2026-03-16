import { React, useState } from "react";
import { Video, MapPin, SquareCode, CheckCircle2 } from "lucide-react";
import { Form, Row, Col, Card, Badge } from "react-bootstrap";
import { Map, Info } from "lucide-react";

import OnlineForm from "./OnlineForm";
import OfflineForm from "./OfflineForm";
import QuotaCard from "./QuotaCard";

const HybridForm = () => {
    const [currentType, setCurrentType] = useState("online");

    const [quota, setQuota] = useState({
        online: 0,
        offline: 0,
    });

    return (
        <>
            <Form.Group className="mb-3" controlId="formGridAddress1">
                {["radio"].map((type) => (
                    <div key={`inline-${type}`} className="mb-3">
                        <Form.Check
                            inline
                            label="Online"
                            name="group1"
                            type={type}
                            onChange={() => setCurrentType("online")}
                            id={`inline-${type}-1`}
                        />
                        <Form.Check
                            inline
                            label="Offline"
                            name="group1"
                            type={type}
                            onChange={() => setCurrentType("offline")}
                            id={`inline-${type}-2`}
                        />
                    </div>
                ))}
            </Form.Group>

            {currentType === "online" && <OnlineForm />}
            {currentType === "offline" && <OfflineForm />}

            <hr />

            <Row className="mb-3">
                <Form.Group as={Col} md={6} controlId="formVenueName">
                    <Form.Label className="small fw-bold text-muted">
                        Kuota Online
                    </Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="e.g. 100 orang"
                        value={quota.online}
                        onChange={(e) =>
                            setQuota({ ...quota, online: e.target.value })
                        }
                    />
                </Form.Group>

                <Form.Group as={Col} md={6} controlId="formRoomName">
                    <Form.Label className="small fw-bold text-muted">
                        Kuota Offline
                    </Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="e.g. 50 orang"
                        value={quota.offline}
                        onChange={(e) =>
                            setQuota({ ...quota, offline: e.target.value })
                        }
                    />
                </Form.Group>
            </Row>

            <QuotaCard
                onlineQuota={quota.online}
                offlineQuota={quota.offline}
            />
        </>
    );
};

export default HybridForm;
