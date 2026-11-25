import React, { useState } from 'react';
import { Card } from 'react-bootstrap';

import '@/pages/lms/lms.css';
import ModuleCard from './ModuleCard';

const LearningModule = ({
	modules = [],
	pathId,
	isAuthenticated = false,
	expandedModules: externalExpanded,
	onToggleModule,
}) => {
	const [internalExpanded, setInternalExpanded] = useState({});

	// Dikontrol halaman jika props diberikan, kalau tidak pakai state internal
	const expandedState = externalExpanded ?? internalExpanded;

	const handleToggle = (moduleId) => {
		if (onToggleModule) {
			onToggleModule(moduleId);
		} else {
			setInternalExpanded((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
		}
	};

	const completedCount = modules.filter((m) => m.status === 'completed').length;
	const totalCount = modules.length;
	const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

	return (
		<Card className="border-0 shadow-sm rounded-4 p-4 mb-4 bg-white lms-container-card">
			{/* Roadmap Header */}
			<div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
				<div>
					<h3 className="fw-bold mb-1" style={{ fontSize: '1.35rem', color: '#0B2545' }}>
						Roadmap Modul
					</h3>
					<p className="text-muted small mb-0">
						{totalCount} modul berurutan yang dirancang untuk membangun pemahaman secara
						bertahap.
					</p>
				</div>

				{isAuthenticated && totalCount > 0 && (
					<span className="badge px-3 py-2 rounded-pill bg-light text-dark border fw-semibold small shadow-sm">
						{completedCount} dari {totalCount} selesai ({progressPercent}%)
					</span>
				)}
			</div>

			{/* List Roadmap Modul */}
			<div className="d-flex flex-column gap-3">
				{totalCount === 0 && (
					<div className="text-center text-muted small py-4">
						Belum ada modul yang dipublikasikan.
					</div>
				)}

				{modules.map((mod) => (
					<ModuleCard
						key={mod.id}
						module={mod}
						pathId={pathId}
						isAuthenticated={isAuthenticated}
						isExpanded={!!expandedState[mod.id]}
						onToggle={() => handleToggle(mod.id)}
					/>
				))}
			</div>
		</Card>
	);
};

export default LearningModule;
