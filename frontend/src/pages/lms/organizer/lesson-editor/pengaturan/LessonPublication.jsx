import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { SectionCard, Btn } from '../shared/SectionCard';
import { T } from '../utils/lessonConstants';

export const LessonPublication = ({
	status = 'draft',
	allDone = false,
	doneCount = 0,
	totalChecklist = 0,
	onUpdate,
}) => {
	const statusOptions = [
		{ id: 'draft', label: 'Draft', desc: 'Belum terlihat oleh peserta' },
		{
			id: 'published',
			label: 'Siap terbit',
			desc: 'Ikut terbit saat Learning Path dipublikasikan',
			needsComplete: true,
		},
	];

	return (
		<SectionCard
			icon={CheckCircle}
			title="Status publikasi"
			desc="Unit hanya bisa ditandai siap terbit jika semua kelengkapan terpenuhi."
		>
			<div
				role="radiogroup"
				aria-label="Status"
				style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}
			>
				{statusOptions.map((s) => {
					const disabled = s.needsComplete && !allDone;
					const selected = status === s.id;
					return (
						<Btn
							key={s.id}
							role="radio"
							aria-checked={selected}
							disabled={disabled}
							onClick={() => onUpdate({ status: s.id })}
							style={{
								flex: '1 1 220px',
								flexDirection: 'column',
								alignItems: 'flex-start',
								gap: 2,
								textAlign: 'left',
								padding: 14,
								borderRadius: T.rMd,
								background: selected ? T.primarySoft : T.card,
								border: `1.5px solid ${selected ? T.primary : T.border}`,
								color: T.text,
							}}
							hoverStyle={selected ? {} : { borderColor: T.primary }}
						>
							<strong style={{ fontSize: T.fsm }}>{s.label}</strong>
							<span style={{ fontSize: T.fxs, color: T.muted }}>{s.desc}</span>
						</Btn>
					);
				})}
			</div>
			{!allDone && (
				<p
					style={{
						margin: '12px 0 0',
						fontSize: T.fxs,
						color: T.warnText,
						display: 'flex',
						alignItems: 'center',
						gap: 6,
					}}
				>
					<AlertCircle size={13} /> Lengkapi {totalChecklist - doneCount} item pada daftar
					Kelengkapan untuk membuka opsi “Siap terbit”.
				</p>
			)}
		</SectionCard>
	);
};

export default LessonPublication;
