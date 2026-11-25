import React, { useState, useMemo } from 'react';
import { Card, ProgressBar } from 'react-bootstrap';
import { CheckCircle2 } from 'lucide-react';

import '@/pages/lms/lms.css';
import ModuleCard from './ModuleCard';

const LearningModule = ({
	modules = [],
	pathId,
	slug,
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

	const { completedCount, totalCount, progressPercent, doneLessons, totalLessons } =
		useMemo(() => {
			const total = modules.length;
			const completed = modules.filter((m) => m.status === 'completed').length;
			const lessons = modules.flatMap((m) => m.lessons ?? []);

			return {
				completedCount: completed,
				totalCount: total,
				progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
				totalLessons: lessons.length,
				doneLessons: lessons.filter((l) => l.is_completed).length,
			};
		}, [modules]);

	const allDone = totalCount > 0 && completedCount === totalCount;

	return (
		<Card className="border-0 shadow-sm rounded-4 p-4 mb-4 bg-white lms-container-card">
			{/* Roadmap Header */}
			<div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
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
					<span
						className={`badge px-3 py-2 rounded-pill border fw-semibold small shadow-sm d-inline-flex align-items-center gap-1 ${
							allDone ? 'bg-success-subtle text-success' : 'bg-light text-dark'
						}`}
					>
						{allDone && <CheckCircle2 size={14} />}
						{completedCount} dari {totalCount} selesai ({progressPercent}%)
					</span>
				)}
			</div>

			{/* Progress bar keseluruhan */}
			{isAuthenticated && totalCount > 0 && (
				<div className="mb-4">
					<ProgressBar
						now={progressPercent}
						variant={allDone ? 'success' : 'info'}
						style={{ height: 8, borderRadius: 999 }}
						aria-label="Progress learning path"
					/>
					<div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
						{doneLessons}/{totalLessons} lesson selesai
					</div>
				</div>
			)}

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
						slug={slug}
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
