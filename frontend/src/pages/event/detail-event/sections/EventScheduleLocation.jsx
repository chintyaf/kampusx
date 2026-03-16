import React from "react";
import { useState } from "react";
import { Form, InputGroup } from "react-bootstrap";
import Select from "react-select";
import EventLayout from "../EventLayout";

const EventScheduleLocation = () => {
    return (
        <EventLayout title="Informasi Utama Event" nextPath="event/create/">
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

export default EventScheduleLocation;
