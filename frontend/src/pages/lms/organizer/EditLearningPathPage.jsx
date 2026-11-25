import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import Select from 'react-select';

import api from '@/api/axios';
import { notify } from '@/utils/notify';
import { ArrowLeft } from 'lucide-react';
import UploadImage from '@/components/UploadImage';

// ==================================
// INITIAL FORM DATA
// ==================================

const INITIAL_FORM = {
	title: '',
	description: '',
	category: '',
	categories: [],
	thumbnail: null,
};

// ==================================
// COMPONENT
// ==================================

const EditLearningPathPage = () => {
	const { learningId } = useParams();
	const navigate = useNavigate();

	// ----------------------------------
	// STATE
	// ----------------------------------

	const [formData, setFormData] = useState(INITIAL_FORM);
	const [originalThumbnail, setOriginalThumbnail] = useState(null);

	const [touched, setTouched] = useState({});

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);

	// ----------------------------------
	// CATEGORY OPTIONS
	// ----------------------------------

	const categoryOptions = [
		...new Set([formData.category, ...formData.categories].filter(Boolean)),
	].map((category) => ({
		value: category,
		label: category,
	}));

	// ----------------------------------
	// FETCH LEARNING PATH
	// ----------------------------------

	useEffect(() => {
		let isMounted = true;

		const fetchLearningPath = async () => {
			setLoading(true);
			setError(null);

			try {
				const response = await api.get(`organizer/lms/learning-paths/${learningId}`);

				const result = response.data;

				if (!result.success || !result.data) {
					throw new Error(result.message || 'Learning path tidak ditemukan.');
				}

				const data = result.data;

				if (isMounted) {
					setFormData({
						title: data.title || '',
						description: data.description || '',
						category: data.category || '',
						categories: data.categories || [],
						thumbnail: data.thumbnail_url || null,
					});

					setOriginalThumbnail(data.thumbnail_url || null);
				}
			} catch (err) {
				console.error('Gagal mengambil learning path:', err);

				if (isMounted) {
					const message =
						err.response?.data?.message ||
						err.message ||
						'Gagal mengambil data learning path.';

					setError(message);
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		if (learningId) {
			fetchLearningPath();
		} else {
			setError('Learning ID tidak ditemukan.');
			setLoading(false);
		}

		return () => {
			isMounted = false;
		};
	}, [learningId]);

	// ----------------------------------
	// FORM HANDLERS
	// ----------------------------------

	const handleTextChange = (e) => {
		const { name, value } = e.target;

		setFormData((previous) => ({
			...previous,
			[name]: value,
		}));
	};

	const handleBlur = (field) => {
		setTouched((previous) => ({
			...previous,
			[field]: true,
		}));
	};

	const handleCategoryChange = (selected) => {
		setFormData((previous) => ({
			...previous,
			categories: selected ? selected.map((item) => item.value) : [],
		}));
	};

	const handlePrimaryCategoryChange = (selected) => {
		setFormData((previous) => ({
			...previous,
			category: selected?.value || '',
		}));
	};

	// ----------------------------------
	// VALIDATION
	// ----------------------------------

	const isTitleInvalid = touched.title && !formData.title.trim();

	const isDescriptionInvalid =
		touched.description &&
		(!formData.description.trim() || formData.description.trim().length < 50);

	const isCategoryInvalid = touched.categories && formData.categories.length === 0;

	const isPrimaryCategoryInvalid = touched.category && !formData.category;

	const isFormValid =
		formData.title.trim() !== '' &&
		formData.description.trim().length >= 50 &&
		formData.category !== '' &&
		formData.categories.length > 0;

	// ----------------------------------
	// UPDATE LEARNING PATH
	// ----------------------------------

	const handleSubmit = async (e) => {
		e.preventDefault();

		setTouched({
			title: true,
			description: true,
			category: true,
			categories: true,
		});

		if (!isFormValid) {
			notify('error', 'Validasi Gagal', 'Periksa kembali informasi Learning Path.');
			return;
		}

		setSaving(true);

		try {
			const formPayload = new FormData();

			formPayload.append('title', formData.title.trim());
			formPayload.append('description', formData.description.trim());
			formPayload.append('category', formData.category);

			formData.categories.forEach((item) => {
				formPayload.append('categories[]', item);
			});

			// Hanya kirim file jika user memilih gambar baru (File instance)
			if (formData.thumbnail instanceof File) {
				formPayload.append('thumbnail', formData.thumbnail, formData.thumbnail.name || 'thumbnail.jpg');
			} else if (!formData.thumbnail && originalThumbnail) {
				// User menghapus thumbnail yang sudah ada sebelumnya
				formPayload.append('remove_thumbnail', '1');
			}

			const response = await api.post(
				`lms/organizer/learning-paths/${learningId}/update`,
				formPayload,
				{
					headers: { 'Content-Type': 'multipart/form-data' },
				},
			);

			const result = response.data;

			if (!result.success) {
				throw new Error(result.message || 'Gagal memperbarui Learning Path.');
			}

			notify('success', 'Berhasil', result.message || 'Learning Path berhasil diperbarui.');

			const updatedResponse = await api.get(`organizer/lms/learning-paths/${learningId}`);

			if (updatedResponse.data.success) {
				const data = updatedResponse.data.data;

				setFormData({
					title: data.title || '',
					description: data.description || '',
					category: data.category || '',
					categories: data.categories || [],
					thumbnail: data.thumbnail_url || null,
				});

				setOriginalThumbnail(data.thumbnail_url || null);
			}

			setTouched({});
		} catch (err) {
			console.error('Update Learning Path Error:', err);

			notify(
				'error',
				'Terjadi Kesalahan',
				err.response?.data?.message || err.message || 'Gagal memperbarui Learning Path.',
			);
		} finally {
			setSaving(false);
		}
	};

	// ==================================
	// LOADING STATE
	// ==================================

	if (loading) {
		return (
			<div
				className="d-flex justify-content-center align-items-center"
				style={{ minHeight: '60vh' }}
			>
				<Spinner animation="border" variant="primary" />
			</div>
		);
	}

	// ==================================
	// ERROR STATE
	// ==================================

	if (error) {
		return (
			<Alert variant="danger">
				<Alert.Heading>Gagal Memuat Learning Path</Alert.Heading>
				{error}
			</Alert>
		);
	}

	// ==================================
	// MAIN RENDER
	// ==================================

	return (
		<div className="p-3 p-md-4 p-xl-5">
			<div className="mb-4">
				<button
					type="button"
					className="btn btn-link text-decoration-none text-muted p-0 mb-3 d-flex align-items-center gap-2"
					onClick={() => navigate(`/organizer/learning-path/${learningId}`)}
				>
					<ArrowLeft size={18} />
					<span className="small fw-medium">Kembali ke Learning Path</span>
				</button>

				<div>
					<h5 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>
						Edit Learning Path
					</h5>
					<p className="text-muted small mb-0">
						Perbarui informasi, deskripsi, dan pengaturan Learning Path.
					</p>
				</div>
			</div>
			<Form className="form" onSubmit={handleSubmit}>
				{/* ==================================
                BAGIAN 1: INFORMASI UTAMA
            ================================== */}

				<Form.Group className="mb-4" controlId="formTitle">
					<Form.Label className="required">Nama Learning Path</Form.Label>

					<Form.Control
						required
						type="text"
						name="title"
						value={formData.title}
						onChange={handleTextChange}
						onBlur={() => handleBlur('title')}
						placeholder="Masukkan nama learning path"
						isInvalid={isTitleInvalid}
					/>

					<Form.Control.Feedback type="invalid">
						Nama Learning Path wajib diisi.
					</Form.Control.Feedback>
				</Form.Group>

				{/* DESCRIPTION */}

				<Form.Group className="mb-4" controlId="formDescription">
					<Form.Label className="required">Deskripsi Learning Path</Form.Label>

					<Form.Control
						as="textarea"
						rows={5}
						name="description"
						value={formData.description}
						onChange={handleTextChange}
						onBlur={() => handleBlur('description')}
						maxLength={1000}
						placeholder="Jelaskan tujuan dan materi yang akan dipelajari dalam learning path ini."
						isInvalid={isDescriptionInvalid}
					/>

					<div className="d-flex justify-content-between mt-1">
						<div>
							{isDescriptionInvalid && (
								<div className="text-danger small">
									Deskripsi minimal 50 karakter.
								</div>
							)}
						</div>

						<Form.Text className="text-muted">
							{formData.description.length} / 1000 karakter
						</Form.Text>
					</div>
				</Form.Group>

				{/* ==================================
                BAGIAN 2: KLASIFIKASI
            ================================== */}

				<Form.Group className="mb-4">
					<Form.Label className="required">Kategori Utama</Form.Label>

					<Select
						value={
							formData.category
								? {
										value: formData.category,
										label: formData.category,
									}
								: null
						}
						options={categoryOptions}
						onChange={handlePrimaryCategoryChange}
						onBlur={() => handleBlur('category')}
						placeholder="Pilih kategori utama..."
						className="react-select-container"
						classNamePrefix="react-select"
						isClearable
					/>

					{isPrimaryCategoryInvalid && (
						<div className="text-danger small mt-1">Kategori utama wajib dipilih.</div>
					)}
				</Form.Group>

				<Form.Group className="mb-4">
					<Form.Label className="required">Kategori</Form.Label>

					<Select
						isMulti
						value={formData.categories.map((category) => ({
							value: category,
							label: category,
						}))}
						options={categoryOptions}
						onChange={handleCategoryChange}
						onBlur={() => handleBlur('categories')}
						placeholder="Pilih kategori (bisa lebih dari satu)..."
						className="react-select-container"
						classNamePrefix="react-select"
					/>

					{isCategoryInvalid && (
						<div className="text-danger small mt-1">Pilih minimal satu kategori.</div>
					)}

					<Form.Text className="text-muted">
						Kategori digunakan untuk mengelompokkan dan mempermudah pencarian Learning
						Path.
					</Form.Text>
				</Form.Group>

				{/* ==================================
                BAGIAN 3: THUMBNAIL
            ================================== */}

				<div className="mb-4">
					<UploadImage
						formData={formData}
						setFormData={setFormData}
						field="thumbnail"
						label="Thumbnail Learning Path"
						required={false}
						aspectRatio={16 / 9}
						dimensionsHint="1280x720px · Maks. 2MB"
					/>
				</div>

				{/* ==================================
                SUBMIT
            ================================== */}

				<div className="d-flex justify-content-end gap-2 mt-4">
					<Button type="submit" variant="primary" disabled={saving}>
						{saving ? (
							<>
								<Spinner size="sm" animation="border" className="me-2" />
								Menyimpan...
							</>
						) : (
							'Simpan Perubahan'
						)}
					</Button>
				</div>
			</Form>
		</div>
	);
};

export default EditLearningPathPage;
