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
}) {
	return (
		<Row className="align-items-center mb-4">
			<Col>
				<h1
					style={{
						fontSize: 22,
						fontWeight: 600,
						color: 'var(--text)',
						marginBottom: 2,
					}}>
					{title}
				</h1>
				<p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{subtitle}</p>
			</Col>
		</Row>
	);
}
