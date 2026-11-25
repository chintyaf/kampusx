import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { BookOpen, Layers, Play, Bookmark, LogIn, ImageOff } from 'lucide-react';

const ACCENT = '#00A8E8';
const MUTED = '#94A3B8';

const getCtaLabel = (isAuthenticated, progressPercent) => {
	if (!isAuthenticated) return 'Login untuk Mulai Belajar';
	if (progressPercent >= 100) return 'Pelajari Kembali';
	if (progressPercent > 0) return 'Lanjutkan Belajar';
	return 'Mulai Belajar';
};

const getInitials = (name = '') =>
	name
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((word) => word[0].toUpperCase())
		.join('') || '?';

/** Baris organizer yang minimalis: avatar kecil + nama (link ke profil). */
const OrganizerLink = ({ instructor }) => {
	const [imageFailed, setImageFailed] = useState(false);

	if (!instructor) return null;

	const { id, name, avatar_url: avatarUrl, organization_name: organizationName } = instructor;
	const showImage = avatarUrl && !imageFailed;

	return (
		<Link
			to={`/profile/${id}`}
			className="d-inline-flex align-items-center gap-2 text-decoration-none mb-3"
			style={{ fontSize: '0.85rem' }}
		>
			<span style={{ color: MUTED }}>Dibuat oleh</span>

			{showImage ? (
				<img
					src={avatarUrl}
					alt=""
					className="rounded-circle flex-shrink-0"
					style={{ width: '26px', height: '26px', objectFit: 'cover' }}
					onError={() => setImageFailed(true)}
				/>
			) : (
				<span
					className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
					style={{
						width: '26px',
						height: '26px',
						fontSize: '0.65rem',
						backgroundColor: 'rgba(255, 255, 255, 0.15)',
						color: '#FFFFFF',
					}}
					aria-hidden="true"
				>
					{getInitials(name)}
				</span>
			)}

			<span className="fw-semibold text-white">{name}</span>

			<span style={{ color: MUTED }}>{organizationName && <> · {organizationName}</>}</span>
		</Link>
	);
};

/** Thumbnail 16:9 dengan placeholder jika kosong atau gagal dimuat. */
const Thumbnail = ({ src, alt }) => {
	const [imageFailed, setImageFailed] = useState(false);
	const showImage = src && !imageFailed;

	return (
		<div
			className="ratio ratio-16x9 rounded-4 overflow-hidden"
			style={{
				border: '1px solid rgba(255, 255, 255, 0.15)',
				boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
				backgroundColor: 'rgba(255, 255, 255, 0.06)',
			}}
		>
			{showImage ? (
				<img
					src={src}
					alt={alt}
					style={{ objectFit: 'cover' }}
					onError={() => setImageFailed(true)}
				/>
			) : (
				<div className="d-flex align-items-center justify-content-center">
					<ImageOff size={28} style={{ color: MUTED }} />
				</div>
			)}
		</div>
	);
};

const LearningHeader = ({
	path,
	metrics,
	isAuthenticated = false,
	isBookmarked = false,
	onToggleBookmark,
	onStart,
}) => {
	const title = path?.title ?? '';
	const description = path?.description ?? '';
	const thumbnailUrl = path?.thumbnail_url ?? null;
	const instructor = path?.instructor ?? null;
	const moduleCount = metrics?.moduleCount ?? 0;
	const lessonCount = metrics?.lessonCount ?? 0;
	const progressPercent = metrics?.progressPercent ?? 0;

	const CtaIcon = isAuthenticated ? Play : LogIn;

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
				{/* Breadcrumb */}
				<nav
					aria-label="breadcrumb"
					className="mb-3"
					style={{ '--bs-breadcrumb-divider-color': MUTED }}
				>
					<ol className="breadcrumb mb-0" style={{ fontSize: '0.85rem' }}>
						<li className="breadcrumb-item">
							<Link to="/learning" style={{ color: MUTED, textDecoration: 'none' }}>
								Home
							</Link>
						</li>
						<li
							className="breadcrumb-item active"
							aria-current="page"
							style={{ color: '#E2E8F0' }}
						>
							Learning Paths
						</li>
						<li className="breadcrumb-item" aria-hidden="true" />
					</ol>
				</nav>

				<Row className="align-items-center g-4">
					<Col lg={8}>
						<h1
							className="fw-bold mb-2 text-white"
							style={{
								fontSize: 'clamp(1.5rem, 5vw, 2.35rem)',
								letterSpacing: '-0.02em',
								lineHeight: 1.25,
							}}
						>
							{title}
						</h1>

						{description && (
							<p
								className="text-white-50 mb-3"
								style={{ fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '820px' }}
							>
								{description}
							</p>
						)}

						{/* Organizer */}
						<div>
							<OrganizerLink instructor={instructor} />
						</div>

						{/* Metrics */}
						<div className="d-flex align-items-center gap-2 gap-sm-3 flex-wrap small mb-3">
							<span className="d-flex align-items-center gap-2 text-white fw-semibold">
								<Layers size={15} style={{ color: ACCENT }} />
								{moduleCount} Modul
							</span>
							<span className="text-white-50">•</span>
							<span className="d-flex align-items-center gap-2 text-white fw-semibold">
								<BookOpen size={15} style={{ color: ACCENT }} />
								{lessonCount} Lesson
							</span>
							{isAuthenticated && progressPercent > 0 && (
								<>
									<span className="text-white-50">•</span>
									<span className="text-white fw-semibold">
										{progressPercent}% selesai
									</span>
								</>
							)}
						</div>

						{/* CTA */}
						<div className="d-flex align-items-center gap-2 flex-column flex-sm-row">
							<Button
								variant="primary"
								className="fw-bold px-4 py-2 rounded-3 d-inline-flex align-items-center justify-content-center gap-2"
								style={{
									backgroundColor: '#028090',
									borderColor: '#028090',
									fontSize: '0.92rem',
									boxShadow: '0 4px 14px rgba(2, 128, 144, 0.4)',
								}}
								onClick={onStart}
								disabled={lessonCount === 0}
							>
								<CtaIcon
									size={16}
									fill={isAuthenticated ? 'currentColor' : 'none'}
								/>
								<span>{getCtaLabel(isAuthenticated, progressPercent)}</span>
							</Button>

							<Button
								variant="outline-light"
								className="bookmark-btn fw-semibold px-3 py-2 rounded-3 d-inline-flex align-items-center justify-content-center gap-2"
								onClick={onToggleBookmark}
								aria-pressed={isBookmarked}
							>
								<Bookmark
									size={16}
									color={isBookmarked ? '#f59e0b' : '#FFFFFF'}
									fill={isBookmarked ? '#f59e0b' : 'transparent'}
								/>
								<span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
							</Button>
						</div>
					</Col>

					{/* Thumbnail */}
					<Col lg={4}>
						<Thumbnail src={thumbnailUrl} alt={title} />
					</Col>
				</Row>
			</Container>
		</section>
	);
};

export default LearningHeader;
