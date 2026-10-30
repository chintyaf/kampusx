import React from 'react';
import { Link } from 'react-router-dom';
import { User, ShieldCheck } from 'lucide-react';

const TalentLeftSidebar = ({
  user,
  selectedRole,
  onSelectRole,
  roleCounts = {}
}) => {
  return (
    <div className="linkedin-left-col">
      {/* User Mini Profile (LinkedIn Style) */}
      {user ? (
        <div className="clean-card">
          <div className="user-mini-profile-banner" />
          <div className="user-mini-avatar">
            {user.name
              ? user.name
                  .split(' ')
                  .filter(Boolean)
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()
              : 'KM'}
          </div>
          <div className="user-mini-name">Kamu ({user.name || 'Budi Pratama'})</div>
          <div className="user-mini-headline">
            Mahasiswa Teknik Informatika • Universitas Indonesia
          </div>
          <div className="text-center mb-3">
            <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: '11px' }}>
              🥈 Silver Tier
            </span>
          </div>

          <div className="user-mini-stats-row">
            <span>Total Poin Global</span>
            <span className="user-mini-stats-val">2,450 pts</span>
          </div>
          <div className="user-mini-stats-row">
            <span>SBT Terverifikasi</span>
            <span className="user-mini-stats-val">2 Kredensial</span>
          </div>
          <div className="p-3 text-center border-top">
            <Link
              to="/profile/2"
              className="btn btn-outline-primary btn-sm w-100 rounded-pill fw-bold"
              style={{ fontSize: '12px' }}
            >
              Lihat Profil Saya
            </Link>
          </div>
        </div>
      ) : (
        <div className="clean-card">
          <div className="user-mini-profile-banner guest-profile-banner" />
          <div className="user-mini-avatar guest-mini-avatar">
            <User size={26} />
          </div>
          <div className="user-mini-name">Tamu / Pengunjung</div>
          <div className="user-mini-headline">
            Eksplorasi Profil & Direktori Talenta KampusX
          </div>
          <div className="text-center mb-3">
            <span className="badge bg-light text-muted border px-2 py-1" style={{ fontSize: '11px' }}>
              Mode Tamu Publik
            </span>
          </div>

          <div className="px-3 pb-3 text-center">
            <p className="text-muted small mb-3" style={{ fontSize: '12px', lineHeight: '1.4' }}>
              Masuk untuk membangun profil talenta digital Anda, klaim kredensial Soulbound Token, dan membuka akses komunikasi dengan rekruter.
            </p>
            <Link
              to="/login"
              className="btn btn-primary btn-sm w-100 rounded-pill fw-bold mb-2"
              style={{ fontSize: '12px' }}
            >
              Masuk Sekarang
            </Link>
            <Link
              to="/register"
              className="btn btn-outline-secondary btn-sm w-100 rounded-pill fw-bold"
              style={{ fontSize: '12px' }}
            >
              Daftar Akun Baru
            </Link>
          </div>
        </div>
      )}

      {/* Specialization Filter Card */}
      <div className="clean-card">
        <div className="filter-section-title">Bidang Spesialisasi</div>
        <div>
          <button
            type="button"
            className={`filter-pill-item ${selectedRole === 'ALL' ? 'active' : ''}`}
            onClick={() => onSelectRole('ALL')}
          >
            <span>Semua Bidang</span>
            <span className="badge bg-light text-muted">{roleCounts.ALL || 6}</span>
          </button>
          <button
            type="button"
            className={`filter-pill-item ${selectedRole === 'DATA' ? 'active' : ''}`}
            onClick={() => onSelectRole('DATA')}
          >
            <span>Data Science & AI</span>
            <span className="badge bg-light text-muted">{roleCounts.DATA || 2}</span>
          </button>
          <button
            type="button"
            className={`filter-pill-item ${selectedRole === 'ENGINEERING' ? 'active' : ''}`}
            onClick={() => onSelectRole('ENGINEERING')}
          >
            <span>Software Engineering</span>
            <span className="badge bg-light text-muted">{roleCounts.ENGINEERING || 2}</span>
          </button>
          <button
            type="button"
            className={`filter-pill-item ${selectedRole === 'DESIGN' ? 'active' : ''}`}
            onClick={() => onSelectRole('DESIGN')}
          >
            <span>UI/UX Product Design</span>
            <span className="badge bg-light text-muted">{roleCounts.DESIGN || 2}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TalentLeftSidebar;
