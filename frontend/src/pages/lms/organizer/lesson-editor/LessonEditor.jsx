import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';

// Layout components
import EditorLayout from './layout/EditorLayout';
import EditorSidebar from './layout/EditorSidebar';
import EditorTopbar from './layout/EditorTopbar';
import EditorTabs from './layout/EditorTabs';
import EditorFooter from './layout/EditorFooter';

// Tab domain components
import MateriEditor from './materi/MateriEditor';
import KuisEditor from './kuis/KuisEditor';
import LessonSettings from './pengaturan/LessonSettings';

// Shared components & modals
import ConfirmNavigationModal from './shared/ConfirmNavigationModal';

// Constants & Helpers
import {
	T,
	LETTERS,
	MAX_OPTIONS,
	TAB_ALIASES,
	MODULES_DB,
	LESSONS_DB,
} from './utils/lessonConstants';
import {
	uid,
	makeOption,
	makeQuestion,
	makeBlank,
	wordCount,
	questionComplete,
	formatSize,
	useMediaQuery,
} from './utils/lessonHelpers';

export const LessonEditor = ({
	learningId: propLearningId,
	moduleId: propModuleId,
	lessonId: propLessonId,
}) => {
	const params = useParams();
	const learningId = propLearningId || params.learningId || '1';
	const moduleId = propModuleId || params.moduleId || '1';
	const lessonId = propLessonId || params.lessonId || 'new';

	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();
	const isNarrow = useMediaQuery('(max-width: 960px)');
	const isStacked = useMediaQuery('(max-width: 720px)');

	const isNew = lessonId === 'new';
	const moduleInfo = MODULES_DB[moduleId] || {
		number: moduleId,
		name: `Module ${moduleId}`,
		items: [],
	};

	// ---- struktur module (sidebar) ----
	const [items, setItems] = useState(() => [...moduleInfo.items]);
	const currentItem = items.find((it) => it.id === lessonId);
	const kind = currentItem
		? currentItem.type
		: TAB_ALIASES[searchParams.get('tab')] === 'kuis'
			? 'quiz'
			: 'lesson';

	// ---- data lesson ----
	const [lesson, setLesson] = useState(() => {
		const base = LESSONS_DB[lessonId];
		if (base) return JSON.parse(JSON.stringify(base));
		return makeBlank(currentItem ? currentItem.title : '');
	});
	const [snapshot, setSnapshot] = useState(() => JSON.stringify(lesson));
	const dirty = JSON.stringify(lesson) !== snapshot;

	// ---- UI state ----
	const [tab, setTab] = useState(
		TAB_ALIASES[searchParams.get('tab')] || (kind === 'quiz' ? 'kuis' : 'materi'),
	);
	const [editorMode, setEditorMode] = useState('edit'); // edit | split | preview
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [saving, setSaving] = useState(false);
	const [toast, setToast] = useState(
		location.state?.saved ? { type: 'success', message: 'Lesson baru berhasil dibuat.' } : null,
	);
	const [pendingNav, setPendingNav] = useState(null);
	const [openQ, setOpenQ] = useState(() => {
		const first = lesson.quiz.questions[0];
		return first ? { [first.id]: true } : {};
	});

	const bodyRef = useRef(null);
	const titleRef = useRef(null);

	const showToast = (message, type = 'success') => setToast({ message, type });
	useEffect(() => {
		if (!toast) return;
		const t = setTimeout(() => setToast(null), 3000);
		return () => clearTimeout(t);
	}, [toast]);

	// Peringatan tutup tab browser saat dirty
	useEffect(() => {
		if (!dirty) return;
		const handler = (e) => {
			e.preventDefault();
			e.returnValue = '';
		};
		window.addEventListener('beforeunload', handler);
		return () => window.removeEventListener('beforeunload', handler);
	}, [dirty]);

	const update = (patch) => setLesson((l) => ({ ...l, ...patch }));
	const updateQuiz = (patch) => setLesson((l) => ({ ...l, quiz: { ...l.quiz, ...patch } }));
	const updateQuestion = (qid, patch) =>
		setLesson((l) => ({
			...l,
			quiz: {
				...l.quiz,
				questions: l.quiz.questions.map((q) => (q.id === qid ? { ...q, ...patch } : q)),
			},
		}));

	const changeTab = (id) => {
		setTab(id);
		setSearchParams(
			(prev) => {
				const n = new URLSearchParams(prev);
				n.set('tab', id);
				return n;
			},
			{ replace: true },
		);
	};

	// ---- penomoran & navigasi antar lesson ----
	const numbered = useMemo(() => {
		let l = 0;
		let q = 0;
		return items.map((it) => {
			const isQuiz = it.type === 'quiz';
			const no = isQuiz ? ++q : ++l;
			return {
				...it,
				label: `${isQuiz ? 'Quiz' : 'Lesson'} ${moduleInfo.number}.${no}`,
			};
		});
	}, [items, moduleInfo.number]);

	const currentIndex = numbered.findIndex((it) => it.id === lessonId);
	const prevItem =
		currentIndex > 0
			? numbered[currentIndex - 1]
			: isNew
				? numbered[numbered.length - 1]
				: null;
	const nextItem =
		currentIndex >= 0 && currentIndex < numbered.length - 1 ? numbered[currentIndex + 1] : null;
	const currentLabel =
		currentIndex >= 0
			? numbered[currentIndex].label
			: kind === 'quiz'
				? 'Quiz baru'
				: 'Lesson baru';

	const base = `/organizer/learning-path/${learningId}`;
	const pathTo = (item) =>
		`${base}/edit-module/${moduleId}/${item.id}${item.type === 'quiz' ? '?tab=quiz' : ''}`;
	const pathModule = `${base}/edit-module/${moduleId}`;
	const pathNew = (type) =>
		`${base}/edit-module/${moduleId}/new?${type === 'quiz' ? 'tab=quiz' : 'method=manual'}`;

	const requestNav = (href) => {
		if (dirty) setPendingNav(href);
		else navigate(href);
	};

	// ---- checklist kelengkapan ----
	const words = wordCount(lesson.body);
	const completeQuestions = lesson.quiz.questions.filter(questionComplete).length;
	const checklist = [
		{ key: 'title', label: 'Judul lesson', ok: !!lesson.title.trim(), tab: 'materi' },
		{
			key: 'body',
			label: 'Isi materi (min. 30 kata)',
			ok: words >= 30,
			tab: 'materi',
		},
		{
			key: 'quiz',
			label: 'Min. 1 soal kuis lengkap',
			ok: completeQuestions >= 1,
			tab: 'kuis',
		},
		{ key: 'duration', label: 'Estimasi durasi > 0', ok: lesson.duration > 0, tab: 'pengaturan' },
	];
	const doneCount = checklist.filter((c) => c.ok).length;
	const allDone = doneCount === checklist.length;

	// ---- simpan ----
	const save = async ({ then: nextUrl } = {}) => {
		if (!lesson.title.trim()) {
			showToast('Judul lesson wajib diisi.', 'error');
			changeTab('materi');
			titleRef.current?.focus();
			return false;
		}
		setSaving(true);
		try {
			await new Promise((r) => setTimeout(r, 450));
			if (isNew) {
				const newId = `l${Date.now()}`;
				const newItem = {
					id: newId,
					type: kind === 'quiz' ? 'quiz' : 'lesson',
					title: lesson.title.trim(),
					minutes: lesson.duration,
					status: lesson.status,
				};
				setItems((its) => [...its, newItem]);
				showToast(
					kind === 'quiz' ? 'Quiz baru berhasil dibuat.' : 'Lesson baru berhasil dibuat.',
				);
				setSnapshot(JSON.stringify(lesson));
				navigate(nextUrl || pathTo(newItem), { replace: true, state: { saved: true } });
				return true;
			}
			setItems((its) =>
				its.map((it) =>
					it.id === lessonId
						? {
								...it,
								title: lesson.title.trim(),
								minutes: lesson.duration,
								status: lesson.status,
							}
						: it,
				),
			);
			setSnapshot(JSON.stringify(lesson));
			showToast('Perubahan berhasil disimpan.');
			if (nextUrl) navigate(nextUrl);
			return true;
		} catch {
			showToast('Gagal menyimpan lesson. Coba lagi.', 'error');
			return false;
		} finally {
			setSaving(false);
		}
	};

	// Pintasan keyboard: Ctrl/Cmd + S
	useEffect(() => {
		const onKey = (e) => {
			if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
				e.preventDefault();
				save();
			}
			if (e.altKey && e.key === 'ArrowLeft' && prevItem) {
				e.preventDefault();
				requestNav(pathTo(prevItem));
			}
			if (e.altKey && e.key === 'ArrowRight' && nextItem) {
				e.preventDefault();
				requestNav(pathTo(nextItem));
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	// ---- toolbar markdown ----
	const applyFormat = (prefix, suffix = '', placeholder = '', lineMode = false) => {
		const el = bodyRef.current;
		if (!el) return;
		const start = el.selectionStart;
		const end = el.selectionEnd;
		const val = el.value;
		const sel = val.slice(start, end);

		let next;
		let cursor;
		if (lineMode) {
			const lineStart = val.lastIndexOf('\n', start - 1) + 1;
			const target = sel || placeholder;
			next = val.slice(0, lineStart) + prefix + target + suffix + val.slice(end);
			cursor = lineStart + prefix.length + target.length;
		} else {
			const text = sel || placeholder;
			next = val.slice(0, start) + prefix + text + suffix + val.slice(end);
			cursor = start + prefix.length + (sel ? text.length + suffix.length : text.length);
		}

		update({ body: next });
		setTimeout(() => {
			el.focus();
			el.setSelectionRange(
				sel ? cursor : start + prefix.length,
				sel ? cursor : start + prefix.length + placeholder.length,
			);
		}, 0);
	};

	const onBodyKeyDown = (e) => {
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
			e.preventDefault();
			applyFormat('**', '**', 'teks tebal');
		} else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
			e.preventDefault();
			applyFormat('*', '*', 'teks miring');
		} else if (e.key === 'Tab') {
			e.preventDefault();
			applyFormat('  ', '', '');
		}
	};

	// ---- lampiran ----
	const handleFiles = (files) => {
		const mapped = files.map((f) => ({
			id: uid(),
			name: f.name,
			size: formatSize(f.size),
		}));
		update({ attachments: [...lesson.attachments, ...mapped] });
	};

	const removeAttachment = (id) => {
		update({ attachments: lesson.attachments.filter((a) => a.id !== id) });
	};

	// ---- tag ----
	const addTag = (text) => {
		const t = text.trim();
		if (!t) return;
		if (lesson.tags.some((x) => x.toLowerCase() === t.toLowerCase())) return;
		update({ tags: [...lesson.tags, t] });
	};

	const removeTag = (tag) => {
		update({ tags: lesson.tags.filter((t) => t !== tag) });
	};

	// ---- kuis ----
	const addQuestion = () => {
		const q = makeQuestion();
		setLesson((l) => ({
			...l,
			quiz: { ...l.quiz, questions: [...l.quiz.questions, q] },
		}));
		setOpenQ((o) => ({ ...o, [q.id]: true }));
	};

	const removeQuestion = (id) => {
		setLesson((l) => ({
			...l,
			quiz: {
				...l.quiz,
				questions: l.quiz.questions.filter((q) => q.id !== id),
			},
		}));
	};

	const duplicateQuestion = (q) => {
		const clone = {
			...q,
			id: uid(),
			options: q.options.map((o) => ({ ...o, id: uid() })),
		};
		setLesson((l) => ({
			...l,
			quiz: { ...l.quiz, questions: [...l.quiz.questions, clone] },
		}));
		setOpenQ((o) => ({ ...o, [clone.id]: true }));
	};

	const moveQuestion = (id, delta) => {
		setLesson((l) => {
			const qs = [...l.quiz.questions];
			const i = qs.findIndex((q) => q.id === id);
			const target = i + delta;
			if (target < 0 || target >= qs.length) return l;
			const [moved] = qs.splice(i, 1);
			qs.splice(target, 0, moved);
			return { ...l, quiz: { ...l.quiz, questions: qs } };
		});
	};

	const setOptionText = (q, oid, text) => {
		updateQuestion(q.id, {
			options: q.options.map((o) => (o.id === oid ? { ...o, text } : o)),
		});
	};

	const addOption = (q) => {
		if (q.options.length >= MAX_OPTIONS) return;
		updateQuestion(q.id, { options: [...q.options, makeOption()] });
	};

	const removeOption = (q, oid) => {
		if (q.options.length <= 2) return;
		updateQuestion(q.id, {
			options: q.options.filter((o) => o.id !== oid),
			correct: q.correct === oid ? null : q.correct,
		});
	};

	return (
		<EditorLayout
			isNarrow={isNarrow}
			drawerOpen={drawerOpen}
			setDrawerOpen={setDrawerOpen}
			sidebar={
				<EditorSidebar
					moduleInfo={moduleInfo}
					items={items}
					numbered={numbered}
					lessonId={lessonId}
					lesson={lesson}
					dirty={dirty}
					isNew={isNew}
					currentLabel={currentLabel}
					checklist={checklist}
					pathTo={pathTo}
					pathModule={pathModule}
					pathNew={pathNew}
					requestNav={requestNav}
					changeTab={changeTab}
					setDrawerOpen={setDrawerOpen}
					isNarrow={isNarrow}
				/>
			}
			topBar={
				<EditorTopbar
					isNarrow={isNarrow}
					setDrawerOpen={setDrawerOpen}
					base={base}
					pathModule={pathModule}
					moduleInfo={moduleInfo}
					currentLabel={currentLabel}
					dirty={dirty}
					saving={saving}
					isNew={isNew}
					prevItem={prevItem}
					nextItem={nextItem}
					pathTo={pathTo}
					requestNav={requestNav}
					save={save}
					currentIndex={currentIndex}
					totalItems={items.length}
				/>
			}
			tabBar={
				<EditorTabs
					tab={tab}
					changeTab={changeTab}
					quizQuestionsCount={lesson.quiz.questions.length}
					completeQuestions={completeQuestions}
					checklist={checklist}
				/>
			}
			tab={tab}
			editorMode={editorMode}
			kind={kind}
			currentLabel={currentLabel}
			moduleInfo={moduleInfo}
			lesson={lesson}
			footer={
				<EditorFooter
					prevItem={prevItem}
					nextItem={nextItem}
					pathTo={pathTo}
					pathModule={pathModule}
					requestNav={requestNav}
					save={save}
					saving={saving}
				/>
			}
			toast={toast}
		>
			{tab === 'materi' && (
				<MateriEditor
					kind={kind}
					lesson={lesson}
					onUpdate={update}
					titleRef={titleRef}
					bodyRef={bodyRef}
					editorMode={editorMode}
					setEditorMode={setEditorMode}
					isStacked={isStacked}
					onBodyKeyDown={onBodyKeyDown}
					onFormat={applyFormat}
					words={words}
					moduleName={moduleInfo.name}
					onFilesAdded={handleFiles}
					onRemoveAttachment={removeAttachment}
				/>
			)}

			{tab === 'kuis' && (
				<KuisEditor
					quiz={lesson.quiz}
					onUpdateQuiz={updateQuiz}
					isStacked={isStacked}
					completeQuestions={completeQuestions}
					openQ={openQ}
					onToggleOpenQ={(qid) => setOpenQ((o) => ({ ...o, [qid]: !o[qid] }))}
					onAddQuestion={addQuestion}
					onMoveQuestion={moveQuestion}
					onDuplicateQuestion={duplicateQuestion}
					onRemoveQuestion={removeQuestion}
					onUpdateQuestion={updateQuestion}
					onSetOptionText={setOptionText}
					onAddOption={addOption}
					onRemoveOption={removeOption}
				/>
			)}

			{tab === 'pengaturan' && (
				<LessonSettings
					lesson={lesson}
					onUpdate={update}
					words={words}
					isStacked={isStacked}
					allDone={allDone}
					doneCount={doneCount}
					totalChecklist={checklist.length}
					onAddTag={addTag}
					onRemoveTag={removeTag}
				/>
			)}

			<ConfirmNavigationModal
				isOpen={!!pendingNav}
				currentLabel={currentLabel}
				onCancel={() => setPendingNav(null)}
				onDiscard={() => {
					const href = pendingNav;
					setPendingNav(null);
					setSnapshot(JSON.stringify(lesson));
					setTimeout(() => navigate(href), 0);
				}}
				onSaveAndNav={async () => {
					const href = pendingNav;
					setPendingNav(null);
					await save({ then: href });
				}}
			/>
		</EditorLayout>
	);
};

export default LessonEditor;
