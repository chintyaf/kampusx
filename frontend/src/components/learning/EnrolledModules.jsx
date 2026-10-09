import React, { useState } from 'react';
import { Card, Row, Col, Badge, Button, ProgressBar } from 'react-bootstrap';
import { BookOpen, CheckCircle, Clock, Play, RotateCcw, Award, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockEnrolledModules } from '../../data/learningMockData';

/**
 * EnrolledModules
 * Displays list of enrolled modules with Bootstrap Nav/Tab filters:
 * "All", "In Progress", and "Completed". Includes progress bars, thumbnail, and actions.
 */
const EnrolledModules = ({ modules = mockEnrolledModules }) => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All'); // 'All' | 'in_progress' | 'completed'

  const counts = {
    All: modules.length,
    in_progress: modules.filter((m) => m.status === 'in_progress').length,
    completed: modules.filter((m) => m.status === 'completed').length,
  };

  const filteredModules = modules.filter((item) => {
    if (activeFilter === 'All') return true;
    return item.status === activeFilter;
  });

  return (
    <div className="learning-card p-3 p-md-4 mb-4">
      {/* Header and Filter Tabs */}
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-3">
        <div>
          <h3 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.25rem', letterSpacing: '-0.01em' }}>
            My Enrolled Modules
          </h3>
          <p className="text-muted small mb-0">Track your active study courses & certifications</p>
        </div>

        {/* Bootstrap Nav / Filter Tabs */}
        <div className="d-flex align-items-center enrolled-filter-tabs">
          <button
            type="button"
            className={`enrolled-tab-btn ${activeFilter === 'All' ? 'active' : ''}`}
            onClick={() => setActiveFilter('All')}
          >
            <span>All</span>
            <span className="enrolled-tab-badge">{counts.All}</span>
          </button>
          <button
            type="button"
            className={`enrolled-tab-btn ${activeFilter === 'in_progress' ? 'active' : ''}`}
            onClick={() => setActiveFilter('in_progress')}
          >
            <span>In Progress</span>
            <span className="enrolled-tab-badge">{counts.in_progress}</span>
          </button>
          <button
            type="button"
            className={`enrolled-tab-btn ${activeFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveFilter('completed')}
          >
            <span>Completed</span>
            <span className="enrolled-tab-badge">{counts.completed}</span>
          </button>
        </div>
      </div>

      {/* Modules List Grid */}
      {filteredModules.length === 0 ? (
        <div className="text-center py-5">
          <div className="text-muted mb-2">
            <BookOpen size={36} className="opacity-50" />
          </div>
          <h5 className="fw-semibold text-dark">No modules found</h5>
          <p className="text-muted small">No courses match the "{activeFilter}" filter status.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredModules.map((item) => {
            const isCompleted = item.status === 'completed';

            return (
              <div key={item.id} className="enrolled-item-card">
                <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
                  {/* Left: Thumbnail & Info */}
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="enrolled-thumb"
                      loading="lazy"
                    />

                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge bg-light text-muted border fw-normal" style={{ fontSize: '0.72rem' }}>
                          {item.category}
                        </span>
                        {isCompleted ? (
                          <span className="badge bg-success-subtle text-success fw-bold d-inline-flex align-items-center gap-1"
                                style={{ fontSize: '0.72rem', backgroundColor: '#ecfdf5', color: '#059669' }}>
                            <CheckCircle size={11} />
                            Completed
                          </span>
                        ) : (
                          <span className="badge bg-purple-subtle text-primary fw-bold"
                                style={{ fontSize: '0.72rem', backgroundColor: 'var(--primary-purple-subtle)', color: 'var(--primary-purple)' }}>
                            In Progress
                          </span>
                        )}
                      </div>

                      <h5 className="fw-bold mb-1 text-dark" style={{ fontSize: '1rem', lineHeight: 1.3 }}>
                        {item.title}
                      </h5>

                      <div className="d-flex align-items-center gap-3 text-muted" style={{ fontSize: '0.78rem' }}>
                        <span>
                          {item.completedLessons}/{item.totalLessons} lessons
                        </span>
                        <span>•</span>
                        <span className="d-flex align-items-center gap-1">
                          <Clock size={12} />
                          {item.lastStudied}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Mini Progress Bar & Action CTA */}
                  <div className="d-flex flex-row flex-sm-column align-items-end justify-content-between justify-content-sm-center gap-2" style={{ minWidth: '180px' }}>
                    <div className="w-100 text-sm-end">
                      <div className="d-flex align-items-center justify-content-between mb-1" style={{ fontSize: '0.78rem' }}>
                        <span className="text-muted">Progress</span>
                        <span className="fw-bold text-dark">{item.progress}%</span>
                      </div>
                      <div className="progress" style={{ height: '6px', borderRadius: '9999px', backgroundColor: '#e2e8f0' }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{
                            width: `${item.progress}%`,
                            backgroundColor: isCompleted ? '#10b981' : 'var(--primary-purple)',
                            borderRadius: '9999px',
                          }}
                          aria-valuenow={item.progress}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        />
                      </div>
                    </div>

                    <div className="mt-1">
                      {isCompleted ? (
                        <Button
                          variant="outline-success"
                          size="sm"
                          className="d-inline-flex align-items-center gap-1 fw-semibold rounded-pill px-3"
                          style={{ fontSize: '0.8rem' }}
                          onClick={() => navigate('/certificates')}
                        >
                          <Award size={13} />
                          <span>View Cert</span>
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          className="d-inline-flex align-items-center gap-1 fw-semibold rounded-pill px-3"
                          style={{
                            backgroundColor: 'var(--primary-purple)',
                            borderColor: 'var(--primary-purple)',
                            fontSize: '0.8rem',
                          }}
                          onClick={() => navigate(`/learner/modules/${item.id}`)}
                        >
                          <Play size={12} fill="currentColor" />
                          <span>Continue</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EnrolledModules;
