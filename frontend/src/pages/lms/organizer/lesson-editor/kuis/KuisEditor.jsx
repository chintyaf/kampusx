import React from 'react';
import { KuisSettings } from './KuisSettings';
import { KuisQuestionList } from './KuisQuestionList';

export const KuisEditor = ({
	quiz,
	onUpdateQuiz,
	isStacked = false,
	completeQuestions = 0,
	openQ = {},
	onToggleOpenQ,
	onAddQuestion,
	onMoveQuestion,
	onDuplicateQuestion,
	onRemoveQuestion,
	onUpdateQuestion,
	onSetOptionText,
	onAddOption,
	onRemoveOption,
}) => {
	return (
		<>
			<KuisSettings
				quiz={quiz}
				onUpdateQuiz={onUpdateQuiz}
				isStacked={isStacked}
			/>

			<KuisQuestionList
				questions={quiz.questions}
				completeQuestions={completeQuestions}
				openQ={openQ}
				onToggleOpenQ={onToggleOpenQ}
				onAddQuestion={onAddQuestion}
				onMoveQuestion={onMoveQuestion}
				onDuplicateQuestion={onDuplicateQuestion}
				onRemoveQuestion={onRemoveQuestion}
				onUpdateQuestion={onUpdateQuestion}
				onSetOptionText={onSetOptionText}
				onAddOption={onAddOption}
				onRemoveOption={onRemoveOption}
			/>
		</>
	);
};

export default KuisEditor;
