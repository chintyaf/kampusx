import { useState } from 'react';
import { Form } from 'react-bootstrap';
import Select from 'react-select';
import api from '@/api/axios';
import UploadImage from './UploadImage';

const EventForm = ({ formData, setFormData, touched, handleBlur, handleTextChange }) => {
	// ==========================================
	// STATE UNTUK OPTIONS & LOADING DROPDOWN
	// ==========================================
	const [kategoriOptions, setKategoriOptions] = useState([]);
	const [isKategoriLoading, setIsKategoriLoading] = useState(false);
	const [isKategoriFetched, setIsKategoriFetched] = useState(false);

	const [eventTypeOptions, setEventTypeOptions] = useState([]);
	const [isEventTypeLoading, setIsEventTypeLoading] = useState(false);
	const [isEventTypeFetched, setIsEventTypeFetched] = useState(false);

	const handleSelectChange = (field, selectedOptions) => {
		setFormData((prev) => ({ ...prev, [field]: selectedOptions || [] }));
	};

	// ==========================================
	// FETCH DATA DROPDOWN
	// ==========================================
	const fetchEventTypes = async () => {
		if (isEventTypeFetched) return;
		setIsEventTypeLoading(true);
		try {
			const res = await api.get('/event-types');
			if (res.data.success) {
				setEventTypeOptions(
					res.data.data.map((type) => ({
						value: type.id.toString(),
						label: type.name,
					})),
				);
				setIsEventTypeFetched(true);
			}
		} catch (error) {
			console.error('Gagal mengambil opsi event type:', error);
		} finally {
			setIsEventTypeLoading(false);
		}
	};

	const fetchCategories = async () => {
		if (isKategoriFetched) return;
		setIsKategoriLoading(true);
		try {
			const res = await api.get('/categories');
			if (res.data.success) {
				setKategoriOptions(
					res.data.data.map((cat) => ({
						value: cat.id.toString(),
						label: cat.name,
					})),
				);
				setIsKategoriFetched(true);
			}
		} catch (error) {
			console.error('Gagal mengambil opsi kategori:', error);
		} finally {
			setIsKategoriLoading(false);
		}
	};

	return (
		<>
			<Form className="form">
				{/* BAGIAN 1: INFORMASI UTAMA */}
				<Form.Group className="mb-4" controlId="formTitle">
					<Form.Label className="required">Nama Event</Form.Label>
					<Form.Control
						required
						type="text"
						name="title"
						value={formData.title}
						onChange={handleTextChange}
						onBlur={() => handleBlur('title')}
						placeholder="Masukan nama event (misal: Seminar Nasional Teknologi)"
						isInvalid={touched.title && formData.title?.trim() === ''}
					/>
					<Form.Control.Feedback type="invalid">
						Nama event wajib diisi.
					</Form.Control.Feedback>
				</Form.Group>

				<Form.Group className="mb-4" controlId="formDescription">
					<Form.Label className="required">Deskripsi Lengkap</Form.Label>
					<Form.Control
						as="textarea"
						rows={5}
						name="description"
						value={formData.description}
						onChange={handleTextChange}
						onBlur={() => handleBlur('description')}
						placeholder="Jelaskan mengenai tujuan, agenda, dan informasi penting lainnya dari event ini."
						isInvalid={
							touched.description &&
							(formData.description?.trim() === '' ||
								formData.description?.trim().length < 50)
						}
					/>
					<div className="d-flex justify-content-between align-items-start mt-1">
						<div>
							{touched.description &&
								(formData.description?.trim() === '' ? (
									<div className="text-danger small">
										Deskripsi event wajib diisi.
									</div>
								) : (formData.description?.trim().length || 0) < 50 ? (
									<div className="text-danger small">
										Deskripsi minimal 50 karakter (saat ini{' '}
										{formData.description?.trim().length || 0} karakter).
									</div>
								) : null)}
						</div>
						<Form.Text className="text-muted small text-end">
							{formData.description?.length || 0} / 1000 karakter
							{(formData.description?.length || 0) < 50 && ' (Minimal 50 karakter)'}
						</Form.Text>
					</div>
				</Form.Group>

				<Form.Group className="mb-4">
					<Form.Label className="form-label required">Tipe Event</Form.Label>
					<Select
						isMulti
						value={formData.eventType}
						options={eventTypeOptions}
						isLoading={isEventTypeLoading}
						onMenuOpen={fetchEventTypes}
						placeholder="Pilih Tipe Event (Bisa lebih dari satu)..."
						className="react-select-container"
						classNamePrefix="react-select"
						onChange={(selected) => {
							handleSelectChange('eventType', selected);
							handleBlur('eventType');
						}}
						onBlur={() => handleBlur('eventType')}
						styles={{
							control: (baseStyles) => ({
								...baseStyles,
								borderColor:
									touched.eventType && formData.eventType?.length === 0
										? '#dc3545'
										: baseStyles.borderColor,
								'&:hover': {
									borderColor:
										touched.eventType && formData.eventType?.length === 0
											? '#dc3545'
											: baseStyles.borderColor,
								},
							}),
						}}
					/>
					{touched.eventType && formData.eventType?.length === 0 && (
						<div className="text-danger small mt-1">Pilih minimal satu tipe event.</div>
					)}
				</Form.Group>

				<Form.Group className="mb-4">
					<Form.Label className="required">Kategori Event</Form.Label>
					<Select
						isMulti
						value={formData.kategori}
						options={kategoriOptions}
						isLoading={isKategoriLoading}
						onMenuOpen={fetchCategories}
						placeholder="Pilih kategori (Bisa lebih dari satu)..."
						className="react-select-container"
						classNamePrefix="react-select"
						onChange={(selected) => {
							handleSelectChange('kategori', selected);
							handleBlur('kategori');
						}}
						onBlur={() => handleBlur('kategori')}
						styles={{
							control: (baseStyles) => ({
								...baseStyles,
								borderColor:
									touched.kategori && formData.kategori?.length === 0
										? '#dc3545'
										: baseStyles.borderColor,
								'&:hover': {
									borderColor:
										touched.kategori && formData.kategori?.length === 0
											? '#dc3545'
											: baseStyles.borderColor,
								},
							}),
						}}
					/>
					{touched.kategori && formData.kategori?.length === 0 && (
						<div className="text-danger small mt-1">
							Pilih minimal satu kategori event.
						</div>
					)}
				</Form.Group>

				{/* BAGIAN 2: TAMBAHAN */}
				<Form.Group className="mb-4">
					<Form.Label className="required">Zona Waktu</Form.Label>
					<Form.Select
						name="timezone"
						value={formData.timezone}
						onChange={handleTextChange}
						onBlur={() => handleBlur('timezone')}
						className="form-select shadow-none"
						isInvalid={touched.timezone && formData.timezone?.trim() === ''}
						style={{
							border:
								touched.timezone && formData.timezone?.trim() === ''
									? '1.5px solid #dc3545'
									: '1.5px solid #cbd5e1',
							borderRadius: '8px',
							fontSize: '14px',
							padding: '10px 12px',
							backgroundColor: '#f8fafc',
						}}
					>
						<option value="Asia/Jakarta">Asia/Jakarta (WIB - GMT+7)</option>
						<option value="Asia/Makassar">Asia/Makassar (WITA - GMT+8)</option>
						<option value="Asia/Jayapura">Asia/Jayapura (WIT - GMT+9)</option>
						<option value="UTC">UTC (GMT+0)</option>
					</Form.Select>
					<Form.Control.Feedback type="invalid">
						Zona waktu wajib diisi.
					</Form.Control.Feedback>
				</Form.Group>

				<UploadImage
					formData={formData}
					setFormData={setFormData}
				/>

				{touched.banner && !formData.banner && (
					<div className="text-danger small mt-2 text-center">
						Poster/gambar cover event wajib diunggah.
					</div>
				)}
			</Form>
		</>
	);
};

export default EventForm;
