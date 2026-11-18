import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Nav, Table, Badge, Button, Form, Modal } from 'react-bootstrap';
import { BarChart2, ArrowRight, FileCode, Copy, Check } from 'lucide-react';

const SRL_LOGS = [
	{
		id: 'srl-001',
		name: 'Ahmad Faiz',
		email: 'faiz@kampusx.id',
		module: 'Web Application Architecture',
		phase: 'Forethought',
		action: 'Set 45m study goal & Pomodoro strategy',
		status: 'Completed',
		time: '2026-03-01 14:22:10',
	},
	{
		id: 'srl-002',
		name: 'Siti Rahma',
		email: 'siti@kampusx.id',
		module: 'Data Science Foundations',
		phase: 'Performance',
		action: 'Watched video & answered checkpoint #2',
		status: 'Completed',
		time: '2026-03-01 14:18:45',
	},
	{
		id: 'srl-003',
		name: 'Budi Santoso',
		email: 'budi@kampusx.id',
		module: 'Web Application Architecture',
		phase: 'Self-Reflection',
		action: 'Scored 65/100 (Below passing 75) - Recommended Remedial',
		status: 'Needs Remedial',
		time: '2026-03-01 14:05:30',
	},
	{
		id: 'srl-004',
		name: 'Dewi Lestari',
		email: 'dewi@kampusx.id',
		module: 'Smart Contract & Blockchain',
		phase: 'Self-Reflection',
		action: 'Scored 90/100 - SRL Readiness Level: SIAP (High)',
		status: 'Passed & Certified',
		time: '2026-03-01 13:50:12',
	},
];

const BLOCKCHAIN_LOGS = [
	{
		id: 'tx-001',
		name: 'Dewi Lestari',
		cert: 'Smart Contract & Blockchain Credential',
		txHash: '0x9a8f43b712c9842a1941d4019ff88b6a12b7a0d4c9f138e64c',
		block: 4892104,
		api: '200 OK',
		time: '2026-03-01 13:52:00',
		payload: {
			recipient: '0x321f8a709B0e38612f0198E298B312e09B2C4B18',
			tokenId: 104,
			courseId: 'lp-04',
			credentialType: 'ERC-1155',
			score: 90,
			readinessLevel: 'Siap',
			srlVerified: true,
			timestamp: 1772437920,
			issuer: 'KampusX Decentralized LMS Authority',
			signature: '0x7b58c8942b0...e421',
		},
	},
	{
		id: 'tx-002',
		name: 'Rian Prasetya',
		cert: 'REST API Architect Certificate',
		txHash: '0x43b72c9182a419401988b6a12b7a0d4c9f138e64ce91a82f34',
		block: 4891950,
		api: '200 OK',
		time: '2026-03-01 11:20:15',
		payload: {
			recipient: '0x9482F84b39174092b2A34A8109F32187b409AC81',
			tokenId: 103,
			courseId: 'lp-01',
			credentialType: 'ERC-1155',
			score: 85,
			readinessLevel: 'Siap',
			srlVerified: true,
			timestamp: 1772428815,
			issuer: 'KampusX Decentralized LMS Authority',
			signature: '0x12a9e8841b0...d841',
		},
	},
	{
		id: 'tx-003',
		name: 'Agus Wijaya',
		cert: 'Data Science Associate',
		txHash: '0x1128fa7419b489a203498b7120a48b71a938c019284ba71928',
		block: 4891200,
		api: '429 RateLimit',
		time: '2026-02-28 17:40:02',
		payload: {
			recipient: '0x629a84B709b18361280918B2189a4B7120a48C19',
			tokenId: 102,
			courseId: 'lp-02',
			credentialType: 'ERC-1155',
			score: 80,
			readinessLevel: 'Cukup',
			srlVerified: true,
			timestamp: 1772365202,
			issuer: 'KampusX Decentralized LMS Authority',
			signature: '0x539bf429b10...f910',
		},
	},
];

const PHASE_BG = { Forethought: 'primary', Performance: 'info', 'Self-Reflection': 'secondary' };

