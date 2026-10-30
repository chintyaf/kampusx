import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import ExploreGridCard from '@/pages/lms/learner/explore-lms/ExploreGridCard';

const RECOMMENDATIONS_DATA = [
	{
		id: '1',
		type: 'lesson',
		title: 'REST API Stateless Fundamentals',
		description:
			'Pelajari kembali konsep stateless, request mandiri, dan batas tanggung jawab client-server.',
		durationLabel: '12 Menit',
		thumbnail:
			'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
	},
	{
		id: '2',
		type: 'learning_path',
		title: 'HTTP Methods & Status Codes',
		description:
			'Bangun pemahaman menyeluruh tentang method, response, status code, dan pola komunikasi REST.',
		moduleCount: 2,
		lessonCount: 6,
		durationLabel: '1.5 Jam',
		thumbnail:
			'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=800&auto=format&fit=crop',
	},
	{
		id: '3',
		type: 'module',
		title: 'JSON Data Exchange for REST API',
		description:
			'Kuasai struktur JSON, serialization, dan praktik pertukaran data yang aman pada REST API.',
		lessonCount: 4,
		level: 'Menengah',
		durationLabel: '40 Menit',
		isEnrolled: false,
		thumbnail:
			'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800&auto=format&fit=crop',
	},
];

const Rekomendasi = () => {
	const [bookmarkedIds, setBookmarkedIds] = useState([]);

	const handleToggleBookmark = (e, id) => {
		setBookmarkedIds((prev) =>
			prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id],
		);
	};

	const handleNavigate = (item) => {
		console.log('Navigating to:', item.title);
	};

	return (
		<Container className="py-2 px-0">
			<div className="mb-4">
				<span
					className="text-uppercase fw-bold text-primary small d-block mb-1"
					style={{ letterSpacing: '0.05em' }}
				>
					Rekomendasi Personal
				</span>

				<div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
					<div>
						<h2 className="h5 fw-bold mb-1 text-dark">
							Materi untuk memperkuat pemahamanmu
						</h2>
						<p className="text-muted mb-0 small">
							Disusun berdasarkan jawaban yang perlu ditinjau dan readiness level
							kamu.
						</p>
					</div>

					<span className="fw-semibold text-primary small text-nowrap">
						{RECOMMENDATIONS_DATA.length} materi direkomendasikan
					</span>
				</div>
			</div>

			<Row className="g-4">
				{RECOMMENDATIONS_DATA.map((item) => (
					<Col key={item.id} xs={12} md={6} lg={4}>
						<ExploreGridCard
							item={item}
							isBookmarked={bookmarkedIds.includes(item.id)}
							onToggleBookmark={handleToggleBookmark}
							onNavigate={handleNavigate}
						/>
					</Col>
				))}
			</Row>
		</Container>
	);
};

export default Rekomendasi;
