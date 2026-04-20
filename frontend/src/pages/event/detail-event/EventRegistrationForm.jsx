import React, { useState } from "react";
import {
    Container,
    Card,
    Form,
    Row,
    Col,
    Button,
    Badge,
} from "react-bootstrap";
import { List, Type, ChevronDown, Plus } from "lucide-react";
import EventLayout from "../../../layouts/EventLayout";
const EventRegistrationForm = () => {
    const [questions, setQuestions] = useState([
        { id: 4, label: "Ukuran Baju", type: "dropdown", required: false },
    ]);

    return (
        <EventLayout
            heading={"Custom Checkout Questions"}
            subheading={"Buat pertanyaan tambahan saat peserta checkout."}
            nextPath={"tiket"}
            prevPath={"pembicara"}
        >
            <Form className="py-4">
                {/* Preview */}
                <Card className="mb-4 p-3">
                    <p className="mb-3 fw-semibold">Preview Form Checkout</p>

                    {questions.map((q) => (
                        <Form.Group
                            className="mb-3 d-flex align-items-center"
                            key={q.id}
                        >
                            <div className="me-2 p-2 bg-light rounded">
                                {q.type === "text" ? (
                                    <Type size={16} />
                                ) : (
                                    <ChevronDown size={16} />
                                )}
                            </div>

                            <Form.Control
                                placeholder={`${q.label}${q.required ? " *" : ""}`}
                                disabled
                            />
                        </Form.Group>
                    ))}
                </Card>

                {/* List Question */}
                {questions.map((q, index) => (
                    <Card key={q.id} className="mb-3 p-3">
                        <Row className="align-items-center">
                            <Col
                                md={6}
                                className="d-flex align-items-center gap-3"
                            >
                                <List size={18} />
                                <Badge bg="light" text="dark">
                                    {index + 1}
                                </Badge>

                                <div className="p-2 bg-light rounded">
                                    {q.type === "text" ? (
                                        <Type size={16} />
                                    ) : (
                                        <ChevronDown size={16} />
                                    )}
                                </div>

                                <span>{q.label}</span>
                            </Col>

                            <Col md={6} className="text-end">
                                <Badge bg="secondary" className="me-2">
                                    {q.type === "text" ? "Text" : "Dropdown"}
                                </Badge>

                                <Badge
                                    bg={q.required ? "danger" : "secondary"}
                                    className="me-3"
                                >
                                    {q.required ? "Required" : "Optional"}
                                </Badge>

                                <Button variant="link" className="me-2">
                                    Edit
                                </Button>
                                <Button variant="link" className="text-danger">
                                    Hapus
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                ))}

                {/* Add Button */}
                <div className="d-grid mt-4">
                    <Button variant="outline-secondary">
                        <Plus size={16} className="me-2" />
                        Add Question
                    </Button>
                </div>
            </Form>
        </EventLayout>
    );
};

export default EventRegistrationForm;
