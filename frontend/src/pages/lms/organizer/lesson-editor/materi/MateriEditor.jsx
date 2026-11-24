import React from 'react';
import { MateriInformation } from './MateriInformation';
import { MateriContent } from './MateriContent';
import { MateriAttachments } from './MateriAttachments';

export const MateriEditor = ({
	kind = 'lesson',
	lesson,
	onUpdate,
	titleRef,
	bodyRef,
	editorMode,
	setEditorMode,
	isStacked,
	onBodyKeyDown,
	onFormat,
	words,
	moduleName,
	onFilesAdded,
	onRemoveAttachment,
}) => {
	return (
		<>
			<MateriInformation
				kind={kind}
				title={lesson.title}
				summary={lesson.summary}
				titleRef={titleRef}
				onUpdate={onUpdate}
			/>

			<MateriContent
				body={lesson.body}
				editorMode={editorMode}
				setEditorMode={setEditorMode}
				isStacked={isStacked}
				bodyRef={bodyRef}
				onUpdateBody={(body) => onUpdate({ body })}
				onBodyKeyDown={onBodyKeyDown}
				onFormat={onFormat}
				words={words}
				moduleName={moduleName}
				duration={lesson.duration}
				title={lesson.title}
				summary={lesson.summary}
			/>

			<MateriAttachments
				attachments={lesson.attachments}
				onFilesAdded={onFilesAdded}
				onRemoveAttachment={onRemoveAttachment}
			/>
		</>
	);
};

export default MateriEditor;
