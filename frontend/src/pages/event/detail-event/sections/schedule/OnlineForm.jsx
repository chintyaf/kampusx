import React from "react";
import { Form, InputGroup, Row, Col, Card } from "react-bootstrap";
import { Video, MapPin, SquareCode, CheckCircle2 } from "lucide-react";
const OnlineForm = () => {
    return (
        <>
            <Row className="mb-3">
                <Form.Group as={Col} controlId="formGridEmail">
                    <Form.Label>Platform</Form.Label>
                    <Form.Control type="email" placeholder="Pilih Platform" />
                </Form.Group>

                <Form.Group as={Col} controlId="formGridPassword">
                    <Form.Label>Meeting Link</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="https://zoom.us/j/..."
                    />
                </Form.Group>
            </Row>

            <Row className="mb-3">
                <Form.Group as={Col} controlId="formGridEmail">
                    <Form.Label>Passcode / Password (Optional)</Form.Label>
                    <Form.Control type="email" placeholder="e.g. conf2026" />
                </Form.Group>

                <Form.Group as={Col} controlId="formGridPassword">
                    <Form.Label>Meeting ID (Optional)</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="e.g. 123 456 7890"
                    />
                </Form.Group>
            </Row>

            <Form.Group className="mb-3" controlId="formGridAddress1">
                <Form.Label>Link Materi/Drive (Optional)</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="https://drive.google.com/..."
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Catatan untuk Peserta (Optional)</Form.Label>
                <Form.Control as="textarea" rows={3} />
            </Form.Group>
        </>
    );
};

export default OnlineForm;
