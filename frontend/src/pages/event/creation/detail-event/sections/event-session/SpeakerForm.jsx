import React, { useState, useEffect, useRef } from 'react';
import { Form, Button } from 'react-bootstrap';
import { ArrowLeft, Upload, Check } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getSpeakerAvatar } from './SpeakerList';

const SpeakerForm = ({ onChangeSidebar, initialData, onSave, isModal = false }) => {
	const fileInputRef = useRef(null);
	const [imagePreview, setImagePreview] = useState('');
	const [imageFile, setImageFile] = useState(null);

	const [formData, setFormData] = useState({
		name: '',
		role: '',
		bio: '',
		avatarUrl: '',
	});

	useEffect(() => {
		if (initialData) {
			setFormData(initialData);
			setImagePreview(getSpeakerAvatar(initialData));
			setImageFile(null);
		} else {
			setFormData({ name: '', role: '', bio: '', avatarUrl: '' });
			setImagePreview('');
			setImageFile(null);
		}
	}, [initialData]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		// Validation (limit to images and max 2MB)
		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
		if (!allowedTypes.includes(file.type)) {
			alert('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.');
			return;
		}

		if (file.size > 2 * 1024 * 1024) {
			alert('Ukuran file maksimal 2MB.');
			return;
		}

		setImageFile(file);
		const reader = new FileReader();
		reader.onloadend = () => {
			setImagePreview(reader.result);
		};
		reader.readAsDataURL(file);
	};

	const handleRemoveImage = () => {
		setImageFile(null);
		setImagePreview('');
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const handleSubmit = () => {
		if (onSave) {
			onSave({
				...formData,
				image_url: imagePreview, // to display in UI immediately
				_imageFile: imageFile,
			});
		}
	};

	return (
		<div
			className="d-flex flex-column"
			style={{
				width: isModal ? '100%' : '400px',
				height: isModal ? 'auto' : '80vh',
				backgroundColor: '#ffffff',
				borderLeft: isModal ? 'none' : '1px solid #e2e8f0',
				fontFamily: 'Inter, system-ui, sans-serif',
			}}
		>
			{/* Header */}
			<div
				className="p-3 border-bottom d-flex align-items-center gap-3"
				style={{ borderColor: '#e2e8f0' }}
			>
				<ArrowLeft
					size={20}
					color="#64748b"
					style={{ cursor: 'pointer' }}
					onClick={() => onChangeSidebar('speaker-list')}
				/>
				<div>
					<h5 className="mb-1 fw-bold" style={{ fontSize: '18px', color: '#1e293b' }}>
						{initialData ? 'Edit Pembicara' : 'Tambah Pembicara Baru'}
					</h5>
					<div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.2' }}>
						{initialData
							? 'Perbarui informasi pembicara'
							: 'Langsung ditambahkan ke daftar'}
					</div>
				</div>
			</div>

			{/* Form Body (Scrollable) */}
			<div className="flex-grow-1 overflow-auto p-3">
				{/* Foto Pembicara */}
				<Form.Group className="mb-3">
					<div className="d-flex justify-content-between align-items-center mb-2">
						<label
							className="form-label fw-semibold mb-0"
							style={{ fontSize: '13px', color: '#475569' }}
						>
							Foto Pembicara
						</label>
						<span className="text-muted" style={{ fontSize: '13px' }}>
							Opsional
						</span>
					</div>
					<div className="d-flex align-items-center gap-3">
						<div
							onClick={() => fileInputRef.current?.click()}
							className="d-flex flex-column align-items-center justify-content-center position-relative"
							style={{
								width: '72px',
								height: '72px',
								borderRadius: '50%',
								border: imagePreview ? '1.5px solid #cbd5e1' : '2px dashed #cbd5e1',
								backgroundColor: '#f8fafc',
								color: '#64748b',
								cursor: 'pointer',
								flexShrink: 0,
								overflow: 'hidden',
							}}
						>
							{imagePreview ? (
								<img
									src={imagePreview}
									alt="Preview"
									style={{ width: '100%', height: '100%', objectFit: 'cover' }}
								/>
							) : (
								<>
									<Upload size={18} className="mb-1" />
									<span style={{ fontSize: '11px', fontWeight: 500 }}>
										Upload
									</span>
								</>
							)}
						</div>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/jpeg,image/png,image/webp,image/jpg"
							onChange={handleFileChange}
							className="d-none"
						/>
						<div className="d-flex flex-column">
							{imagePreview ? (
								<button
									type="button"
									className="btn btn-link text-danger p-0 text-start text-decoration-none"
									style={{ fontSize: '13px', fontWeight: 500 }}
									onClick={handleRemoveImage}
								>
									Hapus Foto
								</button>
							) : (
								<span style={{ fontSize: '12px', color: '#64748b' }}>
									Rekomendasi rasio 1:1. Maksimal 2 MB.
								</span>
							)}
						</div>
					</div>
				</Form.Group>

				{/* Nama Lengkap */}
				<Form.Group className="mb-3">
					<Form.Label
						className="form-label fw-semibold"
						style={{ fontSize: '13px', color: '#475569' }}
					>
						Nama Lengkap <span className="text-danger">*</span>
					</Form.Label>
					<Form.Control
						placeholder="Masukkan nama lengkap pembicara"
						name="name"
						value={formData.name || ''}
						onChange={handleChange}
						className="form-control shadow-none"
						style={{
							border: '1.5px solid #cbd5e1',
							borderRadius: '8px',
							fontSize: '14px',
							padding: '10px 12px',
							backgroundColor: '#f8fafc',
						}}
					/>
				</Form.Group>

				{/* Jabatan / Posisi */}
				<Form.Group className="mb-3">
					<Form.Label
						className="form-label fw-semibold"
						style={{ fontSize: '13px', color: '#475569' }}
					>
						Jabatan / Posisi <span className="text-danger">*</span>
					</Form.Label>
					<Form.Control
						placeholder="Contoh: CEO di TechCorp"
						name="role"
						value={formData.role || ''}
						onChange={handleChange}
						className="form-control shadow-none"
						style={{
							border: '1.5px solid #cbd5e1',
							borderRadius: '8px',
							fontSize: '14px',
							padding: '10px 12px',
							backgroundColor: '#f8fafc',
						}}
					/>
				</Form.Group>

				{/* Bio Textarea */}
				<Form.Group className="mb-3">
					<div className="d-flex justify-content-between align-items-center mb-2">
						<label
							className="form-label fw-semibold mb-0"
							style={{ fontSize: '13px', color: '#475569' }}
						>
							Bio Singkat
						</label>
						<span className="text-muted" style={{ fontSize: '13px' }}>
							Opsional
						</span>
					</div>
					<Form.Control
						as="textarea"
						rows={4}
						maxLength={300}
						placeholder="Bio singkat pembicara..."
						name="bio"
						value={formData.bio || ''}
						onChange={handleChange}
						className="form-control shadow-none"
						style={{
							border: '1.5px solid #cbd5e1',
							borderRadius: '8px',
							fontSize: '14px',
							padding: '10px 12px',
							backgroundColor: '#f8fafc',
							resize: 'none',
						}}
					/>
					<div className="d-flex justify-content-end mt-1">
						<Form.Text className="text-muted small">
							{formData.bio?.length || 0} / 300 karakter
						</Form.Text>
					</div>
				</Form.Group>
			</div>

			{/* Footer Actions */}
			<div className="p-3 border-top d-flex gap-2" style={{ borderColor: '#e2e8f0' }}>
				<Button
					variant="outline-secondary"
					className="shadow-none"
					style={{
						flex: 1,
						fontSize: '14px',
						borderRadius: '8px',
						border: '1.5px solid #cbd5e1',
						backgroundColor: '#ffffff',
						color: '#475569',
					}}
					onClick={() => onChangeSidebar('speaker-list')}
				>
					Batal
				</Button>
				<Button
					variant="primary"
					className="shadow-none"
					style={{
						flex: 2,
						fontSize: '14px',
						borderRadius: '8px',
						backgroundColor: formData.name && formData.role ? '#00699e' : '#cbd5e1',
						border: 'none',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: '6px',
					}}
					onClick={handleSubmit}
					disabled={!formData.name || !formData.role}
				>
					<Check size={16} /> Simpan Pembicara
				</Button>
			</div>
		</div>
	);
};

export default SpeakerForm;
