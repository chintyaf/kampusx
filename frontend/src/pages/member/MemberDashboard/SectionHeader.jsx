import React from 'react';
import { ChevronRight } from 'lucide-react';
import { clr } from './constants';

const SectionHeader = ({ title, onSeeAll }) => (
	<div
		style={{
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginBottom: 14,
		}}>
		<span style={{ fontSize: 'var(--font-md)', fontWeight: 700, color: clr.text }}>
			{title}
		</span>
		{onSeeAll && (
			<button
				onClick={onSeeAll}
				style={{
					background: 'none',
					border: 'none',
					padding: 0,
					color: clr.primary,
					fontSize: 'var(--font-xs)',
					fontWeight: 600,
					cursor: 'pointer',
					display: 'flex',
					alignItems: 'center',
					gap: 2,
				}}>
				Lihat Semua <ChevronRight size={13} />
			</button>
		)}
	</div>
);

export default SectionHeader;
