import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Spinner, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import SurveyCard from './SurveyCard';
import SurveyDetailPage from './SurveyDetailPage';
import FormHeading from '@/components/dashboard/FormHeading';
import api from '@/api/axios';
import { notify } from '@/utils/notify';
import { Users, Star, Activity, FileText } from 'lucide-react';
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
						session: null,
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
		</div>
	);
};

export default Index;
