import React from 'react';
import { Calendar, Flame, Zap, Sparkles } from 'lucide-react';
import { mockUserLearningProfile } from '../../data/learningMockData';

/**
 * LearningHeader
 * Greets the learner, displays the current date, motivational quote,
 * and high-level SRL engagement badges (streak & XP).
 */
const LearningHeader = ({ user, streak, xp }) => {
	// Determine dynamic greeting based on hour of day
	const currentHour = new Date().getHours();
	let timeGreeting = 'Good morning';
	if (currentHour >= 12 && currentHour < 17) {
		timeGreeting = 'Good afternoon';
	} else if (currentHour >= 17) {
		timeGreeting = 'Good evening';
	}

	const displayName = user?.name || user?.email?.split('@')[0] || mockUserLearningProfile.name;
	const currentStreak = streak ?? mockUserLearningProfile.currentStreak;
	const currentXp = xp ?? mockUserLearningProfile.totalXp;

	// Format today's date
	const todayFormatted = new Intl.DateTimeFormat('en-US', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(new Date());

	return (
		<div
			className="mb-4"
			style={{
				fontFamily: 'var(--font)',
				color: 'var(--text)',
			}}
		>
			<div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
				{/* Left Column: Greeting & Date */}
				<div>
					<div className="d-flex align-items-center gap-2 mb-2">
						{/* Date Badge */}
						<span
							className="d-inline-flex align-items-center gap-1 rounded-pill fw-medium"
							style={{
								backgroundColor: 'var(--color-bg-2)',
								border: 'var(--border-w-xs) solid var(--neutral-border)',
								color: 'var(--text-muted)',
								fontSize: 'var(--font-xs)',
								padding: '0.35rem 0.75rem',
							}}
						>
							<Calendar size={13} style={{ color: 'var(--color-primary)' }} />
							<span>{todayFormatted}</span>
						</span>
					</div>

					{/* Motivation Quote */}
					<p
						className="fst-italic mb-0"
						style={{
							fontSize: 'var(--font-sm)',
							color: 'var(--text-muted)',
						}}
					>
						"{mockUserLearningProfile.motivationalQuote}"
					</p>
				</div>

				{/* Right Column: Gamification Pills (Streak & XP) */}
				<div className="d-flex align-items-center gap-2 flex-wrap">
					{/* Streak Pill */}
					<div
						className="d-inline-flex align-items-center gap-2 rounded-pill fw-semibold"
						title="Daily study streak maintained"
						style={{
							backgroundColor: 'var(--warning-bg)',
							border: 'var(--border-w-xs) solid var(--warning-border)',
							color: 'var(--warning-text)',
							fontSize: 'var(--font-sm)',
							padding: '0.4rem 0.85rem',
						}}
					>
						<Flame
							size={18}
							fill="currentColor"
							style={{ color: 'var(--warning-heading)' }}
						/>
						<span>{currentStreak} Days Streak</span>
					</div>

					{/* XP Pill */}
					<div
						className="d-inline-flex align-items-center gap-2 rounded-pill fw-semibold"
						title="Total experience points earned"
						style={{
							backgroundColor: 'var(--info-bg)',
							border: 'var(--border-w-xs) solid var(--info-border-color)',
							color: 'var(--info-text)',
							fontSize: 'var(--font-sm)',
							padding: '0.4rem 0.85rem',
						}}
					>
						<Zap size={18} fill="currentColor" style={{ color: 'var(--info-text)' }} />
						<span>{currentXp.toLocaleString()} XP</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LearningHeader;
