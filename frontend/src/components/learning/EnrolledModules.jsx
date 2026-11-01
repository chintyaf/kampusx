import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { BookOpen, CheckCircle, Clock, Play, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockEnrolledModules } from '../../data/learningMockData';

/* ==========================================================================
   SUB-COMPONENTS
   ========================================================================== */

/** 1. Status Badge (Completed / In Progress) */
const StatusBadge = ({ isCompleted }) => {
	if (isCompleted) {
		return (
			<span
				className="badge fw-semibold d-inline-flex align-items-center gap-1"
				style={{
					fontSize: '11px',
					backgroundColor: 'var(--success-bg)',
					color: 'var(--success-text)',
					border: '1px solid var(--success-border-color)',
					borderRadius: 'var(--radius-full)',
				}}
			>
				<CheckCircle size={11} />
				Completed
			</span>
		);
	}

	return (
		<span
			className="badge fw-semibold d-inline-flex align-items-center gap-1"
			style={{
				fontSize: '11px',
				backgroundColor: 'var(--primary-light)',
				color: 'var(--primary)',
				border: '1px solid var(--primary-border)',
				borderRadius: 'var(--radius-full)',
			}}
		>
			In Progress
		</span>
	);
};

/** 2. Progress Bar Track */
const ProgressBar = ({ progress, isCompleted }) => (
	<div className="w-100 text-md-end">
		<div
			className="d-flex align-items-center justify-content-between mb-1"
			style={{ fontSize: 'var(--font-xs)' }}
		>
			<span style={{ color: 'var(--text-muted)' }}>Progress</span>
			<span className="fw-bold" style={{ color: 'var(--text)' }}>
				{progress}%
			</span>
		</div>
		<div
			className="w-100 overflow-hidden"
			style={{
				height: '6px',
				backgroundColor: 'var(--neutral-bg)',
				borderRadius: 'var(--radius-full)',
			}}
		>
			<div
				className="h-100"
				style={{
					width: `${progress}%`,
					backgroundColor: isCompleted ? 'var(--success-text)' : 'var(--primary)',
					borderRadius: 'var(--radius-full)',
					transition: 'width 0.4s ease-in-out',
				}}
			/>
		</div>
	</div>
);

