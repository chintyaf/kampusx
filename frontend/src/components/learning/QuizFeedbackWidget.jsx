import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Award, CheckCircle2, AlertCircle, ArrowRight, HelpCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockQuizFeedback } from '../../data/learningMockData';

/**
 * QuizFeedbackWidget
 * Highlights recent quiz performance, tutor/AI feedback summary,
 * key strengths demonstrated, and constructive tips for review.
 */
const QuizFeedbackWidget = ({ feedback = mockQuizFeedback }) => {
  const navigate = useNavigate();

  const {
    quizTitle = 'REST API Principles & Status Codes',
    moduleTitle = 'Web Application Architecture & REST API Design',
    score = 92,
    totalQuestions = 10,
    correctAnswers = 9,
    completedAt = '2 hours ago',
    badge = 'Mastery Passed',
    feedbackSummary = 'Excellent comprehension of idempotency and standard HTTP contracts.',
    strengths = [],
    improvementTip = '',
  } = feedback;

  return (
    <Card className="learning-card quiz-feedback-card p-4 mb-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: '32px', height: '32px', backgroundColor: '#ecfdf5', color: '#059669' }}
          >
            <Award size={16} />
          </div>
          <div>
            <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.05rem' }}>
              Recent Quiz Feedback
            </h4>
            <span className="text-muted" style={{ fontSize: '0.72rem' }}>
              Completed {completedAt}
            </span>
          </div>
        </div>

        <span className="quiz-score-badge">
          {score}/100
        </span>
      </div>

      {/* Quiz Title & Module context */}
      <div className="mb-3">
        <h5 className="fw-bold text-dark mb-1" style={{ fontSize: '0.95rem' }}>
          {quizTitle}
        </h5>
        <div className="text-muted small d-flex align-items-center gap-1">
          <FileText size={12} />
          <span className="text-truncate">{moduleTitle}</span>
        </div>
      </div>

      {/* Feedback Summary Bubble */}
      <div className="quiz-feedback-box mb-3">
        <p className="mb-0 fw-medium">
          "{feedbackSummary}"
        </p>
      </div>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="mb-3">
          <div className="fw-bold text-dark small mb-2 text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.03em' }}>
            Demonstrated Strengths
          </div>
          {strengths.map((str, idx) => (
            <div key={idx} className="strength-item">
              <CheckCircle2 size={14} className="text-success flex-shrink-0 mt-0.5" />
              <span>{str}</span>
            </div>
          ))}
        </div>
      )}

      {/* Improvement Tip */}
      {improvementTip && (
        <div className="tip-box mb-3">
          <div className="d-flex align-items-center gap-1 fw-bold mb-1 text-warning-emphasis" style={{ fontSize: '0.75rem' }}>
            <AlertCircle size={13} className="text-warning" />
            <span>Growth Recommendation</span>
          </div>
          <div style={{ fontSize: '0.78rem' }}>{improvementTip}</div>
        </div>
      )}

      {/* Action Footer */}
      <Button
        variant="outline-secondary"
        size="sm"
        className="w-100 d-inline-flex align-items-center justify-content-center gap-1.5 fw-semibold rounded-3 py-2"
        style={{ fontSize: '0.8125rem' }}
        onClick={() => navigate('/learner/modules/m1/quiz')}
      >
        <span>Review Quiz Breakdown</span>
        <ArrowRight size={14} />
      </Button>
    </Card>
  );
};

export default QuizFeedbackWidget;
