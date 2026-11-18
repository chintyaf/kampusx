import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Stack } from 'react-bootstrap';
import { ChevronDown, ChevronRight, Plus, Search, Sparkles, X } from 'lucide-react';
import { notify } from '@/utils/notify';

import { HoverButton, OutlineButton } from './curriculum-tab/Buttons';
import ModuleCard from './curriculum-tab/ModuleCard';
import { AddContentModal, AddModuleModal, ConfirmDeleteModal } from './curriculum-tab/Modals';
import useDragAndDrop from './curriculum-tab/useDragAndDrop';
import { decorateModules, filterModules, moveItem, reorderModules } from './curriculum-tab/utils';

// props:
//   id              : learningId
//   modules         : modules state (dimiliki parent)
//   onModulesChange : (updaterFn) => void  (juga menandai dirty di parent)
const CurriculumTab = ({ id, modules, onModulesChange }) => {
	const navigate = useNavigate();

	const [expanded, setExpanded] = useState(() => (modules[0] ? { [modules[0].id]: true } : {}));
	const [searchQuery, setSearchQuery] = useState('');
	const [addModuleOpen, setAddModuleOpen] = useState(false);
	const [addContentFor, setAddContentFor] = useState(null); // moduleId
	const [confirmDelete, setConfirmDelete] = useState(null); // { kind, moduleId, itemId?, name }

	const nextModuleId = useRef(100);

	const query = searchQuery.trim().toLowerCase();
	const searching = query !== '';
	const decorated = decorateModules(modules);
	const visibleModules = searching ? filterModules(decorated, query) : decorated;
	const allExpanded = modules.length > 0 && modules.every((m) => expanded[m.id]);
	const dnd = useDragAndDrop({ disabled: searching });

	return (
		<>
			{/* Toolbar */}
			<div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
				<div
					className="position-relative flex-grow-1"
					style={{ flexBasis: 280, maxWidth: 560 }}
				>
					<Search
						size={16}
						color="#94a3b8"
						className="position-absolute top-50 translate-middle-y"
						style={{ left: 14, pointerEvents: 'none' }}
					/>
					<Form.Control
						aria-label="Cari lesson dan quiz"
						placeholder="Search lessons and quizzes..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						style={{
							padding: '10px 36px 10px 38px',
							fontSize: 'var(--font-sm, 14px)',
							color: 'var(--color-text, #1e293b)',
							backgroundColor: 'var(--card, #ffffff)',
							borderColor: 'var(--neutral-border, #e2e8f0)',
							borderRadius: 'var(--radius-full, 999px)',
						}}
					/>
					{searchQuery && (
						<HoverButton
							aria-label="Hapus pencarian"
							onClick={() => setSearchQuery('')}
							className="position-absolute top-50 translate-middle-y"
							style={{
								right: 10,
								background: 'none',
								border: 'none',
								padding: 4,
								color: 'var(--neutral-text, #64748b)',
							}}
						>
							<X size={14} />
						</HoverButton>
					)}
				</div>

				<div className="d-flex flex-wrap gap-2">
					<OutlineButton
						disabled={searching || modules.length === 0}
						style={{ fontWeight: 500 }}
						onClick={() =>
							setExpanded(
								Object.fromEntries(modules.map((m) => [m.id, !allExpanded])),
							)
						}
					>
						{allExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
						{allExpanded ? 'Collapse All' : 'Expand All'}
					</OutlineButton>
					<OutlineButton onClick={() => setAddModuleOpen(true)}>
						<Plus size={16} /> Add Module
					</OutlineButton>
					<OutlineButton
						style={{ color: 'var(--purple-text, #7c3aed)' }}
						onClick={() => {
							// TODO: Masukkan link halaman AI Generate (pakai `id`)
							navigate('/TODO');

						}}
					>
						<Sparkles size={16} /> Generate with AI
					</OutlineButton>
				</div>
			</div>

			{/* Daftar Module */}
			<Stack gap={3}>
				{visibleModules.length === 0 && (
					<Card
						body
						className="text-center"
						style={{
							padding: '40px 16px',
							backgroundColor: 'var(--card, #ffffff)',
							borderColor: 'var(--neutral-border, #e2e8f0)',
							borderRadius: 'var(--radius-lg, 14px)',
							color: 'var(--neutral-text, #64748b)',
							fontSize: 'var(--font-sm, 14px)',
						}}
					>
						{searching
							? `Tidak ada lesson atau quiz yang cocok dengan “${searchQuery}”.`
							: 'Belum ada Module. Tambahkan Module pertama untuk mulai menyusun kurikulum.'}
					</Card>
				)}

				{visibleModules.map((m) => (
					<ModuleCard
						key={m.id}
						module={m}
						open={searching || !!expanded[m.id]}
						searching={searching}
						dnd={dnd}
						onToggle={() => setExpanded((p) => ({ ...p, [m.id]: !p[m.id] }))}
						onEdit={() => {
							if (m.unsaved) {
								return notify(
									'error',
									'Gagal!',
									'Simpan perubahan terlebih dahulu sebelum mengedit Module baru.',
								);
							}
							// TODO: Masukkan link edit module (pakai `id` dan `m.id`)
							navigate('/TODO');
						}}
						onDelete={() =>
							setConfirmDelete({ kind: 'module', moduleId: m.id, name: m.heading })
						}
						onAddContent={() => setAddContentFor(m.id)}
						onEditItem={(mod, it) => {
							if (mod.unsaved) {
								return notify(
									'error',
									'Gagal!',
									'Simpan perubahan terlebih dahulu sebelum mengedit isi Module baru.',
								);
							}
							if (it.type === 'quiz') {
								// TODO: Masukkan link edit quiz (pakai `id`, `mod.id`, `it.id`)
								navigate('/TODO');
							} else {
								// TODO: Masukkan link edit lesson (pakai `id`, `mod.id`, `it.id`)
								navigate('/TODO');
							}
						}}
						onDeleteItem={(mod, it) =>
							setConfirmDelete({
								kind: 'item',
								moduleId: mod.id,
								itemId: it.id,
								name: `${it.label} ${it.title}`,
							})
						}
						onDropOnModule={(moduleId, d) => {
							if (d.kind === 'module') {
								if (d.moduleId !== moduleId)
									onModulesChange((prev) =>
										reorderModules(prev, d.moduleId, moduleId),
									);
								return;
							}
							onModulesChange((prev) =>
								moveItem(prev, d.moduleId, d.itemId, moduleId, null),
							);
							setExpanded((p) => ({ ...p, [moduleId]: true }));
						}}
						onDropOnItem={(moduleId, itemId, d) => {
							if (d.kind !== 'item' || d.itemId === itemId) return;
							onModulesChange((prev) =>
								moveItem(prev, d.moduleId, d.itemId, moduleId, itemId),
							);
							setExpanded((p) => ({ ...p, [moduleId]: true }));
						}}
					/>
				))}

				{!searching && (
					<HoverButton
						onClick={() => setAddModuleOpen(true)}
						className="justify-content-center mt-2"
						style={{
							padding: 16,
							border: '2px dashed var(--neutral-border, #e2e8f0)',
							backgroundColor: 'var(--card, #ffffff)',
							borderRadius: 'var(--radius-lg, 14px)',
							color: 'var(--neutral-text, #64748b)',
							fontWeight: 600,
							fontSize: 'var(--font-sm, 14px)',
						}}
						hoverStyle={{
							borderColor: 'var(--bahama-blue-300, #7fb8d4)',
							color: 'var(--color-primary, #006699)',
						}}
					>
						<Plus size={16} /> Add New Module
					</HoverButton>
				)}
			</Stack>

			{/* Modals */}
			{addModuleOpen && (
				<AddModuleModal
					onClose={() => setAddModuleOpen(false)}
					onSubmit={(name) => {
						const mid = ++nextModuleId.current;
						onModulesChange((prev) => [
							...prev,
							{ id: mid, name, items: [], unsaved: true },
						]);
						setExpanded((p) => ({ ...p, [mid]: true }));
						setAddModuleOpen(false);
						notify(
							'success',
							'Berhasil!',
							'Module ditambahkan. Simpan perubahan untuk menyimpannya.',
						);
					}}
				/>
			)}

			{addContentFor != null && (
				<AddContentModal
					onClose={() => setAddContentFor(null)}
					onSelect={(option) => {
						const target = modules.find((m) => m.id === addContentFor);
						setAddContentFor(null);
						if (!target) return;
						if (target.unsaved) {
							return notify(
								'error',
								'Gagal!',
								'Simpan perubahan terlebih dahulu sebelum menambah konten.',
							);
						}
						if (option === 'manual') {
							// TODO: Masukkan link buat lesson manual (pakai `id` dan `target.id`)
							navigate('/TODO');
						}
						if (option === 'ai') {
							// TODO: Masukkan link buat lesson dengan AI (pakai `id` dan `target.id`)
							navigate('/TODO');
						}
						if (option === 'quiz') {
							// TODO: Masukkan link buat quiz baru (pakai `id` dan `target.id`)
							navigate('/TODO');
						}
					}}
				/>
			)}

			{confirmDelete && (
				<ConfirmDeleteModal
					target={confirmDelete}
					onClose={() => setConfirmDelete(null)}
					onConfirm={() => {
						const { kind, moduleId, itemId } = confirmDelete;
						onModulesChange((prev) =>
							kind === 'module'
								? prev.filter((m) => m.id !== moduleId)
								: prev.map((m) =>
										m.id === moduleId
											? {
													...m,
													items: m.items.filter((i) => i.id !== itemId),
												}
											: m,
									),
						);
						notify(
							'success',
							'Berhasil!',
							`${kind === 'module' ? 'Module' : 'Item'} dihapus. Simpan perubahan untuk menerapkannya.`,
						);
						setConfirmDelete(null);
					}}
				/>
			)}
		</>
	);
};

export default CurriculumTab;
