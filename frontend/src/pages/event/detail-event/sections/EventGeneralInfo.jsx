import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
    Form,
    InputGroup,
    Badge,
    CloseButton,
    Row,
    Col,
} from "react-bootstrap";
import Select from "react-select";
import EventLayout from "../EventLayout";
import api from "../../../../api/axios";
import { notify } from "../../../../utils/notify";

// ICON
import { Image, CheckCircle2 } from "lucide-react";

const EventGeneralInfo = () => {
    const { eventId } = useParams();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedKategori, setSelectedKategori] = useState([]);
    const [banner, setBanner] = useState(null);

    // Slug
    const [slug, setSlug] = useState("");
    const handleSlugChange = (e) => {
        const formattedSlug = e.target.value
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
        setSlug(formattedSlug);
    };

    // Kategori
    const kategori_options = [
        { value: "1", label: "Seminar" },
        { value: "2", label: "Workshop" },
        { value: "3", label: "Course" },
    ];

    // Interest Tagging
    const [tags, setTags] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const handleAddTag = (e) => {
        if (e.key === "Enter" && inputValue.trim() !== "") {
            e.preventDefault();
            if (!tags.includes(inputValue.trim())) {
                setTags([...tags, inputValue.trim()]);
            }
            setInputValue("");
        }
    };
    const removeTag = (indexToRemove) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    };

    // Ambil Data Event
    useEffect(() => {
        const fetchEventData = async () => {
            try {
                const response = await api.get(
                    `event-dashboard/${eventId}/info-utama`,
                );

                const result = response.data;

                if (result.status === "success") {
                    const data = result.data;

                    setTitle(data.title || "");
                    setSlug(data.slug || "");
                    setDescription(data.description || "");

                    if (data.tags_kategori) {
                        const formattedKategori = data.tags_kategori.map(
                            (cat) => ({
                                value: cat.id.toString(),
                                label: cat.name,
                            }),
                        );
                        setSelectedKategori(formattedKategori);
                    }
                }
            } catch (error) {
                console.error("Gagal mengambil data event:", error);
            }
        };

        if (eventId) {
            fetchEventData();
        }
    }, [eventId]);

    const handleUpdate = async () => {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("slug", slug);
        formData.append("description", description);

        const kategoriIds = selectedKategori.map((cat) => cat.value);
        kategoriIds.forEach((id) => formData.append("kategori_ids[]", id));

        tags.forEach((tag) => formData.append("tags[]", tag));

        if (banner) {
            formData.append("banner", banner);
        }

        try {
            const response = await api.post(
                `event-dashboard/${eventId}/info-utama/update`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                },
            );
            console.log("Sukses update:", response.data);
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
        >
            <Form>
                {/* Judul Event */}
                <Form.Group className="mb-4" controlId="formTitle">
                    <Form.Label>Nama Event</Form.Label>
                    <Form.Control
                        required
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Masukan nama event (misal: Seminar Nasional Teknologi)"
                    />
                </Form.Group>

                {/* Link Event */}
                {/* <Form.Group className="mb-4" controlId="formSlug">
                    <Form.Label>URL Kustom</Form.Label>
                    <InputGroup className="mb-4">
                        <InputGroup.Text id=" fs-6" style={{fontSize : "14px"}}>
                            kampusx.com/events/
                        </InputGroup.Text>
                        <Form.Control
                            value={slug}
                            onChange={handleSlugChange}
                            placeholder="nama-event-kamu"
                        />
                    </InputGroup>
                </Form.Group> */}

                {/* Description */}
                <Form.Group className="mb-4" controlId="formDescription">
                    <Form.Label>Deskripsi Lengkap</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Jelaskan mengenai tujuan, agenda, dan informasi penting lainnya dari event ini."
                    />
                </Form.Group>

                {/* Kategori */}
                <Form.Group className="mb-4">
                    <Form.Label>Kategori Event</Form.Label>
                    <Select
                        isMulti
                        value={selectedKategori}
                        options={kategori_options}
                        placeholder="Pilih kategori..."
                        className="basic-multi-select"
                        classNamePrefix="select form-select"
                        // PERBAIKAN: Menangkap perubahan opsi
                        onChange={(selectedOptions) =>
                            setSelectedKategori(selectedOptions || [])
                        }
                    />
                </Form.Group>

                {/* Tagging Event */}
                <Row className="mb-4">
                    <Form.Group as={Col} controlId="formEventTags">
                        <Form.Label>Tag Minat</Form.Label>
                        <div className="border rounded p-2 bg-white">
                            <div className="d-flex flex-wrap gap-2 mb-2">
                                {tags.map((tag, index) => (
                                    <Badge
                                        key={index}
                                        bg="secondary"
                                        className="d-flex align-items-center gap-2 p-2"
                                        style={{
                                            fontSize: "0.85rem",
                                            fontWeight: "500",
                                        }}
                                    >
                                        {tag}
                                        <CloseButton
                                            variant="white"
                                            style={{ fontSize: "0.6rem" }}
                                            onClick={() => removeTag(index)}
                                        />
                                    </Badge>
                                ))}
                            </div>

                            <Form.Control
                                type="text"
                                placeholder="Tambah tag (e.g. Design) lalu tekan Enter"
                                value={inputValue}
                                onKeyDown={handleAddTag}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="border-0 shadow-none p-0 ps-1"
                                style={{ fontSize: "0.9rem" }}
                            />
                        </div>
                        <Form.Text className="text-muted">
                            Gunakan hingga 5 tag agar event lebih relevan di
                            hasil pencarian.
                        </Form.Text>
                    </Form.Group>
                </Row>

                {/* Media */}
                <Form.Group className="mb-4">
                    <Form.Label >Banner Event</Form.Label>

                    <div className="upload-box-wrapper">
                        <input
                            type="file"
                            id="bannerUpload"
                            className="hidden-input"
                            accept="image/*"
                            onChange={(e) => setBanner(e.target.files[0])}
                        />
                        <label
                            htmlFor="bannerUpload"
                            className="upload-box-label"
                        >
                            <div className="text-center">
                                <Image size={32} color="#a1a1a1" />
                                <p className="mb-0 text-muted mt-2">
                                    {banner
                                        ? banner.name
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
