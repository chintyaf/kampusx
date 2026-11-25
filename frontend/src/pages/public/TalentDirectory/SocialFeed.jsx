import React, { useState } from 'react';
import { Badge, Modal, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ThumbsUp,
  MessageCircle,
  Share2,
  Award,
  Lock
} from 'lucide-react';

const CONTRACT = '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32';

// Data contoh (belum terhubung ke API). Verifikasi SBT berasal dari subsistem lain.
const MOCK_SOCIAL_POSTS = [
  {
    id: 'p1',
    authorName: 'Ahmad Fauzi',
    authorInitials: 'AH',
    authorHeadline: 'Data Scientist & AI Enthusiast • UGM',
    timeAgo: '2 jam yang lalu',
    content:
      'Sangat bersyukur baru saja menyelesaikan modul SRL Microlearning "Python & Deep Learning Foundations" dengan passing grade 98%! Kredensial sertifikat otomatis tercetak sebagai Soulbound Token (SBT) permanen di Blockchain Polygon 🎓🚀 Terima kasih KampusX!',
    likesCount: 34,
    commentsCount: 6,
    sbt: {
      ownerName: 'Ahmad Fauzi',
      walletAddress: '0x3a4b...89fc',
      title: 'Advanced Data Science & Machine Learning Specialist',
      tokenId: '#SBT-2026-0041',
      contractAddress: CONTRACT,
      txHash: '0x94f1c8a73b22e185c899d214c718b90a61849f2b87e91402ba815349e5d4cb3c',
      block: '58,219,044',
      issuer: 'KampusX Verified Credentials'
    }
  },
  {
    id: 'p2',
    authorName: 'Rian Hidayat',
    authorInitials: 'RI',
    authorHeadline: 'Fullstack Software Engineer • ITB',
    timeAgo: '5 jam yang lalu',
    content:
      'Tim kami berhasil mengimplementasikan arsitektur Smart Contract Soulbound Token ERC-5192 untuk portofolio digital mahasiswa. Dengan verifikasi Zero-Trust on-chain, rekruter dapat langsung membuktikan keabsahan sertifikat tanpa pihak ketiga! Cek kredensial saya di bawah:',
    likesCount: 52,
    commentsCount: 11,
    sbt: {
      ownerName: 'Rian Hidayat',
      walletAddress: '0x7b12...44d9',
      title: 'Fullstack Microservices & Cloud Engineering',
      tokenId: '#SBT-2026-0082',
      contractAddress: CONTRACT,
      txHash: '0x53e1a902cbb3918a4d701e4a68291b29a674510b65f419c832e0192847aef921',
      block: '58,190,412',
      issuer: 'KampusX Verified Credentials'
    }
  },
  {
    id: 'p3',
    authorName: 'Dian Sastro',
    authorInitials: 'DI',
    authorHeadline: 'Product Designer (UI/UX) • Universitas Indonesia',
    timeAgo: '1 hari yang lalu',
    content:
      'Desain yang baik selalu berlandaskan data dan kebutuhan riil pengguna. Senang sekali bisa berbagi materi seputar Design System & UX Research di workshop KampusX kemarin! Kredensial pembicara sudah terverifikasi di Polygon Ledger.',
    likesCount: 41,
    commentsCount: 4,
    sbt: {
      ownerName: 'Dian Sastro',
      walletAddress: '0x99c4...71ab',
      title: 'Human-Centered UI/UX Master Credentials',
      tokenId: '#SBT-2026-0105',
      contractAddress: CONTRACT,
      txHash: '0x17c2f849a902eb3918d6a718c9492e85a67140b91e847192a54b38294719be1a',
      block: '58,124,500',
      issuer: 'KampusX Verified Credentials'
    }
  }
];

/**
 * Tab "Feed Prestasi & Pembelajaran" + modal verifikasi SBT + modal wajib login.
 * Interaksi (suka/komentar/bagikan) hanya untuk pengguna yang login.
 */
