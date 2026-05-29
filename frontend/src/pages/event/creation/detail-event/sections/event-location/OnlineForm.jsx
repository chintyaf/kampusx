import React, { useState, useEffect, useRef } from 'react';
import { Form } from 'react-bootstrap';

const OnlineForm = ({ data, onChange, errors, touched = {}, handleBlur = () => {} }) => {
	const predefinedList = ['Zoom', 'Google Meet', 'YouTube Live', 'Microsoft Teams', 'Webex', 'Instagram Live', 'TikTok Live'];
	
	const [isOther, setIsOther] = useState(false);
	const initializedRef = useRef(false);

	useEffect(() => {
		if (data.platform && !initializedRef.current) {
			if (!predefinedList.includes(data.platform)) {
				setIsOther(true);
			}
			initializedRef.current = true;
		}
	}, [data.platform]);

	const handleSelectChange = (e) => {
		const val = e.target.value;
		if (val === 'Lainnya') {
			setIsOther(true);
			onChange({
				target: {
					name: 'platform',
					value: ''
				}
			});
		} else {
			setIsOther(false);
			onChange({
				target: {
					name: 'platform',
					value: val
				}
			});
		}
	};

	let selectValue = '';
	if (isOther) {
		selectValue = 'Lainnya';
	} else if (data.platform && predefinedList.includes(data.platform)) {
		selectValue = data.platform;
	}

	return (
		<>
			{/* Lokasi Umum / Platform */}
			<Form.Group controlId="formGridLocation" className="mb-4">
				<Form.Label className="form-label required">Platform</Form.Label>
				<Form.Select
					value={selectValue}
					onChange={handleSelectChange}
					onBlur={() => handleBlur('platform')}
					isInvalid={touched.platform && (!data.platform || data.platform.trim() === '')}
					className="mb-3"
				>
					<option value="" disabled hidden>-- Pilih Platform --</option>
					<option value="Zoom">Zoom</option>
					<option value="Google Meet">Google Meet</option>
					<option value="YouTube Live">YouTube Live</option>
					<option value="Microsoft Teams">Microsoft Teams</option>
					<option value="Webex">Webex</option>
					<option value="Instagram Live">Instagram Live</option>
					<option value="TikTok Live">TikTok Live</option>
					<option value="Lainnya">Lainnya (Platform Lain)</option>
				</Form.Select>

				{isOther && (
					<div className="fade-in-down">
						<Form.Label className="form-label required small text-muted">Nama Platform Kustom</Form.Label>
						<Form.Control
							name="platform"
							type="text"
							value={data.platform || ''}
							onChange={onChange}
							onBlur={() => handleBlur('platform')}
							placeholder={'Masukkan nama platform lainnya, cth: Discord, Web'}
							isInvalid={touched.platform && (!data.platform || data.platform.trim() === '')}
						/>
					</div>
				)}

				<Form.Control.Feedback type="invalid">
					Platform wajib dipilih atau diisi.
				</Form.Control.Feedback>
				<Form.Text className="text-muted d-block mt-1">
					Nama platform ini akan muncul pada kartu event di halaman publik.
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
					onBlur={() => handleBlur('meeting_link')}
					isInvalid={!!errors.meeting_link}
				/>
				<Form.Control.Feedback type="invalid">
					{errors.meeting_link ? errors.meeting_link[0] : ''}
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
