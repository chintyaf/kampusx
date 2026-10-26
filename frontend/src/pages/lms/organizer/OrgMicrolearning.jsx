import React, { useState } from 'react';
import { Plus, Calendar, BookOpen, Users } from 'lucide-react';
import LearningPathCard from './manage-micro/LearningPathCard';
import { Link } from 'react-router-dom';

const OrgMicrolearning = () => {
	const [filterStatus, setFilterStatus] = useState('All');
	const [viewType, setViewType] = useState('Grid');

	const learningPaths = [
		{
			id: 1,
			title: 'Intro to Machine Learning',
			event: 'AI Summit 2026',
			status: 'Published',
			completion: 73,
			modules: 8,
			enrolled: '847 enrolled',
		},
		{
			id: 2,
			title: 'Data Science Fundamentals',
			event: 'DataCon 2026',
			status: 'Published',
			completion: 61,
			modules: 6,
			enrolled: '634 enrolled',
		},
		{
			id: 3,
			title: 'Python for Beginners',
			event: 'DevCamp 2026',
			status: 'Draft',
			completion: 45,
			modules: 10,
			enrolled: '1,203 enrolled',
		},
		{
			id: 4,
			title: 'Web Development Bootcamp',
			event: 'TechFest 2026',
			status: 'Published',
			completion: 88,
			modules: 12,
			enrolled: '521 enrolled',
		},
	];

	return (
		<div
			style={{
				fontFamily: 'var(--font)',
				backgroundColor: 'var(--color-bg)',
				color: 'var(--color-text)',
				minHeight: '100vh',
				padding: '36px 48px',
			}}
		>
			<div className="">
				{/* Header Section */}
				<div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
					<div>
						<h2
							style={{
								fontSize: 'var(--font-xl)',
								fontWeight: '700',
								color: 'var(--text)',
								margin: 0,
							}}
						>
							Manage Learning Paths
						</h2>
						<p
							style={{
								fontSize: 'var(--font-sm)',
								color: 'var(--text-muted)',
								margin: '4px 0 0 0',
							}}
						>
							Create and manage structured learning experiences
						</p>
					</div>

					<Link
						to="/organizer/learning-path/add"
						style={{
							backgroundColor: 'var(--primary)',
							color: 'var(--color-white)',
							border: 'none',
							borderRadius: 'var(--radius-md)',
							padding: '10px 20px',
							fontSize: 'var(--font-sm)',
							fontWeight: '600',
							display: 'inline-flex',
							alignItems: 'center',
							gap: '8px',
							cursor: 'pointer',
							boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
							textDecoration: 'none',
						}}
					>
						<Plus size={18} />
						Create New Path
					</Link>
				</div>

				{/* Search & Filter Bar */}
				<div className="row g-3 mb-4 align-items-center">
					<div className="col-12 col-md-6 col-lg-7">
						<input
							type="text"
							placeholder="Search by event or topic..."
							style={{
								width: '100%',
								padding: '10px 16px',
								fontSize: 'var(--font-sm)',
								borderRadius: 'var(--radius)',
								border: '1px solid var(--neutral-border)',
								backgroundColor: 'var(--card)',
								color: 'var(--text)',
								outline: 'none',
							}}
						/>
					</div>

					{/* Status Filter */}
					<div className="col-12 col-md-3 col-lg-3 d-flex justify-content-md-end">
						<div
							style={{
								backgroundColor: 'var(--card)',
								padding: '4px',
								borderRadius: 'var(--radius)',
								border: '1px solid var(--neutral-border)',
								display: 'inline-flex',
								gap: '4px',
								width: '100%',
								justifyContent: 'space-between',
							}}
						>
							{['All', 'Published', 'Draft'].map((status) => {
								const isActive = filterStatus === status;
								return (
									<button
										key={status}
										onClick={() => setFilterStatus(status)}
										style={{
											flex: 1,
											border: 'none',
											borderRadius: 'var(--radius-sm)',
											padding: '6px 12px',
											fontSize: 'var(--font-xs)',
											fontWeight: isActive ? '600' : '500',
											backgroundColor: isActive
												? 'var(--primary-light)'
												: 'transparent',
											color: isActive
												? 'var(--primary)'
												: 'var(--text-muted)',
											cursor: 'pointer',
											transition: 'all 0.2s',
										}}
									>
										{status}
									</button>
								);
							})}
						</div>
					</div>

					{/* View Toggle */}
					<div className="col-12 col-md-3 col-lg-2 d-flex justify-content-md-end">
						<div
							style={{
								backgroundColor: 'var(--card)',
								padding: '4px',
								borderRadius: 'var(--radius)',
								border: '1px solid var(--neutral-border)',
								display: 'inline-flex',
								gap: '4px',
								width: '100%',
							}}
						>
							{['Grid', 'Module View'].map((type) => {
								const isActive = viewType === type;
								return (
									<button
										key={type}
										onClick={() => setViewType(type)}
										style={{
											flex: 1,
											border: 'none',
											borderRadius: 'var(--radius-sm)',
											padding: '6px 12px',
											fontSize: 'var(--font-xs)',
											fontWeight: isActive ? '600' : '500',
											backgroundColor: isActive
												? 'var(--primary-light)'
												: 'transparent',
											color: isActive
												? 'var(--primary)'
												: 'var(--text-muted)',
											cursor: 'pointer',
											transition: 'all 0.2s',
											whiteSpace: 'nowrap',
										}}
									>
										{type}
									</button>
								);
							})}
						</div>
					</div>
				</div>

				{/* Cards Grid */}
				<div className="row g-4">
					{learningPaths.map((item) => (
						<LearningPathCard key={item.id} data={item} />
					))}
				</div>
			</div>
		</div>
	);
};

export default OrgMicrolearning;
