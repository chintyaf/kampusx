import React from 'react';
import { LessonAttributes } from './LessonAttributes';
import { LessonSkills } from './LessonSkills';
import { LessonPublication } from './LessonPublication';

export const LessonSettings = ({
	lesson,
	onUpdate,
	words = 0,
	isStacked = false,
	allDone = false,
	doneCount = 0,
	totalChecklist = 0,
	onAddTag,
	onRemoveTag,
}) => {
	return (
		<>
			<LessonAttributes
				format={lesson.format}
				duration={lesson.duration}
				xp={lesson.xp}
				prerequisite={lesson.prerequisite}
				words={words}
				isStacked={isStacked}
				onUpdate={onUpdate}
			/>

			<LessonSkills
				tags={lesson.tags}
				onAddTag={onAddTag}
				onRemoveTag={onRemoveTag}
			/>

			<LessonPublication
				status={lesson.status}
				allDone={allDone}
				doneCount={doneCount}
				totalChecklist={totalChecklist}
				onUpdate={onUpdate}
			/>
		</>
	);
};

export default LessonSettings;
