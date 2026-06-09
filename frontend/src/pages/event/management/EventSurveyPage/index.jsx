import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import SurveyCard from './SurveyCard';
import SurveyDetailPage from './SurveyDetailPage';
import FormHeading from '@/components/dashboard/FormHeading';
import api from '@/api/axios';
import { notify } from '@/utils/notify';
import { Users, Star, Activity, FileText, ArrowLeft } from 'lucide-react';
import '../../../../assets/css/participant-list.css'; // For stat-card styles

// --- Komponen Halaman Utama (Index) ---
const Index = () => {
	const { eventId } = useParams();
	// State untuk navigasi antar view: 'list' atau 'detail'
	const [currentView, setCurrentView] = useState('list');
	const [selectedSurveyId, setSelectedSurveyId] = useState(null);

	// State data kuesioner dinamis
	const [surveys, setSurveys] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [rawSurvey, setRawSurvey] = useState(null);
	const [surveyAnalytics, setSurveyAnalytics] = useState(null);

	// Fungsi untuk mengambil data kuesioner dan analitik dari API
	const fetchSurveyAndAnalytics = useCallback(async () => {
		setIsLoading(true);
		try {
			// 1. Fetch kuesioner kustom dari backend
			const surveyRes = await api.get(`/event-dashboard/${eventId}/survey-form`);
			const dbSurvey = surveyRes.data.data;
			setRawSurvey(dbSurvey);

			if (dbSurvey) {
				// 2. Fetch analitik jika kuesioner ditemukan
				const analyticsRes = await api.get(`/event-dashboard/${eventId}/survey-analytics`);
				const analytics = analyticsRes.data.data;
				setSurveyAnalytics(analytics);

				setSurveys([
					{
						id: dbSurvey.id,
						title: dbSurvey.title,
						status: dbSurvey.is_active ? 'aktif' : 'draft',
						description: dbSurvey.description || 'Tidak ada deskripsi.',
						responses: analytics?.total_responses ?? 0,
						completionRate: analytics?.satisfaction_rate ?? 0,
						avgRating: analytics?.avg_rating && analytics.avg_rating > 0 ? analytics.avg_rating : null,
						session: dbSurvey.session,
						createdAt: new Date(dbSurvey.created_at).toLocaleDateString('id-ID', {
							day: 'numeric',
							month: 'long',
							year: 'numeric',
						}),
					},
				]);
			} else {
				setSurveys([]);
			}
		} catch (error) {
			console.error('Error fetching survey:', error);
			if (error.response?.status !== 404) {
				notify('error', 'Gagal', 'Terjadi kesalahan saat memuat data survei.');
			}
		} finally {
			setIsLoading(false);
		}
	}, [eventId]);

	useEffect(() => {
		if (eventId) {
			fetchSurveyAndAnalytics();
		}
	}, [eventId, fetchSurveyAndAnalytics]);

	// Fungsi untuk mengarahkan ke halaman buat survei baru
	const handleCreateNewSurvey = () => {
		setSelectedSurveyId(null); // Set null mengindikasikan kuesioner baru (isNew)
		setCurrentView('detail');
	};

	return (
		<div style={{ width: '100%' }}>
			{/* Tampilkan daftar survei jika currentView adalah 'list' */}
			{currentView === 'list' && (
				<div style={{ margin: '0 auto', padding: '2rem 1rem' }}>
					{/* Header Kelola Survei */}
					<div className="d-flex justify-content-between align-items-center mb-4 gap-3 flex-wrap">
						<FormHeading
							title="Kelola Survei"
							description="Buat dan kelola survei untuk mengumpulkan feedback dari peserta acara Anda."
						/>
						{surveys.length === 0 && !isLoading && (
							<Button
								variant="primary"
								className="fw-medium rounded-3"
								onClick={handleCreateNewSurvey}
							>
								+ Buat Survei Baru
							</Button>
						)}
					</div>

					{/* ── Stats row ─────────────────────────────────────────────── */}
					{surveyAnalytics && surveys.length > 0 && (
						<div className="participant-stats mb-4">
							<div className="stat-card">
								<div className="stat-card__icon stat-card__icon--blue">
									<Users size={16} />
								</div>
								<div>
									<p className="stat-card__label">Total Responden</p>
									<p className="stat-card__value">{surveyAnalytics.total_responses ?? 0}</p>
								</div>
							</div>
							<div className="stat-card">
								<div className="stat-card__icon stat-card__icon--green">
									<Star size={16} />
								</div>
								<div>
									<p className="stat-card__label">Rata-rata Rating Acara</p>
									<p className="stat-card__value">
										{surveyAnalytics.avg_rating ? parseFloat(surveyAnalytics.avg_rating).toFixed(1) : '-'} / 5.0
									</p>
								</div>
							</div>
							<div className="stat-card">
								<div className="stat-card__icon stat-card__icon--yellow">
									<Activity size={16} />
								</div>
								<div>
									<p className="stat-card__label">Rata-rata Rating Pembicara</p>
									<p className="stat-card__value">
										{surveyAnalytics.avg_speaker_rating ? parseFloat(surveyAnalytics.avg_speaker_rating).toFixed(1) : '-'} / 5.0
									</p>
								</div>
							</div>
							<div className="stat-card">
								<div className="stat-card__icon stat-card__icon--red">
									<FileText size={16} />
								</div>
								<div>
									<p className="stat-card__label">Rata-rata Rating Materi</p>
									<p className="stat-card__value">
										{surveyAnalytics.avg_material_rating ? parseFloat(surveyAnalytics.avg_material_rating).toFixed(1) : '-'} / 5.0
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Rendering Daftar SurveyCard */}
					<div className="d-flex flex-column gap-1">
						{isLoading ? (
							<div className="d-flex flex-column align-items-center justify-content-center py-5">
								<Spinner animation="border" variant="primary" className="mb-2" />
								<span className="text-muted small">Memuat data survei...</span>
							</div>
						) : (
							surveys.map((survey) => (
								<SurveyCard
									key={survey.id}
									survey={survey}
									setSelectedSurveyId={setSelectedSurveyId}
									setCurrentView={setCurrentView}
								/>
							))
						)}

						{/* Jika data survei kosong */}
						{surveys.length === 0 && !isLoading && (
							<Card className="border rounded-4 bg-light shadow-sm">
								<Card.Body className="text-center py-5">
									<p className="text-muted mb-0">Belum ada survei yang dibuat.</p>
								</Card.Body>
							</Card>
						)}
					</div>
				</div>
			)}

			{/* Tampilkan halaman form/detail kuesioner jika currentView adalah 'detail' */}
			{currentView === 'detail' && (
				<SurveyDetailPage
					surveyId={selectedSurveyId}
					eventId={eventId}
					initialSurvey={rawSurvey}
					onBack={() => {
						setCurrentView('list');
						fetchSurveyAndAnalytics();
					}}
				/>
			)}

			{/* Tampilkan halaman list respon jika currentView adalah 'responses' */}
			{currentView === 'responses' && (
				<div style={{ margin: '0 auto', padding: '2rem 1rem' }}>
					{/* Header dengan tombol kembali */}
					<div className="d-flex align-items-center gap-3 mb-4">
						<Button
							variant="outline-secondary"
							className="rounded-circle p-2 d-flex align-items-center justify-content-center"
							style={{ width: '40px', height: '40px' }}
							onClick={() => setCurrentView('list')}
						>
							<ArrowLeft size={20} />
						</Button>
						<div>
							<h3 className="mb-0 text-dark fw-bold">Hasil Respon Survei</h3>
							<p className="text-muted small mb-0">
								Melihat semua feedback yang dikirimkan oleh peserta untuk {rawSurvey?.title || 'Survei Event'}.
							</p>
						</div>
					</div>

					{/* Daftar Respon */}
					<div className="d-flex flex-column gap-3">
						{!surveyAnalytics?.responses || surveyAnalytics.responses.length === 0 ? (
							<Card className="border rounded-4 bg-light shadow-sm">
								<Card.Body className="text-center py-5">
									<p className="text-muted mb-0">Belum ada respon yang masuk untuk survei ini.</p>
								</Card.Body>
							</Card>
						) : (
							surveyAnalytics.responses.map((resp) => (
								<Card key={resp.id} className="border rounded-4 shadow-sm overflow-hidden">
									{/* Header Card Respon */}
									<Card.Header className="bg-white border-0 pt-4 px-4 pb-2">
										<div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
											<div>
												<h6 className="mb-0 text-dark fw-bold">{resp.user?.name || 'Peserta Tanpa Nama'}</h6>
												<span className="text-muted small">{resp.user?.email || '-'}</span>
											</div>
											<Badge bg="light" className="text-secondary border rounded-pill fw-medium">
												{new Date(resp.created_at).toLocaleString('id-ID', {
													day: 'numeric',
													month: 'short',
													year: 'numeric',
													hour: '2-digit',
													minute: '2-digit'
												})}
											</Badge>
										</div>
									</Card.Header>
									{/* Body Card Respon */}
									<Card.Body className="px-4 pb-4 pt-2">
										<hr className="my-2 text-muted opacity-25" />
										<div className="d-flex flex-column gap-3 mt-3">
											{resp.answers && resp.answers.length > 0 ? (
												resp.answers.map((ans) => {
													const questionText = ans.question?.label || 'Pertanyaan';
													const isRating = ans.question?.type === 'rating';
													const ratingValue = isRating ? parseInt(ans.value, 10) || 0 : 0;

													return (
														<div key={ans.id} className="pb-2 border-bottom border-light">
															<span className="text-muted small fw-medium d-block mb-1">
																{questionText}
															</span>
															{isRating ? (
																<div className="d-flex align-items-center gap-1">
																	{[1, 2, 3, 4, 5].map((starIdx) => (
																		<Star
																			key={starIdx}
																			size={16}
																			className={
																				starIdx <= ratingValue
																					? 'fill-warning text-warning'
																					: 'text-black-30'
																			}
																			style={{
																				fill: starIdx <= ratingValue ? '#ffc107' : 'none',
																				color: starIdx <= ratingValue ? '#ffc107' : '#dee2e6'
																			}}
																		/>
																	))}
																	<span className="ms-2 small fw-semibold text-dark">
																		{ratingValue} / 5
																	</span>
																</div>
															) : (
																<p className="mb-0 text-dark fw-medium" style={{ whiteSpace: 'pre-line' }}>
																	{ans.value || <em className="text-muted small">Tidak diisi</em>}
																</p>
															)}
														</div>
													);
												})
											) : (
												<p className="text-muted small mb-0 italic">Tidak ada detail jawaban.</p>
											)}
										</div>
									</Card.Body>
								</Card>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default Index;
