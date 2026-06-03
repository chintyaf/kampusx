import React, { useState, useEffect } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { CheckCircle2, AlertCircle, ShieldAlert, Award, Calendar, Users, QrCode, Clock, FileText, ArrowLeft, Upload } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const ApplyOrganizerPage = () => {
	const { token, user } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const [request, setRequest] = useState(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	// Form States
	const [showForm, setShowForm] = useState(false);
	const [organizerType, setOrganizerType] = useState('internal'); // 'internal' | 'independent'
	const [institutions, setInstitutions] = useState([]);
	const [organizationName, setOrganizationName] = useState('');
	const [selectedInstitutionId, setSelectedInstitutionId] = useState('');
	const [customInstitutionName, setCustomInstitutionName] = useState('');
	const [proofFile, setProofFile] = useState(null);
	const [proofFileName, setProofFileName] = useState('');
	const [note, setNote] = useState('');

	useEffect(() => {
		if (!user) {
			navigate('/register');
			return;
		}
		fetchRequestStatus();
		fetchInstitutions();
	}, [user]);

	const fetchRequestStatus = async () => {
		try {
			setLoading(true);
			const response = await api.get('/organizer-requests/status');
			const reqData = response.data.data;
			setRequest(reqData);

			// Jika dipicu oleh klik notifikasi penolakan, otomatis buka form dengan prefill
			if (reqData && reqData.status === 'rejected' && reqData.can_resubmit && location.state?.autoResubmit) {
				const isInternal = reqData.institution_id || reqData.custom_institution_name;
				setOrganizerType(isInternal ? 'internal' : 'independent');
				setOrganizationName(reqData.organization_name || '');
				setSelectedInstitutionId(reqData.institution_id || (reqData.custom_institution_name ? 'custom' : ''));
				setCustomInstitutionName(reqData.custom_institution_name || '');
				setNote(reqData.note || '');
				setProofFileName(reqData.proof_path ? 'Dokumen Bukti Sebelumnya (Tetap digunakan jika tidak diganti)' : '');
				setProofFile(null);

				setShowForm(true);

				// Ganti router state agar jika direfresh form tidak terus-terusan mengembang
				navigate(window.location.pathname, { replace: true });
			}
		} catch (error) {
			console.error('Gagal mengambil status pengajuan:', error);
		} finally {
			setLoading(false);
		}
	};

	const fetchInstitutions = async () => {
		try {
			const response = await api.get('/institutions');
			setInstitutions(response.data.data || response.data || []);
		} catch (error) {
			console.error('Gagal mengambil daftar institusi:', error);
		}
	};

	const handleApply = async (e) => {
		if (e) e.preventDefault();

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

		try {
			setSubmitting(true);
			const formData = new FormData();
			formData.append('organization_name', organizationName);

			if (organizerType === 'internal') {
				if (selectedInstitutionId !== 'custom') {
					formData.append('institution_id', selectedInstitutionId);
				} else {
					formData.append('custom_institution_name', customInstitutionName);
				}
			} else {
				// Pastikan kosong untuk EO Independen / Luar
				formData.append('institution_id', '');
				formData.append('custom_institution_name', '');
			}

			if (proofFile) {
				formData.append('proof', proofFile);
			}
			if (note.trim()) {
				formData.append('note', note);
			}

			await api.post('/organizer-requests/apply', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			setShowForm(false);
			fetchRequestStatus();
		} catch (error) {
			console.error('Gagal mengajukan permohonan:', error);
			alert(error.response?.data?.message || 'Terjadi kesalahan saat mengirim pengajuan.');
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					minHeight: '60vh',
				}}
			>
				<Spinner animation="border" style={{ color: 'var(--primary)' }} />
			</div>
		);
	}

	const renderContent = () => {
		// 1. Jika showForm aktif, langsung tampilkan form registrasi/koreksi (bisa menyimpan context request)
		if (showForm) {
			return (
				<form onSubmit={handleApply} className="py-2 text-start animate__animated animate__fadeIn">
					<div className="d-flex align-items-center gap-2 mb-4">
						<button
							type="button"
							className="btn btn-sm btn-outline-secondary p-1.5 rounded-circle d-inline-flex align-items-center justify-content-center"
							onClick={() => setShowForm(false)}
							style={{ width: 32, height: 32 }}
						>
							<ArrowLeft size={16} />
						</button>
						<h3 className="fw-bold m-0" style={{ fontSize: 18, letterSpacing: '-0.5px' }}>
							Formulir Pengajuan
						</h3>
					</div>

					{/* Banner alasan penolakan jika pendaftaran ini adalah resubmission */}
					{request && request.status === 'rejected' && request.rejection_reason && (
						<div className="p-3 bg-danger bg-opacity-10 text-danger border border-danger-subtle rounded-3 mb-4 animate__animated animate__fadeIn">
							<h6 className="fw-bold mb-1 d-flex align-items-center gap-1.5" style={{ fontSize: 13 }}>
								<AlertCircle size={15} /> Alasan Penolakan:
							</h6>
							<p className="m-0" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
								"{request.rejection_reason}"
							</p>
						</div>
					)}

					{/* Tipe Penyelenggara */}
					<div className="mb-4">
						<label className="form-label fw-bold mb-2" style={{ fontSize: 13 }}>
							Tipe Penyelenggara <span className="text-danger">*</span>
						</label>
						<div className="row g-2">
							<div className="col-6">
								<div
									onClick={() => {
										setOrganizerType('internal');
										setSelectedInstitutionId('');
										setCustomInstitutionName('');
									}}
									style={{
										border: `2px solid ${organizerType === 'internal' ? 'var(--primary)' : '#e2e8f0'}`,
										backgroundColor: organizerType === 'internal' ? 'var(--primary-light-subtle, #eff6ff)' : '#ffffff',
										borderRadius: 10,
										padding: 12,
										cursor: 'pointer',
										transition: 'all 0.2s',
										height: '100%',
									}}
									className="d-flex align-items-start gap-2 hover-shadow-sm"
								>
									<input
										type="radio"
										name="organizerType"
										checked={organizerType === 'internal'}
										onChange={() => { }}
										style={{ marginTop: 4, cursor: 'pointer' }}
									/>
									<div>
										<h6 className="fw-bold mb-0.5" style={{ fontSize: 13, color: organizerType === 'internal' ? 'var(--primary)' : 'var(--text-color, #1e293b)' }}>
											Institusi
										</h6>
										<p className="text-secondary m-0" style={{ fontSize: 11, lineHeight: 1.3 }}>
											BEM, Himpunan, UKM, atau organisasi internal/afiliasi resmi.
										</p>
									</div>
								</div>
							</div>
							<div className="col-6">
								<div
									onClick={() => {
										setOrganizerType('independent');
										setSelectedInstitutionId('');
										setCustomInstitutionName('');
									}}
									style={{
										border: `2px solid ${organizerType === 'independent' ? 'var(--primary)' : '#e2e8f0'}`,
										backgroundColor: organizerType === 'independent' ? 'var(--primary-light-subtle, #eff6ff)' : '#ffffff',
										borderRadius: 10,
										padding: 12,
										cursor: 'pointer',
										transition: 'all 0.2s',
										height: '100%',
									}}
									className="d-flex align-items-start gap-2 hover-shadow-sm"
								>
									<input
										type="radio"
										name="organizerType"
										checked={organizerType === 'independent'}
										onChange={() => { }}
										style={{ marginTop: 4, cursor: 'pointer' }}
									/>
									<div>
										<h6 className="fw-bold mb-0.5" style={{ fontSize: 13, color: organizerType === 'independent' ? 'var(--primary)' : 'var(--text-color, #1e293b)' }}>
											EO Independen / Umum
										</h6>
										<p className="text-secondary m-0" style={{ fontSize: 11, lineHeight: 1.3 }}>
											Komunitas, instansi luar, agensi, atau tim eksternal.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Input 1: Nama Organisasi */}
					<div className="mb-3">
						<label className="form-label fw-bold mb-1.5" style={{ fontSize: 13 }}>
							Nama Organisasi / Komunitas <span className="text-danger">*</span>
						</label>
						<input
							type="text"
							className="form-control"
							placeholder={organizerType === 'internal' ? "BEM FT, Himpunan Informatika, dll." : "PT Kreatif Mandiri, EO Jaya, dll."}
							value={organizationName}
							onChange={(e) => setOrganizationName(e.target.value)}
							required
							style={{ padding: '8px 12px', fontSize: 13, borderRadius: 8 }}
						/>
					</div>

					{/* Input 2: Pilihan Institusi (Hanya untuk Internal Kampus) */}
					{organizerType === 'internal' && (
						<div className="mb-3 animate__animated animate__fadeIn">
							<label className="form-label fw-bold mb-1.5" style={{ fontSize: 13 }}>
								Institusi Afiliasi <span className="text-danger">*</span>
							</label>
							<select
								className="form-select"
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
							</select>
						</div>
					)}

					{/* Input 3: Tulis Kustom (Hanya untuk Internal Kampus jika custom selected) */}
					{organizerType === 'internal' && selectedInstitutionId === 'custom' && (
						<div className="mb-3 animate__animated animate__fadeIn">
							<label className="form-label fw-bold mb-1.5" style={{ fontSize: 13 }}>
								Nama Institusi <span className="text-danger">*</span>
							</label>
							<input
								type="text"
								className="form-control"
								placeholder="Tulis nama institusi lengkap..."
								value={customInstitutionName}
								onChange={(e) => setCustomInstitutionName(e.target.value)}
								required
								style={{ padding: '8px 12px', fontSize: 13, borderRadius: 8 }}
							/>
						</div>
					)}

					{/* Input 4: Bukti Fisik */}
					<div className="mb-3">
						<label className="form-label fw-bold mb-1.5" style={{ fontSize: 13 }}>
							Berkas Bukti Pendukung <span className="text-danger">*</span>
						</label>
						<label
							htmlFor="proof-upload"
							style={{
								border: '2px dashed var(--border-color, #cbd5e1)',
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
							className="hover-border-primary"
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
					</div>

					{/* Input 5: Catatan Tambahan (Note) */}
					<div className="mb-4">
						<label className="form-label fw-bold mb-1.5" style={{ fontSize: 13 }}>
							Tautan / Catatan Tambahan <span className="text-muted fw-normal">(Opsional)</span>
						</label>
						<textarea
							className="form-control"
							rows={2}
							placeholder="Website, media sosial, portofolio, atau informasi pendukung lainnya..."
							value={note}
							onChange={(e) => setNote(e.target.value)}
							style={{ padding: '8px 12px', fontSize: 13, borderRadius: 8, resize: 'none' }}
						/>
					</div>

					<div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
						<button
							type="button"
							className="btn btn-outline px-3"
							style={{ borderRadius: 8, fontSize: 13 }}
							onClick={() => setShowForm(false)}
							disabled={submitting}
						>
							Batal
						</button>
						<button
							type="submit"
							className="btn btn-primary px-4 fw-semibold"
							style={{ borderRadius: 8, fontSize: 13 }}
							disabled={submitting}
						>
							{submitting ? (
								<>
									<Spinner animation="border" size="sm" className="me-2" /> Mengirim...
								</>
							) : (
								'Kirim Pengajuan'
							)}
						</button>
					</div>
				</form>
			);
		}

		// 2. Jika belum pernah mengajukan pengajuan sama sekali
		if (!request) {
			return (
				<div className="text-center py-2 animate__animated animate__fadeIn">
					<div className="mb-3">
						<span
							className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary"
							style={{ width: 64, height: 64 }}
						>
							<Award size={32} />
						</span>
					</div>

					<h2 className="fw-bold mb-2" style={{ fontSize: 20, letterSpacing: '-0.5px' }}>
						Ajukan Sebagai Organizer
					</h2>
					<p className="text-secondary mx-auto mb-4" style={{ maxWidth: 440, fontSize: 13.5, lineHeight: 1.5 }}>
						Mulai buat event Anda sendiri, validasi kehadiran peserta dengan QR code, dan bagikan sertifikat digital otomatis.
					</p>

					<button
						className="btn btn-primary px-5 py-2 fw-semibold"
						style={{ borderRadius: 8, fontSize: 13.5 }}
						onClick={() => setShowForm(true)}
					>
						Mulai Pengajuan
					</button>
				</div>
			);
		}

		// 3. Jika status permohonan adalah PENDING
		if (request.status === 'pending') {
			return (
				<div className="text-center py-4">
					<div className="mb-3">
						<span
							className="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning bg-opacity-10 text-warning"
							style={{ width: 64, height: 64 }}
						>
							<Clock size={32} className="spin-slow" />
						</span>
					</div>

					<h3 className="fw-bold mb-2" style={{ fontSize: 18, letterSpacing: '-0.5px' }}>
						Permohonan Sedang Ditinjau
					</h3>
					<p className="text-secondary mx-auto mb-4" style={{ maxWidth: 400, fontSize: 13.5 }}>
						Tim kami sedang memverifikasi data Anda. Peninjauan biasanya membutuhkan waktu 1-2 hari kerja.
					</p>

					<div className="p-3 bg-light rounded-3 mx-auto mb-4" style={{ maxWidth: 360 }}>
						<div className="d-flex justify-content-between align-items-center mb-1.5" style={{ fontSize: 12.5 }}>
							<span className="text-secondary">Tanggal Pengajuan</span>
							<span className="fw-semibold text-dark">{request.created_at ? request.created_at.split('T')[0] : '—'}</span>
						</div>
						<div className="d-flex justify-content-between align-items-center" style={{ fontSize: 12.5 }}>
							<span className="text-secondary">Status Verifikasi</span>
							<span className="badge bg-warning text-dark fw-bold px-2 py-1 rounded-pill">Pending Review</span>
						</div>
					</div>

					<button
						className="btn btn-outline px-4 py-2"
						style={{ borderRadius: 8, fontSize: 13 }}
						onClick={() => navigate('/')}
					>
						Kembali ke Dashboard
					</button>
				</div>
			);
		}

		// 4. Jika status permohonan disetujui (APPROVED)
		if (request.status === 'approved') {
			return (
				<div className="text-center py-4">
					<div className="mb-3">
						<span
							className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 text-success"
							style={{ width: 64, height: 64 }}
						>
							<CheckCircle2 size={32} />
						</span>
					</div>

					<h3 className="fw-bold mb-2" style={{ fontSize: 18, letterSpacing: '-0.5px' }}>
						Permohonan Disetujui
					</h3>
					<p className="text-secondary mx-auto mb-4" style={{ maxWidth: 400, fontSize: 13.5 }}>
						Selamat! Akun Anda telah berhasil diverifikasi sebagai Penyelenggara Acara (Organizer).
					</p>

					<div className="d-flex justify-content-center gap-2">
						<button
							className="btn btn-outline px-3 py-2"
							style={{ borderRadius: 8, fontSize: 13 }}
							onClick={() => navigate('/')}
						>
							Kembali
						</button>
						<button
							className="btn btn-primary px-4 py-2 fw-semibold"
							style={{ borderRadius: 8, fontSize: 13 }}
							onClick={() => {
								window.location.reload();
							}}
						>
							Mulai Kelola Acara
						</button>
					</div>
				</div>
			);
		}

		// 5. Jika status permohonan ditolak (REJECTED)
		if (request.status === 'rejected') {
			return (
				<div className="text-center py-4">
					<div className="mb-3">
						<span
							className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 text-danger"
							style={{ width: 64, height: 64 }}
						>
							<ShieldAlert size={32} />
						</span>
					</div>

					<h3 className="fw-bold mb-2" style={{ fontSize: 18, letterSpacing: '-0.5px' }}>
						Permohonan Belum Disetujui
					</h3>

					{request.rejection_reason && (
						<div className="p-3 bg-danger bg-opacity-10 text-danger border border-danger-subtle rounded-3 mx-auto mb-4 text-start" style={{ maxWidth: 440 }}>
							<h6 className="fw-bold mb-1" style={{ fontSize: 13 }}>
								Alasan Penolakan:
							</h6>
							<p className="m-0" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
								"{request.rejection_reason}"
							</p>
						</div>
					)}

					{!request.can_resubmit && (
						<div className="p-3 bg-light rounded-3 mx-auto mb-4 text-start border" style={{ maxWidth: 440 }}>
							<div className="d-flex align-items-center gap-1.5 text-danger fw-bold mb-1" style={{ fontSize: 13 }}>
								<ShieldAlert size={15} /> Penolakan Permanen
							</div>
							<p className="text-secondary m-0" style={{ fontSize: 12, lineHeight: 1.5 }}>
								Silakan hubungi <strong>support@kampusx.com</strong> jika Anda merasa ini adalah kekeliruan.
							</p>
						</div>
					)}

					<div className="d-flex justify-content-center gap-2">
						<button
							className="btn btn-outline px-3 py-2"
							style={{ borderRadius: 8, fontSize: 13 }}
							onClick={() => navigate('/')}
						>
							Kembali
						</button>
						{request.can_resubmit && (
							<button
								className="btn btn-primary px-4 py-2 fw-semibold"
								style={{ borderRadius: 8, fontSize: 13 }}
								onClick={() => {
									const isInternal = request.institution_id || request.custom_institution_name;
									setOrganizerType(isInternal ? 'internal' : 'independent');
									setOrganizationName(request.organization_name || '');
									setSelectedInstitutionId(request.institution_id || (request.custom_institution_name ? 'custom' : ''));
									setCustomInstitutionName(request.custom_institution_name || '');
									setNote(request.note || '');
									setProofFileName(request.proof_path ? 'Dokumen Bukti Sebelumnya' : '');
									setProofFile(null);

									setShowForm(true);
								}}
							>
								Ajukan Ulang
							</button>
						)}
					</div>
				</div>
			);
		}
	};

	return (
		<Container style={{ paddingTop: 60, paddingBottom: 60 }}>
			<div
				className="bg-white p-4 border shadow-sm mx-auto animate__animated animate__fadeIn"
				style={{ maxWidth: 580, borderRadius: 12 }}
			>
				{renderContent()}
			</div>
		</Container>
	);
};

export default ApplyOrganizerPage;
