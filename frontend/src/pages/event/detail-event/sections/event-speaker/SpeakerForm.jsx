import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import Select from "react-select";
import { User } from "lucide-react";

import api from "../../../../../api/axios";
import { notify } from "../../../../../utils/notify"; // Pastikan path ini benar jika ingin pakai notify di sini

const SpeakerForm = ({ onCancel, onSave, initialData, eventId }) => {
    const isEdit = !!initialData;

    // Opsi dummy untuk kategori
    const kategori_options = [
        { value: "AI", label: "Artificial Intelligence" },
        { value: "Web", label: "Web Development" },
        { value: "Mobile", label: "Mobile Development" },
    ];

    const [sessionOptions, setSessionOptions] = useState([]);
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        role: "",
        linkedin: "",
        expertise: [],
        sessions: [],
    });

    // 1. Fetching Sesi dari API
    useEffect(() => {
        const fetchEventSession = async () => {
            if (!eventId) return;

            setIsLoadingSessions(true);
            try {
                const response = await api.get(
                    `event-dashboard/${eventId}/info-utama/session`,
                );
                const result = response.data;

                if (
                    (result.status === "success" || result.success) &&
                    result.data?.sessions
                ) {
                    const formattedSessions = result.data.sessions.map(
                        (session) => ({
                            value: session.id.toString(),
                            // Support 'name' atau 'title' sesuai struktur DB kamu
                            label:
                                session.name ||
                                session.title ||
                                `Sesi ${session.id}`,
                        }),
                    );
                    setSessionOptions(formattedSessions);
                }
            } catch (error) {
                console.error("Gagal mengambil data sesi:", error);
            } finally {
                setIsLoadingSessions(false);
            }
        };

        fetchEventSession();
    }, [eventId]);

    // 2. Mengisi form jika dalam mode Edit
    useEffect(() => {
        if (initialData) {
            let safeExpertise = [];
            if (Array.isArray(initialData.expertise)) {
                safeExpertise = initialData.expertise;
            } else if (typeof initialData.expertise === "string") {
                try {
                    safeExpertise = JSON.parse(initialData.expertise);
                } catch (error) {
                    safeExpertise = [];
                }
            }

            setFormData({
                name: initialData.name || "",
                role: initialData.role || "",
                linkedin: initialData.linkedin || "",
                expertise: safeExpertise.map((t) => {
                    if (typeof t === "string") return { value: t, label: t };
                    return {
                        value: t?.value || t?.id || "",
                        label: t?.label || t?.name || "",
                    };
                }),
                // Mapping sessions dari backend agar cocok dengan react-select
                sessions:
                    initialData.sessions && Array.isArray(initialData.sessions)
                        ? initialData.sessions.map((s) => {
                              if (
                                  typeof s === "string" ||
                                  typeof s === "number"
                              ) {
                                  return {
                                      value: s.toString(),
                                      label: `Sesi ${s}`,
                                  };
                              }
                              return {
                                  value: s?.id
                                      ? s.id.toString()
                                      : s?.value || "",
                                  label:
                                      s?.name ||
                                      s?.title ||
                                      s?.label ||
                                      `Sesi ${s?.id || ""}`,
                              };
                          })
                        : [],
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 3. Validasi Wajib Pilih Sesi (karena DB event_session_id tidak boleh null)
        if (!formData.sessions || formData.sessions.length === 0) {
            // Bisa pakai alert bawaan atau notify kamu
            alert(
                "Peringatan: Mohon pilih minimal satu sesi untuk pembicara ini.",
            );
            return;
        }

        const payload = {
            id: initialData?.id,
            name: formData.name,
            role: formData.role,
            linkedin: formData.linkedin,
            // Expertise dikirim sebagai array string biasa
            expertise: formData.expertise.map(
                (item) => item.label || item.value,
            ),
            // Sessions dikirim sebagai array of ID
            // PERBAIKAN DI SINI: Kirim object agar Card tau nama sesinya
            sessions: formData.sessions.map((item) => ({
                id: item.value,
                name: item.label,
            })),
        };

        onSave(payload);
    };

    return (
        <Form
            className="border rounded-4 p-4 bg-white mb-4 shadow-sm"
            onSubmit={handleSubmit}
        >
            <h6 className="fw-bold mb-4">
                {isEdit ? "Edit Speaker" : "Tambah Speaker Baru"}
            </h6>
            <Row>
                <Col className="col-1 d-none d-md-block text-center text-muted">
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
                <Col>
                    <Row className="mb-3">
                        <Form.Group as={Col} md={6}>
                            <Form.Label className="small fw-bold">
                                Nama Lengkap *
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Contoh: Budi Santoso, S.Kom"
                                required
                            />
                        </Form.Group>
                        <Form.Group as={Col} md={6}>
                            <Form.Label className="small fw-bold">
                                Jabatan / Keahlian *
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                placeholder="Contoh: Senior AI Developer"
                                required
                            />
                        </Form.Group>
                    </Row>

                    <Row>
                        <Form.Group as={Col} md={6}>
                            <Form.Label className="small fw-bold">
                                LinkedIn URL
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="linkedin"
                                value={formData.linkedin}
                                onChange={handleChange}
                                placeholder="Contoh: linkedin.com/in/budisantoso"
                            />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3">
                            <Form.Label className="small fw-bold">
                                Expertise Tags
                            </Form.Label>
                            <Select
                                isMulti
                                value={formData.expertise}
                                onChange={(selected) =>
                                    setFormData({
                                        ...formData,
                                        expertise: selected || [],
                                    })
                                }
                                options={kategori_options}
                                placeholder="Pilih Tag Keahlian..."
                                classNamePrefix="select form-select"
                            />
                        </Form.Group>
                    </Row>

                    <Form.Group>
                        <Form.Label className="small fw-bold">
                            Assign to Session *
                        </Form.Label>
                        <Select
                            isMulti
                            isLoading={isLoadingSessions}
                            isDisabled={isLoadingSessions}
                            value={formData.sessions}
                            onChange={(selected) =>
                                setFormData({
                                    ...formData,
                                    sessions: selected || [],
                                })
                            }
                            options={sessionOptions}
                            placeholder={
                                isLoadingSessions
                                    ? "Memuat sesi..."
                                    : "Pilih Sesi... (Wajib)"
                            }
                            classNamePrefix="select form-select"
                        />
                        {/* Pesan bantuan untuk user */}
                        <Form.Text className="text-muted small">
                            Pembicara harus di-assign minimal ke 1 sesi acara.
                        </Form.Text>
                    </Form.Group>
                </Col>
            </Row>

            <div className="d-flex gap-2 justify-content-end mt-4">
                <Button variant="light" onClick={onCancel} className="px-4">
                    Batal
                </Button>
                <Button
                    variant="primary"
                    type="submit"
                    className="px-4"
                    disabled={isLoadingSessions}
                >
                    {isEdit ? "Simpan Perubahan" : "Simpan Speaker"}
                </Button>
            </div>
        </Form>
    );
};

export default SpeakerForm;
