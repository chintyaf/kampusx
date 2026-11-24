import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import ExploreGridCard from '@/pages/lms/learner/explore-lms/ExploreGridCard';

const Rekomendasi = ({ recommendations = [] }) => {
	const { slug, moduleId } = useParams();
	const navigate = useNavigate();
	const [bookmarkedIds, setBookmarkedIds] = useState([]);

	if (!Array.isArray(recommendations) || recommendations.length === 0) {
		return null;
	}

	const handleToggleBookmark = (e, id) => {
		setBookmarkedIds((prev) =>
			prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id],
		);
	};

	const handleNavigate = (item) => {
		const targetSlug = item.learningPathSlug || slug;
		const targetModuleId = item.moduleId || moduleId;

		if (item.type === 'lesson' && targetSlug && targetModuleId) {
			navigate(
				`/learner/learning-paths/${targetSlug}/modules/${targetModuleId}/lessons/${item.id}`,
			);
			return;
		}

		if (item.type === 'module' && targetSlug) {
			navigate(`/learner/learning-paths/${targetSlug}/modules/${item.id}`);
			return;
		}

		if (item.type === 'learning_path') {
			navigate(`/learner/learning-paths/${item.slug || item.id}`);
			return;
		}

		navigate('/learner/explore');
	};

	return (
		<Container className="py-2 px-0 mt-4">
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
						{recommendations.length} materi direkomendasikan
					</span>
				</div>
			</div>

			<Row className="g-4">
				{recommendations.map((item) => (
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
