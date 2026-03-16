import React from "react";
import {
    Form,
    Container,
    Button,
    InputGroup,
    FormGroup,
} from "react-bootstrap";
import EventLayout from "../EventLayout";

const EventRegistrationForm = () => {
    return (
        <EventLayout>
            <FormGroup className="mb-3" controlId="formBasicEmail">
                <Form.Label>Judul Event</Form.Label>
                <Form.Control
                    required
                    type="text"
                    placeholder="Contoh: KampusX Xtra Xplore Xperience"
                />
            </FormGroup>
        </EventLayout>
    );
};

export default EventRegistrationForm;
