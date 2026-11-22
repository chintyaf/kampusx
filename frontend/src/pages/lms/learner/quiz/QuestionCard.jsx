import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Bookmark, Check, ChevronLeft, ChevronRight, HelpCircle, Send } from 'lucide-react';

const Option = ({ option, selected, onSelect }) => (
	<div
		role="radio"
		aria-checked={selected}
		tabIndex={0}
		className={`qz-option ${selected ? 'is-selected' : ''}`}
		onClick={onSelect}
		onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect())}
	>
		<div className="d-flex align-items-center gap-3">
			<span className="qz-option-key">{option.key}</span>
			<span className="qz-option-text">{option.text}</span>
		</div>
		<span className="qz-option-check">{selected && <Check size={16} strokeWidth={2.5} />}</span>
	</div>
);

const QuestionCard = ({
	question,
	index,
	total,
	passingScore,
	selectedOptionId,
	isFlagged,
	canSubmit,
	onSelect,
	onPrev,
	onNext,
	onToggleFlag,
	onSubmit,
}) => {
	const isLast = index === total - 1;

	return (
		<Card className="qz-card qz-question-card">
			<div className="qz-card-bar">
				<span className="qz-eyebrow">
					Soal {index + 1} dari {total}
				</span>
				<span className="qz-pass-pill">Ambang lulus {passingScore}%</span>
			</div>

			<div className="p-4">
				<div className="d-flex gap-3 align-items-start mb-4">
					<div className="qz-question-icon">
						<HelpCircle size={22} />
					</div>
					<div>
						<div className="d-flex align-items-center gap-2 mb-1">
							<span className="qz-eyebrow is-muted">Pertanyaan</span>
							{question.bloom && (
								<span className="badge qz-bloom">Bloom: {question.bloom}</span>
							)}
						</div>
						<h4 className="qz-question-text">{question.question}</h4>
					</div>
				</div>

				<div className="d-flex flex-column gap-2" role="radiogroup">
					{question.options.map((opt) => (
						<Option
							key={opt.id}
							option={opt}
							selected={selectedOptionId === opt.id}
							onSelect={() => onSelect(opt.id)}
						/>
					))}
				</div>
			</div>

			<div className="qz-card-bar is-footer">
				<Button variant="light" className="qz-btn qz-btn-ghost" disabled={index === 0} onClick={onPrev}>
					<ChevronLeft size={18} /> Soal sebelumnya
				</Button>

				<button
					type="button"
					className={`qz-flag ${isFlagged ? 'is-flagged' : ''}`}
					onClick={onToggleFlag}
				>
					<Bookmark size={18} fill={isFlagged ? 'currentColor' : 'none'} />
					{isFlagged ? 'Ditandai ragu-ragu' : 'Tandai ragu-ragu'}
				</button>

				<Button
					className="qz-btn border-0 px-4"
					disabled={isLast && !canSubmit}
					title={isLast && !canSubmit ? 'Jawab semua soal untuk mengirim' : undefined}
					onClick={isLast ? onSubmit : onNext}
				>
					{isLast ? (
						<>
							Kirim Jawaban <Send size={18} />
						</>
					) : (
						<>
							Soal selanjutnya <ChevronRight size={18} />
						</>
					)}
				</Button>
			</div>
		</Card>
	);
};

export default QuestionCard;
