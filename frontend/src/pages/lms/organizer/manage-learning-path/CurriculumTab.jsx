import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	ChevronDown,
	ChevronRight,
	Plus,
	Sparkles,
	GripVertical,
	Edit,
	Trash2,
	BookOpen,
	Cpu,
	HelpCircle,
	Search,
	X,
	PenLine,
	FileUp,
} from 'lucide-react';

// ==========================================
// TOKENS (CSS variable proyek, dengan fallback)
// ==========================================
const T = {
	card: 'var(--card, #ffffff)',
	text: 'var(--color-text, #1e293b)',
	neutral: 'var(--neutral-text, #64748b)',
	neutralBg: 'var(--neutral-bg, #f1f5f9)',
	border: 'var(--neutral-border, #e2e8f0)',
	primary: 'var(--color-primary, #006699)',
	primarySoft: 'var(--bahama-blue-50, #f0f8fc)',
	primaryTint: 'var(--bahama-blue-100, #d9edf7)',
	primaryLine: 'var(--bahama-blue-300, #7fb8d4)',
	white: 'var(--color-white, #ffffff)',
	errorText: 'var(--error-text, #dc2626)',
	purple: 'var(--purple-text, #7c3aed)',
	fxs: 'var(--font-xs, 12px)',
	fsm: 'var(--font-sm, 14px)',
	fmd: 'var(--font-md, 16px)',
	rSm: 'var(--radius-sm, 6px)',
	rMd: 'var(--radius-md, 10px)',
	rLg: 'var(--radius-lg, 14px)',
	rFull: 'var(--radius-full, 999px)',
};

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// Tombol dengan efek hover (inline CSS tidak punya :hover)
const Btn = ({ style, hoverStyle, disabled, children, ...rest }) => {
	const [hover, setHover] = useState(false);
	return (
		<button
			type="button"
			disabled={disabled}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 8,
				fontFamily: 'inherit',
				cursor: disabled ? 'not-allowed' : 'pointer',
				opacity: disabled ? 0.55 : 1,
				transition: 'background-color .15s, border-color .15s, color .15s',
				...style,
				...(hover && !disabled ? hoverStyle : {}),
			}}
			{...rest}
		>
			{children}
		</button>
	);
};

const outlineBtn = {
	padding: '8px 14px',
	backgroundColor: T.card,
	border: `1px solid ${T.border}`,
	borderRadius: T.rMd,
	color: T.text,
	fontSize: T.fsm,
	fontWeight: 600,
};
const outlineHover = { backgroundColor: T.neutralBg };

