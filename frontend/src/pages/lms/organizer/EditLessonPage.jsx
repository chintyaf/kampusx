import React from 'react';
import { useParams } from 'react-router-dom';
import LessonEditor from './lesson-editor/LessonEditor';

/**
 * EditLessonPage
 * Wrapper remount editor setiap pindah lesson agar state bersih
 */
export const EditLessonPage = () => {
	const { learningId, moduleId, lessonId } = useParams();

	return (
		<LessonEditor
			key={`${moduleId}-${lessonId}`}
			learningId={learningId}
			moduleId={moduleId}
			lessonId={lessonId}
		/>
	);
};

export default EditLessonPage;
