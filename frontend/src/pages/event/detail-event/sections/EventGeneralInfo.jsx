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

// ICON
import { Image, CheckCircle2 } from "lucide-react";

const EventGeneralInfo = () => {
    const { eventSlug } = useParams();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedKategori, setSelectedKategori] = useState([]);

    // Slug
    const [slug, setSlug] = useState("");
    const handleSlugChange = (e) => {
        // 1. Convert to Lowercase
        // 2. Replace spaces with hyphens
        // 3. Remove special characters (keep only letters, numbers, and hyphens)
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

    // Interest Taggin
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

    // 3. Gunakan useEffect untuk Fetch Data dari API
    useEffect(() => {
        const fetchEventData = async () => {
            try {
                const response = await api.get(
                    `event-dashboard/${eventSlug}/info-utama`,
                );

                const result = response.data;

                if (result.status === "success") {
                    const data = result.data;

                    // Isi state dengan data dari database
                    setTitle(data.judul_event || "masuk");
                    setSlug(data.slug_event || "");
                    setDescription(data.deskripsi || "");

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
                console.log("Sukses");
            } catch (error) {
                console.error("Gagal mengambil data event:", error);
            }
        };

        // Panggil fungsi fetch hanya jika eventSlug tersedia
        if (eventSlug) {
            fetchEventData();
        }
    }, [eventSlug]); // Dependency array: fungsi dijalankan ulang jika eventSlug berubah

    return (
        <EventLayout
            heading="Informasi Utama Event"
            subheading="Silakan lengkapi data di bawah ini untuk mulai mempublikasikan event-mu."
            nextPath="lokasi-n-waktu"
        >
            <Form>
                {/* Judul Event */}
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Judul Event</Form.Label>
                    <Form.Control
                        required
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Contoh: KampusX Xtra Xplore Xperience"
                    />
                    {/* <Form.Text className="text-muted">
                        We'll never share your email with anyone else.
                    </Form.Text> */}
                </Form.Group>

                {/* Link Event */}
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Link Event</Form.Label>
                    <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon1">
                            kampusx.com/events/
                        </InputGroup.Text>
                        <Form.Control
                            value={slug}
                            onChange={handleSlugChange}
                            placeholder="kampusx-xtra-xplore-xperience"
                            aria-label="Username"
                            aria-describedby="basic-addon1"
                        />
                    </InputGroup>
                </Form.Group>

                {/* Description */}
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Deskripsi Event</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Form.Group>

                {/* Kategori */}
                <Form.Group className="mb-3">
                    <Form.Label>Kategori</Form.Label>
                    <Select
                        isMulti
                        value={selectedKategori}
                        options={kategori_options}
                        className="basic-multi-select"
                        classNamePrefix="select form-select"
                    />
                </Form.Group>

                {/* Tagging Event */}
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formEventTags">
                        <Form.Label>Tagging Event</Form.Label>
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
                                placeholder="Ketik topik (e.g. Machine Learning) lalu tekan Enter"
                                value={inputValue}
                                onKeyDown={handleAddTag}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="border-0 shadow-none p-0 ps-1"
                                style={{ fontSize: "0.9rem" }}
                            />
                        </div>
                        <Form.Text className="text-muted">
                            Maksimal 5 tag agar event lebih mudah ditemukan.
                        </Form.Text>
                    </Form.Group>
                </Row>

                {/* Media */}
                <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                        Upload Banner
                        {/* <span className="text-danger">*</span> */}
                    </Form.Label>

                    {/* The Wrapper */}
                    <div className="upload-box-wrapper">
                        <input
                            type="file"
                            id="bannerUpload"
                            className="hidden-input"
                            accept="image/*"
                        />
                        <label
                            htmlFor="bannerUpload"
                            className="upload-box-label"
                        >
                            {/* Ubah nanti dengan ukuran gambar yang benar */}
                            <div className="text-center">
                                <Image size={32} color="#a1a1a1" />
                                <p className="mb-0 text-muted mt-2">
                                    Rekomendasi 1280×720 px, Max 2MB
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
