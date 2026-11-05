import React, { useState } from 'react';
import { Tag as TagIcon, Plus, X } from 'lucide-react';
import { SectionCard, Btn, Input } from '../shared/SectionCard';
import { T, outlineBtn, SKILL_SUGGESTIONS } from '../utils/lessonConstants';

export const LessonSkills = ({
	tags = [],
	onAddTag,
	onRemoveTag,
}) => {
	const [tagInput, setTagInput] = useState('');

	const handleAdd = () => {
		if (tagInput.trim()) {
			onAddTag(tagInput.trim());
			setTagInput('');
		}
	};

	const suggestions = SKILL_SUGGESTIONS.filter(
		(s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase()),
	);

	return (
		<SectionCard
			icon={TagIcon}
			title="Tag keahlian & skill"
			desc="Dipakai untuk pemetaan skill pada Skill-Matrix."
		>
			<div
				style={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: 8,
					marginBottom: 12,
					minHeight: 32,
				}}
			>
				{tags.length === 0 && (
					<span style={{ fontSize: T.fsm, color: T.muted }}>Belum ada tag.</span>
				)}
				{tags.map((tag) => (
					<span
						key={tag}
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 6,
							padding: '4px 4px 4px 12px',
							background: T.primarySoft,
							color: T.primary,
							border: `1px solid ${T.primaryTint}`,
							borderRadius: T.rFull,
							fontSize: T.fsm,
							fontWeight: 600,
						}}
					>
						{tag}
						<Btn
							aria-label={`Hapus tag ${tag}`}
							onClick={() => onRemoveTag(tag)}
							style={{
								background: 'none',
								border: 'none',
								padding: 3,
								color: T.primary,
								borderRadius: '50%',
							}}
							hoverStyle={{ backgroundColor: T.primaryTint }}
						>
							<X size={13} />
						</Btn>
					</span>
				))}
			</div>
			<div style={{ display: 'flex', gap: 8, maxWidth: 440 }}>
				<Input
					aria-label="Tambah tag"
					value={tagInput}
					onChange={(e) => setTagInput(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ',') {
							e.preventDefault();
							handleAdd();
						}
					}}
					placeholder="Ketik tag lalu tekan Enter…"
				/>
				<Btn
					onClick={handleAdd}
					disabled={!tagInput.trim()}
					style={{ ...outlineBtn, color: T.primary }}
					hoverStyle={{ backgroundColor: T.primarySoft }}
				>
					<Plus size={15} /> Tambah
				</Btn>
			</div>
			{suggestions.length > 0 && (
				<div
					style={{
						display: 'flex',
						flexWrap: 'wrap',
						alignItems: 'center',
						gap: 6,
						marginTop: 10,
					}}
				>
					<span style={{ fontSize: T.fxs, color: T.muted }}>Saran:</span>
					{suggestions.map((s) => (
						<Btn
							key={s}
							onClick={() => onAddTag(s)}
							style={{
								border: 'none',
								background: T.neutralBg,
								color: T.muted,
								padding: '3px 10px',
								borderRadius: T.rFull,
								fontSize: T.fxs,
							}}
							hoverStyle={{ background: T.primaryTint, color: T.primary }}
						>
							+ {s}
						</Btn>
					))}
				</div>
			)}
		</SectionCard>
	);
};

export default LessonSkills;
