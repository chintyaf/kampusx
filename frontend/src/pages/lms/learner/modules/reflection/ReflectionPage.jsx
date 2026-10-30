import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Row, Col } from 'react-bootstrap';
import { ChevronLeft, Sliders } from 'lucide-react';
import ResultCard from './ResultCard';
import LessonReview from './LessonReview';
import Rekomendasi from './Rekomendasi';

const OUTCOME_DATA = {
	outcome1: {
		id: 'outcome1',
		sx: 0.48,
		score: 60,
		passingScore: 75,
		themeColor: '#EF4444',
		badgeText: 'BELUM SIAP',
		headline: 'Belum Mencapai Target. Mari Review Materi Ini!',
		feedback:
			'Nilai kamu 60 (Min. 75). Rekomendasi AI: Ambil sesi remedial atau pelajari ulang Lesson yang belum tuntas sebelum mencoba kembali.',
		ctaPrimaryText: 'Tinjau Materi',
		metrics: {
			correct: 3,
			wrong: 0,
			unanswered: 2,
			answeredStr: '3/5 Soal diisi',
		},
		duration: '08m 45s',
		remedialCount: 2,
	},
	outcome2: {
		id: 'outcome2',
		sx: 0.65,
		score: 78,
		passingScore: 75,
		themeColor: '#F59E0B',
		badgeText: 'CUKUP SIAP',
		headline: 'Kerja Bagus! Kamu Lulus, Namun Perlu Penguatan',
		feedback:
			'Nilai kamu 78 (Min. 75). Rekomendasi AI: Pelajari materi pendukung untuk memperjelas konsep yang masih kurang dikuasai.',
		ctaPrimaryText: 'Pelajari Materi Pendukung',
		metrics: {
			correct: 4,
			wrong: 1,
			unanswered: 0,
			answeredStr: '5/5 Soal diisi',
		},
		duration: '10m 15s',
		remedialCount: 1,
	},
	outcome3: {
		id: 'outcome3',
		sx: 0.88,
		score: 90,
		passingScore: 75,
		themeColor: '#10B981',
		badgeText: 'SIAP',
		headline: 'Luar Biasa! Kamu Sangat Menguasai Materi Ini',
		feedback:
			'Nilai kamu 90 (Min. 75). Kesiapan belajar kamu sangat tinggi. Kamu siap untuk melanjutkan ke Modul berikutnya!',
		ctaPrimaryText: 'Lanjut ke Modul Berikutnya',
		metrics: {
			correct: 5,
			wrong: 0,
			unanswered: 0,
			answeredStr: '5/5 Soal diisi',
		},
		duration: '06m 30s',
		remedialCount: 0,
	},
};

const ReflectionPage = () => {
	const { moduleId = 'mod-arch-101' } = useParams();
	const navigate = useNavigate();

	const [selectedOutcomeKey, setSelectedOutcomeKey] = useState('outcome1');
	const currentOutcome = OUTCOME_DATA[selectedOutcomeKey];

	const moduleTitle = 'Web Application Architecture & REST API Design';

	return (
		<div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 80 }}>
			{/* Top Bar Navigation */}
			<div className="bg-white border-bottom py-3 mb-4 shadow-sm">
				<Container>
					<div className="d-flex align-items-center gap-3">
						<Button
							variant="light"
							className="rounded-circle p-2 border"
							onClick={() => navigate(-1)}
						>
							<ChevronLeft size={20} />
						</Button>
						<div>
							<span className="text-muted small d-block">
								Hasil Refleksi & Evaluasi
							</span>
							<h1 className="h5 fw-bold mb-0 text-dark">{moduleTitle}</h1>
						</div>
					</div>
				</Container>
			</div>

			{/* Main Content Area */}
			<Container style={{ paddingTop: 16 }}>
				<Row className="justify-content-center ">
					<Col lg={10} className='gap-3'>
						{/* 1. Hasil Evaluasi Quiz Card */}
						<ResultCard currentOutcome={currentOutcome} />

						{/* 2. Review Lesson Terkait */}
						<LessonReview currentOutcome={currentOutcome} />

						{/* 3. Rekomendasi Section */}
						<Rekomendasi currentOutcome={currentOutcome} />
					</Col>
				</Row>
			</Container>

			{/* Floating Action Switcher untuk preview 3 outcome */}
			<div
				style={{
					position: 'fixed',
					bottom: 24,
					left: 24,
					zIndex: 1000,
					background: '#0F172A',
					color: '#FFF',
					padding: '12px 16px',
					borderRadius: '12px',
					boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
				}}
			>
				<div className="d-flex align-items-center gap-2 mb-2">
					<Sliders size={16} />
					<span className="fw-bold small">Outcome Preview Switcher</span>
				</div>
				<div className="btn-group btn-group-sm" role="group">
					{Object.keys(OUTCOME_DATA).map((key) => (
						<button
							key={key}
							type="button"
							className={`btn ${selectedOutcomeKey === key ? 'btn-primary' : 'btn-outline-light'}`}
							onClick={() => setSelectedOutcomeKey(key)}
						>
							{key.toUpperCase()}
						</button>
					))}
				</div>
			</div>
		</div>
	);
};

export default ReflectionPage;
