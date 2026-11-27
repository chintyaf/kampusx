import React, { useState } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { BookOpen } from 'lucide-react';
import LmsGridCard from '@/components/lms/LmsGridCard';

const FILTER_TABS = [
	{ key: 'All', label: 'All' },
	{ key: 'in_progress', label: 'In Progress' },
	{ key: 'completed', label: 'Completed' },
];

/** Filter Navigation Pills */
const FilterTabs = ({ activeFilter, setActiveFilter, counts }) => (
	<div
		className="d-flex align-items-center gap-1 p-1"
		style={{
			backgroundColor: 'var(--neutral-bg)',
			border: '1px solid var(--neutral-border)',
			borderRadius: 'var(--radius-full)',
		}}
	>
		{FILTER_TABS.map((tab) => {
			const isActive = activeFilter === tab.key;
			return (
				<button
					key={tab.key}
					type="button"
					className="btn btn-sm border-0 d-flex align-items-center gap-2 px-3 py-1"
					style={{
						backgroundColor: isActive ? 'var(--primary)' : 'transparent',
						color: isActive ? 'var(--color-white)' : 'var(--text-muted)',
						fontWeight: isActive ? '600' : '500',
						fontSize: 'var(--font-xs)',
						borderRadius: 'var(--radius-full)',
						transition: 'all 0.2s ease-in-out',
					}}
					onClick={() => setActiveFilter(tab.key)}
				>
					<span>{tab.label}</span>
					<span
						className="badge"
						style={{
							backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--neutral-border)',
							color: isActive ? 'var(--color-white)' : 'var(--text)',
							fontSize: '11px',
							borderRadius: 'var(--radius-full)',
							padding: '0.25em 0.55em',
						}}
					>
						{counts[tab.key]}
					</span>
				</button>
			);
		})}
	</div>
);

const EmptyState = ({ hasModules, activeFilter }) => (
	<div
		className="text-center py-5"
		style={{
			backgroundColor: 'var(--neutral-bg)',
			border: '1px dashed var(--neutral-border)',
			borderRadius: 'var(--radius)',
		}}
	>
		<div className="mb-2" style={{ color: 'var(--text-muted)' }}>
			<BookOpen size={36} className="opacity-50" />
		</div>
		<h6 className="fw-semibold mb-1" style={{ color: 'var(--text)' }}>
			{hasModules ? 'Tidak ada modul' : 'Belum ada modul yang diikuti'}
		</h6>
		<p className="mb-0" style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
			{hasModules
				? `Tidak ada modul dengan status "${activeFilter === 'in_progress' ? 'In Progress' : activeFilter}".`
				: 'Ikuti sebuah learning path untuk mulai belajar.'}
		</p>
	</div>
);

const EnrolledModules = ({ modules = [], onContinue }) => {
	const [activeFilter, setActiveFilter] = useState('All');

	const counts = {
		All: modules.length,
		in_progress: modules.filter((m) => m.status === 'in_progress').length,
		completed: modules.filter((m) => m.status === 'completed').length,
	};

	const filtered = modules.filter((m) => activeFilter === 'All' || m.status === activeFilter);

	return (
		<Card
			className="border-0 shadow-sm p-3 p-md-4 mb-4"
			style={{
				borderRadius: 'var(--radius-lg)',
				backgroundColor: 'var(--card)',
				border: '1px solid var(--neutral-border)',
				fontFamily: 'var(--font)',
			}}
		>
			<div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
				<div>
					<h5
						className="fw-bold mb-0"
						style={{ fontSize: 'var(--font-lg)', color: 'var(--text)', letterSpacing: '-0.01em' }}
					>
						My Enrolled Modules
					</h5>
					<p className="mb-0" style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
						Track your active study courses & certifications
					</p>
				</div>
				<FilterTabs
					activeFilter={activeFilter}
					setActiveFilter={setActiveFilter}
					counts={counts}
				/>
			</div>

			{filtered.length === 0 ? (
				<EmptyState hasModules={modules.length > 0} activeFilter={activeFilter} />
			) : (
				<Row className="g-3">
					{filtered.map((m) => (
						<Col key={m.id} xs={12} md={6} xl={4}>
							<LmsGridCard item={m} onNavigate={onContinue} />
						</Col>
					))}
				</Row>
			)}
		</Card>
	);
};

export default EnrolledModules;