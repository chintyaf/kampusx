import React from 'react';
import { Form } from 'react-bootstrap';

const OnlineForm = ({ data, onChange, errors }) => {
	return (
		<>
			{/* Lokasi Umum / Platform */}
			<Form.Group controlId="formGridLocation" className="mb-4">
				<Form.Label className="form-label required">Platform</Form.Label>
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
				<div className="d-flex justify-content-between align-items-center mb-2">
					<label className="form-label mb-0">Tautan Pertemuan (Link)</label>
					<span className="text-muted" style={{ fontSize: '13px' }}>
						Opsional
					</span>
				</div>
				<Form.Control
					name="meeting_link"
					type="text"
					value={data.meeting_link || ''}
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
				<div className="d-flex justify-content-between align-items-center mb-2">
					<label className="form-label mb-0">Instruksi & Detail Akses</label>
					<span className="text-muted" style={{ fontSize: '13px' }}>
						Opsional
					</span>
				</div>
				<Form.Control
					name="online_instruction"
					value={data.online_instruction || ''}
					as="textarea"
					onChange={onChange}
					rows={5}
					maxLength={500}
					placeholder={`Contoh:\n• Passcode Zoom: 123456\n• Mohon hadir 15 menit sebelum mulai.`}
					isInvalid={!!errors.online_instruction}
				/>
				<Form.Control.Feedback type="invalid">
					{errors.online_instruction ? errors.online_instruction[0] : ''}
				</Form.Control.Feedback>
				<div className="d-flex justify-content-between align-items-start mt-1">
					<Form.Text className="text-muted mb-0" style={{ maxWidth: '80%' }}>
						Informasi rahasia aman di sini. Bisa diisi menyusul dan hanya tampil di
						email/dashboard peserta setelah mendaftar.
					</Form.Text>
					<Form.Text className="text-muted small text-nowrap">
						{data.online_instruction?.length || 0} / 500 karakter
					</Form.Text>
				</div>
			</Form.Group>
		</>
	);
};

export default OnlineForm;
