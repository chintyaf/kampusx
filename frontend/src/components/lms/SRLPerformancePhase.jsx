import React, { useState, useEffect } from 'react';

/**
 * SRLPerformancePhase (Fase Performance)
 * Props:
 *  - lesson: object ({ id, title, content, ... })
 *  - lessonNumber: number
 *  - totalLessons: number
 *  - onComplete: function(secondsSpent, extraData)
 *
 * This component records the active learning time, allows the learner to
 * toggle a *self‑control* “focus mode” (which hides optional UI distractions),
 * and captures a free‑form *self‑observation* note. When the learner clicks the
 * "Selesaikan & Lanjut" button the data is posted to the backend endpoint
 * `/api/srl/performance-activity`.
 */
export const SRLPerformancePhase = ({
  lesson,
  lessonNumber,
  totalLessons,
  onComplete,
}) => {
  // ---------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------
  const [secondsSpent, setSecondsSpent] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [observation, setObservation] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // ---------------------------------------------------------------------
  // Timer – starts/reset whenever the lesson changes
  // ---------------------------------------------------------------------
  useEffect(() => {
    setSecondsSpent(0);
    const timer = setInterval(() => {
      setSecondsSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [lessonNumber, lesson?.id]);

  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // ---------------------------------------------------------------------
  // Submit – logs activity + extra SRL data
  // ---------------------------------------------------------------------
  const handleFinish = async () => {
    setErrorMessage('');
    setIsSending(true);
    const payload = {
      lesson_id: lesson?.id,
      lesson_number: lessonNumber,
      duration_seconds: secondsSpent,
      focus_mode: focusMode,
      self_observation: observation,
      completed_at: new Date().toISOString(),
    };
    try {
      await fetch('/api/srl/performance-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Gagal mencatat log performance:', err);
      setErrorMessage('Gagal menyimpan data, coba lagi nanti.');
    } finally {
      setIsSending(false);
      if (typeof onComplete === 'function') {
        // Pass the elapsed seconds so the parent can aggregate total time.
        onComplete(secondsSpent, { focusMode, observation });
      }
    }
  };

  // ---------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------
  return (
    <div className="card shadow-sm border-0">
      {/* Header – lesson meta + timer */}
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
        <div>
          <span className="badge bg-primary fs-6 me-2">
            Materi {lessonNumber} dari {totalLessons}
          </span>
          <span className="text-muted fw-semibold">{lesson?.title || 'Judul Materi'}</span>
        </div>
        <div className="badge bg-light text-dark border px-3 py-2 fs-6">
          <i className="bi bi-clock me-1" /> Waktu: {formatTime(secondsSpent)}
        </div>
      </div>

      {/* Body – content + optional focus overlay */}
      <div className="card-body p-4">
        {/* Toggle Self‑Control (Focus Mode) */}
        <div className="d-flex justify-content-end mb-3">
          <button
            type="button"
            className={`btn btn-sm ${focusMode ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFocusMode((prev) => !prev)}
            disabled={isSending}
          >
            {focusMode ? 'Mode Fokus Aktif' : 'Aktifkan Mode Fokus'}
          </button>
        </div>

        {/* Lesson content – optionally dimmed when focusMode */}
        <div
          className="card-text text-secondary mb-4"
          style={{
            minHeight: '180px',
            lineHeight: '1.7',
            whiteSpace: 'pre-line',
            filter: focusMode ? 'blur(2px) saturate(0.5)' : 'none',
            transition: 'filter 0.3s ease',
          }}
        >
          {lesson?.content || 'Konten materi belum tersedia.'}
        </div>

        {/* Self‑Observation note */}
        <div className="mb-3">
          <label className="form-label fw-bold small">Catatan Refleksi (Self‑Observation)</label>
          <textarea
            className="form-control form-control-sm"
            rows={3}
            placeholder="Tuliskan apa yang Anda pahami, pertanyaan, atau strategi yang dipakai..."
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            disabled={isSending}
          />
        </div>

        {/* Action button */}
        <div className="d-flex justify-content-end">
          <button
            className="btn btn-success px-4 py-2"
            onClick={handleFinish}
            disabled={isSending}
          >
            {isSending ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Menyimpan…
              </>
            ) : lessonNumber === totalLessons ? (
              'Selesaikan Semua Materi'
            ) : (
              'Selesaikan & Lanjut'
            )}
          </button>
        </div>

        {/* Error alert */}
        {errorMessage && (
          <div className="alert alert-danger mt-3 py-2 px-3 small" role="alert">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default SRLPerformancePhase;
