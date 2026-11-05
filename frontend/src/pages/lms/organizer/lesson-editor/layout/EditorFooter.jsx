import React from 'react';
import { ChevronLeft, Save, ArrowRight } from 'lucide-react';
import { Btn, NavLink } from '../shared/SectionCard';
import { T, outlineBtn, primaryBtn } from '../utils/lessonConstants';

export const EditorFooter = ({
	prevItem,
	nextItem,
	pathTo,
	pathModule,
	requestNav,
	save,
	saving,
}) => {
	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'stretch',
				gap: 12,
				flexWrap: 'wrap',
				marginTop: 8,
				paddingTop: 20,
				borderTop: `1px solid ${T.border}`,
			}}
		>
			<NavLink
				href={prevItem ? pathTo(prevItem) : pathModule}
				onNavigate={requestNav}
				style={{
					...outlineBtn,
					display: 'flex',
					alignItems: 'center',
					gap: 10,
					flex: '1 1 200px',
					maxWidth: 320,
					textAlign: 'left',
				}}
			>
				<ChevronLeft size={18} />
				<span style={{ minWidth: 0 }}>
					<span
						style={{ display: 'block', fontSize: 11, color: T.muted, fontWeight: 500 }}
					>
						{prevItem ? 'Sebelumnya' : 'Kembali'}
					</span>
					<span
						style={{
							display: 'block',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						}}
					>
						{prevItem ? prevItem.title : 'Edit Modul'}
					</span>
				</span>
			</NavLink>

			<div
				style={{
					display: 'flex',
					gap: 8,
					flexWrap: 'wrap',
					justifyContent: 'flex-end',
					flex: '1 1 260px',
				}}
			>
				{nextItem ? (
					<Btn
						onClick={() => save({ then: pathTo(nextItem) })}
						disabled={saving}
						style={{ ...primaryBtn, padding: '10px 16px', textAlign: 'left' }}
						hoverStyle={{ filter: 'brightness(0.92)' }}
					>
						<Save size={16} />
						<span style={{ minWidth: 0 }}>
							<span
								style={{
									display: 'block',
									fontSize: 11,
									opacity: 0.85,
									fontWeight: 500,
								}}
							>
								Simpan & lanjut
							</span>
							<span
								style={{
									display: 'block',
									maxWidth: 200,
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
								}}
							>
								{nextItem.title}
							</span>
						</span>
						<ArrowRight size={16} />
					</Btn>
				) : (
					<Btn
						onClick={() => save({ then: pathModule })}
						disabled={saving}
						style={{ ...primaryBtn, padding: '10px 16px' }}
						hoverStyle={{ filter: 'brightness(0.92)' }}
					>
						<Save size={16} /> Simpan & selesai
					</Btn>
				)}
			</div>
		</div>
	);
};

export default EditorFooter;
