import React, { useState, useEffect } from "react";
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

import ScheduleTable from "./schedule/ScheduleTable";
import EventLayout from "../EventLayout";

const FooterSummary = () => {
    return (
        <>
            <Card.Footer
                className="bg-white p-4 border-top mt-4"
                style={{ border: "1px var(--color-border) solid" }}
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
                            {/* <div className="border-start ps-4">
                                <h5 className="mb-0 fw-bold text-dark">550</h5>
                                <small className="text-muted">
                                    Total Kuota
                                </small>
                            </div> */}
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

const EventAgenda = () => {
    // Mock data awal berdasarkan gambar
    const [sessions, setSessions] = useState([]);

    // 1. Tambahkan state untuk Tanggal Mulai dan Tanggal Berakhir
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [totalDays, setTotalDays] = useState(1); // Default minimal 1 hari

    // 2. Gunakan useEffect untuk menghitung selisih hari setiap kali tanggal berubah
    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Pastikan end date tidak lebih kecil dari start date
            if (end >= start) {
                const diffTime = Math.abs(end - start);
                // Konversi milidetik ke hari (1000ms * 60d * 60m * 24j)
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Ditambah 1 agar inklusif (Misal: 10 Jan s/d 10 Jan = 1 Hari)
                setTotalDays(diffDays + 1);
            } else {
                setTotalDays(1);
            }
        } else {
            setTotalDays(1);
        }
    }, [startDate, endDate]);

    return (
        <>
            <EventLayout
                heading="Schedule Breakdown"
                subheading={
                    "Susun jadwal detail per hari dan sesi menggunakan matriks waktu"
                }
            >
                <Form>
                    <Form.Group
                        as={Col}
                        controlId="formGridTimezone"
                        className="mb-4"
                    >
                        <Form.Label>Zona Waktu</Form.Label>
                        <Form.Select aria-label="Pilih Zona Waktu Indonesia">
                            <option value="">Pilih Zona Waktu</option>
                            <option value="WIB">
                                WIB - Waktu Indonesia Barat (UTC+7)
                            </option>
                            <option value="WITA">
                                WITA - Waktu Indonesia Tengah (UTC+8)
                            </option>
                            <option value="WIT">
                                WIT - Waktu Indonesia Timur (UTC+9)
                            </option>
                        </Form.Select>
                        <Form.Text className="text-muted">
                            Penting jika peserta berasal dari berbagai zona
                            waktu.
                        </Form.Text>
                    </Form.Group>

                    <Row className="mb-4">
                        <Form.Group as={Col} className="">
                            <Form.Label>Tanggal Mulai</Form.Label>
                            <Form.Control
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            ></Form.Control>
                        </Form.Group>
                        <Form.Group as={Col} className="">
                            <Form.Label>Tanggal Berakhir</Form.Label>
                            <Form.Control
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            ></Form.Control>
                        </Form.Group>
                    </Row>

                    {/* Tabel */}
                    <ScheduleTable
                        sessions={sessions}
                        setSessions={setSessions}
                        totalDays={totalDays}
                    />

                    <FooterSummary />
                </Form>
            </EventLayout>
        </>
    );
};

export default EventAgenda;
