import React, { useState, useRef, useCallback } from 'react';
import {
  Image as ImageIcon,
  Save,
  Download,
  GripVertical,
  ArrowLeft,
  Bold,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  Layers,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Lock,
  Unlock,
  Trash2,
} from 'lucide-react';

/* ─── Constants ─────────────────────────────────────────────────────────────── */
const VARIABLES = [
  { key: '{Nama_Peserta}', label: 'Nama Peserta', color: '#2563eb' },
  { key: '{Nama_Event}', label: 'Nama Event', color: '#7c3aed' },
  { key: '{Tanggal_Event}', label: 'Tanggal Event', color: '#059669' },
  { key: '{Penyelenggara}', label: 'Penyelenggara', color: '#d97706' },
  { key: '{Nomor_Sertifikat}', label: 'Nomor Sertifikat', color: '#dc2626' },
];

const DEFAULT_ELEMENTS = [
  { id: 1, key: '{Nama_Peserta}', color: '#2563eb', x: 200, y: 210, fontSize: 28, fontWeight: 'bold', align: 'center', locked: false },
  { id: 2, key: '{Tanggal_Event}', color: '#059669', x: 230, y: 310, fontSize: 14, fontWeight: 'normal', align: 'center', locked: false },
];

let nextId = 10;
const uid = () => ++nextId;

const PREVIEW_DATA = {
  '{Nama_Peserta}': 'Budi Santoso',
  '{Nama_Event}': 'Seminar Nasional AI 2025',
  '{Tanggal_Event}': '21 April 2025',
  '{Penyelenggara}': 'Universitas Bandung',
  '{Nomor_Sertifikat}': 'CERT-2025-0042',
};

/* ─── VarChip ─── */
const VarChip = ({ variable }) => (
  <div
    style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '7px 10px',
      background: '#fff',
      border: `1px solid ${variable.color}30`,
      borderRadius: 8, cursor: 'grab',
      userSelect: 'none', transition: 'box-shadow 0.15s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}
    draggable
    onDragStart={(e) => {
      e.dataTransfer.setData('varKey', variable.key);
      e.dataTransfer.setData('varColor', variable.color);
    }}>
    <span style={{ width: 8, height: 8, borderRadius: '50%', background: variable.color, flexShrink: 0 }} />
    <code style={{ flex: 1, fontSize: 11, color: '#374151', fontFamily: "'Fira Code', monospace" }}>{variable.key}</code>
    <GripVertical size={12} style={{ color: '#cbd5e1' }} />
  </div>
);

