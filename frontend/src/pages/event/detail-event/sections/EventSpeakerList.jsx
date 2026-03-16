import React from "react";
import EventLayout from "../EventLayout";
import { Form, Container, Button, InputGroup } from "react-bootstrap";

const EventSpeakerList = () => {
    return (
        <EventLayout title="Daftar Pembicara">
            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Judul Event</Form.Label>
                <Form.Control
                    required
                    type="text"
                    placeholder="Contoh: KampusX Xtra Xplore Xperience"
                />
                <Form.Text className="text-muted">
                    We'll never share your email with anyone else.
                </Form.Text>
            </Form.Group>
        </EventLayout>
    );
};

export default EventSpeakerList;
