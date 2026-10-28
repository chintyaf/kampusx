import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

// Mock data – replace with real API / contract calls later
const mockBadges = [
  { icon: '🎯', title: 'Goal Setter', desc: 'Set 3 forethought goals.' },
  { icon: '📝', title: 'Reflector', desc: 'Completed 3 reflections.' },
  { icon: '⚡', title: 'Micro‑Learner', desc: 'Completed 5 short‑lessons.' },
  { icon: '🏆', title: 'Champion', desc: 'Top 5% of cohort.' },
];

const certificate = {
  title: 'SRL Foundations Certificate',
  date: '2024‑12‑01',
  // In a real app this would be fetched from the blockchain
  verified: true,
  contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
};

const BadgeCertificatePage = () => {
  const styles = {
    page: {
      minHeight: '100vh',
      fontFamily: `'Inter', system-ui, -apple-system, sans-serif`,
      background: 'linear-gradient(135deg, hsl(210,30%,95%), hsl(210,30%,90%))',
      color: '#222',
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      padding: '1.5rem 2rem',
      background: 'linear-gradient(90deg, hsl(210,30%,70%), hsl(210,30%,55%))',
      color: '#fff',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    },
    layout: {
      display: 'flex',
      flexGrow: 1,
      gap: '1.5rem',
      padding: '2rem',
    },
    sidebar: {
      flexBasis: '260px',
      background: 'rgba(255,255,255,0.6)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    },
    main: {
      flex: 1,
      background: 'rgba(255,255,255,0.8)',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    },
    section: {
      marginBottom: '2rem',
    },
    badgeGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '1rem',
    },
    badgeCard: {
      background: 'rgba(255,255,255,0.9)',
      borderRadius: '8px',
      padding: '1rem',
      textAlign: 'center',
      boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
      transition: 'transform 0.2s',
    },
    certCard: {
      border: '2px solid hsl(150, 40%, 55%)',
      borderRadius: '12px',
      padding: '1.5rem',
      background: 'rgba(255,255,255,0.95)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.8rem',
    },
    verifyBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    downloadBtn: {
      alignSelf: 'flex-start',
      padding: '0.6rem 1.2rem',
      background: 'hsl(210,30%,65%)',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'background 0.2s',
    },
  };

  const handleDownload = () => {
    // Placeholder – later hook into backend PDF generation
    alert('Downloading certificate PDF…');
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1>🛡️ Lencana &amp; Sijil Digital</h1>
        <p>Prestasi anda, sah di blockchain.</p>
      </header>

      <div style={styles.layout}>
        {/* Sidebar – quick stats */}
        <aside style={styles.sidebar}>
          <h3>Profil Ringkas</h3>
          <p>Total Poin: <strong>1,250 PTS</strong></p>
          <p>Rank: <strong>SRL Gold Master</strong></p>
          <p>Smart Contract: <code>{certificate.contractAddress}</code></p>
        </aside>

        {/* Main content */}
        <main style={styles.main}>
          {/* Badges Section */}
          <section style={styles.section}>
            <h2>🟢 Lencana yang Diperoleh</h2>
            <div style={styles.badgeGrid}>
              {mockBadges.map((b, i) => (
                <div
                  key={i}
                  style={styles.badgeCard}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div style={{ fontSize: '2rem' }}>{b.icon}</div>
                  <strong>{b.title}</strong>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>{b.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Certificate Section */}
          <section style={styles.section}>
            <h2>📜 Sijil Digital</h2>
            <div style={styles.certCard}>
              <h3>{certificate.title}</h3>
              <p>Tarikh: {certificate.date}</p>
              <div style={styles.verifyBadge}>
                {certificate.verified ? (
                  <>
                    <CheckCircle size={18} />
                    <span>Sah pada Smart Contract</span>
                  </>
                ) : (
                  <>
                    <XCircle size={18} />
                    <span>Belum Disahkan</span>
                  </>
                )}
              </div>
              <button style={styles.downloadBtn} onClick={handleDownload}>
                Muat Turun PDF Sijil
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default BadgeCertificatePage;
