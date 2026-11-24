import { Badge, Card, Stack } from 'react-bootstrap';
import {
	BookOpen,
	ChevronDown,
	ChevronRight,
	Cpu,
	Edit,
	GripVertical,
	HelpCircle,
	Plus,
	Trash2,
} from 'lucide-react';
import { HoverButton } from './Buttons';
import { useNavigate } from 'react-router-dom';

const ModuleCard = ({
	module: m,
	open,
	searching,
	dnd, // { dragProps, overStyle } dari useDragAndDrop
	onToggle,
	onEdit,
	onDelete,
	onDropOnModule,
	onDropOnItem,
}) => {
	const navigate = useNavigate();

	return (
		<Card
			{...dnd.dragProps(
				{ kind: 'module', moduleId: m.id },
				(d) => onDropOnModule(m.id, d),
				`m-${m.id}`,
			)}
			style={{
				backgroundColor: 'var(--card, #ffffff)',
				borderColor: 'var(--neutral-border, #e2e8f0)',
				borderRadius: 'var(--radius-lg, 14px)',
				overflow: 'hidden',
				...dnd.overStyle(`m-${m.id}`),
				padding: '0px',
			}}
		>
			{/* Header module */}
			<Card.Header
				className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3"
				style={{
					backgroundColor: 'var(--card, #ffffff)',
					borderBottom: open ? '1px solid var(--neutral-border, #e2e8f0)' : 'none',
				}}
			>
				<Stack direction="horizontal" gap={2} className="flex-wrap" style={{ minWidth: 0 }}>
					<GripVertical
						size={18}
						color="#cbd5e1"
						style={{ cursor: searching ? 'default' : 'grab' }}
						aria-hidden="true"
					/>
					<HoverButton
						aria-label={open ? 'Ciutkan module' : 'Buka module'}
						aria-expanded={open}
						onClick={onToggle}
						disabled={searching}
						style={{
							background: 'none',
							border: 'none',
							padding: 0,
							color: 'var(--color-text, #1e293b)',
						}}
					>
						{open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
					</HoverButton>

					<span
						className="d-inline-flex align-items-center justify-content-center rounded-circle me-1"
						style={{
							width: 28,
							height: 28,
							backgroundColor: open ? '#1d4ed8' : '#64748b',
							color: '#fff',
							fontSize: 'var(--font-sm, 14px)',
							fontWeight: 700,
						}}
					>
						{m.number}
					</span>

					<span style={{ fontWeight: 700, fontSize: 'var(--font-md, 16px)' }}>
						{m.heading}
					</span>

					<Badge
						pill
						bg="light"
						className="ms-1"
						style={{
							padding: '5px 12px',
							fontSize: 'var(--font-xs, 12px)',
							fontWeight: 500,
							color: 'var(--neutral-text, #64748b)',
							backgroundColor: 'var(--neutral-bg, #f1f5f9)',
						}}
					>
						{m.lessonCount + m.quizCount === 0
							? 'Belum ada konten'
							: [
									m.lessonCount > 0 &&
										`${m.lessonCount} Lesson${m.lessonCount === 1 ? '' : 's'}`,
									m.quizCount > 0 &&
										`${m.quizCount} ${m.quizCount === 1 ? 'Quiz' : 'Quizzes'}`,
								]
									.filter(Boolean)
									.join(' · ')}
					</Badge>
					{m.unsaved && (
						<small style={{ color: 'var(--neutral-text, #64748b)' }}>
							Belum disimpan
						</small>
					)}
				</Stack>

				<Stack direction="horizontal" gap={3} className="flex-grow-0">
					<HoverButton
						onClick={onEdit}
						style={{
							background: 'none',
							border: 'none',
							padding: 0,
							gap: 4,
							fontSize: 'var(--font-sm, 14px)',
							color: 'var(--color-text, #1e293b)',
						}}
						hoverStyle={{ color: 'var(--color-primary, #006699)' }}
					>
						<Edit size={16} /> Edit
					</HoverButton>
					<HoverButton
						onClick={onDelete}
						style={{
							padding: 0,
							gap: 4,
							fontSize: 'var(--font-sm, 14px)',
							color: 'var(--error-text, #dc2626)',
						}}
						hoverStyle={{ filter: 'brightness(0.85)' }}
					>
						<Trash2 size={16} /> Delete
					</HoverButton>
				</Stack>
			</Card.Header>

			{/* Isi module */}
			{open && (
				<Card.Body
					className="d-flex flex-column gap-2 p-3"
					style={{ backgroundColor: '#fafbfc' }}
				>
					{m.items.map((it) => {
						const isQuiz = it.type === 'quiz';
						const Icon = isQuiz ? HelpCircle : it.format === 'micro' ? Cpu : BookOpen;
						return (
							<div
								key={it.id}
								{...dnd.dragProps(
									{ kind: 'item', moduleId: m.id, itemId: it.id },
									(d) => onDropOnItem(m.id, it.id, d),
									`i-${m.id}-${it.id}`,
								)}
								className="d-flex align-items-center justify-content-between gap-3"
								style={{
									padding: 12,
									backgroundColor: 'var(--card, #ffffff)',
									borderRadius: 'var(--radius-md, 10px)',
									border: '1px solid var(--neutral-border, #e2e8f0)',
									...dnd.overStyle(`i-${m.id}-${it.id}`),
								}}
							>
								<Stack
									direction="horizontal"
									gap={3}
									className="flex-wrap"
									style={{ minWidth: 0 }}
								>
									<GripVertical
										size={16}
										color="#cbd5e1"
										style={{ cursor: searching ? 'default' : 'grab' }}
										aria-hidden="true"
									/>
									<div
										className="d-flex align-items-center justify-content-center"
										style={{
											width: 36,
											height: 36,
											borderRadius: 'var(--radius-md, 10px)',
											backgroundColor: isQuiz
												? '#fef3c7'
												: 'var(--bahama-blue-100, #d9edf7)',
											color: isQuiz
												? '#d97706'
												: 'var(--color-primary, #006699)',
										}}
									>
										<Icon size={18} />
									</div>
									<Stack direction="horizontal" gap={2} className="flex-wrap">
										<span
											style={{
												fontWeight: 600,
												fontSize: 'var(--font-sm, 14px)',
											}}
										>
											{it.label} {it.title}
										</span>
										<small style={{ color: 'var(--neutral-text, #64748b)' }}>
											·{' '}
											{isQuiz
												? `${it.questions} Question${it.questions === 1 ? '' : 's'} · Pass score: ${it.passScore}%`
												: it.format === 'micro'
													? `Microlearning Unit · ~${it.minutes} mins`
													: `${it.minutes} mins · Article`}
										</small>
										{isQuiz && (
											<Badge
												bg="warning"
												style={{
													padding: '4px 8px',
													backgroundColor: '#fef3c7',
													color: '#92400e',
													borderRadius: 'var(--radius-sm, 6px)',
													fontSize: 'var(--font-xs, 12px)',
													fontWeight: 600,
												}}
											>
												Graded
											</Badge>
										)}
									</Stack>
								</Stack>
							</div>
						);
					})}

					{m.items.length === 0 && !searching && (
						<p
							className="text-center my-1"
							style={{
								fontSize: 'var(--font-sm, 14px)',
								color: 'var(--neutral-text, #64748b)',
							}}
						>
							Module ini masih kosong.
						</p>
					)}
				</Card.Body>
			)}
		</Card>
	);
};

export default ModuleCard;
