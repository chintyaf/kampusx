import React from 'react';
import { HelpCircle, Plus } from 'lucide-react';
import { SectionCard, Btn } from '../shared/SectionCard';
import { KuisQuestionItem } from './KuisQuestionItem';
import { T, primaryBtn, outlineBtn } from '../utils/lessonConstants';

export const KuisQuestionList = ({
	questions = [],
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
		<SectionCard
			icon={HelpCircle}
			title={`Daftar soal (${questions.length})`}
			desc={`${completeQuestions} dari ${questions.length} soal sudah lengkap`}
			right={
				<Btn
					onClick={onAddQuestion}
					style={{ ...primaryBtn, padding: '7px 14px' }}
					hoverStyle={{ filter: 'brightness(0.92)' }}
				>
					<Plus size={15} /> Tambah soal
				</Btn>
			}
		>
			{questions.length === 0 && (
				<div
					style={{
						padding: '36px 16px',
						textAlign: 'center',
						border: `2px dashed ${T.border}`,
						borderRadius: T.rLg,
						color: T.muted,
						fontSize: T.fsm,
					}}
				>
					<HelpCircle size={28} style={{ marginBottom: 8, color: '#94a3b8' }} />
					<div style={{ marginBottom: 12 }}>
						Belum ada soal. Tambahkan soal pertama untuk kuis refleksi.
					</div>
					<Btn
						onClick={onAddQuestion}
						style={{ ...outlineBtn, color: T.primary }}
						hoverStyle={{ backgroundColor: T.primarySoft }}
					>
						<Plus size={15} /> Tambah soal
					</Btn>
				</div>
			)}

			<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
				{questions.map((q, qi) => (
					<KuisQuestionItem
						key={q.id}
						question={q}
						index={qi}
						totalQuestions={questions.length}
						isOpen={!!openQ[q.id]}
						onToggleOpen={() => onToggleOpenQ(q.id)}
						onMoveQuestion={onMoveQuestion}
						onDuplicateQuestion={onDuplicateQuestion}
						onRemoveQuestion={onRemoveQuestion}
						onUpdateQuestion={onUpdateQuestion}
						onSetOptionText={onSetOptionText}
						onAddOption={onAddOption}
						onRemoveOption={onRemoveOption}
					/>
				))}
			</div>
		</SectionCard>
	);
};

export default KuisQuestionList;
