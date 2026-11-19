import React from 'react';
import { Form, Card } from 'react-bootstrap';

const LessonContentForm = ({ lesson, onChange }) => {
	return (
		<Card className="border-0 shadow-sm mb-4">
			<Card.Body className="p-4">
				<h5 className="mb-3">Konten Pembelajaran</h5>

				<Form.Group className="mb-3">
					<Form.Label>Isi Materi</Form.Label>
					<Form.Control
						as="textarea"
						rows={8}
						name="content"
						value={lesson.content}
						onChange={onChange}
						placeholder="Tuliskan materi pembelajaran lengkap di sini..."
					/>
				</Form.Group>

				<Form.Group className="mb-3">
					<Form.Label>Ringkasan</Form.Label>
					<Form.Control
						as="textarea"
						rows={3}
						name="summary"
						value={lesson.summary}
						onChange={onChange}
						placeholder="Ringkasan singkat materi..."
					/>
				</Form.Group>

				<Form.Group className="mb-3">
					<Form.Label>Video URL</Form.Label>
					<Form.Control
						type="url"
						name="video_url"
						value={lesson.video_url}
						onChange={onChange}
						placeholder="https://..."
					/>
				</Form.Group>
			</Card.Body>
		</Card>
	);
};

export default LessonContentForm;
