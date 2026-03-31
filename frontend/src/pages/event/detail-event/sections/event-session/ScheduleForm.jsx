import React, { useState, useEffect } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import Select from "react-select";

const ScheduleForm = ({
    onClose,
    totalDays,
    sessionData,
    onSave,
    allSessions,
}) => {
    // Initialize form data directly from the passed sessionData
    const [formData, setFormData] = useState({
        id: sessionData.id,
        day: sessionData.day || 1,
        title: sessionData.title || "",
        description: sessionData.description || "",
        startTime: sessionData.startTime || "",
        endTime: sessionData.endTime || "",
        prerequisites: sessionData.prerequisites || [],
        session: sessionData.session,
    });

    // Fallback: If startTime/endTime are empty but 'time' string exists (e.g., from old data)
    useEffect(() => {
        if (!formData.startTime && !formData.endTime && sessionData.time) {
            const timeParts = sessionData.time.split("–");
            if (timeParts.length === 2) {
                setFormData((prev) => ({
                    ...prev,
                    startTime: timeParts[0].trim(),
                    endTime: timeParts[1].trim(),
                }));
            }
        }
    }, [sessionData.time]);

    // Handle standard inputs (text, select, time)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle React-Select (Multi) for prerequisites
    const handlePrereqChange = (selectedOptions) => {
        const values = selectedOptions
            ? selectedOptions.map((opt) => opt.value)
            : [];
        setFormData((prev) => ({ ...prev, prerequisites: values }));
    };

    // Prepare and send data back to parent
    const handleSubmit = () => {
        // Ensure day is an integer
        const updatedSession = {
            ...formData,
            day: parseInt(formData.day, 10),
            title: formData.title.trim() || "Sesi Tanpa Judul",
            // Note: 'time' string generation is now handled cleanly in the parent (ScheduleTable)
        };

        onSave(updatedSession);
    };

    // Mapping prerequisites options (exclude the current session)
    const prereqOptions = allSessions
        .filter((s) => s.id !== formData.id)
        .map((s) => ({
            value: s.id,
            label: `Hari ${s.day} - ${s.title || "Sesi " + s.session}`,
        }));

    // Find the full objects for react-select based on the selected IDs
    const selectedPrereqs = prereqOptions.filter((opt) =>
        formData.prerequisites.includes(opt.value),
    );

    return (
        <div className="p-1">
            <Form.Group controlId="formDaySelection" className="mb-4">
                <Form.Label className="small fw-bold text-muted">
                    PILIH HARI
                </Form.Label>
                <Form.Select
                    name="day"
                    value={formData.day}
                    onChange={handleChange}
                    size="sm"
                >
                    {[...Array(totalDays)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                            Hari ke-{i + 1}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            <Form.Group controlId="formTitle" className="mb-4">
                <Form.Label className="small fw-bold text-muted">
                    JUDUL / AGENDA SESI
                </Form.Label>
                <Form.Control
                    type="text"
                    name="title"
                    size="sm"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Misal: Pembukaan Materi dan Keynote Speech"
                />
            </Form.Group>

            <Form.Group controlId="formDescription" className="mb-4">
                <Form.Label className="small fw-bold text-muted">
                    DESKRIPSI SESI (Opsional)
                </Form.Label>
                <Form.Control
                    as="textarea"
                    rows={2}
                    size="sm"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tambahkan detail kegiatan atau catatan untuk peserta..."
                />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formTimeRange">
                <Form.Label className="small fw-bold text-muted">
                    RENTANG WAKTU
                </Form.Label>
                <InputGroup size="sm">
                    <Form.Control
                        className="no-clock"
                        type="time"
                        name="startTime"
                        aria-label="Waktu Mulai"
                        value={formData.startTime}
                        onChange={handleChange}
                    />
                    <InputGroup.Text className="bg-light border-start-0 border-end-0 text-muted">
                        sampai
                    </InputGroup.Text>
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

            <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-muted">
                    PRASYARAT SESI
                </Form.Label>
                <Select
                    isMulti
                    name="prerequisites"
                    options={prereqOptions}
                    value={selectedPrereqs}
                    onChange={handlePrereqChange}
                    placeholder="Pilih sesi yang harus diikuti sebelumnya..."
                    className="basic-multi-select small"
                    classNamePrefix="select"
                    noOptionsMessage={() => "Tidak ada sesi lain yang tersedia"}
                />
                <Form.Text
                    className="text-muted"
                    style={{ fontSize: "0.75rem" }}
                >
                    Kosongkan jika peserta bisa mengikuti sesi ini secara
                    langsung.
                </Form.Text>
            </Form.Group>

            <div className="d-flex gap-2 justify-content-end mt-4 pt-3 border-top">
                <Button
                    variant="light"
                    size="sm"
                    onClick={onClose}
                    className="px-3 fw-medium"
                >
                    Batal
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSubmit}
                    className="px-4 fw-medium"
                >
                    Simpan Perubahan
                </Button>
            </div>
        </div>
    );
};

export default ScheduleForm;
