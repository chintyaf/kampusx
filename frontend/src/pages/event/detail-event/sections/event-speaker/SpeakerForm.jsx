import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, InputGroup } from 'react-bootstrap';
import Select from 'react-select';
import { User, Trash2, Plus } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';

import api from '../../../../../api/axios';

const SpeakerForm = ({ onCancel, onSave, initialData, eventId }) => {
	const isEdit = !!initialData;

	const [sessionOptions, setSessionOptions] = useState([]);
	const [isLoadingSessions, setIsLoadingSessions] = useState(false);

	// Opsi platform untuk dropdown social link
	const platformOptions = [
		'LinkedIn',
		'Instagram',
		'Twitter/X',
		'Facebook',
		'Website',
		'Lainnya',
	];

	const [formData, setFormData] = useState({
		name: '',
		role: '',
		bio: '',
		// social_links sekarang menggunakan array of object
		social_links: [{ platform: 'LinkedIn', url: '' }],
		expertise: [],
		sessions: [],
	});

	// 1. Fetching Sesi dari API
	useEffect(() => {
		const fetchEventSession = async () => {
			if (!eventId) return;

			setIsLoadingSessions(true);
			try {
				const response = await api.get(`event-dashboard/${eventId}/info-utama/session`);
				const result = response.data;

				if ((result.status === 'success' || result.success) && result.data?.sessions) {
					const formattedSessions = result.data.sessions.map((session) => ({
						value: session.id.toString(),
						label: session.name || session.title || `Sesi ${session.id}`,
					}));
					setSessionOptions(formattedSessions);
				}
			} catch (error) {
				console.error('Gagal mengambil data sesi:', error);
			} finally {
				setIsLoadingSessions(false);
			}
		};

		fetchEventSession();
	}, [eventId]);

	// 2. Mengisi form jika dalam mode Edit
	useEffect(() => {
		if (initialData) {
			let safeExpertise = [];
			if (Array.isArray(initialData.expertise)) {
				safeExpertise = initialData.expertise;
			} else if (typeof initialData.expertise === 'string') {
				try {
					safeExpertise = JSON.parse(initialData.expertise);
				} catch (error) {
					safeExpertise = [];
				}
			}

			// Handle Parsing JSON Social Links dari Database
			let parsedSocialLinks = [{ platform: 'LinkedIn', url: '' }];
			if (
				initialData.social_link &&
				Array.isArray(initialData.social_link) &&
				initialData.social_link.length > 0
			) {
				if (typeof initialData.social_link[0] === 'object') {
					parsedSocialLinks = initialData.social_link;
				} else {
					parsedSocialLinks = initialData.social_link.map((link) => ({
						platform: 'Lainnya',
						url: link,
					}));
				}
			}

			setFormData({
				name: initialData.name || '',
				role: initialData.role || '',
				bio: initialData.bio || '',
				social_links: parsedSocialLinks,
				expertise: safeExpertise.map((t) => {
					if (typeof t === 'string') return { value: t, label: t };
					return {
						value: t?.value || t?.id || '',
						label: t?.label || t?.name || '',
					};
				}),
				sessions:
					initialData.sessions && Array.isArray(initialData.sessions)
						? initialData.sessions.map((s) => {
								if (typeof s === 'string' || typeof s === 'number') {
									return {
										value: s.toString(),
										label: `Sesi ${s}`,
									};
								}
								return {
									value: s?.id ? s.id.toString() : s?.value || '',
									label: s?.name || s?.title || s?.label || `Sesi ${s?.id || ''}`,
								};
							})
						: [],
			});
		}
	}, [initialData]);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSocialLinkChange = (index, field, value) => {
		const updatedLinks = [...formData.social_links];
		updatedLinks[index][field] = value;
		setFormData({ ...formData, social_links: updatedLinks });
	};

	const addSocialLink = () => {
		setFormData({
			...formData,
			social_links: [...formData.social_links, { platform: 'LinkedIn', url: '' }],
		});
	};

	const removeSocialLink = (index) => {
		const updatedLinks = formData.social_links.filter((_, i) => i !== index);
		setFormData({ ...formData, social_links: updatedLinks });
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		// 1. VALIDASI MANUAL: Pastikan name dan role tidak kosong
		if (!formData.name.trim() || !formData.role.trim() || formData.bio.trim().length < 50 || formData.sessions.length === 0) {
			alert('Mohon lengkapi semua field yang diwajibkan (*), termasuk Biografi (min. 50 karakter) dan Sesi.');
			return; // Hentikan eksekusi jika data wajib kosong
		}

		const validSocialLinks = formData.social_links.filter((link) => link.url.trim() !== '');

		const payload = {
			id: initialData?.id,
			name: formData.name,
			role: formData.role,
			bio: formData.bio,
			social_link: validSocialLinks,
			expertise: formData.expertise.map((item) => item.label || item.value),
			sessions: formData.sessions.map((item) => item.value),
			session_details: formData.sessions.map((item) => ({
				id: item.value,
				name: item.label,
			})),
		};

		onSave(payload);
	};

	// Mengecek apakah form sudah valid untuk membuka kunci tombol submit
	const isFormValid = 
		formData.name.trim() !== '' && 
		formData.role.trim() !== '' && 
		(formData.bio?.trim().length || 0) >= 50 &&
		formData.sessions.length > 0;

	return (
		<Form className="border rounded-4 p-4 bg-white mb-4 shadow-sm" onSubmit={handleSubmit}>
			<h6 className="fw-bold mb-4">{isEdit ? 'Edit Speaker' : 'Tambah Speaker Baru'}</h6>
			<Row>
				<Col className="col-1 d-none d-md-block text-center text-muted">
					<div
						className="bg-light d-flex align-items-center justify-content-center rounded-circle border"
						style={{ width: '70px', height: '70px' }}>
						<User size={35} strokeWidth={1.5} className="text-secondary opacity-50" />
					</div>
				</Col>
				<Col>
					<Form.Group className="mb-3">
						<Form.Label>Nama Lengkap *</Form.Label>
						<Form.Control
							type="text"
							name="name"
							value={formData.name}
							onChange={handleChange}
							placeholder="Contoh: Budi Santoso, S.Kom"
							required
						/>
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label className="small fw-bold">Jabatan / Keahlian *</Form.Label>
						<Form.Control
							type="text"
							name="role"
							value={formData.role}
							onChange={handleChange}
							placeholder="Contoh: Senior AI Developer"
							required
						/>
					</Form.Group>

					<Form.Group className="mb-3">
						<Form.Label className="small fw-bold">Biografi Ringkas *</Form.Label>
						<Form.Control
							as="textarea"
							rows={3}
							name="bio"
							value={formData.bio}
							onChange={handleChange}
							placeholder="Ceritakan singkat latar belakang pembicara..."
							minLength={50} // Batas minimal karakter
							maxLength={500} // Batas maksimal karakter
							required
						/>
						{/* Indikator jumlah karakter */}
						<Form.Text className={'text-muted small d-block mt-1 text-end'}>
							{formData.bio?.length || 0} / 500 karakter
							{(formData.bio?.length || 0) < 50 && ' (Minimal 50 karakter)'}
						</Form.Text>
					</Form.Group>

					<Form.Group className="mb-3">
						<Form.Label className="small fw-bold d-flex justify-content-between align-items-center">
							Tautan Media Sosial
						</Form.Label>
						{formData.social_links.map((link, index) => (
							<InputGroup className="mb-2" key={index}>
								<Form.Select
									style={{ maxWidth: '130px' }}
									value={link.platform}
									onChange={(e) =>
										handleSocialLinkChange(index, 'platform', e.target.value)
									}>
									{platformOptions.map((opt) => (
										<option key={opt} value={opt}>
											{opt}
										</option>
									))}
								</Form.Select>
								<Form.Control
									type="url"
									placeholder="https://..."
									value={link.url}
									onChange={(e) =>
										handleSocialLinkChange(index, 'url', e.target.value)
									}
								/>
								{formData.social_links.length > 1 && (
									<Button
										variant="outline-danger"
										onClick={() => removeSocialLink(index)}>
										<Trash2 size={16} />
									</Button>
								)}
							</InputGroup>
						))}
						<Button
							variant="primary"
							className="align-self-end p-0 text-decoration-none small mt-1 d-flex align-items-center gap-1 px-3 py-2 "
							onClick={addSocialLink}>
							<Plus size={16} /> Tambah Link
						</Button>
					</Form.Group>

					{/* <Form.Group className="mb-3">
						<Form.Label className="small fw-bold">Expertise Tags</Form.Label>
						<CreatableSelect
							isMulti
							value={formData.expertise}
							onChange={(selected) =>
								setFormData({
									...formData,
									expertise: selected || [],
								})
							}
							components={{ DropdownIndicator: null }}
							placeholder="Ketik keahlian lalu tekan Enter..."
							classNamePrefix="select form-select"
							formatCreateLabel={(inputValue) => `Tambahkan "${inputValue}"`}
						/>
						<Form.Text className="text-muted small">
							Ketik dan tekan Enter untuk menambahkan.
						</Form.Text>
					</Form.Group> */}

					<Form.Group className="mb-3">
						<Form.Label className="small fw-bold">Pilih Sesi *</Form.Label>
						<Select
							isMulti
							isLoading={isLoadingSessions}
							isDisabled={isLoadingSessions}
							value={formData.sessions}
							onChange={(selected) =>
								setFormData({
									...formData,
									sessions: selected || [],
								})
							}
							options={sessionOptions}
							placeholder={isLoadingSessions ? 'Memuat sesi...' : 'Pilih Sesi...'}
							classNamePrefix="select form-select"
						/>
					</Form.Group>
				</Col>
			</Row>

			<div className="d-flex gap-2 justify-content-end mt-4">
				<Button variant="light" onClick={onCancel} className="px-4">
					Batal
				</Button>
				{/* 2. UBAH TYPE BUTTON DAN TAMBAHKAN KONDISI DISABLED */}
				<Button
					variant="primary"
					type="submit"
					className="px-4"
					disabled={isLoadingSessions || !isFormValid}>
					{isEdit ? 'Simpan Perubahan' : 'Simpan Speaker'}
				</Button>
			</div>
		</Form>
	);
};

export default SpeakerForm;
