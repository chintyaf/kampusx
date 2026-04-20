import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Row, Col, Spinner } from 'react-bootstrap';
import Select from 'react-select';
import api from '../../api/axios';
import { notify } from '../../utils/notify';

import FormHeading from '../../components/dashboard/FormHeading';
import { Image } from 'lucide-react';

const CreateEvent = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        banner: null,
        kategori: [],
        eventType: [],
    });

    const [kategoriOptions, setKategoriOptions] = useState([]);
    const [eventTypeOptions, setEventTypeOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleTextChange = (e) => {
        const { name, value } = e.target;

        // Logika untuk mengubah huruf pertama dan huruf setelah spasi menjadi Kapital
        // Catatan: Jika kamu HANYA ingin berlaku di 'title', kamu bisa bungkus dengan if (name === 'title')
        const capitalizedValue = value.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

        setFormData((prev) => ({ ...prev, [name]: capitalizedValue }));
    };

    const handleSelectChange = (field, selectedOptions) => {
        setFormData((prev) => ({ ...prev, [field]: selectedOptions || [] }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            file.preview = URL.createObjectURL(file);
            setFormData((prev) => ({ ...prev, banner: file }));
        }
    };

    useEffect(() => {
        return () => {
            if (formData.banner && formData.banner.preview) {
                URL.revokeObjectURL(formData.banner.preview);
            }
        };
    }, [formData.banner]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [kategoriRes, eventTypeRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/event-types'),
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
                console.error('Gagal mengambil opsi data:', error);
                notify('error', 'Gagal', 'Tidak dapat memuat opsi kategori atau tipe event.');
            }
        };

        fetchOptions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.eventType.length === 0 || formData.kategori.length === 0) {
            notify('warning', 'Perhatian', 'Tipe event dan kategori wajib diisi!');
            return;
        }

        setIsLoading(true);

        try {
            const submitData = new FormData();

            submitData.append('title', formData.title);
            submitData.append('description', formData.description);

            formData.kategori.forEach((cat) => submitData.append('kategori_ids[]', cat.value));
            formData.eventType.forEach((type) => submitData.append('event_type_ids[]', type.value));

            if (formData.banner) {
                submitData.append('banner', formData.banner);
            }

            const response = await api.post(`/events`, submitData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const newEventId = response.data.data.id;

            notify('success', 'Berhasil!', response.data.message || 'Event baru berhasil dibuat.');
            navigate(`/organizer/${newEventId}/event-dashboard`);
        } catch (error) {
            console.error('Gagal menyimpan event:', error);

            if (error.response && error.response.status === 422) {
                const validationErrors = error.response.data.errors;
                console.log('Detail Error Validasi:', validationErrors);
                const firstErrorMessage = Object.values(validationErrors)[0][0];

                notify('error', 'Validasi Gagal!', firstErrorMessage);
            } else {
                const errorMessage =
                    error.response?.data?.error_detail ||
                    error.response?.data?.message ||
                    'Terjadi kesalahan saat menyimpan event.';

                notify('error', 'Gagal!', errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container-fluid p-0 col-10">
            <FormHeading
                heading="Buat Event Baru"
                subheading="Isi informasi berikut untuk membuat event baru"
            />
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col xs={12}>
                        <Form.Group className="mb-4" controlId="formTitle">
                            <Form.Label>
                                Nama Event <span className="text-danger">*</span>
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

                    <Col xs={12}>
                        <Form.Group className="mb-4" controlId="formDescription">
                            <Form.Label>
                                Deskripsi Lengkap <span className="text-danger">*</span>
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

                    <Col xs={12} md={12}>
                        <Form.Group className="mb-4">
                            <Form.Label>
                                Tipe Event <span className="text-danger">*</span>
                            </Form.Label>
                            <Select
                                isMulti
                                value={formData.eventType}
                                options={eventTypeOptions}
                                placeholder="Pilih Tipe Event..."
                                className="basic-multi-select"
                                classNamePrefix="select form-select"
                                onChange={(selected) => handleSelectChange('eventType', selected)}
                            />
                        </Form.Group>
                    </Col>

                    <Col xs={12} md={12}>
                        <Form.Group className="mb-4">
                            <Form.Label>
                                Kategori Event <span className="text-danger">*</span>
                            </Form.Label>
                            <Select
                                isMulti
                                value={formData.kategori}
                                options={kategoriOptions}
                                placeholder="Pilih kategori..."
                                className="basic-multi-select"
                                classNamePrefix="select form-select"
                                onChange={(selected) => handleSelectChange('kategori', selected)}
                            />
                        </Form.Group>
                    </Col>

                    <Col xs={12}>
                        <Form.Group className="mb-4">
                            <Form.Label>
                                Banner Event <span className="text-danger">*</span>
                            </Form.Label>
                            <div className="upload-box-wrapper w-100">
                                <input
                                    required
                                    type="file"
                                    id="bannerUpload"
                                    className="hidden-input"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <label
                                    htmlFor="bannerUpload"
                                    className="upload-box-label w-100 d-flex flex-column align-items-center justify-content-center p-4 border border-dashed rounded"
                                    style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}>
                                    <div className="text-center">
                                        <Image size={32} color="#a1a1a1" />
                                        <p className="mb-0 text-muted mt-2">
                                            {formData.banner
                                                ? formData.banner.name
                                                : 'Klik untuk unggah banner (Rekomendasi 1280×720 px, Max 2MB)'}
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </Form.Group>

                        {formData.banner && (
                            <div
                                className="w-100 border mt-3"
                                style={{
                                    height: '200px',
                                    overflow: 'hidden',
                                    borderRadius: '8px',
                                }}>
                                <img
                                    src={
                                        formData.banner instanceof File
                                            ? formData.banner.preview
                                            : formData.banner
                                    }
                                    alt="Banner Preview"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        )}
                    </Col>
                </Row>

                <div className="d-flex justify-content-end py-4 gap-2">
                    <button type="submit" className="btn btn-primary px-4" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                Menyimpan...
                            </>
                        ) : (
                            'Buat Event'
                        )}
                    </button>
                </div>
            </Form>
        </div>
    );
};

export default CreateEvent;