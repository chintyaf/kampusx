import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Target, Lightbulb, BookOpen, Timer } from 'lucide-react';
import { Card, Badge, Spinner, Alert } from 'react-bootstrap';

import '@/pages/lms/lessonContent.css';

const LessonMaterial = ({ data = [], item, forethoughtData, onCompleteLesson }) => {
  const { lessonId } = useParams();

  const currentLesson =
    item || data.find((l) => String(l.id) === String(lessonId)) || data[0] || {};

  const [fetchedContent, setFetchedContent] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Tracker Durasi Aktif Belajar (Performance Phase)
  const [secondsSpent, setSecondsSpent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentLesson.id]);

  // Fetch Content URL
  useEffect(() => {
    if (currentLesson.contentUrl) {
      setLoading(true);
      fetch(currentLesson.contentUrl)
        .then((res) => res.text())
        .then((html) => {
          setFetchedContent(html);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Gagal memuat file HTML lesson:', err);
          setFetchedContent('<p class="text-danger">Gagal memuat materi lesson.</p>');
          setLoading(false);
        });
    } else {
      setFetchedContent('');
    }
  }, [currentLesson.contentUrl]);

  // Format detik ke format mm:ss
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <Card
      className="shadow-sm border-0 rounded-3 mb-4"
      style={{ backgroundColor: 'var(--card)' }}
    >
      <Card.Body className="p-4 p-md-5">
        {/* ------------------------------------------------------------- */}
        {/* A. WIDGET BANNER FORETHOUGHT REMINDER (SRL FORETHOUGHT)       */}
        {/* ------------------------------------------------------------- */}
        {forethoughtData?.goal && (
          <Card
            className="border-0 shadow-sm mb-4 overflow-hidden"
            style={{
              backgroundColor: 'var(--bahama-blue-50)',
              borderLeft: '4px solid var(--primary)',
            }}
          >
            <Card.Body className="p-3 d-flex align-items-start gap-3">
              <div className="p-2 rounded-circle bg-white shadow-sm text-primary flex-shrink-0 d-flex align-items-center justify-content-center">
                <Target size={18} />
              </div>
              <div className="w-100">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-1">
                  <span
                    className="fw-bold text-uppercase text-primary"
                    style={{ fontSize: 'var(--font-xs)', letterSpacing: '0.5px' }}
                  >
                    Target Belajar Sesi Ini (Forethought)
                  </span>
                  <Badge bg="primary" className="fw-medium px-2 py-1">
                    {forethoughtData.strategy || 'Fokus Membaca'}
                  </Badge>
                </div>
                <p
                  className="mb-0 text-dark fw-medium"
                  style={{ fontSize: 'var(--font-sm)' }}
                >
                  "{forethoughtData.goal}"
                </p>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* ------------------------------------------------------------- */}
        {/* B. HEADER METADATA & TIMER ACTIVE TRACKING                    */}
        {/* ------------------------------------------------------------- */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-3 border-bottom">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Badge
              bg="light"
              text="dark"
              className="border d-flex align-items-center gap-1 px-2 py-1 fw-normal"
              style={{ fontSize: 'var(--font-xs)' }}
            >
              <BookOpen size={13} className="text-primary" />
              <span>{currentLesson.moduleName || 'Modul Pembelajaran'}</span>
            </Badge>

            <span className="text-muted" style={{ fontSize: 'var(--font-xs)' }}>
              •
            </span>

            <span
              className="d-flex align-items-center gap-1 text-muted"
              style={{ fontSize: 'var(--font-xs)' }}
            >
              <Clock size={13} /> Est. {currentLesson.duration || '10 min'}
            </span>
          </div>

          {/* Menampilkan Timer Active Tracking */}
          <div
            className="d-flex align-items-center gap-1 text-primary fw-semibold"
            style={{ fontSize: 'var(--font-xs)' }}
          >
            <Timer size={14} />
            <span>Waktu Belajar: {formatTime(secondsSpent)}</span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* C. TITLE & SUMMARY                                            */}
        {/* ------------------------------------------------------------- */}
        <h1
          className="fw-bold mb-3"
          style={{
            fontSize: 'var(--font-xl)',
            color: 'var(--text)',
            lineHeight: '1.3',
          }}
        >
          {currentLesson.title || 'Materi Pelajaran'}
        </h1>

        {currentLesson.summary && (
          <Alert
            variant="light"
            className="mb-4 border-0 border-start border-4 border-primary bg-light p-3"
          >
            <p
              className="mb-0 text-muted"
              style={{ fontSize: 'var(--font-sm)', lineHeight: '1.65' }}
            >
              {currentLesson.summary}
            </p>
          </Alert>
        )}

        {/* ------------------------------------------------------------- */}
        {/* D. MAIN CONTENT                                               */}
        {/* ------------------------------------------------------------- */}
        {loading ? (
          <div className="py-5 text-center text-muted d-flex flex-column align-items-center gap-2">
            <Spinner animation="border" variant="primary" size="sm" />
            <span style={{ fontSize: 'var(--font-sm)' }}>Memuat konten lesson...</span>
          </div>
        ) : currentLesson.content || fetchedContent ? (
          <div
            className="lesson-content lesson-body-content mb-4"
            style={{
              fontSize: 'var(--font-sm)',
              lineHeight: '1.7',
              color: 'var(--text)',
            }}
            dangerouslySetInnerHTML={{
              __html: currentLesson.content || fetchedContent,
            }}
          />
        ) : null}

        {/* ------------------------------------------------------------- */}
        {/* E. KOTAK PERTANYAAN REFLEKSI RINGKAS                          */}
        {/* ------------------------------------------------------------- */}
        {currentLesson.reflectionQuestion && (
          <Alert variant="warning" className="p-3 my-4 border-0 shadow-sm">
            <div
              className="d-flex align-items-center gap-2 mb-2 fw-bold text-warning-emphasis"
              style={{ fontSize: 'var(--font-xs)' }}
            >
              <Lightbulb size={16} />
              <span>PERTANYAAN REFLEKSI MANDIRI</span>
            </div>
            <p className="mb-0 text-dark" style={{ fontSize: 'var(--font-sm)' }}>
              {currentLesson.reflectionQuestion}
            </p>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default LessonMaterial;