import React, { useState } from "react";
import EventLayout from "../EventLayout";
import { Form, Row, Col, Badge, Button, Card, Collapse } from "react-bootstrap";
import Select from "react-select";
import { User, Link as LinkIcon, Pin, Pencil, Trash2 } from "lucide-react";

const SpeakerForm = () => {
    const kategori_options = [
        { value: "1", label: "Satu" },
        { value: "2", label: "Dua" },
        { value: "3", label: "Tiga" },
    ];
    return (
        <Form>
                        <h6>Tambah Speaker Baru</h6>           
            <Row>
                                <Col className="col-1">Test</Col>               
                <Col>
                                       
                    {/* Baris 1: Nama Lengkap & Gelar/Jabatan */}               
                       
                    <Row className="mb-3">
                                               
                        <Form.Group as={Col} md={6} controlId="formSpeakerName">
                                                       
                            <Form.Label>Nama Lengkap *</Form.Label>             
                                         
                            <Form.Control
                                type="text"
                                placeholder="Contoh: Budi Santoso, S.Kom"
                            />
                                                   
                        </Form.Group>
                                               
                        <Form.Group as={Col} md={6} controlId="formTitle">
                                                       
                            <Form.Label>Jabatan / Keahlian *</Form.Label>       
                                               
                            <Form.Control
                                type="text"
                                placeholder="Contoh: Senior AI Developer"
                            />
                                                   
                        </Form.Group>
                                           
                    </Row>
                                        {/* Baris 2: Bio */}                   
                    <Form.Group className="mb-3">
                                               
                        <Form.Label>Biografi Singkat</Form.Label>               
                               
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Tuliskan latar belakang singkat pembicara..."
                        />
                                           
                    </Form.Group>
                                        {/* Baris 3: LinkedIn & Kategori */}   
                                   
                    <Row className="mb-3">
                                               
                        <Form.Group as={Col} md={6} controlId="formLinkedIn">
                                                       
                            <Form.Label>URL LinkedIn</Form.Label>               
                                       
                            <Form.Control
                                type="text"
                                placeholder="Contoh: https://linkedin.com/in/username"
                            />
                                                   
                        </Form.Group>
                                               
                        <Form.Group as={Col} md={6}>
                                                       
                            <Form.Label>Kategori</Form.Label>                   
                                   
                            <Select
                                isMulti
                                options={kategori_options}
                                placeholder="Pilih kategori..."
                                className="basic-multi-select"
                                classNamePrefix="select"
                            />
                                                   
                        </Form.Group>
                                           
                    </Row>
                                        {/* Baris 4: Penempatan Sesi */}       
                               
                    <Form.Group className="mb-3">
                                               
                        <Form.Label>Tugaskan ke Sesi</Form.Label>               
                               
                        <Select
                            isMulti
                            options={kategori_options}
                            placeholder="Pilih satu atau beberapa sesi..."
                            className="basic-multi-select"
                            classNamePrefix="select"
                        />
                                           
                    </Form.Group>
                                   
                </Col>
                           
            </Row>
                       
            <div className="d-flex gap-2">
                                <Button>Batal</Button>               
                <Button>Simpan</Button>           
            </div>
                   
        </Form>
    );
};

