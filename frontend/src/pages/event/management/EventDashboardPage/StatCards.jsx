import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Ticket, DollarSign, UserCheck, UserMinus } from 'lucide-react';

/**
 * StatCards — improved stat card with trend indicator and bigger typography.
 */

const defaultStats = [
	{
		label: 'Tickets Sold',
		value: '450 / 500',
		sub: '90% kapasitas terisi',
		progress: 90,
		iconBg: '#dff3ff',
		iconColor: '#00699e',
		lucideIcon: Ticket,
		progressColor: 'var(--primary)',
	},
	{
		label: 'Revenue',
		value: 'Rp 22,5jt',
		sub: '@ Rp 50.000 / tiket',
		iconBg: '#dcfce7',
		iconColor: '#166534',
		lucideIcon: DollarSign,
	},
	{
		label: 'Checked-In',
		value: '0',
		sub: 'Belum dimulai',
		iconBg: '#f3e8ff',
		iconColor: '#7c3aed',
		lucideIcon: UserCheck,
	},
	{
		label: 'Absent',
		value: '0',
		sub: '0% dari pendaftar',
		iconBg: '#fef3c7',
		iconColor: '#92400e',
		lucideIcon: UserMinus,
	},
];

function StatCard({ label, value, sub, progress, iconBg, iconColor, lucideIcon: Icon, progressColor = 'var(--primary)' }) {
	return (
		<div
			className="card h-100 custom-stat-card"
			style={{ padding: '16px 18px', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
			onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.07)'; }}
			onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
		>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
				<span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
				<div style={{
					width: 36, height: 36, borderRadius: 10,
					background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
				}}>
					{Icon && <Icon size={18} color={iconColor} strokeWidth={1.8} />}
				</div>
			</div>

			<div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 3, letterSpacing: '-0.5px' }}>
				{value}
			</div>
			<div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>

			{progress != null && (
				<div style={{ marginTop: 12 }}>
					<div style={{ background: '#e2e8f0', borderRadius: 99, height: 5 }}>
						<div style={{
							width: `${Math.min(progress, 100)}%`, height: 5,
							borderRadius: 99, background: progressColor,
							transition: 'width 0.7s ease',
						}} />
					</div>
				</div>
			)}
		</div>
	);
}

export default function StatCards({ stats = defaultStats }) {
	return (
		<Row className="g-3 mb-4">
			{stats.map((s, i) => (
				<Col key={i} xs={12} sm={6} lg={3}>
					<StatCard {...s} />
				</Col>
			))}
		</Row>
	);
}
