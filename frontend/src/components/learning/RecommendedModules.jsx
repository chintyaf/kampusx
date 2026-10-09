import React from 'react';
import { Row, Col, Card, Badge } from 'react-bootstrap';
import { Star, Clock, BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockRecommendedModules } from '../../data/learningMockData';

/**
 * RecommendedModules
 * Renders a horizontal 3-column grid of curated microlearning modules
 * with badges (Trending, New, Popular), star ratings, duration, and lessons count.
 */
const RecommendedModules = ({ modules = mockRecommendedModules }) => {
  const navigate = useNavigate();

  // Take the first 3 items for a crisp 3-column layout (col-md-4)
  const displayModules = modules.slice(0, 3);

  return (
    <div className="mb-4">
      {/* Section Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h3 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.25rem', letterSpacing: '-0.01em' }}>
            Recommended For You
          </h3>
          <p className="text-muted small mb-0">
            Microlearning bites matched to your learning path & SRL habits
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/explore-microlearning')}
          className="btn btn-link text-decoration-none fw-semibold p-0 small d-inline-flex align-items-center gap-1"
          style={{ color: 'var(--primary-purple)' }}
        >
          <span>Explore All</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Grid horizontal 3 kolom (col-md-4 per item) */}
      <Row className="g-3">
        {displayModules.map((item) => {
          const badgeBg =
            item.badge.bg === 'primary'
              ? 'bg-primary'
              : item.badge.bg === 'danger'
              ? 'bg-danger'
              : item.badge.bg === 'success'
              ? 'bg-success'
              : 'bg-warning text-dark';

          return (
            <Col key={item.id} md={4} sm={6} className="d-flex">
              <Card
                className="learning-card module-card w-100"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/learner/modules/${item.id}`)}
              >
                {/* Thumbnail & Floating Custom Badge */}
                <div className="module-thumb-wrapper">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="module-thumb-img"
                    loading="lazy"
                  />
                  {item.badge && (
                    <span className={`badge ${badgeBg} badge-floating`}>
                      {item.badge.text}
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <Card.Body className="p-3 d-flex flex-column justify-content-between">
                  <div>
                    {/* Category & Rating */}
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="badge bg-light text-muted border fw-normal" style={{ fontSize: '0.72rem' }}>
                        {item.category}
                      </span>
                      <div className="d-flex align-items-center gap-1 text-warning fw-bold small">
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontSize: '0.78rem' }}>{item.rating}</span>
                        <span className="text-muted fw-normal" style={{ fontSize: '0.72rem' }}>
                          ({item.reviewsCount})
                        </span>
                      </div>
                    </div>

                    {/* Title (Line-Clamped for clean card height) */}
                    <h5
                      className="fw-bold mb-2 text-dark"
                      style={{
                        fontSize: '0.95rem',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        height: '2.8rem',
                      }}
                      title={item.title}
                    >
                      {item.title}
                    </h5>
                  </div>

                  {/* Footer Meta: Time, Lessons, and Difficulty */}
                  <div className="pt-2 border-top border-light d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.75rem' }}>
                      <span className="d-flex align-items-center gap-1">
                        <Clock size={12} />
                        {item.duration}
                      </span>
                      <span>•</span>
                      <span className="d-flex align-items-center gap-1">
                        <BookOpen size={12} />
                        {item.lessonsCount} lessons
                      </span>
                    </div>

                    <span className="badge bg-purple-subtle text-primary fw-semibold" style={{ fontSize: '0.7rem' }}>
                      {item.difficulty}
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default RecommendedModules;
