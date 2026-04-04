import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Form } from "react-bootstrap";
import Select from "react-select";
import EventLayout from "../../../layouts/EventLayout";
import api from "../../../api/axios";
import { notify } from "../../../utils/notify";

// ICON
import { Image } from "lucide-react";

const EventGeneralInfo = () => {
    const { eventId } = useParams();
    const [errors, setErrors] = useState({});

    // ==========================================
    // 1. SATU STATE UNTUK SEMUA FORM (Lebih Rapi)
    // ==========================================
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        banner: null,
        kategori: [],
        eventType: [],
    });

    // STATE UNTUK OPTIONS (Data dari API)
    const [kategoriOptions, setKategoriOptions] = useState([]);
    const [eventTypeOptions, setEventTypeOptions] = useState([]);

    // ==========================================
    // 2. HANDLER UNTUK UBAH STATE
    // ==========================================
    // Untuk text input biasa (Title, Description)
    const handleTextChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Untuk Multi-Select (Kategori, Event Type)
    const handleSelectChange = (field, selectedOptions) => {
        setFormData((prev) => ({ ...prev, [field]: selectedOptions || [] }));
    };

    // Untuk File Upload (Banner)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData((prev) => ({ ...prev, banner: file }));
    };

    // ==========================================
    // 3. AMBIL DATA OPTIONS & DATA EVENT
    // ==========================================
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [kategoriRes, eventTypeRes] = await Promise.all([
                    api.get("/categories"),
                    api.get("/event-types"),
                ]);

                if (kategoriRes.data.success) {
                    setKategoriOptions(
                        kategoriRes.data.data.map((cat) => ({
                            value: cat.id.toString(),
                            label: cat.name,
                        })),
                    );
                }

                if (eventTypeRes.data.success) {
                    setEventTypeOptions(
                        eventTypeRes.data.data.map((type) => ({
                            value: type.id.toString(),
                            label: type.name,
                        })),
                    );
                }
            } catch (error) {
                console.error("Gagal mengambil opsi data:", error);
            }
        };

        fetchOptions();
    }, []);

    useEffect(() => {
        const fetchEventData = async () => {
            try {
                const response = await api.get(
                    `event-dashboard/${eventId}/info-utama`,
                );

                const result = response.data;

                if (result.status === "success") {
                    const data = result.data;
                    console.log("Data event yang diambil:", data);

                    // Langsung set semua data ke dalam satu state
                    setFormData((prev) => ({
                        ...prev,
                        title: data.title || "",
                        description: data.description || "",
                        kategori: data.tags_kategori
                            ? data.tags_kategori.map((cat) => ({
                                  value: cat.id.toString(),
                                  label: cat.name,
                              }))
                            : [],
                        eventType: data.event_types
                            ? data.event_types.map((type) => ({
                                  value: type.id.toString(),
                                  label: type.name,
                              }))
                            : [],
                    }));
                }
            } catch (error) {
                console.error("Gagal mengambil data event:", error);
            }
        };

        if (eventId) {
            fetchEventData();
        }
    }, [eventId]);

    // ==========================================
    // 4. SUBMIT DATA
    // ==========================================
    const handleUpdate = async () => {
        // Gunakan nama 'submitData' agar tidak bentrok dengan state 'formData'
        const submitData = new FormData();

        submitData.append("title", formData.title);
        submitData.append("description", formData.description);

        formData.kategori.forEach((cat) =>
            submitData.append("kategori_ids[]", cat.value),
        );

        formData.eventType.forEach((type) =>
            submitData.append("event_type_ids[]", type.value),
        );

        if (formData.banner) {
            submitData.append("banner", formData.banner);
        }

        try {
            const response = await api.post(
                `event-dashboard/${eventId}/info-utama/update`,
                submitData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                },
            );

            notify(
                "success",
                "Berhasil!",
                "Perubahan informasi utama telah disimpan.",
            );
            return response;
        } catch (error) {
            console.error("Gagal update data:", error);
            throw error;
        }
    };

    return (
        <EventLayout
            heading="Informasi Utama"
            subheading="Lengkapi detail dasar event untuk mempermudah calon peserta menemukan event-mu."
            nextPath="tempat"
            onSave={handleUpdate}
            // prevPath={}
        >
            <Form>
                {/* Judul Event */}
                <Form.Group className="mb-4" controlId="formTitle">
                    <Form.Label>Nama Event</Form.Label>
                    <Form.Control
                        required
                        type="text"
                        name="title" // Penting untuk handleTextChange
                        value={formData.title}
                        onChange={handleTextChange}
                        placeholder="Masukan nama event (misal: Seminar Nasional Teknologi)"
                    />
                </Form.Group>

                {/* Description */}
                <Form.Group className="mb-4" controlId="formDescription">
                    <Form.Label>Deskripsi Lengkap</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={5}
                        name="description" // Penting untuk handleTextChange
                        value={formData.description}
                        onChange={handleTextChange}
                        placeholder="Jelaskan mengenai tujuan, agenda, dan informasi penting lainnya dari event ini."
                    />
                </Form.Group>

                {/* Event Type (Multi Select) */}
                <Form.Group className="mb-4">
                    <Form.Label>Tipe Event</Form.Label>
                    <Select
                        isMulti
                        value={formData.eventType}
                        options={eventTypeOptions}
                        placeholder="Pilih Tipe Event (Bisa lebih dari satu)..."
                        className="basic-multi-select"
                        classNamePrefix="select form-select"
                        onChange={(selected) =>
                            handleSelectChange("eventType", selected)
                        }
                    />
                </Form.Group>

                {/* Kategori (Multi Select) */}
                <Form.Group className="mb-4">
                    <Form.Label>Kategori Event</Form.Label>
                    <Select
                        isMulti
                        value={formData.kategori}
                        options={kategoriOptions}
                        placeholder="Pilih kategori (Bisa lebih dari satu)..."
                        className="basic-multi-select"
                        classNamePrefix="select form-select"
                        onChange={(selected) =>
                            handleSelectChange("kategori", selected)
                        }
                    />
                </Form.Group>

                {/* Media Banner */}
                <Form.Group className="mb-4">
                    <Form.Label>Banner Event</Form.Label>

                    <div className="upload-box-wrapper">
                        <input
                            type="file"
                            id="bannerUpload"
                            className="hidden-input"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <label
                            htmlFor="bannerUpload"
                            className="upload-box-label"
                        >
                            <div className="text-center">
                                <Image size={32} color="#a1a1a1" />
                                <p className="mb-0 text-muted mt-2">
                                    {formData.banner
                                        ? formData.banner.name
                                        : "Klik untuk unggah banner (Rekomendasi 1280×720 px, Max 2MB)"}
                                </p>
                            </div>
                        </label>
                    </div>
                </Form.Group>
            </Form>
        </EventLayout>
    );
};

export default EventGeneralInfo;
