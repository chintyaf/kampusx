import React from 'react';
import { Card, ProgressBar } from 'react-bootstrap';
import { Sparkles, HelpCircle, Target, Zap, RotateCcw, Clock } from 'lucide-react';
import { mockLearningReadiness } from '../../data/learningMockData';

/**
 * LearningReadinessWidget
 * Visualizes the learner's Self-Regulated Learning (SRL) readiness score
 * using a modern SVG radial/circular gauge and sub-progress bars per SRL phase.
 */
const LearningReadinessWidget = ({ readiness = mockLearningReadiness }) => {
  const {
    score = 78,
    statusLabel = 'Ready to Advance',
    badgeText = 'High SRL Readiness',
    description = 'You demonstrate strong self-regulation habits.',
    subDimensions = [],
  } = readiness;

  // SVG Radial Gauge Calculations
  // Radius = 60, Circumference = 2 * PI * 60 ≈ 376.99
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getDimensionIcon = (iconName) => {
    switch (iconName) {
      case 'Target':
        return <Target size={13} className="text-primary" />;
      case 'Zap':
        return <Zap size={13} style={{ color: '#00699e' }} />;
      case 'RotateCcw':
        return <RotateCcw size={13} className="text-success" />;
      case 'Clock':
        return <Clock size={13} className="text-warning" />;
      default:
        return <Sparkles size={13} className="text-primary" />;
    }
  };

  return (
    <Card className="learning-card p-4 mb-4">
      {/* Widget Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary-purple-subtle)', color: 'var(--primary-purple)' }}
          >
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.05rem' }}>
              Learning Readiness
            </h4>
            <span className="text-muted" style={{ fontSize: '0.72rem' }}>
              SRL Diagnostic Index
            </span>
          </div>
        </div>

        <span className="badge bg-success-subtle text-success fw-bold px-2 py-1 rounded-pill" style={{ fontSize: '0.72rem' }}>
          {badgeText}
        </span>
      </div>

      {/* Circular / Radial Progress Gauge */}
      <div className="text-center my-2">
        <div className="readiness-gauge-wrapper">
          <svg className="readiness-gauge-svg" viewBox="0 0 140 140">
            <defs>
              <linearGradient id="readinessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6c5ce7" />
                <stop offset="60%" stopColor="#00cec9" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* Background Circle */}
            <circle
              className="readiness-gauge-bg"
              cx="70"
              cy="70"
              r={radius}
            />

            {/* Meter Progress Circle */}
            <circle
              className="readiness-gauge-meter"
              cx="70"
              cy="70"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>

          {/* Center Score Display */}
          <div className="readiness-score-center">
            <div className="readiness-score-number">{score}</div>
            <div className="readiness-score-label" style={{ color: '#059669' }}>
              {statusLabel}
            </div>
          </div>
        </div>
      </div>

      <p className="text-muted small text-center px-2 mb-4" style={{ fontSize: '0.8rem', lineHeight: 1.45 }}>
        {description}
      </p>

      {/* Sub-Progress Per Topic / SRL Dimension */}
      <div className="pt-3 border-top border-light">
        <div className="fw-bold text-dark small mb-3 text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
          Sub-Skill Competency Breakdown
        </div>

        <div className="d-flex flex-column gap-2.5">
          {subDimensions.map((item, index) => (
            <div key={index} className="sub-dimension-row">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="d-flex align-items-center gap-1.5 text-secondary fw-medium" style={{ fontSize: '0.78rem' }}>
                  {getDimensionIcon(item.icon)}
                  <span>{item.name}</span>
                </span>
                <span className="fw-bold text-dark" style={{ fontSize: '0.78rem' }}>
                  {item.score}%
                </span>
              </div>
              <div className="progress sub-dimension-progress" style={{ height: '6px' }}>
                <div
                  className="progress-bar sub-dimension-bar"
                  role="progressbar"
                  style={{
                    width: `${item.score}%`,
                    backgroundColor: item.color || 'var(--primary-purple)',
                  }}
                  aria-valuenow={item.score}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default LearningReadinessWidget;