const Modal = ({ title, onClose, children, width = 460 }) => {
	useEffect(() => {
		const onKey = (e) => e.key === 'Escape' && onClose();
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [onClose]);

	return (
		<div
			onMouseDown={(e) => e.target === e.currentTarget && onClose()}
			style={{
				position: 'fixed',
				inset: 0,
				zIndex: 1050,
				background: 'rgba(15,23,42,0.45)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: 16,
			}}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-label={title}
				style={{
					width: '100%',
					maxWidth: width,
					background: T.card,
					borderRadius: T.rLg,
					padding: 24,
					boxShadow: '0 20px 40px rgba(15,23,42,0.2)',
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						marginBottom: 16,
					}}
				>
					<h2 style={{ margin: 0, fontSize: T.fmd, fontWeight: 700 }}>{title}</h2>
					<Btn
						aria-label="Tutup"
						onClick={onClose}
						style={{ background: 'none', border: 'none', padding: 4, color: T.neutral }}
					>
						<X size={18} />
					</Btn>
				</div>
				{children}
			</div>
		</div>
	);
};

// ==========================================
// CURRICULUM TAB
// props:
//   id               : learningId
//   routes           : objek ROUTES dari ManageLearningPathPage
//   modules          : state modules (dimiliki parent)
//   onModulesChange  : (updaterFn) => void — juga menandai dirty di parent
//   showToast        : (message, type?) => void
// ==========================================
const CurriculumTab = ({ id, routes, modules, onModulesChange, showToast }) => {
	const navigate = useNavigate();

	const [expanded, setExpanded] = useState(() => (modules[0] ? { [modules[0].id]: true } : {}));
	const [searchQuery, setSearchQuery] = useState('');

	// modal state
	const [addModuleOpen, setAddModuleOpen] = useState(false);
	const [newModuleName, setNewModuleName] = useState('');
	const [addContentFor, setAddContentFor] = useState(null); // moduleId
	const [confirmDelete, setConfirmDelete] = useState(null); // {kind, moduleId, itemId?, name}

	// drag & drop
	const dragRef = useRef(null);
	const [dragOver, setDragOver] = useState(null);
	const nextModuleId = useRef(100);

	const query = searchQuery.trim().toLowerCase();
	const isSearching = query.length > 0;

	// Penomoran dihitung ulang agar selalu urut setelah reorder/hapus
	const decorated = useMemo(
		() =>
			modules.map((m, mi) => {
				let lessonNo = 0;
				let quizNo = 0;
				const items = m.items.map((it) => {
					const isQuiz = it.type === 'quiz';
					const no = isQuiz ? ++quizNo : ++lessonNo;
					return { ...it, label: `${isQuiz ? 'Quiz' : 'Lesson'} ${mi + 1}.${no}` };
				});
				return {
					...m,
					number: mi + 1,
					heading: `Module ${mi + 1}: ${m.name}`,
					items,
					lessonCount: lessonNo,
					quizCount: quizNo,
				};
			}),
		[modules],
	);

	// Filter pencarian
	const visibleModules = useMemo(() => {
		if (!isSearching) return decorated;
		return decorated
			.map((m) => {
				const moduleMatch = m.heading.toLowerCase().includes(query);
				const items = moduleMatch
					? m.items
					: m.items.filter((it) =>
							`${it.label} ${it.title}`.toLowerCase().includes(query),
						);
				return { ...m, items, _show: moduleMatch || items.length > 0 };
			})
			.filter((m) => m._show);
	}, [decorated, query, isSearching]);

	const isOpen = (m) => (isSearching ? true : !!expanded[m.id]);
	const allExpanded = modules.length > 0 && modules.every((m) => expanded[m.id]);

	const toggleModule = (mid) => setExpanded((p) => ({ ...p, [mid]: !p[mid] }));
	const toggleExpandAll = () => {
		const next = {};
		modules.forEach((m) => (next[m.id] = !allExpanded));
		setExpanded(next);
	};

	// ---------- Aksi ----------
	const closeAddModule = () => {
		setAddModuleOpen(false);
		setNewModuleName('');
	};

	const handleAddModule = (e) => {
		e.preventDefault();
		const name = newModuleName.trim();
		if (!name) return;
		const mid = ++nextModuleId.current;
		onModulesChange((prev) => [...prev, { id: mid, name, items: [], unsaved: true }]);
		setExpanded((p) => ({ ...p, [mid]: true }));
		closeAddModule();
		showToast('Module ditambahkan. Simpan perubahan untuk menyimpannya.');
	};

	const handleEditModule = (m) => {
		if (m.unsaved) {
			showToast('Simpan perubahan terlebih dahulu sebelum mengedit Module baru.', 'error');
			return;
		}
		navigate(routes.editModule(id, m.id));
	};

	const handleEditItem = (m, it) => {
		if (m.unsaved) {
			showToast(
				'Simpan perubahan terlebih dahulu sebelum mengedit isi Module baru.',
				'error',
			);
			return;
		}
		navigate(
			it.type === 'quiz'
				? routes.editQuiz(id, m.id, it.id)
				: routes.editLesson(id, m.id, it.id),
		);
	};

	const handleAddContent = (option) => {
		const target = modules.find((m) => m.id === addContentFor);
		if (!target) return;
		setAddContentFor(null);
		if (target.unsaved) {
			showToast('Simpan perubahan terlebih dahulu sebelum menambah konten.', 'error');
			return;
		}
		if (option === 'manual') navigate(routes.newLessonManual(id, target.id));
		if (option === 'ai') navigate(routes.newLessonAI(id, target.id));
		if (option === 'quiz') navigate(routes.newQuiz(id, target.id));
	};

	const handleConfirmDelete = () => {
		if (!confirmDelete) return;
		const { kind, moduleId, itemId } = confirmDelete;
		if (kind === 'module') {
			onModulesChange((prev) => prev.filter((m) => m.id !== moduleId));
			showToast('Module dihapus. Simpan perubahan untuk menerapkannya.');
		} else {
			onModulesChange((prev) =>
				prev.map((m) =>
					m.id === moduleId ? { ...m, items: m.items.filter((i) => i.id !== itemId) } : m,
				),
			);
			showToast('Item dihapus. Simpan perubahan untuk menerapkannya.');
		}
		setConfirmDelete(null);
	};

	// ---------- Drag & drop ----------
	const moveModule = (fromId, toId) => {
		if (fromId === toId) return;
		onModulesChange((prev) => {
			const from = prev.findIndex((m) => m.id === fromId);
			const to = prev.findIndex((m) => m.id === toId);
			if (from < 0 || to < 0) return prev;
			const next = [...prev];
			const [moved] = next.splice(from, 1);
			next.splice(to, 0, moved);
			return next;
		});
	};

	// toItemId null => tambahkan di akhir module tujuan
	const moveItem = (fromModuleId, itemId, toModuleId, toItemId) => {
		if (toItemId === itemId) return;
		onModulesChange((prev) => {
			const item = prev
				.find((m) => m.id === fromModuleId)
				?.items.find((i) => i.id === itemId);
			if (!item) return prev;
			const without = prev.map((m) =>
				m.id === fromModuleId ? { ...m, items: m.items.filter((i) => i.id !== itemId) } : m,
			);
			return without.map((m) => {
				if (m.id !== toModuleId) return m;
				const items = [...m.items];
				const idx =
					toItemId == null ? items.length : items.findIndex((i) => i.id === toItemId);
				items.splice(idx < 0 ? items.length : idx, 0, item);
				return { ...m, items };
			});
		});
		setExpanded((p) => ({ ...p, [toModuleId]: true }));
	};

	const dragProps = (data, onDropFn, overKey) => ({
		draggable: !isSearching,
		onDragStart: (e) => {
			e.stopPropagation();
			dragRef.current = data;
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', '');
		},
		onDragOver: (e) => {
			if (!dragRef.current) return;
			e.preventDefault();
			e.stopPropagation();
			setDragOver(overKey);
		},
		onDrop: (e) => {
			e.preventDefault();
			e.stopPropagation();
			const d = dragRef.current;
			dragRef.current = null;
			setDragOver(null);
			if (d) onDropFn(d);
		},
		onDragEnd: () => {
			dragRef.current = null;
			setDragOver(null);
		},
	});

	const overStyle = (key) => (dragOver === key ? { boxShadow: `0 0 0 2px ${T.primary}` } : {});

	// ---------- Render ----------
	return (
		<>
			{/* Toolbar */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					flexWrap: 'wrap',
					gap: 12,
					marginBottom: 24,
				}}
			>
				<div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 560 }}>
					<Search
						size={16}
						color="#94a3b8"
						style={{
							position: 'absolute',
							left: 14,
							top: '50%',
							transform: 'translateY(-50%)',
							pointerEvents: 'none',
						}}
					/>
					<input
						type="text"
						aria-label="Cari lesson dan quiz"
						placeholder="Search lessons and quizzes..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						style={{
							width: '100%',
							boxSizing: 'border-box',
							padding: '10px 36px 10px 38px',
							fontSize: T.fsm,
							fontFamily: 'inherit',
							color: T.text,
							backgroundColor: T.card,
							border: `1px solid ${T.border}`,
							borderRadius: T.rFull,
							outline: 'none',
						}}
					/>
					{searchQuery && (
						<Btn
							aria-label="Hapus pencarian"
							onClick={() => setSearchQuery('')}
							style={{
								position: 'absolute',
								right: 10,
								top: '50%',
								transform: 'translateY(-50%)',
								background: 'none',
								border: 'none',
								padding: 4,
								color: T.neutral,
							}}
						>
							<X size={14} />
						</Btn>
					)}
				</div>

				<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
					<Btn
						onClick={toggleExpandAll}
						disabled={isSearching || modules.length === 0}
						style={{ ...outlineBtn, fontWeight: 500 }}
						hoverStyle={outlineHover}
					>
						{allExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
						{allExpanded ? 'Collapse All' : 'Expand All'}
					</Btn>
					<Btn
						onClick={() => setAddModuleOpen(true)}
						style={outlineBtn}
						hoverStyle={outlineHover}
					>
						<Plus size={16} /> Add Module
					</Btn>
					<Btn
						onClick={() => navigate(routes.aiGenerate(id))}
						style={{ ...outlineBtn, color: T.purple }}
						hoverStyle={outlineHover}
					></Btn>
				</div>
			</div>

			{/* Daftar Module */}
			<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
				{visibleModules.length === 0 && (
					<div
						style={{
							padding: '40px 16px',
							textAlign: 'center',
							background: T.card,
							border: `1px solid ${T.border}`,
							borderRadius: T.rLg,
							color: T.neutral,
							fontSize: T.fsm,
						}}
					>
						{isSearching
							? `Tidak ada lesson atau quiz yang cocok dengan “${searchQuery}”.`
							: 'Belum ada Module. Tambahkan Module pertama untuk mulai menyusun kurikulum.'}
					</div>
				)}

				{visibleModules.map((m) => {
					const open = isOpen(m);
					return (
						<div
							key={m.id}
							{...dragProps(
								{ kind: 'module', moduleId: m.id },
								(d) => {
									if (d.kind === 'module') moveModule(d.moduleId, m.id);
									else moveItem(d.moduleId, d.itemId, m.id, null);
								},
								`m-${m.id}`,
							)}
							style={{
								backgroundColor: T.card,
								borderRadius: T.rLg,
								border: `1px solid ${T.border}`,
								overflow: 'hidden',
								...overStyle(`m-${m.id}`),
							}}
						>
							{/* Header Module */}
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									gap: 12,
									padding: 16,
									flexWrap: 'wrap',
									borderBottom: open ? `1px solid ${T.border}` : 'none',
								}}
							>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 8,
										flexWrap: 'wrap',
										minWidth: 0,
									}}
								>
									<GripVertical
										size={18}
										color="#cbd5e1"
										style={{ cursor: isSearching ? 'default' : 'grab' }}
										aria-hidden="true"
									/>
									<Btn
										aria-label={open ? 'Ciutkan module' : 'Buka module'}
										aria-expanded={open}
										onClick={() => toggleModule(m.id)}
										disabled={isSearching}
										style={{
											background: 'none',
											border: 'none',
											padding: 0,
											color: T.text,
										}}
									>
										{open ? (
											<ChevronDown size={18} />
										) : (
											<ChevronRight size={18} />
										)}
									</Btn>

									<span
										style={{
											width: 28,
											height: 28,
											borderRadius: '50%',
											display: 'inline-flex',
											alignItems: 'center',
											justifyContent: 'center',
											backgroundColor: open ? '#1d4ed8' : '#64748b',
											color: '#fff',
											fontSize: T.fsm,
											fontWeight: 700,
											marginRight: 4,
										}}
									>
										{m.number}
									</span>

									<span style={{ fontWeight: 700, fontSize: T.fmd }}>
										{m.heading}
									</span>

									<span
										style={{
											marginLeft: 6,
											padding: '3px 12px',
											fontSize: T.fxs,
											fontWeight: 500,
											color: T.neutral,
											backgroundColor: T.neutralBg,
											borderRadius: T.rFull,
										}}
									>
										{m.lessonCount + m.quizCount === 0
											? 'Belum ada konten'
											: [
													m.lessonCount > 0 &&
														plural(m.lessonCount, 'Lesson', 'Lessons'),
													m.quizCount > 0 &&
														plural(m.quizCount, 'Quiz', 'Quizzes'),
												]
													.filter(Boolean)
													.join(' · ')}
									</span>
									{m.unsaved && (
										<span style={{ fontSize: T.fxs, color: T.neutral }}>
											Belum disimpan
										</span>
									)}
								</div>

								<div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
									<Btn
										onClick={() => handleEditModule(m)}
										style={{
											background: 'none',
											border: 'none',
											padding: 0,
											gap: 4,
											fontSize: T.fsm,
											color: T.text,
										}}
										hoverStyle={{ color: T.primary }}
									>
										<Edit size={16} /> Edit
									</Btn>
									<Btn
										onClick={() =>
											setConfirmDelete({
												kind: 'module',
												moduleId: m.id,
												name: m.heading,
											})
										}
										style={{
											background: 'none',
											border: 'none',
											padding: 0,
											gap: 4,
											fontSize: T.fsm,
											color: T.errorText,
										}}
										hoverStyle={{ filter: 'brightness(0.85)' }}
									>
										<Trash2 size={16} /> Delete
									</Btn>
								</div>
							</div>

							{/* Isi Module */}
							{open && (
								<div
									style={{
										padding: 16,
										display: 'flex',
										flexDirection: 'column',
										gap: 8,
										backgroundColor: '#fafbfc',
									}}
								>
									{m.items.map((it) => {
										const isQuiz = it.type === 'quiz';
										const ItemIcon = isQuiz
											? HelpCircle
											: it.format === 'micro'
												? Cpu
												: BookOpen;
										const meta = isQuiz
											? `${plural(it.questions, 'Question', 'Questions')} · Pass score: ${it.passScore}%`
											: it.format === 'micro'
												? `Microlearning Unit · ~${it.minutes} mins`
												: `${it.minutes} mins · Article`;
										const key = `i-${m.id}-${it.id}`;
										return (
											<div
												key={it.id}
												{...dragProps(
													{ kind: 'item', moduleId: m.id, itemId: it.id },
													(d) => {
														if (d.kind === 'item')
															moveItem(
																d.moduleId,
																d.itemId,
																m.id,
																it.id,
															);
													},
													key,
												)}
												style={{
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'space-between',
													gap: 12,
													padding: 12,
													backgroundColor: T.card,
													borderRadius: T.rMd,
													border: `1px solid ${T.border}`,
													...overStyle(key),
												}}
											>
												<div
													style={{
														display: 'flex',
														alignItems: 'center',
														gap: 12,
														flexWrap: 'wrap',
														minWidth: 0,
													}}
												>
													<GripVertical
														size={16}
														color="#cbd5e1"
														style={{
															cursor: isSearching
																? 'default'
																: 'grab',
														}}
														aria-hidden="true"
													/>
													<div
														style={{
															width: 36,
															height: 36,
															borderRadius: T.rMd,
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															backgroundColor: isQuiz
																? '#fef3c7'
																: T.primaryTint,
															color: isQuiz ? '#d97706' : T.primary,
														}}
													>
														<ItemIcon size={18} />
													</div>
													<div
														style={{
															display: 'flex',
															alignItems: 'center',
															gap: 8,
															flexWrap: 'wrap',
														}}
													>
														<span
															style={{
																fontWeight: 600,
																fontSize: T.fsm,
															}}
														>
															{it.label} {it.title}
														</span>
														<span
															style={{
																fontSize: T.fxs,
																color: T.neutral,
															}}
														>
															· {meta}
														</span>
														{isQuiz && (
															<span
																style={{
																	padding: '3px 8px',
																	backgroundColor: '#fef3c7',
																	color: '#92400e',
																	borderRadius: T.rSm,
																	fontSize: T.fxs,
																	fontWeight: 600,
																}}
															>
																Graded
															</span>
														)}
													</div>
												</div>

												<div
													style={{
														display: 'flex',
														alignItems: 'center',
														gap: 4,
													}}
												>
													<Btn
														aria-label={`Edit ${it.label}`}
														onClick={() => handleEditItem(m, it)}
														style={{
															background: 'none',
															border: 'none',
															padding: 6,
															borderRadius: T.rSm,
															color: T.neutral,
														}}
														hoverStyle={{
															backgroundColor: T.neutralBg,
															color: T.primary,
														}}
													>
														<Edit size={16} />
													</Btn>
													<Btn
														aria-label={`Hapus ${it.label}`}
														onClick={() =>
															setConfirmDelete({
																kind: 'item',
																moduleId: m.id,
																itemId: it.id,
																name: `${it.label} ${it.title}`,
															})
														}
														style={{
															background: 'none',
															border: 'none',
															padding: 6,
															borderRadius: T.rSm,
															color: T.neutral,
														}}
														hoverStyle={{
															backgroundColor: '#fef2f2',
															color: T.errorText,
														}}
													>
														<Trash2 size={16} />
													</Btn>
												</div>
											</div>
										);
									})}

									{m.items.length === 0 && !isSearching && (
										<p
											style={{
												margin: '4px 0',
												textAlign: 'center',
												fontSize: T.fsm,
												color: T.neutral,
											}}
										>
											Module ini masih kosong.
										</p>
									)}

									{!isSearching && (
										<Btn
											onClick={() => setAddContentFor(m.id)}
											style={{
												justifyContent: 'center',
												marginTop: 8,
												padding: 14,
												border: `2px dashed ${T.primaryLine}`,
												backgroundColor: T.primarySoft,
												borderRadius: T.rMd,
												color: T.primary,
												fontWeight: 600,
												fontSize: T.fsm,
											}}
											hoverStyle={{ backgroundColor: T.primaryTint }}
										>
											<Plus size={16} /> Add Lesson / Quiz to Module{' '}
											{m.number}
										</Btn>
									)}
								</div>
							)}
						</div>
					);
				})}

				{/* Tambah Module baru */}
				{!isSearching && (
					<Btn
						onClick={() => setAddModuleOpen(true)}
						style={{
							justifyContent: 'center',
							marginTop: 8,
							padding: 16,
							border: `2px dashed ${T.border}`,
							backgroundColor: T.card,
							borderRadius: T.rLg,
							color: T.neutral,
							fontWeight: 600,
							fontSize: T.fsm,
						}}
						hoverStyle={{ borderColor: T.primaryLine, color: T.primary }}
					>
						<Plus size={16} /> Add New Module
					</Btn>
				)}
			</div>

			{/* Modal: tambah module */}
			{addModuleOpen && (
				<Modal title="Tambah Module" onClose={closeAddModule}>
					<form onSubmit={handleAddModule}>
						<label
							htmlFor="module-name"
							style={{
								display: 'block',
								marginBottom: 8,
								fontSize: T.fsm,
								fontWeight: 600,
							}}
						>
							Nama Module
						</label>
						<input
							id="module-name"
							autoFocus
							value={newModuleName}
							onChange={(e) => setNewModuleName(e.target.value)}
							placeholder="Contoh: Neural Networks"
							maxLength={120}
							style={{
								width: '100%',
								boxSizing: 'border-box',
								padding: '10px 14px',
								fontSize: T.fsm,
								fontFamily: 'inherit',
								border: `1px solid ${T.border}`,
								borderRadius: T.rMd,
								backgroundColor: '#f8fafc',
								color: T.text,
							}}
						/>
						<p style={{ margin: '8px 0 20px', fontSize: T.fxs, color: T.neutral }}>
							Deskripsi dan learning outcomes bisa diisi lewat tombol Edit setelah
							disimpan.
						</p>
						<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
							<Btn
								onClick={closeAddModule}
								style={outlineBtn}
								hoverStyle={outlineHover}
							>
								Batal
							</Btn>
							<Btn
								type="submit"
								disabled={!newModuleName.trim()}
								style={{
									padding: '8px 16px',
									backgroundColor: T.primary,
									color: T.white,
									border: 'none',
									borderRadius: T.rMd,
									fontSize: T.fsm,
									fontWeight: 600,
								}}
							>
								Tambah Module
							</Btn>
						</div>
					</form>
				</Modal>
			)}

			{/* Modal: pilih jenis konten / metode pembuatan */}
			{addContentFor != null && (
				<Modal
					title="Tambah konten ke Module"
					onClose={() => setAddContentFor(null)}
					width={520}
				>
					<p style={{ margin: '0 0 16px', fontSize: T.fsm, color: T.neutral }}>
						Pilih cara membuat materi Lesson, atau tambahkan Quiz.
					</p>
					<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
						{[
							{
								key: 'manual',
								icon: PenLine,
								title: 'Lesson — Manual',
								desc: 'Tulis materi dan pertanyaan kuis langsung di editor.',
							},
							{
								key: 'ai',
								icon: FileUp,
								title: 'Lesson — Generative AI',
								desc: 'Unggah PDF atau silabus; AI membuat draf materi dan kuis untuk Anda tinjau.',
							},
							{
								key: 'quiz',
								icon: HelpCircle,
								title: 'Quiz',
								desc: 'Buat soal, opsi jawaban, kunci jawaban, dan penjelasan.',
							},
						].map((opt) => (
							<Btn
								key={opt.key}
								onClick={() => handleAddContent(opt.key)}
								style={{
									width: '100%',
									textAlign: 'left',
									gap: 14,
									padding: 14,
									backgroundColor: T.card,
									border: `1px solid ${T.border}`,
									borderRadius: T.rMd,
									color: T.text,
								}}
								hoverStyle={{
									borderColor: T.primary,
									backgroundColor: T.primarySoft,
								}}
							>
								<span
									style={{
										width: 38,
										height: 38,
										flexShrink: 0,
										borderRadius: T.rMd,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										backgroundColor:
											opt.key === 'ai' ? '#f3e8ff' : T.primaryTint,
										color: opt.key === 'ai' ? T.purple : T.primary,
									}}
								>
									<opt.icon size={18} />
								</span>
								<span>
									<span
										style={{
											display: 'block',
											fontWeight: 600,
											fontSize: T.fsm,
										}}
									>
										{opt.title}
									</span>
									<span
										style={{
											display: 'block',
											fontSize: T.fxs,
											color: T.neutral,
											marginTop: 2,
										}}
									>
										{opt.desc}
									</span>
								</span>
							</Btn>
						))}
					</div>
				</Modal>
			)}

			{/* Modal: konfirmasi hapus */}
			{confirmDelete && (
				<Modal title="Hapus item ini?" onClose={() => setConfirmDelete(null)}>
					<p style={{ margin: '0 0 20px', fontSize: T.fsm, lineHeight: 1.5 }}>
						<strong>{confirmDelete.name}</strong>
						{confirmDelete.kind === 'module'
							? ' beserta seluruh lesson dan quiz di dalamnya akan dihapus.'
							: ' akan dihapus dari Module.'}{' '}
						Perubahan baru berlaku setelah Anda menekan Save Changes.
					</p>
					<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
						<Btn
							onClick={() => setConfirmDelete(null)}
							style={outlineBtn}
							hoverStyle={outlineHover}
						>
							Batal
						</Btn>
						<Btn
							onClick={handleConfirmDelete}
							style={{
								padding: '8px 16px',
								backgroundColor: '#dc2626',
								color: '#fff',
								border: 'none',
								borderRadius: T.rMd,
								fontSize: T.fsm,
								fontWeight: 600,
							}}
							hoverStyle={{ filter: 'brightness(0.92)' }}
						>
							<Trash2 size={16} /> Hapus
						</Btn>
					</div>
				</Modal>
			)}
		</>
	);
};

export default CurriculumTab;
