import React from 'react';
import { useNavigate, Link as RouterLink, NavLink } from 'react-router-dom';

import { ChevronLeft, Calendar, Layers, Users, Pencil, Eye } from 'lucide-react';

import { Row, Col, Button, Badge } from 'react-bootstrap';

const STATUS_STYLE = {
	published: {
		label: 'Published',
		bg: '#dcfce7',
		border: '#76b08b',
		color: '#166534',
	},
	draft: {
		label: 'Draft',
		bg: '#fef3c7',
		border: '#CCBC7B',
		color: '#b86f0a',
	},
	archived: {
		label: 'Archived',
		bg: '#e2e8f0',
		border: '#94a3b8',
		color: '#334155',
	},
};

const ManageLearningHeader = ({ id, learningPath, modules = [], onLinkedEventClick }) => {
	const navigate = useNavigate();

	const previewUrl = `/learner/learning-paths/${id}`;
	// Di dalam komponen / render JSX:
	const currentStatus = STATUS_STYLE[learningPath.status] || STATUS_STYLE.draft;

	return (
		<div>
			{/* BREADCRUMB */}
			<nav
				aria-label="Breadcrumb"
				className="d-flex align-items-center flex-wrap gap-2 mb-2"
				style={{
					fontSize: 'var(--font-sm, 14px)',
					color: 'var(--neutral-text, #64748b)',
				}}
			>
				<Button
					variant="link"
					aria-label="Kembali"
					className="p-0 border-0 text-decoration-none"
					style={{
						color: 'var(--neutral-text, #64748b)',
					}}
					onClick={() => navigate(-1)}
				>
					<ChevronLeft size={18} />
				</Button>

				<RouterLink
					to="/organizer/learning-paths"
					className="text-decoration-none"
					style={{
						color: 'var(--neutral-text, #64748b)',
					}}
				>
					Learning Paths
				</RouterLink>

				<span aria-hidden="true">/</span>

				<span
					aria-current="page"
					className="fw-medium"
					style={{
						color: 'var(--color-text, #1e293b)',
					}}
				>
					{learningPath.collectionName}
				</span>
			</nav>

			{/* HEADER */}
			<Row className="align-items-center gy-3 mb-2">
				<Col xs={12} lg>
					<div className="d-flex align-items-center flex-wrap gap-3">
						<h1
							className="fw-bold mb-0"
							style={{
								fontSize: 'var(--font-xl, 28px)',
								color: 'var(--color-text, #1e293b)',
							}}
						>
							{learningPath.title}
						</h1>

						<span
							className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill"
							style={{
								backgroundColor: currentStatus.bg,
								border: `1px solid ${currentStatus.border}`,
								color: currentStatus.color,
								fontSize: 'var(--font-xs, 12px)',
								fontWeight: 700,
							}}
						>
							<span
								className="rounded-circle"
								style={{
									width: 7,
									height: 7,
									backgroundColor: currentStatus.color,
								}}
							/>
							{currentStatus.label}
						</span>
					</div>
				</Col>

				<Col xs={12} lg="auto">
					<div className="d-flex align-items-center flex-wrap gap-2">
						<Button
							as={NavLink}
							to="/organizer/learning-path/1/edit"
							variant="primary"
							className="d-inline-flex align-items-center gap-2 fw-semibold"
						>
							<Pencil size={16} />
							Edit Details
						</Button>

						<Button
							variant="outline-secondary"
							className="d-inline-flex align-items-center gap-2 fw-semibold"
							onClick={() => window.open(previewUrl, '_blank', 'noopener')}
						>
							<Eye size={16} />
							Preview
						</Button>
					</div>
				</Col>
			</Row>

			{/* METADATA */}
			<div
				className="d-flex align-items-center flex-wrap gap-3 gap-lg-4 mb-4"
				style={{
					fontSize: 'var(--font-sm, 14px)',
					color: 'var(--neutral-text, #64748b)',
				}}
			>
				<Button
					variant="link"
					className="p-0 d-inline-flex align-items-center gap-2 text-decoration-none"
					style={{
						fontSize: 'var(--font-sm, 14px)',
						color: 'var(--neutral-text, #64748b)',
					}}
					onClick={onLinkedEventClick}
				>
					<Calendar size={16} />

					<span>
						Linked Event:{' '}
						<strong
							style={{
								color: 'var(--color-text-muted, #334155)',
							}}
						>
							{learningPath.linkedEvent || 'No linked event'}
						</strong>
					</span>
				</Button>

				<span className="d-inline-flex align-items-center gap-2">
					<Layers size={16} />
					{modules.length} {modules.length === 1 ? 'Module' : 'Modules'}
				</span>

				<span className="d-inline-flex align-items-center gap-2">
					<Users size={16} />
					{learningPath.enrolledStudents} Enrolled Students
				</span>
			</div>
		</div>
	);
};

export default ManageLearningHeader;
