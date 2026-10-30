import React from 'react';
import { Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  ThumbsUp,
  MessageCircle,
  Share2,
  Sparkles
} from 'lucide-react';

const TalentSocialFeed = ({
  posts = [],
  user,
  likedPosts = {},
  onToggleLike,
  onOpenVerifyModal,
  onPromptLogin
}) => {
  const displayedPosts = user ? posts : posts.slice(0, 1);

  return (
    <div>
      {displayedPosts.map((post) => (
        <div key={post.id} className="social-post-card">
          {/* Author Row */}
          <div className="post-header">
            <div className="d-flex align-items-center gap-3">
              <div className="post-author-avatar">{post.authorInitials}</div>
              <div>
                <div className="post-author-name">{post.authorName}</div>
                <div className="post-author-meta">
                  {post.authorHeadline} • {post.timeAgo}
                </div>
              </div>
            </div>
            <Badge
              bg="success-subtle"
              className="text-success border border-success-subtle px-2 py-1"
              style={{ fontSize: '10.5px' }}
            >
              <ShieldCheck size={11} className="me-1" /> On-Chain Verified
            </Badge>
          </div>

          {/* Post Content */}
          <div className="post-content-text">{post.content}</div>

          {/* Verified Certificate Card Attachment */}
          <div className="post-cert-attachment">
            <div className="d-flex align-items-center gap-3">
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}
              >
                <Award size={22} />
              </div>
              <div>
                <div className="fw-bold text-dark" style={{ fontSize: '13px' }}>
                  {post.badgeHighlight.title}
                </div>
                <div className="text-muted" style={{ fontSize: '11px' }}>
                  Token ID: {post.badgeHighlight.tokenId} • {post.badgeHighlight.issuer}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-sm btn-outline-success rounded-pill fw-bold"
              style={{ fontSize: '11.5px', whiteSpace: 'nowrap' }}
              onClick={() => onOpenVerifyModal(post.sbtModalTarget)}
            >
              Verifikasi On-Chain
            </button>
          </div>

          {/* Action Bar: Like & Comment */}
          <div className="post-actions-bar">
            <button
              type="button"
              className={`post-action-btn ${likedPosts[post.id] ? 'liked' : ''}`}
              onClick={() => onToggleLike(post.id)}
            >
              <ThumbsUp size={15} />
              <span>
                {post.likesCount + (likedPosts[post.id] ? 1 : 0)} Dukungan
              </span>
            </button>
            <button
              type="button"
              className="post-action-btn"
              onClick={() => {
                if (!user) onPromptLogin('Masuk ke akun KampusX Anda untuk memberikan komentar dan berdiskusi di feed.');
              }}
            >
              <MessageCircle size={15} />
              <span>{post.commentsCount} Komentar</span>
            </button>
            <button
              type="button"
              className="post-action-btn"
              onClick={() => {
                if (!user) onPromptLogin('Masuk ke akun KampusX Anda untuk membagikan postingan.');
              }}
            >
              <Share2 size={15} />
              <span>Bagikan</span>
            </button>
          </div>
        </div>
      ))}

      {/* Guest Lock Card for Feed */}
      {!user && (
        <div className="feed-locked-gateway-card">
          <div className="gateway-icon-badge mb-3">
            <Sparkles size={24} className="text-primary" />
          </div>
          <h5 className="fw-bold text-dark mb-2">
            Ingin Mengikuti Diskursus & Prestasi Mahasiswa Lainnya?
          </h5>
          <p className="text-muted small mx-auto mb-3" style={{ maxWidth: '480px' }}>
            Bergabunglah dengan komunitas KampusX untuk memberikan apresiasi, berdiskusi mengenai capaian microlearning, dan berjejaring dengan ribuan talenta berbakat.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Link to="/login" className="btn btn-primary btn-sm rounded-pill px-4 py-2 fw-bold">
              Masuk Sekarang
            </Link>
            <Link to="/register" className="btn btn-outline-secondary btn-sm rounded-pill px-4 py-2 fw-bold">
              Daftar Akun
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default TalentSocialFeed;
