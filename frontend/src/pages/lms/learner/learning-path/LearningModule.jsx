import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
	CheckCircle2,
	Clock,
	BookOpen,
	RotateCcw,
	ChevronDown,
	Video,
	FileText,
	HelpCircle,
	Brain,
	ArrowRight,
} from 'lucide-react';

import '@/pages/lms/lms.css';
import ModuleCard from './ModuleCard';

// ============================================================================
// 2. MAIN COMPONENT
// ============================================================================

const LearningModule = ({ modules = [], expandedModules: externalExpanded, onToggleModule }) => {
	const [internalExpanded, setInternalExpanded] = useState({ 1: true });

	const expandedState = externalExpanded || internalExpanded;
	const handleToggle = (moduleNumber) => {
		if (onToggleModule) {
			onToggleModule(moduleNumber);
		} else {
			setInternalExpanded((prev) => ({
				...prev,
				[moduleNumber]: !prev[moduleNumber],
			}));
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
						Module Roadmap
					</h3>
					<p className="text-muted small mb-0">
						{totalCount} Modul berurutan yang dirancang untuk membangun pemahaman AI
						Engineering bertahap.
					</p>
				</div>
				<span className="badge px-3 py-2 rounded-pill bg-light text-dark border fw-semibold small shadow-sm">
					{completedCount} of {totalCount} Completed ({progressPercent}%)
				</span>
			</div>

			{/* List Roadmap Modul */}
			<div className="d-flex flex-column gap-3">
				{modules.map((mod) => (
					<ModuleCard
						key={mod.id || mod.number}
						module={mod}
						isExpanded={!!expandedState[mod.number]}
						onToggle={() => handleToggle(mod.number)}
					/>
				))}
			</div>
		</Card>
	);
};

export default LearningModule;
