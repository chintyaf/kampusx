import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Target, Clock, CheckCircle2, Award, ArrowUpRight } from 'lucide-react';
import { mockWeeklyGoal } from '../../data/learningMockData';

/**
 * WeeklyGoalCard
 * Displays learner's weekly targets, study hours, modules completed,
 * visual progress bar, and weekly consistency breakdown.
 */
const WeeklyGoalCard = ({ data = mockWeeklyGoal }) => {
  const {
    completedModules = 3,
    targetModules = 5,
    studyHours = 6.5,
    targetHours = 10,
    progressPercent = 60,
    dailyBreakdown = [],
    weeklyMessage = '',
  } = data;

  return (
    <Card className="weekly-goal-card p-4 mb-4">
      <Card.Body className="p-0">
        {/* Top Header Row */}
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <span className="weekly-goal-badge d-inline-flex align-items-center gap-1">
              <Target size={14} />
              <span>Weekly Learning Target</span>
            </span>
            <span className="badge rounded-pill bg-white text-dark fw-bold px-2 py-1" style={{ fontSize: '0.75rem' }}>
              Week 4
            </span>
          </div>

          <div className="d-flex align-items-center gap-1 text-white-50" style={{ fontSize: '0.8125rem' }}>
            <Award size={15} className="text-warning" />
            <span className="text-white fw-semibold">Streak Bonus Active</span>
          </div>
        </div>

        {/* Title and Progress Highlights */}
        <Row className="align-items-end mb-3 g-3">
          <Col md={7}>
            <h3 className="fw-bold mb-1 text-white" style={{ fontSize: '1.4rem', letterSpacing: '-0.01em' }}>
              Keep Up The Great Pace!
            </h3>
            <p className="text-white-50 mb-0" style={{ fontSize: '0.875rem' }}>
              {weeklyMessage || 'You are making steady progress toward your self-regulated learning goals.'}
            </p>
          </Col>
          <Col md={5} className="text-md-end">
            <div className="d-inline-flex align-items-baseline gap-1">
              <span className="fw-black text-white" style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>
                {progressPercent}%
              </span>
              <span className="text-white-50 fw-semibold" style={{ fontSize: '0.9rem' }}>
                progress
              </span>
            </div>
          </Col>
        </Row>

        {/* Bootstrap Visual Progress Bar */}
        <div className="mb-4">
          <div className="progress weekly-progress-bar-container" style={{ height: '10px', background: 'rgba(255, 255, 255, 0.2)' }}>
            <div
              className="progress-bar weekly-progress-bar"
              role="progressbar"
              style={{
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, #ffffff 0%, #00cec9 100%)',
              }}
              aria-valuenow={progressPercent}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        </div>

        {/* Key Metrics Grid */}
        <Row className="g-3 mb-3">
          {/* Metric 1: Modules Completed */}
          <Col sm={6} md={4}>
            <div className="weekly-stat-box d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                style={{ width: '42px', height: '42px', background: 'rgba(255, 255, 255, 0.2)' }}
              >
                <CheckCircle2 size={22} className="text-white" />
              </div>
              <div>
                <div className="weekly-stat-value text-white">
                  {completedModules}/{targetModules}
                </div>
                <div className="weekly-stat-label">Modules Completed</div>
              </div>
            </div>
          </Col>

          {/* Metric 2: Study Hours */}
          <Col sm={6} md={4}>
            <div className="weekly-stat-box d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                style={{ width: '42px', height: '42px', background: 'rgba(255, 255, 255, 0.2)' }}
              >
                <Clock size={22} className="text-white" />
              </div>
              <div>
                <div className="weekly-stat-value text-white">
                  {studyHours}h
                </div>
                <div className="weekly-stat-label">study hours ({targetHours}h goal)</div>
              </div>
            </div>
          </Col>

          {/* Metric 3: Overall Completion */}
          <Col sm={12} md={4}>
            <div className="weekly-stat-box d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                style={{ width: '42px', height: '42px', background: 'rgba(255, 255, 255, 0.2)' }}
              >
                <ArrowUpRight size={22} className="text-white" />
              </div>
              <div>
                <div className="weekly-stat-value text-white">
                  {progressPercent}%
                </div>
                <div className="weekly-stat-label">overall progress</div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Daily Consistency Badges (Mon - Sun) */}
        {dailyBreakdown.length > 0 && (
          <div className="pt-2 border-top border-white-10 d-flex align-items-center justify-content-between flex-wrap gap-2" style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}>
            <span className="text-white-50 small fw-medium">Daily Streak Tracking:</span>
            <div className="d-flex align-items-center gap-2">
              {dailyBreakdown.map((item, idx) => (
                <div
                  key={idx}
                  className={`day-circle ${item.completed ? 'completed' : 'pending'}`}
                  title={`${item.day}: ${item.completed ? `${item.hours}h studied` : 'Not yet'}`}
                >
                  {item.day[0]}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default WeeklyGoalCard;
