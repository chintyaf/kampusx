import React from 'react';
import { Badge, Button } from 'react-bootstrap';
import { ArrowLeft, ShieldCheck, Mail, Phone, GraduationCap } from 'lucide-react';

/**
 * Komponen ProfileHeader
 * Header profil profesional yang ringkas, bersih, dan jelas
 */
const ProfileHeader = ({ candidate, onBack }) => {
  if (!candidate) return null;

  const initials = candidate.name
    ? candidate.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'KM';

  const sbtCount = candidate.sbt_certificates ? candidate.sbt_certificates.length : (candidate.verified_sbt_count || 0);

  return (
    <div className="clean-card p-4 mb-4">
      {/* Top Navigation & Status */}
      <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
        <Button
          variant="outline-secondary"
          size="sm"
          className="rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1.5 fw-semibold"
          style={{ fontSize: '12px' }}
          onClick={onBack}
        >
          <ArrowLeft size={14} /> Kembali ke Direktori Talenta
        </Button>

        {sbtCount > 0 && (
          <Badge bg="success-subtle" className="text-success border border-success-subtle px-3 py-1.5 rounded-pill d-inline-flex align-items-center gap-1">
            <ShieldCheck size={14} /> {sbtCount} Kredensial Terverifikasi
          </Badge>
        )}
      </div>

      {/* Main Profile Info */}
      <div className="d-flex flex-column flex-sm-row align-items-start gap-3">
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#00699e',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>

        <div className="flex-grow-1">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
            <div>
              <h4 className="fw-bold text-dark mb-0">{candidate.name}</h4>
              <div className="text-muted small d-flex align-items-center gap-1.5 mt-1">
                <GraduationCap size={15} />
                <span>{candidate.campus || 'Universitas Indonesia'}</span>
                <span>•</span>
                <span>{candidate.major || 'Teknik Informatika'}</span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Badge bg="light" className="text-dark border px-2.5 py-1 rounded-pill" style={{ fontSize: '12px' }}>
                Tier {candidate.tier || 'Silver'}
              </Badge>
              <span className="badge bg-light text-muted border px-2.5 py-1 rounded-pill" style={{ fontSize: '12px' }}>
                {candidate.points || 0} Poin Capaian
              </span>
            </div>
          </div>

          {/* Contact Details (Read-only) */}
          <div className="d-flex flex-wrap gap-3 mt-3 pt-2 border-top text-muted small" style={{ fontSize: '12.5px' }}>
            {candidate.email && (
              <div className="d-flex align-items-center gap-1.5">
                <Mail size={13} />
                <span>{candidate.email}</span>
              </div>
            )}
            {candidate.phone && (
              <div className="d-flex align-items-center gap-1.5">
                <Phone size={13} />
                <span>{candidate.phone}</span>
              </div>
            )}
            {candidate.events_attended !== undefined && (
              <div className="d-flex align-items-center gap-1.5 ms-md-auto text-dark fw-medium">
                <span>{candidate.events_attended} Kegiatan Akademik Dihadiri</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
