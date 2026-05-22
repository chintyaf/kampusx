/**
 * CommitteePage.jsx
 * Flow: PIN (alphanumeric) → Pilih Pos → Scan QR Dashboard
 *
 * API:
 *   POST /api/committee/verify-pin   { pin }  → { event, positions }
 *   POST /api/committee/scan         { pin, position_id, qr_token }  → { success, attendee | message }
 *   GET  /api/committee/stats?pin=&position_id=  → { total_registered, total_scanned, recent[] }
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Spinner } from 'react-bootstrap';
import api from '../../api/axios';

// ─── STEP 1: PIN ──────────────────────────────────────────────────────────────
const PinStep = ({ onSuccess }) => {
  const [pin,     setPin]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pin.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('committee/verify-pin', { pin: pin.trim().toUpperCase() });
      onSuccess(res.data.event, res.data.positions, pin.trim().toUpperCase());
    } catch (err) {
      setError(err.response?.data?.message ?? 'PIN salah atau event tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <div style={{ width: '100%', maxWidth: 360, padding: '0 16px' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 800, color: 'var(--color-text)', marginBottom: 4 }}>Dashboard Panitia</h2>
        <p style={{ textAlign: 'center', color: 'var(--color-secondary)', fontSize: 'var(--font-sm)', marginBottom: 28 }}>
          Masukkan PIN event untuk melanjutkan
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>
              PIN Event
            </label>
            <input
              type="text"
              value={pin}
              onChange={e => { setPin(e.target.value.toUpperCase()); setError(''); }}
              placeholder="Contoh: ABC123"
              autoFocus
              autoCapitalize="characters"
              style={{
                width: '100%', padding: '10px 14px', fontSize: 20,
                fontWeight: 800, letterSpacing: 4, textAlign: 'center',
                border: `1.5px solid ${error ? 'var(--error-text)' : 'var(--color-border)'}`,
                borderRadius: 8, color: 'var(--color-text)',
                background: 'var(--color-white)', outline: 'none',
                textTransform: 'uppercase', boxSizing: 'border-box',
              }}
            />
            {error && (
              <p style={{ color: 'var(--error-text)', fontSize: 'var(--font-xs)', marginTop: 6 }}>{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!pin.trim() || loading}
            style={{
              width: '100%', padding: '11px', background: 'var(--color-primary)',
              color: '#fff', border: 'none', borderRadius: 8,
              fontSize: 'var(--font-md)', fontWeight: 700, cursor: 'pointer',
              opacity: pin.trim() && !loading ? 1 : 0.5,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? <><Spinner as="span" animation="border" size="sm" /> Memverifikasi…</> : 'Masuk'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 'var(--font-xs)', color: 'var(--color-secondary)', marginTop: 20 }}>
          PIN diberikan oleh organizer event.
        </p>
      </div>
    </div>
  );
};

// ─── STEP 2: PILIH POS ────────────────────────────────────────────────────────
const SelectPosStep = ({ event, positions, onSelect, onLogout }) => (
  <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '32px 16px' }}>
    <div style={{ maxWidth: 560, margin: '0 auto' }}>

      {/* Event info */}
      <div style={{ background: 'var(--color-primary)', borderRadius: 10, padding: '16px 18px', color: '#fff', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: 11, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Event Aktif</p>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: 17 }}>{event.title}</h3>
          {event.date && <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.8 }}>{event.date}</p>}
        </div>
        <button onClick={onLogout} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6, padding: '6px 12px', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          Keluar
        </button>
      </div>

      <h4 style={{ fontWeight: 800, color: 'var(--color-text)', marginBottom: 6 }}>Pilih Pos</h4>
      <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-secondary)', marginBottom: 16 }}>
        {positions.length} pos terdaftar
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {positions.map(pos => {
          const active = pos.is_active !== false;
          return (
            <button
              key={pos.id}
              onClick={() => active && onSelect(pos)}
              disabled={!active}
              style={{
                background: 'var(--color-white)', border: '1px solid var(--color-border)',
                borderRadius: 10, padding: '14px 16px', cursor: active ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                textAlign: 'left', opacity: active ? 1 : 0.5, width: '100%',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-sm)', color: 'var(--color-text)' }}>{pos.name}</div>
                {pos.description && <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-secondary)', marginTop: 2 }}>{pos.description}</div>}
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '3px 9px',
                background: active ? '#d1fae5' : 'var(--color-bg-2)',
                color: active ? '#065f46' : 'var(--color-secondary)',
              }}>
                {active ? 'AKTIF' : 'NON-AKTIF'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

// ─── STEP 3: SCAN DASHBOARD ───────────────────────────────────────────────────
const ScanDashboard = ({ event, position, pin, onLogout }) => {
  const [manualCode,  setManualCode]  = useState('');
  const [scanStatus,  setScanStatus]  = useState('idle'); // idle | loading | ok | fail
  const [scanResult,  setScanResult]  = useState(null);
  const [stats,       setStats]       = useState({ total_registered: 0, total_scanned: 0, recent: [] });
  const [statsLoading,setStatsLoading]= useState(true);
  const inputRef = useRef(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get(`committee/stats?pin=${pin}&position_id=${position.id}`);
      setStats(res.data);
    } catch (e) { console.warn('stats error', e); }
    finally { setStatsLoading(false); }
  }, [pin, position.id]);

  useEffect(() => {
    fetchStats();
    const iv = setInterval(fetchStats, 15000);
    return () => clearInterval(iv);
  }, [fetchStats]);

  const processScan = useCallback(async (code) => {
    if (!code.trim() || scanStatus === 'loading') return;
    setScanStatus('loading');
    setScanResult(null);
    try {
      const res = await api.post('committee/scan', {
        pin,
        position_id: position.id,
        qr_token: code.trim(),
      });
      if (res.data.success) {
        setScanStatus('ok');
        setScanResult(res.data.attendee);
        fetchStats();
      } else {
        setScanStatus('fail');
        setScanResult({ message: res.data.message ?? 'QR tidak valid.' });
      }
    } catch (err) {
      setScanStatus('fail');
      setScanResult({ message: err.response?.data?.message ?? 'Gagal memproses.' });
    }
    setManualCode('');
    setTimeout(() => { setScanStatus('idle'); setScanResult(null); inputRef.current?.focus(); }, 3500);
  }, [pin, position.id, scanStatus, fetchStats]);

  const handleManualSubmit = (e) => { e.preventDefault(); processScan(manualCode); };

  const pct = stats.total_registered > 0
    ? Math.round((stats.total_scanned / stats.total_registered) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingBottom: 48 }}>

      {/* Top bar */}
      <div style={{ background: 'var(--color-primary)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>{event.title}</p>
          <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: 'var(--font-sm)' }}>
            Pos: {position.name} &nbsp;·&nbsp;
            <span style={{ fontFamily: 'monospace', letterSpacing: 2 }}>{pin}</span>
          </p>
        </div>
        <button onClick={onLogout} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6, padding: '6px 14px', color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
          Keluar
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>

        {/* Scan result feedback */}
        {scanStatus !== 'idle' && (
          <div style={{
            borderRadius: 10, padding: '14px 16px', marginBottom: 16,
            background: scanStatus === 'ok' ? '#d1fae5' : scanStatus === 'fail' ? 'var(--error-bg)' : 'var(--bahama-blue-50)',
            border: `1px solid ${scanStatus === 'ok' ? '#6ee7b7' : scanStatus === 'fail' ? 'var(--error-border)' : 'var(--color-border)'}`,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            {scanStatus === 'loading' && <Spinner animation="border" size="sm" style={{ color: 'var(--color-primary)', flexShrink: 0 }} />}
            {scanStatus === 'ok'      && <span style={{ fontSize: 22 }}>✅</span>}
            {scanStatus === 'fail'    && <span style={{ fontSize: 22 }}>❌</span>}
            <div>
              {scanStatus === 'loading' && <p style={{ margin: 0, fontWeight: 600, fontSize: 'var(--font-sm)', color: 'var(--color-primary)' }}>Memverifikasi…</p>}
              {scanStatus === 'ok' && <>
                <p style={{ margin: '0 0 2px', fontWeight: 800, color: '#065f46', fontSize: 'var(--font-sm)' }}>Check-in Berhasil</p>
                <p style={{ margin: 0, fontSize: 'var(--font-xs)', color: '#047857' }}>
                  {scanResult?.name} &nbsp;·&nbsp; <span style={{ fontFamily: 'monospace' }}>{scanResult?.ticket_code}</span>
                </p>
              </>}
              {scanStatus === 'fail' && <>
                <p style={{ margin: '0 0 2px', fontWeight: 800, color: 'var(--error-heading)', fontSize: 'var(--font-sm)' }}>Gagal</p>
                <p style={{ margin: 0, fontSize: 'var(--font-xs)', color: 'var(--error-text)' }}>{scanResult?.message}</p>
              </>}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

          {/* LEFT: Scanner area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Camera placeholder */}
            <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ fontWeight: 700, fontSize: 'var(--font-sm)', color: 'var(--color-text)' }}>📷 Scanner QR</span>
              </div>
              {/*
                GANTI BLOK INI dengan komponen kamera:

                npm install html5-qrcode

                import { Html5QrcodeScanner } from 'html5-qrcode';
                useEffect(() => {
                  const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 220 }, false);
                  scanner.render(
                    (text) => { scanner.clear(); processScan(text); },
                    () => {}
                  );
                  return () => scanner.clear().catch(() => {});
                }, [processScan]);
                return <div id="qr-reader" />;
              */}
              <div style={{ background: '#0f172a', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textAlign: 'center', margin: 0 }}>
                  📷<br />Area Kamera<br /><span style={{ fontSize: 11 }}>Pasang html5-qrcode</span>
                </p>
              </div>
            </div>

            {/* Manual input */}
            <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 14 }}>
              <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 'var(--font-sm)', color: 'var(--color-text)' }}>
                ⌨️ Input Manual
              </p>
              <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: 8 }}>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Kode tiket / QR token…"
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value)}
                  autoFocus
                  style={{
                    flex: 1, border: '1px solid var(--color-border)', borderRadius: 8,
                    padding: '9px 12px', fontSize: 'var(--font-sm)', color: 'var(--color-text)',
                    outline: 'none', background: 'var(--color-white)',
                  }}
                />
                <button
                  type="submit"
                  disabled={!manualCode.trim() || scanStatus === 'loading'}
                  style={{
                    background: 'var(--color-primary)', color: '#fff', border: 'none',
                    borderRadius: 8, padding: '9px 16px', fontWeight: 700,
                    fontSize: 'var(--font-sm)', cursor: 'pointer',
                    opacity: manualCode.trim() ? 1 : 0.5,
                  }}
                >
                  Scan
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Stat numbers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Total Daftar', value: stats.total_registered, bg: 'var(--bahama-blue-50)', color: 'var(--color-primary)' },
                { label: 'Sudah Hadir',  value: stats.total_scanned,    bg: '#d1fae5', color: '#065f46' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                  {statsLoading
                    ? <Spinner animation="border" size="sm" style={{ color: 'var(--color-primary)' }} />
                    : <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                  }
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-secondary)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 'var(--font-sm)' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>Tingkat Kehadiran</span>
                <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{pct}%</span>
              </div>
              <div style={{ height: 10, background: 'var(--color-bg-2)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'var(--color-primary)', borderRadius: 99, transition: 'width .5s' }} />
              </div>
            </div>

            {/* Recent scans */}
            <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden', flex: 1 }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 'var(--font-sm)', color: 'var(--color-text)' }}>🕐 Scan Terbaru</span>
                <button onClick={fetchStats} style={{ background: 'none', border: 'none', fontSize: 'var(--font-xs)', color: 'var(--color-secondary)', cursor: 'pointer' }}>
                  Refresh
                </button>
              </div>
              {statsLoading ? (
                <div style={{ padding: 24, textAlign: 'center' }}><Spinner animation="border" size="sm" style={{ color: 'var(--color-primary)' }} /></div>
              ) : stats.recent?.length > 0 ? (
                stats.recent.slice(0, 8).map((item, i) => (
                  <div key={i} style={{ padding: '10px 14px', borderBottom: i < stats.recent.length - 1 ? '1px solid var(--color-border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 'var(--font-sm)', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                      <p style={{ margin: 0, fontSize: 'var(--font-xs)', color: 'var(--color-secondary)', fontFamily: 'monospace' }}>{item.ticket_code}</p>
                    </div>
                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-secondary)', flexShrink: 0, marginLeft: 8 }}>
                      {item.scanned_at ? new Date(item.scanned_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--color-secondary)', fontSize: 'var(--font-sm)' }}>
                  Belum ada scan
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// ─── Root controller ──────────────────────────────────────────────────────────
const CommitteePage = () => {
  const [step,      setStep]      = useState(1);
  const [eventData, setEventData] = useState(null);
  const [positions, setPositions] = useState([]);
  const [activePos, setActivePos] = useState(null);
  const [pin,       setPin]       = useState('');

  const handlePinSuccess = (event, pos, enteredPin) => {
    setEventData(event); setPositions(pos); setPin(enteredPin); setStep(2);
  };
  const handleSelectPos = (pos) => { setActivePos(pos); setStep(3); };
  const handleLogout    = () => { setStep(1); setEventData(null); setPositions([]); setActivePos(null); setPin(''); };

  if (step === 1) return <PinStep onSuccess={handlePinSuccess} />;
  if (step === 2) return <SelectPosStep event={eventData} positions={positions} onSelect={handleSelectPos} onLogout={handleLogout} />;
  return <ScanDashboard event={eventData} position={activePos} pin={pin} onLogout={handleLogout} />;
};

export default CommitteePage;