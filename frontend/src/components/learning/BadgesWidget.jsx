import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import {
  Award,
  Bookmark,
  Flame,
  Brain,
  Sparkles,
  Download,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockBadgesAndCredentials } from '../../data/learningMockData';

/**
 * BadgesWidget
 * Shows unlocked microlearning badges (Quick Saver, Deep Thinker, 7-Day Streak)
 * and downloadable/viewable digital credentials/certificates.
 */
const BadgesWidget = ({ data = mockBadgesAndCredentials }) => {
  const navigate = useNavigate();
  const { badges = [], credentials = [] } = data;

  const renderBadgeIcon = (iconName, color) => {
    switch (iconName) {
      case 'Bookmark':
        return <Bookmark size={20} color={color} fill={color} />;
      case 'Brain':
        return <Brain size={20} color={color} />;
      case 'Flame':
        return <Flame size={20} color={color} fill={color} />;
      case 'Award':
        return <Award size={20} color={color} />;
      default:
        return <Sparkles size={20} color={color} />;
    }
  };

  return (
    <Card className="learning-card p-4 mb-4">
      {/* Widget Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: '32px', height: '32px', backgroundColor: '#fef3c7', color: '#d97706' }}
          >
            <Award size={16} />
          </div>
          <div>
            <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.05rem' }}>
              Badges & Credentials
            </h4>
            <span className="text-muted" style={{ fontSize: '0.72rem' }}>
              Microlearning Milestones
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/learner/badges')}
          className="btn btn-link text-decoration-none fw-semibold p-0 small"
          style={{ color: 'var(--primary-purple)', fontSize: '0.78rem' }}
        >
          View All ({badges.length})
        </button>
      </div>

      {/* Badges List */}
      <div className="d-flex flex-column gap-2 mb-4">
        {badges.slice(0, 3).map((b) => (
          <div key={b.id} className="badge-item-row d-flex align-items-center gap-3">
            <div
              className="badge-avatar-box"
              style={{
                backgroundColor: b.bgColor,
                border: `1.5px solid ${b.borderColor || b.color}`,
              }}
            >
              {renderBadgeIcon(b.icon, b.color)}
            </div>

            <div className="flex-grow-1 min-w-0">
              <div className="d-flex align-items-center justify-content-between gap-1">
                <span className="fw-bold text-dark small text-truncate" style={{ fontSize: '0.85rem' }}>
                  {b.name}
                </span>
                <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                  {b.unlockedAt}
                </span>
              </div>
              <p className="text-muted mb-0 text-truncate small" style={{ fontSize: '0.75rem' }} title={b.description}>
                {b.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Verified Digital Credentials Section */}
      <div className="pt-3 border-top border-light">
        <div className="d-flex align-items-center justify-content-between mb-2.5">
          <div className="fw-bold text-dark small text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
            Earned Certificates
          </div>
          <span className="badge bg-light text-muted border" style={{ fontSize: '0.7rem' }}>
            {credentials.length} Issued
          </span>
        </div>

        <div className="d-flex flex-column gap-2 mb-3">
          {credentials.map((cred) => (
            <div key={cred.id} className="credential-pill-card d-flex align-items-center justify-content-between gap-2">
              <div className="min-w-0">
                <div className="d-flex align-items-center gap-1.5 text-dark fw-bold text-truncate" style={{ fontSize: '0.8125rem' }}>
                  <ShieldCheck size={14} className="text-primary flex-shrink-0" />
                  <span className="text-truncate">{cred.title}</span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                  ID: {cred.code} • {cred.issueDate}
                </div>
              </div>

              <Button
                variant="light"
                size="sm"
                className="border p-1.5 rounded-circle flex-shrink-0 text-secondary"
                title="View Certificate"
                onClick={() => navigate('/certificates')}
              >
                <ExternalLink size={13} />
              </Button>
            </div>
          ))}
        </div>

        {/* View All Certificates CTA */}
        <Button
          variant="outline-primary"
          size="sm"
          className="w-100 d-inline-flex align-items-center justify-content-center gap-1 fw-semibold rounded-3 py-1.5"
          style={{ borderColor: 'var(--primary-purple)', color: 'var(--primary-purple)', fontSize: '0.8rem' }}
          onClick={() => navigate('/certificates')}
        >
          <Award size={14} />
          <span>My Certificate Vault</span>
          <ChevronRight size={14} />
        </Button>
      </div>
    </Card>
  );
};

export default BadgesWidget;
