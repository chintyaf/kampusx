import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

/**
 * Sidebar kiri (profil mini + filter bidang) dan kanan (ticker & skill populer).
 * Pakai prop `side="left"` atau `side="right"`.
 *
 * Catatan: kartu profil mini dan widget kanan masih data statis (belum ada API-nya).
 */
const LeftSidebar = ({ user, categories, totalSkills, selectedCategory, onSelectCategory }) => (
  <div className="linkedin-left-col">
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
        <div className="user-mini-headline">Mahasiswa Teknik Informatika • Universitas Indonesia</div>
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
            to="/profile/current-user"
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
        <div className="user-mini-headline">Eksplorasi Profil & Direktori Talenta KampusX</div>
        <div className="text-center mb-3">
          <span className="badge bg-light text-muted border px-2 py-1" style={{ fontSize: '11px' }}>
            Mode Tamu Publik
          </span>
        </div>
        <div className="px-3 pb-3 text-center">
          <p className="text-muted small mb-3" style={{ fontSize: '12px', lineHeight: '1.4' }}>
            Rekruter dapat mencari talent tanpa akun. Mahasiswa: masuk untuk membangun profil talenta
            digital dan klaim kredensial Soulbound Token.
          </p>
          <Link to="/login" className="btn btn-primary btn-sm w-100 rounded-pill fw-bold mb-2" style={{ fontSize: '12px' }}>
            Masuk Sekarang
          </Link>
          <Link to="/register" className="btn btn-outline-secondary btn-sm w-100 rounded-pill fw-bold" style={{ fontSize: '12px' }}>
            Daftar Akun Baru
          </Link>
        </div>
      </div>
    )}

    {/* Filter kategori skill (menyaring pilihan skill di form pencarian) */}
    <div className="clean-card">
      <div className="filter-section-title">Bidang Spesialisasi</div>
      <div>
        <button
          type="button"
          className={`filter-pill-item ${selectedCategory === 'ALL' ? 'active' : ''}`}
          onClick={() => onSelectCategory('ALL')}
        >
          <span>Semua Bidang</span>
          <span className="badge bg-light text-muted">{totalSkills}</span>
        </button>
        {categories.map((c) => (
          <button
            key={c.name}
            type="button"
            className={`filter-pill-item ${selectedCategory === c.name ? 'active' : ''}`}
            onClick={() => onSelectCategory(c.name)}
          >
            <span>{c.name}</span>
            <span className="badge bg-light text-muted">{c.count}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

const RightSidebar = () => (
  <div className="linkedin-right-col">
    {/* Ticker (data contoh) */}
    <div className="clean-card p-3">
      <div className="d-flex align-items-center gap-2 mb-2">
        <span className="badge bg-success text-white p-1 rounded-circle" style={{ width: '8px', height: '8px', display: 'inline-block' }} />
        <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '13px' }}>Live SBT Minting Ticker</h6>
      </div>
      <p className="text-muted small mb-3">Pencatatan sertifikat real-time di ledger Polygon:</p>
      <div className="d-flex flex-column gap-2 small">
        <div className="p-2 rounded bg-light border-start border-3 border-success">
          <div className="fw-bold text-dark" style={{ fontSize: '12px' }}>Ahmad Fauzi (UGM)</div>
          <div className="text-muted" style={{ fontSize: '10.5px' }}>Minted: Data Science Specialist • Block #58,219,044</div>
        </div>
        <div className="p-2 rounded bg-light border-start border-3 border-primary">
          <div className="fw-bold text-dark" style={{ fontSize: '12px' }}>Rian Hidayat (ITB)</div>
          <div className="text-muted" style={{ fontSize: '10.5px' }}>Minted: Cloud & Microservices • Block #58,190,412</div>
        </div>
        <div className="p-2 rounded bg-light border-start border-3 border-warning">
          <div className="fw-bold text-dark" style={{ fontSize: '12px' }}>Dian Sastro (UI)</div>
          <div className="text-muted" style={{ fontSize: '10.5px' }}>Minted: UI/UX Master • Block #58,124,500</div>
        </div>
      </div>
    </div>

    {/* Keahlian paling dicari (data contoh) */}
    <div className="clean-card p-3">
      <h6 className="fw-bold mb-2 text-dark" style={{ fontSize: '13px' }}>🔥 Keahlian Paling Dicari</h6>
      <div className="d-flex flex-wrap gap-1">
        <span className="badge bg-light text-dark border p-1-5">Python (94% demand)</span>
        <span className="badge bg-light text-dark border p-1-5">React.js</span>
        <span className="badge bg-light text-dark border p-1-5">Machine Learning</span>
        <span className="badge bg-light text-dark border p-1-5">Figma UI/UX</span>
        <span className="badge bg-light text-dark border p-1-5">Smart Contract (Solidity)</span>
      </div>
    </div>
  </div>
);

const TalentSidebar = ({ side, ...props }) =>
  side === 'right' ? <RightSidebar /> : <LeftSidebar {...props} />;

export default TalentSidebar;
