import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Stack } from 'react-bootstrap';
import { ChevronDown, ChevronRight, Plus, Search, Sparkles, X } from 'lucide-react';

import api from '@/api/axios';
import { notify } from '@/utils/notify';

import { HoverButton, OutlineButton } from './curriculum-tab/Buttons';
import ModuleCard from './curriculum-tab/ModuleCard';
import { AddModuleModal, ConfirmDeleteModal } from './curriculum-tab/Modals';

import useDragAndDrop from './curriculum-tab/useDragAndDrop';

import { decorateModules, filterModules, moveItem, reorderModules } from './curriculum-tab/utils';

const CurriculumTab = ({ learningId, modules = [], onModulesChange }) => {
	const navigate = useNavigate();

	// States
	const [expanded, setExpanded] = useState(() => (modules[0] ? { [modules[0].id]: true } : {}));

	const [searchQuery, setSearchQuery] = useState('');

	const [addModuleOpen, setAddModuleOpen] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(null);

	const [isCreatingModule, setIsCreatingModule] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// Search
	const query = searchQuery.trim().toLowerCase();
	const searching = query !== '';

	const decorated = decorateModules(modules);

	const visibleModules = searching ? filterModules(decorated, query) : decorated;

	// Expand / Collapse
	const allExpanded = modules.length > 0 && modules.every((module) => expanded[module.id]);

	const dnd = useDragAndDrop({
		disabled: searching,
	});

	// =====================================================
	// ADD MODULE
	// =====================================================
	const handleAddModule = async () => {
		if (isCreatingModule) return;

		setIsCreatingModule(true);

		try {
			const response = await api.post('lms/organizer/modules', {
				learning_path_id: learningId,
				title: 'Untitled Module',
				order_index:
					Math.max(0, ...modules.map((module) => Number(module.order_index) || 0)) + 1,
				status: 'draft',
			});

			if (!response.data.success || !response.data.data) {
				throw new Error(response.data.message || 'Gagal membuat module.');
			}

			const newModule = response.data.data;

			if (!newModule.id) {
				throw new Error('Module ID tidak ditemukan.');
			}

			// notify('success', 'Berhasil!', 'Module berhasil dibuat.');

			navigate(`/organizer/learning-path/${learningId}/modules/${newModule.id}/info`);
		} catch (err) {
			console.error('Gagal membuat module:', err);

			notify(
				'error',
				'Gagal!',
				err.response?.data?.message || err.message || 'Gagal membuat module.',
			);
		} finally {
			setIsCreatingModule(false);
		}
	};

	// =====================================================
	// DELETE MODULE / ITEM
	// =====================================================
	const handleDelete = async () => {
		if (!confirmDelete || isDeleting) return;

		const { kind, moduleId, itemId } = confirmDelete;

		setIsDeleting(true);

		try {
			if (kind === 'module') {
				const response = await api.delete(`lms/organizer/modules/${moduleId}`);

				if (!response.data.success) {
					throw new Error(response.data.message || 'Gagal menghapus module.');
				}

				onModulesChange((prev) => prev.filter((module) => module.id !== moduleId));
			} else {
				// Item deletion should use its own API endpoint.
				// This branch currently updates local state only.
				onModulesChange((prev) =>
					prev.map((module) =>
						module.id === moduleId
							? {
									...module,
									items: module.items.filter((item) => item.id !== itemId),
								}
							: module,
					),
				);
			}

			notify(
				'success',
				'Berhasil!',
				`${kind === 'module' ? 'Module' : 'Item'} berhasil dihapus.`,
			);

			setConfirmDelete(null);
		} catch (err) {
			console.error('Gagal menghapus:', err);

			notify(
				'error',
				'Gagal!',
				err.response?.data?.message || err.message || 'Gagal menghapus data.',
			);
		} finally {
			setIsDeleting(false);
		}
	};

	// =====================================================
	// DRAG AND DROP
	// =====================================================
	const handleDropOnModule = (moduleId, dragItem) => {
		if (dragItem.kind === 'module') {
			if (dragItem.moduleId === moduleId) return;

			onModulesChange((prev) => reorderModules(prev, dragItem.moduleId, moduleId));

			return;
		}

		onModulesChange((prev) =>
			moveItem(prev, dragItem.moduleId, dragItem.itemId, moduleId, null),
		);

		setExpanded((prev) => ({
			...prev,
			[moduleId]: true,
		}));
	};

	const handleDropOnItem = (moduleId, itemId, dragItem) => {
		if (dragItem.kind !== 'item' || dragItem.itemId === itemId) {
			return;
		}

		onModulesChange((prev) =>
			moveItem(prev, dragItem.moduleId, dragItem.itemId, moduleId, itemId),
		);

		setExpanded((prev) => ({
			...prev,
			[moduleId]: true,
		}));
	};

	// =====================================================
	// RENDER
	// =====================================================
	return (
		<>
			{/* Toolbar */}
			<div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
				{' '}
				{/* Search */}
				<div
					className="position-relative flex-grow-1"
					style={{
						flexBasis: 280,
						maxWidth: 560,
					}}
				>
					<Search
						size={16}
						color="#94a3b8"
						className="position-absolute top-50 translate-middle-y"
						style={{
							left: 14,
							pointerEvents: 'none',
						}}
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
				{/* Actions */}
				<div className="d-flex flex-wrap gap-2">
					<OutlineButton
						disabled={searching || modules.length === 0}
						style={{ fontWeight: 500 }}
						onClick={() =>
							setExpanded(
								Object.fromEntries(
									modules.map((module) => [module.id, !allExpanded]),
								),
							)
						}
					>
						{allExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}

						{allExpanded ? 'Collapse All' : 'Expand All'}
					</OutlineButton>

					<OutlineButton onClick={handleAddModule} disabled={isCreatingModule}>
						<Plus size={16} />
						{isCreatingModule ? 'Creating...' : 'Add Module'}
					</OutlineButton>

					<OutlineButton
						onClick={() => navigate(`/organizer/learning-path/${learningId}/generate`)}
					>
						<Sparkles size={16} />
						Generate with AI
					</OutlineButton>
				</div>
			</div>

			{/* Module List */}
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

				{visibleModules.map((module) => (
					<ModuleCard
						key={module.id}
						module={module}
						open={searching || !!expanded[module.id]}
						searching={searching}
						dnd={dnd}
						onToggle={() =>
							setExpanded((prev) => ({
								...prev,
								[module.id]: !prev[module.id],
							}))
						}
						onEdit={() => {
							navigate(
								`/organizer/learning-path/${learningId}/modules/${module.id}/info`,
							);
						}}
						onDelete={() =>
							setConfirmDelete({
								kind: 'module',
								moduleId: module.id,
								name: module.title || module.heading,
							})
						}
						onDropOnModule={handleDropOnModule}
						onDropOnItem={handleDropOnItem}
					/>
				))}

				{/* Add Module Button */}
				{!searching && (
					<HoverButton
						onClick={handleAddModule}
						disabled={isCreatingModule}
						className="justify-content-center mt-2 btn-add p-3"
					>
						<Plus size={16} />
						{isCreatingModule ? 'Creating...' : 'Add New Module'}
					</HoverButton>
				)}
			</Stack>

			{/* ================================================= */}
			{/* MODALS */}

			{/* Confirm Delete */}
			{confirmDelete && (
				<ConfirmDeleteModal
					target={confirmDelete}
					onClose={() => setConfirmDelete(null)}
					onConfirm={handleDelete}
					loading={isDeleting}
				/>
			)}
		</>
	);
};

export default CurriculumTab;
