import React from 'react';
import { Award } from 'lucide-react';
import { SectionCard, Label, Input, Switch } from '../shared/SectionCard';
import { T, inputBase } from '../utils/lessonConstants';

export const LessonAttributes = ({
	format = 'article',
	duration = 5,
	xp = 10,
	prerequisite = false,
	words = 0,
	isStacked = false,
	onUpdate,
}) => {
	return (
		<SectionCard icon={Award} title="Atribut & gamifikasi">
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: isStacked ? '1fr' : '1fr 1fr',
					gap: 16,
					marginBottom: 18,
				}}
			>
				<div>
					<Label htmlFor="lesson-format">Format unit</Label>
					<select
						id="lesson-format"
						value={format}
						onChange={(e) => onUpdate({ format: e.target.value })}
						style={{ ...inputBase, appearance: 'auto' }}
					>
						<option value="article">Artikel</option>
						<option value="micro">Microlearning Unit</option>
					</select>
				</div>
				<div>
					<Label
						htmlFor="lesson-duration"
						hint={`Estimasi dari materi: ±${Math.max(1, Math.round(words / 200))} menit`}
					>
						Estimasi durasi (menit)
					</Label>
					<Input
						id="lesson-duration"
						type="number"
						min={1}
						value={duration}
						onChange={(e) =>
							onUpdate({ duration: Math.max(0, Number(e.target.value)) })
						}
					/>
				</div>
				<div>
					<Label htmlFor="lesson-xp">Reward XP</Label>
					<Input
						id="lesson-xp"
						type="number"
						min={0}
						value={xp}
						onChange={(e) => onUpdate({ xp: Math.max(0, Number(e.target.value)) })}
					/>
				</div>
			</div>
			<div style={{ paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
				<Switch
					id="prereq"
					checked={prerequisite}
					onChange={(v) => onUpdate({ prerequisite: v })}
					label="Jadikan unit prasyarat wajib"
				/>
				<p style={{ margin: '6px 0 0 48px', fontSize: T.fxs, color: T.muted }}>
					Peserta harus menyelesaikan unit ini sebelum membuka unit selanjutnya.
				</p>
			</div>
		</SectionCard>
	);
};

export default LessonAttributes;