// props:
//   id     : learningId
//   routes : objek ROUTES dari ManageLearningPathPage
const AnalyticTab = ({ id, routes }) => {
	const navigate = useNavigate();
	const [tab, setTab] = useState('srl');
	const [search, setSearch] = useState('');
	const [selected, setSelected] = useState(null);
	const [copied, setCopied] = useState(false);

	const q = search.toLowerCase();
	const srlRows = SRL_LOGS.filter((l) => `${l.name} ${l.module}`.toLowerCase().includes(q));
	const txRows = BLOCKCHAIN_LOGS.filter((t) =>
		`${t.name} ${t.cert} ${t.txHash}`.toLowerCase().includes(q),
	);

	const handleCopy = () => {
		navigator.clipboard.writeText(JSON.stringify(selected.payload, null, 2));
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="d-flex flex-column gap-3">
			{/* Header */}
			{/* Logs */}
			<Card
				style={{
					border: '1px solid var(--neutral-border, #e2e8f0)',
					borderRadius: 'var(--radius-lg, 14px)',
				}}
			>
				<Card.Body>
					<h3 className="fw-bold mb-1" style={{ fontSize: 'var(--font-md, 16px)' }}>
						System & Activity Logs
					</h3>
					<p
						className="mb-3"
						style={{
							fontSize: 'var(--font-sm, 14px)',
							color: 'var(--neutral-text, #64748b)',
						}}
					>
						Pelacakan aktivitas metakognitif SRL siswa dan telemetri transaksi smart
						contract blockchain.
					</p>

					<Nav variant="tabs" activeKey={tab} onSelect={setTab} className="mb-3">
						<Nav.Item>
							<Nav.Link eventKey="srl">Student SRL Logs ({srlRows.length})</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link eventKey="blockchain">
								Smart Contract Logs ({txRows.length})
							</Nav.Link>
						</Nav.Item>
					</Nav>

					<Form.Control
						className="mb-3"
						placeholder="Cari berdasarkan nama peserta, modul, atau tx hash..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>

					{tab === 'srl' ? (
						<Table responsive hover size="sm" className="align-middle">
							<thead>
								<tr>
									<th>Siswa</th>
									<th>Modul</th>
									<th>Fase SRL</th>
									<th>Detail Aktivitas</th>
									<th>Status</th>
									<th className="text-end">Waktu</th>
								</tr>
							</thead>
							<tbody>
								{srlRows.map((l) => (
									<tr key={l.id}>
										<td>
											<div className="fw-semibold">{l.name}</div>
											<small className="text-muted">{l.email}</small>
										</td>
										<td>{l.module}</td>
										<td>
											<Badge bg={PHASE_BG[l.phase]}>{l.phase}</Badge>
										</td>
										<td>{l.action}</td>
										<td>
											<Badge
												bg={
													l.status === 'Completed' ||
													l.status.includes('Passed')
														? 'success'
														: 'danger'
												}
											>
												{l.status}
											</Badge>
										</td>
										<td className="text-end text-muted text-nowrap">
											{l.time}
										</td>
									</tr>
								))}
							</tbody>
						</Table>
					) : (
						<Table responsive hover size="sm" className="align-middle">
							<thead>
								<tr>
									<th>Penerima & Sertifikat</th>
									<th>Transaction Hash</th>
									<th>Block #</th>
									<th>API Status</th>
									<th>Waktu</th>
									<th className="text-end">Payload</th>
								</tr>
							</thead>
							<tbody>
								{txRows.map((t) => (
									<tr key={t.id}>
										<td>
											<div className="fw-semibold">{t.name}</div>
											<small className="text-muted">{t.cert}</small>
										</td>
										<td
											className="font-monospace text-primary text-truncate"
											style={{ maxWidth: 200 }}
										>
											{t.txHash}
										</td>
										<td className="font-monospace">#{t.block}</td>
										<td>
											<Badge bg={t.api === '200 OK' ? 'success' : 'warning'}>
												{t.api}
											</Badge>
										</td>
										<td className="text-muted text-nowrap">{t.time}</td>
										<td className="text-end">
											<Button
												size="sm"
												variant="light"
												onClick={() => setSelected(t)}
											>
												<FileCode size={14} className="me-1" /> Lihat JSON
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</Table>
					)}
				</Card.Body>
			</Card>

			{/* JSON Modal */}
			<Modal show={!!selected} onHide={() => setSelected(null)} size="lg" centered>
				<Modal.Header closeButton>
					<Modal.Title style={{ fontSize: 'var(--font-md, 16px)' }}>
						Smart Contract Payload
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<small className="text-muted d-block mb-2 text-break">
						Tx: {selected?.txHash}
					</small>
					<pre
						className="bg-dark text-success p-3 rounded mb-0"
						style={{ maxHeight: 320, overflow: 'auto', fontSize: 12 }}
					>
						{selected && JSON.stringify(selected.payload, null, 2)}
					</pre>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="outline-secondary" size="sm" onClick={handleCopy}>
						{copied ? (
							<Check size={14} className="me-1" />
						) : (
							<Copy size={14} className="me-1" />
						)}
						{copied ? 'Tersalin' : 'Salin'}
					</Button>
					<Button variant="secondary" size="sm" onClick={() => setSelected(null)}>
						Tutup
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default AnalyticTab;
