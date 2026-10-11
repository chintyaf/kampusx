import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Sparkles, BookOpen, Clock, Star, ShieldCheck, Play, Bookmark } from 'lucide-react';
import { MOCK_LEARNING_PATH } from './mockData'; // Sesuaikan path ke mockData

const LearningHeader = ({ isBookmarked: externalIsBookmarked, onToggleBookmark }) => {
	const navigate = useNavigate();
	const [internalIsBookmarked, setInternalIsBookmarked] = useState(false);

	const isBookmarked =
		externalIsBookmarked !== undefined ? externalIsBookmarked : internalIsBookmarked;

	const handleBookmarkClick = () => {
		if (onToggleBookmark) {
			onToggleBookmark();
		} else {
			setInternalIsBookmarked(!internalIsBookmarked);
		}
	};

	return (
		<section
			style={{
				background: 'linear-gradient(135deg, #0B2545 0%, #134074 100%)',
				color: '#FFFFFF',
				padding: '2.5rem 0 3.5rem 0',
				position: 'relative',
				borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
			}}
		>
			<Container>
				{/* Breadcrumb Navigation */}
				<nav aria-label="breadcrumb" className="mb-3">
					<ol className="breadcrumb mb-0" style={{ fontSize: '0.85rem' }}>
						<li className="breadcrumb-item">
							<Link to="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>
								Home
							</Link>
						</li>
						<li className="breadcrumb-item">
							<Link
								to="/explore-microlearning"
								style={{ color: '#94A3B8', textDecoration: 'none' }}
							>
								Explore
							</Link>
						</li>
						<li className="breadcrumb-item">
							<span style={{ color: '#94A3B8' }}>Learning Paths</span>
						</li>
						<li
							className="breadcrumb-item active"
							aria-current="page"
							style={{ color: '#E2E8F0' }}
						>
							AI Engineering & RAG Masterclass
						</li>
					</ol>
				</nav>

				<Row className="align-items-center g-4">
					<Col lg={9}>
						{/* Badge Topik */}
						<div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
							<span
								className="badge px-3 py-1 fw-bold d-inline-flex align-items-center gap-1"
								style={{
									backgroundColor: 'rgba(255, 255, 255, 0.15)',
									color: '#00A8E8',
									backdropFilter: 'blur(8px)',
									border: '1px solid rgba(0, 168, 232, 0.35)',
									fontSize: '0.78rem',
									borderRadius: '9999px',
									letterSpacing: '0.04em',
								}}
							>
								<Layers size={13} />
								<span>🗺️ LEARNING PATH</span>
							</span>

							<span
								className="badge px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1"
								style={{
									backgroundColor: 'rgba(2, 128, 144, 0.25)',
									color: '#E0F2FE',
									border: '1px solid rgba(2, 128, 144, 0.4)',
									fontSize: '0.78rem',
									borderRadius: '9999px',
								}}
							>
								<Sparkles size={12} className="text-warning" />
								<span>AI Recommended Path</span>
							</span>
						</div>

						{/* Judul Utama */}
						<h1
							className="fw-bold mb-2 text-white"
							style={{
								fontSize: 'clamp(1.5rem, 5vw, 2.35rem)',
								letterSpacing: '-0.02em',
								lineHeight: 1.25,
							}}
						>
							{MOCK_LEARNING_PATH.title}
						</h1>

						{/* Sub-deskripsi */}
						<p
							className="text-white-50 mb-3"
							style={{ fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '820px' }}
						>
							{MOCK_LEARNING_PATH.description}
						</p>

						{/* Metrics Bar */}
						<div className="d-flex align-items-center gap-2 gap-sm-3 text-white-50 flex-wrap small mb-3">
							<span className="d-flex align-items-center gap-2 text-white fw-semibold">
								<BookOpen size={15} style={{ color: '#00A8E8' }} />
								{MOCK_LEARNING_PATH.metrics.moduleCount} Modules
							</span>
							<span>•</span>
							<span className="d-flex align-items-center gap-2 text-white fw-semibold">
								<Clock size={15} style={{ color: '#00A8E8' }} />
								{MOCK_LEARNING_PATH.metrics.totalHours}
							</span>
							<span>•</span>
							<span>{MOCK_LEARNING_PATH.metrics.enrolledCount}</span>
							<span>•</span>
							<span className="d-flex align-items-center gap-1 text-warning fw-bold">
								<Star size={14} fill="#f59e0b" color="#f59e0b" />
								<span>{MOCK_LEARNING_PATH.metrics.rating}</span>
								<span className="text-white-50 fw-normal">
									({MOCK_LEARNING_PATH.metrics.reviewsCount})
								</span>
							</span>
							<span>•</span>
							<span>Updated {MOCK_LEARNING_PATH.metrics.updatedAt}</span>
						</div>

						{/* Smart Contract Verification Pill */}
						<div className="mb-4">
							<span
								className="badge px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2 text-wrap text-start"
								style={{
									backgroundColor: 'rgba(11, 37, 69, 0.65)',
									border: '1px solid rgba(0, 168, 232, 0.4)',
									color: '#E0F2FE',
									borderRadius: '8px',
									fontSize: '0.8rem',
									lineHeight: 1.4,
								}}
							>
								<ShieldCheck
									size={16}
									className="flex-shrink-0"
									style={{ color: '#00A8E8' }}
								/>
								<span>🛡️ 7 Certificates & Blockchain Smart Contract Verified</span>
							</span>
						</div>

						{/* CTA Action Buttons */}
						<div className="d-flex align-items-center gap-2 flex-column flex-sm-row">
							<Button
								variant="primary"
								className="fw-bold px-4 py-2 rounded-3 shadow-sm d-inline-flex align-items-center justify-content-center gap-2"
								style={{
									backgroundColor: '#028090',
									borderColor: '#028090',
									fontSize: '0.92rem',
									boxShadow: '0 4px 14px rgba(2, 128, 144, 0.4)',
								}}
								onClick={() => navigate('/learner/modules/mod-1')}
							>
								<Play size={16} fill="currentColor" />
								<span>Continue Path / Start Learning</span>
							</Button>

							<Button
								variant="outline-light"
								className="fw-semibold px-3 py-2 rounded-3 d-inline-flex align-items-center justify-content-center gap-2"
								style={{
									backgroundColor: 'rgba(255, 255, 255, 0.08)',
									borderColor: 'rgba(255, 255, 255, 0.3)',
									fontSize: '0.92rem',
								}}
								onClick={handleBookmarkClick}
							>
								<Bookmark
									size={16}
									color={isBookmarked ? '#f59e0b' : '#FFFFFF'}
									fill={isBookmarked ? '#f59e0b' : 'transparent'}
								/>
								<span>
									{isBookmarked ? 'Bookmarked' : 'Preview Path / Bookmark'}
								</span>
							</Button>
						</div>
					</Col>
				</Row>
			</Container>
		</section>
	);
};

export default LearningHeader;
