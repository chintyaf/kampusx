import React from 'react';
import { Award } from 'lucide-react';
import { SectionCard, Label, Input, Switch } from '../shared/SectionCard';

export const KuisSettings = ({ quiz, onUpdateQuiz, isStacked = false }) => {
	return (
		<SectionCard
			icon={Award}
			title="Pengaturan kuis"
			desc="Berlaku untuk seluruh soal di unit ini."
		>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: isStacked ? '1fr' : '1fr 1fr 1.3fr',
					gap: 16,
					alignItems: 'end',
				}}
			>
				<div>
					<Label htmlFor="quiz-pass">Passing grade (%)</Label>
					<Input
						id="quiz-pass"
						type="number"
						min={0}
						max={100}
						value={quiz.passingScore}
						onChange={(e) =>
							onUpdateQuiz({
								passingScore: Math.min(
									100,
									Math.max(0, Number(e.target.value)),
								),
							})
						}
					/>
				</div>
				<div>
					<Label htmlFor="quiz-attempts">Maks. percobaan</Label>
					<Input
						id="quiz-attempts"
						type="number"
						min={1}
						value={quiz.maxAttempts}
						onChange={(e) =>
							onUpdateQuiz({ maxAttempts: Math.max(1, Number(e.target.value)) })
						}
					/>
				</div>
				<div style={{ paddingBottom: 8 }}>
					<Switch
						id="quiz-graded"
						checked={quiz.graded}
						onChange={(v) => onUpdateQuiz({ graded: v })}
						label="Diberi nilai (graded)"
					/>
				</div>
			</div>
		</SectionCard>
	);
};

export default KuisSettings;
