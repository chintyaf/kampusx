import { useState } from "react";
import { Form, InputGroup } from "react-bootstrap";
import Select from "react-select";
import EventLayout from "../EventLayout";
// ICON
import { Image } from "lucide-react";

const EventGeneralInfo = () => {
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
    const kategori_options = [
        { value: "1", label: "One" },
        { value: "2", label: "Two" },
        { value: "3", label: "Three" },
    ];

    return (
        <EventLayout title="Informasi Utama Event" nextPath="lokasi-n-waktu">
            <Form>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Judul Event</Form.Label>
                    <Form.Control
                        required
                        type="text"
                        placeholder="Contoh: KampusX Xtra Xplore Xperience"
                    />
                    <Form.Text className="text-muted">
                        We'll never share your email with anyone else.
                    </Form.Text>
                </Form.Group>

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
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Deskripsi Event</Form.Label>
                    <Form.Control as="textarea" rows={3} />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Kategori</Form.Label>
                    <Select
                        isMulti
                        options={kategori_options}
                        className="basic-multi-select"
                        classNamePrefix="select form-select"
                    />
                </Form.Group>

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
