import React, { useState, useEffect } from "react";
import {
    Card,
    Row,
    Col,
    Button,
} from "react-bootstrap";
import { NavLink } from "react-router-dom";

const DashboardNoEvent = () => {
    return (
        <>
            <Card
                className="rounded-4 border shadow-sm"
                style={{ borderColor: "#e2e8f0" }}
            >
                <Card.Body className="p-4 p-md-5">
                    <Row className="g-4 align-items-stretch">
                        <Col md={6}>
                            <div
                                className="w-100 h-100 rounded-2"
                                style={{
                                    backgroundColor: "#d9d9d9",
                                    minHeight: "320px",
                                    border: "1px solid #767676",
                                }}
                            ></div>
                        </Col>

                        <Col
                            md={6}
                            className="d-flex flex-column justify-content-center"
                        >
                            <h6
                                className="fw-bold mb-4"
                                style={{ fontSize: "1.1rem", color: "#212529" }}
                            >
                                Yuk mulai! Siapkan acara pertamamu di KampusX...
                            </h6>
                            {/* ... (Kode step-step Anda sebelumnya) ... */}
                            <div>
                                <NavLink
                                    to="/organizer/buat-acara"
                                    className="text-decoration-none"
                                >
                                    <Button variant="primary">
                                        Buat Event +
                                    </Button>
                                </NavLink>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </>
    );
};

export default DashboardNoEvent;
