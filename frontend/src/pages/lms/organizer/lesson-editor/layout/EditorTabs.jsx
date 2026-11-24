import React from 'react';
import { FileText, HelpCircle, Settings2 } from 'lucide-react';
import { Btn, Chip } from '../shared/SectionCard';
import { T } from '../utils/lessonConstants';

export const EditorTabs = ({
	tab,
	changeTab,
	quizQuestionsCount = 0,
	completeQuestions = 0,
	checklist = [],
}) => {
	const tabs = [
		{ id: 'materi', label: 'Materi', icon: FileText },
		{ id: 'kuis', label: 'Kuis', icon: HelpCircle, badge: quizQuestionsCount },
		{ id: 'pengaturan', label: 'Pengaturan', icon: Settings2 },
	];

	return (
		<div
			role="tablist"
			style={{
				display: 'flex',
				gap: 4,
				borderBottom: `1px solid ${T.border}`,
				marginBottom: 24,
				overflowX: 'auto',
			}}
		>
			{tabs.map((t) => {
				const active = tab === t.id;
				const Icon = t.icon;
				const incomplete =
					(t.id === 'materi' &&
						checklist.filter((c) => c.tab === 'materi').some((c) => !c.ok)) ||
					(t.id === 'kuis' && completeQuestions < 1) ||
					(t.id === 'pengaturan' &&
						checklist.filter((c) => c.tab === 'pengaturan').some((c) => !c.ok));
				return (
					<Btn
						key={t.id}
						role="tab"
						aria-selected={active}
						onClick={() => changeTab(t.id)}
						style={{
							background: 'none',
							border: 'none',
							borderBottom: `2px solid ${active ? T.primary : 'transparent'}`,
							marginBottom: -1,
							padding: '10px 14px',
							fontSize: T.fsm,
							fontWeight: active ? 700 : 500,
							color: active ? T.primary : T.muted,
							whiteSpace: 'nowrap',
						}}
						hoverStyle={{ color: T.primary }}
					>
						<Icon size={16} /> {t.label}
						{t.badge > 0 && (
							<Chip
								bg={active ? T.primaryTint : T.neutralBg}
								color={active ? T.primary : T.muted}
							>
								{t.badge}
							</Chip>
						)}
						{incomplete && (
							<span
								title="Belum lengkap"
								style={{
									width: 7,
									height: 7,
									borderRadius: '50%',
									background: T.warn,
								}}
							/>
						)}
					</Btn>
				);
			})}
		</div>
	);
};

export default EditorTabs;
