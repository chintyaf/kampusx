import React, { useState, useEffect } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { CheckCircle2, AlertCircle, ShieldAlert, Award, Calendar, Users, QrCode, Clock, FileText, ArrowLeft, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const ApplyOrganizerPage = () => {
	const { token, user } = useAuth();
	const navigate = useNavigate();

	const [request, setRequest] = useState(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	// Form States
	const [showForm, setShowForm] = useState(false);
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
			setRequest(response.data.data);
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
			alert('Nama organisasi / himpunan wajib diisi.');
			return;
		}
		if (!selectedInstitutionId) {
			alert('Mohon pilih institusi / kampus afiliasi Anda.');
			return;
		}
		if (selectedInstitutionId === 'custom' && !customInstitutionName.trim()) {
			alert('Nama universitas kustom wajib diisi.');
			return;
		}
		if (!proofFile) {
			alert('Mohon unggah berkas bukti fisik keanggotaan Anda.');
			return;
		}

		try {
			setSubmitting(true);
			const formData = new FormData();
			formData.append('organization_name', organizationName);
			if (selectedInstitutionId !== 'custom') {
				formData.append('institution_id', selectedInstitutionId);
			} else {
				formData.append('custom_institution_name', customInstitutionName);
			}
			formData.append('proof', proofFile);
			if (note.trim()) {
				formData.append('note', note);
			}

			await api.post('/organizer-requests/apply', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

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
		// Jika belum pernah mengajukan, atau status ditolak dan ingin daftar ulang
		if (!request) {
			if (!showForm) {
				return (
					<div className="text-center py-4">
						<div className="mb-4">
							<span
								className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary"
								style={{ width: 80, height: 80 }}
							>
								<Award size={40} />
							</span>
						</div>

						<h2 className="fw-bold mb-3" style={{ fontSize: 24, letterSpacing: '-0.5px' }}>
							Gabung Sebagai Penyelenggara Acara (Organizer)
						</h2>
						<p className="text-secondary mx-auto mb-5" style={{ maxWidth: 520, fontSize: 14 }}>
							Buka fitur eksklusif untuk menyelenggarakan acara, menerbitkan tiket secara mandiri, melacak kehadiran peserta via QR, dan mendesain sertifikat resmi!
						</p>

						{/* Benefits Grid */}
						<div className="row g-4 justify-content-center text-start mb-5" style={{ maxWidth: 700, margin: '0 auto' }}>
							<div className="col-md-6">
								<div className="d-flex gap-3 align-items-start p-3 bg-light rounded-3" style={{ height: '100%' }}>
									<div className="p-2 bg-white rounded-2 text-primary shadow-sm">
										<Calendar size={20} />
									</div>
									<div>
										<h6 className="fw-bold mb-1" style={{ fontSize: 14 }}>Kelola Acara Sendiri</h6>
										<p className="text-secondary m-0" style={{ fontSize: 12 }}>Buat event, workshop, seminar online atau offline dengan modul terlengkap.</p>
									</div>
								</div>
							</div>
							<div className="col-md-6">
								<div className="d-flex gap-3 align-items-start p-3 bg-light rounded-3" style={{ height: '100%' }}>
									<div className="p-2 bg-white rounded-2 text-primary shadow-sm">
										<Users size={20} />
									</div>
									<div>
										<h6 className="fw-bold mb-1" style={{ fontSize: 14 }}>Kelola Anggota Tim</h6>
										<p className="text-secondary m-0" style={{ fontSize: 12 }}>Bentuk institusi resmi dan undang anggota panitia/komite ke dalam event Anda.</p>
									</div>
								</div>
							</div>
							<div className="col-md-6">
								<div className="d-flex gap-3 align-items-start p-3 bg-light rounded-3" style={{ height: '100%' }}>
									<div className="p-2 bg-white rounded-2 text-primary shadow-sm">
										<QrCode size={20} />
									</div>
									<div>
										<h6 className="fw-bold mb-1" style={{ fontSize: 14 }}>Validasi Tiket & Scanner</h6>
										<p className="text-secondary m-0" style={{ fontSize: 12 }}>Scan kode QR tiket peserta di lokasi secara instan menggunakan perangkat apa pun.</p>
									</div>
								</div>
							</div>
							<div className="col-md-6">
								<div className="d-flex gap-3 align-items-start p-3 bg-light rounded-3" style={{ height: '100%' }}>
									<div className="p-2 bg-white rounded-2 text-primary shadow-sm">
										<Award size={20} />
									</div>
									<div>
										<h6 className="fw-bold mb-1" style={{ fontSize: 14 }}>Sertifikat Digital Resmi</h6>
										<p className="text-secondary m-0" style={{ fontSize: 12 }}>Mendesain e-sertifikat langsung di dashboard dan membagikannya ke peserta otomatis.</p>
									</div>
								</div>
							</div>
						</div>

						<button
							className="btn btn-primary px-5 py-2.5 fw-semibold"
							style={{ borderRadius: 10, fontSize: 14 }}
							onClick={() => setShowForm(true)}
						>
							Ajukan Permohonan Sekarang
						</button>
					</div>
				);
			}

			// Form Registrasi Pengajuan
			return (
				<form onSubmit={handleApply} className="py-2 text-start">
					<div className="d-flex align-items-center gap-2 mb-4">
						<button
							type="button"
							className="btn btn-sm btn-outline-secondary p-1.5 rounded-circle d-inline-flex align-items-center justify-content-center"
							onClick={() => setShowForm(false)}
							style={{ width: 32, height: 32 }}
						>
							<ArrowLeft size={16} />
						</button>
						<h3 className="fw-bold m-0" style={{ fontSize: 20, letterSpacing: '-0.5px' }}>
							Formulir Pengajuan Organizer
						</h3>
					</div>

					<div className="p-3 bg-light rounded-3 mb-4 d-flex gap-3 align-items-start" style={{ borderLeft: '4px solid var(--primary)' }}>
						<AlertCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
						<div>
							<h6 className="fw-bold mb-1" style={{ fontSize: 13 }}>Masa Afiliasi & Validasi Dokumen</h6>
							<p className="text-secondary m-0" style={{ fontSize: 12 }}>
								Setelah disetujui, akun Anda otomatis ditingkatkan menjadi Organizer dan terhubung ke kampus pilihan selama 1 tahun. Unggah SK Kepengurusan BEM/Himpunan atau Kartu Mahasiswa aktif sebagai bukti fisik.
							</p>
						</div>
					</div>

					{/* Input 1: Nama Organisasi */}
					<div className="mb-4">
						<label className="form-label fw-bold mb-1.5" style={{ fontSize: 13 }}>
							Nama Organisasi / Himpunan Mahasiswa <span className="text-danger">*</span>
						</label>
						<input
							type="text"
							className="form-control"
							placeholder="Contoh: Himpunan Mahasiswa Informatika (HMIF) BEM FT"
							value={organizationName}
							onChange={(e) => setOrganizationName(e.target.value)}
							required
							style={{ padding: '10px 14px', fontSize: 13.5, borderRadius: 8 }}
						/>
					</div>

					{/* Input 2: Pilihan Kampus */}
					<div className="mb-4">
						<label className="form-label fw-bold mb-1.5" style={{ fontSize: 13 }}>
							Kampus Asal Afiliasi <span className="text-danger">*</span>
						</label>
						<select
							className="form-select"
							value={selectedInstitutionId}
							onChange={(e) => setSelectedInstitutionId(e.target.value)}
							required
							style={{ padding: '10px 14px', fontSize: 13.5, borderRadius: 8 }}
						>
							<option value="">-- Pilih Kampus --</option>
							{institutions.map((inst) => (
								<option key={inst.id} value={inst.id}>
									{inst.name}
								</option>
							))}
							<option value="custom">Kampus Saya Tidak Terdaftar (Tulis Manual)</option>
						</select>
					</div>

					{/* Input 3: Tulis Kustom */}
					{selectedInstitutionId === 'custom' && (
						<div className="mb-4 animate__animated animate__fadeIn">
							<label className="form-label fw-bold mb-1.5" style={{ fontSize: 13 }}>
								Nama Universitas Kustom <span className="text-danger">*</span>
							</label>
							<input
								type="text"
								className="form-control animate__animated animate__fadeIn"
								placeholder="Contoh: Universitas Pamulang, UPN Veteran, dll."
								value={customInstitutionName}
								onChange={(e) => setCustomInstitutionName(e.target.value)}
								required
								style={{ padding: '10px 14px', fontSize: 13.5, borderRadius: 8 }}
							/>
							<div className="form-text text-muted d-flex align-items-center gap-1.5 mt-1.5" style={{ fontSize: 11 }}>
								<AlertCircle size={12} className='me-1' /> Kampus baru ini akan didaftarkan otomatis ke sistem oleh admin saat permohonan disetujui.
							</div>
						</div>
					)}

					{/* Input 4: Bukti Fisik */}
					<div className="mb-4">
						<label className="form-label fw-bold mb-1.5" style={{ fontSize: 13 }}>
							Unggah Berkas Bukti Fisik (Kartu Mahasiswa / SK Kepengurusan) <span className="text-danger">*</span>
						</label>
						<label
							htmlFor="proof-upload"
							style={{
								border: '2px dashed var(--border-color, #cbd5e1)',
								borderRadius: '10px',
								padding: '24px',
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
								<div className="d-flex flex-column align-items-center gap-1.5">
									<FileText size={32} className="text-success" />
									<span style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>
										{proofFileName}
									</span>
									<span style={{ fontSize: '11px', color: '#64748b' }}>
										Klik di sini untuk mengganti berkas pendukung
									</span>
								</div>
							) : (
								<div className="d-flex flex-column align-items-center gap-1.5">
									<Upload size={32} className="text-secondary" style={{ opacity: 0.8 }} />
									<span style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>
										Pilih File Pendukung (JPG, JPEG, PNG, PDF)
									</span>
									<span style={{ fontSize: '11px', color: '#64748b' }}>
										Format gambar atau dokumen maksimal 5MB
									</span>
								</div>
							)}
						</label>
					</div>

					{/* Input 5: Catatan Tambahan (Note) */}
					<div className="mb-4">
						<label className="form-label fw-bold mb-1.5" style={{ fontSize: 13 }}>
							Catatan Tambahan / Tautan Pendukung <span className="text-muted fw-normal">(Opsional)</span>
						</label>
						<textarea
							className="form-control"
							rows={3}
							placeholder="Tuliskan catatan tambahan atau lampirkan tautan website/sosmed himpunan Anda untuk mempercepat verifikasi..."
							value={note}
							onChange={(e) => setNote(e.target.value)}
							style={{ padding: '10px 14px', fontSize: 13.5, borderRadius: 8, resize: 'none' }}
						/>
					</div>

					<div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
						<button
							type="button"
							className="btn btn-outline px-4"
							style={{ borderRadius: 8, fontSize: 13 }}
							onClick={() => setShowForm(false)}
							disabled={submitting}
						>
							Batalkan
						</button>
						<button
							type="submit"
							className="btn btn-primary px-5 fw-semibold"
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

		if (request.status === 'pending') {
			return (
				<div className="text-center py-5">
					<div className="mb-4">
						<span
							className="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning bg-opacity-10 text-warning"
							style={{ width: 80, height: 80 }}
						>
							<Clock size={40} className="spin-slow" />
						</span>
					</div>

					<h3 className="fw-bold mb-3" style={{ fontSize: 22, letterSpacing: '-0.5px' }}>
						Permohonan Sedang Ditinjau
					</h3>
					<p className="text-secondary mx-auto mb-4" style={{ maxWidth: 480, fontSize: 14 }}>
						Terima kasih telah mengajukan permohonan menjadi Organizer! Tim KampusX sedang melakukan verifikasi data profil Anda. Proses peninjauan biasanya membutuhkan waktu maksimal 1-2 hari kerja.
					</p>

					<div className="p-3 bg-light rounded-3 mx-auto mb-4" style={{ maxWidth: 400 }}>
						<div className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize: 13 }}>
							<span className="text-secondary">Tanggal Pengajuan</span>
							<span className="fw-semibold text-dark">{request.created_at ? request.created_at.split('T')[0] : '—'}</span>
						</div>
						<div className="d-flex justify-content-between align-items-center" style={{ fontSize: 13 }}>
							<span className="text-secondary">Status Verifikasi</span>
							<span className="badge bg-warning text-dark fw-bold px-2.5 py-1.5 rounded-pill">Pending Review</span>
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

		if (request.status === 'approved') {
			return (
				<div className="text-center py-5">
					<div className="mb-4">
						<span
							className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 text-success"
							style={{ width: 80, height: 80 }}
						>
							<CheckCircle2 size={40} />
						</span>
					</div>

					<h3 className="fw-bold mb-3" style={{ fontSize: 22, letterSpacing: '-0.5px' }}>
						Permohonan Anda Disetujui!
					</h3>
					<p className="text-secondary mx-auto mb-4" style={{ maxWidth: 480, fontSize: 14 }}>
						Selamat! Akun Anda telah berhasil diverifikasi dan ditingkatkan menjadi **Penyelenggara Acara (Organizer)**. Sekarang Anda dapat mengakses dashboard manajemen penuh.
					</p>

					<div className="d-flex justify-content-center gap-3">
						<button
							className="btn btn-outline px-4 py-2"
							style={{ borderRadius: 8, fontSize: 13 }}
							onClick={() => navigate('/')}
						>
							Kembali
						</button>
						<button
							className="btn btn-primary px-4 py-2 fw-semibold"
							style={{ borderRadius: 8, fontSize: 13 }}
							onClick={() => {
								window.location.reload(); // Reload agar AuthContext membaca role baru
							}}
						>
							Mulai Kelola Acara
						</button>
					</div>
				</div>
			);
		}

		if (request.status === 'rejected') {
			return (
				<div className="text-center py-5">
					<div className="mb-4">
						<span
							className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 text-danger"
							style={{ width: 80, height: 80 }}
						>
							<ShieldAlert size={40} />
						</span>
					</div>

					<h3 className="fw-bold mb-3" style={{ fontSize: 22, letterSpacing: '-0.5px' }}>
						Permohonan Belum Disetujui
					</h3>
					<p className="text-secondary mx-auto mb-4" style={{ maxWidth: 480, fontSize: 14 }}>
						Mohon maaf, permohonan Anda untuk mendaftar sebagai Organizer saat ini belum memenuhi kriteria tim penilai kami. Hubungi support@kampusx.com untuk informasi selengkapnya.
					</p>

					<div className="d-flex justify-content-center gap-3">
						<button
							className="btn btn-outline px-4 py-2"
							style={{ borderRadius: 8, fontSize: 13 }}
							onClick={() => navigate('/')}
						>
							Kembali
						</button>
						<button
							className="btn btn-primary px-4 py-2 fw-semibold"
							style={{ borderRadius: 8, fontSize: 13 }}
							onClick={() => {
								// Reset form inputs & status pengajuan
								setOrganizationName('');
								setSelectedInstitutionId('');
								setCustomInstitutionName('');
								setProofFile(null);
								setProofFileName('');
								setNote('');
								setRequest(null);
								setShowForm(true);
							}} // Reset ke form pengajuan ulang
						>
							Ajukan Ulang
						</button>
					</div>
				</div>
			);
		}
	};

	return (
		<Container style={{ paddingTop: 60, paddingBottom: 60 }}>
			<div
				className="bg-white p-5 border shadow-sm mx-auto animate__animated animate__fadeIn"
				style={{ maxWidth: 800, borderRadius: 16 }}
			>
				{renderContent()}
			</div>
		</Container>
	);
};

export default ApplyOrganizerPage;
