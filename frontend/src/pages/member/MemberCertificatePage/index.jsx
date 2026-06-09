import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import {
	Award,
	QrCode,
	Calendar,
	Building,
	Lock,
	Sparkles,
	AlertCircle,
	ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/api/axios';
import PreviewModal from '@/components/event/certificate/PreviewModal';
import CertificateCard from './CertificateCard';
import { formatDate } from '@/utils/dateUtils';

const MemberCertificatePage = () => {
	const [certificates, setCertificates] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedCert, setSelectedCert] = useState(null);
	const [showPreviewModal, setShowPreviewModal] = useState(false);

	// State untuk QR Code (jika diperlukan untuk fitur modal QR terpisah)
	const [showQrModal, setShowQrModal] = useState(false);

	// Tambahkan useEffect di sini untuk mengambil data dari API saat halaman dimuat
	useEffect(() => {
		const fetchCertificates = async () => {
			try {
				setIsLoading(true);
				// Sesuaikan endpoint ini dengan endpoint pengambilan daftar sertifikat Anda
				const response = await api.get('/my-certificates');
				if (response.data.success) {
					// console.log('Fetched certificates:', response.data.data);
					setCertificates(response.data.data || []);
				} else {
					setError('Gagal mengambil daftar sertifikat.');
				}
			} catch (err) {
				console.error('Error fetching certificates:', err);
				setError(err.response?.data?.message || 'Terjadi kesalahan jaringan.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchCertificates();
	}, []);

	const handleShowPreview = async (cert) => {
		// REFAKTOR: Menggunakan field certificate_code bawaan backend, atau fallback ke ticket_code aslinya
		const ticketCode = cert.certificate_code || cert.ticket_code || cert.ticket?.ticket_code;

		if (!ticketCode) {
			toast.error('Gagal memuat: Kode sertifikat/tiket tidak ditemukan.');
			return;
		}

		// Pastikan format string diawali dengan 'CERT-' jika backend belum menyediakannya langsung
		const certId = ticketCode.startsWith('CERT-') ? ticketCode : `CERT-${ticketCode}`;

		toast.loading('Memuat elemen sertifikat...', { id: 'loading-cert' });

		try {
			// Panggil fungsi getCertificateRenderData dari backend
			const response = await api.get(`/certificate/render/${certId}`);

			if (response.data.success) {
				toast.dismiss('loading-cert');
				// Simpan data lengkap (ticket, event, template) ke state
				console.log('Certificate render data:', response.data.data);
				setSelectedCert(response.data.data);
				setShowPreviewModal(true);
			} else {
				toast.error('Gagal memuat elemen sertifikat.', { id: 'loading-cert' });
			}
		} catch (err) {
			console.error('Failed to render certificate:', err);
			toast.error('Terjadi kesalahan saat mengambil elemen sertifikat.', {
				id: 'loading-cert',
			});
		}
	};

	const handleShowQR = (cert) => {
		setSelectedCert(cert);
		setShowQrModal(true);
	};

	return (
		<div className="bg-light min-vh-100 py-5">

			<Container>
				{/* Header Section */}
				<div className="d-flex align-items-center justify-content-between mb-5 flex-wrap gap-3">
					<div>
						<h2 className="fw-bold text-dark d-flex align-items-center gap-3 mb-1">
							<div className="bg-primary bg-opacity-10 text-primary p-2.5 rounded-4 d-inline-flex border border-primary border-opacity-10 shadow-sm">
								<Award size={30} />
							</div>
							Pusat Sertifikat Anda
						</h2>
						<p className="text-muted mb-0">
							Eksplor, klaim, dan unduh sertifikat resmi atas partisipasi aktif Anda
							di berbagai event KampusX.
						</p>
					</div>
				</div>

				{error && (
					<Alert variant="danger" className="border-0 shadow-sm rounded-4 p-4 mb-4">
						<div className="d-flex gap-3 align-items-center">
							<AlertCircle size={24} className="text-danger flex-shrink-0" />
							<div>
								<h6 className="fw-bold mb-1">Terjadi Kesalahan</h6>
								<p className="mb-0 small">{error}</p>
							</div>
						</div>
					</Alert>
				)}

				{/* Loading State */}
				{isLoading ? (
					<div className="d-flex flex-column align-items-center justify-content-center py-5 my-5">
						<Spinner
							animation="border"
							variant="primary"
							style={{ width: '3rem', height: '3rem' }}
						/>
						<p className="text-muted mt-3 fw-medium">
							Menghubungkan ke Pusat Sertifikat...
						</p>
					</div>
				) : certificates.length === 0 ? (
					/* Empty State */
					<Card className="border-0 shadow-sm rounded-4 text-center p-5 my-4">
						<Card.Body className="py-5">
							<div className="bg-light text-secondary rounded-circle p-4 d-inline-flex mb-4 border border-2 border-dashed">
								<Award size={48} className="opacity-75" />
							</div>
							<h4 className="fw-bold text-dark mb-2">Belum Ada Sertifikat</h4>
							<p
								className="text-muted mx-auto mb-4 small"
								style={{ maxWidth: '420px' }}
							>
								Sertifikat akan muncul di sini setelah Anda check-in / menghadiri
								acara dan menyelesaikan survei kepuasan pelanggan.
							</p>
							<Link to="/explore-events">
								<Button
									variant="primary"
									className="rounded-pill px-4 fw-bold shadow"
								>
									Eksplor Event KampusX
								</Button>
							</Link>
						</Card.Body>
					</Card>
				) : (
					/* Certificates List */
					<Row className="g-4">
						{certificates.map((cert) => {
							// REFAKTOR: Menyesuaikan pembuatan certId untuk prop komponen kartu
							const targetCode =
								cert.certificate_code ||
								cert.ticket_code ||
								cert.ticket?.ticket_code ||
								'';
							const finalCertId = targetCode.startsWith('CERT-')
								? targetCode
								: `CERT-${targetCode}`;

							return (
								<Col md={6} lg={4} key={cert.id || cert.ticket_code}>
									<CertificateCard
										cert={cert}
										certId={finalCertId}
										handleShowPreview={handleShowPreview}
										handleShowQR={handleShowQR}
									/>
								</Col>
							);
						})}
					</Row>
				)}
			</Container>

			{/* Reusable Preview Modal */}
			<PreviewModal
				show={showPreviewModal}
				onHide={() => {
					setShowPreviewModal(false);
					setSelectedCert(null);
				}}
				templateFile={selectedCert?.template?.background_url}
				elements={selectedCert?.template?.elements || []}
				previewData={{
					// Sesuaikan key dengan response JSON dari Controller
					f1: selectedCert?.ticket?.attendee_name || 'Nama Peserta',
					f2: selectedCert?.ticket?.ticket_code || 'ID Sertifikat',
					f3: `${window.location.origin}/certificate/verify/${selectedCert?.ticket?.ticket_code || ''}`,
					f4: selectedCert?.event?.title || 'Nama Event',
					f5: selectedCert?.event?.start_date ? formatDate(selectedCert.event.start_date) : 'Tanggal Event',
					f6: selectedCert?.event?.organizer_name || 'Instansi Penyelenggara',
				}}
			/>
		</div>
	);
};

export default MemberCertificatePage;