const SocialFeed = ({ user }) => {
  const [likedPosts, setLikedPosts] = useState({});
  const [verifySbt, setVerifySbt] = useState(null);
  const [loginMessage, setLoginMessage] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const promptLogin = (message) => {
    setLoginMessage(message);
    setShowLoginModal(true);
  };

  const toggleLike = (postId) => {
    if (!user) {
      promptLogin('Masuk ke akun KampusX Anda untuk memberikan apresiasi dan berinteraksi di Social Feed.');
      return;
    }
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const posts = user ? MOCK_SOCIAL_POSTS : MOCK_SOCIAL_POSTS.slice(0, 1);

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id} className="social-post-card">
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
            <Badge bg="success-subtle" className="text-success border border-success-subtle px-2 py-1" style={{ fontSize: '10px' }}>
              <ShieldCheck size={11} className="me-1" /> On-Chain Verified
            </Badge>
          </div>

          <div className="post-content-text">{post.content}</div>

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
                <div className="fw-bold text-dark" style={{ fontSize: '13px' }}>{post.sbt.title}</div>
                <div className="text-muted" style={{ fontSize: '11px' }}>
                  Token ID: {post.sbt.tokenId} • {post.sbt.issuer}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-success rounded-pill fw-bold"
              style={{ fontSize: '11px', whiteSpace: 'nowrap' }}
              onClick={() => setVerifySbt(post.sbt)}
            >
              Verifikasi On-Chain
            </button>
          </div>

          <div className="post-actions-bar">
            <button
              type="button"
              className={`post-action-btn ${likedPosts[post.id] ? 'liked' : ''}`}
              onClick={() => toggleLike(post.id)}
            >
              <ThumbsUp size={15} />
              <span>{post.likesCount + (likedPosts[post.id] ? 1 : 0)} Dukungan</span>
            </button>
            <button
              type="button"
              className="post-action-btn"
              onClick={() => !user && promptLogin('Masuk ke akun KampusX Anda untuk memberikan komentar dan berdiskusi di feed.')}
            >
              <MessageCircle size={15} />
              <span>{post.commentsCount} Komentar</span>
            </button>
            <button
              type="button"
              className="post-action-btn"
              onClick={() => !user && promptLogin('Masuk ke akun KampusX Anda untuk membagikan postingan.')}
            >
              <Share2 size={15} />
              <span>Bagikan</span>
            </button>
          </div>
        </div>
      ))}

      {!user && (
        <div className="feed-locked-gateway-card">
          <div className="gateway-icon-badge mb-3">
            <Sparkles size={24} className="text-primary" />
          </div>
          <h5 className="fw-bold text-dark mb-2">Ingin Mengikuti Diskursus & Prestasi Mahasiswa Lainnya?</h5>
          <p className="text-muted small mx-auto mb-3" style={{ maxWidth: '480px' }}>
            Bergabunglah dengan komunitas KampusX untuk memberikan dukungan, berdiskusi mengenai capaian microlearning, dan berjejaring dengan ribuan talenta muda berbakat.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Link to="/login" className="btn btn-primary btn-sm rounded-pill px-4 py-2 fw-bold">Masuk Sekarang</Link>
            <Link to="/register" className="btn btn-outline-secondary btn-sm rounded-pill px-4 py-2 fw-bold">Daftar Akun</Link>
          </div>
        </div>
      )}

      {/* ==================== MODAL VERIFIKASI SBT ==================== */}
      <Modal
        show={!!verifySbt}
        onHide={() => setVerifySbt(null)}
        centered
        contentClassName="border-0 shadow-lg"
        style={{ borderRadius: '24px' }}
      >
        <Modal.Body className="p-4 text-center">
          <div className="modal-trust-badge">
            <CheckCircle2 size={36} />
          </div>
          <h5 className="fw-bold text-dark mb-1">Zero-Trust Blockchain Verification</h5>
          <p className="text-muted small mb-4">
            Keaslian sertifikat kredensial ini tervalidasi sah on-chain di Polygon Ledger.
          </p>

          {verifySbt && (
            <div className="text-start bg-light rounded-3 p-3 mb-4">
              <div className="chain-info-row">
                <span className="chain-info-label">Nama Pemilik:</span>
                <span className="fw-bold text-dark">{verifySbt.ownerName}</span>
              </div>
              <div className="chain-info-row">
                <span className="chain-info-label">Kredensial:</span>
                <span className="fw-bold text-primary">{verifySbt.title}</span>
              </div>
              <div className="chain-info-row">
                <span className="chain-info-label">Standar Token:</span>
                <span className="badge bg-success-subtle text-success border border-success-subtle">
                  ERC-5192 (Soulbound / Non-Transferable)
                </span>
              </div>
              <div className="chain-info-row">
                <span className="chain-info-label">Token ID:</span>
                <span className="chain-info-val">{verifySbt.tokenId}</span>
              </div>
              <div className="chain-info-row">
                <span className="chain-info-label">Smart Contract:</span>
                <span className="chain-info-val text-truncate" style={{ maxWidth: '200px' }}>{verifySbt.contractAddress}</span>
              </div>
              <div className="chain-info-row">
                <span className="chain-info-label">Wallet Pemilik:</span>
                <span className="chain-info-val">{verifySbt.walletAddress}</span>
              </div>
              <div className="chain-info-row">
                <span className="chain-info-label">Transaction Hash:</span>
                <span className="chain-info-val text-truncate" style={{ maxWidth: '200px' }}>{verifySbt.txHash}</span>
              </div>
              <div className="chain-info-row">
                <span className="chain-info-label">Block Height:</span>
                <span className="chain-info-val">#{verifySbt.block}</span>
              </div>
            </div>
          )}

          <div className="d-flex gap-2">
            <Button variant="outline-secondary" className="w-100 rounded-pill py-2" onClick={() => setVerifySbt(null)}>
              Tutup
            </Button>
            <Button
              variant="dark"
              className="w-100 rounded-pill py-2 d-flex align-items-center justify-content-center gap-2"
              onClick={() => window.open('https://polygonscan.com', '_blank')}
            >
              Cek di Polygonscan <ExternalLink size={14} />
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* ==================== MODAL WAJIB LOGIN ==================== */}
      <Modal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        centered
        contentClassName="border-0 shadow-lg"
        style={{ borderRadius: '24px' }}
      >
        <Modal.Body className="p-4 text-center">
          <div className="modal-lock-badge mb-3">
            <Lock size={30} className="text-primary" />
          </div>
          <h5 className="fw-bold text-dark mb-2">Akses Khusus Pengguna Terdaftar</h5>
          <p className="text-muted small mb-4">{loginMessage}</p>
          <div className="d-flex flex-column gap-2 mb-3">
            <Link to="/login" className="btn btn-primary rounded-pill py-2 fw-bold">Masuk ke Akun Anda</Link>
            <Link to="/register" className="btn btn-outline-secondary rounded-pill py-2 fw-bold">Daftar Akun Baru (Gratis)</Link>
          </div>
          <button type="button" className="btn btn-link text-muted small text-decoration-none" onClick={() => setShowLoginModal(false)}>
            Tutup
          </button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SocialFeed;
