import React from 'react';
import { Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { Users, ShieldCheck, Briefcase, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import CandidateCard from '../components/CandidateCard';

/**
 * View DashboardOverviewView
 * Ringkasan metrik statistik talenta recruiter dan daftar kandidat unggulan terkini
 */
const DashboardOverviewView = ({
  stats = {},
  recentCandidates = [],
  onNavigateTab,
  onViewProfile,
  onVerifySbt,
}) => {
  return (
    <div className="dashboard-overview-view">
      {/* 4 KPI Metrics Row */}
      <Row className="g-3 mb-4">
        <Col sm={6} lg={3}>
          <div className="clean-card p-3 p-md-3-5 h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Total Kandidat</span>
              <div className="p-2 bg-primary-subtle text-primary rounded-3">
                <Users size={18} />
              </div>
            </div>
            <h3 className="fw-bold text-dark mb-0">{stats.total_candidates || 0}</h3>
            <span className="text-muted small" style={{ fontSize: '11px' }}>
              Mahasiswa terdaftar aktif
            </span>
          </div>
        </Col>

        <Col sm={6} lg={3}>
          <div className="clean-card p-3 p-md-3-5 h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Kredensial SBT</span>
              <div className="p-2 bg-success-subtle text-success rounded-3">
                <ShieldCheck size={18} />
              </div>
            </div>
            <h3 className="fw-bold text-success mb-0">{stats.total_verified_credentials || 0}</h3>
            <span className="text-muted small" style={{ fontSize: '11px' }}>
              Terverifikasi di ledger Polygon
            </span>
          </div>
        </Col>

        <Col sm={6} lg={3}>
          <div className="clean-card p-3 p-md-3-5 h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Mitra Industri</span>
              <div className="p-2 bg-info-subtle text-info rounded-3">
                <Briefcase size={18} />
              </div>
            </div>
            <h3 className="fw-bold text-dark mb-0">{stats.active_industry_partners || 18}</h3>
            <span className="text-muted small" style={{ fontSize: '11px' }}>
              Perusahaan & hiring partner
            </span>
          </div>
        </Col>

        <Col sm={6} lg={3}>
          <div className="clean-card p-3 p-md-3-5 h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Rata-rata Match</span>
              <div className="p-2 bg-warning-subtle text-warning-emphasis rounded-3">
                <Sparkles size={18} />
              </div>
            </div>
            <h3 className="fw-bold text-dark mb-0">{stats.match_rate_average || '89.4%'}</h3>
            <span className="text-muted small" style={{ fontSize: '11px' }}>
              Akurasi Cosine Similarity
            </span>
          </div>
        </Col>
      </Row>

      {/* Quick Discovery CTA Card */}
      <div className="clean-card p-4 mb-4 bg-white border">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">
              Temukan Mahasiswa Berkualitas Tinggi dengan SBT
            </h5>
            <p className="text-muted small mb-0" style={{ maxWidth: '580px' }}>
              Gunakan Vector Skill-Matrix dan Cosine Similarity untuk membandingkan kebutuhan spesifikasi lowongan dengan portofolio terverifikasi mahasiswa.
            </p>
          </div>
          <div className="d-flex gap-2 flex-shrink-0">
            <Button
              variant="outline-primary"
              className="rounded-pill px-3 py-2 fw-semibold"
              style={{ fontSize: '13px' }}
              onClick={() => onNavigateTab && onNavigateTab('matching')}
            >
              <Sparkles size={14} className="me-1" /> Kriteria Lowongan
            </Button>
            <Button
              variant="primary"
              className="rounded-pill px-3-5 py-2 fw-bold shadow-sm"
              style={{ fontSize: '13px' }}
              onClick={() => onNavigateTab && onNavigateTab('directory')}
            >
              Buka Direktori Talenta <ArrowRight size={14} className="ms-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Recent High Achievers Section */}
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h6 className="fw-bold text-dark mb-0">Kandidat Mahasiswa Berprestasi Terkini</h6>
            <span className="text-muted small">Peringkat teratas berdasarkan akumulasi capaian belajar & poin</span>
          </div>
          <button
            type="button"
            className="btn btn-link btn-sm text-primary text-decoration-none fw-semibold"
            onClick={() => onNavigateTab && onNavigateTab('directory')}
          >
            Lihat Semua Talenta ({stats.total_candidates || 0}) →
          </button>
        </div>

        {recentCandidates && recentCandidates.length > 0 ? (
          <div>
            {recentCandidates.map((cand) => (
              <CandidateCard
                key={cand.id}
                candidate={cand}
                onViewProfile={onViewProfile}
                onVerifySbt={onVerifySbt}
              />
            ))}
          </div>
        ) : (
          <div className="clean-card p-4 text-center text-muted small">
            Belum ada kandidat terkini.
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverviewView;
