import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, Tag, Users, Calendar, DollarSign } from 'lucide-react';
import {
	Container,
	Row,
	Col,
	Card,
	Form,
	Button,
	Badge,
	InputGroup,
	ProgressBar,
	Collapse,
} from 'react-bootstrap';
import EventLayout from '@/layouts/EventLayout';

function formatRp(val) {
	if (!val) return '';
	const n = parseInt(String(val).replace(/\D/g, ''), 10);
	if (isNaN(n)) return '';
	return n.toLocaleString('id-ID');
}

function parsePriceNum(val) {
	if (!val) return 0;
	return parseInt(String(val).replace(/\D/g, ''), 10) || 0;
}

const TicketSummary = ({ tickets, hasUnlimited, totalCap, totalSold, revenue }) => {
	return (
		<>
			<div
				className="border bg-white rounded-3 "
				style={{
					width: '300px',
				}}>
				<div className="p-4">
					<p
						className="text-uppercase text-muted fw-bold mb-3"
						style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
						Ringkasan
					</p>

					<div className="d-flex flex-column gap-3 mb-4">
						{[
							{ icon: Tag, label: 'Tipe Tiket', value: `${tickets.length}` },
							{
								icon: Users,
								label: 'Total Kapasitas',
								value: hasUnlimited
									? 'Tidak terbatas'
									: totalCap > 0
										? totalCap.toLocaleString('id-ID')
										: '—',
							},
							{
								icon: Users,
								label: 'Terjual',
								value: totalSold > 0 ? `${totalSold} tiket` : '—',
							},
							{
								icon: DollarSign,
								label: 'Est. Pendapatan',
								value: revenue > 0 ? `Rp ${revenue.toLocaleString('id-ID')}` : '—',
							},
						].map((item) => (
							<div key={item.label} className="d-flex align-items-center gap-3">
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

					{/* Per-ticket rows */}
					<p
						className="text-uppercase text-muted fw-bold mb-3"
						style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
						Per Tipe
					</p>

					<div className="d-flex flex-column gap-3">
						{tickets.map((t, i) => {
							const cap = parseInt(t.capacity) || 0;
							const pct =
								t.unlimited || cap === 0 ? 0 : Math.round((t.sold / cap) * 100);
							return (
								<div key={t.id}>
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
									{!t.unlimited && (
										<ProgressBar
											now={pct}
											style={{ height: '4px' }}
											variant={i === 0 ? 'primary' : 'info'}
										/>
									)}
									<p
										className="text-muted mt-1 mb-0"
										style={{ fontSize: '0.75rem' }}>
										{t.unlimited
											? `${t.sold} terjual · ∞`
											: `${t.sold} / ${cap > 0 ? cap.toLocaleString('id-ID') : '—'} terjual`}
									</p>
								</div>
							);
						})}
					</div>

					<hr className="text-muted opacity-25 my-4" />

					<div
						className="d-flex align-items-start gap-2 text-muted"
						style={{ fontSize: '0.8rem' }}>
						<Calendar size={14} className="mt-1 flex-shrink-0" />
						<p className="mb-0 lh-sm">
							Penjualan tiket harus dimulai sebelum tanggal acara dan berakhir paling
							lambat saat acara dimulai.
						</p>
					</div>
				</div>
			</div>
		</>
	);
};

export default TicketSummary;
