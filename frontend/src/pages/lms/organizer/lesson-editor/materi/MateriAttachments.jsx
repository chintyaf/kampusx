import React, { useRef } from 'react';
import { Paperclip, Trash2, Upload } from 'lucide-react';
import { SectionCard, Btn } from '../shared/SectionCard';
import { T, outlineBtn, ghostIconBtn } from '../utils/lessonConstants';

export const MateriAttachments = ({
	attachments = [],
	onFilesAdded,
	onRemoveAttachment,
}) => {
	const fileRef = useRef(null);

	const handleFileInput = (e) => {
		const files = Array.from(e.target.files || []);
		if (files.length > 0) {
			onFilesAdded(files);
		}
		e.target.value = '';
	};

	return (
		<SectionCard
			icon={Paperclip}
			title="Lampiran"
			desc="Berkas pendukung yang bisa diunduh peserta (PDF, ZIP, slide)."
		>
			<input
				ref={fileRef}
				type="file"
				multiple
				onChange={handleFileInput}
				style={{ display: 'none' }}
			/>
			{attachments.length === 0 && (
				<p style={{ margin: '0 0 12px', fontSize: T.fsm, color: T.muted }}>
					Belum ada lampiran.
				</p>
			)}
			<div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
				{attachments.map((f) => (
					<div
						key={f.id}
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							gap: 8,
							padding: '8px 12px',
							border: `1px solid ${T.border}`,
							borderRadius: T.rMd,
							background: T.field,
						}}
					>
						<span
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 8,
								fontSize: T.fsm,
								minWidth: 0,
							}}
						>
							<Paperclip size={15} color={T.primary} />
							<span
								style={{
									fontWeight: 600,
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
								}}
							>
								{f.name}
							</span>
							<span style={{ color: T.muted, fontSize: T.fxs }}>({f.size})</span>
						</span>
						<Btn
							aria-label={`Hapus ${f.name}`}
							onClick={() => onRemoveAttachment(f.id)}
							style={{ ...ghostIconBtn, color: T.danger }}
							hoverStyle={{ backgroundColor: T.dangerBg }}
						>
							<Trash2 size={15} />
						</Btn>
					</div>
				))}
			</div>
			<Btn
				onClick={() => fileRef.current?.click()}
				style={{
					...outlineBtn,
					width: '100%',
					justifyContent: 'center',
					color: T.primary,
					borderStyle: 'dashed',
				}}
				hoverStyle={{ backgroundColor: T.primarySoft }}
			>
				<Upload size={15} /> Unggah berkas
			</Btn>
		</SectionCard>
	);
};

export default MateriAttachments;
