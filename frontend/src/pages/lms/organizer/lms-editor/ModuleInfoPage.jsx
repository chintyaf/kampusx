import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { Save, Plus, Trash2 } from 'lucide-react';
import api from '@/api/axios';
import { notify } from '@/utils/notify';

const ModuleInfoPage = () => {
	const { moduleId, learningId } = useParams();
	const { refreshModule } = useOutletContext() || {};

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState({
		title: '',
		description: '',
		learning_outcomes: [''],
		difficulty_level: 'beginner',
		order_index: 1,
		status: 'draft',
	});

	useEffect(() => {
		const fetchModuleData = async () => {
			if (!moduleId) return;
			try {
				setLoading(true);
				const res = await api.get(`/organizer/lms/modules/${moduleId}`);
				if (res.data?.success && res.data?.data) {
					const data = res.data.data;
					setForm({
						title: data.title || '',
						description: data.description || '',
						learning_outcomes:
							Array.isArray(data.learning_outcomes) && data.learning_outcomes.length > 0
								? data.learning_outcomes
								: [''],
						difficulty_level: data.difficulty_level || 'beginner',
						order_index: data.order_index || 1,
						status: data.status || 'draft',
					});
				}
			} catch (error) {
				console.error('Error fetching module info:', error);
				notify(
					'error',
					'Gagal Memuat Module',
					error.response?.data?.message || 'Tidak dapat memuat informasi module.',
				);
			} finally {
				setLoading(false);
			}
		};

		fetchModuleData();
	}, [moduleId]);

	const handleChange = (e) => {
		const { name, value } = e.target;

		setForm((prev) => ({
			...prev,
			[name]: name === 'order_index' ? Number(value) : value,
		}));
	};

	const handleOutcomeChange = (index, value) => {
		setForm((prev) => ({
			...prev,
			learning_outcomes: prev.learning_outcomes.map((item, i) =>
				i === index ? value : item,
			),
		}));
	};

	const addOutcome = () => {
		setForm((prev) => ({
			...prev,
			learning_outcomes: [...prev.learning_outcomes, ''],
		}));
	};

	const removeOutcome = (index) => {
		setForm((prev) => ({
			...prev,
			learning_outcomes: prev.learning_outcomes.filter((_, i) => i !== index),
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const payload = {
			learning_path_id: Number(learningId),
			...form,
			learning_outcomes: form.learning_outcomes.filter((item) => item.trim() !== ''),
		};

		try {
			setSaving(true);
			const res = await api.put(`/organizer/lms/modules/${moduleId}`, payload);
			if (res.data?.success) {
				notify('success', 'Berhasil', 'Informasi module berhasil diperbarui.');
				if (refreshModule) {
					refreshModule();
				}
			}
		} catch (error) {
			console.error('Error saving module:', error);
			notify(
				'error',
				'Gagal Menyimpan',
				error.response?.data?.message || 'Terjadi kesalahan saat menyimpan module.',
			);
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div
				className="d-flex justify-content-center align-items-center"
				style={{ minHeight: '300px' }}
			>
				<Spinner animation="border" variant="primary" />
			</div>
		);
	}

	return (
		<div>
			<h4 className="mb-1">Informasi Module</h4>
			<p className="text-secondary mb-4">
				Atur informasi dasar, capaian pembelajaran, dan pengaturan module.
			</p>

			<Form onSubmit={handleSubmit} className="bg-white p-4 rounded border">
				{/* Judul */}
				<Form.Group className="mb-3">
					<Form.Label>Judul Module</Form.Label>
					<Form.Control
						type="text"
						name="title"
						value={form.title}
						onChange={handleChange}
						maxLength={200}
						placeholder="Masukkan judul module..."
						required
					/>
					<Form.Text className="text-muted">Maksimal 200 karakter.</Form.Text>
				</Form.Group>

				{/* Deskripsi */}
				<Form.Group className="mb-4">
					<Form.Label>Deskripsi</Form.Label>
					<Form.Control
						as="textarea"
						rows={4}
						name="description"
						value={form.description}
						onChange={handleChange}
						placeholder="Jelaskan materi yang akan dipelajari..."
					/>
				</Form.Group>

				{/* Learning Outcomes */}
				<Form.Group className="mb-4">
					<Form.Label>Capaian Pembelajaran</Form.Label>
					<Form.Text className="d-block text-muted mb-3">
						Tentukan kemampuan yang diharapkan setelah menyelesaikan module.
					</Form.Text>

					{form.learning_outcomes.map((outcome, index) => (
						<div key={index} className="d-flex gap-2 mb-2">
							<Form.Control
								type="text"
								value={outcome}
								onChange={(e) => handleOutcomeChange(index, e.target.value)}
								placeholder={`Capaian pembelajaran ${index + 1}`}
							/>

							<Button
								type="button"
								variant="outline-danger"
								onClick={() => removeOutcome(index)}
								disabled={form.learning_outcomes.length === 1}
							>
								<Trash2 size={16} />
							</Button>
						</div>
					))}

					<Button type="button" variant="outline-primary" size="sm" onClick={addOutcome}>
						<Plus size={15} className="me-1" />
						Tambah Capaian
					</Button>
				</Form.Group>

				<Row>
					{/* Difficulty Level */}
					<Col md={6}>
						<Form.Group className="mb-3">
							<Form.Label>Tingkat Kesulitan</Form.Label>
							<Form.Select
								name="difficulty_level"
								value={form.difficulty_level}
								onChange={handleChange}
							>
								<option value="beginner">Pemula (Beginner)</option>
								<option value="intermediate">Menengah (Intermediate)</option>
								<option value="advanced">Lanjutan (Advanced)</option>
							</Form.Select>
						</Form.Group>
					</Col>

					{/* Order Index */}
					<Col md={6}>
						<Form.Group className="mb-3">
							<Form.Label>Urutan Module</Form.Label>
							<Form.Control
								type="number"
								name="order_index"
								min={1}
								value={form.order_index}
								onChange={handleChange}
								required
							/>
						</Form.Group>
					</Col>
				</Row>

				{/* Status */}
				<Form.Group className="mb-4">
					<Form.Label>Status Module</Form.Label>
					<Form.Select name="status" value={form.status} onChange={handleChange}>
						<option value="draft">Draft</option>
						<option value="published">Published</option>
					</Form.Select>
				</Form.Group>

				<div className="d-flex justify-content-end">
					<Button type="submit" disabled={saving}>
						{saving ? (
							<Spinner animation="border" size="sm" className="me-2" />
						) : (
							<Save size={16} className="me-2" />
						)}
						{saving ? 'Menyimpan...' : 'Simpan Perubahan'}
					</Button>
				</div>
			</Form>
		</div>
	);
};

export default ModuleInfoPage;
