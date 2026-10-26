import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockRecommendedModules } from '../../data/learningMockData';
import LmsCard from './LmsCard';

const RecommendedModules = ({
	modules = mockRecommendedModules,
	bookmarkedIds = [],
	onToggleBookmark = () => {},
	limit, // Opsional: jika ingin membatasi jumlah (misal 6 atau 8), kosongkan untuk tampilkan semua
}) => {
	const navigate = useNavigate();

	// Hapus pemotongan slice(0,3) agar menampilkan semua/sesuai limit
	const displayModules = limit ? modules.slice(0, limit) : modules;

	const handleNavigate = (item) => {
		if (item.type === 'learning_path') {
			navigate(`/learner/paths/${item.id}`);
		} else if (item.type === 'lesson') {
			navigate(`/learner/lessons/${item.id}`);
		} else {
			navigate(`/learner/modules/${item.id}`);
		}
	};

	return (
		<div className="mb-4 mt-4 pt-4">
			{/* Section Header */}
			<div className="d-flex align-items-center justify-content-between mb-3">
				<div>
					<h3
						className="fw-bold mb-0 text-dark"
						style={{ fontSize: '1rem', letterSpacing: '-0.01em' }}
					>
						Recommended For You
					</h3>
					<p
						className="text-muted small mb-0"
						style={{ fontSize: '0.75rem'}}
					>
						Microlearning bites matched to your learning path & SRL habits
					</p>
				</div>
				<button
					type="button"
					onClick={() => navigate('/explore-microlearning')}
					className="btn btn-link text-decoration-none fw-semibold p-0 small d-inline-flex align-items-center gap-1"
					style={{ color: 'var(--primary-purple, #6f42c1)' }}
				>
					<span>Explore All</span>
					<ChevronRight size={14} />
				</button>
			</div>

			{/* Grid Responsif: xl=3 (4 item/baris), lg=4 (3 item/baris), md=6 (2 item/baris), xs=12 (1 item/baris) */}
			<Row className="g-3">
				{displayModules.map((item) => {
					const normalizedItem = {
						type: 'module',
						durationLabel: item.durationLabel || item.duration,
						lessonCount: item.lessonCount ?? item.lessonsCount,
						level: item.level || item.difficulty,
						...item,
					};

					const isBookmarked = bookmarkedIds.includes(item.id);

					return (
						<Col
							key={item.id}
							xl={3}
							lg={4}
							md={6}
							xs={12}
							className="d-flex align-items-stretch"
						>
							<LmsCard
								item={normalizedItem}
								isBookmarked={isBookmarked}
								onToggleBookmark={onToggleBookmark}
								onNavigate={handleNavigate}
							/>
						</Col>
					);
				})}
			</Row>
		</div>
	);
};

export default RecommendedModules;
