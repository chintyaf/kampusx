import React from 'react';
import { Form } from 'react-bootstrap';

const OnlineForm = ({ data, onChange, errors, touched = {}, handleBlur = () => {} }) => {
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
					onBlur={() => handleBlur('platform')}
					placeholder={'Contoh: Link Zoom, Google Meet, YouTube Live'}
					isInvalid={touched.platform && (!data.platform || data.platform.trim() === '')}
				/>
				<Form.Control.Feedback type="invalid">
					Platform wajib diisi.
				</Form.Control.Feedback>
				<Form.Text className="text-muted d-block">
					Nama lokasi ini akan muncul pada kartu event di halaman publik.
				</Form.Text>
			</Form.Group>

			{/* Tautan Pertemuan */}
			<Form.Group controlId="formMeetingLink" className="mb-4">
				<div className="d-flex justify-content-between align-items-center mb-2">
					<label className="form-label mb-0 required">Tautan Pertemuan (Link)</label>
				</div>
				<Form.Control
					name="meeting_link"
					type="text"
					value={data.meeting_link || ''}
					placeholder="https://zoom.us/j/..."
					onChange={onChange}
					onBlur={() => handleBlur('meeting_link')}
					isInvalid={touched.meeting_link && (!data.meeting_link || data.meeting_link.trim() === '')}
				/>
				<Form.Control.Feedback type="invalid">
					Tautan pertemuan wajib dicantumkan.
				</Form.Control.Feedback>
				<Form.Text className="text-muted">
					Silakan cantumkan tautan pertemuan online untuk event ini.
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
