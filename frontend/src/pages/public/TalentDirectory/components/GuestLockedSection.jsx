import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react';

const GuestLockedSection = ({ previewCandidate }) => {
  return (
    <>
      <div className="talent-locked-gateway-card">
        <div className="gateway-icon-badge">
          <Lock size={26} className="text-primary" />
        </div>
        <h4 className="fw-bold text-dark mb-2">
          Masuk ke KampusX untuk Melihat 1.200+ Profil Talenta Lainnya
        </h4>
        <p className="text-muted mx-auto mb-4" style={{ maxWidth: '520px', fontSize: '13.5px' }}>
          Dapatkan akses penuh ke direktori talenta terverifikasi, verifikasi kredensial Soulbound Token (SBT) Polygon, evaluasi SRL mandiri, dan hubungi kandidat unggulan dari kampus-kampus ternama di Indonesia.
        </p>
        <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
          <Link to="/login" className="btn btn-primary rounded-pill px-4 py-2 fw-bold">
            Masuk dengan Akun KampusX
          </Link>
          <Link to="/register" className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-bold">
            Daftar Sebagai Pengguna Baru
          </Link>
        </div>
        <div className="gateway-benefits-row">
          <span>✓ 100% On-Chain Polygon Verified</span>
          <span>✓ Asesmen SRL & Skill Matrix Riil</span>
          <span>✓ Hubungi Mahasiswa Langsung (Email Terverifikasi)</span>
        </div>
      </div>

      {previewCandidate && (
        <div className="talent-card-blurred-preview position-relative">
          <div className="blurred-content-mask" />
          <div
            className="talent-card"
            style={{
              filter: 'blur(5px)',
              pointerEvents: 'none',
              userSelect: 'none',
              opacity: 0.45
            }}
          >
            <div className="talent-card-banner" />
            <div className="talent-card-body">
              <div className="talent-avatar-row">
                <div
                  className="talent-card-avatar"
                  style={{
                    backgroundColor: previewCandidate.avatarBg,
                    color: previewCandidate.avatarColor
                  }}
                >
                  {previewCandidate.initials}
                </div>
                <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: '11px' }}>
                  {previewCandidate.tier} Tier
                </span>
              </div>
              <h5 className="fw-bold mt-2 mb-1">{previewCandidate.name}</h5>
              <div className="text-muted small">
                {previewCandidate.campus} • {previewCandidate.major}
              </div>
              <p className="small text-muted mt-2">{previewCandidate.bio}</p>
              <div className="talent-card-actions mt-3">
                <button type="button" className="btn-verify-sbt">
                  <ShieldCheck size={15} /> Verify SBT On-Chain
                </button>
                <button type="button" className="btn-view-profile">
                  Lihat Profil <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GuestLockedSection;
