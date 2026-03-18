import React, { useState } from "react";
import {
    Form,
    Container,
    Card,
    Table,
    Button,
    Badge,
    Row,
    Col,
} from "react-bootstrap";
import {
    CheckCircle2,
    Info,
    Plus,
    Calendar,
    Lock,
    X,
    Link as LinkIcon,
} from "lucide-react";

import ScheduleTable from "./ScheduleTable";

const FooterSummary = () => {
    return (
        <>
            <Card.Footer
                className="bg-white p-4 border-top mt-3"
                style={{ border: "1px red solid" }}
            >
                <Row className="align-items-center">
                    <Col md={6}>
                        <div className="d-flex gap-5 text-center">
                            <div>
                                <h5 className="mb-0 fw-bold text-dark">2</h5>
                                <small className="text-muted">Hari</small>
                            </div>
                            <div className="border-start ps-4">
                                <h5 className="mb-0 fw-bold text-dark">3</h5>
                                <small className="text-muted">Sesi</small>
                            </div>
                            <div className="border-start ps-4">
                                <h5 className="mb-0 fw-bold text-dark">2</h5>
                                <small className="text-muted">
                                    Berprasyarat
                                </small>
                            </div>
                            <div className="border-start ps-4">
                                <h5 className="mb-0 fw-bold text-dark">550</h5>
                                <small className="text-muted">
                                    Total Kuota
                                </small>
                            </div>
                        </div>
                    </Col>
                    <Col md={6} className="text-end text-muted small">
                        3 dari 3 sesi terisi lengkap
                    </Col>
                </Row>
            </Card.Footer>
        </>
    );
};

const Step3_Schedule = () => {
    // Mock data awal berdasarkan gambar
    const [sessions, setSessions] = useState([
        {
            id: 1,
            day: 1,
            session: 1,
            time: "09:00–10:30",
            title: "Pembukaan & Materi 1",
            prerequisite: null,
            location: "—",
            quota: 200,
        },
        {
            id: 2,
            day: 1,
            session: 2,
            time: "10:45–12:00",
            title: "Workshop AI",
            prerequisite: "H1·S1",
            location: "—",
            quota: 200,
        },
        {
            id: 3,
            day: 2,
            session: 1,
            time: "13:00–15:00",
            title: "Career Talk",
            prerequisite: "H1·S2",
            location: "—",
            quota: 150,
        },
    ]);

    return (
        <Form>
            {/* Header Bagian */}
            <div className="mb-4 d-flex align-items-start">
                <div className="me-2 mt-1 text-success">
                    <CheckCircle2 size={24} fill="currentColor" color="white" />
                </div>
                <div>
                    <h5 className="fw-bold mb-1" style={{ fontSize: "1.1rem" }}>
                        Level 3 — Schedule Breakdown
                    </h5>
                    <p className="text-muted small mb-0">
                        Susun jadwal detail per hari dan sesi menggunakan
                        matriks waktu
                    </p>
                </div>
            </div>

            {/* Tabel */}
            <ScheduleTable sessions={sessions} setSessions={setSessions} />

            <FooterSummary />
        </Form>
    );
};

export default Step3_Schedule;
