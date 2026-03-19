import { useState } from "react";
import { Form, Container, Button, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import "../../assets/css/form.css";
import { Image } from "lucide-react";
import axios from "axios";

const Create = () => {
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [categories, setCategories] = useState([]);
    const [banner, setBanner] = useState(null);

    const formatToSlug = (text) => {
        // 1. Convert to Lowercase
        // 2. Replace spaces with hyphens
        // 3. Remove special characters (keep only letters, numbers, and hyphens)
        return text
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
    };

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        setSlug(formatToSlug(newTitle));
    };

    const handleSlugChange = (e) => {
        setSlug(formatToSlug(e.target.value));
    };
    const kategori_options = [
        { value: "1", label: "One" },
        { value: "2", label: "Two" },
        { value: "3", label: "Three" },
    ];

    const navigate = useNavigate();

    const handleSaveAndContinue = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("title", title);
        formData.append("slug", slug);
        formData.append("description", description);
        // Convert category objects to simple values if needed by backend
        const selectedCategories = categories.map((cat) => cat.value);
        formData.append("categories", JSON.stringify(selectedCategories));

        if (banner) {
            formData.append("banner", banner);
        }

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/events",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );

            if (response.status === 200 || response.status === 201) {
                console.log("Success:", response.data);
                navigate("/organizer/event/detil-event/lokasi-n-waktu");
            }
        } catch (error) {
            console.error(
                "Submission error:",
                error.response?.data || error.message,
            );
            alert("Gagal menyimpan event. Periksa konsol untuk detail.");
        }
    };

    return (
        <>
            <Form>
                <div className="">
                    <p className="mb-4 form-title">
                        {" "}
                        Informasi Utama Event - General{" "}
                    </p>
                </div>

                {/* Judul Event */}
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Judul Event</Form.Label>
                    <Form.Control
                        required
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="Contoh: KampusX Xtra Xplore Xperience"
                    />
                    <Form.Text className="text-muted">
                        We'll never share your email with anyone else.
                    </Form.Text>
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

                {/* Deskripsi Event */}
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Deskripsi Event</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Form.Group>

                {/* Kategori -- Tipe Event */}
                <Form.Group className="mb-3">
                    <Form.Label>Kategori</Form.Label>
                    <Select
                        isMulti
                        options={kategori_options}
                        value={categories}
                        onChange={(selected) => setCategories(selected)}
                        className="basic-multi-select"
                        classNamePrefix="select form-select"
                    />
                </Form.Group>

                {/* Upload Banner */}
                <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Upload Banner</Form.Label>
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
                                <Image
                                    size={32}
                                    color={banner ? "#28a745" : "#a1a1a1"}
                                />
                                <p className="mb-0 text-muted mt-2">
                                    {banner
                                        ? banner.name
                                        : "Rekomendasi 1280×720 px, Max 2MB"}
                                </p>
                            </div>
                        </label>
                    </div>
                </Form.Group>
            </Form>

            {/* Button Save  */}
            <div className="w-100 d-flex justify-content-end mt-4 gap-4">
                <Button
                    variant="dark"
                    type="button"
                    onClick={handleSaveAndContinue}
                >
                    Simpan & Lanjut
                </Button>
            </div>
        </>
    );
};

export default Create;
