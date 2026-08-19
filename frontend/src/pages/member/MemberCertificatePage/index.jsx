import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Award, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/api/axios';
import PreviewModal from '@/components/event/certificate/PreviewModal';
import { formatDate } from '@/utils/dateUtils';

// Extracted components
import TabNavigation from './components/TabNavigation';
import SrlProgressCard from './components/SrlProgressCard';
import SrlBadgeCard from './components/SrlBadgeCard';
import CertificateCard from './components/CertificateCard';

// Icons used in configuration of badges
import { Target, Activity, Zap, CheckCircle, RefreshCw } from 'lucide-react';

const MemberCertificatePage = () => {
	const [certificates, setCertificates] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedCert, setSelectedCert] = useState(null);
	const [showPreviewModal, setShowPreviewModal] = useState(false);
	const [showQrModal, setShowQrModal] = useState(false);

	// Tabs State: 'certificates' | 'badges'
	const [activeTab, setActiveTab] = useState('certificates');

	// Mock Badges Data
	const srlBadges = [
		{
			id: 'srl-1',
			title: 'Forethought & Goal Setting',
			moduleCode: 'SRL-1',
			description: 'Mampu menyusun rencana belajar strategis dan menetapkan target pencapaian terukur.',
			isEarned: true,
			earnedDate: '12 Jul 2026',
			icon: Target,
			color: '#10B981', // green
			bgColor: 'rgba(16, 185, 129, 0.08)',
			borderColor: 'rgba(16, 185, 129, 0.15)',
		},
		{
			id: 'srl-2',
			title: 'Self-Monitoring & Tracking',
			moduleCode: 'SRL-2',
			description: 'Mampu melacak kemajuan belajar secara kritis dan mengenali pola produktivitas personal.',
			isEarned: true,
			earnedDate: '20 Jul 2026',
			icon: Activity,
			color: '#0EA5E9', // blue
			bgColor: 'rgba(14, 165, 233, 0.08)',
			borderColor: 'rgba(14, 165, 233, 0.15)',
		},
		{
			id: 'srl-3',
			title: 'Attention & Focus Control',
			moduleCode: 'SRL-3',
			description: 'Mampu meminimalkan distraksi belajar dan mempertahankan tingkat konsentrasi tinggi.',
			isEarned: true,
			earnedDate: '28 Jul 2026',
			icon: Zap,
			color: '#8B5CF6', // purple
			bgColor: 'rgba(139, 92, 246, 0.08)',
			borderColor: 'rgba(139, 92, 246, 0.15)',
		},
		{
			id: 'srl-4',
			title: 'Self-Evaluation',
			moduleCode: 'SRL-4',
			description: 'Mampu mengevaluasi kualitas hasil belajar pasca penyelesaian secara obyektif.',
			isEarned: false,
			earnedDate: null,
			icon: CheckCircle,
			color: '#64748B', // slate
			bgColor: 'rgba(100, 116, 139, 0.04)',
			borderColor: 'rgba(100, 116, 139, 0.12)',
		},
		{
			id: 'srl-5',
			title: 'Strategic Adaptation',
			moduleCode: 'SRL-5',
			description: 'Mampu menyesuaikan metode dan strategi belajar berdasarkan umpan balik kinerja.',
			isEarned: false,
			earnedDate: null,
			icon: RefreshCw,
			color: '#64748B', // slate
			bgColor: 'rgba(100, 116, 139, 0.04)',
			borderColor: 'rgba(100, 116, 139, 0.12)',
		}
	];

	// Badge Portfolio State
	const [badgePortfolio, setBadgePortfolio] = useState({});

	useEffect(() => {
		// Load badge states from localStorage
		const initialStates = {};
		srlBadges.forEach(b => {
			if (b.isEarned) {
				initialStates[b.id] = localStorage.getItem(`badge-portfolio-${b.id}`) === 'true';
			}
		});
		setBadgePortfolio(initialStates);
	}, []);

	const handleToggleBadgePortfolio = (badgeId) => {
		const nextVal = !badgePortfolio[badgeId];
		setBadgePortfolio(prev => ({
			...prev,
			[badgeId]: nextVal
		}));
		localStorage.setItem(`badge-portfolio-${badgeId}`, nextVal.toString());
		if (nextVal) {
			toast.success('Badge ditambahkan ke portofolio publik!');
		} else {
			toast.success('Badge dihapus dari portofolio publik.');
		}
	};

	// Fetch data on mount
	useEffect(() => {
		const fetchCertificates = async () => {
			try {
				setIsLoading(true);
				const response = await api.get('/my-certificates');
				if (response.data.success) {
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
		const ticketCode = cert.certificate_code || cert.ticket_code || cert.ticket?.ticket_code;

		if (!ticketCode) {
			toast.error('Gagal memuat: Kode sertifikat/tiket tidak ditemukan.');
			return;
		}

		const certId = ticketCode.startsWith('CERT-') ? ticketCode : `CERT-${ticketCode}`;

		toast.loading('Memuat elemen sertifikat...', { id: 'loading-cert' });

		try {
			const response = await api.get(`/certificate/render/${certId}`);

			if (response.data.success) {
				toast.dismiss('loading-cert');
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

	const earnedBadgesCount = srlBadges.filter(b => b.isEarned).length;

	return (
		<div className="bg-light min-vh-100 py-5">
			<Container>
				{/* Header Section */}
				<div className="mb-4">
					<h2 className="fw-bold mb-1" style={{ color: '#0F172A', letterSpacing: '-0.5px' }}>
						Sertifikat & Pencapaian
					</h2>
					<p className="small mb-0" style={{ color: '#475569', maxWidth: '640px', lineHeight: '1.5' }}>
						Simpan sertifikat resmi dan pantau progres badge pembelajaran Anda.
					</p>
				</div>

				{/* Tab Navigation Component */}
				<TabNavigation 
					activeTab={activeTab} 
					setActiveTab={setActiveTab} 
					certificatesCount={certificates.length} 
					earnedBadgesCount={earnedBadgesCount} 
					totalBadgesCount={srlBadges.length} 
				/>

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

				{activeTab === 'certificates' ? (
					/* Tab 1: Event Certificates */
					isLoading ? (
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
					)
				) : (
					/* Tab 2: Module Badges & Progress */
					<div>
						{/* Progress Card Component */}
						<SrlProgressCard 
							earnedCount={earnedBadgesCount} 
							totalCount={srlBadges.length} 
						/>

						{/* SRL Badges Grid Header */}
						<div className="mb-4">
							<h4 className="fw-bold text-dark mb-1">Daftar Badge Modul SRL</h4>
							<p className="text-muted small mb-0">Kelola visibilitas badge modul yang telah Anda capai di profil publik Anda.</p>
						</div>

						{/* SRL Badges Grid */}
						<Row className="g-4">
							{srlBadges.map((badge) => {
								const inPortfolio = badgePortfolio[badge.id] || false;

								return (
									<Col md={6} lg={4} key={badge.id}>
										<SrlBadgeCard 
											badge={badge} 
											inPortfolio={inPortfolio} 
											onTogglePortfolio={handleToggleBadgePortfolio} 
										/>
									</Col>
								);
							})}
						</Row>
					</div>
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
