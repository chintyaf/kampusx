import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { ArrowLeft, AlertCircle, FileText, Upload } from 'lucide-react';

const OrganizerForm = ({
	initialData,
	institutions = [],
	submitting = false,
	request = null,
	onSubmit,
	onCancel,
}) => {
	const [organizerType, setOrganizerType] = useState('internal');
	const [organizationName, setOrganizationName] = useState('');
	const [selectedInstitutionId, setSelectedInstitutionId] = useState('');
	const [customInstitutionName, setCustomInstitutionName] = useState('');
	const [proofFile, setProofFile] = useState(null);
	const [proofFileName, setProofFileName] = useState('');
	const [note, setNote] = useState('');

	useEffect(() => {
		if (initialData) {
			setOrganizerType(initialData.organizerType || 'internal');
			setOrganizationName(initialData.organizationName || '');
			setSelectedInstitutionId(initialData.selectedInstitutionId || '');
			setCustomInstitutionName(initialData.customInstitutionName || '');
			setNote(initialData.note || '');
			setProofFileName(initialData.proofFileName || '');
			setProofFile(null);
		}
	}, [initialData]);

	const handleSubmit = (e) => {
		e.preventDefault();

		if (!organizationName.trim()) {
			alert('Nama organisasi / himpunan / komunitas / perusahaan wajib diisi.');
			return;
		}

		if (organizerType === 'internal') {
			if (!selectedInstitutionId) {
				alert('Mohon pilih institusi afiliasi Anda.');
				return;
			}
			if (selectedInstitutionId === 'custom' && !customInstitutionName.trim()) {
				alert('Nama institusi kustom wajib diisi.');
				return;
			}
		}

		if (!proofFile && !request?.proof_path) {
			alert('Mohon unggah berkas bukti fisik Anda.');
			return;
		}

		const formData = new FormData();
		formData.append('organization_name', organizationName);

		if (organizerType === 'internal') {
			if (selectedInstitutionId !== 'custom') {
				formData.append('institution_id', selectedInstitutionId);
			} else {
				formData.append('custom_institution_name', customInstitutionName);
			}
		} else {
			formData.append('institution_id', '');
			formData.append('custom_institution_name', '');
		}

		if (proofFile) {
			formData.append('proof', proofFile);
		}
		if (note.trim()) {
			formData.append('note', note);
		}

		onSubmit(formData);
	};

	return (
		<Form onSubmit={handleSubmit} className="text-start animate__animated animate__fadeIn">
			{/* Header */}
			<div className="d-flex align-items-center gap-2 mb-4">
				<Button
					type="button"
					variant="outline-secondary"
					size="sm"
					className="p-0 rounded-circle d-inline-flex align-items-center justify-content-center"
					onClick={onCancel}
					style={{ width: 32, height: 32 }}
				>
					<ArrowLeft size={16} />
				</Button>
				<h3 className="fw-bold m-0" style={{ fontSize: 18, letterSpacing: '-0.5px' }}>
					Formulir Pengajuan
				</h3>
			</div>

			{/* Banner Alasan Penolakan */}
			{request && request.status === 'rejected' && request.rejection_reason && (
				<Alert variant="danger" className="mb-4 animate__animated animate__fadeIn p-3">
					<h6
						className="fw-bold mb-1 d-flex align-items-center gap-2"
						style={{ fontSize: 13 }}
					>
						<AlertCircle size={15} /> Alasan Penolakan:
					</h6>
					<p className="m-0" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
						"{request.rejection_reason}"
					</p>
				</Alert>
			)}

			{/* Tipe Penyelenggara */}
			<Form.Group className="mb-4">
				<Form.Label className="fw-bold mb-2" style={{ fontSize: 13 }}>
					Tipe Penyelenggara <span className="text-danger">*</span>
				</Form.Label>
				<Row className="g-2">
					{/* Kartu Radio 1: Internal */}
					<Col xs={12} sm={6}>
						<div
							onClick={() => {
								setOrganizerType('internal');
								setSelectedInstitutionId('');
								setCustomInstitutionName('');
							}}
							style={{
								border: `2px solid ${organizerType === 'internal' ? 'var(--primary, #0d6efd)' : '#e2e8f0'}`,
								backgroundColor:
									organizerType === 'internal' ? '#eff6ff' : '#ffffff',
								borderRadius: 10,
								padding: 12,
								cursor: 'pointer',
								transition: 'all 0.2s',
								height: '100%',
							}}
							className="d-flex align-items-start gap-2 shadow-sm-hover"
						>
							<Form.Check
								type="radio"
								name="organizerType"
								checked={organizerType === 'internal'}
								onChange={() => {}}
								style={{ cursor: 'pointer' }}
							/>
							<div>
								<h6
									className="fw-bold mb-1"
									style={{
										fontSize: 13,
										color:
											organizerType === 'internal'
												? 'var(--primary, #0d6efd)'
												: '#1e293b',
									}}
								>
									Institusi
								</h6>
								<p
									className="text-secondary m-0"
									style={{ fontSize: 11, lineHeight: 1.3 }}
								>
									BEM, Himpunan, UKM, atau organisasi internal/afiliasi resmi.
								</p>
							</div>
						</div>
					</Col>

					{/* Kartu Radio 2: Independen */}
					<Col xs={12} sm={6}>
						<div
							onClick={() => {
								setOrganizerType('independent');
								setSelectedInstitutionId('');
								setCustomInstitutionName('');
							}}
							style={{
								border: `2px solid ${organizerType === 'independent' ? 'var(--primary, #0d6efd)' : '#e2e8f0'}`,
								backgroundColor:
									organizerType === 'independent' ? '#eff6ff' : '#ffffff',
								borderRadius: 10,
								padding: 12,
								cursor: 'pointer',
								transition: 'all 0.2s',
								height: '100%',
							}}
							className="d-flex align-items-start gap-2 shadow-sm-hover"
						>
							<Form.Check
								type="radio"
								name="organizerType"
								checked={organizerType === 'independent'}
								onChange={() => {}}
								style={{ cursor: 'pointer' }}
							/>
							<div>
								<h6
									className="fw-bold mb-1"
									style={{
										fontSize: 13,
										color:
											organizerType === 'independent'
												? 'var(--primary, #0d6efd)'
												: '#1e293b',
									}}
								>
									EO Independen / Umum
								</h6>
								<p
									className="text-secondary m-0"
									style={{ fontSize: 11, lineHeight: 1.3 }}
								>
									Komunitas, instansi luar, agensi, atau tim eksternal.
								</p>
							</div>
						</div>
					</Col>
				</Row>
			</Form.Group>

			{/* Input 1: Nama Organisasi */}
			<Form.Group className="mb-3">
				<Form.Label className="fw-bold mb-2" style={{ fontSize: 13 }}>
					Nama Organisasi
				</Form.Label>
				<Form.Control
					type="text"
					placeholder={
						organizerType === 'internal'
							? 'BEM FT, Himpunan Informatika, dll.'
							: 'PT Kreatif Mandiri, EO Jaya, dll.'
					}
					value={organizationName}
					onChange={(e) => setOrganizationName(e.target.value)}
					required
					style={{ padding: '8px 12px', fontSize: 13, borderRadius: 8 }}
				/>
			</Form.Group>

			{/* Input 2: Pilihan Institusi (Hanya untuk Internal) */}
			{organizerType === 'internal' && (
				<Form.Group className="mb-3 animate__animated animate__fadeIn">
					<Form.Label className="fw-bold mb-1" style={{ fontSize: 13 }}>
						Institusi Afiliasi <span className="text-danger">*</span>
					</Form.Label>
					<Form.Select
						value={selectedInstitutionId}
						onChange={(e) => setSelectedInstitutionId(e.target.value)}
						required
						style={{ padding: '8px 12px', fontSize: 13, borderRadius: 8 }}
					>
						<option value="">-- Pilih Institusi --</option>
						{institutions.map((inst) => (
							<option key={inst.id} value={inst.id}>
								{inst.name}
							</option>
						))}
						<option value="custom">Tulis Institusi Baru (Manual)</option>
					</Form.Select>
				</Form.Group>
			)}

			{/* Input 3: Tulis Kustom */}
			{organizerType === 'internal' && selectedInstitutionId === 'custom' && (
				<Form.Group className="mb-3 animate__animated animate__fadeIn">
					<Form.Label className="fw-bold mb-1" style={{ fontSize: 13 }}>
						Nama Institusi <span className="text-danger">*</span>
					</Form.Label>
					<Form.Control
						type="text"
						placeholder="Tulis nama institusi lengkap..."
						value={customInstitutionName}
						onChange={(e) => setCustomInstitutionName(e.target.value)}
						required
						style={{ padding: '8px 12px', fontSize: 13, borderRadius: 8 }}
					/>
				</Form.Group>
			)}

			{/* Input 4: Bukti Fisik */}
			<Form.Group className="mb-3">
				<Form.Label className="fw-bold mb-1" style={{ fontSize: 13 }}>
					Berkas Bukti Pendukung <span className="text-danger">*</span>
				</Form.Label>
				<label
					htmlFor="proof-upload"
					style={{
						border: '2px dashed #cbd5e1',
						borderRadius: '8px',
						padding: '16px',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						cursor: 'pointer',
						backgroundColor: '#f8fafc',
						transition: 'all 0.2s',
						textAlign: 'center',
						width: '100%',
					}}
				>
					<input
						type="file"
						id="proof-upload"
						accept=".jpeg,.png,.jpg,.pdf"
						style={{ display: 'none' }}
						onChange={(e) => {
							if (e.target.files && e.target.files[0]) {
								const file = e.target.files[0];
								if (file.size > 5 * 1024 * 1024) {
									alert('Ukuran file maksimal adalah 5MB.');
									return;
								}
								setProofFile(file);
								setProofFileName(file.name);
							}
						}}
					/>
					{proofFileName ? (
						<div className="d-flex flex-column align-items-center gap-1">
							<FileText size={24} className="text-success" />
							<span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
								{proofFileName}
							</span>
							<span style={{ fontSize: '11px', color: '#64748b' }}>
								Klik untuk mengganti berkas
							</span>
						</div>
					) : (
						<div className="d-flex flex-column align-items-center gap-1">
							<Upload size={24} className="text-secondary" style={{ opacity: 0.8 }} />
							<span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
								Pilih SK, KTM, atau Portofolio (Max 5MB)
							</span>
							<span style={{ fontSize: '11px', color: '#64748b' }}>
								Format: JPG, PNG, PDF
							</span>
						</div>
					)}
				</label>
			</Form.Group>

			{/* Input 5: Catatan Tambahan */}
			<Form.Group className="mb-4">
				<Form.Label className="fw-bold mb-1" style={{ fontSize: 13 }}>
					Tautan / Catatan Tambahan{' '}
					<span className="text-muted fw-normal">(Opsional)</span>
				</Form.Label>
				<Form.Control
					as="textarea"
					rows={8}
					placeholder="Website, media sosial, portofolio, atau informasi pendukung lainnya..."
					value={note}
					onChange={(e) => setNote(e.target.value)}
					style={{
						padding: '8px 12px',
						fontSize: 13,
						borderRadius: 8,
						resize: 'none',
					}}
				/>
			</Form.Group>

			{/* Tombol Aksi - Fleksibel & Responsif */}
			<div className="d-flex flex-column flex-sm-row justify-content-sm-end gap-2 mt-4 pt-3 border-top">
				<Button
					type="button"
					variant="outline-secondary"
					className="px-3 w-100 w-sm-auto order-2 order-sm-1 d-flex justify-content-center"
					style={{ borderRadius: 8, fontSize: 13 }}
					onClick={onCancel}
					disabled={submitting}
				>
					Batal
				</Button>
				<Button
					type="submit"
					variant="primary"
					className="px-4 fw-semibold w-100 w-sm-auto order-1 order-sm-2 d-flex justify-content-center"
					style={{ borderRadius: 8, fontSize: 13 }}
					disabled={submitting}
				>
					{submitting ? (
						<>
							<Spinner animation="border" size="sm" className="me-2" />
							Mengirim...
						</>
					) : (
						'Kirim Pengajuan'
					)}
				</Button>
			</div>
		</Form>
	);
};

export default OrganizerForm;
