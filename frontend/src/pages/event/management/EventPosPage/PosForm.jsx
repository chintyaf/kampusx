import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { CheckCircle2 } from 'lucide-react';
import ModalBox from '@/components/dashboard/ModalBox';
import api from '@/api/axios';
import { notify } from '@/utils/notify';

const PosForm = ({ show, onHide, onSave, posData }) => {
	const { eventId } = useParams();

	// State Loading
	const [isSubmitting, setIsSubmitting] = useState(false);

	// State untuk menampung isian form
	const [formData, setFormData] = useState({
		namaPos: '',
		description: '',
		isActive: true, // Default true saat tambah baru
	});
	const [photo, setPhoto] = useState(null);
	const [photoPreview, setPhotoPreview] = useState('');

	// Cek apakah form dalam mode Edit
	const isEditMode = Boolean(posData);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setPhoto(file);
			setPhotoPreview(URL.createObjectURL(file));
		}
	};

	// Handle saat form disubmit
	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const payload = new FormData();
			payload.append('name', formData.namaPos);
			payload.append('description', formData.description || '');
			payload.append('is_active', formData.isActive ? 1 : 0);

			if (photo) {
				payload.append('photo', photo);
			}

			let response;
			if (isEditMode) {
				// Spoof method PUT agar Laravel bisa membaca request multipart/form-data
				payload.append('_method', 'PUT');
				response = await api.post(
					`/event-dashboard/${eventId}/stations/${posData.id}`,
					payload,
					{
						headers: {
							'Content-Type': 'multipart/form-data',
						},
					},
				);
				notify('success', 'Berhasil', 'Data pos berhasil diperbarui.');
			} else {
				// Mode Tambah: Gunakan POST
				response = await api.post(`/event-dashboard/${eventId}/stations`, payload, {
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				});
				notify('success', 'Berhasil', 'Pos baru berhasil ditambahkan.');
			}

			if (onSave) onSave(formData); // Beritahu parent (EventPosPage) untuk refresh data
			onHide(); // Tutup modal
		} catch (err) {
			console.error('Error:', err);
			notify('error', 'Gagal', 'Terjadi kesalahan saat menyimpan data pos.');
		} finally {
			setIsSubmitting(false);
		}
	};

	useEffect(() => {
		if (posData) {
			// Mode Edit: Isi form dengan data yang diklik
			setFormData({
				namaPos: posData.name,
				description: posData.description || '',
				// Ubah string status "Aktif" / "Tidak Aktif" menjadi boolean untuk Switch
				isActive: posData.status === 'Aktif',
			});
			setPhoto(null);
			setPhotoPreview(posData.photo_url || '');
		} else {
			// Mode Tambah: Reset form
			setFormData({
				namaPos: '',
				description: '',
				isActive: true,
			});
			setPhoto(null);
			setPhotoPreview('');
		}
	}, [posData]);

	return (
		<ModalBox
			show={show}
			onHide={onHide}
			title={isEditMode ? 'Edit Pos' : 'Tambah Pos Baru'}
			subtitle={
				isEditMode
					? 'Perbarui nama dan status pos akses ini.'
					: 'Buat pos baru dan atur kode akses (PIN) untuk petugas scan.'
			}
			size="md"
		>
			{/* ── Input NAMA POS ── */}
			<Form.Group className="mb-4">
				<Form.Label className="fw-bold required">Nama Pos</Form.Label>
				<InputGroup>
					<Form.Control
						type="text"
						name="namaPos"
						value={formData.namaPos}
						onChange={handleChange}
						placeholder="Contoh: Pintu Masuk Utama"
						required
						disabled={isSubmitting}
					/>
				</InputGroup>
			</Form.Group>

			<Form.Group className="mb-4">
				<Form.Label className="fw-bold required">Deskripsi</Form.Label>
				<InputGroup>
					<Form.Control
						as="textarea"
						rows={3}
						name="description"
						value={formData.description}
						onChange={handleChange}
						// placeholder="Contoh: Pintu Masuk Utama"
						required
						disabled={isSubmitting}
					/>
				</InputGroup>
			</Form.Group>

			{/* ── Input FOTO POS ── */}
			<Form.Group className="mb-4">
				<Form.Label className="fw-bold">Foto Pos (Optional)</Form.Label>
				<div className="d-flex flex-column align-items-center gap-3 p-3 border rounded-3 bg-light text-center">
					{photoPreview ? (
						<div className="position-relative">
							<img
								src={photoPreview}
								alt="Preview Pos"
								style={{
									width: '120px',
									height: '120px',
									borderRadius: '12px',
									objectFit: 'cover',
									border: '2px solid var(--primary, #000)',
								}}
							/>
							<Button
								variant="danger"
								size="sm"
								className="position-absolute top-0 end-0 rounded-circle"
								style={{
									transform: 'translate(40%, -40%)',
									padding: '2px 6px',
									fontSize: '10px',
								}}
								onClick={() => {
									setPhoto(null);
									setPhotoPreview('');
								}}
							>
								✕
							</Button>
						</div>
					) : (
						<div
							className="d-flex align-items-center justify-content-center bg-white border border-dashed rounded-3 text-muted"
							style={{ width: '120px', height: '120px', fontSize: '12px' }}
						>
							Belum ada foto
						</div>
					)}
					<div className="w-100">
						<Form.Control
							type="file"
							accept="image/*"
							onChange={handleFileChange}
							disabled={isSubmitting}
							style={{ fontSize: '13px' }}
						/>
						<small className="text-muted mt-1 d-block" style={{ fontSize: '11px' }}>
							Rekomendasi rasio 1:1, tipe file JPG/PNG maks. 2MB.
						</small>
					</div>
				</div>
			</Form.Group>

			{/* ── Toggle STATUS POS ── */}
			<Form.Group className="mb-4">
				<Form.Label className="fw-bold">Status Pos</Form.Label>
				<label
					className="d-flex align-items-center justify-content-between p-3 bg-white border rounded-3 shadow-sm-hover transition-all"
					style={{
						cursor: isSubmitting ? 'not-allowed' : 'pointer',
						opacity: isSubmitting ? 0.7 : 1,
					}}
				>
					<div>
						<p className="mb-0 fw-bold text-dark" style={{ fontSize: '14px' }}>
							Pos Aktif
						</p>
						<p className="mb-0 text-muted" style={{ fontSize: '12px' }}>
							Jika dimatikan, petugas tidak bisa menggunakan pos ini.
						</p>
					</div>
					<Form.Check
						type="switch"
						name="isActive"
						className="custom-soft-switch d-flex align-items-center m-0"
						checked={formData.isActive}
						onChange={handleChange}
						id="status-switch"
						disabled={isSubmitting}
					/>
				</label>
			</Form.Group>

			{/* ── Footer / Aksi ── */}
			<div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
				<Button
					variant="light"
					onClick={onHide}
					className="px-4 text-secondary border"
					disabled={isSubmitting}
				>
					Batal
				</Button>
				<Button
					type="submit"
					variant="primary"
					onClick={handleSubmit}
					disabled={isSubmitting || !formData.namaPos.trim()} // Validasi jika nama kosong
					className="d-flex align-items-center gap-2 px-4 fw-bold shadow-sm"
					style={{ backgroundColor: '#000', border: 'none' }}
				>
					{isSubmitting ? (
						<>
							<Spinner animation="border" size="sm" />
							Menyimpan...
						</>
					) : (
						<>
							<CheckCircle2 size={18} />
							Simpan Pos
						</>
					)}
				</Button>
			</div>
		</ModalBox>
	);
};

export default PosForm;
