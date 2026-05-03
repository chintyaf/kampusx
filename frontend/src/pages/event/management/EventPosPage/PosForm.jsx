import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Button, Spinner, Row, Col } from 'react-bootstrap';
import { MapPin, Check } from 'lucide-react';
import ModalBox from '@/components/dashboard/ModalBox';
import api from '@/api/axios';
import { notify } from '@/utils/notify';
import DaySelectionGroup from './DaySelectionGroup';

const PosForm = ({ show, onHide, onSave, posData }) => {
	const { eventId } = useParams();
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Mock data hari (Sesuaikan dengan data dari API Event Anda nantinya)
	const availableDays = [
		{ id: 1, label: 'Hari 1', date: 'Senin, 18 Agu 2025', isAvailable: true },
		{ id: 2, label: 'Hari 2', date: 'Selasa, 19 Agu 2025', isAvailable: true },
		{ id: 3, label: 'Hari 3', date: 'Rabu, 20 Agu 2025', isAvailable: false },
	];

	const [formData, setFormData] = useState({
		namaPos: '',
		deskripsi: '',
		selectedDays: [],
		isActive: true,
	});

	const isEditMode = Boolean(posData);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleDayToggle = (dayId) => {
		setFormData((prev) => ({
			...prev,
			selectedDays: prev.selectedDays.includes(dayId)
				? prev.selectedDays.filter((id) => id !== dayId)
				: [...prev.selectedDays, dayId],
		}));
	};

	const handleSelectAllDays = () => {
		const allActiveDayIds = availableDays.filter((d) => d.isAvailable).map((d) => d.id);

		setFormData((prev) => ({ ...prev, selectedDays: allActiveDayIds }));
	};

	const handleSubmit = async (e) => {
		if (e) e.preventDefault();
		setIsSubmitting(true);

		try {
			const payload = {
				name: formData.namaPos,
				description: formData.deskripsi,
				days: formData.selectedDays,
				is_active: formData.isActive,
			};

			if (isEditMode) {
				await api.put(`/event-dashboard/${eventId}/stations/${posData.id}`, payload);
				notify('success', 'Berhasil', 'Data pos berhasil diperbarui.');
			} else {
				await api.post(`/event-dashboard/${eventId}/stations`, payload);
				notify('success', 'Berhasil', 'Pos baru berhasil ditambahkan.');
			}

			if (onSave) onSave();
			onHide();
		} catch (err) {
			notify('error', 'Gagal', 'Terjadi kesalahan saat menyimpan data pos.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleChangeDays = (newDaysArray) => {
		setFormData((prev) => ({ ...prev, selectedDays: newDaysArray }));
	};

	useEffect(() => {
		if (posData) {
			setFormData({
				namaPos: posData.name || '',
				deskripsi: posData.description || '',
				selectedDays: posData.days || [],
				isActive: posData.status === 'Aktif',
			});
		} else {
			setFormData({
				namaPos: '',
				deskripsi: '',
				selectedDays: [],
				isActive: true,
			});
		}
	}, [posData, show]);

	// Derived state untuk validasi tombol submit
	const isFormValid = formData.namaPos.trim() !== '' && formData.selectedDays.length > 0;

	return (
		<ModalBox
			show={show}
			onHide={onHide}
			title={isEditMode ? 'Edit Pos' : 'Tambah Pos Baru'}
			icon={MapPin} // Menggunakan icon MapPin di header modal sesuai gambar
			size="md">
			{/* ── NAMA POS ── */}
			<Form.Group className="mb-3">
				<Form.Label className="fw-bold small">
					Nama Pos <span className="text-danger">*</span>
				</Form.Label>
				<Form.Control
					type="text"
					name="namaPos"
					value={formData.namaPos}
					onChange={handleChange}
					placeholder="cth. Meja Registrasi Auditorium, Check-in Lab A..."
					className="bg-light"
					required
				/>
			</Form.Group>

			{/* ── DESKRIPSI ── */}
			<Form.Group className="mb-3">
				<Form.Label className="fw-bold small text-muted">
					Deskripsi <span className="fw-normal">(opsional)</span>
				</Form.Label>
				<Form.Control
					as="textarea"
					rows={3}
					name="deskripsi"
					value={formData.deskripsi}
					onChange={handleChange}
					placeholder="Keterangan lokasi atau fungsi pos ini..."
					className="bg-light"
					style={{ resize: 'none' }}
				/>
			</Form.Group>

			{/* ── BERLAKU PADA HARI ── */}
			<DaySelectionGroup
				eventId={eventId}
				selectedDays={formData.selectedDays}
				onChange={handleChangeDays}
			/>

			{/* ── STATUS ── */}
			<Form.Group className="mb-4">
				<Form.Label className="fw-bold small">Status</Form.Label>
				<Row className="g-2">
					<Col>
						<div
							onClick={() => setFormData((prev) => ({ ...prev, isActive: true }))}
							style={{
								cursor: 'pointer',
								padding: '12px',
								textAlign: 'center',
								borderRadius: '10px',
								fontWeight: '600',
								fontSize: '14px',
								transition: 'all 0.2s',
								// Style saat Aktif dipilih
								backgroundColor: formData.isActive ? '#e8f5e9' : '#ffffff',
								color: formData.isActive ? '#2e7d32' : '#64748b',
								border: formData.isActive
									? '2px solid #4caf50'
									: '1px solid #e2e8f0',
							}}>
							Aktif
						</div>
					</Col>
					<Col>
						<div
							onClick={() => setFormData((prev) => ({ ...prev, isActive: false }))}
							style={{
								cursor: 'pointer',
								padding: '12px',
								textAlign: 'center',
								borderRadius: '10px',
								fontWeight: '600',
								fontSize: '14px',
								transition: 'all 0.2s',
								// Style saat Tidak Aktif dipilih
								backgroundColor: !formData.isActive ? '#f8fafc' : '#ffffff',
								color: !formData.isActive ? '#1e293b' : '#64748b',
								border: !formData.isActive
									? '2px solid #94a3b8'
									: '1px solid #e2e8f0',
							}}>
							Tidak Aktif
						</div>
					</Col>
				</Row>
			</Form.Group>

			{/* ── FOOTER BUTTONS ── */}
			<div className="d-flex gap-2 pt-3 border-top">
				<Button
					variant="outline-secondary"
					className="w-100 py-2 fw-bold"
					onClick={onHide}
					style={{
						borderRadius: '12px',
						border: '1.5px solid #e2e8f0',
						color: '#64748b',
						backgroundColor: '#ffffff',
					}}>
					Batal
				</Button>
				<Button
					variant="primary"
					className="w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
					onClick={handleSubmit}
					disabled={isSubmitting || !isFormValid}
					style={{
						borderRadius: '12px',
						border: 'none',
						// Warna biru pudar jika belum valid (sesuai gambar)
						backgroundColor: isSubmitting || !isFormValid ? '#cbd5e1' : '#1e3a8a',
						color: '#ffffff',
					}}>
					{isSubmitting ? (
						<Spinner size="sm" />
					) : (
						<>
							<Check size={18} strokeWidth={3} />
							{isEditMode ? 'Simpan Perubahan' : 'Tambah Pos'}
						</>
					)}
				</Button>
			</div>
		</ModalBox>
	);
};

export default PosForm;
