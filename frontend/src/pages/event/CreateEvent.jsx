import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Row, Col } from "react-bootstrap"; // Tambahkan Row dan Col
import Select from "react-select";
import api from "../../api/axios";
import { notify } from "../../utils/notify";

import FormHeading from "../../components/dashboard/FormHeading";

// ICON
import { Image } from "lucide-react";

const CreateEvent = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        banner: null,
        kategori: [],
        eventType: [],
    });

    const [kategoriOptions, setKategoriOptions] = useState([]);
    const [eventTypeOptions, setEventTypeOptions] = useState([]);

    const handleTextChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (field, selectedOptions) => {
        setFormData((prev) => ({ ...prev, [field]: selectedOptions || [] }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData((prev) => ({ ...prev, banner: file }));
    };

    // Ambil opsi kategori dan tipe event saat komponen pertama kali dimuat
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const submitData = new FormData();

            // Mapping data dari state ke FormData
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

            // Langsung tembak ke endpoint create /events
            const response = await api.post(`/events`, submitData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const newEventId = response.data.data.id;

            console.log("Sukses:", response.data);

            // Pesan sukses dari backend (message: "Event baru berhasil dibuat!")
            notify(
                "success",
                "Berhasil!",
                response.data.message || "Event baru berhasil dibuat.",
            );

            // Langsung redirect ke dashboard event yang baru dibuat
            navigate(`/organizer/${newEventId}/event-dashboard`);

            return response;
        } catch (error) {
            console.error("Gagal menyimpan event:", error);

            const errorMessage =
                error.response?.data?.error_detail ||
                error.response?.data?.message ||
                "Terjadi kesalahan saat menyimpan event.";

            notify("error", "Gagal!", errorMessage);
        }
    };

    return (
        <div className="container-fluid p-0 col-11">
            {" "}
            {/* Bisa pakai container agar layout aman */}
            <FormHeading
                heading="Buat Event Baru"
                subheading="Isi informasi berikut untuk membuat event baru"
            />
            <Form>
                <Row>
                    {/* Judul Event - Full width di semua layar */}
                    <Col xs={12}>
                        <Form.Group className="mb-4" controlId="formTitle">
                            <Form.Label>
                                Nama Event{" "}
                                <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                required
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleTextChange}
                                placeholder="Masukan nama event (misal: Seminar Nasional Teknologi)"
                            />
                        </Form.Group>
                    </Col>

                    {/* Deskripsi - Full width di semua layar */}
                    <Col xs={12}>
                        <Form.Group
                            className="mb-4"
                            controlId="formDescription"
                        >
                            <Form.Label>
                                Deskripsi Lengkap{" "}
                                <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                required
                                as="textarea"
                                rows={5}
                                name="description"
                                value={formData.description}
                                onChange={handleTextChange}
                                placeholder="Jelaskan mengenai tujuan, agenda, dan informasi penting lainnya dari event ini."
                            />
                        </Form.Group>
                    </Col>

                    {/* Tipe Event - Setengah lebar di laptop (md=6), full di HP (xs=12) */}
                    <Col xs={12}>
                        <Form.Group className="mb-4">
                            <Form.Label>
                                Tipe Event{" "}
                                <span className="text-danger">*</span>
                            </Form.Label>
                            <Select
                                isMulti
                                value={formData.eventType}
                                options={eventTypeOptions}
                                placeholder="Pilih Tipe Event..."
                                className="basic-multi-select"
                                classNamePrefix="select form-select"
                                onChange={(selected) =>
                                    handleSelectChange("eventType", selected)
                                }
                            />
                        </Form.Group>
                    </Col>

                    {/* Kategori - Setengah lebar di laptop (md=6), full di HP (xs=12) */}
                    <Col xs={12}>
                        <Form.Group className="mb-4">
                            <Form.Label>
                                Kategori Event{" "}
                                <span className="text-danger">*</span>
                            </Form.Label>
                            <Select
                                isMulti
                                value={formData.kategori}
                                options={kategoriOptions}
                                placeholder="Pilih kategori..."
                                className="basic-multi-select"
                                classNamePrefix="select form-select"
                                onChange={(selected) =>
                                    handleSelectChange("kategori", selected)
                                }
                            />
                        </Form.Group>
                    </Col>

                    {/* Banner - Full width di semua layar */}
                    <Col xs={12}>
                        <Form.Group className="mb-4">
                            <Form.Label>
                                Banner Event
                                {/* <span className="text-danger">*</span> */}
                            </Form.Label>
                            <div className="upload-box-wrapper w-100">
                                <input
                                    required
                                    type="file"
                                    id="bannerUpload"
                                    className="hidden-input"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: "none" }} // Pastikan input aslinya sembunyi
                                />
                                <label
                                    htmlFor="bannerUpload"
                                    className="upload-box-label w-100 d-flex flex-column align-items-center justify-content-center p-4 border border-dashed rounded"
                                    style={{
                                        cursor: "pointer",
                                        backgroundColor: "#f8f9fa",
                                    }}
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
                    </Col>
                </Row>
            </Form>
            {/* Button Container */}
            <div className="d-flex justify-content-end  wgap-2 py-0">
                <div className="justify-content-end gap-2 py-4">
                    <button
                        type="submit"
                        className="btn btn-primary w-100 w-md-auto"
                        onClick={handleSubmit}
                    >
                        Buat Event
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateEvent;
