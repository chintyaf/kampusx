import React, { useState } from "react";
import { Form, Button, InputGroup, Table, Card } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";

import EventLayout from "../../../layouts/EventLayout";
import api from "../../../api/axios"; 
import { notify } from "../../../utils/notify";

let _id = 0;
const newTicket = () => ({
    id: ++_id,
    name: "",
    is_free: true,
    price: "",
    capacity: "",
    sale_start: "",
    sale_end: "",
});

const EventTicket = () => {
    const { eventId } = useParams();
    const [tickets, setTickets] = useState([newTicket()]);

    const add = () => setTickets((p) => [...p, newTicket()]);
    const remove = (id) => setTickets((p) => p.filter((t) => t.id !== id));
    const update = (id, field, value) => {
        setTickets((p) =>
            p.map((t) => (t.id === id ? { ...t, [field]: value } : t))
        );
    };

    const handleSave = async () => {
        // Filter out empty tickets
        const valid = tickets.filter((t) => t.name.trim());
        
        console.log("Menyimpan tiket untuk event:", eventId, valid);

        if (valid.length === 0) {
             // Optional: warn the user that they haven't set up tickets?
             // But for now, we'll allow an empty list depending on business rules.
        }

        // TBD: Logic Simpan ke Backend diletakkan di sini
        // try {
        //     await api.post(`event-dashboard/${eventId}/info-utama/ticket`, { tickets: valid });
        //     notify("success", "Berhasil!", "Data tiket telah disimpan.");
        // } catch (error) {
        //     notify("error", "Gagal menyimpan", "Cek tabel dan form kembali.");
        //     throw error;
        // }
        
        return Promise.resolve();
    };

    return (
        <EventLayout
            heading="Jenis Tiket"
            subheading="Tambahkan satu atau beberapa jenis tiket untuk event ini."
            nextPath="preview"
            prevPath="formulir"
            onSave={handleSave}
        >
            <Card className="border rounded-4 shadow-sm mb-4">
                <Card.Body className="p-0 table-responsive">
                    {tickets.length === 0 ? (
                        <div className="text-center p-5 text-muted">
                            <p className="mb-0 small">Belum ada tiket. Klik "+ Tambah Jenis Tiket" untuk mulai.</p>
                        </div>
                    ) : (
                        <Table borderless responsive hover className="m-0 align-middle" style={{ minWidth: "800px" }}>
                            <thead className="bg-light border-bottom">
                                <tr>
                                    <th className="text-muted small fw-semibold text-uppercase px-3 py-2" style={{ width: '22%', letterSpacing: "0.04em" }}>Nama Tiket</th>
                                    <th className="text-muted small fw-semibold text-uppercase px-3 py-2" style={{ width: '12%', letterSpacing: "0.04em" }}>Kuota</th>
                                    <th className="text-muted small fw-semibold text-uppercase px-3 py-2" style={{ width: '25%', letterSpacing: "0.04em" }}>Tipe & Harga</th>
                                    <th className="text-muted small fw-semibold text-uppercase px-3 py-2" style={{ width: '18%', letterSpacing: "0.04em" }}>Mulai Jual</th>
                                    <th className="text-muted small fw-semibold text-uppercase px-3 py-2" style={{ width: '18%', letterSpacing: "0.04em" }}>Akhir Jual</th>
                                    <th className="text-muted small fw-semibold text-uppercase px-3 py-2 text-center" style={{ width: '5%', letterSpacing: "0.04em" }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((t, i) => (
                                    <tr key={t.id} className={i !== tickets.length - 1 ? "border-bottom" : ""}>
                                        <td className="px-3 py-3">
                                            <Form.Control
                                                type="text"
                                                size="sm"
                                                placeholder="Contoh: Early Bird"
                                                value={t.name}
                                                onChange={(e) => update(t.id, "name", e.target.value)}
                                            />
                                        </td>
                                        <td className="px-3 py-3">
                                            <Form.Control
                                                type="number"
                                                size="sm"
                                                placeholder="∞"
                                                min={1}
                                                value={t.capacity}
                                                onChange={(e) => update(t.id, "capacity", e.target.value)}
                                            />
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="d-flex gap-2 align-items-center">
                                                <Form.Select
                                                    size="sm"
                                                    style={{ width: t.is_free ? '100%' : '100px', flexShrink: 0 }}
                                                    value={t.is_free ? "true" : "false"}
                                                    onChange={(e) => update(t.id, "is_free", e.target.value === "true")}
                                                >
                                                    <option value="true">Gratis</option>
                                                    <option value="false">Berbayar</option>
                                                </Form.Select>
                                                
                                                {!t.is_free && (
                                                    <InputGroup size="sm" className="flex-grow-1">
                                                        <InputGroup.Text className="bg-light text-muted border-end-0">Rp</InputGroup.Text>
                                                        <Form.Control
                                                            type="number"
                                                            placeholder="50000"
                                                            min={0}
                                                            step={1000}
                                                            value={t.price}
                                                            onChange={(e) => update(t.id, "price", e.target.value)}
                                                            className="border-start-0 ps-0"
                                                        />
                                                    </InputGroup>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <Form.Control
                                                type="datetime-local"
                                                size="sm"
                                                value={t.sale_start}
                                                onChange={(e) => update(t.id, "sale_start", e.target.value)}
                                                className="text-muted"
                                            />
                                        </td>
                                        <td className="px-3 py-3">
                                            <Form.Control
                                                type="datetime-local"
                                                size="sm"
                                                value={t.sale_end}
                                                onChange={(e) => update(t.id, "sale_end", e.target.value)}
                                                className="text-muted"
                                            />
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm" 
                                                className="d-inline-flex align-items-center justify-content-center p-1 border-0 rounded"
                                                style={{ background: "#fff5f5" }}
                                                onClick={() => remove(t.id)}
                                                title="Hapus Tiket"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
                <Card.Footer className="bg-white border-0 px-4 py-3 d-flex align-items-center justify-content-between rounded-bottom-4">
                    <Button 
                        variant="link" 
                        className="text-decoration-none fw-semibold p-0 d-flex align-items-center gap-2" 
                        onClick={add}
                    >
                        <Plus size={16} /> Tambah Jenis Tiket
                    </Button>
                    {tickets.length > 0 && (
                        <span className="text-muted small fw-medium">{tickets.length} tiket</span>
                    )}
                </Card.Footer>
            </Card>
        </EventLayout>
    );
};

export default EventTicket;
