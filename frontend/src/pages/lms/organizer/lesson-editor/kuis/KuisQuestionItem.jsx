import React from 'react';
import {
	ChevronDown,
	ChevronRight,
	CheckCircle,
	AlertCircle,
	ArrowUp,
	ArrowDown,
	Copy,
	Trash2,
} from 'lucide-react';
import { Btn, Chip, Label, TextArea } from '../shared/SectionCard';
import { KuisAnswerOptions } from './KuisAnswerOptions';
import { T, ghostIconBtn, ghostHover } from '../utils/lessonConstants';
import { questionComplete } from '../utils/lessonHelpers';

export const KuisQuestionItem = ({
	question,
	index,
	totalQuestions,
	isOpen,
	onToggleOpen,
	onMoveQuestion,
	onDuplicateQuestion,
	onRemoveQuestion,
	onUpdateQuestion,
	onSetOptionText,
	onAddOption,
	onRemoveOption,
}) => {
	const complete = questionComplete(question);

	return (
		<div
			style={{
				border: `1px solid ${complete ? T.border : '#fcd34d'}`,
				borderRadius: T.rLg,
				background: T.card,
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 8,
					padding: '10px 12px',
					background: T.field,
					flexWrap: 'wrap',
				}}
			>
				<Btn
					aria-expanded={isOpen}
					aria-label={
						isOpen ? `Ciutkan soal ${index + 1}` : `Buka soal ${index + 1}`
					}
					onClick={onToggleOpen}
					style={{
						background: 'none',
						border: 'none',
						padding: 0,
						flex: 1,
						minWidth: 0,
						textAlign: 'left',
						color: T.text,
					}}
				>
					{isOpen ? (
						<ChevronDown size={16} />
					) : (
						<ChevronRight size={16} />
					)}
					<Chip bg={T.warnBg} color={T.warnText}>
						Soal #{index + 1}
					</Chip>
					<span
						style={{
							fontSize: T.fsm,
							fontWeight: 600,
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
							minWidth: 0,
						}}
					>
						{question.text.trim() || 'Soal belum ditulis'}
					</span>
				</Btn>
				{complete ? (
					<Chip bg={T.successBg} color={T.successText}>
						<CheckCircle size={11} /> Lengkap
					</Chip>
				) : (
					<Chip bg={T.warnBg} color={T.warnText}>
						<AlertCircle size={11} /> Belum lengkap
					</Chip>
				)}
				<div style={{ display: 'inline-flex' }}>
					<Btn
						aria-label="Naikkan soal"
						disabled={index === 0}
						onClick={() => onMoveQuestion(question.id, -1)}
						style={ghostIconBtn}
						hoverStyle={ghostHover}
					>
						<ArrowUp size={15} />
					</Btn>
					<Btn
						aria-label="Turunkan soal"
						disabled={index === totalQuestions - 1}
						onClick={() => onMoveQuestion(question.id, 1)}
						style={ghostIconBtn}
						hoverStyle={ghostHover}
					>
						<ArrowDown size={15} />
					</Btn>
					<Btn
						aria-label="Duplikat soal"
						onClick={() => onDuplicateQuestion(question)}
						style={ghostIconBtn}
						hoverStyle={ghostHover}
					>
						<Copy size={15} />
					</Btn>
					<Btn
						aria-label="Hapus soal"
						onClick={() => onRemoveQuestion(question.id)}
						style={{ ...ghostIconBtn, color: T.danger }}
						hoverStyle={{ backgroundColor: T.dangerBg }}
					>
						<Trash2 size={15} />
					</Btn>
				</div>
			</div>

			{isOpen && (
				<div style={{ padding: 16 }}>
					<div style={{ marginBottom: 16 }}>
						<Label htmlFor={`q-text-${question.id}`}>Pertanyaan</Label>
						<TextArea
							id={`q-text-${question.id}`}
							rows={2}
							value={question.text}
							onChange={(e) =>
								onUpdateQuestion(question.id, { text: e.target.value })
							}
							placeholder="Tuliskan pertanyaan kuis…"
						/>
					</div>

					<KuisAnswerOptions
						question={question}
						questionIndex={index}
						onUpdateQuestion={onUpdateQuestion}
						onSetOptionText={onSetOptionText}
						onAddOption={onAddOption}
						onRemoveOption={onRemoveOption}
					/>
				</div>
			)}
		</div>
	);
};

export default KuisQuestionItem;
