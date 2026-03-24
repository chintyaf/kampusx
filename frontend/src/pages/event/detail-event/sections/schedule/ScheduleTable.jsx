import React, { useState, useEffect } from "react";
import {
    Form,
    Table,
    Button,
    Badge,
    Row,
    Col,
    InputGroup,
} from "react-bootstrap";
import { Lock, X, Plus } from "lucide-react";

// 1. Tambahkan prop sessionData dan onSave
const ScheduleForm = ({ onClose, totalDays, sessionData, onSave }) => {
    // 2. Buat state lokal untuk menampung nilai inputan form
    // Inisialisasi dengan data sesi yang sedang diklik (sessionData)
    const [formData, setFormData] = useState({
        day: sessionData.day || 1,
        title:
            sessionData.title === "Sesi Baru (Belum Disimpan)"
                ? ""
                : sessionData.title || "",
        startTime: sessionData.time ? sessionData.time.split("–")[0] : "",
        endTime: sessionData.time ? sessionData.time.split("–")[1] : "",
        quota: sessionData.quota || 0,
        // Kita juga menyimpan nilai lain agar tidak hilang saat di-save
        id: sessionData.id,
        session: sessionData.session,
        prerequisite: sessionData.prerequisite,
        location: sessionData.location,
    });

    // 3. Fungsi untuk meng-handle perubahan input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // 4. Fungsi saat tombol Simpan diklik
    const handleSubmit = () => {
        // Gabungkan startTime dan endTime menjadi format "HH:MM–HH:MM"
        let timeString = "";
        if (formData.startTime && formData.endTime) {
            timeString = `${formData.startTime}–${formData.endTime}`;
        } else if (formData.startTime) {
            timeString = formData.startTime;
        }

        // Siapkan objek data yang sudah diupdate
        const updatedSession = {
            ...formData,
            day: parseInt(formData.day), // Pastikan day berupa angka
            quota: parseInt(formData.quota), // Pastikan quota berupa angka
            time: timeString,
            title: formData.title || "Sesi Tanpa Judul", // Beri fallback jika kosong
        };

        // Panggil fungsi onSave yang dikirim dari parent
        onSave(updatedSession);
    };

    return (
        <div className="p-3 bg-light rounded border">
            <Form>
                <Form.Group controlId="formDaySelection" className="mb-4">
                    <Form.Label>Pilih Hari</Form.Label>
                    <Form.Select
                        name="day"
                        value={formData.day}
                        onChange={handleChange}
                    >
                        {[...Array(totalDays)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                                Hari ke-{i + 1}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group controlId="formAgenda" className="mb-4">
                    <Form.Label>Judul/Agenda Sesi</Form.Label>
                    <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Misal: Pembukaan Materi"
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formTimeRange">
                    <Form.Label>Rentang Waktu</Form.Label>
                    <InputGroup>
                        <Form.Control
                            className="no-clock"
                            type="time"
                            name="startTime"
                            aria-label="Waktu Mulai"
                            value={formData.startTime}
                            onChange={handleChange}
                        />
                        <InputGroup.Text>-</InputGroup.Text>
                        <Form.Control
                            className="no-clock"
                            type="time"
                            name="endTime"
                            aria-label="Waktu Selesai"
                            value={formData.endTime}
                            onChange={handleChange}
                        />
                    </InputGroup>
                </Form.Group>

                {/* <Form.Group controlId="formQuota">
                    <Form.Label>Kuota</Form.Label>
                    <Form.Control
                        type="number"
                        name="quota"
                        value={formData.quota}
                        onChange={handleChange}
                        placeholder="150"
                    />
                </Form.Group> */}

                <div className="d-flex gap-2 justify-content-end">
                    <Button variant="secondary" onClick={onClose}>
                        Batal
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        Simpan Sesi
                    </Button>
                </div>
            </Form>
        </div>
    );
};

const ScheduleTable = ({ sessions, setSessions, totalDays = 1 }) => {
    // Beri default totalDays = 1
    const [activeRow, setActiveRow] = useState(null);

    const handleAddSession = () => {
        // Cari nomor sesi terakhir untuk hari ke-1, atau default ke 1 jika kosong
        const sessionsInDay1 = sessions.filter((s) => s.day === 1);
        const nextSessionNum =
            sessionsInDay1.length > 0
                ? Math.max(...sessionsInDay1.map((s) => s.session)) + 1
                : 1;

        const newSession = {
            id: Date.now(),
            day: 1,
            session: nextSessionNum,
            time: "",
            title: "Sesi Baru (Belum Disimpan)",
            prerequisite: null,
            location: "—",
            quota: 0,
        };

        setSessions([...sessions, newSession]);
        setActiveRow(newSession.id);
    };

    // 5. Buat fungsi untuk menerima data dari Form dan mengupdate state sessions
    const handleSaveSession = (updatedSession) => {
        // Update array sessions
        const updatedSessionsList = sessions.map((session) =>
            session.id === updatedSession.id ? updatedSession : session,
        );

        // (Opsional tapi disarankan) Mengurutkan ulang tabel berdasarkan Hari dan Waktu Mulai
        updatedSessionsList.sort((a, b) => {
            if (a.day !== b.day) return a.day - b.day;

            // Urutkan berdasarkan waktu mulai jika hari sama
            const timeA = a.time ? a.time.split("–")[0] : "23:59";
            const timeB = b.time ? b.time.split("–")[0] : "23:59";
            return timeA.localeCompare(timeB);
        });

        // Hitung ulang nomor sesi (session: 1, 2, 3...) per hari setelah diurutkan
        let currentDay = 0;
        let sessionCounter = 1;

        const finalSessionsList = updatedSessionsList.map((session) => {
            if (session.day !== currentDay) {
                currentDay = session.day;
                sessionCounter = 1;
            } else {
                sessionCounter++;
            }
            return { ...session, session: sessionCounter };
        });

        setSessions(finalSessionsList);
        setActiveRow(null); // Tutup form setelah save
    };

    // Fungsi untuk menghapus baris (Opsional, tambahan karena ada icon 'X' di tabel)
    const handleDeleteSession = (idToDelete, e) => {
        e.stopPropagation(); // Mencegah baris terpilih (form terbuka) saat klik X
        const filteredSessions = sessions.filter((s) => s.id !== idToDelete);
        setSessions(filteredSessions);
    };

    return (
        <>
            {sessions && sessions.length > 0 ? (
                <>
                    <Table
                        responsive
                        // hover
                        className="align-middle border rounded-2"
                    >
                        <thead className="bg-light">
                            <tr className="text-muted small">
                                <th>Hari</th>
                                <th>Sesi</th>
                                <th>Waktu</th>
                                <th>Agenda / Judul</th>
                                <th>
                                    <Lock size={14} className="me-1" />{" "}
                                    Prasyarat
                                </th>
                                <th>Lokasi</th>
                                <th>Kuota</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map((s, idx) => {
                                const showDay =
                                    idx === 0 ||
                                    sessions[idx - 1].day !== s.day;

                                return (
                                    <React.Fragment key={s.id}>
                                        <tr
                                            style={{ cursor: "pointer" }}
                                            onClick={() => setActiveRow(s.id)}
                                            // Beri highlight ringan jika baris sedang diedit
                                            className={
                                                activeRow === s.id
                                                    ? "bg-light"
                                                    : ""
                                            }
                                        >
                                            <td>
                                                {showDay && (
                                                    <span className="small fw-semibold text-muted">
                                                        Hari {s.day}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="text-muted small">
                                                Sesi {s.session}
                                            </td>
                                            <td className="small">{s.time}</td>
                                            <td className="fw-medium">
                                                {s.title}
                                            </td>
                                            <td>
                                                {s.prerequisite && (
                                                    <Badge
                                                        bg="warning"
                                                        text="dark"
                                                        className="fw-normal rounded-pill px-3"
                                                    >
                                                        <Lock
                                                            size={12}
                                                            className="me-1"
                                                        />{" "}
                                                        {s.prerequisite}
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="text-muted">
                                                {s.location}
                                            </td>
                                            <td className="fw-semibold">
                                                {s.quota}
                                            </td>
                                            <td className="text-end">
                                                <X
                                                    size={18}
                                                    className="text-danger"
                                                    style={{
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={(e) =>
                                                        handleDeleteSession(
                                                            s.id,
                                                            e,
                                                        )
                                                    } // Pasang fungsi delete
                                                />
                                            </td>
                                        </tr>

                                        {/* Form Edit / Isi Data */}
                                        {activeRow === s.id && (
                                            <tr>
                                                <td
                                                    colSpan={8}
                                                    className="p-0 border-0"
                                                >
                                                    <ScheduleForm
                                                        totalDays={totalDays}
                                                        sessionData={s} // 6. Oper data baris ini ke form
                                                        onSave={
                                                            handleSaveSession
                                                        } // 7. Oper fungsi save
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
                </>
            ) : (
                <>
                    {/* Tampilan jika data kosong */}
                    <div className="text-center p-5 border rounded-3 bg-light text-muted">
                        <i className="bi bi-calendar-x fs-1 mb-3 d-block"></i>
                        <h6 className="fw-semibold mb-1">
                            Data belum ditambahkan
                        </h6>
                        <p className="small mb-0">
                            Silakan tambah sesi jadwal terlebih dahulu.
                        </p>
                    </div>
                </>
            )}

            <div className="d-flex gap-3 mt-4">
                <Button
                    variant="outline-secondary"
                    className="rounded-3 border-dashed px-4 py-2 border-2 d-flex align-items-center gap-2 small fw-bold"
                    onClick={handleAddSession}
                >
                    <Plus size={18} /> Tambah Sesi
                </Button>
            </div>
        </>
    );
};

export default ScheduleTable;
