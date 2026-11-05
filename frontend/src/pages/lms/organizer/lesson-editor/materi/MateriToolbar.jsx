import React from 'react';
import {
	Bold,
	Italic,
	Heading2,
	List,
	ListOrdered,
	Quote,
	Code,
	Link as LinkIcon,
} from 'lucide-react';
import { Btn } from '../shared/SectionCard';
import { T, ghostIconBtn, ghostHover } from '../utils/lessonConstants';

export const MateriToolbar = ({ onFormat }) => {
	const toolbarItems = [
		{
			key: 'b',
			label: 'Tebal (Ctrl+B)',
			icon: Bold,
			run: () => onFormat('**', '**', 'teks tebal'),
		},
		{
			key: 'i',
			label: 'Miring (Ctrl+I)',
			icon: Italic,
			run: () => onFormat('*', '*', 'teks miring'),
		},
		{
			key: 'h2',
			label: 'Judul bagian (H2)',
			icon: Heading2,
			run: () => onFormat('## ', '', 'Judul bagian', true),
		},
		{
			key: 'ul',
			label: 'Daftar poin',
			icon: List,
			run: () => onFormat('- ', '', 'Poin materi', true),
		},
		{
			key: 'ol',
			label: 'Daftar bernomor',
			icon: ListOrdered,
			run: () => onFormat('1. ', '', 'Langkah pertama', true),
		},
		{
			key: 'q',
			label: 'Kutipan / Catatan penting',
			icon: Quote,
			run: () => onFormat('> ', '', 'Catatan penting untuk peserta', true),
		},
		{
			key: 'code',
			label: 'Blok kode',
			icon: Code,
			run: () => onFormat('```\n', '\n```', 'kode di sini', true),
		},
		{
			key: 'link',
			label: 'Tautan web',
			icon: LinkIcon,
			run: () => onFormat('[', '](https://example.com)', 'teks tautan'),
		},
	];

	return (
		<div
			role="toolbar"
			aria-label="Format teks"
			style={{
				display: 'flex',
				gap: 2,
				flexWrap: 'wrap',
				padding: 4,
				marginBottom: 8,
				background: T.field,
				border: `1px solid ${T.border}`,
				borderRadius: T.rMd,
			}}
		>
			{toolbarItems.map((b) => (
				<Btn
					key={b.key}
					aria-label={b.label}
					title={b.label}
					onClick={b.run}
					style={ghostIconBtn}
					hoverStyle={ghostHover}
				>
					<b.icon size={16} />
				</Btn>
			))}
		</div>
	);
};

export default MateriToolbar;