const SpeakerCard = ({
    name,
    role,
    tags,
    linkedin,
    session,
    onEdit,
    onDelete,
}) => {
    return (
        <Card
            className="shadow-sm border-0 rounded-4 p-3 mb-3"
            style={{ backgroundColor: "#fff" }}
        >
                       
            <Card.Body className="p-0">
                               
                <Row className="align-items-start g-3">
                                        {/* Avatar Section */}                 
                     
                    <Col xs="auto">
                                               
                        <div
                            className="bg-light d-flex align-items-center justify-content-center rounded-circle border"
                            style={{ width: "70px", height: "70px" }}
                        >
                                                       
                            <User
                                size={35}
                                strokeWidth={1.5}
                                className="text-secondary opacity-50"
                            />
                                                   
                        </div>
                                           
                    </Col>
                                        {/* Info Section */}                   
                    <Col className="flex-grow-1">
                                               
                        <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                                                       
                            <h5
                                className="mb-0 fw-bold text-dark"
                                style={{ letterSpacing: "-0.3px" }}
                            >
                                                                {name}         
                                                 
                            </h5>
                                                       
                            <div className="d-flex gap-1">
                                                               
                                {tags &&
                                    tags.map((tag, index) => (
                                        <Badge
                                            key={index}
                                            pill
                                            className="bg-primary bg-opacity-10 text-primary fw-medium px-3 py-1 border-0"
                                            style={{ fontSize: "0.75rem" }}
                                        >
                                                                               
                                                    {tag}                       
                                                           
                                        </Badge>
                                    ))}
                                                           
                            </div>
                                                   
                        </div>
                                               
                        <p
                            className="text-muted mb-2"
                            style={{ fontSize: "0.9rem" }}
                        >
                                                        {role}                 
                                 
                        </p>
                                               
                        <a
                            href={`https://${linkedin}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-decoration-none d-flex align-items-center text-primary fw-medium"
                            style={{ fontSize: "0.85rem" }}
                        >
                                                       
                            <LinkIcon size={14} className="me-1" />             
                                          {linkedin}                       
                        </a>
                                           
                    </Col>
                                        {/* Action & Session Section */}       
                               
                    <Col
                        xs={12}
                        md="auto"
                        className="d-flex flex-column align-items-md-end justify-content-between h-100"
                    >
                                               
                        <div
                            className="px-3 py-1 rounded-3 border bg-light text-dark d-flex align-items-center mb-4"
                            style={{ fontSize: "0.8rem", fontWeight: "500" }}
                        >
                                                       
                            <Pin
                                size={14}
                                className="text-danger me-2"
                                fill="currentColor"
                            />
                                                        {session}               
                                   
                        </div>
                                               
                        <div className="d-flex gap-3 mt-auto">
                                                       
                            <Button
                                variant="link"
                                onClick={onEdit}
                                className="p-0 text-decoration-none text-primary fw-bold d-flex align-items-center gap-1"
                                style={{ fontSize: "0.9rem" }}
                            >
                                                                Edit            
                                               
                            </Button>
                                                       
                            <Button
                                variant="link"
                                onClick={onDelete}
                                className="p-0 text-decoration-none text-danger fw-bold d-flex align-items-center gap-1"
                                style={{ fontSize: "0.9rem" }}
                            >
                                                                Hapus          
                                                 
                            </Button>
                                                   
                        </div>
                                           
                    </Col>
                                   
                </Row>
                           
            </Card.Body>
                   
        </Card>
    );
};

const EventSpeakerList = () => {
    const [showForm, setShowForm] = useState(false);

    return (
        <EventLayout title="Tambah Pembicara">
                       
            <div>
                                <h1></h1>               
                <SpeakerCard
                    name="Dr. Andi Pratama"
                    role="AI Researcher"
                    tags={["AI", "Machine Learning"]}
                    linkedin="linkedin.com/in/drandipratama"
                    session="Session 2 — Workshop AI"
                    onDelete={() => console.log("Dihapus!")}
                />
                               
                <SpeakerCard
                    name="Dr. Andi Pratama"
                    role="AI Researcher"
                    tags={["AI", "Machine Learning"]}
                    linkedin="linkedin.com/in/drandipratama"
                    session="Session 2 — Workshop AI"
                    onDelete={() => console.log("Dihapus!")}
                />
                               
                {showForm ? (
                    <Collapse in={showForm}>
                                               
                        <div>
                                                        <SpeakerForm />         
                                         
                        </div>
                                           
                    </Collapse>
                ) : (
                    <Button onClick={() => setShowForm(true)}>
                                                Tambah Speaker                  
                         
                    </Button>
                )}
                           
            </div>
                   
        </EventLayout>
    );
};

export default EventSpeakerList;
