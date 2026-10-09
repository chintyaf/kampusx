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
    <div className="learning-header mb-4">
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
        {/* Left Column: Greeting & Date */}
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="date-badge">
              <Calendar size={13} className="text-primary" />
              <span>{todayFormatted}</span>
            </span>
            <span className="badge bg-purple-subtle text-primary fw-semibold d-none d-sm-inline-flex align-items-center gap-1"
                  style={{ backgroundColor: 'var(--primary-purple-subtle)', color: 'var(--primary-purple)', fontSize: '0.75rem', padding: '0.35rem 0.65rem', borderRadius: '9999px' }}>
              <Sparkles size={12} />
              <span>Microlearning</span>
            </span>
          </div>

          <h1 className="greeting-title mb-1">
            {timeGreeting}, {displayName} 👋
          </h1>
          <p className="motivation-quote mb-0">
            {mockUserLearningProfile.motivationalQuote}
          </p>
        </div>

        {/* Right Column: Gamification Pills (Streak & XP) */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="streak-pill" title="Daily study streak maintained">
            <Flame size={18} fill="#f97316" color="#ea580c" />
            <span>{currentStreak} Days Streak</span>
          </div>

          <div className="xp-pill" title="Total experience points earned">
            <Zap size={18} fill="#3b82f6" color="#2563eb" />
            <span>{currentXp.toLocaleString()} XP</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningHeader;
