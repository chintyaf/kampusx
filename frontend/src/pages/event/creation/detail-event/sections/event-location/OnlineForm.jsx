import React from 'react';
import { Form } from 'react-bootstrap';
import OptionalBadge from '../../../../../../components/form/OptionalBadge';

const OnlineForm = ({ data, onChange, errors }) => {
	return (
		<>
			{/* Lokasi Umum / Platform */}
			<Form.Group controlId="formGridLocation" className="mb-4">
				<Form.Label className="fw-bold">Platform *</Form.Label>
				<Form.Control
					name="platform"
					type="text"
					value={data.platform}
					onChange={onChange}
					placeholder={'Contoh: Link Zoom, Google Meet, YouTube Live'}
					isInvalid={!!errors.platform}
				/>
				<Form.Control.Feedback type="invalid">
					{errors.platform ? errors.platform[0] : 'Platform wajib diisi.'}
				</Form.Control.Feedback>
				<Form.Text className="text-muted d-block">
					Nama lokasi ini akan muncul pada kartu event di halaman publik.
				</Form.Text>
			</Form.Group>

			{/* Tautan Pertemuan */}
			<Form.Group controlId="formMeetingLink" className="mb-4">
				<Form.Label className="d-flex align-items-center fw-bold">
					Tautan Pertemuan (Link) <OptionalBadge />
				</Form.Label>
				<Form.Control
					as="textarea"
					rows={2}
					value={data.meeting_link}
					name="meeting_link"
					placeholder="https://zoom.us/j/..."
					onChange={onChange}
					isInvalid={!!errors.meeting_link}
				/>
				<Form.Control.Feedback type="invalid">
					{errors.meeting_link
						? errors.meeting_link[0]
						: 'Format harus berupa URL yang valid (contoh: https://...)'}
				</Form.Control.Feedback>
				<Form.Text className="text-muted">
					Kosongkan jika link belum tersedia. Anda dapat mengisinya nanti mendekati hari H
					event.
				</Form.Text>
			</Form.Group>

			{/* Instruksi Online */}
			<Form.Group className="mb-4" controlId="formInstructions">
				<Form.Label className="d-flex align-items-center fw-bold">
					Instruksi & Detail Akses <OptionalBadge />
				</Form.Label>
				<Form.Control
					name="online_instruction"
					value={data.online_instruction}
					as="textarea"
					onChange={onChange}
					rows={5}
					placeholder={`Contoh:\n• Passcode Zoom: 123456\n• Mohon hadir 15 menit sebelum mulai.`}
					isInvalid={!!errors.online_instruction}
				/>
				<Form.Control.Feedback type="invalid">
					{errors.online_instruction ? errors.online_instruction[0] : ''}
				</Form.Control.Feedback>
				<Form.Text className="text-muted">
					Informasi rahasia aman di sini. Bisa diisi menyusul dan hanya tampil di
					email/dashboard peserta setelah mendaftar.
				</Form.Text>
			</Form.Group>
		</>
	);
};

export default OnlineForm;
