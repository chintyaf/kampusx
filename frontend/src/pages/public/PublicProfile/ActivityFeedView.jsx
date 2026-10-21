import React, { useState } from 'react';
import { Badge } from 'react-bootstrap';
import { ThumbsUp, MessageCircle, Share2, Award, ShieldCheck, Lock, LogIn } from 'lucide-react';

const ActivityFeedView = ({
  activities = [],
  authorName = 'Mahasiswa',
  authorInitials = 'KM',
  isGuest = false,
  promptLoginRequired = () => {}
}) => {
  const [likes, setLikes] = useState({});

  const toggleLike = (id) => {
    if (isGuest) {
      promptLoginRequired(
        'Berikan Dukungan Pada Mahasiswa',
        'Masuk ke akun KampusX Anda untuk memberikan apresiasi atau berkomentar pada milestone mahasiswa ini.'
      );
      return;
    }
    setLikes((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleComment = () => {
    if (isGuest) {
      promptLoginRequired(
        'Komentari Milestone Mahasiswa',
        'Fitur berdiskusi dan memberikan feedback kognitif pada postingan mahasiswa membutuhkan autentikasi akun.'
      );
      return;
    }
    alert('Kolom komentar: Silakan tulis tanggapan Anda untuk mahasiswa ini.');
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-5 bg-white rounded-4 border">
        <h6 className="fw-bold text-dark">Belum Ada Aktivitas</h6>
        <p className="text-muted small mb-0">Mahasiswa ini belum membagikan postingan atau milestone publik.</p>
      </div>
    );
  }

  const displayedActivities = isGuest ? activities.slice(0, 1) : activities;
  const lockedCount = isGuest ? Math.max(activities.length - 1, 1) : 0;

  return (
    <div>
      {displayedActivities.map((act) => (
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
            <button
              type="button"
              className="post-action-btn"
              onClick={handleComment}
            >
              <MessageCircle size={15} />
              <span>{act.comments || 3} Komentar</span>
            </button>
            <button
              type="button"
              className="post-action-btn"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Tautan postingan tersalin ke clipboard!');
              }}
            >
              <Share2 size={15} />
              <span>Bagikan</span>
            </button>
          </div>
        </div>
      ))}

      {/* LinkedIn-style Gated Lock Card untuk Aktivitas Lainnya */}
      {isGuest && (
        <div className="srl-locked-gateway-box p-4 rounded-4 mt-3 text-center border">
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#eff6ff',
              color: '#00699e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}
          >
            <Lock size={20} />
          </div>
          <h6 className="fw-bold text-dark mb-1">
            Aktivitas dan Milestone Tambahan Terkunci (+{lockedCount} Postingan Lainnya)
          </h6>
          <p className="text-muted small mx-auto mb-3" style={{ maxWidth: '460px', fontSize: '12.5px' }}>
            Masuk ke KampusX untuk membaca update riset, kontribusi open-source, dan keikutsertaan kompetisi terbaru dari mahasiswa ini.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-sm rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center gap-2"
            onClick={() =>
              promptLoginRequired(
                'Buka Seluruh Feed Aktivitas',
                'Masuk ke akun KampusX untuk membaca seluruh riwayat milestone, diskusi, dan pencapaian publik mahasiswa.'
              )
            }
          >
            <LogIn size={14} /> Masuk untuk Melihat Semua Aktivitas
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeedView;
