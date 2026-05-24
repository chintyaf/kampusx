import React, { useState, useEffect } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { CheckCircle2, AlertCircle, ShieldAlert, Award, Calendar, Users, QrCode, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const ApplyOrganizerPage = () => {
	const { token, user } = useAuth();
	const navigate = useNavigate();

	const [request, setRequest] = useState(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (!user) {
			navigate('/register');
			return;
		}
		fetchRequestStatus();
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

	const handleApply = async () => {
		try {
			setSubmitting(true);
			await api.post('/organizer-requests/apply');
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
						onClick={handleApply}
						disabled={submitting}
					>
						{submitting ? (
							<>
								<Spinner animation="border" size="sm" className="me-2" /> Mengirim Permohonan...
							</>
						) : (
							'Ajukan Permohonan Sekarang'
						)}
					</button>
				</div>
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
							onClick={() => setRequest(null)} // Reset ke form pengajuan ulang
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
				className="bg-white p-5 border shadow-sm mx-auto"
				style={{ maxWidth: 800, borderRadius: 16 }}
			>
				{renderContent()}
			</div>
		</Container>
	);
};

export default ApplyOrganizerPage;
