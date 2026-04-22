import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import CertificateBuilderPage from './CertificateBuilderPage';

/* ─── Sample Data ─────────────────────────────────────── */
const SAMPLE_CERTS = [
	{
		id: 1,
		name: 'Sertifikat Seminar Nasional AI 2025',
		event: 'Seminar Nasional AI 2025',
		createdAt: '12 Apr 2025',
		participants: 142,
		status: 'active',
		thumbnail: null,
	},
	{
		id: 2,
		name: 'Workshop UI/UX Design',
		event: 'Workshop UI/UX Design',
		createdAt: '3 Mar 2025',
		participants: 58,
		status: 'active',
		thumbnail: null,
	},
	{
		id: 3,
		name: 'Pelatihan Data Science',
		event: 'Bootcamp Data Science',
		createdAt: '18 Feb 2025',
		participants: 230,
		status: 'draft',
		thumbnail: null,
	},
	{
		id: 4,
		name: 'Sertifikat Webinar Kepemimpinan',
		event: 'Webinar Kepemimpinan',
		createdAt: '5 Jan 2025',
		participants: 87,
		status: 'active',
		thumbnail: null,
	},
];

const PALETTE = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

/* ─── Certificate Card Component ──────────────────────── */
function CertCard({ cert, index, onEdit }) {
	const color = PALETTE[index % PALETTE.length];

	return (
		<Card className="h-100 border rounded-4 overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
			{/* Thumbnail */}
			<div
				className="d-flex align-items-center justify-content-center position-relative"
				style={{
					height: '110px',
					background: `linear-gradient(135deg, ${color}18, ${color}08)`,
					borderBottom: `1px solid ${color}22`,
				}}>
				{/* Decorative cert lines */}
				<div className="d-flex flex-column align-items-center w-75 gap-1">
					<div
						style={{
							width: '60%',
							height: '5px',
							borderRadius: '3px',
							background: color,
							opacity: 0.3,
						}}
					/>
					<div
						style={{
							width: '40%',
							height: '5px',
							borderRadius: '3px',
							background: color,
							opacity: 0.18,
							marginTop: '8px',
						}}
					/>
					<div
						style={{
							width: '50%',
							height: '5px',
							borderRadius: '3px',
							background: color,
							opacity: 0.18,
							marginTop: '4px',
						}}
					/>
					<div
						style={{
							width: '24px',
							height: '24px',
							borderRadius: '50%',
							border: `2px solid ${color}60`,
							marginTop: '8px',
						}}
					/>
				</div>

				<Badge
					pill
					bg={cert.status === 'active' ? 'success' : 'warning'}
					text={cert.status === 'active' ? 'light' : 'dark'}
					className="position-absolute top-0 end-0 m-2 fw-semibold border"
					style={{ borderColor: cert.status === 'active' ? '#bbf7d0' : '#fde68a' }}>
					{cert.status === 'active' ? '✓ Aktif' : '○ Draft'}
				</Badge>
			</div>

			{/* Info */}
			<Card.Body className="d-flex flex-column p-3">
				<Card.Title className="fs-6 fw-bold text-dark mb-1 lh-sm">{cert.name}</Card.Title>
				<Card.Subtitle className="text-secondary mb-3" style={{ fontSize: '0.8rem' }}>
					{cert.event}
				</Card.Subtitle>

				<div
					className="d-flex justify-content-between text-secondary mb-3 mt-auto"
					style={{ fontSize: '0.75rem' }}>
					<span className="d-flex align-items-center gap-1">
						<div
							style={{
								width: '5px',
								height: '5px',
								borderRadius: '50%',
								background: '#cbd5e1',
							}}
						/>
						Dibuat {cert.createdAt}
					</span>
					<span className="d-flex align-items-center gap-1 text-muted">
						<svg
							width="11"
							height="11"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2">
							<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
							<circle cx="9" cy="7" r="4" />
							<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
							<path d="M16 3.13a4 4 0 0 1 0 7.75" />
						</svg>
						{cert.participants}
					</span>
				</div>

				<div className="d-flex align-items-center gap-2">
					<Button
						variant="primary"
						size="sm"
						className="flex-grow-1 fw-bold bg-opacity-10 text-primary border-primary rounded-3"
						style={{ backgroundColor: '#eff6ff' }}
						onClick={() => onEdit(cert)}>
						Edit Template
					</Button>
					<Button
						variant="light"
						size="sm"
						className="border rounded-3 text-secondary d-flex align-items-center justify-content-center p-2">
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="7 10 12 15 17 10" />
							<line x1="12" y1="15" x2="12" y2="3" />
						</svg>
					</Button>
					<Button
						variant="light"
						size="sm"
						className="border rounded-3 text-danger d-flex align-items-center justify-content-center p-2">
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2">
							<polyline points="3 6 5 6 21 6" />
							<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
						</svg>
					</Button>
				</div>
			</Card.Body>
		</Card>
	);
}

