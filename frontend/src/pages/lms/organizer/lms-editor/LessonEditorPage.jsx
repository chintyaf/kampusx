import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { Save } from 'lucide-react';

// Data dummy — nanti ganti dengan fetch berdasarkan lessonId
const DUMMY_LESSONS = {
	1: {
		title: 'Konsep Dasar Pemrograman & Tipe Data Utama',
		duration: 10,
		content: 'Isi materi lesson 1...',
	},
	2: {
		title: 'Tipe Data Logika (Boolean) & Operator Relasional',
		duration: 8,
		content: 'Isi materi lesson 2...',
	},
	3: {
		title: 'Aturan Penamaan Variabel & Assignment Nilai',
		duration: 7,
		content: 'Isi materi lesson 3...',
	},
};

const LessonEditorPage = () => {
	const { lessonId } = useParams();
	const [form, setForm] = useState({ title: '', duration: 0, content: '' });

	// Jalan setiap lessonId berubah (user klik lesson lain di sidebar)
	useEffect(() => {
		setForm(DUMMY_LESSONS[lessonId] || { title: '', duration: 0, content: '' });
	}, [lessonId]);

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log('Simpan lesson', lessonId, form);
	};

	return (
		<div
		// style={{ maxWidth: 720 }}
		>
			<h4 style={{ marginBottom: 4 }}>Edit Lesson</h4>
			<p style={{ color: '#6b7488', marginBottom: 24 }}>Lesson ID: {lessonId}</p>

			<Form
				onSubmit={handleSubmit}
				style={{ background: '#fff', padding: 24, borderRadius: 8 }}
			>
				<Form.Group className="mb-3">
					<Form.Label>Judul lesson</Form.Label>
					<Form.Control name="title" value={form.title} onChange={handleChange} />
				</Form.Group>

				<Form.Group className="mb-3">
					<Form.Label>Durasi (menit)</Form.Label>
					<Form.Control
						type="number"
						name="duration"
						value={form.duration}
						onChange={handleChange}
					/>
				</Form.Group>

				<Form.Group className="mb-4">
					<Form.Label>Isi materi</Form.Label>
					<Form.Control
						as="textarea"
						rows={10}
						name="content"
						value={form.content}
						onChange={handleChange}
					/>
				</Form.Group>

				<Button type="submit">
					<Save size={16} style={{ marginRight: 6 }} />
					Simpan
				</Button>
			</Form>
		</div>
	);
};

export default LessonEditorPage;
