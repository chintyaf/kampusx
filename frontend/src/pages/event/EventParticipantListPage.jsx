import React, { useState } from "react";
import {
    Table,
    Badge,
    Button,
    InputGroup,
    Form,
    Dropdown,
    Card,
} from "react-bootstrap";
import {
    Search,
    Filter,
    MoreVertical,
    UserCheck,
    UserX,
    ExternalLink,
    Mail,
    Phone,
    School,
} from "lucide-react";
import FormHeading from "../../components/dashboard/FormHeading";

const EventParticipantListPage = () => {
    // Dummy Data berdasarkan skema DB kamu
    const [participants] = useState([
        {
            id: 1,
            name: "Alex Chandra",
            email: "alex@univ.ac.id",
            phone: "08123456789",
            university: "Universitas Indonesia",
            role: "participant",
            status: "active",
            is_verified: true,
            created_at: "2023-10-01",
        },
        {
            id: 2,
            name: "Siti Aminah",
            email: "siti@univ.ac.id",
            phone: "08571234432",
            university: "ITB",
            role: "participant",
            status: "active",
            is_verified: false,
            created_at: "2023-10-02",
        },
    ]);

    return (
        <div className="bg-light ">
            <FormHeading
                heading="Daftar Peserta Event"
                subheading={`Total: ${participants.length} Peserta Terdaftar`}
            />
            <Card className="=border-0 rounded-3">
                <Card.Body className="p-4">
                    {/* Header & Search */}
                    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                        <div className="d-flex gap-2">
                            <InputGroup style={{ maxWidth: "300px" }}>
                                <InputGroup.Text className="bg-white border-end-0">
                                    <Search size={18} className="text-muted" />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Cari nama atau email..."
                                    className="border-start-0 ps-0"
                                />
                            </InputGroup>
                            <Button
                                variant="outline-secondary"
                                className="d-flex align-items-center gap-2"
                            >
                                <Filter size={18} /> Filter
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-responsive">
                        <Table hover align="middle" className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="border-0">Nama & Email</th>
                                    <th className="border-0">Universitas</th>
                                    <th className="border-0">Kontak</th>
                                    <th className="border-0 text-center">
                                        Status
                                    </th>
                                    <th className="border-0 text-center">
                                        Verifikasi
                                    </th>
                                    <th className="border-0">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.map((user) => (
                                    <tr key={user.id} className="">
                                        <td className="">
                                            <div className="fw-bold text-dark">
                                                {user.name}
                                            </div>
                                            <div className="text-muted small d-flex align-items-center gap-1">
                                                <Mail size={12} /> {user.email}
                                            </div>
                                        </td>
                                        <td className="">
                                            <div className="d-flex align-items-center gap-2 text-secondary">
                                                <School size={16} />
                                                <span className="small">
                                                    {user.university}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="small text-dark d-flex align-items-center gap-1">
                                                <Phone size={12} /> {user.phone}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <Badge
                                                pill
                                                bg={
                                                    user.status === "active"
                                                        ? "success"
                                                        : "danger"
                                                }
                                                className="px-3 py-2 fw-medium"
                                                style={{
                                                    fontSize: "0.75rem",
                                                    opacity: 0.8,
                                                }}
                                            >
                                                {user.status.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="text-center">
                                            {user.is_verified ? (
                                                <UserCheck
                                                    size={20}
                                                    className="text-primary"
                                                    title="Verified"
                                                />
                                            ) : (
                                                <UserX
                                                    size={20}
                                                    className="text-muted"
                                                    title="Unverified"
                                                />
                                            )}
                                        </td>
                                        <td>
                                            <Dropdown align="end">
                                                <Dropdown.Toggle
                                                    variant="link"
                                                    className="text-muted p-0 no-caret"
                                                >
                                                    <MoreVertical size={20} />
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item
                                                        href="#/view"
                                                        className="d-flex align-items-center gap-2"
                                                    >
                                                        <ExternalLink
                                                            size={16}
                                                        />{" "}
                                                        Lihat Profil
                                                    </Dropdown.Item>
                                                    <Dropdown.Item
                                                        href="#/wa"
                                                        className="text-success d-flex align-items-center gap-2"
                                                    >
                                                        <Phone size={16} />{" "}
                                                        Hubungi WhatsApp
                                                    </Dropdown.Item>
                                                    <Dropdown.Divider />
                                                    <Dropdown.Item
                                                        href="#/suspend"
                                                        className="text-danger d-flex align-items-center gap-2"
                                                    >
                                                        <UserX size={16} />{" "}
                                                        Suspend User
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default EventParticipantListPage;