/** 3. Filter Navigation Pills */
const FilterTabs = ({ filterTabs, activeFilter, setActiveFilter, counts }) => (
	<div
		className="d-flex align-items-center gap-1 p-1"
		style={{
			backgroundColor: 'var(--neutral-bg)',
			border: '1px solid var(--neutral-border)',
			borderRadius: 'var(--radius-full)',
		}}
	>
		{filterTabs.map((tab) => {
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
							backgroundColor: isActive
								? 'rgba(255, 255, 255, 0.25)'
								: 'var(--neutral-border)',
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

/** 4. Section Header */
const ModuleHeader = ({ filterTabs, activeFilter, setActiveFilter, counts }) => (
	<div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
		<div>
			<h5
				className="fw-bold mb-0"
				style={{
					fontSize: 'var(--font-lg)',
					color: 'var(--text)',
					letterSpacing: '-0.01em',
				}}
			>
				My Enrolled Modules
			</h5>
			<p className="mb-0" style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
				Track your active study courses & certifications
			</p>
		</div>

		<FilterTabs
			filterTabs={filterTabs}
			activeFilter={activeFilter}
			setActiveFilter={setActiveFilter}
			counts={counts}
		/>
	</div>
);

/** 5. Empty State Display */
const EmptyState = ({ activeFilter }) => (
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
			No modules found
		</h6>
		<p className="mb-0" style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
			No courses match the "{activeFilter === 'in_progress' ? 'In Progress' : activeFilter}"
			filter status.
		</p>
	</div>
);

/** 6. Individual Module Item Card */
const ModuleCardItem = ({ item, onNavigate }) => {
	const isCompleted = item.status === 'completed';

	return (
		<div
			className="p-3"
			style={{
				backgroundColor: 'var(--card)',
				border: '1px solid var(--neutral-border)',
				borderRadius: 'var(--radius)',
				transition: 'all 0.2s ease-in-out',
			}}
		>
			<div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
				{/* Left: Thumbnail & Content */}
				<div className="d-flex align-items-start align-items-sm-center gap-3 flex-grow-1">
					<img
						src={item.thumbnail}
						alt={item.title}
						className="object-fit-cover flex-shrink-0"
						style={{
							width: '80px',
							height: '64px',
							backgroundColor: 'var(--neutral-bg)',
							borderRadius: 'var(--radius-md)',
						}}
						loading="lazy"
					/>

					<div className="flex-grow-1">
						{/* Title */}
						<h6
							className="fw-bold mb-1"
							style={{
								fontSize: 'var(--font-sm)',
								color: 'var(--text)',
								lineHeight: 1.3,
							}}
						>
							{item.title}
						</h6>

						{/* Tags */}
						<div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
							<span
								className="badge fw-normal"
								style={{
									fontSize: '11px',
									backgroundColor: 'transparent',
									color: 'var(--text-muted)',
									border: '1px solid var(--neutral-border)',
									borderRadius: 'var(--radius-xs)',
								}}
							>
								{item.category}
							</span>

							<StatusBadge isCompleted={isCompleted} />
						</div>

						{/* Meta Info */}
						<div
							className="d-flex align-items-center gap-2"
							style={{
								fontSize: 'var(--font-xs)',
								color: 'var(--text-muted)',
							}}
						>
							<span>
								{item.completedLessons}/{item.totalLessons} lessons
							</span>
							<span>•</span>
							<span className="d-flex align-items-center gap-1">
								<Clock size={12} />
								{item.lastStudied}
							</span>
						</div>
					</div>
				</div>

				{/* Right: Progress & Action Button */}
				<div
					className="d-flex flex-row flex-md-column align-items-end justify-content-between justify-content-md-center gap-2 pt-2 pt-md-0 border-top border-md-0"
					style={{ minWidth: '170px' }}
				>
					<ProgressBar progress={item.progress} isCompleted={isCompleted} />

					<div className="mt-md-1">
						{isCompleted ? (
							<Button
								size="sm"
								className="d-inline-flex align-items-center gap-1 fw-semibold px-3 py-1"
								style={{
									fontSize: 'var(--font-xs)',
									backgroundColor: 'transparent',
									color: 'var(--success-text)',
									border: '1px solid var(--success-border-color)',
									borderRadius: 'var(--radius-full)',
								}}
								onClick={() => onNavigate('/certificates')}
							>
								<Award size={13} />
								<span>View Cert</span>
							</Button>
						) : (
							<Button
								size="sm"
								className="d-inline-flex align-items-center gap-1 fw-semibold px-3 py-1 border-0"
								style={{
									backgroundColor: 'var(--primary)',
									color: 'var(--color-white)',
									fontSize: 'var(--font-xs)',
									borderRadius: 'var(--radius-full)',
								}}
								onClick={() => onNavigate(`/learner/modules/${item.id}`)}
							>
								<Play size={11} fill="currentColor" />
								<span>Continue</span>
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

/* ==========================================================================
   MAIN CONTAINER COMPONENT
   ========================================================================== */

const EnrolledModules = ({ modules = mockEnrolledModules }) => {
	const navigate = useNavigate();
	const [activeFilter, setActiveFilter] = useState('All');

	const counts = {
		All: modules.length,
		in_progress: modules.filter((m) => m.status === 'in_progress').length,
		completed: modules.filter((m) => m.status === 'completed').length,
	};

	const filteredModules = modules.filter((item) => {
		if (activeFilter === 'All') return true;
		return item.status === activeFilter;
	});

	const filterTabs = [
		{ key: 'All', label: 'All' },
		{ key: 'in_progress', label: 'In Progress' },
		{ key: 'completed', label: 'Completed' },
	];

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
			<ModuleHeader
				filterTabs={filterTabs}
				activeFilter={activeFilter}
				setActiveFilter={setActiveFilter}
				counts={counts}
			/>

			{filteredModules.length === 0 ? (
				<EmptyState activeFilter={activeFilter} />
			) : (
				<div className="d-flex flex-column gap-3">
					{filteredModules.map((item) => (
						<ModuleCardItem key={item.id} item={item} onNavigate={navigate} />
					))}
				</div>
			)}
		</Card>
	);
};

export default EnrolledModules;
