import React from 'react';
import {
	ChevronLeft,
	ChevronRight,
	PanelLeft,
	Save,
} from 'lucide-react';
import { Btn, NavLink } from '../shared/SectionCard';
import { T, outlineBtn, primaryBtn } from '../utils/lessonConstants';

export const EditorTopbar = ({
	isNarrow,
	setDrawerOpen,
	base,
	pathModule,
	moduleInfo,
	currentLabel,
	dirty,
	saving,
	isNew,
	prevItem,
	nextItem,
	pathTo,
	requestNav,
	save,
	currentIndex,
	totalItems,
}) => {
	return (
		<div
			style={{
				position: 'sticky',
				top: 0,
				zIndex: 30,
				display: 'flex',
				alignItems: 'center',
				gap: 12,
				flexWrap: 'wrap',
				padding: '10px 24px',
				background: T.card,
				borderBottom: `1px solid ${T.border}`,
			}}
		>
			{isNarrow && (
				<Btn
					aria-label="Buka daftar lesson"
					onClick={() => setDrawerOpen(true)}
					style={{ ...outlineBtn, padding: '7px 10px' }}
					hoverStyle={{ backgroundColor: T.neutralBg }}
				>
					<PanelLeft size={16} /> Daftar
				</Btn>
			)}
			<nav
				aria-label="Breadcrumb"
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 6,
					fontSize: T.fsm,
					color: T.muted,
					flexWrap: 'wrap',
					minWidth: 0,
				}}
			>
				<NavLink href={base} onNavigate={requestNav}>
					Learning Path
				</NavLink>
				<ChevronRight size={14} />
				<NavLink href={pathModule} onNavigate={requestNav}>
					Module {moduleInfo.number}
				</NavLink>
				<ChevronRight size={14} />
				<span aria-current="page" style={{ color: T.text, fontWeight: 600 }}>
					{currentLabel}
				</span>
			</nav>

			<div
				style={{
					marginLeft: 'auto',
					display: 'flex',
					alignItems: 'center',
					gap: 10,
					flexWrap: 'wrap',
				}}
			>
				<span
					role="status"
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: 6,
						fontSize: T.fxs,
						color: dirty ? T.warnText : T.muted,
					}}
				>
					<span
						style={{
							width: 8,
							height: 8,
							borderRadius: '50%',
							background: dirty ? T.warn : T.success,
						}}
					/>
					{saving ? 'Menyimpan…' : dirty ? 'Belum disimpan' : 'Tersimpan'}
				</span>

				<div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
					<NavLink
						href={prevItem ? pathTo(prevItem) : '#'}
						onNavigate={(h) => prevItem && requestNav(h)}
						aria-label="Lesson sebelumnya (Alt+←)"
						title={
							prevItem
								? `Sebelumnya: ${prevItem.title} (Alt+←)`
								: 'Tidak ada lesson sebelumnya'
						}
						style={{
							...outlineBtn,
							padding: '7px 8px',
							display: 'inline-flex',
							opacity: prevItem ? 1 : 0.4,
							pointerEvents: prevItem ? 'auto' : 'none',
						}}
					>
						<ChevronLeft size={16} />
					</NavLink>
					<span
						style={{
							fontSize: T.fxs,
							color: T.muted,
							minWidth: 44,
							textAlign: 'center',
						}}
					>
						{currentIndex >= 0 ? `${currentIndex + 1} / ${totalItems}` : 'Baru'}
					</span>
					<NavLink
						href={nextItem ? pathTo(nextItem) : '#'}
						onNavigate={(h) => nextItem && requestNav(h)}
						aria-label="Lesson selanjutnya (Alt+→)"
						title={
							nextItem
								? `Selanjutnya: ${nextItem.title} (Alt+→)`
								: 'Tidak ada lesson selanjutnya'
						}
						style={{
							...outlineBtn,
							padding: '7px 8px',
							display: 'inline-flex',
							opacity: nextItem ? 1 : 0.4,
							pointerEvents: nextItem ? 'auto' : 'none',
						}}
					>
						<ChevronRight size={16} />
					</NavLink>
				</div>

				<Btn
					onClick={() => save()}
					disabled={saving || (!dirty && !isNew)}
					title="Simpan (Ctrl+S)"
					style={primaryBtn}
					hoverStyle={{ filter: 'brightness(0.92)' }}
				>
					<Save size={16} /> {saving ? 'Menyimpan…' : 'Simpan'}
				</Btn>
			</div>
		</div>
	);
};

export default EditorTopbar;
