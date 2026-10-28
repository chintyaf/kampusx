import React, { useState } from 'react';
import SRLForethoughtModal from './SRLForethoughtModal';
import SRLPerformancePhase from './SRLPerformancePhase';

// Re-export sub-komponen agar dapat diimpor langsung jika dibutuhkan
export { SRLForethoughtModal, SRLPerformancePhase };

/**
 * ModuleLearningContainer (Komponen Utama)
 * Mengelola transisi Self-Regulated Learning (SRL):
 * IDLE -> FORETHOUGHT -> PERFORMANCE -> COMPLETED
 */
export const ModuleLearningContainer = ({
  moduleTitle = 'Pemrograman Web Modern',
  lessons = [
    {
      id: 1,
      title: 'Pengenalan Komponen & Props',
      content:
        'Komponen merupakan blok pembangun antarmuka pengguna pada React. Dengan memecah UI menjadi komponen independen, kode menjadi lebih mudah dirawat, diuji, dan digunakan kembali.',
    },
    {
      id: 2,
      title: 'State Management dengan Hooks',
      content:
        'State digunakan untuk menyimpan data dinamis yang dapat memicu re-render tampilan saat nilainya berubah. Hook useState adalah fondasi utama untuk mengelola state lokal pada functional component.',
    },
    {
      id: 3,
      title: 'Siklus Hidup dengan useEffect',
      content:
        'useEffect menangani efek samping (side effects) seperti pemanggilan API (fetch data), sinkronisasi timer, maupun langganan event pada DOM secara efisien dan deklaratif.',
    },
  ],
  onNavigateToReflection,
}) => {
  // Enum State: 'IDLE' | 'FORETHOUGHT' | 'PERFORMANCE' | 'COMPLETED'
  const [phase, setPhase] = useState('IDLE');

  // Supporting States
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [secondsSpent, setSecondsSpent] = useState(0);

  // Trigger transisi ke FORETHOUGHT
  const handleStartModule = () => {
    setPhase('FORETHOUGHT');
  };

  const handleCloseForethought = () => {
    setPhase('IDLE');
  };

  // Transisi FORETHOUGHT -> PERFORMANCE
  const handleForethoughtComplete = () => {
    setStartTime(new Date());
    setCurrentLessonIndex(0);
    setSecondsSpent(0);
    setPhase('PERFORMANCE');
  };

  // Navigasi & pencatatan lesson pada fase PERFORMANCE
  const handleLessonComplete = (lessonDuration) => {
    setSecondsSpent((prev) => prev + lessonDuration);

    if (currentLessonIndex + 1 < lessons.length) {
      setCurrentLessonIndex((prev) => prev + 1);
    } else {
      // Materi terakhir -> ubah phase ke COMPLETED
      setPhase('COMPLETED');
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: '850px' }}>
      {/* 1. TAMPILAN IDLE */}
      {phase === 'IDLE' && (
        <div className="card text-center shadow-sm border-0 p-4">
          <div className="card-body">
            <h2 className="card-title fw-bold mb-3">{moduleTitle}</h2>
            <p className="card-text text-muted mb-4">
              Modul ini terdiri dari <strong>{lessons.length} materi</strong> interaktif.
              Siapkan rencana dan strategi belajar Anda sebelum masuk ke materi.
            </p>
            <button className="btn btn-primary btn-lg px-4" onClick={handleStartModule}>
              Mulai Belajar Modul
            </button>
          </div>
        </div>
      )}

      {/* 2. FASE FORETHOUGHT (Modal) */}
      <SRLForethoughtModal
        isOpen={phase === 'FORETHOUGHT'}
        onClose={handleCloseForethought}
        onComplete={handleForethoughtComplete}
        recommendedTime={15}
      />

      {/* 3. FASE PERFORMANCE (LessonViewer) */}
      {phase === 'PERFORMANCE' && lessons.length > 0 && (
        <SRLPerformancePhase
          lesson={lessons[currentLessonIndex]}
          lessonNumber={currentLessonIndex + 1}
          totalLessons={lessons.length}
          onComplete={handleLessonComplete}
        />
      )}

      {/* 4. FASE COMPLETED (Ringkasan Sukses & Tombol ke Refleksi) */}
      {phase === 'COMPLETED' && (
        <div className="alert alert-success shadow-sm border-0 p-4 rounded-3" role="alert">
          <div className="d-flex align-items-center mb-3">
            <h4 className="alert-heading fw-bold mb-0">🎉 Selamat! Seluruh Materi Telah Selesai</h4>
          </div>
          <p className="mb-2">
            Anda telah berhasil menyelesaikan fase <strong>Performance</strong> untuk modul{' '}
            <em>{moduleTitle}</em>.
          </p>
          <p className="text-muted small mb-4">
            Total waktu aktif belajar:{' '}
            <strong>
              {Math.floor(secondsSpent / 60)} menit {secondsSpent % 60} detik
            </strong>
            {startTime && (
              <span> &bull; Dimulai pukul {new Date(startTime).toLocaleTimeString()}</span>
            )}
          </p>
          <hr />
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mt-3">
            <span className="text-secondary small">
              Langkah berikutnya: Evaluasi strategi belajar Anda pada tahap Refleksi.
            </span>
            <button
              className="btn btn-success fw-semibold px-4 py-2"
              onClick={() => {
                if (typeof onNavigateToReflection === 'function') {
                  onNavigateToReflection({
                    totalSecondsSpent: secondsSpent,
                    startTime,
                  });
                } else {
                  alert('Menuju ke Fase Self-Reflection (Kuis Refleksi)');
                }
              }}
            >
              Menuju Kuis Refleksi &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleLearningContainer;
