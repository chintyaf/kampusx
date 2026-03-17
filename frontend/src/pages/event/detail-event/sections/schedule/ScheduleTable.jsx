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
import DateRangePicker from "../../../../../components/form/DateRangePicker";

const ScheduleForm = ({ onClose }) => {
    return (
        <div>
            <Form>
                <Form.Group className="mb-3" controlId="formVenueName">
                    <Form.Label className="">Judul/Agenda Sesi</Form.Label>
                    <Form.Control type="text" placeholder="Pembukaan Materi" />
                </Form.Group>
                <Row className="mb-3">
                    <Form.Group as={Col} md={6} controlId="formVenueName">
                        <Form.Label className="">Waktu Mulai</Form.Label>
                        <Form.Control
                            type="time"
                            placeholder="Pembukaan Materi"
                        />
                    </Form.Group>
                    <Form.Group as={Col} md={6} controlId="formVenueName">
                        <Form.Label className="">Waktu Selesai</Form.Label>
                        <Form.Control
                            type="time"
                            placeholder="Pembukaan Materi"
                        />
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Group as={Col} md={6} controlId="formVenueName">
                        <Form.Label className="">Kuota</Form.Label>
                        <Form.Control type="number" placeholder="150" />
                    </Form.Group>
                </Row>

                <Form.Group>
                    <Form.Label>Prasyarat Kehadiran</Form.Label>
                </Form.Group>
                <Button onClick={onClose}>Close</Button>
            </Form>
        </div>
    );
};

const ScheduleTable = ({ sessions, setSessions }) => {
    const [activeRow, setActiveRow] = useState(null);

    const [showForm, setShowForm] = useState(false);

    const handleAddSession = () => {
        const lastSess = Math.max(...sessions.map((s) => s.session));
        const lastDay = Math.max(...sessions.map((s) => s.day));
        const newSess = lastSess + 1;
        const newSession = {
            id: Date.now(),
            day: lastDay,
            session: newSess,
            time: "",
            title: "",
            prerequisite: null,
            location: "",
            quota: 0,
        };

        setSessions([...sessions, newSession]);
        setActiveRow(newSession.id);
    };

    const handleAddDay = () => {
        const lastDay = Math.max(...sessions.map((s) => s.day));
        const newDay = lastDay + 1;

        const newSession = {
            id: Date.now(),
            day: newDay,
            session: 1,
            time: "",
            title: "",
            prerequisite: null,
            location: "",
            quota: 0,
        };

        setSessions([...sessions, newSession]);
        setActiveRow(newSession.id);
    };

    return (
        <>
            <Table responsive hover className="align-middle border-light">
                <thead className="bg-light">
                    <tr className="text-muted small">
                        <th>Hari</th>
                        <th>Sesi</th>
                        <th>Waktu</th>
                        <th>Agenda / Judul</th>
                        <th>
                            <Lock size={14} className="me-1" /> Prasyarat
                        </th>
                        <th>Lokasi</th>
                        <th>Kuota</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {sessions.map((s, idx) => {
                        // Logika untuk menampilkan nomor hari hanya di baris pertama tiap hari (Rowspan-like)
                        const showDay =
                            idx === 0 || sessions[idx - 1].day !== s.day;

                        return (
                            <React.Fragment key={s.id}>
                                <tr
                                    key={s.id}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => setActiveRow(s.id)}
                                >
                                    <td>
                                        {showDay && (
                                            <div className="d-flex align-items-center gap-2">
                                                <span className="small fw-semibold text-muted">
                                                    {s.day}
                                                </span>
                                            </div>
                                        )}  
                                    </td>
                                    <td className="text-muted small">
                                        Sesi {s.session}
                                    </td>
                                    <td className="small">{s.time}</td>
                                    <td className="fw-medium">{s.title}</td>
                                    <td>
                                        {s.prerequisite && (
                                            <Badge
                                                bg="warning"
                                                text="dark"
                                                className="fw-normal rounded-pill px-3"
                                                style={{
                                                    backgroundColor: "#fff8e6",
                                                    border: "1px solid #ffe58f",
                                                }}
                                            >
                                                <Lock
                                                    size={12}
                                                    className="me-1"
                                                />{" "}
                                                {s.prerequisite}
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="text-muted">{s.location}</td>
                                    <td className="fw-semibold">{s.quota}</td>
                                    <td className="text-end">
                                        <X
                                            size={18}
                                            className="text-light-emphasis"
                                            style={{ cursor: "pointer" }}
                                        />
                                    </td>
                                </tr>
                                {activeRow === s.id && (
                                    <tr>
                                        <td colSpan={8}>
                                            <ScheduleForm
                                                onClose={() =>
                                                    setActiveRow(null)
                                                }
                                            />
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </Table>

            {/* Action Buttons */}
            <div className="d-flex gap-3 mt-4">
                <Button
                    variant="outline-secondary"
                    className="rounded-3 border-dashed px-4 py-2 border-2 d-flex align-items-center gap-2 small fw-bold"
                    onClick={handleAddSession}
                >
                    <Plus size={18} /> Tambah Sesi
                </Button>
                <Button
                    variant="outline-secondary"
                    className="rounded-3 border-dashed px-4 py-2 border-2 d-flex align-items-center gap-2 small fw-bold"
                    onClick={handleAddDay}
                >
                    <Calendar size={18} /> Tambah Hari Baru
                </Button>
            </div>

            {showForm && <ScheduleForm onClose={() => setShowForm(false)} />}
        </>
    );
};

export default ScheduleTable;
