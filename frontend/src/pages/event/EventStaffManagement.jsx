import React, { useState } from "react";
import {
    Form,
    Container,
    Button,
    Table,
    Badge,
    Card,
    Row,
    Col,
} from "react-bootstrap";
import {
    UserPlus,
    Mail,
    User,
    ShieldCheck,
    Trash2,
    MoreVertical,
} from "lucide-react";
import EventLayout from "./detail-event/EventLayout";
import FormHeading from "../../components/dashboard/FormHeading";

const EventStaffManagement = () => {
    // Data dummy untuk visualisasi tabel
    const [staffList, setStaffList] = useState([
        {
            id: 1,
            name: "Reverie Vale",
            email: "reverie@univ.ac.id",
            status: "Aktif",
        },
        {
            id: 2,
            name: "Galen Gale",
            email: "galen@univ.ac.id",
            status: "Pending",
        },
    ]);

    return (
        <EventLayout>
            <div className="d-flex justify-content-between align-items-center">
                <div>
                    <FormHeading
                        heading="Manajemen Staf Administrasi"
                        subheading="Kelola akses dan peran tim panitia Anda di sini."
                    />
                </div>
                <Button
                    variant="primary"
                    className="d-flex align-items-center gap-2"
                >
                    <UserPlus size={18} />
                    Tambah Staff
                </Button>
            </div>

            <Row className="mb-4">
                {/* Ringkasan Informasi untuk Organizer */}
                <Col md={4}>
                    <Card className="border-0 shadow-sm bg-light">
                        <Card.Body>
                            <div className="text-muted small uppercase fw-bold">
                                Total Staf
                            </div>
                            <h3 className="mb-0">{staffList.length} Orang</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm bg-light">
                        <Card.Body>
                            <div className="text-muted small uppercase fw-bold">
                                Undangan Pending
                            </div>
                            <h3 className="mb-0 text-warning">1 Orang</h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="border-1">
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3">Nama Staff</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th className="text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffList.map((staff) => (
                                <tr key={staff.id} className="align-middle">
                                    <td className="px-4">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="fw-semibold">
                                                {staff.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td>{staff.email}</td>
                                    <td>
                                        <Badge
                                            bg="info"
                                            className="fw-normal text-dark"
                                        >
                                            {staff.role}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge
                                            bg={
                                                staff.status === "Aktif"
                                                    ? "success"
                                                    : "secondary"
                                            }
                                        >
                                            {staff.status}
                                        </Badge>
                                    </td>
                                    <td className="text-center">
                                        <Button
                                            variant="link"
                                            className="text-danger p-0"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Info Tambahan untuk Organizer */}
            <div className="mt-4 p-3 border rounded bg-info-subtle text-info-emphasis small">
                <div className="d-flex gap-2">
                    <ShieldCheck size={16} />
                    <div>
                        <strong>Catatan Keamanan:</strong> Staf yang baru
                        ditambahkan akan menerima email instruksi aktivasi akun.
                        Pastikan role yang diberikan sesuai dengan tanggung
                        jawabnya.
                    </div>
                </div>
            </div>
        </EventLayout>
    );
};

export default EventStaffManagement;
