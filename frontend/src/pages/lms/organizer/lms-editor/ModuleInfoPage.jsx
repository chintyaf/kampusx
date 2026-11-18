import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { Save } from 'lucide-react';

const ModuleInfoPage = () => {
	const { moduleId } = useParams();

	// Data dummy — nanti ganti dengan fetch berdasarkan moduleId
	const [form, setForm] = useState({
		title: 'Web Architecture & REST API Design',
		description: 'Belajar dasar arsitektur web dan cara merancang REST API.',
		level: 'beginner',
	});

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log('Simpan module', moduleId, form);
	};

	return (
		<div
		// style={{ maxWidth: 720 }}
		>
			<h4 style={{ marginBottom: 4 }}>Informasi Module</h4>
			<p style={{ color: '#6b7488', marginBottom: 24 }}>
				Atur judul, deskripsi, dan level module.
			</p>

			<Form
				onSubmit={handleSubmit}
				style={{ background: '#fff', padding: 24, borderRadius: 8 }}
			>
				<Form.Group className="mb-3">
					<Form.Label>Judul module</Form.Label>
					<Form.Control name="title" value={form.title} onChange={handleChange} />
				</Form.Group>

				<Form.Group className="mb-3">
					<Form.Label>Deskripsi</Form.Label>
					<Form.Control
						as="textarea"
						rows={4}
						name="description"
						value={form.description}
						onChange={handleChange}
					/>
				</Form.Group>

				<Form.Group className="mb-4">
					<Form.Label>Level</Form.Label>
					<Form.Select name="level" value={form.level} onChange={handleChange}>
						<option value="beginner">Pemula</option>
						<option value="intermediate">Menengah</option>
						<option value="advanced">Lanjutan</option>
					</Form.Select>
				</Form.Group>

				<Button type="submit">
					<Save size={16} style={{ marginRight: 6 }} />
					Simpan
				</Button>
			</Form>
		</div>
	);
};

export default ModuleInfoPage;
