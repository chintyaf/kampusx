import React from 'react';
import { FileText } from 'lucide-react';
import { SectionCard, Label, Input, TextArea } from '../shared/SectionCard';

export const MateriInformation = ({
	kind = 'lesson',
	title = '',
	summary = '',
	titleRef,
	onUpdate,
}) => {
	return (
		<SectionCard
			icon={FileText}
			title="Informasi utama"
			desc="Judul dan ringkasan tampil di awal halaman lesson untuk peserta."
		>
			<div style={{ marginBottom: 16 }}>
				<Label htmlFor="lesson-title">
					{kind === 'quiz' ? 'Judul kuis' : 'Judul lesson'}
				</Label>
				<Input
					id="lesson-title"
					ref={titleRef}
					value={title}
					onChange={(e) => onUpdate({ title: e.target.value })}
					placeholder="Contoh: Introduction to Variables"
					maxLength={120}
					style={{ fontSize: 18, fontWeight: 700, padding: '12px 14px' }}
				/>
			</div>
			<div>
				<Label htmlFor="lesson-summary" hint={`${summary.length} / 300`}>
					Ringkasan
				</Label>
				<TextArea
					id="lesson-summary"
					rows={3}
					maxLength={300}
					value={summary}
					onChange={(e) => onUpdate({ summary: e.target.value })}
					placeholder="Gambaran singkat mengenai apa yang akan dipelajari…"
				/>
			</div>
		</SectionCard>
	);
};

export default MateriInformation;
