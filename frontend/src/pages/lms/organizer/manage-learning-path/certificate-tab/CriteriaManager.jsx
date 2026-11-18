import React from 'react';
import { Card, Form } from 'react-bootstrap';
import { cardStyle, T } from './config';

const OPTIONS = [
	{ key: 'forethought', title: 'Wajib Selesaikan SRL Forethought', desc: 'Peserta harus mengisi target belajar sebelum membuka materi.' },
	{ key: 'reflection', title: 'Wajib Selesaikan Refleksi Metakognitif', desc: 'Mengevaluasi hasil kuis dan kesiapan belajar mandiri.' },
	{ key: 'autoMint', title: 'Auto-Mint ke Smart Contract Saat Lulus', desc: 'Hash kredensial otomatis dicetak ke Polygon Blockchain.' },
];

// criteria: { minScore, forethought, reflection, autoMint }
const CriteriaManager = ({ criteria, onChange }) => (
	<Card style={cardStyle}>
		<Card.Body className="d-grid gap-3">
			<div>
				<h3 className="h6 fw-bold m-0">Passing Score & SRL Criteria Manager</h3>
				<small style={{ color: T.muted }}>
					Syarat yang harus dipenuhi peserta agar badge dapat diklaim.
				</small>
			</div>

			<Form.Group>
				<div className="d-flex justify-content-between small fw-semibold">
					<Form.Label htmlFor="score" className="m-0">Passing Score Kuis</Form.Label>
					<span style={{ color: T.primary }}>{criteria.minScore} / 100</span>
				</div>
				<Form.Range
					id="score"
					min={60}
					max={95}
					step={5}
					value={criteria.minScore}
					onChange={(e) => onChange({ minScore: Number(e.target.value) })}
					style={{ accentColor: T.primary }}
				/>
			</Form.Group>

			{OPTIONS.map(({ key, title, desc }) => (
				<Form.Check
					key={key}
					id={key}
					type="switch"
					checked={criteria[key]}
					onChange={(e) => onChange({ [key]: e.target.checked })}
					label={
						<>
							<div className="small fw-bold">{title}</div>
							<small style={{ color: T.muted }}>{desc}</small>
						</>
					}
				/>
			))}
		</Card.Body>
	</Card>
);

export default CriteriaManager;