/* ─── Main ─── */
export default function CertificateBuilderPage({ onBack, cert }) {
  const [elements, setElements] = useState(DEFAULT_ELEMENTS);
  const [selected, setSelected] = useState(null);
  const [bgImage, setBgImage] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [draggingEl, setDraggingEl] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [previewMode, setPreviewMode] = useState(false);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleZoom = (dir) => setZoom((z) => Math.min(150, Math.max(50, z + dir * 10)));

  const handleBgUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBgImage(URL.createObjectURL(file));
  };

  const handleCanvasDrop = useCallback((e) => {
    e.preventDefault();
    const varKey = e.dataTransfer.getData('varKey');
    const varColor = e.dataTransfer.getData('varColor');
    if (!varKey || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = zoom / 100;
    const x = (e.clientX - rect.left) / scale - 80;
    const y = (e.clientY - rect.top) / scale - 18;
    const newEl = { id: uid(), key: varKey, color: varColor, x: Math.max(0, x), y: Math.max(0, y), fontSize: 18, fontWeight: 'normal', align: 'center', locked: false };
    setElements((prev) => [...prev, newEl]);
    setSelected(newEl.id);
  }, [zoom]);

  const handleElMouseDown = (e, el) => {
    if (el.locked) return;
    e.stopPropagation();
    setSelected(el.id);
    const scale = zoom / 100;
    setDraggingEl(el.id);
    setDragOffset({ x: e.clientX / scale - el.x, y: e.clientY / scale - el.y });
  };

  const handleMouseMove = useCallback((e) => {
    if (!draggingEl) return;
    const scale = zoom / 100;
    setElements((prev) => prev.map((el) =>
      el.id === draggingEl ? { ...el, x: e.clientX / scale - dragOffset.x, y: e.clientY / scale - dragOffset.y } : el
    ));
  }, [draggingEl, dragOffset, zoom]);

  const handleMouseUp = useCallback(() => setDraggingEl(null), []);

  const handleDelete = () => { setElements((prev) => prev.filter((el) => el.id !== selected)); setSelected(null); };

  const updateEl = (prop, value) => setElements((prev) => prev.map((el) => el.id === selected ? { ...el, [prop]: value } : el));

  const selectedEl = elements.find((el) => el.id === selected);

  const SectionLabel = ({ children }) => (
    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', margin: '0 0 10px' }}>{children}</p>
  );

  return (
    <div style={s.page}>
      {/* Top bar */}
      <div style={s.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button style={s.backBtn} onClick={onBack}>
            <ArrowLeft size={15} />
            <span>Kembali</span>
          </button>
          <div style={s.topDivider} />
          <div>
            <p style={s.topTitle}>{cert ? cert.name : 'Template Baru'}</p>
            <p style={s.topSub}>Certificate Builder</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={s.btnGhost} onClick={() => setPreviewMode(v => !v)}>
            <Eye size={13} /> {previewMode ? 'Mode Edit' : 'Preview'}
          </button>
          <button style={s.btnGhost}>
            <Download size={13} /> Ekspor
          </button>
          <button style={s.btnPrimary}>
            <Save size={13} /> Simpan Template
          </button>
        </div>
      </div>

      <div style={s.layout}>
        {/* ── LEFT PANEL ── */}
        <aside style={s.panel}>
          <div style={s.section}>
            <SectionLabel>Template Background</SectionLabel>
            <div style={s.uploadZone} onClick={() => fileInputRef.current?.click()}>
              {bgImage ? (
                <img src={bgImage} alt="bg" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6 }} />
              ) : (
                <>
                  <ImageIcon size={20} strokeWidth={1.5} style={{ color: '#94a3b8' }} />
                  <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500 }}>Klik atau seret gambar</span>
                  <span style={{ fontSize: 10, color: '#cbd5e1' }}>PNG, JPG · 1400×990px</span>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBgUpload} />
            {bgImage && (
              <button style={{ ...s.btnGhost, width: '100%', justifyContent: 'center', marginTop: 6, fontSize: 11 }}
                onClick={() => setBgImage(null)}>
                <RotateCcw size={11} /> Ganti background
              </button>
            )}
          </div>

          <div style={s.divider} />

          <div style={s.section}>
            <SectionLabel>Variabel Dinamis</SectionLabel>
            <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5, margin: '0 0 10px' }}>
              Seret variabel ke kanvas untuk menempatkan teks otomatis.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {VARIABLES.map(v => <VarChip key={v.key} variable={v} />)}
            </div>
          </div>

          <div style={s.divider} />

          <div style={s.section}>
            <SectionLabel>Layer ({elements.length})</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[...elements].reverse().map(el => (
                <div key={el.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px', borderRadius: 7, cursor: 'pointer', background: selected === el.id ? '#eff6ff' : 'transparent', border: `1px solid ${selected === el.id ? '#bfdbfe' : 'transparent'}` }}
                  onClick={() => setSelected(el.id)}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: el.color, flexShrink: 0 }} />
                  <code style={{ flex: 1, fontSize: 10.5, color: '#64748b', fontFamily: "'Fira Code', monospace", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{el.key}</code>
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 2 }}
                    onClick={e => { e.stopPropagation(); updateEl('locked', !el.locked); }}>
                    {el.locked ? <Lock size={11} /> : <Unlock size={11} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── CANVAS ── */}
        <main style={s.workspace}>
          {/* Zoom bar */}
          <div style={s.zoomBar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button style={s.zBtn} onClick={() => handleZoom(-1)}><ZoomOut size={13} /></button>
              <span style={{ fontSize: 11.5, color: '#64748b', minWidth: 38, textAlign: 'center', fontFamily: 'monospace' }}>{zoom}%</span>
              <button style={s.zBtn} onClick={() => handleZoom(1)}><ZoomIn size={13} /></button>
            </div>
            <span style={{ fontSize: 11, color: '#cbd5e1' }}>840 × 594 px (A4 Landscape)</span>
          </div>

          {/* Canvas scroll */}
          <div style={s.canvasOuter} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
            <div style={s.canvasScroll}>
              <div
                ref={canvasRef}
                style={{
                  position: 'relative',
                  width: 840, height: 594,
                  background: bgImage ? undefined : '#fff',
                  backgroundImage: bgImage ? `url(${bgImage})` : undefined,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  boxShadow: '0 4px 32px rgba(0,0,0,0.12), 0 0 0 1px #e2e8f0',
                  borderRadius: 4,
                  flexShrink: 0,
                  overflow: 'hidden',
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                  cursor: draggingEl ? 'grabbing' : 'default',
                }}
                onClick={() => setSelected(null)}
                onDragOver={e => e.preventDefault()}
                onDrop={handleCanvasDrop}>

                {!bgImage && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#cbd5e1', pointerEvents: 'none' }}>
                    <ImageIcon size={32} strokeWidth={1} />
                    <p style={{ fontSize: 13, margin: 0, color: '#94a3b8' }}>Upload background sertifikat</p>
                    <p style={{ fontSize: 11, margin: 0, color: '#cbd5e1' }}>atau seret variabel untuk mulai tanpa background</p>
                  </div>
                )}

                {/* Grid */}
                {!previewMode && (
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 1 }} />
                )}

                {elements.map(el => (
                  <div
                    key={el.id}
                    style={{
                      position: 'absolute', left: el.x, top: el.y,
                      fontSize: el.fontSize, fontWeight: el.fontWeight,
                      color: previewMode ? '#1a1a1a' : el.color,
                      textAlign: el.align,
                      padding: '2px 4px', borderRadius: 3,
                      lineHeight: 1.2, whiteSpace: 'nowrap',
                      zIndex: 10,
                      cursor: el.locked ? 'not-allowed' : 'grab',
                      fontFamily: "'DM Serif Display', Georgia, serif",
                      outline: selected === el.id ? '2px solid #3b82f6' : 'none',
                      background: selected === el.id ? 'rgba(59,130,246,0.06)' : 'transparent',
                      opacity: el.locked ? 0.7 : 1,
                    }}
                    onMouseDown={e => handleElMouseDown(e, el)}>
                    {previewMode ? (PREVIEW_DATA[el.key] ?? el.key) : el.key}
                    {selected === el.id && !previewMode && (
                      <div style={{ position: 'absolute', inset: -1, pointerEvents: 'none' }}>
                        {[{ top: -4, left: -4 }, { top: -4, right: -4 }, { bottom: -4, left: -4 }, { bottom: -4, right: -4 }].map((pos, i) => (
                          <div key={i} style={{ position: 'absolute', ...pos, width: 7, height: 7, background: '#fff', border: '1.5px solid #3b82f6', borderRadius: 2 }} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* ── RIGHT PANEL ── */}
        <aside style={{ ...s.panel, borderLeft: '1px solid #f1f5f9' }}>
          {selectedEl ? (
            <>
              <div style={s.section}>
                <SectionLabel>Elemen Terpilih</SectionLabel>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: '#fff', border: `1.5px solid ${selectedEl.color}40`, borderRadius: 8, width: '100%', boxSizing: 'border-box' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: selectedEl.color }} />
                  <code style={{ fontSize: 11, color: selectedEl.color, fontFamily: "'Fira Code', monospace", flex: 1 }}>{selectedEl.key}</code>
                </div>
              </div>

              <div style={s.divider} />

              <div style={s.section}>
                <SectionLabel>Tipografi</SectionLabel>
                <div style={s.propRow}>
                  <label style={s.propLabel}>Ukuran Font</label>
                  <div style={s.numInput}>
                    <button style={s.numBtn} onClick={() => updateEl('fontSize', Math.max(8, selectedEl.fontSize - 1))}>−</button>
                    <span style={s.numVal}>{selectedEl.fontSize}px</span>
                    <button style={s.numBtn} onClick={() => updateEl('fontSize', Math.min(80, selectedEl.fontSize + 1))}>+</button>
                  </div>
                </div>
                <div style={s.propRow}>
                  <label style={s.propLabel}>Tebal</label>
                  <button
                    style={{ ...s.toggleBtn, background: selectedEl.fontWeight === 'bold' ? '#eff6ff' : '#f8fafc', color: selectedEl.fontWeight === 'bold' ? '#2563eb' : '#94a3b8', border: `1px solid ${selectedEl.fontWeight === 'bold' ? '#bfdbfe' : '#e2e8f0'}` }}
                    onClick={() => updateEl('fontWeight', selectedEl.fontWeight === 'bold' ? 'normal' : 'bold')}>
                    <Bold size={13} />
                  </button>
                </div>
                <div style={s.propRow}>
                  <label style={s.propLabel}>Alignment</label>
                  <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: 7, overflow: 'hidden' }}>
                    {[['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]].map(([a, Icon]) => (
                      <button key={a}
                        style={{ width: 30, height: 28, background: selectedEl.align === a ? '#eff6ff' : '#f8fafc', border: 'none', borderLeft: a !== 'left' ? '1px solid #e2e8f0' : 'none', color: selectedEl.align === a ? '#2563eb' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => updateEl('align', a)}>
                        <Icon size={12} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={s.divider} />

              <div style={s.section}>
                <SectionLabel>Posisi</SectionLabel>
                {[['X', 'x'], ['Y', 'y']].map(([label, prop]) => (
                  <div key={prop} style={s.propRow}>
                    <label style={s.propLabel}>{label}</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: 7, overflow: 'hidden' }}>
                      <input type="number" value={Math.round(selectedEl[prop])}
                        onChange={e => updateEl(prop, Number(e.target.value))}
                        style={{ width: 60, background: '#fff', border: 'none', color: '#374151', fontSize: 11, padding: '4px 8px', outline: 'none', fontFamily: 'monospace' }} />
                      <span style={{ padding: '0 7px', fontSize: 10, color: '#94a3b8', background: '#f8fafc', height: 26, display: 'flex', alignItems: 'center', borderLeft: '1px solid #e2e8f0' }}>px</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={s.divider} />

              <div style={s.section}>
                <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '7px', background: '#fff5f5', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }} onClick={handleDelete}>
                  <Trash2 size={12} /> Hapus Elemen
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, padding: 24, textAlign: 'center' }}>
              <Layers size={26} strokeWidth={1.2} style={{ color: '#cbd5e1' }} />
              <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>Pilih elemen di kanvas untuk mengedit propertinya.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

/* ─── Styles ─── */
const s = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc', fontFamily: "'DM Sans', system-ui, sans-serif" },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 20px', height: 56,
    background: '#fff',
    borderBottom: '1px solid #f1f5f9',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    gap: 16, flexShrink: 0,
  },
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'transparent', border: '1px solid #e2e8f0',
    borderRadius: 7, padding: '6px 12px',
    fontSize: 12, fontWeight: 600, color: '#475569',
    cursor: 'pointer',
  },
  topDivider: { width: 1, height: 24, background: '#f1f5f9' },
  topTitle: { fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 },
  topSub: { fontSize: 10.5, color: '#94a3b8', margin: 0 },
  btnGhost: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 7, padding: '6px 12px',
    fontSize: 12, fontWeight: 500, color: '#475569', cursor: 'pointer',
  },
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    background: '#1e40af', color: '#fff',
    border: 'none', borderRadius: 7, padding: '7px 14px',
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '220px 1fr 200px',
    flex: 1, minHeight: 0,
    overflow: 'hidden',
  },
  panel: {
    background: '#fff',
    borderRight: '1px solid #f1f5f9',
    overflowY: 'auto',
  },
  section: { padding: '14px 14px' },
  divider: { height: 1, background: '#f1f5f9' },
  uploadZone: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: 5, minHeight: 90,
    border: '2px dashed #e2e8f0',
    borderRadius: 9, background: '#f8fafc',
    cursor: 'pointer', padding: 14, textAlign: 'center',
    transition: 'border-color 0.15s',
  },
  workspace: { display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f1f5f9' },
  zoomBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '7px 16px',
    background: '#fff', borderBottom: '1px solid #f1f5f9',
    flexShrink: 0,
  },
  zBtn: {
    width: 28, height: 28,
    background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 6, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#64748b',
  },
  canvasOuter: {
    flex: 1, overflow: 'auto',
    background: 'radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)',
    backgroundSize: '24px 24px',
    backgroundColor: '#e2e8f0',
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'center', padding: 32,
  },
  canvasScroll: {
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'center', minWidth: 'fit-content', width: '100%',
  },
  propRow: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 10, gap: 8,
  },
  propLabel: { fontSize: 11, color: '#64748b', flexShrink: 0 },
  numInput: {
    display: 'flex', alignItems: 'center',
    border: '1px solid #e2e8f0', borderRadius: 7, overflow: 'hidden',
  },
  numBtn: {
    width: 26, height: 28, background: '#f8fafc',
    border: 'none', color: '#64748b', cursor: 'pointer',
    fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  numVal: {
    padding: '0 8px', fontSize: 11, color: '#374151',
    background: '#fff', height: 28, display: 'flex',
    alignItems: 'center', fontFamily: 'monospace', minWidth: 50, justifyContent: 'center',
    borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0',
  },
  toggleBtn: {
    width: 30, height: 28, borderRadius: 7,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
};
