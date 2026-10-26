import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import {
	PlayCircle,
	FileText,
	HelpCircle,
	Code,
	Brain,
	BookOpen,
	CheckCircle2,
	RotateCcw,
	Clock,
	Play,
} from 'lucide-react';

import LessonHeader from './LessonHeader';
import LessonItem from './LessonItem';

// ============================================================================
// MAIN KOMPONEN: ModuleLesson
// ============================================================================
const ModuleLesson = ({
	moduleData,
	filteredLessons,
	lessonFilter,
	setLessonFilter,
	handleNavigateToLesson,
}) => {
	if (!moduleData || !moduleData.lessons) return null;

	const displayLessons =
		filteredLessons ||
		moduleData.lessons.filter((item) => {
			if (lessonFilter === 'uncompleted') {
				return item.status !== 'completed';
			}
			return true;
		});

	const uncompletedCount = moduleData.lessons.filter((l) => l.status !== 'completed').length;

	return (
		<Card
			className="border shadow-sm p-3 p-md-4 mb-4"
			style={{
				fontFamily: 'var(--font)',
				backgroundColor: 'var(--card)',
				borderColor: 'var(--neutral-border)',
				borderRadius: 'var(--radius-lg)',
			}}
		>
			{/* 1. Sub-komponen Header & Filter */}
			<LessonHeader
				totalLessons={moduleData.lessons.length}
				uncompletedCount={uncompletedCount}
				lessonFilter={lessonFilter}
				setLessonFilter={setLessonFilter}
			/>

			{/* 2. Sub-komponen List Unit */}
			<div className="d-flex flex-column gap-2">
				{displayLessons.map((item) => (
					<LessonItem
						key={item.id}
						item={item}
						handleNavigateToLesson={handleNavigateToLesson}
					/>
				))}
			</div>
		</Card>
	);
};

export default ModuleLesson;
