import React, { useState } from 'react';
import api from '@/api/axios';

/**
 * SRLForethoughtModal (Modal Pop-up Form Forethought)
 * Interseptor metakognitif (Fase 1 Forethought SRL) sebelum peserta didik masuk ke Fase Performance.
 *
 * Variabel Utama:
 * 1. goal: Penetapan Tujuan (Task Analysis / Goal Setting)
 * 2. plan: Alokasi Waktu (Time Management / Strategic Planning)
 * 3. strategy / motivation: Strategi & Motivasi Belajar (Metacognitive Awareness)
 * 4. self_efficacy: Efikasi Diri 1-5 (Self-Motivation Beliefs / Fitur Machine Learning)
 *
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - onComplete: function(payload)
 * - enrollmentId: number | string
 * - recommendedTime: number
 * - moduleTitle: string
 */
export const SRLForethoughtModal = ({
  isOpen,
  onClose,
  onComplete,
  enrollmentId = 1,
  recommendedTime = 15,
  moduleTitle = '',
}) => {
  // 1. Goal (Penetapan Tujuan)
  const [goal, setGoal] = useState('');
  // 2. Plan (Alokasi Waktu dalam Menit)
  const [plan, setPlan] = useState(recommendedTime.toString());
  // 3. Strategy / Motivation (Metacognitive Awareness)
  const [strategy, setStrategy] = useState('Fokus Membaca');
  // 4. Self-Efficacy (Skala 1 - 5 Self-Motivation Beliefs)
  const [selfEfficacy, setSelfEfficacy] = useState(4);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Opsi Strategy Chips/Pills
  const strategyOptions = [
    { id: 'Catat Poin', label: '📝 Catat Poin' },
    { id: 'Fokus Membaca', label: '📖 Fokus Membaca' },
    { id: 'Langsung Kuis', label: '⚡ Langsung Kuis' },
  ];

  // Quick Goal Suggestions (< 15 detik completion)
  const quickGoals = [
    'Pahami Konsep Dasar',
    'Tuntaskan Semua Unit',
    'Siap Skor Kuis 100%',
  ];

  // Skala Efikasi Diri (1-5 Emoji Scale)
  const efficacyLevels = [
    { level: 1, emoji: '😟', label: 'Ragu' },
    { level: 2, emoji: '😐', label: 'Cukup' },
    { level: 3, emoji: '🙂', label: 'Yakin' },
    { level: 4, emoji: '😊', label: 'Optimis' },
    { level: 5, emoji: '🚀', label: 'Sangat Siap' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!goal.trim()) {
      setErrorMessage('Tentukan tujuan belajar Anda sebelum memulai.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      enrollment_id: enrollmentId,
      goal: goal.trim(),
      plan: `${plan} menit`,
      strategy,
      motivation: strategy, // kompatibilitas alias payload motivation/strategy
      self_efficacy: Number(selfEfficacy),
      timestamp: new Date().toISOString(),
    };

    try {
      // Coba kirim via interceptor Axios
      try {
        await api.post('/srl/forethought', payload);
      } catch (axiosErr) {
        // Fallback fetch API
        await fetch('/api/srl/forethought', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      // Unlock navigasi ke Fase Performance
      if (typeof onComplete === 'function') {
        onComplete(payload);
      }
    } catch (error) {
      console.warn('Gagal mengirim SRL Forethought:', error);
      // Tetap lanjutkan navigasi agar user experience tidak terhambat
      if (typeof onComplete === 'function') {
        onComplete(payload);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '520px' }}>
          <div className="modal-content shadow border-0 rounded-4 overflow-hidden">
            {/* Modal Header */}
            <div className="modal-header bg-primary text-white py-3 px-4">
              <div>
                <h5 className="modal-title fw-bold mb-0 fs-6">
                  🎯 Kesiapan Belajar (SRL Forethought)
                </h5>
                {moduleTitle && (
                  <span className="small text-white-50 d-block mt-0.5" style={{ fontSize: '0.8rem' }}>
                    Modul: {moduleTitle}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                disabled={isSubmitting}
                aria-label="Close"
              />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body p-4 pt-3">
                {errorMessage && (
                  <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">
                    {errorMessage}
                  </div>
                )}

                {/* 1. PENETAPAN TUJUAN (goal) */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label htmlFor="learningGoal" className="form-label fw-bold mb-0 small">
                      1. Target Belajar (<code className="text-primary">goal</code>){' '}
                      <span className="text-danger">*</span>
                    </label>
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                      Task Analysis
                    </span>
                  </div>
                  <input
                    id="learningGoal"
                    type="text"
                    className="form-control form-control-sm py-2"
                    placeholder="Contoh: Menguasai state dan hooks..."
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    required
                  />
                  {/* Quick Goal Chips untuk Low Friction (< 15 detik) */}
                  <div className="d-flex gap-1 mt-1.5 flex-wrap">
                    {quickGoals.map((g) => (
                      <button
                        key={g}
                        type="button"
                        className="btn btn-sm btn-light border py-0 px-2 text-secondary"
                        style={{ fontSize: '0.72rem', borderRadius: '12px' }}
                        onClick={() => setGoal(g)}
                      >
                        + {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. ALOKASI WAKTU (plan) */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label htmlFor="timePlan" className="form-label fw-bold mb-0 small">
                      2. Alokasi Waktu (<code className="text-primary">plan</code>)
                    </label>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '0.72rem' }}>
                      Rekomendasi: {recommendedTime} Menit
                    </span>
                  </div>
                  <select
                    id="timePlan"
                    className="form-select form-select-sm py-2"
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                  >
                    <option value="10">10 Menit — Microlearning Kilat</option>
                    <option value="15">15 Menit — Sesuai Rekomendasi Sistem</option>
                    <option value="20">20 Menit — Standar Pemahaman Modul</option>
                    <option value="30">30 Menit — Deep Focus & Catatan Lengkap</option>
                  </select>
                </div>

                {/* 3. STRATEGI BELAJAR (strategy / motivation) - Single-select Chips/Pills */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1.5">
                    <label className="form-label fw-bold mb-0 small">
                      3. Taktik Kognitif (<code className="text-primary">strategy</code>)
                    </label>
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                      Metacognitive Awareness
                    </span>
                  </div>
                  <div className="d-flex gap-2">
                    {strategyOptions.map((item) => {
                      const isActive = strategy === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`btn btn-sm flex-fill py-1.5 px-2 rounded-pill fw-semibold transition-all ${isActive
                              ? 'btn-primary shadow-sm'
                              : 'btn-outline-secondary bg-light text-dark border'
                            }`}
                          style={{ fontSize: '0.78rem' }}
                          onClick={() => setStrategy(item.id)}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. EFIKASI DIRI (self_efficacy) - Rating 1-5 dengan Emoji */}
                <div className="mb-2 p-2.5 bg-light rounded-3 border">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-bold mb-0 small text-dark">
                      4. Efikasi Diri (<code className="text-primary">self_efficacy</code>)
                    </label>
                    <span className="badge bg-warning-subtle text-dark border border-warning-subtle" style={{ fontSize: '0.72rem' }}>
                      Fitur Model ML Readiness
                    </span>
                  </div>
                  <div className="d-flex justify-content-between gap-1">
                    {efficacyLevels.map((item) => {
                      const isSelected = selfEfficacy === item.level;
                      return (
                        <button
                          key={item.level}
                          type="button"
                          className={`btn flex-fill text-center p-1 rounded-3 transition-all ${isSelected
                              ? 'btn-primary text-white shadow-sm'
                              : 'btn-outline-light text-secondary border bg-white'
                            }`}
                          onClick={() => setSelfEfficacy(item.level)}
                          title={`Tingkat ${item.level}: ${item.label}`}
                        >
                          <div style={{ fontSize: '1.25rem', lineHeight: '1.2' }}>{item.emoji}</div>
                          <div style={{ fontSize: '0.68rem', fontWeight: isSelected ? '700' : '500' }}>
                            {item.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer bg-light border-0 py-2.5 px-4 d-flex justify-content-between">
                <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                  ⚡ Estimasi isi: &lt; 15 detik
                </span>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm px-3"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm px-4 fw-bold shadow-sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1.5"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Target & Mulai Belajar'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SRLForethoughtModal;
