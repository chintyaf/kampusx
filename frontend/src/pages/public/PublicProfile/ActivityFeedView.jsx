import React, { useState } from 'react';
import { Badge } from 'react-bootstrap';
import { ThumbsUp, MessageCircle, Share2, Award, ShieldCheck } from 'lucide-react';

const ActivityFeedView = ({ activities = [], authorName = 'Mahasiswa', authorInitials = 'KM' }) => {
  const [likes, setLikes] = useState({});

  const toggleLike = (id) => {
    setLikes((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-5 bg-white rounded-4 border">
        <h6 className="fw-bold text-dark">Belum Ada Aktivitas</h6>
        <p className="text-muted small mb-0">Mahasiswa ini belum membagikan postingan atau milestone publik.</p>
      </div>
    );
  }

  return (
    <div>
      {activities.map((act) => (
        <div key={act.id} className="social-post-card">
          {/* Post Header */}
          <div className="post-header">
            <div className="d-flex align-items-center gap-3">
              <div className="post-author-avatar">{authorInitials}</div>
              <div>
                <div className="post-author-name">{authorName}</div>
                <div className="post-author-meta">{act.date} • Diposting di KampusX Hub</div>
              </div>
            </div>
            {act.isVerified && (
              <Badge bg="success-subtle" className="text-success border border-success-subtle px-2 py-1" style={{ fontSize: '10px' }}>
                <ShieldCheck size={11} className="me-1" /> On-Chain Milestone
              </Badge>
            )}
          </div>

          {/* Post Text */}
          <div className="post-content-text">{act.content}</div>

          {/* Post Attachment if any */}
          {act.attachment && (
            <div className="post-cert-attachment">
              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: '#ffffff',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                  }}
                >
                  <Award size={20} />
                </div>
                <div>
                  <div className="fw-bold text-dark small">{act.attachment.title}</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>
                    {act.attachment.meta}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Post Action Bar */}
          <div className="post-actions-bar">
            <button
              type="button"
              className={`post-action-btn ${likes[act.id] ? 'liked' : ''}`}
              onClick={() => toggleLike(act.id)}
            >
              <ThumbsUp size={15} />
              <span>{(act.likes || 12) + (likes[act.id] ? 1 : 0)} Dukungan</span>
            </button>
            <button type="button" className="post-action-btn">
              <MessageCircle size={15} />
              <span>{act.comments || 3} Komentar</span>
            </button>
            <button type="button" className="post-action-btn">
              <Share2 size={15} />
              <span>Bagikan</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeedView;
