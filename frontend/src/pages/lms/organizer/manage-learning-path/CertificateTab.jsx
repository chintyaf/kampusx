import React, { useState } from 'react';
import { Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';

// ====================================================
// CONFIGURATION
// ====================================================

const T = {
	primary: '#00699e',
	tint: '#dff3ff',
	muted: '#64748b',
	border: '#e2e8f0',
	card: '#ffffff',
	purple: '#7c3aed',
	rMd: '8px',
	fsm: '13px',
};

const CATEGORIES = ['Technical', 'Programming', 'Data Science', 'Soft Skills', 'Other'];

const ICONS = ['🏆', '🎓', '💻', '🚀', '⭐', '📚', '🧠', '🔐'];

const NETWORKS = {
	polygon: {
		option: 'Polygon',
		label: 'Polygon Network',
	},
	ethereum: {
		option: 'Ethereum',
		label: 'Ethereum Network',
	},
	offchain: {
		option: 'Off-chain',
		label: 'Off-chain Credential',
	},
};

const INITIAL_BADGES = [];

const cardStyle = {
	border: `1px solid ${T.border}`,
	borderRadius: T.rMd,
	background: T.card,
};

const fieldStyle = {
	borderRadius: T.rMd,
	fontSize: T.fsm,
};

// ====================================================
// BADGE FORM
// ====================================================

const EMPTY_FORM = {
	title: '',
	description: '',
	category: CATEGORIES[0],
	icon: ICONS[0],
	network: 'polygon',
};

const BadgeForm = ({ onCreate }) => {
	const [form, setForm] = useState(EMPTY_FORM);

	const set = (key) => (e) => {
		setForm({ ...form, [key]: e.target.value });
	};

	const submit = (e) => {
		e.preventDefault();

		onCreate({
			...form,
			title: form.title.trim(),
		});

		setForm(EMPTY_FORM);
	};

	return (
		<Card style={cardStyle}>
			<Card.Body as={Form} onSubmit={submit} className="d-grid gap-3">
				<h3 className="h6 fw-bold m-0">Buat Badge / Sertifikat Baru</h3>

				<Form.Group>
					<Form.Label className="small fw-semibold">Nama Badge / Sertifikat</Form.Label>
					<Form.Control
						style={fieldStyle}
						placeholder="Contoh: REST API Architecture Specialist"
						value={form.title}
						onChange={set('title')}
						required
					/>
				</Form.Group>

				<Form.Group>
					<Form.Label className="small fw-semibold">
						Deskripsi Capaian Pembelajaran
					</Form.Label>
					<Form.Control
						as="textarea"
						rows={3}
						style={fieldStyle}
						placeholder="Diberikan kepada peserta yang berhasil menyelesaikan seluruh modul..."
						value={form.description}
						onChange={set('description')}
					/>
				</Form.Group>

				<Row className="g-3">
					<Form.Group as={Col} md={6}>
						<Form.Label className="small fw-semibold">Kategori Kompetensi</Form.Label>
						<Form.Select
							style={fieldStyle}
							value={form.category}
							onChange={set('category')}
						>
							{CATEGORIES.map((category) => (
								<option key={category} value={category}>
									{category}
								</option>
							))}
						</Form.Select>
					</Form.Group>

					<Form.Group as={Col} md={6}>
						<Form.Label className="small fw-semibold">
							Tipe Penerbitan Kredensial
						</Form.Label>
						<Form.Select
							style={fieldStyle}
							value={form.network}
							onChange={set('network')}
						>
							{Object.entries(NETWORKS).map(([key, network]) => (
								<option key={key} value={key}>
									{network.option}
								</option>
							))}
						</Form.Select>
					</Form.Group>
				</Row>

				<div>
					<div className="small fw-semibold mb-2">Pilih Lambang Badge</div>

					<div className="d-flex gap-2 flex-wrap">
						{ICONS.map((icon) => (
							<Button
								key={icon}
								type="button"
								variant="light"
								onClick={() => setForm({ ...form, icon })}
								style={{
									width: 40,
									height: 40,
									padding: 0,
									borderRadius: T.rMd,
									border: `1px solid ${
										form.icon === icon ? T.primary : T.border
									}`,
									background: form.icon === icon ? T.tint : T.card,
								}}
							>
								{icon}
							</Button>
						))}
					</div>
				</div>

				<Button
					type="submit"
					disabled={!form.title.trim()}
					className="ms-auto"
					style={{
						background: T.primary,
						borderColor: T.primary,
						borderRadius: T.rMd,
						fontSize: T.fsm,
					}}
				>
					Terbitkan Template Badge
				</Button>
			</Card.Body>
		</Card>
	);
};

// ====================================================
// BADGE LIST
// ====================================================

const BadgeList = ({ badges }) => (
	<div className="d-grid gap-3 align-content-start">
		<h3 className="h6 fw-bold m-0">Badge Aktif ({badges.length})</h3>

		{badges.length === 0 && <p style={{ color: T.muted, fontSize: T.fsm }}>Belum ada badge.</p>}

		{badges.map((badge) => (
			<div key={badge.id} className="d-flex gap-3 p-3" style={cardStyle}>
				<div className="fs-3" aria-hidden="true">
					{badge.icon}
				</div>

				<div>
					<div className="small fw-bold">{badge.title}</div>

					<small style={{ color: T.muted }}>{badge.category}</small>

					<div className="d-flex align-items-center gap-2 my-2 small">
						<Badge
							bg=""
							style={{
								background: T.tint,
								color: T.primary,
							}}
						>
							Min {badge.minScore}%
						</Badge>

						<span style={{ color: T.muted }}>{badge.issued} Penerima</span>
					</div>

					<small style={{ color: T.purple }}>
						{NETWORKS[badge.network]?.label ?? badge.network}
					</small>
				</div>
			</div>
		))}
	</div>
);

// ====================================================
// CERTIFICATE TAB
// ====================================================

const CertificateTab = ({ id: learningId }) => {
	const [badges, setBadges] = useState(INITIAL_BADGES);

	const [criteria, setCriteria] = useState({
		minScore: 75,
		forethought: true,
		reflection: true,
		autoMint: true,
	});

	const handleCreate = (values) => {
		setBadges((prev) => [
			{
				id: Date.now(),
				learningId,
				issued: 0,
				...criteria,
				...values,
			},
			...prev,
		]);
	};

	return (
		<div className="d-grid gap-4">
			<div>
				<h2 className="h5 fw-bold m-0">Certificate & Badges</h2>

				<p
					className="m-0"
					style={{
						color: T.muted,
						fontSize: T.fsm,
					}}
				>
					Atur kriteria kelulusan, lalu terbitkan badge dan sertifikat untuk peserta
					Learning Path ini.
				</p>
			</div>

			<Row className="g-4">
				<Col lg={8} className="d-grid gap-4 align-content-start">
					<BadgeForm onCreate={handleCreate} />
				</Col>

				<Col lg={4}>
					<BadgeList badges={badges} />
				</Col>
			</Row>
		</div>
	);
};

export default CertificateTab;
