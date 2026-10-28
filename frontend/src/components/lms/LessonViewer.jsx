import React, { useState, useEffect } from 'react';

/**
 * LessonViewer (Fase Performance)
 * Props:
 * - lesson: object ({ id, title, content, ... })
 * - lessonNumber: number
 * - totalLessons: number
 * - onComplete: function(secondsSpent)
 */
export const LessonViewer = ({ lesson, lessonNumber, totalLessons, onComplete }) => {
  const [secondsSpent, setSecondsSpent] = useState(0);
  const [isSending, setIsSending] = useState(false);

  // Active Timer per lesson
  useEffect(() => {
    setSecondsSpent(0);
    const timer = setInterval(() => {
      setSecondsSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [lessonNumber, lesson?.id]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleNext = async () => {
    setIsSending(true);
    const logData = {
      lessonId: lesson?.id,
      lessonNumber,
      durationInSeconds: secondsSpent,
      completedAt: new Date().toISOString(),
    };

    try {
      await fetch('/api/srl/learning-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });
    } catch (error) {
      console.error('Gagal mencatat log aktivitas belajar:', error);
    } finally {
      setIsSending(false);
      if (typeof onComplete === 'function') {
        onComplete(secondsSpent);
      }
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
        <div>
          <span className="badge bg-primary fs-6 me-2">
            Materi {lessonNumber} dari {totalLessons}
          </span>
          <span className="text-muted fw-semibold">{lesson?.title || 'Judul Materi'}</span>
        </div>
        <div className="badge bg-light text-dark border px-3 py-2 fs-6">
          <i className="bi bi-clock me-1"></i> Waktu: {formatTime(secondsSpent)}
        </div>
      </div>
      <div className="card-body p-4">
        <h4 className="card-title mb-3">{lesson?.title}</h4>
        <div
          className="card-text text-secondary mb-4"
          style={{ minHeight: '180px', lineHeight: '1.7', whiteSpace: 'pre-line' }}
        >
          {lesson?.content || 'Konten materi belum tersedia.'}
        </div>
        <div className="d-flex justify-content-end">
          <button
            className="btn btn-success px-4 py-2"
            onClick={handleNext}
            disabled={isSending}
          >
            {isSending ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Menyimpan...
              </>
            ) : lessonNumber === totalLessons ? (
              'Selesaikan Semua Materi'
            ) : (
              'Selesaikan & Lanjut'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;