/* ─── Main App Component ─────────────────────────────── */
export default function CertificateApp() {
	const [page, setPage] = useState('list'); // 'list' | 'builder'
	const [editCert, setEditCert] = useState(null);
	const [search, setSearch] = useState('');

	const filtered = SAMPLE_CERTS.filter(
		(c) =>
			c.name.toLowerCase().includes(search.toLowerCase()) ||
			c.event.toLowerCase().includes(search.toLowerCase()),
	);

	if (page === 'builder') {
		return (
			<CertificateBuilderPage
				onBack={() => {
					setPage('list');
					setEditCert(null);
				}}
				cert={editCert}
			/>
		);
	}

	const statsData = [
		{ label: 'Total Template', value: SAMPLE_CERTS.length, icon: '◧', color: '#3b82f6' },
		{
			label: 'Aktif',
			value: SAMPLE_CERTS.filter((c) => c.status === 'active').length,
			icon: '✓',
			color: '#15803d',
		},
		{
			label: 'Draft',
			value: SAMPLE_CERTS.filter((c) => c.status === 'draft').length,
			icon: '○',
			color: '#92400e',
		},
		{
			label: 'Total Peserta',
			value: SAMPLE_CERTS.reduce((a, c) => a + c.participants, 0),
			icon: '◉',
			color: '#1e293b',
		},
	];

	return (
		<div
			style={{
				minHeight: '100vh',
				background: '#f8fafc',
				fontFamily: "'DM Sans', 'Nunito', system-ui, sans-serif",
			}}
			className="py-4 py-md-5">
			<Container>
				{/* Header */}
				<div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
					<div>
						<div
							className="d-flex align-items-center gap-2 mb-1"
							style={{ fontSize: '0.8rem' }}>
							<span className="text-secondary">Dashboard</span>
							<span className="text-muted">/</span>
							<span className="text-dark fw-bold">Sertifikat</span>
						</div>
						<h1 className="fs-4 fw-bold text-dark mb-1">Template Sertifikat</h1>
						<p className="text-secondary m-0" style={{ fontSize: '0.85rem' }}>
							Kelola dan desain template e-sertifikat untuk setiap acara.
						</p>
					</div>
					<Button
						variant="primary"
						className="d-flex align-items-center gap-2 fw-semibold px-3 py-2 rounded-3 border-0"
						style={{ backgroundColor: '#1e40af' }}
						onClick={() => {
							setEditCert(null);
							setPage('builder');
						}}>
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5">
							<line x1="12" y1="5" x2="12" y2="19" />
							<line x1="5" y1="12" x2="19" y2="12" />
						</svg>
						Buat Sertifikat Baru
					</Button>
				</div>

				{/* Stats bar */}
				<Row className="g-3 mb-4">
					{statsData.map((s, i) => (
						<Col xs={6} lg={3} key={i}>
							<Card className="h-100 border rounded-3 text-start">
								<Card.Body className="d-flex align-items-center gap-3 p-3">
									<span className="fs-5" style={{ color: s.color }}>
										{s.icon}
									</span>
									<div>
										<p
											className="fs-5 fw-bold mb-0 lh-1"
											style={{
												color: s.color === '#3b82f6' ? '#1e293b' : s.color,
											}}>
											{s.value}
										</p>
										<p
											className="text-secondary m-0 mt-1"
											style={{ fontSize: '0.75rem' }}>
											{s.label}
										</p>
									</div>
								</Card.Body>
							</Card>
						</Col>
					))}
				</Row>

				{/* Search + filter */}
				<div className="d-flex flex-column flex-md-row align-items-md-center gap-3 mb-4">
					<InputGroup className="flex-grow-1" style={{ maxWidth: '400px' }}>
						<InputGroup.Text className="bg-white border-end-0 text-secondary pe-0">
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2">
								<circle cx="11" cy="11" r="8" />
								<line x1="21" y1="21" x2="16.65" y2="16.65" />
							</svg>
						</InputGroup.Text>
						<Form.Control
							className="border-start-0 ps-2 bg-white rounded-end"
							placeholder="Cari template sertifikat..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							style={{ fontSize: '0.9rem', boxShadow: 'none' }}
						/>
					</InputGroup>
					<div className="d-flex gap-2">
						<Button
							variant="primary"
							size="sm"
							className="rounded-3 px-3 fw-medium"
							style={{ backgroundColor: '#1e40af', border: 'none' }}>
							Semua
						</Button>
						<Button
							variant="outline-secondary"
							size="sm"
							className="rounded-3 px-3 fw-medium bg-transparent border-light-subtle text-dark">
							Aktif
						</Button>
						<Button
							variant="outline-secondary"
							size="sm"
							className="rounded-3 px-3 fw-medium bg-transparent border-light-subtle text-dark">
							Draft
						</Button>
					</div>
				</div>

				{/* Grid */}
				{filtered.length === 0 ? (
					<div className="d-flex flex-column align-items-center justify-content-center py-5">
						<svg
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#cbd5e1"
							strokeWidth="1.5">
							<rect x="3" y="3" width="18" height="18" rx="2" />
							<path d="M9 9h6M9 13h4" />
						</svg>
						<p className="text-secondary mt-3" style={{ fontSize: '0.9rem' }}>
							Tidak ada template ditemukan
						</p>
					</div>
				) : (
					<Row xs={1} sm={2} lg={3} xl={4} className="g-4">
						{/* Add new card */}
						<Col>
							<Card
								className="h-100 d-flex flex-column align-items-center justify-content-center text-center p-4 border"
								style={{
									borderStyle: 'dashed !important',
									borderWidth: '2px !important',
									borderColor: '#bfdbfe',
									backgroundColor: '#fff',
									cursor: 'pointer',
									minHeight: '220px',
									borderRadius: '16px',
								}}
								onClick={() => {
									setEditCert(null);
									setPage('builder');
								}}>
								<div
									className="d-flex align-items-center justify-content-center rounded-circle mb-2"
									style={{
										width: '48px',
										height: '48px',
										backgroundColor: '#eff6ff',
									}}>
									<svg
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="#3b82f6"
										strokeWidth="2">
										<line x1="12" y1="5" x2="12" y2="19" />
										<line x1="5" y1="12" x2="19" y2="12" />
									</svg>
								</div>
								<h6
									className="fw-bold mb-1"
									style={{ color: '#1e40af', fontSize: '0.9rem' }}>
									Buat Template Baru
								</h6>
								<p className="text-secondary m-0" style={{ fontSize: '0.75rem' }}>
									Desain sertifikat dari awal
								</p>
							</Card>
						</Col>

						{/* Existing Cards */}
						{filtered.map((cert, i) => (
							<Col key={cert.id}>
								<CertCard
									cert={cert}
									index={i}
									onEdit={(c) => {
										setEditCert(c);
										setPage('builder');
									}}
								/>
							</Col>
						))}
					</Row>
				)}
			</Container>
		</div>
	);
}
