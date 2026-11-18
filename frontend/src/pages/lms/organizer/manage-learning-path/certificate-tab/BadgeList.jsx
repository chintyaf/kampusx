import React from 'react';
import { Badge } from 'react-bootstrap';
import { cardStyle, T, NETWORKS } from './config';

const BadgeList = ({ badges }) => (
	<div className="d-grid gap-3 align-content-start">
		<h3 className="h6 fw-bold m-0">Badge Aktif ({badges.length})</h3>

		{badges.length === 0 && (
			<p style={{ color: T.muted, fontSize: T.fsm }}>Belum ada badge.</p>
		)}

		{badges.map((b) => (
			<div key={b.id} className="d-flex gap-3 p-3" style={cardStyle}>
				<div className="fs-3" aria-hidden>{b.icon}</div>
				<div>
					<div className="small fw-bold">{b.title}</div>
					<small style={{ color: T.muted }}>{b.category}</small>
					<div className="d-flex align-items-center gap-2 my-2 small">
						<Badge bg="" style={{ background: T.tint, color: T.primary }}>
							Min {b.minScore}%
						</Badge>
						<span style={{ color: T.muted }}>{b.issued} Penerima</span>
					</div>
					<small style={{ color: T.purple }}>{NETWORKS[b.network].label}</small>
				</div>
			</div>
		))}
	</div>
);

export default BadgeList;
