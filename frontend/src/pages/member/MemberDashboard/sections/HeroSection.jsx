import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import { Search, Filter } from 'lucide-react';

const HeroSection = ({ userName, searchKeyword, onSearchChange, onSearchSubmit }) => {
  const firstName = userName ? userName.split(' ')[0] : 'Member';
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'event' | 'learning'

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(e, filterType);
    }
  };

  const getPlaceholderText = () => {
    if (filterType === 'event') return 'Cari event...';
    if (filterType === 'learning') return 'Cari materi micro-learning...';
    return 'Cari event atau materi skill...';
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @media (max-width: 767px) {
          .hero-banner-bg {
            background-image: none !important;
            background-color: #003250 !important;
          }
          .hero-container {
            padding-top: 24px !important;
            padding-bottom: 24px !important;
          }
          .hero-tagline {
            display: none !important;
          }
          .hero-title {
            font-size: 20px !important;
            margin-bottom: 12px !important;
          }
          .hero-label {
            margin-bottom: 2px !important;
          }
        }
      `}</style>

      {/* Background image */}
      <div
        className="hero-banner-bg"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/hero-banner.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          zIndex: 0,
        }}
      />
      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(100deg, rgba(0,50,80,0.95) 0%, rgba(0,105,158,0.82) 55%, rgba(0,105,158,0.25) 100%)',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <Container className="hero-container" style={{ position: 'relative', zIndex: 2, paddingTop: 40, paddingBottom: 44 }}>
        <div style={{ maxWidth: 560 }}>
          {/* Label */}
          <p className="hero-label" style={{
            margin: '0 0 6px',
            fontSize: 11,
            color: 'rgba(255,255,255,0.65)',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            Selamat datang kembali
          </p>

          {/* Main heading */}
          <h1 className="hero-title" style={{
            margin: '0 0 10px',
            fontSize: 'clamp(22px, 3.5vw, 34px)',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.2,
          }}>
            Halo, {firstName}! 👋
          </h1>

          {/* Tagline */}
          <p className="hero-tagline" style={{
            margin: '0 0 28px',
            fontSize: 14,
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.6,
            maxWidth: 360,
          }}>
            Temukan event, kembangkan skill, dan kumpulkan reward bersama komunitas KampusX.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} style={{ maxWidth: 480 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#fff',
              borderRadius: '12px',
              padding: '0 8px 0 16px',
              gap: 10,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            }}>
              <Search size={17} color="#94a3b8" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder={getPlaceholderText()}
                value={searchKeyword}
                onChange={onSearchChange}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#0f172a',
                  fontSize: 14,
                  padding: '14px 0',
                  fontFamily: 'inherit',
                }}
              />
              
              {/* Filter Button */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                >
                  <Filter size={15} color={filterType === 'all' ? '#64748b' : '#00699e'} />
                </button>

                {showFilterDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 8,
                    background: '#fff',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 100,
                    width: 140,
                    overflow: 'hidden',
                  }}>
                    {[
                      { key: 'all', label: 'Semua' },
                      { key: 'event', label: 'Event' },
                      { key: 'learning', label: 'Micro-learning' }
                    ].map((type) => (
                      <button
                        key={type.key}
                        type="button"
                        onClick={() => {
                          setFilterType(type.key);
                          setShowFilterDropdown(false);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 12px',
                          background: filterType === type.key ? '#f0f9ff' : 'transparent',
                          color: filterType === type.key ? '#00699e' : '#334155',
                          border: 'none',
                          fontSize: 12,
                          fontWeight: filterType === type.key ? 700 : 500,
                          cursor: 'pointer',
                        }}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                style={{
                  background: '#005a87',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 13,
                  padding: '9px 20px',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#004570'}
                onMouseLeave={e => e.currentTarget.style.background = '#005a87'}
              >
                Cari
              </button>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
};

export default HeroSection;
