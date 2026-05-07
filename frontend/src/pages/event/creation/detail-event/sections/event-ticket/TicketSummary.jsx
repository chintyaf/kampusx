import React, { useMemo } from 'react';
import { Tag, Users, DollarSign } from 'lucide-react';
import { ProgressBar } from 'react-bootstrap';

// Helper for currency formatting
const formatRp = (val) => {
	if (!val) return '';
	const n = parseInt(String(val).replace(/\D/g, ''), 10);
	return isNaN(n) ? '' : n.toLocaleString('id-ID');
};

// Helper to get raw number from string
function parsePriceNum(val) {
	if (!val) return 0;
	return parseInt(String(val).replace(/\D/g, ''), 10) || 0;
}

const TicketSummary = ({ tickets = [] }) => {
	// Memoize calculations so they only rerun when 'tickets' changes
	const stats = useMemo(() => {
		const totalCap = tickets.reduce(
			(s, t) => s + (t.unlimited ? 0 : parseInt(t.capacity) || 0),
			0,
		);
		const hasUnlimited = tickets.some((t) => t.unlimited);
		// const revenue = tickets.reduce(
		// 	(s, t) => s + (t.isFree ? 0 : parsePriceNum(t.price) * (t.sold || 0)),
		// 	0,
		// );
		return { totalCap, hasUnlimited };
	}, [tickets]);

	const summaryItems = [
		{ icon: Tag, label: 'Tipe Tiket', value: `${tickets.length}` },
		{
			icon: Users,
			label: 'Total Kapasitas',
			value: stats.hasUnlimited
				? 'Tidak terbatas'
				: stats.totalCap > 0
					? stats.totalCap.toLocaleString('id-ID')
					: '—',
		},
		// {
		// 	icon: DollarSign,
		// 	label: 'Est. Pendapatan',
		// 	value: stats.revenue > 0 ? `Rp ${stats.revenue.toLocaleString('id-ID')}` : '—',
		// },
	];

	return (
		<div className="border bg-white rounded-3" style={{ width: '300px' }}>
			<div className="p-4">
				<p
					className="text-uppercase text-muted fw-bold mb-3"
					style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
					Ringkasan
				</p>

				<div className="d-flex flex-column gap-3 mb-4">
					{summaryItems.map((item, idx) => (
						<div key={idx} className="d-flex align-items-center gap-3">
							<div
								className="bg-white border rounded d-flex align-items-center justify-content-center flex-shrink-0"
								style={{ width: '36px', height: '36px' }}>
								<item.icon size={16} className="text-muted" />
							</div>
							<div>
								<p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
									{item.label}
								</p>
								<p
									className="fw-bold mb-0 text-dark"
									style={{ fontSize: '0.95rem' }}>
									{item.value}
								</p>
							</div>
						</div>
					))}
				</div>

				<hr className="text-muted opacity-25 mb-4" />

				<p
					className="text-uppercase text-muted fw-bold mb-3"
					style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
					Per Tipe
				</p>

				<div className="d-flex flex-column gap-3">
					{tickets.map((t, i) => {
						const cap = parseInt(t.capacity) || 0;
						const pct =
							t.unlimited || cap === 0 ? 0 : Math.round(((t.sold || 0) / cap) * 100);

						return (
							<div key={t.id || i}>
								<div className="d-flex justify-content-between align-items-center mb-1">
									<span
										className="fw-semibold text-dark"
										style={{ fontSize: '0.85rem' }}>
										{t.name || `Tiket ${i + 1}`}
									</span>
									<span className="text-muted" style={{ fontSize: '0.8rem' }}>
										{t.isFree
											? 'Gratis'
											: t.price
												? `Rp ${formatRp(t.price)}`
												: '—'}
									</span>
								</div>
								{/* {!t.unlimited && (
									<ProgressBar
										now={pct}
										style={{ height: '4px' }}
										variant={i === 0 ? 'primary' : 'info'}
									/>
								)} */}
								{/* <p className="text-muted mt-1 mb-0" style={{ fontSize: '0.75rem' }}>
									{t.unlimited
										? `${t.sold || 0} terjual · ∞`
										: `${t.sold || 0} / ${cap > 0 ? cap.toLocaleString('id-ID') : '—'} terjual`}
								</p> */}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default TicketSummary;
