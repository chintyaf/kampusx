import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Plus } from 'lucide-react';

/**
 * PageHeader
 * Props:
 *   title    {string}
 *   subtitle {string}
 *   status   {string} - 'draft' | 'published' | 'cancelled'
 *   onBuat   {Function}
 */
const statusConfig = {
	draft: { label: 'Draft', cls: 'tag tag-neutral', dot: '#94a3b8' },
	published: { label: 'Published', cls: 'tag tag-success', dot: '#22c55e' },
	cancelled: { label: 'Cancelled', cls: 'tag tag-danger', dot: '#ef4444' },
};

export default function PageHeader({
	title = 'Event Dashboard',
	subtitle = 'Pusat kendali untuk monitoring dan manajemen event',
	status,
	onBuat,
}) {
	const cfg = statusConfig[status] || statusConfig.draft;

	return (
		<Row className="align-items-center mb-4 g-3">
			<Col xs={12} sm={8}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
					<h1
						style={{
							fontSize: 22,
							fontWeight: 600,
							color: 'var(--text)',
							margin: 0,
						}}
					>
						{title}
					</h1>
					{status && (
						<span
							className={cfg.cls}
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: 6,
								fontSize: 11,
								padding: '2px 8px',
								borderRadius: 20,
							}}
						>
							<span
								style={{
									width: 6,
									height: 6,
									borderRadius: '50%',
									background: cfg.dot,
								}}
							/>
							{cfg.label}
						</span>
					)}
				</div>
				<p
					style={{
						fontSize: 13,
						color: 'var(--text-muted)',
						marginTop: 4,
						marginBottom: 0,
					}}
				>
					{subtitle}
				</p>
			</Col>
		</Row>
	);
}
