import React from 'react';
import { CheckCircle, Circle, Plus, X, AlertCircle } from 'lucide-react';
import { Btn, Input, TextArea, Label } from '../shared/SectionCard';
import { T, LETTERS, MAX_OPTIONS, outlineBtn, ghostIconBtn } from '../utils/lessonConstants';

export const KuisAnswerOptions = ({
	question,
	questionIndex,
	onUpdateQuestion,
	onSetOptionText,
	onAddOption,
	onRemoveOption,
}) => {
	return (
		<div>
			<Label hint="Pilih lingkaran di kiri untuk menandai kunci jawaban">
				Pilihan jawaban
			</Label>
			<div
				role="radiogroup"
				aria-label={`Kunci jawaban soal ${questionIndex + 1}`}
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: 8,
					marginBottom: 10,
				}}
			>
				{question.options.map((o, oi) => {
					const isCorrect = question.correct === o.id;
					return (
						<div
							key={o.id}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 8,
								padding: 4,
								borderRadius: T.rMd,
								border: `1px solid ${isCorrect ? '#86efac' : 'transparent'}`,
								background: isCorrect ? '#f0fdf4' : 'transparent',
							}}
						>
							<Btn
								role="radio"
								aria-checked={isCorrect}
								aria-label={`Jadikan ${LETTERS[oi]} jawaban benar`}
								title="Tandai sebagai jawaban benar"
								onClick={() =>
									onUpdateQuestion(question.id, {
										correct: o.id,
									})
								}
								style={{
									background: 'none',
									border: 'none',
									padding: 4,
									color: isCorrect ? T.success : '#94a3b8',
								}}
								hoverStyle={{ color: T.success }}
							>
								{isCorrect ? (
									<CheckCircle size={20} />
								) : (
									<Circle size={20} />
								)}
							</Btn>
							<span
								style={{
									width: 24,
									height: 24,
									borderRadius: 6,
									background: isCorrect ? T.successBg : T.neutralBg,
									color: isCorrect ? T.successText : T.muted,
									display: 'inline-flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontSize: T.fxs,
									fontWeight: 700,
									flexShrink: 0,
								}}
							>
								{LETTERS[oi]}
							</span>
							<Input
								aria-label={`Pilihan ${LETTERS[oi]}`}
								value={o.text}
								onChange={(e) =>
									onSetOptionText(question, o.id, e.target.value)
								}
								placeholder={`Pilihan ${LETTERS[oi]}`}
							/>
							<Btn
								aria-label={`Hapus pilihan ${LETTERS[oi]}`}
								disabled={question.options.length <= 2}
								onClick={() => onRemoveOption(question, o.id)}
								style={ghostIconBtn}
								hoverStyle={{
									backgroundColor: T.dangerBg,
									color: T.danger,
								}}
							>
								<X size={15} />
							</Btn>
						</div>
					);
				})}
			</div>

			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					flexWrap: 'wrap',
					gap: 8,
					marginBottom: 16,
				}}
			>
				<Btn
					onClick={() => onAddOption(question)}
					disabled={question.options.length >= MAX_OPTIONS}
					style={{
						...outlineBtn,
						padding: '5px 12px',
						fontSize: T.fxs,
						color: T.primary,
					}}
					hoverStyle={{ backgroundColor: T.primarySoft }}
				>
					<Plus size={13} /> Tambah pilihan ({question.options.length}/{MAX_OPTIONS})
				</Btn>
				{!question.correct && (
					<span
						style={{
							fontSize: T.fxs,
							color: T.warnText,
							display: 'inline-flex',
							alignItems: 'center',
							gap: 4,
						}}
					>
						<AlertCircle size={13} /> Kunci jawaban belum dipilih
					</span>
				)}
			</div>

			<Label htmlFor={`q-exp-${question.id}`} hint="Opsional">
				Penjelasan jawaban
			</Label>
			<TextArea
				id={`q-exp-${question.id}`}
				rows={2}
				value={question.explanation}
				onChange={(e) =>
					onUpdateQuestion(question.id, {
						explanation: e.target.value,
					})
				}
				placeholder="Mengapa jawaban ini benar? Ditampilkan ke peserta setelah menjawab."
			/>
		</div>
	);
};

export default KuisAnswerOptions;
